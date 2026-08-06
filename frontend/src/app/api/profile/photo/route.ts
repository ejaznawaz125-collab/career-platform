import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const photoSchema = z.object({
  image: z
    .string()
    .trim()
    .url("Please enter a valid image URL.")
    .max(
      1000,
      "Image URL cannot exceed 1000 characters.",
    ),
});

async function getAuthenticatedUserId() {
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
      id: true,
      image: true,
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

  return {
    user,
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
        message: "Please enter a valid image URL.",
        errors: error.flatten().fieldErrors,
      },
      {
        status: 400,
      },
    );
  }

  console.error("PROFILE_PHOTO_API_ERROR:", error);

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
      await getAuthenticatedUserId();

    if (authentication.error) {
      return authentication.error;
    }

    return NextResponse.json({
      success: true,
      image: authentication.user.image,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to load profile photo.",
    );
  }
}

export async function PUT(
  request: NextRequest,
) {
  try {
    const authentication =
      await getAuthenticatedUserId();

    if (authentication.error) {
      return authentication.error;
    }

    const body: unknown = await request.json();
    const data = photoSchema.parse(body);

    const user = await prisma.user.update({
      where: {
        id: authentication.user.id,
      },
      data: {
        image: data.image,
      },
      select: {
        id: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile photo updated successfully.",
      image: user.image,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to update profile photo.",
    );
  }
}

export async function DELETE() {
  try {
    const authentication =
      await getAuthenticatedUserId();

    if (authentication.error) {
      return authentication.error;
    }

    await prisma.user.update({
      where: {
        id: authentication.user.id,
      },
      data: {
        image: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile photo removed successfully.",
      image: null,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to remove profile photo.",
    );
  }
}