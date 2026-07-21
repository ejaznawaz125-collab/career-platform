import { prisma } from "@/lib/prisma";

export async function getCompanies() {
  return prisma.company.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      _count: {
        select: {
          jobs: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCompanyBySlug(slug: string) {
  return prisma.company.findUnique({
    where: {
      slug,
    },
    include: {
      jobs: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          jobs: true,
        },
      },
    },
  });
}