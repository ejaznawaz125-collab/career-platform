import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedResumeOwner } from "@/lib/resume-server";

type RouteContext = { params: Promise<{ resumeId: string }> };

function safeDownloadName(filename: string | null, fallback: string) {
  const normalized = (filename ?? fallback)
    .replace(/[\r\n"\\/]/g, "_")
    .trim();
  const preferred = normalized || fallback;
  const ascii = preferred.replace(/[^\x20-\x7E]/g, "_");

  return {
    ascii: ascii || fallback,
    encoded: encodeURIComponent(preferred).replace(/[!'()*]/g, (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
    ),
  };
}

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const owner = await getAuthenticatedResumeOwner();
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const { resumeId } = await params;
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        profileId: owner.profileId,
        storagePath: { not: null },
        uploadStatus: "READY",
      },
      select: {
        storagePath: true,
        originalName: true,
        mimeType: true,
      },
    });

    if (!resume?.storagePath) {
      return NextResponse.json(
        { success: false, message: "Resume not found." },
        { status: 404 },
      );
    }

    const result = await get(resume.storagePath, {
      access: "private",
      useCache: false,
    });
    if (!result || result.statusCode !== 200) {
      return NextResponse.json(
        { success: false, message: "Resume file not found." },
        { status: 404 },
      );
    }

    const filename = safeDownloadName(resume.originalName, "resume");
    return new Response(result.stream, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition":
          `attachment; filename="${filename.ascii}"; filename*=UTF-8''${filename.encoded}`,
        "Content-Length": String(result.blob.size),
        "Content-Type": resume.mimeType ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("RESUME_DOWNLOAD_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to download resume." },
      { status: 500 },
    );
  }
}
