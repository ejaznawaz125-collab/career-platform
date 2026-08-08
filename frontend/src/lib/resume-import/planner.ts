import type { ResumeImportData } from "./contract";

export const scalarFields = [
  ["personal.firstName", "First name"], ["personal.lastName", "Last name"], ["personal.phone", "Phone"],
  ["personal.country", "Country"], ["personal.city", "City"], ["personal.address", "Address"],
  ["links.linkedinUrl", "LinkedIn"], ["links.githubUrl", "GitHub"], ["links.portfolioUrl", "Portfolio"],
  ["professional.headline", "Headline"], ["professional.currentJobTitle", "Current job title"],
  ["professional.summary", "Professional summary"], ["professional.totalExperience", "Total experience"],
] as const;
export type ScalarPath = (typeof scalarFields)[number][0];
export type MatchState = "EMPTY" | "CONFLICT" | "SAME";

export type CurrentProfile = Record<ScalarPath, string | number | null> & {
  email: string; experiences: Array<{ company: string; position: string; startDate: string }>;
  educations: Array<{ institute: string; degree: string; startYear: number | null }>;
  skills: Array<{ name: string }>; languages: Array<{ language: string }>;
  projects: Array<{ title: string; projectUrl: string | null; githubUrl: string | null }>;
};

export type ImportPlan = {
  scalars: Array<{ path: ScalarPath; label: string; existing: string | number | null; imported: string | number; state: MatchState; selected: boolean }>;
  emailComparison: { existing: string; imported: string | null };
  duplicates: { experience: boolean[]; education: boolean[]; skills: boolean[]; languages: boolean[]; projects: boolean[] };
};

export function normalizeComparable(value: unknown): string { return String(value ?? "").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " "); }
const month = (value: string | null) => value?.slice(0, 7) ?? "";

export function planResumeImport(data: ResumeImportData, current: CurrentProfile): ImportPlan {
  const scalarValue = (path: ScalarPath): string | number | null => {
    const [group, key] = path.split(".") as ["personal" | "links" | "professional", string];
    return (data[group] as Record<string, string | number | null>)[key] ?? null;
  };
  const scalars = scalarFields.flatMap(([path, label]) => {
    const imported = scalarValue(path); if (imported === null || imported === "") return [];
    const existing = current[path]; const same = normalizeComparable(existing) === normalizeComparable(imported);
    const state: MatchState = same ? "SAME" : existing === null || existing === "" ? "EMPTY" : "CONFLICT";
    return [{ path, label, existing, imported, state, selected: state === "EMPTY" }];
  });
  return {
    scalars, emailComparison: { existing: current.email, imported: data.personal.email },
    duplicates: {
      experience: data.experience.map((item) => current.experiences.some((old) => normalizeComparable(old.company) === normalizeComparable(item.company) && normalizeComparable(old.position) === normalizeComparable(item.position) && month(old.startDate) === month(item.startDate))),
      education: data.education.map((item) => current.educations.some((old) => normalizeComparable(old.institute) === normalizeComparable(item.institute) && normalizeComparable(old.degree) === normalizeComparable(item.degree) && old.startYear === item.startYear)),
      skills: data.skills.map((item) => current.skills.some((old) => normalizeComparable(old.name) === normalizeComparable(item.name))),
      languages: data.languages.map((item) => current.languages.some((old) => normalizeComparable(old.language) === normalizeComparable(item.language))),
      projects: data.projects.map((item) => current.projects.some((old) => normalizeComparable(old.title) === normalizeComparable(item.title) && ((!item.projectUrl && !item.githubUrl) || normalizeComparable(old.projectUrl) === normalizeComparable(item.projectUrl) || normalizeComparable(old.githubUrl) === normalizeComparable(item.githubUrl)))),
    },
  };
}
