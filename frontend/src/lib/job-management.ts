import { ExperienceLevel, JobStatus, JobType, WorkMode } from "@prisma/client";
import { z } from "zod";

const optionalInteger = z.union([z.literal(""), z.coerce.number().int().min(0)]);

export const jobInputSchema = z.object({
  title: z.string().trim().min(2, "Job title is required.").max(160),
  categoryId: z.string().trim().min(1, "Category is required."),
  country: z.string().trim().min(1, "Country is required.").max(100),
  city: z.string().trim().min(1, "City is required.").max(100),
  jobType: z.nativeEnum(JobType),
  workMode: z.nativeEnum(WorkMode),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  salaryMin: optionalInteger,
  salaryMax: optionalInteger,
  vacancies: z.coerce.number().int().min(1).max(10000),
  description: z.string().trim().min(1, "Description is required.").max(20000),
  requirements: z.string().trim().max(20000).optional().or(z.literal("")),
  responsibilities: z.string().trim().max(20000).optional().or(z.literal("")),
  benefits: z.string().trim().max(20000).optional().or(z.literal("")),
  status: z.nativeEnum(JobStatus).optional(),
}).superRefine((value, context) => {
  if (value.salaryMin !== "" && value.salaryMax !== "" && value.salaryMin > value.salaryMax) {
    context.addIssue({ code: "custom", path: ["salaryMax"], message: "Maximum salary must be greater than or equal to minimum salary." });
  }
});

export function optionalNumber(value: number | "") { return value === "" ? null : value; }
