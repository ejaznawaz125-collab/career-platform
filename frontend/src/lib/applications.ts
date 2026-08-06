import { prisma } from "@/lib/prisma";

export async function getUserApplications(userId: string) {
  return prisma.application.findMany({
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
      appliedAt: "desc",
    },
  });
}