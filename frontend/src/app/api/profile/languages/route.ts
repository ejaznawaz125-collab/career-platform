import {
  CandidateLanguageLevel,
} from "@prisma/client";
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

const languageCreateSchema = z.object({
  language: z
    .string()
    .trim()
    .min(
      2,
      "Language name is required.",
    )
    .max(
      100,
      "Language name cannot exceed 100 characters.",
    ),

  proficiency: z.nativeEnum(
    CandidateLanguageLevel,
  ),

  isNative: z
    .boolean()
    .default(false),
});

const languageUpdateSchema = z.object({
  id: z
    .string()
    .trim()
    .min(
      1,
      "Language ID is required.",
    ),

  language: z
    .string()
    .trim()
    .min(
      2,
      "Language name is required.",
    )
    .max(
      100,
      "Language name cannot exceed 100 characters.",
    )
    .optional(),

  proficiency: z
    .nativeEnum(
      CandidateLanguageLevel,
    )
    .optional(),

  isNative: z
    .boolean()
    .optional(),
});

const languageDeleteSchema = z.object({
  id: z
    .string()
    .trim()
    .min(
      1,
      "Language ID is required.",
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
            "Create your candidate profile before adding languages.",
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
    "PROFILE_LANGUAGES_API_ERROR:",
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

    const languages =
      await prisma.candidateLanguage.findMany({
        where: {
          profileId:
            authentication.profileId,
        },
        orderBy: [
          {
            isNative: "desc",
          },
          {
            language: "asc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      count:
        languages.length,
      languages,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to load languages.",
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
      languageCreateSchema.parse(
        body,
      );

    const existingLanguage =
      await prisma.candidateLanguage.findFirst({
        where: {
          profileId:
            authentication.profileId,

          language: {
            equals:
              data.language,
            mode:
              "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

    if (existingLanguage) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This language already exists in your profile.",
        },
        {
          status: 409,
        },
      );
    }

    const language =
      await prisma.candidateLanguage.create({
        data: {
          profileId:
            authentication.profileId,

          language:
            data.language,

          proficiency:
            data.proficiency,

          isNative:
            data.isNative,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Language added successfully.",
        language,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleError(
      error,
      "Failed to add language.",
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
      languageUpdateSchema.parse(
        body,
      );

    const existingLanguage =
      await prisma.candidateLanguage.findFirst({
        where: {
          id: data.id,

          profileId:
            authentication.profileId,
        },
        select: {
          id: true,
        },
      });

    if (!existingLanguage) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Language record not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (data.language) {
      const duplicateLanguage =
        await prisma.candidateLanguage.findFirst({
          where: {
            profileId:
              authentication.profileId,

            id: {
              not:
                data.id,
            },

            language: {
              equals:
                data.language,
              mode:
                "insensitive",
            },
          },
          select: {
            id: true,
          },
        });

      if (duplicateLanguage) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Another language with this name already exists.",
          },
          {
            status: 409,
          },
        );
      }
    }

    const language =
      await prisma.candidateLanguage.update({
        where: {
          id: data.id,
        },
        data: {
          ...(data.language !== undefined
            ? {
                language:
                  data.language,
              }
            : {}),

          ...(data.proficiency !== undefined
            ? {
                proficiency:
                  data.proficiency,
              }
            : {}),

          ...(data.isNative !== undefined
            ? {
                isNative:
                  data.isNative,
              }
            : {}),
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Language updated successfully.",
      language,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to update language.",
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
      languageDeleteSchema.parse(
        body,
      );

    const language =
      await prisma.candidateLanguage.findFirst({
        where: {
          id: data.id,

          profileId:
            authentication.profileId,
        },
        select: {
          id: true,
        },
      });

    if (!language) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Language record not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.candidateLanguage.delete({
      where: {
        id:
          language.id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Language deleted successfully.",
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to delete language.",
    );
  }
}