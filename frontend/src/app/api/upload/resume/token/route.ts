import { del } from "@vercel/blob";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import {
  expectedResumeMimeType,
  getResumeExtension,
  RESUME_MAX_FILE_SIZE,
} from "@/lib/resume";
import { getAuthenticatedResumeOwner } from "@/lib/resume-server";

const tokenSchema = z.object({
  originalName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().max(150),
  fileSize: z.number().int().positive().max(RESUME_MAX_FILE_SIZE),
});

export async function POST(request: Request) {
  try {
    const owner = await getAuthenticatedResumeOwner();
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const data = tokenSchema.parse(await request.json());
    const extension = getResumeExtension(data.originalName);
    if (!extension || data.mimeType !== expectedResumeMimeType(extension)) {
      return NextResponse.json(
        { success: false, message: "Only PDF and DOCX resume files are allowed." },
        { status: 415 },
      );
    }

    const now = new Date();
    const expired = await prisma.resumeUploadIntent.findMany({
      where: { userId: owner.userId, expiresAt: { lt: now } },
      select: { id: true, pathname: true },
    });
    const cleanedIntentIds: string[] = [];
    for (const intent of expired) {
      try {
        await del(intent.pathname);
        cleanedIntentIds.push(intent.id);
      } catch (cleanupError) {
        console.error("EXPIRED_RESUME_UPLOAD_CLEANUP_ERROR:", cleanupError);
      }
    }
    if (cleanedIntentIds.length) {
      await prisma.resumeUploadIntent.deleteMany({
        where: { id: { in: cleanedIntentIds } },
      });
    }

    const activeCount = await prisma.resumeUploadIntent.count({
      where: { userId: owner.userId, expiresAt: { gte: now } },
    });
    if (activeCount >= 3) {
      return NextResponse.json(
        { success: false, message: "Too many resume uploads are already pending." },
        { status: 429 },
      );
    }

    const pathname =
      `resumes/${owner.userId}/${crypto.randomUUID()}.${extension}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.resumeUploadIntent.create({
      data: {
        userId: owner.userId,
        profileId: owner.profileId,
        pathname,
        originalName: data.originalName,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        expiresAt,
      },
    });

    try {
      const token = await generateClientTokenFromReadWriteToken({
        pathname,
        allowedContentTypes: [expectedResumeMimeType(extension)],
        maximumSizeInBytes: RESUME_MAX_FILE_SIZE,
        validUntil: expiresAt.getTime(),
        addRandomSuffix: false,
        // The pathname is a server-generated UUID bound to this user's upload
        // intent. Allowing an idempotent retry prevents a completed client
        // transfer from becoming permanently stuck before finalization.
        allowOverwrite: true,
        cacheControlMaxAge: 60,
      });
      return NextResponse.json({ success: true, pathname, token });
    } catch (error) {
      await prisma.resumeUploadIntent.delete({ where: { pathname } });
      throw error;
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Choose a valid resume up to 10 MB." },
        { status: 400 },
      );
    }

    console.error("RESUME_UPLOAD_TOKEN_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to prepare resume upload." },
      { status: 500 },
    );
  }
}
