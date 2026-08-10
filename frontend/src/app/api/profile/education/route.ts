import {
  EducationLevel,
} from "@prisma/client";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  z,
  ZodError,
} from "zod";

import { getAuthenticatedCandidateOwner } from "@/lib/candidate-server";
import { prisma } from "@/lib/prisma";

const currentYear =
  new Date().getFullYear();

const optionalText = (
  maximumLength: number,
) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const normalizedValue =
        value.trim();

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

const optionalYear = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }

    return typeof value === "string"
      ? Number(value)
      : value;
  },
  z
    .number()
    .int("Year must be a whole number.")
    .min(1900, "Year cannot be before 1900.")
    .max(
      currentYear + 10,
      `Year cannot exceed ${
        currentYear + 10
      }.`,
    )
    .nullable()
    .optional(),
);

const educationCreateSchema = z
  .object({
    institute: z
      .string()
      .trim()
      .min(
        2,
        "Institute name is required.",
      )
      .max(
        200,
        "Institute name cannot exceed 200 characters.",
      ),

    degree: z
      .string()
      .trim()
      .min(
        2,
        "Degree name is required.",
      )
      .max(
        200,
        "Degree name cannot exceed 200 characters.",
      ),

    fieldOfStudy:
      optionalText(200),

    educationLevel:
      z.nativeEnum(EducationLevel),

    country:
      optionalText(100),

    city:
      optionalText(100),

    startYear: optionalYear,

    endYear: optionalYear,

    currentlyStudying:
      z.boolean().default(false),

    grade:
      optionalText(100),

    description:
      optionalText(3000),
  })
  .superRefine((data, context) => {
    if (
      data.startYear !== null &&
      data.startYear !== undefined &&
      data.endYear !== null &&
      data.endYear !== undefined &&
      data.endYear < data.startYear
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endYear"],
        message:
          "End year cannot be before start year.",
      });
    }

    if (
      data.currentlyStudying &&
      data.endYear !== null &&
      data.endYear !== undefined
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endYear"],
        message:
          "Remove the end year when currently studying.",
      });
    }
  });

const educationUpdateSchema = z.object({
  id: z
    .string()
    .trim()
    .min(
      1,
      "Education ID is required.",
    ),

  institute: z
    .string()
    .trim()
    .min(
      2,
      "Institute name is required.",
    )
    .max(
      200,
      "Institute name cannot exceed 200 characters.",
    )
    .optional(),

  degree: z
    .string()
    .trim()
    .min(
      2,
      "Degree name is required.",
    )
    .max(
      200,
      "Degree name cannot exceed 200 characters.",
    )
    .optional(),

  fieldOfStudy:
    optionalText(200),

  educationLevel:
    z.nativeEnum(EducationLevel).optional(),

  country:
    optionalText(100),

  city:
    optionalText(100),

  startYear:
    optionalYear,

  endYear:
    optionalYear,

  currentlyStudying:
    z.boolean().optional(),

  grade:
    optionalText(100),

  description:
    optionalText(3000),
});

const educationDeleteSchema =
  z.object({
    id: z
      .string()
      .trim()
      .min(
        1,
        "Education ID is required.",
      ),
  });

async function getAuthenticatedProfileId() {
  const owner = await getAuthenticatedCandidateOwner();
  if (owner) return { profileId: owner.profileId };

  return {
    error: NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    ),
  };
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
        errors:
          error.flatten().fieldErrors,
      },
      {
        status: 400,
      },
    );
  }

  console.error(
    "PROFILE_EDUCATION_API_ERROR:",
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

    const educations =
      await prisma.education.findMany({
        where: {
          profileId:
            authentication.profileId,
        },
        orderBy: [
          {
            currentlyStudying:
              "desc",
          },
          {
            endYear: "desc",
          },
          {
            startYear: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      count: educations.length,
      educations,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to load education records.",
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

    const body: unknown =
      await request.json();

    const data =
      educationCreateSchema.parse(
        body,
      );

    const duplicateEducation =
      await prisma.education.findFirst({
        where: {
          profileId:
            authentication.profileId,

          institute: {
            equals: data.institute,
            mode: "insensitive",
          },

          degree: {
            equals: data.degree,
            mode: "insensitive",
          },

          startYear:
            data.startYear ?? null,
        },
        select: {
          id: true,
        },
      });

    if (duplicateEducation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This education record already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const education =
      await prisma.education.create({
        data: {
          profileId:
            authentication.profileId,

          institute:
            data.institute,

          degree:
            data.degree,

          fieldOfStudy:
            data.fieldOfStudy ?? null,

          educationLevel:
            data.educationLevel,

          country:
            data.country ?? null,

          city:
            data.city ?? null,

          startYear:
            data.startYear ?? null,

          endYear:
            data.currentlyStudying
              ? null
              : data.endYear ?? null,

          currentlyStudying:
            data.currentlyStudying,

          grade:
            data.grade ?? null,

          description:
            data.description ?? null,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Education added successfully.",
        education,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleError(
      error,
      "Failed to add education.",
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

    const body: unknown =
      await request.json();

    const data =
      educationUpdateSchema.parse(
        body,
      );

    const existingEducation =
      await prisma.education.findFirst({
        where: {
          id: data.id,

          profileId:
            authentication.profileId,
        },
      });

    if (!existingEducation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Education record not found.",
        },
        {
          status: 404,
        },
      );
    }

    const currentlyStudying =
      data.currentlyStudying ??
      existingEducation.currentlyStudying;

    const startYear =
      data.startYear !== undefined
        ? data.startYear
        : existingEducation.startYear;

    const endYear =
      currentlyStudying
        ? null
        : data.endYear !== undefined
          ? data.endYear
          : existingEducation.endYear;

    if (
      startYear !== null &&
      endYear !== null &&
      endYear < startYear
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "End year cannot be before start year.",
        },
        {
          status: 400,
        },
      );
    }

    const education =
      await prisma.education.update({
        where: {
          id: data.id,
        },
        data: {
          ...(data.institute !==
          undefined
            ? {
                institute:
                  data.institute,
              }
            : {}),

          ...(data.degree !== undefined
            ? {
                degree: data.degree,
              }
            : {}),

          ...(data.fieldOfStudy !==
          undefined
            ? {
                fieldOfStudy:
                  data.fieldOfStudy,
              }
            : {}),

          ...(data.educationLevel !==
          undefined
            ? {
                educationLevel:
                  data.educationLevel,
              }
            : {}),

          ...(data.country !== undefined
            ? {
                country: data.country,
              }
            : {}),

          ...(data.city !== undefined
            ? {
                city: data.city,
              }
            : {}),

          ...(data.startYear !==
          undefined
            ? {
                startYear:
                  data.startYear,
              }
            : {}),

          endYear,

          ...(data.currentlyStudying !==
          undefined
            ? {
                currentlyStudying:
                  data.currentlyStudying,
              }
            : {}),

          ...(data.grade !== undefined
            ? {
                grade: data.grade,
              }
            : {}),

          ...(data.description !==
          undefined
            ? {
                description:
                  data.description,
              }
            : {}),
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Education updated successfully.",
      education,
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to update education.",
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

    const body: unknown =
      await request.json();

    const data =
      educationDeleteSchema.parse(
        body,
      );

    const education =
      await prisma.education.findFirst({
        where: {
          id: data.id,

          profileId:
            authentication.profileId,
        },
        select: {
          id: true,
        },
      });

    if (!education) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Education record not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.education.delete({
      where: {
        id: education.id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Education deleted successfully.",
    });
  } catch (error) {
    return handleError(
      error,
      "Failed to delete education.",
    );
  }
}
