export const COMPANY_INDUSTRY_FILTERS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Logistics",
] as const;

export type CompanyIndustryFilter = (typeof COMPANY_INDUSTRY_FILTERS)[number];

const DATABASE_INDUSTRY_BY_FILTER: Record<CompanyIndustryFilter, string> = {
  Technology: "Information Technology",
  Finance: "Finance",
  Healthcare: "Healthcare",
  Education: "Education",
  Retail: "Retail",
  Manufacturing: "Manufacturing",
  Logistics: "Logistics",
};

export function normalizeCompanyIndustryFilter(value: string | undefined): CompanyIndustryFilter | undefined {
  const normalized = value?.trim().toLocaleLowerCase();
  return COMPANY_INDUSTRY_FILTERS.find((industry) => industry.toLocaleLowerCase() === normalized);
}

export function getDatabaseIndustry(filter: CompanyIndustryFilter): string {
  return DATABASE_INDUSTRY_BY_FILTER[filter];
}
