import PremiumCard from "@/components/ui/PremiumCard";

import type { PublicCompany } from "@/services/company.service";

type CompanyStatsProps = {
  company: PublicCompany;
};

type CompanyStat = {
  label: string;
  value: string;
};

function getCompanyStats(
  company: PublicCompany,
): CompanyStat[] {
  return [
    {
      label: "Open jobs",
      value: company._count.jobs.toLocaleString(),
    },
    {
      label: "Employees",
      value:
        company.employeeCount !== null
          ? company.employeeCount.toLocaleString()
          : "Not listed",
    },
    {
      label: "Founded",
      value:
        company.foundedYear !== null
          ? String(company.foundedYear)
          : "Not listed",
    },
    {
      label: "Profile views",
      value: company.totalViews.toLocaleString(),
    },
  ];
}

export default function CompanyStats({
  company,
}: CompanyStatsProps) {
  const stats = getCompanyStats(company);

  return (
    <section
      aria-label={`${company.name} statistics`}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => (
        <PremiumCard key={stat.label} className="p-5">
          <p className="text-sm font-medium text-slate-500">
            {stat.label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {stat.value}
          </p>
        </PremiumCard>
      ))}
    </section>
  );
}