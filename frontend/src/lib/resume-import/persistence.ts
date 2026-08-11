import type { CandidateLanguage, CandidateSkill, Education, Experience, PortfolioProject, Prisma } from "@prisma/client";

import type { ResumeImportData } from "./contract";
import { normalizeComparable } from "./planner";

type ExistingCollections = {
  experiences: Experience[];
  educations: Education[];
  skills: CandidateSkill[];
  languages: CandidateLanguage[];
  portfolioProjects: PortfolioProject[];
};

type SelectedCollections = {
  experience: number[];
  education: number[];
  skills: number[];
  languages: number[];
  projects: number[];
};

export function prepareResumeImportCollections(profileId: string, existing: ExistingCollections, data: ResumeImportData, selected: SelectedCollections) {
  let duplicates = 0;
  const experienceKeys = new Set(existing.experiences.map((item) => `${normalizeComparable(item.company)}\u0000${normalizeComparable(item.position)}\u0000${item.startDate.toISOString().slice(0, 7)}`));
  const experience = selected.experience.flatMap((index): Prisma.ExperienceCreateManyInput[] => {
    const item = data.experience[index];
    if (!item?.startDate) return [];
    const key = `${normalizeComparable(item.company)}\u0000${normalizeComparable(item.position)}\u0000${item.startDate.slice(0, 7)}`;
    if (experienceKeys.has(key)) { duplicates++; return []; }
    experienceKeys.add(key);
    return [{ profileId, ...item, achievements: item.achievements.length ? item.achievements.join("\n") : null, startDate: new Date(item.startDate), endDate: item.currentlyWorking || !item.endDate ? null : new Date(item.endDate) }];
  });

  const educationKeys = new Set(existing.educations.map((item) => `${normalizeComparable(item.institute)}\u0000${normalizeComparable(item.degree)}\u0000${item.startYear ?? ""}`));
  const education = selected.education.flatMap((index): Prisma.EducationCreateManyInput[] => {
    const item = data.education[index];
    if (!item?.educationLevel) return [];
    const key = `${normalizeComparable(item.institute)}\u0000${normalizeComparable(item.degree)}\u0000${item.startYear ?? ""}`;
    if (educationKeys.has(key)) { duplicates++; return []; }
    educationKeys.add(key);
    return [{ profileId, ...item, educationLevel: item.educationLevel }];
  });

  const skillKeys = new Set(existing.skills.map((item) => normalizeComparable(item.name)));
  const skills = selected.skills.flatMap((index): Prisma.CandidateSkillCreateManyInput[] => {
    const item = data.skills[index];
    if (!item) return [];
    const key = normalizeComparable(item.name);
    if (skillKeys.has(key)) { duplicates++; return []; }
    skillKeys.add(key);
    return [{ profileId, ...item, level: 1 }];
  });

  const languageKeys = new Set(existing.languages.map((item) => normalizeComparable(item.language)));
  const languages = selected.languages.flatMap((index): Prisma.CandidateLanguageCreateManyInput[] => {
    const item = data.languages[index];
    if (!item?.proficiency) return [];
    const key = normalizeComparable(item.language);
    if (languageKeys.has(key)) { duplicates++; return []; }
    languageKeys.add(key);
    return [{ profileId, language: item.language, proficiency: item.proficiency, isNative: item.isNative ?? false }];
  });

  const projectComparisons = existing.portfolioProjects.map((item) => ({ title: item.title, projectUrl: item.projectUrl, githubUrl: item.githubUrl }));
  const projects = selected.projects.flatMap((index): Prisma.PortfolioProjectCreateManyInput[] => {
    const item = data.projects[index];
    if (!item) return [];
    const duplicate = projectComparisons.some((old) => normalizeComparable(old.title) === normalizeComparable(item.title) && ((!item.projectUrl && !item.githubUrl) || normalizeComparable(old.projectUrl) === normalizeComparable(item.projectUrl) || normalizeComparable(old.githubUrl) === normalizeComparable(item.githubUrl)));
    if (duplicate) { duplicates++; return []; }
    projectComparisons.push({ title: item.title, projectUrl: item.projectUrl, githubUrl: item.githubUrl });
    return [{ profileId, ...item, startDate: item.startDate ? new Date(item.startDate) : null, endDate: item.endDate ? new Date(item.endDate) : null, featured: false }];
  });

  return { experience, education, skills, languages, projects, duplicates };
}
