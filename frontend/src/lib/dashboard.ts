import { prisma } from "@/lib/prisma";

export async function getDashboardStats(userId: string) {
  const [
    appliedJobs,
    savedJobs,
    profile,
    messages,
  ] = await Promise.all([
    prisma.application.count({
      where: {
        userId,
      },
    }),

    prisma.savedJob.count({
      where: {
        userId,
      },
    }),

    prisma.candidateProfile.findUnique({
      where: {
        userId,
      },
      select: {
        profileViews: true,
      },
    }),

    prisma.message.count({
      where: {
        senderId: userId,
      },
    }),
  ]);

  return {
    appliedJobs,
    savedJobs,
    profileViews: profile?.profileViews ?? 0,
    messages,
  };
}

export async function getRecentApplications(userId: string) {
  return prisma.application.findMany({
    where: {
      userId,
    },

    orderBy: {
      appliedAt: "desc",
    },

    take: 5,

    include: {
      job: {
        include: {
          company: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}