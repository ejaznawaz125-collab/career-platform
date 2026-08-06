
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const CANDIDATE_PROFILE_SELECT = {
  id: true,
  userId: true,

  headline: true,
  summary: true,

  currentJobTitle: true,

  expectedSalary: true,
  salaryCurrency: true,

  totalExperience: true,

  profileViews: true,
  resumeScore: true,

  availableForWork: true,
  openToRemote: true,

  
  isPublic: true,

  preferredCountry: true,
  preferredCity: true,

  preferredJobType: true,
  preferredWorkMode: true,

  highestEducation: true,
  experienceLevel: true,

  createdAt: true,
  updatedAt: true,

  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      phone: true,
      image: true,
      country: true,
      city: true,
      address: true,
      linkedinUrl: true,
      githubUrl: true,
      portfolioUrl: true,
      isProfileComplete: true,
    },
  },

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
} satisfies Prisma.CandidateProfileSelect;

export type CandidateProfile =
  Prisma.CandidateProfileGetPayload<{
    select: typeof CANDIDATE_PROFILE_SELECT;
  }>;

export type CandidateProfileUpdateInput =
  Prisma.CandidateProfileUpdateInput;

  function normalize(value: string): string {
  return value.trim();
}

function hasValue(
  value: string | null | undefined,
) {
  return Boolean(value?.trim());
}
export async function getCandidateProfile(
  userId: string,
): Promise<CandidateProfile | null> {
  return prisma.candidateProfile.findUnique({
    where: {
      userId: normalize(userId),
    },
    select: CANDIDATE_PROFILE_SELECT,
  });
}

export async function createCandidateProfile(
  userId: string,
): Promise<CandidateProfile> {
  return prisma.candidateProfile.upsert({
    where: {
      userId: normalize(userId),
    },
    update: {},

    create: {
      user: {
        connect: {
          id: normalize(userId),
        },
      },
    },

    select: CANDIDATE_PROFILE_SELECT,
  });
}

export async function updateCandidateProfile(
  profileId: string,
  data: CandidateProfileUpdateInput,
): Promise<CandidateProfile> {
  return prisma.candidateProfile.update({
    where: {
      id: normalize(profileId),
    },

    data,

    select: CANDIDATE_PROFILE_SELECT,
  });
}

export async function getCandidateBySlug(
  slug: string,
): Promise<CandidateProfile | null> {
  return prisma.candidateProfile.findFirst({
    where: {
      slug: normalize(slug),
      isPublic: true,
    },

    select: CANDIDATE_PROFILE_SELECT,
  });
}

export async function incrementProfileViews(
  profileId: string,
) {
  return prisma.candidateProfile.update({
    where: {
      id: normalize(profileId),
    },

    data: {
      profileViews: {
        increment: 1,
      },
    },

    select: {
      profileViews: true,
    },
  });
}

export async function calculateProfileCompletion(
  profileId: string,
) {
  const profile =
    await prisma.candidateProfile.findUnique({
      where: {
        id: normalize(profileId),
      },

      include: {
        user: true,
        skills: true,
        educations: true,
        experiences: true,
        resumes: true,
        languages: true,
        portfolioProjects: true,
      },
    });

  if (!profile) {
    throw new Error(
      "Candidate profile not found.",
    );
  }

  let completed = 0;
  let total = 16;

  if (hasValue(profile.user.firstName)) completed++;
  if (hasValue(profile.user.lastName)) completed++;
  if (hasValue(profile.user.image)) completed++;
  if (hasValue(profile.user.phone)) completed++;
  if (hasValue(profile.user.country)) completed++;
  if (hasValue(profile.user.city)) completed++;

  if (hasValue(profile.headline)) completed++;
  if (hasValue(profile.summary)) completed++;
  if (hasValue(profile.currentJobTitle))
    completed++;

  if (profile.expectedSalary !== null) completed++;

if (profile.totalExperience !== null) completed++;

  if (profile.skills.length) completed++;

  if (profile.educations.length) completed++;

  if (profile.experiences.length) completed++;

 

  

  if (profile.resumes.length) completed++;

  if (profile.availableForWork)
    completed++;

  const percentage = Math.round(
    (completed / total) * 100,
  );

  return {
    completed,
    total,
    percentage,
    isComplete: percentage >= 100,
  };
}

export async function completeCandidateProfile(
  profileId: string,
) {
  const completion =
    await calculateProfileCompletion(
      profileId,
    );

  if (!completion.isComplete) {
    throw new Error(
      `Profile completion is ${completion.percentage}%`,
    );
  }

  const profile =
    await prisma.candidateProfile.update({
      where: {
        id: normalize(profileId),
      },

      data: {
        user: {
          update: {
            isProfileComplete: true,
          },
        },
      },

      select: CANDIDATE_PROFILE_SELECT,
    });

  return profile;
}