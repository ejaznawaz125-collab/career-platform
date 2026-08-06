import CompanyCard from "./CompanyCard";

import type { PublicCompany } from "@/services/company.service";

type CompaniesGridProps = {
  companies: PublicCompany[];
};

export default function CompaniesGrid({
  companies,
}: CompaniesGridProps) {
  if (companies.length === 0) {
    return (
      <div
        className="
          rounded-3xl
          border
          border-dashed
          border-slate-300
          bg-white
          px-8
          py-16
          text-center
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            text-slate-900
          "
        >
          No Companies Found
        </h2>

        <p
          className="
            mt-3
            text-slate-600
          "
        >
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        gap-6
        sm:grid-cols-2
        xl:grid-cols-3
      "
    >
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
        />
      ))}
    </div>
  );
}