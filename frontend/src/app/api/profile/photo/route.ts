import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

import {
  getAuthenticatedPhotoUser,
  removeProfilePhotoReference,
  replaceProfilePhotoReference,
} from "@/lib/profile-photo-server";

const photoSchema = z.object({
  image: z
    .string()
    .trim()
    .url("Please enter a valid image URL.")
    .max(1000, "Image URL cannot exceed 1000 characters."),
});

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
      { status: 400 },
    );
  }

  console.error("PROFILE_PHOTO_API_ERROR:", error);

  return NextResponse.json(
    {
      success: false,
      message: fallbackMessage,
    },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const user = await getAuthenticatedPhotoUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      image: user.image,
    });
  } catch (error) {
    return handleError(error, "Failed to load profile photo.");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedPhotoUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();
    const data = photoSchema.parse(body);
    const replaced = await replaceProfilePhotoReference({
      user,
      nextImage: data.image,
    });

    if (!replaced) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your profile photo changed during this update. Please try again.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile photo updated successfully.",
      image: data.image,
    });
  } catch (error) {
    return handleError(error, "Failed to update profile photo.");
  }
}

export async function DELETE() {
  try {
    const user = await getAuthenticatedPhotoUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const removed = await removeProfilePhotoReference(user);

    if (!removed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your profile photo changed during removal. Please try again.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile photo removed successfully.",
      image: null,
    });
  } catch (error) {
    return handleError(error, "Failed to remove profile photo.");
  }
}
