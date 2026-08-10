import { EmploymentType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { getAuthenticatedCandidateOwner } from "@/lib/candidate-server";
import { prisma } from "@/lib/prisma";

const optionalText = (maximumLength: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const normalizedValue = value.trim();

      return normalizedValue === ""
        ? null
        : normalizedValue;
    },
    z
      .string()
      .max(maximumLength)
      .nullable()
      .optional(),
  );

const requiredDate = z.preprocess(
  (value) => {
    if (
      typeof value === "string" ||
      value instanceof Date
    ) {
      return new Date(value);
    }

    return value;
  },
  z.date({
    message: "Start date is required.",
  }),
);

const optionalNullableDate = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }

    if (
      typeof value === "string" ||
      value instanceof Date
    ) {
      return new Date(value);
    }

    return value;
  },
  z
    .date({
      message: "Please enter a valid date.",
    })
    .nullable()
    .optional(),
);

const optionalUpdateStartDate = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === undefined
    ) {
      return undefined;
    }

    if (
      typeof value === "string" ||
      value instanceof Date
    ) {
      return new Date(value);
    }

    return value;
  },
  z
    .date({
      message: "Please enter a valid start date.",
    })
    .optional(),
);

const experienceCreateSchema = z
  .object({
    company: z
      .string()
      .trim()
      .min(2, "Company name is required.")
      .max(
        200,
        "Company name cannot exceed 200 characters.",
      ),

    companyLogo: optionalText(500),

    position: z
      .string()
      .trim()
      .min(2, "Position is required.")
      .max(
        200,
        "Position cannot exceed 200 characters.",
      ),

    employmentType: z
      .nativeEnum(EmploymentType)
      .nullable()
      .optional(),

    industry: optionalText(150),

    location: optionalText(200),

    country: optionalText(100),

    startDate: requiredDate,

    endDate: optionalNullableDate,

    currentlyWorking: z.boolean().default(false),

    description: optionalText(5000),

    achievements: optionalText(5000),
  })
  .superRefine((data, context) => {
    if (
      data.endDate &&
      data.endDate < data.startDate
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message:
          "End date cannot be before start date.",
      });
    }

    if (
      data.currentlyWorking &&
      data.endDate
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message:
          "Remove the end date when currently working.",
      });
    }
  });

const experienceUpdateSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Experience ID is required."),

  company: z
    .string()
    .trim()
    .min(2, "Company name is required.")
    .max(
      200,
      "Company name cannot exceed 200 characters.",
    )
    .optional(),

  companyLogo: optionalText(500),

  position: z
    .string()
    .trim()
    .min(2, "Position is required.")
    .max(
      200,
      "Position cannot exceed 200 characters.",
    )
    .optional(),

  employmentType: z
    .nativeEnum(EmploymentType)
    .nullable()
    .optional(),

  industry: optionalText(150),

  location: optionalText(200),

  country: optionalText(100),

  startDate: optionalUpdateStartDate,

  endDate: optionalNullableDate,

  currentlyWorking: z.boolean().optional(),

  description: optionalText(5000),

  achievements: optionalText(5000),
});

const experienceDeleteSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Experience ID is required."),
});

async function getAuthenticatedProfileId() {
  const owner = await getAuthenticatedCandidateOwner();
  if (owner) return { profileId: owner.profileId };
  return { error: NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 }) };
}

function handleError(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Please correct the invalid fields.",
        errors: error.flatten().fieldErrors,
      },
      {
        status: 400,
      },
    );
  }

  console.error(
    "PROFILE_EXPERIENCE_API_ERROR:",
    error,
  );

  return NextResponse.json(
    {
      success: false,
      message: fallbackMessage,
    },
    {
      status: 500,
    },
  );
}

export async function GET() {
  try {
    const authentication =
      await getAuthenticatedProfileId();

    if (authentication.error) {
      return authentication.error;
    }

    const experiences =
      await prisma.experience.findMany({
        where: {
          profileId: authentication.profileId,
        },
        orderBy: [
          {
            currentlyWorking: "desc",
          },
          {
            startDate: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      count: experiences.length,
      experiences,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to load experience records.",
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const authentication =
      await getAuthenticatedProfileId();

    if (authentication.error) {
      return authentication.error;
    }

    const body: unknown = await request.json();
    const data =
      experienceCreateSchema.parse(body);

    const duplicateExperience =
      await prisma.experience.findFirst({
        where: {
          profileId: authentication.profileId,

          company: {
            equals: data.company,
            mode: "insensitive",
          },

          position: {
            equals: data.position,
            mode: "insensitive",
          },

          startDate: data.startDate,
        },
        select: {
          id: true,
        },
      });

    if (duplicateExperience) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This experience record already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const experience =
      await prisma.experience.create({
        data: {
          profileId: authentication.profileId,
          company: data.company,
          companyLogo:
            data.companyLogo ?? null,
          position: data.position,
          employmentType:
            data.employmentType ?? null,
          industry: data.industry ?? null,
          location: data.location ?? null,
          country: data.country ?? null,
          startDate: data.startDate,
          endDate: data.currentlyWorking
            ? null
            : data.endDate ?? null,
          currentlyWorking:
            data.currentlyWorking,
          description:
            data.description ?? null,
          achievements:
            data.achievements ?? null,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Experience added successfully.",
        experience,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleError(
      error,
      "Failed to add experience.",
    );
  }
}

export async function PUT(
  request: NextRequest,
) {
  try {
    const authentication =
      await getAuthenticatedProfileId();

    if (authentication.error) {
      return authentication.error;
    }

    const body: unknown = await request.json();
    const data =
      experienceUpdateSchema.parse(body);

    const existingExperience =
      await prisma.experience.findFirst({
        where: {
          id: data.id,
          profileId: authentication.profileId,
        },
      });

    if (!existingExperience) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Experience record not found.",
        },
        {
          status: 404,
        },
      );
    }

    const currentlyWorking =
      data.currentlyWorking ??
      existingExperience.currentlyWorking;

    const startDate =
      data.startDate ??
      existingExperience.startDate;

    const endDate = currentlyWorking
      ? null
      : data.endDate !== undefined
        ? data.endDate
        : existingExperience.endDate;

    if (
      endDate &&
      endDate < startDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "End date cannot be before start date.",
        },
        {
          status: 400,
        },
      );
    }

    const experience =
      await prisma.experience.update({
        where: {
          id: data.id,
        },
        data: {
          ...(data.company !== undefined
            ? {
                company: data.company,
              }
            : {}),

          ...(data.companyLogo !== undefined
            ? {
                companyLogo:
                  data.companyLogo,
              }
            : {}),

          ...(data.position !== undefined
            ? {
                position: data.position,
              }
            : {}),

          ...(data.employmentType !==
          undefined
            ? {
                employmentType:
                  data.employmentType,
              }
            : {}),

          ...(data.industry !== undefined
            ? {
                industry: data.industry,
              }
            : {}),

          ...(data.location !== undefined
            ? {
                location: data.location,
              }
            : {}),

          ...(data.country !== undefined
            ? {
                country: data.country,
              }
            : {}),

          ...(data.startDate !== undefined
            ? {
                startDate: data.startDate,
              }
            : {}),

          endDate,

          ...(data.currentlyWorking !==
          undefined
            ? {
                currentlyWorking:
                  data.currentlyWorking,
              }
            : {}),

          ...(data.description !== undefined
            ? {
                description:
                  data.description,
              }
            : {}),

          ...(data.achievements !== undefined
            ? {
                achievements:
                  data.achievements,
              }
            : {}),
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Experience updated successfully.",
      experience,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to update experience.",
    );
  }
}

export async function DELETE(
  request: NextRequest,
) {
  try {
    const authentication =
      await getAuthenticatedProfileId();

    if (authentication.error) {
      return authentication.error;
    }

    const body: unknown = await request.json();
    const data =
      experienceDeleteSchema.parse(body);

    const experience =
      await prisma.experience.findFirst({
        where: {
          id: data.id,
          profileId: authentication.profileId,
        },
        select: {
          id: true,
        },
      });

    if (!experience) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Experience record not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.experience.delete({
      where: {
        id: experience.id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Experience deleted successfully.",
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to delete experience.",
    );
  }
}
