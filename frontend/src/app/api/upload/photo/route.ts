import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import sharp from "sharp";

import {
  createProfilePhotoReference,
} from "@/lib/profile-photo";
import {
  getAuthenticatedPhotoUser,
  removeProfilePhotoReference,
  replaceProfilePhotoReference,
} from "@/lib/profile-photo-server";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_UPLOAD_SIZE = 1024 * 1024;
const MAX_REQUEST_SIZE = 1100 * 1024;
const MIN_DIMENSION = 200;
const MAX_DIMENSION = 1200;

async function validateProcessedImage(
  file: File,
): Promise<Buffer> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const image = sharp(buffer, {
    failOn: "error",
    limitInputPixels: MAX_DIMENSION * MAX_DIMENSION,
  });
  const metadata = await image.metadata();
  const expectedFormat =
    file.type === "image/jpeg"
      ? "jpeg"
      : file.type === "image/png"
        ? "png"
        : "webp";

  if (
    metadata.format !== expectedFormat ||
    !metadata.width ||
    !metadata.height ||
    metadata.width !== metadata.height ||
    metadata.width < MIN_DIMENSION ||
    metadata.width > MAX_DIMENSION ||
    (metadata.pages ?? 1) !== 1
  ) {
    throw new Error("INVALID_PROCESSED_IMAGE");
  }

  const decoded = await image
    .clone()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (
    decoded.info.width !== metadata.width ||
    decoded.info.height !== metadata.height
  ) {
    throw new Error("INVALID_PROCESSED_IMAGE");
  }

  return buffer;
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
    console.error("PROFILE_PHOTO_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load profile photo.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let uploadedPathname: string | null = null;

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

    const contentLength = Number(
      request.headers.get("content-length") ?? 0,
    );

    if (contentLength > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "The optimized image must not exceed 1 MB.",
        },
        { status: 413 },
      );
    }

    const formData = await request.formData();
    const candidate = formData.get("photo");

    if (!(candidate instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Choose an image to upload.",
        },
        { status: 400 },
      );
    }

    if (candidate.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The uploaded image is empty.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(candidate.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG, and WEBP images are allowed.",
        },
        { status: 415 },
      );
    }

    if (candidate.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "The optimized image must not exceed 1 MB.",
        },
        { status: 413 },
      );
    }

    let imageBuffer: Buffer;

    try {
      imageBuffer = await validateProcessedImage(candidate);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "The optimized photo must be a valid square image between 200 and 1200 pixels.",
        },
        { status: 422 },
      );
    }

    const extension = candidate.type === "image/webp" ? "webp" : "jpg";
    uploadedPathname =
      `profile-photos/${user.id}/${crypto.randomUUID()}.${extension}`;

    await put(uploadedPathname, imageBuffer, {
      access: "private",
      addRandomSuffix: false,
      contentType: candidate.type,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });

    const image = createProfilePhotoReference(
      uploadedPathname,
    );

    const replaced = await replaceProfilePhotoReference({
      user,
      nextImage: image,
      newBlobPathname: uploadedPathname,
    });

    if (!replaced) {
      uploadedPathname = null;
      return NextResponse.json(
        {
          success: false,
          message:
            "Your profile photo changed during this upload. Please try again.",
        },
        { status: 409 },
      );
    }

    uploadedPathname = null;

    return NextResponse.json(
      {
        success: true,
        message: "Profile photo uploaded successfully.",
        image,
      },
      { status: 201 },
    );
  } catch (error) {
    if (uploadedPathname) {
      await del(uploadedPathname).catch((cleanupError) => {
        console.error(
          "PROFILE_PHOTO_ROLLBACK_CLEANUP_ERROR:",
          cleanupError,
        );
      });
    }

    console.error("PROFILE_PHOTO_UPLOAD_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload profile photo.",
      },
      { status: 500 },
    );
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
    console.error("PROFILE_PHOTO_DELETE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove profile photo.",
      },
      { status: 500 },
    );
  }
}
