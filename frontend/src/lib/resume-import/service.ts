import "server-only";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { resumeImportDataSchema } from "./contract";
import { normalizeComparable, scalarFields, type ScalarPath } from "./planner";
import { assertParseUsable } from "./guard";
import { prepareResumeImportCollections } from "./persistence";

export const RESUME_IMPORT_TRANSACTION_OPTIONS = {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  maxWait: 5_000,
  timeout: 15_000,
} as const;

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
    const collections = prepareResumeImportCollections(profile.id, profile, parsed.data, parsed.selected);
    if (collections.experience.length) await tx.experience.createMany({ data: collections.experience });
    if (collections.education.length) await tx.education.createMany({ data: collections.education });
    if (collections.skills.length) await tx.candidateSkill.createMany({ data: collections.skills });
    if (collections.languages.length) await tx.candidateLanguage.createMany({ data: collections.languages });
    if (collections.projects.length) await tx.portfolioProject.createMany({ data: collections.projects });
    return { profileFields: parsed.scalars.length, experience: collections.experience.length, education: collections.education.length, skills: collections.skills.length, languages: collections.languages.length, projects: collections.projects.length, duplicates: collections.duplicates };
  }, RESUME_IMPORT_TRANSACTION_OPTIONS);
}
