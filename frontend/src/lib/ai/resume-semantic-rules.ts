import type { ResumeImportData } from "@/lib/resume-import/contract";

const TITLE_UNKNOWN = /\b(?:role|job|position)(?:\s+title)?\s+(?:(?:is|are|was|were)\s+)?(?:not\s+(?:stated|provided|specified|listed)|unknown|unclear)\b/i;
const CURRENT_WORDING = /\b(?:present|current|currently)\b/i;

const escapePattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function hasExplicitTitleEvidence(text: string, position: string, company: string): boolean {
  const title = escapePattern(position);
  const employer = escapePattern(company);
  return [
    new RegExp(`(?:^|\\n)\\s*${title}\\s*(?:,|[-—–|]|at\\b)`, "i"),
    new RegExp(`\\b(?:title|position|role)\\s*:\\s*${title}\\b`, "i"),
    new RegExp(`\\b(?:worked|served|employed)\\s+as\\s+(?:an?\\s+)?${title}\\b`, "i"),
    new RegExp(`${employer}\\s*(?:,|[-—–|])\\s*${title}\\b`, "i"),
  ].some((pattern) => pattern.test(text));
}

function hasExplicitCurrentEvidence(text: string, position: string, company: string): boolean {
  const lines = text.toLocaleLowerCase().split(/\r?\n/);
  const title = position.toLocaleLowerCase();
  const employer = company.toLocaleLowerCase();
  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].includes(title)) continue;
    const context = lines.slice(Math.max(0, index - 2), index + 3).join("\n");
    if (context.includes(employer) && CURRENT_WORDING.test(context)) return true;
  }
  return false;
}

export function applyResumeSemanticRules(text: string, data: ResumeImportData): ResumeImportData {
  const experience = TITLE_UNKNOWN.test(text)
    ? data.experience.filter((item) => hasExplicitTitleEvidence(text, item.position, item.company))
    : data.experience;

  const currentTitle = data.professional.currentJobTitle?.toLocaleLowerCase();
  const explicitlyCurrent = currentTitle
    ? experience.some((item) =>
        item.position.toLocaleLowerCase() === currentTitle &&
        item.currentlyWorking &&
        item.endDate === null &&
        hasExplicitCurrentEvidence(text, item.position, item.company))
    : false;

  return {
    ...data,
    professional: {
      ...data.professional,
      currentJobTitle: explicitlyCurrent ? data.professional.currentJobTitle : null,
    },
    experience,
  };
}
