import mammoth from "mammoth";

import { validateManagedResume } from "@/lib/resume-file-validation";
import { RESUME_EXTRACTOR_VERSION } from "./versions";

export const EXTRACTOR_VERSION = RESUME_EXTRACTOR_VERSION;
const MAX_PAGES = 100;
const MAX_CHARACTERS = 150_000;
const MIN_USEFUL_CHARACTERS = 80;

export type ExtractionResult = { status: "READY"; text: string } | { status: "IMAGE_ONLY_OR_LOW_TEXT" };

function normalizeText(value: string): string {
  return value.normalize("NFKC").replace(/[\u2022\u25CF\u25AA]/g, "•").replace(/\r\n?/g, "\n")
    .replace(/[\t\f\v]+/g, " ").replace(/ +/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = getDocument({ data: Uint8Array.from(buffer), disableAutoFetch: true, disableRange: true, disableStream: true, isEvalSupported: false, useSystemFonts: false, verbosity: 0 });
  try {
    const document = await task.promise;
    if (document.numPages < 1 || document.numPages > MAX_PAGES) throw new Error("INVALID_PDF_PAGE_COUNT");
    const pages: string[] = [];
    let characters = 0;
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent({ disableNormalization: false });
      const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
      characters += pageText.length;
      if (characters > MAX_CHARACTERS) throw new Error("RESUME_TEXT_TOO_LARGE");
      pages.push(pageText);
      page.cleanup();
    }
    return pages.join("\n\n--- Page break ---\n\n");
  } finally { await task.destroy(); }
}

export async function extractResumeBuffer(buffer: Buffer, options: { pathname: string; userId: string; originalName: string; mimeType: string }): Promise<ExtractionResult> {
  const { extension } = await validateManagedResume({ buffer, ...options });
  const raw = extension === "pdf" ? await extractPdf(buffer) : (await mammoth.extractRawText({ buffer })).value;
  const text = normalizeText(raw);
  if (text.replace(/[^\p{L}\p{N}]/gu, "").length < MIN_USEFUL_CHARACTERS) return { status: "IMAGE_ONLY_OR_LOW_TEXT" };
  if (text.length > MAX_CHARACTERS) throw new Error("RESUME_TEXT_TOO_LARGE");
  return { status: "READY", text };
}
