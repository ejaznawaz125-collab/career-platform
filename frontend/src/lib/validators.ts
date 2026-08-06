import {
  ExperienceLevel,
  JobType,
  WorkMode,
} from "@prisma/client";
import { z } from "zod";

const optionalText = (maximumLength: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const normalizedValue = value.trim();

      return normalizedValue === ""
        ? undefined
        : normalizedValue;
    },
    z
      .string()
      .max(maximumLength)
      .optional(),
  );

const optionalUrl = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const normalizedValue = value.trim();

    return normalizedValue === ""
      ? undefined
      : normalizedValue;
  },
  z
    .string()
    .url("Please enter a valid URL.")
    .optional(),
);

const optionalNullableInteger = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === undefined ||
      value === null
    ) {
      return null;
    }

    if (typeof value === "string") {
      return Number(value);
    }

    return value;
  },
  z
    .number()
    .int("Value must be a whole number.")
    .nonnegative("Value cannot be negative.")
    .nullable()
    .optional(),
);

const optionalNullableNumber = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === undefined ||
      value === null
    ) {
      return null;
    }

    if (typeof value === "string") {
      return Number(value);
    }

    return value;
  },
  z
    .number()
    .nonnegative("Value cannot be negative.")
    .max(
      99.99,
      "Total experience cannot exceed 99.99 years.",
    )
    .nullable()
    .optional(),
);

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name is required.")
      .max(
        50,
        "First name cannot exceed 50 characters.",
      ),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name is required.")
      .max(
        50,
        "Last name cannot exceed 50 characters.",
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address."),

    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters.",
      )
      .max(
        128,
        "Password cannot exceed 128 characters.",
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  );

export type RegisterInput = z.infer<
  typeof registerSchema
>;

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name is required.")
    .max(
      50,
      "First name cannot exceed 50 characters.",
    ),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name is required.")
    .max(
      50,
      "Last name cannot exceed 50 characters.",
    ),

  phone: optionalText(30),

  country: optionalText(100),

  city: optionalText(100),

  address: optionalText(250),

  headline: optionalText(160),

  currentJobTitle: optionalText(120),

  summary: optionalText(5000),

  linkedinUrl: optionalUrl,

  githubUrl: optionalUrl,

  portfolioUrl: optionalUrl,

  expectedSalary: optionalNullableInteger,

  currentSalary: optionalNullableInteger,

  salaryCurrency: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const normalizedValue = value
        .trim()
        .toUpperCase();

      return normalizedValue === ""
        ? undefined
        : normalizedValue;
    },
    z
      .string()
      .length(
        3,
        "Currency must use a 3-letter code.",
      )
      .optional(),
  ),

  totalExperience: optionalNullableNumber,

  experienceLevel: z
    .nativeEnum(ExperienceLevel)
    .nullable()
    .optional(),

  highestEducation: optionalText(150),

  availableForWork: z.boolean().optional(),

  availableImmediately: z.boolean().optional(),

  openToRemote: z.boolean().optional(),

  preferredCountry: optionalText(100),

  preferredCity: optionalText(100),

  preferredJobType: z
    .nativeEnum(JobType)
    .nullable()
    .optional(),

  preferredWorkMode: z
    .nativeEnum(WorkMode)
    .nullable()
    .optional(),

  isPublic: z.boolean().optional(),
});

export type ProfileInput = z.infer<
  typeof profileSchema
>;