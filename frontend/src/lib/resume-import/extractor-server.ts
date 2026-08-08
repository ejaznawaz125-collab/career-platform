import "server-only";

import { get } from "@vercel/blob";

import { extractResumeBuffer, type ExtractionResult } from "./extractor";

export async function extractStoredResume(options: { pathname: string; userId: string; originalName: string; mimeType: string }): Promise<ExtractionResult> {
  const result = await get(options.pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) throw new Error("RESUME_BLOB_NOT_FOUND");
  return extractResumeBuffer(Buffer.from(await new Response(result.stream).arrayBuffer()), options);
}
