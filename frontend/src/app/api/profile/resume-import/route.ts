import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedResumeOwner } from "@/lib/resume-server";
import { resumeImportDataSchema } from "@/lib/resume-import/contract";
import { extractStoredResume } from "@/lib/resume-import/extractor-server";
import { createOpenAIResumeParser } from "@/lib/ai/openai-resume-parser";
import { AIParserError } from "@/lib/ai/errors";
import { planResumeImport, type CurrentProfile } from "@/lib/resume-import/planner";
import { createParseCacheIdentity } from "@/lib/resume-import/cache";

const requestSchema = z.object({ resumeId: z.string().trim().min(1) });

function safeFailureCode(error: unknown): string {
  if (error instanceof AIParserError) return error.code;
  if (error instanceof Error && ["RESUME_BLOB_NOT_FOUND", "RESUME_TEXT_TOO_LARGE", "INVALID_PDF_PAGE_COUNT"].includes(error.message)) return error.message;
  return "RESUME_PARSE_FAILED";
}

function aiFailureResponse(error: AIParserError) {
  const messages: Record<string, string> = {
    AI_PROVIDER_UNAVAILABLE: "Resume parsing is temporarily unavailable. Please try again later.",
    AI_TIMEOUT: "Resume parsing took too long. Please try again.",
    AI_REFUSAL: "The resume could not be parsed safely.",
    AI_INVALID_OUTPUT: "The parser returned an invalid result. Please try again.",
    AI_SCHEMA_VALIDATION_FAILED: "The parsed resume did not pass validation.",
    TEXT_TOO_LARGE: "The extracted resume text is too large to process.",
  };
  return NextResponse.json({ success: false, code: error.code, message: messages[error.code] }, { status: error.code === "AI_PROVIDER_UNAVAILABLE" ? 503 : error.code === "AI_TIMEOUT" ? 504 : 422 });
}

export async function POST(request: Request) {
  const owner = await getAuthenticatedResumeOwner();
  if (!owner) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  let parseId: string | null = null;
  try {
    const { resumeId } = requestSchema.parse(await request.json());
    const resume = await prisma.resume.findFirst({ where: { id: resumeId, profileId: owner.profileId, uploadStatus: "READY", storagePath: { not: null }, contentHash: { not: null } } });
    if (!resume?.storagePath || !resume.contentHash || !resume.originalName || !resume.mimeType) return NextResponse.json({ success: false, message: "This resume cannot be parsed. Upload a managed PDF or DOCX first." }, { status: 404 });
    const identity = createParseCacheIdentity(resumeId, resume.contentHash);
    const key = { resumeId_contentHash_extractorVersion_parserVersion_schemaVersion: identity };
    let parse = await prisma.resumeParse.findUnique({ where: key });
    let ownsProcessingClaim = false;
    if (!parse) {
      try {
        parse = await prisma.resumeParse.create({ data: identity });
        ownsProcessingClaim = true;
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
        parse = await prisma.resumeParse.findUnique({ where: key });
      }
    } else if (parse.status === "FAILED" || (parse.status === "PROCESSING" && parse.updatedAt < new Date(Date.now() - 2 * 60_000))) {
      const claim = await prisma.resumeParse.updateMany({ where: { id: parse.id, updatedAt: parse.updatedAt, status: parse.status }, data: { status: "PROCESSING", diagnosticCode: null, extractedData: Prisma.JsonNull } });
      ownsProcessingClaim = claim.count === 1;
      if (ownsProcessingClaim) parse = await prisma.resumeParse.findUnique({ where: { id: parse.id } });
    }
    if (ownsProcessingClaim && parse) {
      parseId = parse.id;
      const extraction = await extractStoredResume({ pathname: resume.storagePath, userId: owner.userId, originalName: resume.originalName, mimeType: resume.mimeType });
      if (extraction.status === "IMAGE_ONLY_OR_LOW_TEXT") {
        await prisma.resumeParse.update({ where: { id: parse.id }, data: { status: "LOW_TEXT", diagnosticCode: "IMAGE_ONLY_OR_LOW_TEXT" } });
        return NextResponse.json({ success: false, code: "IMAGE_ONLY_OR_LOW_TEXT", message: "This resume contains too little selectable text. OCR is not available in this release." }, { status: 422 });
      }
      const data = await createOpenAIResumeParser().parseResume(extraction.text);
      parse = await prisma.resumeParse.update({ where: { id: parse.id }, data: { status: "READY", extractedData: data as Prisma.InputJsonValue, diagnosticCode: null } });
    }
    if (!parse) throw new Error("RESUME_PARSE_STATE_ERROR");
    if (parse.status === "LOW_TEXT") return NextResponse.json({ success: false, code: "IMAGE_ONLY_OR_LOW_TEXT", message: "This resume contains too little selectable text. OCR is not available in this release." }, { status: 422 });
    if (parse.status !== "READY" || !parse.extractedData) return NextResponse.json({ success: false, message: "Resume processing is already in progress. Try again shortly." }, { status: 409 });
    const data = resumeImportDataSchema.parse(parse.extractedData);
    const user = await prisma.user.findUnique({ where: { id: owner.userId }, include: { candidateProfile: { include: { experiences: true, educations: true, skills: true, languages: true, portfolioProjects: true } } } });
    if (!user?.candidateProfile) throw new Error("PROFILE_NOT_FOUND");
    const profile = user.candidateProfile;
    const current: CurrentProfile = {
      "personal.firstName": user.firstName, "personal.lastName": user.lastName, "personal.phone": user.phone,
      "personal.country": user.country, "personal.city": user.city, "personal.address": user.address,
      "links.linkedinUrl": user.linkedinUrl, "links.githubUrl": user.githubUrl, "links.portfolioUrl": user.portfolioUrl,
      "professional.headline": profile.headline, "professional.currentJobTitle": profile.currentJobTitle,
      "professional.summary": profile.summary, "professional.totalExperience": profile.totalExperience ? Number(profile.totalExperience) : null,
      email: user.email,
      experiences: profile.experiences.map((item) => ({ company: item.company, position: item.position, startDate: item.startDate.toISOString() })),
      educations: profile.educations.map((item) => ({ institute: item.institute, degree: item.degree, startYear: item.startYear })),
      skills: profile.skills, languages: profile.languages,
      projects: profile.portfolioProjects.map((item) => ({ title: item.title, projectUrl: item.projectUrl, githubUrl: item.githubUrl })),
    };
    return NextResponse.json({ success: true, parseId: parse.id, data, plan: planResumeImport(data, current), reused: parseId === null });
  } catch (error) {
    if (parseId) await prisma.resumeParse.updateMany({ where: { id: parseId, status: "PROCESSING" }, data: { status: "FAILED", diagnosticCode: safeFailureCode(error) } }).catch(() => undefined);
    if (error instanceof ZodError) return NextResponse.json({ success: false, message: "Invalid resume import request." }, { status: 400 });
    if (error instanceof AIParserError) return aiFailureResponse(error);
    console.error("RESUME_IMPORT_PARSE_ERROR:", safeFailureCode(error));
    return NextResponse.json({ success: false, message: "The resume could not be processed safely." }, { status: 422 });
  }
}
