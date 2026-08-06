import { getCompanies } from "@/services/company.service";

import CompaniesGrid from "@/components/companies/CompaniesGrid";
import CompanySearch from "@/components/companies/CompanySearch";
import CompanyFilters from "@/components/companies/CompanyFilters";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const { companies } = await getCompanies();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Companies
        </h1>

        <p className="mt-3 text-slate-600">
          Discover verified companies hiring across Asia.
        </p>
      </div>

      <CompanySearch />

      <div className="mt-8">
        <CompanyFilters />
      </div>

      <div className="mt-10">
        <CompaniesGrid companies={companies} />
      </div>
    </main>
  );
}