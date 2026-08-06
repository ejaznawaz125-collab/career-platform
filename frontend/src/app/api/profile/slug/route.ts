import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const slugSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Slug must contain at least 3 characters.")
    .max(60, "Slug cannot exceed 60 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens only.",
    ),
});

function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Please enter a valid profile slug.",
        errors: error.flatten().fieldErrors,
      },
      {
        status: 400,
      },
    );
  }

  console.error("PROFILE_SLUG_API_ERROR:", error);

  return NextResponse.json(
    {
      success: false,
      message: "Failed to update public profile link.",
    },
    {
      status: 500,
    },
  );
}

async function getAuthenticatedProfile() {
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
          slug: true,
          isPublic: true,
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
          message: "Candidate profile not found.",
        },
        {
          status: 404,
        },
      ),
    };
  }

  return {
    profile: user.candidateProfile,
  };
}

export async function GET() {
  try {
    const authentication =
      await getAuthenticatedProfile();

    if (authentication.error) {
      return authentication.error;
    }

    return NextResponse.json({
      success: true,
      slug: authentication.profile.slug,
      isPublic: authentication.profile.isPublic,
      publicUrl: authentication.profile.slug
        ? `/candidates/${authentication.profile.slug}`
        : null,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authentication =
      await getAuthenticatedProfile();

    if (authentication.error) {
      return authentication.error;
    }

    const body: unknown = await request.json();
    const data = slugSchema.parse(body);

    const existingProfile =
      await prisma.candidateProfile.findFirst({
        where: {
          slug: {
            equals: data.slug,
            mode: "insensitive",
          },
          id: {
            not: authentication.profile.id,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This public profile link is already in use.",
        },
        {
          status: 409,
        },
      );
    }

    const profile =
      await prisma.candidateProfile.update({
        where: {
          id: authentication.profile.id,
        },
        data: {
          slug: data.slug,
        },
        select: {
          id: true,
          slug: true,
          isPublic: true,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Public profile link updated successfully.",
      slug: profile.slug,
      isPublic: profile.isPublic,
      publicUrl: `/candidates/${profile.slug}`,
    });
  } catch (error) {
    return handleError(error);
  }
}