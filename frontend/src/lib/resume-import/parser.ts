import { emptyResumeImportData, resumeImportDataSchema, type ResumeImportData } from "./contract";

import { RESUME_AI_PARSER_VERSION } from "./versions";

export const PARSER_VERSION = RESUME_AI_PARSER_VERSION;

export interface ResumeParser { parse(text: string): Promise<ResumeImportData>; }

function match(text: string, expression: RegExp): string | null { return text.match(expression)?.[1]?.trim() ?? null; }

export class DeterministicResumeParser implements ResumeParser {
  async parse(text: string): Promise<ResumeImportData> {
    // Resume text is data only. This parser never interprets instructions or invokes tools.
    const data = emptyResumeImportData();
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    const firstLine = lines[0]?.replace(/[^\p{L}\p{M}' -]/gu, "").trim();
    if (firstLine && firstLine.length <= 100 && firstLine.split(/\s+/).length <= 5) {
      const parts = firstLine.split(/\s+/); data.personal.firstName = parts.shift() ?? null; data.personal.lastName = parts.join(" ") || null;
    }
    data.personal.email = match(text, /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/i);
    data.personal.phone = match(text, /(?:phone|mobile|tel)\s*[:\-]?\s*(\+?[\d ()-]{7,25})/i);
    data.links.linkedinUrl = match(text, /(https?:\/\/(?:www\.)?linkedin\.com\/[^\s]+)/i);
    data.links.githubUrl = match(text, /(https?:\/\/(?:www\.)?github\.com\/[^\s]+)/i);
    const urls = text.match(/https?:\/\/[^\s)]+/gi) ?? [];
    data.links.portfolioUrl = urls.find((url) => !/linkedin|github/i.test(url)) ?? null;
    const skillBlock = match(text, /(?:^|\n)skills?\s*[:\n]([^]*?)(?=\n(?:experience|education|projects?|languages?|certifications?)\b|$)/i);
    if (skillBlock && skillBlock.length < 2000) {
      data.skills = [...new Set(skillBlock.split(/[,•|\n]/).map((item) => item.trim()).filter((item) => item.length >= 2 && item.length <= 100))].slice(0, 100).map((name) => ({ name, category: null, years: null }));
    }
    return resumeImportDataSchema.parse(data);
  }
}

export function validateParserOutput(value: unknown): ResumeImportData { return resumeImportDataSchema.parse(value); }
