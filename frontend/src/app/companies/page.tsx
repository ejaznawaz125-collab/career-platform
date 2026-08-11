import { getCompanies } from "@/services/company.service";

import CompaniesGrid from "@/components/companies/CompaniesGrid";
import CompanySearch from "@/components/companies/CompanySearch";
import CompanyFilters from "@/components/companies/CompanyFilters";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { normalizeCompanyIndustryFilter } from "@/lib/company-industries";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ search?: string; industry?: string }> }) {
  const params = await searchParams;
  const industry = normalizeCompanyIndustryFilter(params.industry);
  const { companies } = await getCompanies({ search: params.search, industry });

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600"><Link href="/" className="font-semibold text-blue-700 hover:underline">Home</Link><span className="mx-2" aria-hidden="true">/</span><span aria-current="page">Companies</span></nav>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Companies
        </h1>

        <p className="mt-3 text-slate-600">
          Discover verified companies hiring across Asia.
        </p>
      </div>

      <CompanySearch defaultValue={params.search} industry={industry} />

      <div className="mt-8">
        <CompanyFilters selectedIndustry={industry} search={params.search} />
      </div>

      <div className="mt-10">
        <CompaniesGrid companies={companies} />
      </div>
      </div>
    </main>
  );
}
