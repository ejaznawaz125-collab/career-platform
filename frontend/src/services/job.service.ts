import {
  ExperienceLevel,
  JobType,
  Prisma,
  WorkMode,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type JobWithRelations =
  Prisma.JobGetPayload<{
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

export type GetJobsOptions = {
  search?: string;
  company?: string;
  companyId?: string;
  category?: string;
  categoryId?: string;
  country?: string;
  city?: string;
  jobType?: JobType | string;
  workMode?: WorkMode | string;
  experienceLevel?: ExperienceLevel | string;
  featured?: boolean | string;
  urgent?: boolean | string;
  salaryMin?: number | string;
  salaryMax?: number | string;
  page?: number | string;
  limit?: number | string;
};

const JOB_TYPES = new Set<string>(
  Object.values(JobType),
);

const WORK_MODES = new Set<string>(
  Object.values(WorkMode),
);

const EXPERIENCE_LEVELS = new Set<string>(
  Object.values(ExperienceLevel),
);

function normalizeText(
  value: string | undefined,
): string | undefined {
  const normalizedValue = value?.trim();

  return normalizedValue || undefined;
}

function normalizePositiveInteger(
  value: number | string | undefined,
): number | undefined {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const parsedValue =
    typeof value === "number"
      ? value
      : Number(value.trim());

  if (
    !Number.isSafeInteger(parsedValue) ||
    parsedValue < 0
  ) {
    return undefined;
  }

  return parsedValue;
}

function normalizePageValue(
  value: number | string | undefined,
  fallback: number,
): number {
  const parsedValue = normalizePositiveInteger(value);

  if (
    parsedValue === undefined ||
    parsedValue < 1
  ) {
    return fallback;
  }

  return parsedValue;
}

function normalizeBoolean(
  value: boolean | string | undefined,
): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function normalizeJobType(
  value: JobType | string | undefined,
): JobType | undefined {
  if (
    typeof value === "string" &&
    JOB_TYPES.has(value)
  ) {
    return value as JobType;
  }

  return undefined;
}

function normalizeWorkMode(
  value: WorkMode | string | undefined,
): WorkMode | undefined {
  if (
    typeof value === "string" &&
    WORK_MODES.has(value)
  ) {
    return value as WorkMode;
  }

  return undefined;
}

function normalizeExperienceLevel(
  value: ExperienceLevel | string | undefined,
): ExperienceLevel | undefined {
  if (
    typeof value === "string" &&
    EXPERIENCE_LEVELS.has(value)
  ) {
    return value as ExperienceLevel;
  }

  return undefined;
}

export async function getJobs(
  options: GetJobsOptions = {},
) {
  const search = normalizeText(options.search);
  const company = normalizeText(options.company);
  const companyId = normalizeText(options.companyId);
  const category = normalizeText(options.category);
  const categoryId = normalizeText(options.categoryId);
  const country = normalizeText(options.country);
  const city = normalizeText(options.city);

  const jobType = normalizeJobType(options.jobType);
  const workMode = normalizeWorkMode(options.workMode);
  const experienceLevel =
    normalizeExperienceLevel(
      options.experienceLevel,
    );

  const featured = normalizeBoolean(options.featured);
  const urgent = normalizeBoolean(options.urgent);

  const salaryMin = normalizePositiveInteger(
    options.salaryMin,
  );
  const salaryMax = normalizePositiveInteger(
    options.salaryMax,
  );

  const page = normalizePageValue(options.page, 1);
  const limit = Math.min(
    normalizePageValue(options.limit, 12),
    100,
  );

  const andFilters: Prisma.JobWhereInput[] = [];

  if (search) {
    andFilters.push({
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (company) {
    andFilters.push({
      company: {
        is: {
          name: {
            contains: company,
            mode: "insensitive",
          },
        },
      },
    });
  }

  if (companyId) {
    andFilters.push({
      companyId,
    });
  }

  if (category) {
    andFilters.push({
      category: {
        is: {
          OR: [
            {
              name: {
                contains: category,
                mode: "insensitive",
              },
            },
            {
              slug: {
                equals: category,
                mode: "insensitive",
              },
            },
          ],
        },
      },
    });
  }

  if (categoryId) {
    andFilters.push({
      categoryId,
    });
  }

  if (country) {
    andFilters.push({
      country: {
        contains: country,
        mode: "insensitive",
      },
    });
  }

  if (city) {
    andFilters.push({
      city: {
        contains: city,
        mode: "insensitive",
      },
    });
  }

  if (jobType) {
    andFilters.push({
      jobType,
    });
  }

  if (workMode) {
    andFilters.push({
      workMode,
    });
  }

  if (experienceLevel) {
    andFilters.push({
      experienceLevel,
    });
  }

  if (featured !== undefined) {
    andFilters.push({
      featured,
    });
  }

  if (urgent !== undefined) {
    andFilters.push({
      urgent,
    });
  }

  if (
    salaryMin !== undefined ||
    salaryMax !== undefined
  ) {
    const salaryFilters: Prisma.JobWhereInput[] = [];

    if (salaryMin !== undefined) {
      salaryFilters.push({
        salaryMax: {
          gte: salaryMin,
        },
      });
    }

    if (salaryMax !== undefined) {
      salaryFilters.push({
        salaryMin: {
          lte: salaryMax,
        },
      });
    }

    andFilters.push({
      AND: salaryFilters,
    });
  }

  const where: Prisma.JobWhereInput = {
    status: "PUBLISHED",
    ...(andFilters.length > 0
      ? { AND: andFilters }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [jobs, total] = await prisma.$transaction([
  prisma.job.findMany({
    where,
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
    skip,
    take: limit,
  }),
  prisma.job.count({
    where,
  }),
]);

if (jobs.length > 0) {
 
}

return {
  jobs,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
};
}

export async function getJobBySlug(
  slug: string,
) {
  return prisma.job.findUnique({
    where: {
      slug,
      status: "PUBLISHED",
    },
    include: {
      company: true,
      category: true,
    },
  });
}
export async function getRelatedJobs(
  jobId: string,
  categoryId: string,
  limit = 6,
) {
  return prisma.job.findMany({
    where: {
      id: {
        not: jobId,
      },

      categoryId,

      status: "PUBLISHED",
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

    take: limit,
  });
}
