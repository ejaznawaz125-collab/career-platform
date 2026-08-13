import { CompanySize } from "@prisma/client";
import { z } from "zod";

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));
const optionalUrl = z.string().trim().url("Enter a valid URL.").max(500).optional().or(z.literal(""));

export const companyProfileSchema = z.object({
  name: z.string().trim().min(2, "Company name is required.").max(120),
  tagline: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  website: optionalUrl,
  email: z.string().trim().email("Enter a valid email.").max(254).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  companySize: z.nativeEnum(CompanySize),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  address: optionalText,
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

export function nullable(value: string | undefined) {
  return value?.trim() || null;
}
