import { prisma } from "@/lib/prisma";

export async function getSavedJobs(userId: string) {
  return prisma.savedJob.findMany({
    where: {
      userId,
    },

    include: {
      job: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              city: true,
              country: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}