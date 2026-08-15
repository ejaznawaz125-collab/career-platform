import { get } from "@vercel/blob";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ applicationId: string }>;
};

function safeDownloadName(filename: string | null) {
  const fallback = "resume";
  const normalized = (filename ?? fallback).replace(/[\r\n"\\/]/g, "_").trim();
  const preferred = normalized || fallback;
  const ascii = preferred.replace(/[^\x20-\x7E]/g, "_") || fallback;
  const encoded = encodeURIComponent(preferred).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return { ascii, encoded };
}

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    if (session.user.role !== UserRole.EMPLOYER) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const { applicationId } = await params;
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        resumeId: { not: null },
        job: { company: { ownerId: session.user.id } },
      },
      select: { resumeId: true, userId: true },
    });

    if (!application?.resumeId) {
      return NextResponse.json({ success: false, message: "Application resume not found." }, { status: 404 });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: application.resumeId,
        profile: { userId: application.userId },
        uploadStatus: "READY",
        storagePath: { not: null },
      },
      select: { storagePath: true, originalName: true, mimeType: true },
    });

    if (!resume?.storagePath) {
      return NextResponse.json({ success: false, message: "Application resume not found." }, { status: 404 });
    }

    const result = await get(resume.storagePath, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) {
      return NextResponse.json({ success: false, message: "Resume file not found." }, { status: 404 });
    }

    const filename = safeDownloadName(resume.originalName);
    return new Response(result.stream, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `attachment; filename="${filename.ascii}"; filename*=UTF-8''${filename.encoded}`,
        "Content-Length": String(result.blob.size),
        "Content-Type": resume.mimeType ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("EMPLOYER_APPLICATION_RESUME_DOWNLOAD_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to download application resume." },
      { status: 500 },
    );
  }
}
