import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createProfilePhotoReference,
  isOwnedProfilePhotoPathname,
  isProfilePhotoPathname,
} from "@/lib/profile-photo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname");

  if (!pathname || !isProfilePhotoPathname(pathname)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid profile photo reference.",
      },
      { status: 400 },
    );
  }

  try {
    const reference = createProfilePhotoReference(pathname);
    const session = await auth();
    const isOwner = Boolean(
      session?.user?.id &&
        isOwnedProfilePhotoPathname(
          pathname,
          session.user.id,
        ) &&
        (await prisma.user.findFirst({
          where: {
            id: session.user.id,
            image: reference,
          },
          select: {
            id: true,
          },
        })),
    );

    const isPublicCandidate = isOwner
      ? false
      : Boolean(
          await prisma.user.findFirst({
            where: {
              image: reference,
              status: "ACTIVE",
              candidateProfile: {
                is: {
                  isPublic: true,
                },
              },
            },
            select: {
              id: true,
            },
          }),
        );

    if (!isOwner && !isPublicCandidate) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile photo not found.",
        },
        { status: 404 },
      );
    }

    const result = await get(pathname, {
      access: "private",
      useCache: false,
    });

    if (!result || result.statusCode !== 200) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile photo not found.",
        },
        { status: 404 },
      );
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Content-Length": String(result.blob.size),
        "Content-Type": result.blob.contentType,
        ETag: result.blob.etag,
        Pragma: "no-cache",
        "Vercel-CDN-Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("PROFILE_PHOTO_DELIVERY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Profile photo could not be loaded.",
      },
      { status: 500 },
    );
  }
}
