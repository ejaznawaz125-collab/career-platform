import Link from "next/link";

import { COMPANY_INDUSTRY_FILTERS, type CompanyIndustryFilter } from "@/lib/company-industries";

function companyFilterHref(search: string | undefined, industry?: CompanyIndustryFilter): string {
  const params = new URLSearchParams();
  const normalizedSearch = search?.trim();
  if (normalizedSearch) params.set("search", normalizedSearch);
  if (industry) params.set("industry", industry);
  const query = params.toString();
  return query ? `/companies?${query}` : "/companies";
}

export default function CompanyFilters({ selectedIndustry, search }: { selectedIndustry?: CompanyIndustryFilter; search?: string }) {
  return (
    <nav aria-label="Filter companies by industry" className="flex flex-wrap gap-3">
      {[undefined, ...COMPANY_INDUSTRY_FILTERS].map((industry) => {
        const active = industry === selectedIndustry;
        const label = industry ?? "All Industries";
        return <Link
          key={label}
          href={companyFilterHref(search, industry)}
          aria-current={active ? "page" : undefined}
          className={`rounded-full border px-5 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-blue-100 ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"}`}
        >
          {label}
        </Link>;
      })}
    </nav>
  );
}
