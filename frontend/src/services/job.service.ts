import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type JobWithRelations = Prisma.JobGetPayload<{
  include: {
    company: {
      select: {
        id: true;
        name: true;
        slug: true;
        logo: true;
        city: true;
        country: true;
        verified: true;
      };
    };
    category: {
      select: {
        id: true;
        name: true;
        slug: true;
      };
    };
  };
}>;

export async function getJobs(): Promise<JobWithRelations[]> {
  return prisma.job.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          city: true,
          country: true,
          verified: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getJobBySlug(slug: string) {
  return prisma.job.findUnique({
    where: {
      slug,
    },
    include: {
      company: true,
      category: true,
    },
  });
}