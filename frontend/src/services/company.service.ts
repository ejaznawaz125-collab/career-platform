import { CompanyStatus, JobStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getDatabaseIndustry, type CompanyIndustryFilter } from "@/lib/company-industries";
import { getJobs } from "@/services/job.service";

const COMPANY_PUBLIC_SELECT = {
  id: true,
  name: true,
  slug: true,
  logo: true,
  coverImage: true,
  coverImageAlt: true,
  tagline: true,
  description: true,
  website: true,
  email: true,
  phone: true,
  industry: true,
  companySize: true,
  foundedYear: true,
  employeeCount: true,
  country: true,
  city: true,
  address: true,
  linkedinUrl: true,
  facebookUrl: true,
  instagramUrl: true,
  twitterUrl: true,
  verified: true,
  status: true,
  totalViews: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      jobs: {
        where: {
          status: JobStatus.PUBLISHED,
        },
      },
    },
  },
} satisfies Prisma.CompanySelect;

export type PublicCompany = Prisma.CompanyGetPayload<{
  select: typeof COMPANY_PUBLIC_SELECT;
}>;

export type GetCompanyJobsOptions = {
  page?: number;
  limit?: number;
};

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number,
): number {
  if (!Number.isSafeInteger(value) || (value ?? 0) < 1) {
    return fallback;
  }

  return value as number;
}

export async function getCompanyBySlug(
  slug: string,
): Promise<PublicCompany | null> {
  const normalizedSlug = normalizeSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  return prisma.company.findFirst({
    where: {
      slug: normalizedSlug,
      status: CompanyStatus.ACTIVE,
    },
    select: COMPANY_PUBLIC_SELECT,
  });
}

export async function getCompanyJobs(
  companyId: string,
  options: GetCompanyJobsOptions = {},
) {
  const normalizedCompanyId = companyId.trim();

  if (!normalizedCompanyId) {
    return {
      jobs: [],
      total: 0,
      page: 1,
      limit: 6,
      totalPages: 0,
    };
  }

  const page = normalizePositiveInteger(options.page, 1);
  const limit = Math.min(
    normalizePositiveInteger(options.limit, 6),
    24,
  );

  return getJobs({
    companyId: normalizedCompanyId,
    page,
    limit,
  });
}
export type GetCompaniesOptions = {
  search?: string;
  industry?: CompanyIndustryFilter;
  page?: number;
  limit?: number;
};

export async function getCompanies(
  options: GetCompaniesOptions = {},
) {
  const search = options.search?.trim();
  const industry = options.industry ? getDatabaseIndustry(options.industry) : undefined;

  const page = normalizePositiveInteger(
    options.page,
    1,
  );

  const limit = Math.min(
    normalizePositiveInteger(
      options.limit,
      12,
    ),
    100,
  );

  const skip = (page - 1) * limit;

  const where: Prisma.CompanyWhereInput = {
    status: CompanyStatus.ACTIVE,

    ...(industry
      ? {
          industry: {
            equals: industry,
            mode: "insensitive",
          },
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              industry: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              city: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              country: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [companies, total] =
    await prisma.$transaction([
      prisma.company.findMany({
        where,
        select: COMPANY_PUBLIC_SELECT,
        orderBy: [
          {
            verified: "desc",
          },
          {
            totalViews: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        skip,
        take: limit,
      }),

      prisma.company.count({
        where,
      }),
    ]);

  return {
    companies,
    total,
    page,
    limit,
    totalPages: Math.ceil(
      total / limit,
    ),
  };
}
