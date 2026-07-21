import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),

    lastName: z.string().min(2, "Last name is required"),

    email: z.string().email("Invalid email"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),

  lastName: z.string().min(2, "Last name is required"),

  phone: z.string().optional(),

  country: z.string().optional(),

  city: z.string().optional(),

  address: z.string().optional(),

  headline: z.string().optional(),

  currentJobTitle: z.string().optional(),

  summary: z.string().optional(),

  linkedinUrl: z.string().optional(),

  githubUrl: z.string().optional(),

  portfolioUrl: z.string().optional(),

  expectedSalary: z
    .union([z.number(), z.null()])
    .optional(),

  salaryCurrency: z.string().optional(),

  availableForWork: z.boolean().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;