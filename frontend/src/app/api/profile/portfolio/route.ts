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

const optionalUrl = z.preprocess(
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
    .url("Please enter a valid URL.")
    .max(
      500,
      "URL cannot exceed 500 characters.",
    )
    .nullable()
    .optional(),
);

const optionalDate = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }

    if (
      typeof value === "string" ||
      value instanceof Date
    ) {
      return new Date(value);
    }

    return value;
  },
  z
    .date({
      message:
        "Please enter a valid date.",
    })
    .nullable()
    .optional(),
);

const technologiesSchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) {
      return value
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  },
  z
    .array(
      z
        .string()
        .min(
          1,
          "Technology name cannot be empty.",
        )
        .max(
          100,
          "Technology name cannot exceed 100 characters.",
        ),
    )
    .max(
      30,
      "You can add up to 30 technologies.",
    )
    .default([]),
);

const portfolioCreateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(
        2,
        "Project title is required.",
      )
      .max(
        200,
        "Project title cannot exceed 200 characters.",
      ),

    description:
      optionalText(5000),

    projectUrl:
      optionalUrl,

    githubUrl:
      optionalUrl,

    imageUrl:
      optionalUrl,

    technologies:
      technologiesSchema,

    startDate:
      optionalDate,

    endDate:
      optionalDate,

    featured:
      z.boolean().default(false),
  })
  .superRefine(
    (data, context) => {
      if (
        data.startDate &&
        data.endDate &&
        data.endDate <
          data.startDate
      ) {
        context.addIssue({
          code:
            z.ZodIssueCode.custom,
          path: ["endDate"],
          message:
            "End date cannot be before start date.",
        });
      }
    },
  );

const portfolioUpdateSchema =
  z.object({
    id: z
      .string()
      .trim()
      .min(
        1,
        "Project ID is required.",
      ),

    title: z
      .string()
      .trim()
      .min(
        2,
        "Project title is required.",
      )
      .max(
        200,
        "Project title cannot exceed 200 characters.",
      )
      .optional(),

    description:
      optionalText(5000),

    projectUrl:
      optionalUrl,

    githubUrl:
      optionalUrl,

    imageUrl:
      optionalUrl,

    technologies:
      technologiesSchema.optional(),

    startDate:
      optionalDate,

    endDate:
      optionalDate,

    featured:
      z.boolean().optional(),
  });

const portfolioDeleteSchema =
  z.object({
    id: z
      .string()
      .trim()
      .min(
        1,
        "Project ID is required.",
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
          message:
            "User not found.",
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
            "Create your candidate profile before adding portfolio projects.",
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
  if (
    error instanceof ZodError
  ) {
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
    "PROFILE_PORTFOLIO_API_ERROR:",
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

    if (
      authentication.error
    ) {
      return authentication.error;
    }

    const projects =
      await prisma.portfolioProject.findMany({
        where: {
          profileId:
            authentication.profileId,
        },
        orderBy: [
          {
            featured: "desc",
          },
          {
            startDate: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      count:
        projects.length,
      projects,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to load portfolio projects.",
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const authentication =
      await getAuthenticatedProfileId();

    if (
      authentication.error
    ) {
      return authentication.error;
    }

    const body: unknown =
      await request.json();

    const data =
      portfolioCreateSchema.parse(
        body,
      );

    const duplicateProject =
      await prisma.portfolioProject.findFirst({
        where: {
          profileId:
            authentication.profileId,

          title: {
            equals:
              data.title,
            mode:
              "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

    if (
      duplicateProject
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A portfolio project with this title already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const project =
      await prisma.portfolioProject.create({
        data: {
          profileId:
            authentication.profileId,

          title:
            data.title,

          description:
            data.description ??
            null,

          projectUrl:
            data.projectUrl ??
            null,

          githubUrl:
            data.githubUrl ??
            null,

          imageUrl:
            data.imageUrl ??
            null,

          technologies:
            data.technologies,

          startDate:
            data.startDate ??
            null,

          endDate:
            data.endDate ??
            null,

          featured:
            data.featured,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Portfolio project added successfully.",
        project,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleError(
      error,
      "Failed to add portfolio project.",
    );
  }
}

export async function PUT(
  request: NextRequest,
) {
  try {
    const authentication =
      await getAuthenticatedProfileId();

    if (
      authentication.error
    ) {
      return authentication.error;
    }

    const body: unknown =
      await request.json();

    const data =
      portfolioUpdateSchema.parse(
        body,
      );

    const existingProject =
      await prisma.portfolioProject.findFirst({
        where: {
          id:
            data.id,

          profileId:
            authentication.profileId,
        },
      });

    if (
      !existingProject
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Portfolio project not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (data.title) {
      const duplicateProject =
        await prisma.portfolioProject.findFirst({
          where: {
            profileId:
              authentication.profileId,

            id: {
              not:
                data.id,
            },

            title: {
              equals:
                data.title,
              mode:
                "insensitive",
            },
          },
          select: {
            id: true,
          },
        });

      if (
        duplicateProject
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Another portfolio project with this title already exists.",
          },
          {
            status: 409,
          },
        );
      }
    }

    const startDate =
      data.startDate !==
      undefined
        ? data.startDate
        : existingProject.startDate;

    const endDate =
      data.endDate !==
      undefined
        ? data.endDate
        : existingProject.endDate;

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "End date cannot be before start date.",
        },
        {
          status: 400,
        },
      );
    }

    const project =
      await prisma.portfolioProject.update({
        where: {
          id:
            data.id,
        },
        data: {
          ...(data.title !==
          undefined
            ? {
                title:
                  data.title,
              }
            : {}),

          ...(data.description !==
          undefined
            ? {
                description:
                  data.description,
              }
            : {}),

          ...(data.projectUrl !==
          undefined
            ? {
                projectUrl:
                  data.projectUrl,
              }
            : {}),

          ...(data.githubUrl !==
          undefined
            ? {
                githubUrl:
                  data.githubUrl,
              }
            : {}),

          ...(data.imageUrl !==
          undefined
            ? {
                imageUrl:
                  data.imageUrl,
              }
            : {}),

          ...(data.technologies !==
          undefined
            ? {
                technologies:
                  data.technologies,
              }
            : {}),

          ...(data.startDate !==
          undefined
            ? {
                startDate:
                  data.startDate,
              }
            : {}),

          ...(data.endDate !==
          undefined
            ? {
                endDate:
                  data.endDate,
              }
            : {}),

          ...(data.featured !==
          undefined
            ? {
                featured:
                  data.featured,
              }
            : {}),
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Portfolio project updated successfully.",
      project,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to update portfolio project.",
    );
  }
}

export async function DELETE(
  request: NextRequest,
) {
  try {
    const authentication =
      await getAuthenticatedProfileId();

    if (
      authentication.error
    ) {
      return authentication.error;
    }

    const body: unknown =
      await request.json();

    const data =
      portfolioDeleteSchema.parse(
        body,
      );

    const project =
      await prisma.portfolioProject.findFirst({
        where: {
          id:
            data.id,

          profileId:
            authentication.profileId,
        },
        select: {
          id: true,
        },
      });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Portfolio project not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.portfolioProject.delete({
      where: {
        id:
          project.id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Portfolio project deleted successfully.",
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to delete portfolio project.",
    );
  }
}