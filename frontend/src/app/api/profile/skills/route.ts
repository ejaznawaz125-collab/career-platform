import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const skillCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Skill name is required.")
    .max(100, "Skill name cannot exceed 100 characters."),

  category: z
    .string()
    .trim()
    .max(100, "Category cannot exceed 100 characters.")
    .optional()
    .nullable(),

  level: z.coerce
    .number()
    .int("Skill level must be a whole number.")
    .min(1, "Skill level must be at least 1.")
    .max(5, "Skill level cannot exceed 5.")
    .default(1),

  years: z.preprocess(
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
      .min(0, "Years cannot be negative.")
      .max(99.9, "Years cannot exceed 99.9.")
      .nullable()
      .optional(),
  ),

  featured: z.boolean().optional().default(false),
});

const skillUpdateSchema = skillCreateSchema
  .partial()
  .extend({
    id: z.string().trim().min(1, "Skill ID is required."),
  });

const skillDeleteSchema = z.object({
  id: z.string().trim().min(1, "Skill ID is required."),
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

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
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
            "Create your candidate profile before adding skills.",
        },
        {
          status: 404,
        },
      ),
    };
  }

  return {
    profileId: user.candidateProfile.id,
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
        message: "Please correct the invalid fields.",
        errors: error.flatten().fieldErrors,
      },
      {
        status: 400,
      },
    );
  }

  console.error("PROFILE_SKILLS_API_ERROR:", error);

  return NextResponse.json(
    {
      success: false,
      message: fallbackMessage,
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

    const skills = await prisma.candidateSkill.findMany({
      where: {
        profileId: authentication.profileId,
      },
      orderBy: [
        {
          featured: "desc",
        },
        {
          name: "asc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to load skills.",
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

    const body: unknown = await request.json();
    const data = skillCreateSchema.parse(body);

    const existingSkill =
      await prisma.candidateSkill.findFirst({
        where: {
          profileId: authentication.profileId,
          name: {
            equals: data.name,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

    if (existingSkill) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This skill already exists in your profile.",
        },
        {
          status: 409,
        },
      );
    }

    const skill = await prisma.candidateSkill.create({
      data: {
        profileId: authentication.profileId,
        name: data.name,
        category: data.category || null,
        level: data.level,
        years: data.years ?? null,
        featured: data.featured,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Skill added successfully.",
        skill,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleError(
      error,
      "Failed to add skill.",
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

    const body: unknown = await request.json();
    const data = skillUpdateSchema.parse(body);

    const existingSkill =
      await prisma.candidateSkill.findFirst({
        where: {
          id: data.id,
          profileId: authentication.profileId,
        },
        select: {
          id: true,
        },
      });

    if (!existingSkill) {
      return NextResponse.json(
        {
          success: false,
          message: "Skill not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (data.name) {
      const duplicateSkill =
        await prisma.candidateSkill.findFirst({
          where: {
            profileId: authentication.profileId,
            id: {
              not: data.id,
            },
            name: {
              equals: data.name,
              mode: "insensitive",
            },
          },
          select: {
            id: true,
          },
        });

      if (duplicateSkill) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Another skill with this name already exists.",
          },
          {
            status: 409,
          },
        );
      }
    }

    const skill = await prisma.candidateSkill.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.name !== undefined
          ? { name: data.name }
          : {}),
        ...(data.category !== undefined
          ? { category: data.category || null }
          : {}),
        ...(data.level !== undefined
          ? { level: data.level }
          : {}),
        ...(data.years !== undefined
          ? { years: data.years }
          : {}),
        ...(data.featured !== undefined
          ? { featured: data.featured }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Skill updated successfully.",
      skill,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to update skill.",
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

    const body: unknown = await request.json();
    const data = skillDeleteSchema.parse(body);

    const skill = await prisma.candidateSkill.findFirst({
      where: {
        id: data.id,
        profileId: authentication.profileId,
      },
      select: {
        id: true,
      },
    });

    if (!skill) {
      return NextResponse.json(
        {
          success: false,
          message: "Skill not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.candidateSkill.delete({
      where: {
        id: skill.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Skill deleted successfully.",
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to delete skill.",
    );
  }
}