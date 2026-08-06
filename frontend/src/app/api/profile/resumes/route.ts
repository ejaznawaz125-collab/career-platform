import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  z,
  ZodError,
} from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const optionalText = (
  maximumLength: number,
) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const normalizedValue =
        value.trim();

      return normalizedValue === ""
        ? null
        : normalizedValue;
    },
    z
      .string()
      .max(maximumLength)
      .nullable()
      .optional(),
  );

const optionalInteger = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }

    return typeof value === "string"
      ? Number(value)
      : value;
  },
  z
    .number()
    .int("Value must be a whole number.")
    .nonnegative(
      "Value cannot be negative.",
    )
    .nullable()
    .optional(),
);

const resumeCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      2,
      "Resume title is required.",
    )
    .max(
      150,
      "Resume title cannot exceed 150 characters.",
    ),

  fileUrl: z
    .string()
    .trim()
    .url(
      "Please enter a valid resume URL.",
    )
    .max(
      1000,
      "Resume URL cannot exceed 1000 characters.",
    ),

  originalName:
    optionalText(255),

  mimeType:
    optionalText(100),

  fileSize:
    optionalInteger,

  version: z.coerce
    .number()
    .int(
      "Version must be a whole number.",
    )
    .min(
      1,
      "Version must be at least 1.",
    )
    .default(1),

  isDefault:
    z.boolean().default(false),

  isPublic:
    z.boolean().default(false),

  atsScore: z.preprocess(
    (value) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return null;
      }

      return typeof value === "string"
        ? Number(value)
        : value;
    },
    z
      .number()
      .int(
        "ATS score must be a whole number.",
      )
      .min(
        0,
        "ATS score cannot be below 0.",
      )
      .max(
        100,
        "ATS score cannot exceed 100.",
      )
      .nullable()
      .optional(),
  ),
});

const resumeUpdateSchema = z.object({
  id: z
    .string()
    .trim()
    .min(
      1,
      "Resume ID is required.",
    ),

  title: z
    .string()
    .trim()
    .min(
      2,
      "Resume title is required.",
    )
    .max(
      150,
      "Resume title cannot exceed 150 characters.",
    )
    .optional(),

  fileUrl: z
    .string()
    .trim()
    .url(
      "Please enter a valid resume URL.",
    )
    .max(
      1000,
      "Resume URL cannot exceed 1000 characters.",
    )
    .optional(),

  originalName:
    optionalText(255),

  mimeType:
    optionalText(100),

  fileSize:
    optionalInteger,

  version: z.coerce
    .number()
    .int(
      "Version must be a whole number.",
    )
    .min(
      1,
      "Version must be at least 1.",
    )
    .optional(),

  isDefault:
    z.boolean().optional(),

  isPublic:
    z.boolean().optional(),

  atsScore: z.preprocess(
    (value) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return null;
      }

      return typeof value === "string"
        ? Number(value)
        : value;
    },
    z
      .number()
      .int(
        "ATS score must be a whole number.",
      )
      .min(
        0,
        "ATS score cannot be below 0.",
      )
      .max(
        100,
        "ATS score cannot exceed 100.",
      )
      .nullable()
      .optional(),
  ),
});

const resumeDeleteSchema = z.object({
  id: z
    .string()
    .trim()
    .min(
      1,
      "Resume ID is required.",
    ),
});

async function getAuthenticatedProfileId() {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email:
          session.user.email,
      },
      select: {
        candidateProfile: {
          select: {
            id: true,
          },
        },
      },
    });

  if (!user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        },
      ),
    };
  }

  if (!user.candidateProfile) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message:
            "Create your candidate profile before adding resumes.",
        },
        {
          status: 404,
        },
      ),
    };
  }

  return {
    profileId:
      user.candidateProfile.id,
  };
}

function handleError(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Please correct the invalid fields.",
        errors:
          error.flatten()
            .fieldErrors,
      },
      {
        status: 400,
      },
    );
  }

  console.error(
    "PROFILE_RESUMES_API_ERROR:",
    error,
  );

  return NextResponse.json(
    {
      success: false,
      message:
        fallbackMessage,
    },
    {
      status: 500,
    },
  );
}

export async function GET() {
  try {
    const authentication =
      await getAuthenticatedProfileId();

    if (authentication.error) {
      return authentication.error;
    }

    const resumes =
      await prisma.resume.findMany({
        where: {
          profileId:
            authentication.profileId,
        },
        orderBy: [
          {
            isDefault: "desc",
          },
          {
            updatedAt: "desc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to load resumes.",
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const authentication =
      await getAuthenticatedProfileId();

    if (authentication.error) {
      return authentication.error;
    }

    const body: unknown =
      await request.json();

    const data =
      resumeCreateSchema.parse(
        body,
      );

    const existingResume =
      await prisma.resume.findFirst({
        where: {
          profileId:
            authentication.profileId,

          fileUrl:
            data.fileUrl,
        },
        select: {
          id: true,
        },
      });

    if (existingResume) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This resume already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const resume =
      await prisma.$transaction(
        async (transaction) => {
          const resumeCount =
            await transaction.resume.count({
              where: {
                profileId:
                  authentication.profileId,
              },
            });

          const makeDefault =
            data.isDefault ||
            resumeCount === 0;

          if (makeDefault) {
            await transaction.resume.updateMany({
              where: {
                profileId:
                  authentication.profileId,

                isDefault: true,
              },
              data: {
                isDefault: false,
              },
            });
          }

          return transaction.resume.create({
            data: {
              profileId:
                authentication.profileId,

              title:
                data.title,

              fileUrl:
                data.fileUrl,

              originalName:
                data.originalName ??
                null,

              mimeType:
                data.mimeType ??
                null,

              fileSize:
                data.fileSize ??
                null,

              version:
                data.version,

              isDefault:
                makeDefault,

              isPublic:
                data.isPublic,

              atsScore:
                data.atsScore ??
                null,
            },
          });
        },
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Resume added successfully.",
        resume,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleError(
      error,
      "Failed to add resume.",
    );
  }
}

export async function PUT(
  request: NextRequest,
) {
  try {
    const authentication =
      await getAuthenticatedProfileId();

    if (authentication.error) {
      return authentication.error;
    }

    const body: unknown =
      await request.json();

    const data =
      resumeUpdateSchema.parse(
        body,
      );

    const existingResume =
      await prisma.resume.findFirst({
        where: {
          id:
            data.id,

          profileId:
            authentication.profileId,
        },
      });

    if (!existingResume) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Resume not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      data.fileUrl &&
      data.fileUrl !==
        existingResume.fileUrl
    ) {
      const duplicateResume =
        await prisma.resume.findFirst({
          where: {
            profileId:
              authentication.profileId,

            id: {
              not:
                data.id,
            },

            fileUrl:
              data.fileUrl,
          },
          select: {
            id: true,
          },
        });

      if (duplicateResume) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Another resume with this file URL already exists.",
          },
          {
            status: 409,
          },
        );
      }
    }

    const resume =
      await prisma.$transaction(
        async (transaction) => {
          if (data.isDefault === true) {
            await transaction.resume.updateMany({
              where: {
                profileId:
                  authentication.profileId,

                id: {
                  not:
                    data.id,
                },

                isDefault: true,
              },
              data: {
                isDefault: false,
              },
            });
          }

          return transaction.resume.update({
            where: {
              id:
                data.id,
            },
            data: {
              ...(data.title !== undefined
                ? {
                    title:
                      data.title,
                  }
                : {}),

              ...(data.fileUrl !== undefined
                ? {
                    fileUrl:
                      data.fileUrl,
                  }
                : {}),

              ...(data.originalName !==
              undefined
                ? {
                    originalName:
                      data.originalName,
                  }
                : {}),

              ...(data.mimeType !== undefined
                ? {
                    mimeType:
                      data.mimeType,
                  }
                : {}),

              ...(data.fileSize !== undefined
                ? {
                    fileSize:
                      data.fileSize,
                  }
                : {}),

              ...(data.version !== undefined
                ? {
                    version:
                      data.version,
                  }
                : {}),

              ...(data.isDefault !== undefined
                ? {
                    isDefault:
                      data.isDefault,
                  }
                : {}),

              ...(data.isPublic !== undefined
                ? {
                    isPublic:
                      data.isPublic,
                  }
                : {}),

              ...(data.atsScore !== undefined
                ? {
                    atsScore:
                      data.atsScore,
                  }
                : {}),
            },
          });
        },
      );

    return NextResponse.json({
      success: true,
      message:
        "Resume updated successfully.",
      resume,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to update resume.",
    );
  }
}

export async function DELETE(
  request: NextRequest,
) {
  try {
    const authentication =
      await getAuthenticatedProfileId();

    if (authentication.error) {
      return authentication.error;
    }

    const body: unknown =
      await request.json();

    const data =
      resumeDeleteSchema.parse(
        body,
      );

    const existingResume =
      await prisma.resume.findFirst({
        where: {
          id:
            data.id,

          profileId:
            authentication.profileId,
        },
      });

    if (!existingResume) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Resume not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.$transaction(
      async (transaction) => {
        await transaction.resume.delete({
          where: {
            id:
              existingResume.id,
          },
        });

        if (existingResume.isDefault) {
          const nextResume =
            await transaction.resume.findFirst({
              where: {
                profileId:
                  authentication.profileId,
              },
              orderBy: {
                createdAt: "desc",
              },
              select: {
                id: true,
              },
            });

          if (nextResume) {
            await transaction.resume.update({
              where: {
                id:
                  nextResume.id,
              },
              data: {
                isDefault: true,
              },
            });
          }
        }
      },
    );

    return NextResponse.json({
      success: true,
      message:
        "Resume deleted successfully.",
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to delete resume.",
    );
  }
}