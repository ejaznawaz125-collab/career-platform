import { resumeImportDataSchema, type ResumeImportData } from "./contract";

const clean = (value: string | null) => value?.normalize("NFKC").trim().replace(/\s+/g, " ") || null;
const cleanUrl = (value: string | null) => { const normalized = clean(value); if (!normalized) return null; try { const url = new URL(normalized); url.hash = ""; return url.toString().replace(/\/$/, ""); } catch { return null; } };
const uniqueStrings = (values: string[]) => [...new Map(values.map((value) => [clean(value)?.toLocaleLowerCase(), clean(value)]).filter((entry): entry is [string, string] => Boolean(entry[0] && entry[1]))).values()];

export function normalizeResumeImportData(input: ResumeImportData): ResumeImportData {
  return resumeImportDataSchema.parse({
    ...input,
    personal: Object.fromEntries(Object.entries(input.personal).map(([key, value]) => [key, typeof value === "string" ? clean(value) : value])),
    links: { linkedinUrl: cleanUrl(input.links.linkedinUrl), githubUrl: cleanUrl(input.links.githubUrl), portfolioUrl: cleanUrl(input.links.portfolioUrl) },
    professional: { ...input.professional, headline: clean(input.professional.headline), currentJobTitle: clean(input.professional.currentJobTitle), summary: input.professional.summary?.normalize("NFKC").trim() || null },
    experience: input.experience.map((item) => ({ ...item, company: clean(item.company), position: clean(item.position), industry: clean(item.industry), location: clean(item.location), country: clean(item.country), description: item.description?.normalize("NFKC").trim() || null, achievements: uniqueStrings(item.achievements) })),
    education: input.education.map((item) => ({ ...item, institute: clean(item.institute), degree: clean(item.degree), fieldOfStudy: clean(item.fieldOfStudy), country: clean(item.country), city: clean(item.city), grade: clean(item.grade), description: item.description?.normalize("NFKC").trim() || null })),
    skills: [...new Map(input.skills.map((item) => [clean(item.name)?.toLocaleLowerCase(), { ...item, name: clean(item.name), category: clean(item.category) }])).values()],
    languages: [...new Map(input.languages.map((item) => [clean(item.language)?.toLocaleLowerCase(), { ...item, language: clean(item.language) }])).values()],
    projects: input.projects.map((item) => ({ ...item, title: clean(item.title), description: item.description?.normalize("NFKC").trim() || null, projectUrl: cleanUrl(item.projectUrl), githubUrl: cleanUrl(item.githubUrl), technologies: uniqueStrings(item.technologies) })),
    unsupported: Object.fromEntries(Object.entries(input.unsupported).map(([key, values]) => [key, uniqueStrings(values)])),
  });
}
