import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getAuthenticatedResumeOwner } from "@/lib/resume-server";
import { confirmImportSchema, importResumeToProfile } from "@/lib/resume-import/service";

export async function POST(request: Request) {
  const owner = await getAuthenticatedResumeOwner();
  if (!owner) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  try {
    const input = confirmImportSchema.parse(await request.json());
    const summary = await importResumeToProfile(owner.userId, input);
    return NextResponse.json({ success: true, message: "Selected resume details were imported.", summary });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ success: false, message: "Please correct the selected import values.", errors: error.flatten().fieldErrors }, { status: 400 });
    if (error instanceof Error && error.message === "STALE_OR_UNAUTHORIZED_PARSE") return NextResponse.json({ success: false, message: "This import preview is stale or unavailable. Process the resume again." }, { status: 409 });
    if (error instanceof Error && error.message === "STALE_PROFILE_CONFLICT") return NextResponse.json({ success: false, message: "Your profile changed after this preview. Review the resume again before importing." }, { status: 409 });
    console.error("RESUME_IMPORT_CONFIRM_ERROR:", error instanceof Error ? error.message : "UNKNOWN");
    return NextResponse.json({ success: false, message: "Nothing was imported because the transaction failed." }, { status: 500 });
  }
}
