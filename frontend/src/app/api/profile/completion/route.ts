import {
  NextResponse,
} from "next/server";

import { getAuthenticatedCandidateOwner } from "@/lib/candidate-server";
import { prisma } from "@/lib/prisma";

function hasText(
  value: string | null | undefined,
): boolean {
  return Boolean(
    value?.trim(),
  );
}

export async function GET() {
  try {
    const owner = await getAuthenticatedCandidateOwner();

    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const profile =
      await prisma.candidateProfile.findUnique({
        where: {
          id: owner.profileId,
        },
        select: {
          id: true,
          userId: true,

          headline: true,
          summary: true,
          currentJobTitle: true,

          experienceLevel: true,
          totalExperience: true,
          highestEducation: true,

          user: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
              phone: true,
              image: true,
              country: true,
              city: true,
              address: true,
              linkedinUrl: true,
            },
          },

          _count: {
            select: {
              skills: true,
              educations: true,
              experiences: true,
              resumes: true,
              languages: true,
              portfolioProjects: true,
            },
          },
        },
      });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Candidate profile not found.",
        },
        {
          status: 404,
        },
      );
    }

    const checks = {
      firstName:
        hasText(
          profile.user.firstName,
        ),

      lastName:
        hasText(
          profile.user.lastName,
        ),

      username:
        hasText(
          profile.user.username,
        ),

      phone:
        hasText(
          profile.user.phone,
        ),

      image:
        hasText(
          profile.user.image,
        ),

      location:
        hasText(
          profile.user.country,
        ) ||
        hasText(
          profile.user.city,
        ),

      address:
        hasText(
          profile.user.address,
        ),

      linkedin:
        hasText(
          profile.user.linkedinUrl,
        ),

      headline:
        hasText(
          profile.headline,
        ),

      summary:
        hasText(
          profile.summary,
        ),

      currentJobTitle:
        hasText(
          profile.currentJobTitle,
        ),

      experienceLevel:
        profile.experienceLevel !==
        null,

      totalExperience:
        profile.totalExperience !==
        null,

      highestEducation:
        hasText(
          profile.highestEducation,
        ),

      skills:
        profile._count.skills > 0,

      education:
        profile._count.educations > 0,

      experience:
        profile._count.experiences > 0,

      languages:
        profile._count.languages > 0,

      resume:
        profile._count.resumes > 0,

      portfolio:
        profile._count
          .portfolioProjects > 0,
    };

    const entries =
      Object.entries(checks);

    const completedFields =
      entries.filter(
        ([, completed]) =>
          completed,
      ).length;

    const totalFields =
      entries.length;

    const percentage =
      Math.round(
        (completedFields /
          totalFields) *
          100,
      );

    const isComplete =
      percentage === 100;

    await prisma.$transaction([
      prisma.candidateProfile.update({
        where: {
          id:
            profile.id,
        },
        data: {
          completionPercentage:
            percentage,
        },
      }),

      prisma.user.update({
        where: {
          id:
            profile.userId,
        },
        data: {
          isProfileComplete:
            isComplete,
        },
      }),
    ]);

    const missingFields =
      entries
        .filter(
          ([, completed]) =>
            !completed,
        )
        .map(
          ([field]) =>
            field,
        );

    return NextResponse.json({
      success: true,
      completion: {
        percentage,
        completedFields,
        totalFields,
        isComplete,
        missingFields,
      },
    });
  } catch (error) {
    console.error(
      "PROFILE_COMPLETION_API_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to calculate profile completion.",
      },
      {
        status: 500,
      },
    );
  }
}
