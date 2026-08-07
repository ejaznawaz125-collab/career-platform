import { del, get } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import {
  createResumeDownloadUrl,
  isOwnedResumePath,
  normalizeResumeTags,
  RESUME_MAX_FILE_SIZE,
} from "@/lib/resume";
import {
  getAuthenticatedResumeOwner,
} from "@/lib/resume-server";
import { validateManagedResume } from "@/lib/resume-file-validation";

const finalizeSchema = z.object({
  pathname: z.string().trim().min(1).max(500),
  title: z.string().trim().min(2).max(150),
  originalName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(150),
  fileSize: z.number().int().positive().max(RESUME_MAX_FILE_SIZE),
  categoryTags: z.array(z.string().trim().min(1).max(40)).max(12),
  isDefault: z.boolean().default(false),
  versionGroupId: z.string().trim().min(1).max(100).nullable().optional(),
});

async function deleteIfUnreferenced(pathname: string) {
  const referenced = await prisma.resume.findUnique({
    where: { storagePath: pathname },
    select: { id: true },
  });

  if (!referenced) {
    await del(pathname);
    await prisma.resumeUploadIntent.deleteMany({ where: { pathname } });
  }
}

export async function POST(request: Request) {
  let pathname: string | null = null;
  let persisted = false;

  try {
    const owner = await getAuthenticatedResumeOwner();
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const data = finalizeSchema.parse(await request.json());
    pathname = data.pathname;

    if (!isOwnedResumePath(pathname, owner.userId)) {
      pathname = null;
      return NextResponse.json(
        { success: false, message: "Invalid resume upload reference." },
        { status: 400 },
      );
    }

    const existingPath = await prisma.resume.findUnique({
      where: { storagePath: pathname },
      select: { id: true },
    });
    if (existingPath) {
      return NextResponse.json(
        { success: false, message: "This upload has already been finalized." },
        { status: 409 },
      );
    }

    const intent = await prisma.resumeUploadIntent.findFirst({
      where: {
        pathname,
        userId: owner.userId,
        profileId: owner.profileId,
      },
    });
    if (
      !intent ||
      intent.expiresAt < new Date() ||
      intent.originalName !== data.originalName ||
      intent.mimeType !== data.mimeType ||
      intent.fileSize !== data.fileSize
    ) {
      throw new Error("INVALID_UPLOAD_INTENT");
    }

    const result = await get(pathname, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) {
      return NextResponse.json(
        { success: false, message: "Uploaded resume was not found." },
        { status: 404 },
      );
    }

    if (
      result.blob.size !== data.fileSize ||
      result.blob.size > RESUME_MAX_FILE_SIZE ||
      result.blob.contentType !== data.mimeType
    ) {
      throw new Error("RESUME_METADATA_MISMATCH");
    }

    const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
    const { contentHash } = await validateManagedResume({
      buffer,
      pathname,
      userId: owner.userId,
      originalName: data.originalName,
      mimeType: data.mimeType,
    });

    const duplicate = await prisma.resume.findFirst({
      where: { profileId: owner.profileId, contentHash },
      select: { id: true, title: true },
    });
    if (duplicate) {
      await deleteIfUnreferenced(pathname);
      pathname = null;
      return NextResponse.json(
        {
          success: false,
          message: `This file already exists as “${duplicate.title}”.`,
          duplicateResumeId: duplicate.id,
        },
        { status: 409 },
      );
    }

    const categoryTags = normalizeResumeTags(data.categoryTags);
    const resumeId = crypto.randomUUID();
    const versionGroupId = data.versionGroupId ?? crypto.randomUUID();

    const resume = await prisma.$transaction(
      async (transaction) => {
        const latestVersion = data.versionGroupId
          ? await transaction.resume.findFirst({
              where: {
                profileId: owner.profileId,
                versionGroupId: data.versionGroupId,
              },
              orderBy: { version: "desc" },
              select: { version: true, isDefault: true },
            })
          : null;

        const versionGroupIsDefault = data.versionGroupId
          ? Boolean(
              await transaction.resume.findFirst({
                where: {
                  profileId: owner.profileId,
                  versionGroupId: data.versionGroupId,
                  isDefault: true,
                },
                select: { id: true },
              }),
            )
          : false;

        if (data.versionGroupId && !latestVersion) {
          throw new Error("VERSION_GROUP_NOT_FOUND");
        }

        const resumeCount = await transaction.resume.count({
          where: { profileId: owner.profileId },
        });
        const makeDefault =
          data.isDefault || resumeCount === 0 || versionGroupIsDefault;

        if (makeDefault) {
          await transaction.resume.updateMany({
            where: { profileId: owner.profileId, isDefault: true },
            data: { isDefault: false },
          });
        }

        const createdResume = await transaction.resume.create({
          data: {
            id: resumeId,
            profileId: owner.profileId,
            title: data.title,
            fileUrl: createResumeDownloadUrl(resumeId),
            storagePath: pathname,
            contentHash,
            originalName: data.originalName,
            mimeType: data.mimeType,
            fileSize: buffer.length,
            version: (latestVersion?.version ?? 0) + 1,
            versionGroupId,
            categoryTags,
            uploadStatus: "READY",
            isDefault: makeDefault,
            isPublic: false,
          },
          select: {
            id: true,
            title: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            version: true,
            versionGroupId: true,
            categoryTags: true,
            uploadStatus: true,
            isDefault: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        await transaction.resumeUploadIntent.delete({
          where: { pathname: data.pathname },
        });
        return createdResume;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    persisted = true;
    pathname = null;

    return NextResponse.json(
      {
        success: true,
        message: "Resume uploaded securely.",
        resume: { ...resume, downloadUrl: createResumeDownloadUrl(resume.id) },
      },
      { status: 201 },
    );
  } catch (error) {
    if (pathname && !persisted) {
      await deleteIfUnreferenced(pathname).catch((cleanupError) => {
        console.error("RESUME_UPLOAD_ROLLBACK_ERROR:", cleanupError);
      });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Please correct the resume details." },
        { status: 400 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "This resume or version already exists." },
        { status: 409 },
      );
    }

    if (error instanceof Error && error.message === "VERSION_GROUP_NOT_FOUND") {
      return NextResponse.json(
        { success: false, message: "The selected resume version group was not found." },
        { status: 404 },
      );
    }

    console.error("RESUME_UPLOAD_FINALIZE_ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "The resume is invalid, unsafe, or could not be saved.",
      },
      { status: 422 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const owner = await getAuthenticatedResumeOwner();
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const data = z
      .object({ pathname: z.string().trim().min(1).max(500) })
      .parse(await request.json());
    if (!isOwnedResumePath(data.pathname, owner.userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid resume upload reference." },
        { status: 400 },
      );
    }

    const intent = await prisma.resumeUploadIntent.findFirst({
      where: {
        pathname: data.pathname,
        userId: owner.userId,
        profileId: owner.profileId,
      },
      select: { id: true },
    });
    if (intent) await deleteIfUnreferenced(data.pathname);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid cleanup request." },
        { status: 400 },
      );
    }

    console.error("RESUME_UPLOAD_CLEANUP_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clean up resume upload." },
      { status: 500 },
    );
  }
}
