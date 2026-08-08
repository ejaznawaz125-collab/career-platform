import { CandidateLanguageLevel, EducationLevel, EmploymentType } from "@prisma/client";
import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).nullable().default(null);
const optionalUrl = z.string().trim().url().max(500).nullable().default(null);
const optionalDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null);

export const resumeImportDataSchema = z.object({
  personal: z.object({
    firstName: optionalText(100), lastName: optionalText(100), email: z.string().email().nullable().default(null),
    phone: optionalText(50), country: optionalText(100), city: optionalText(100), address: optionalText(300),
  }).strict(),
  links: z.object({ linkedinUrl: optionalUrl, githubUrl: optionalUrl, portfolioUrl: optionalUrl }).strict(),
  professional: z.object({
    headline: optionalText(200), currentJobTitle: optionalText(200), summary: optionalText(5000),
    totalExperience: z.number().min(0).max(80).nullable().default(null),
  }).strict(),
  experience: z.array(z.object({
    company: z.string().trim().min(1).max(200), position: z.string().trim().min(1).max(200),
    employmentType: z.nativeEnum(EmploymentType).nullable().default(null), industry: optionalText(150),
    location: optionalText(200), country: optionalText(100), startDate: optionalDate, endDate: optionalDate,
    currentlyWorking: z.boolean().default(false), description: optionalText(5000), achievements: z.array(z.string().trim().min(1).max(500)).max(30).default([]),
  }).strict()).max(50),
  education: z.array(z.object({
    institute: z.string().trim().min(1).max(200), degree: z.string().trim().min(1).max(200),
    fieldOfStudy: optionalText(200), educationLevel: z.nativeEnum(EducationLevel).nullable().default(null),
    country: optionalText(100), city: optionalText(100), startYear: z.number().int().min(1900).max(2200).nullable().default(null),
    endYear: z.number().int().min(1900).max(2200).nullable().default(null), currentlyStudying: z.boolean().default(false),
    grade: optionalText(100), description: optionalText(5000),
  }).strict()).max(30),
  skills: z.array(z.object({ name: z.string().trim().min(1).max(100), category: optionalText(100), years: z.number().min(0).max(80).nullable().default(null) }).strict()).max(100),
  languages: z.array(z.object({ language: z.string().trim().min(1).max(100), proficiency: z.nativeEnum(CandidateLanguageLevel).nullable().default(null), isNative: z.boolean().nullable().default(null) }).strict()).max(30),
  projects: z.array(z.object({
    title: z.string().trim().min(1).max(200), description: optionalText(5000), projectUrl: optionalUrl,
    githubUrl: optionalUrl, technologies: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
    startDate: optionalDate, endDate: optionalDate,
  }).strict()).max(50),
  unsupported: z.object({ certifications: z.array(z.string().max(500)).max(50).default([]), awards: z.array(z.string().max(500)).max(50).default([]), courses: z.array(z.string().max(500)).max(50).default([]), publications: z.array(z.string().max(500)).max(50).default([]) }).strict(),
}).strict();

export type ResumeImportData = z.infer<typeof resumeImportDataSchema>;

export const emptyResumeImportData = (): ResumeImportData => ({
  personal: { firstName: null, lastName: null, email: null, phone: null, country: null, city: null, address: null },
  links: { linkedinUrl: null, githubUrl: null, portfolioUrl: null },
  professional: { headline: null, currentJobTitle: null, summary: null, totalExperience: null },
  experience: [], education: [], skills: [], languages: [], projects: [],
  unsupported: { certifications: [], awards: [], courses: [], publications: [] },
});

export { RESUME_IMPORT_SCHEMA_VERSION as SCHEMA_VERSION } from "./versions";
