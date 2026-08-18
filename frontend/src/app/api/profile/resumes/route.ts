import { del } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { createResumeDownloadUrl, normalizeResumeTags } from "@/lib/resume";
import { getAuthenticatedResumeOwner } from "@/lib/resume-server";

const updateSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(2).max(150).optional(),
  categoryTags: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  isDefault: z.literal(true).optional(),
});

const deleteSchema = z.object({ id: z.string().trim().min(1) });

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, message: "Please correct the resume details." },
      { status: 400 },
    );
  }

  if (
    error instanceof ResumeInUseError ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2014"))
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "This resume cannot be deleted because it is attached to an existing application.",
      },
      { status: 409 },
    );
  }

  console.error("PROFILE_RESUMES_API_ERROR:", error);
  return NextResponse.json(
    { success: false, message: fallback },
    { status: 500 },
  );
}

class ResumeInUseError extends Error {}

export async function GET() {
  try {
    const owner = await getAuthenticatedResumeOwner();
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const resumes = await prisma.resume.findMany({
      where: { profileId: owner.profileId },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        fileUrl: true,
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

    return NextResponse.json({
      success: true,
      count: resumes.length,
      resumes: resumes.map((resume) => ({
        ...resume,
        downloadUrl:
          resume.uploadStatus === "READY"
            ? createResumeDownloadUrl(resume.id)
            : resume.fileUrl,
      })),
    });
  } catch (error) {
    return errorResponse(error, "Failed to load resumes.");
  }
}

export async function PUT(request: Request) {
  try {
    const owner = await getAuthenticatedResumeOwner();
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const data = updateSchema.parse(await request.json());
    const existing = await prisma.resume.findFirst({
      where: { id: data.id, profileId: owner.profileId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Resume not found." },
        { status: 404 },
      );
    }

    const resume = await prisma.$transaction(
      async (transaction) => {
        if (data.isDefault) {
          await transaction.resume.updateMany({
            where: { profileId: owner.profileId, isDefault: true },
            data: { isDefault: false },
          });
        }

        return transaction.resume.update({
          where: { id: data.id },
          data: {
            ...(data.title !== undefined ? { title: data.title } : {}),
            ...(data.categoryTags !== undefined
              ? { categoryTags: normalizeResumeTags(data.categoryTags) }
              : {}),
            ...(data.isDefault ? { isDefault: true } : {}),
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
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return NextResponse.json({
      success: true,
      message: "Resume updated successfully.",
      resume: { ...resume, downloadUrl: createResumeDownloadUrl(resume.id) },
    });
  } catch (error) {
    return errorResponse(error, "Failed to update resume.");
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

    const data = deleteSchema.parse(await request.json());
    const existing = await prisma.resume.findFirst({
      where: { id: data.id, profileId: owner.profileId },
      select: { id: true, isDefault: true, storagePath: true },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Resume not found." },
        { status: 404 },
      );
    }

    await prisma.$transaction(
      async (transaction) => {
        const applicationCount = await transaction.application.count({
          where: { resumeId: existing.id },
        });
        if (applicationCount > 0) throw new ResumeInUseError();

        await transaction.resume.delete({ where: { id: existing.id } });

        if (existing.isDefault) {
          const next = await transaction.resume.findFirst({
            where: { profileId: owner.profileId },
            orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
            select: { id: true },
          });
          if (next) {
            await transaction.resume.update({
              where: { id: next.id },
              data: { isDefault: true },
            });
          }
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if (existing.storagePath) {
      await del(existing.storagePath).catch((cleanupError) => {
        console.error("RESUME_DELETE_BLOB_CLEANUP_ERROR:", cleanupError);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Resume deleted securely.",
    });
  } catch (error) {
    return errorResponse(error, "Failed to delete resume.");
  }
}
