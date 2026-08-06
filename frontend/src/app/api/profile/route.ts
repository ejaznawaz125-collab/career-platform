import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validators";

const PROFILE_RELATIONS = {
  skills: {
    orderBy: {
      name: "asc",
    },
  },
  educations: {
    orderBy: {
      endYear: "desc",
    },
  },
  experiences: {
    orderBy: {
      startDate: "desc",
    },
  },
  resumes: {
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  },
  languages: {
    orderBy: {
      language: "asc",
    },
  },
  portfolioProjects: {
    orderBy: [
      {
        featured: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  },
} satisfies Prisma.CandidateProfileInclude;

function getErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Please correct the invalid profile fields.",
        errors: error.flatten().fieldErrors,
      },
      {
        status: 400,
      },
    );
  }

  console.error("PROFILE_API_ERROR:", error);

  return NextResponse.json(
    {
      success: false,
      message: "Something went wrong while processing the profile.",
    },
    {
      status: 500,
    },
  );
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        candidateProfile: {
          include: PROFILE_RELATIONS,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      user,
      profile: user.candidateProfile,
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const body: unknown = await request.json();
    const data = profileSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        },
      );
    }

    const [updatedUser, profile] =
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            country: data.country,
            city: data.city,
            address: data.address,
            linkedinUrl: data.linkedinUrl,
            githubUrl: data.githubUrl,
            portfolioUrl: data.portfolioUrl,
          },
        }),

        prisma.candidateProfile.upsert({
          where: {
            userId: user.id,
          },
          update: {
            headline: data.headline,
            summary: data.summary,
            currentJobTitle:
              data.currentJobTitle,
            expectedSalary:
              data.expectedSalary,
            currentSalary:
              data.currentSalary,
            salaryCurrency:
              data.salaryCurrency,
            totalExperience:
              data.totalExperience,
            experienceLevel:
              data.experienceLevel,
            highestEducation:
              data.highestEducation,
            availableForWork:
              data.availableForWork,
            availableImmediately:
              data.availableImmediately,
            openToRemote:
              data.openToRemote,
            preferredCountry:
              data.preferredCountry,
            preferredCity:
              data.preferredCity,
            preferredJobType:
              data.preferredJobType,
            preferredWorkMode:
              data.preferredWorkMode,
            isPublic:
              data.isPublic,
          },
          create: {
            userId: user.id,
            headline: data.headline,
            summary: data.summary,
            currentJobTitle:
              data.currentJobTitle,
            expectedSalary:
              data.expectedSalary,
            currentSalary:
              data.currentSalary,
            salaryCurrency:
              data.salaryCurrency ?? "USD",
            totalExperience:
              data.totalExperience,
            experienceLevel:
              data.experienceLevel,
            highestEducation:
              data.highestEducation,
            availableForWork:
              data.availableForWork ?? true,
            availableImmediately:
              data.availableImmediately ?? false,
            openToRemote:
              data.openToRemote ?? true,
            preferredCountry:
              data.preferredCountry,
            preferredCity:
              data.preferredCity,
            preferredJobType:
              data.preferredJobType,
            preferredWorkMode:
              data.preferredWorkMode,
            isPublic:
              data.isPublic ?? true,
          },
          include: PROFILE_RELATIONS,
        }),
      ]);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
      profile,
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}