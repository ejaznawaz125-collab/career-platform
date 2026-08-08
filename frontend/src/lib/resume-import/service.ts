import "server-only";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { resumeImportDataSchema } from "./contract";
import { normalizeComparable, scalarFields, type ScalarPath } from "./planner";
import { assertParseUsable } from "./guard";

const selectionSchema = z.object({
  path: z.enum(scalarFields.map(([path]) => path) as [ScalarPath, ...ScalarPath[]]),
  value: z.union([z.string().max(5000), z.number().min(0).max(80)]), expectedExisting: z.union([z.string(), z.number(), z.null()]),
});
export const confirmImportSchema = z.object({
  parseId: z.string().min(1), scalars: z.array(selectionSchema).max(scalarFields.length), data: resumeImportDataSchema,
  selected: z.object({ experience: z.array(z.number().int().nonnegative()).max(50), education: z.array(z.number().int().nonnegative()).max(30), skills: z.array(z.number().int().nonnegative()).max(100), languages: z.array(z.number().int().nonnegative()).max(30), projects: z.array(z.number().int().nonnegative()).max(50) }),
});

function currentScalar(user: Record<string, unknown>, profile: Record<string, unknown>, path: ScalarPath): unknown {
  const [, key] = path.split("."); return path.startsWith("professional.") ? profile[key] ?? null : user[key] ?? null;
}

export async function importResumeToProfile(userId: string, input: z.infer<typeof confirmImportSchema>) {
  const parsed = confirmImportSchema.parse(input);
  return prisma.$transaction(async (tx) => {
    const parse = await tx.resumeParse.findFirst({ where: { id: parsed.parseId, status: "READY", resume: { profile: { userId } } }, include: { resume: true } });
    if (!parse) throw new Error("STALE_OR_UNAUTHORIZED_PARSE");
    assertParseUsable({ status: parse.status, contentHash: parse.contentHash, resumeContentHash: parse.resume.contentHash, owned: true });
    if (!parse.extractedData) throw new Error("STALE_OR_UNAUTHORIZED_PARSE");
    const canonical = resumeImportDataSchema.parse(parse.extractedData);
    const user = await tx.user.findUnique({ where: { id: userId }, include: { candidateProfile: { include: { experiences: true, educations: true, skills: true, languages: true, portfolioProjects: true } } } });
    if (!user?.candidateProfile) throw new Error("PROFILE_NOT_FOUND");
    const profile = user.candidateProfile;
    for (const scalar of parsed.scalars) {
      if (normalizeComparable(currentScalar(user, profile, scalar.path)) !== normalizeComparable(scalar.expectedExisting)) throw new Error("STALE_PROFILE_CONFLICT");
    }
    const userData: Prisma.UserUpdateInput = {}; const profileData: Prisma.CandidateProfileUpdateInput = {};
    for (const item of parsed.scalars) { const [, key] = item.path.split("."); if (item.path.startsWith("professional.")) (profileData as Record<string, unknown>)[key] = item.value; else (userData as Record<string, unknown>)[key] = item.value; }
    if (Object.keys(userData).length) await tx.user.update({ where: { id: userId }, data: userData });
    if (Object.keys(profileData).length) await tx.candidateProfile.update({ where: { id: profile.id }, data: profileData });
    let experience = 0, education = 0, skills = 0, languages = 0, projects = 0, duplicates = 0;
    for (const index of parsed.selected.experience) { const item = parsed.data.experience[index]; if (!item || !item.startDate) continue; const duplicate = await tx.experience.findFirst({ where: { profileId: profile.id, company: { equals: item.company, mode: "insensitive" }, position: { equals: item.position, mode: "insensitive" }, startDate: { gte: new Date(`${item.startDate.slice(0,7)}-01`), lt: new Date(new Date(`${item.startDate.slice(0,7)}-01`).setUTCMonth(new Date(`${item.startDate.slice(0,7)}-01`).getUTCMonth()+1)) } }, select: { id: true } }); if (duplicate) { duplicates++; continue; } await tx.experience.create({ data: { profileId: profile.id, ...item, achievements: item.achievements.length ? item.achievements.join("\n") : null, startDate: new Date(item.startDate), endDate: item.currentlyWorking || !item.endDate ? null : new Date(item.endDate) } }); experience++; }
    for (const index of parsed.selected.education) { const item = parsed.data.education[index]; if (!item || !item.educationLevel) continue; const duplicate = await tx.education.findFirst({ where: { profileId: profile.id, institute: { equals: item.institute, mode: "insensitive" }, degree: { equals: item.degree, mode: "insensitive" }, startYear: item.startYear } }); if (duplicate) { duplicates++; continue; } await tx.education.create({ data: { profileId: profile.id, ...item, educationLevel: item.educationLevel } }); education++; }
    for (const index of parsed.selected.skills) { const item = parsed.data.skills[index]; if (!item) continue; if (await tx.candidateSkill.findFirst({ where: { profileId: profile.id, name: { equals: item.name, mode: "insensitive" } } })) { duplicates++; continue; } await tx.candidateSkill.create({ data: { profileId: profile.id, ...item, level: 1 } }); skills++; }
    for (const index of parsed.selected.languages) { const item = parsed.data.languages[index]; if (!item?.proficiency) continue; if (await tx.candidateLanguage.findFirst({ where: { profileId: profile.id, language: { equals: item.language, mode: "insensitive" } } })) { duplicates++; continue; } await tx.candidateLanguage.create({ data: { profileId: profile.id, language: item.language, proficiency: item.proficiency, isNative: item.isNative ?? false } }); languages++; }
    for (const index of parsed.selected.projects) { const item = parsed.data.projects[index]; if (!item) continue; if (await tx.portfolioProject.findFirst({ where: { profileId: profile.id, title: { equals: item.title, mode: "insensitive" } } })) { duplicates++; continue; } await tx.portfolioProject.create({ data: { profileId: profile.id, ...item, startDate: item.startDate ? new Date(item.startDate) : null, endDate: item.endDate ? new Date(item.endDate) : null, featured: false } }); projects++; }
    return { profileFields: parsed.scalars.length, experience, education, skills, languages, projects, duplicates };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
