import PremiumCard from "@/components/ui/PremiumCard";
import SectionTitle from "@/components/ui/SectionTitle";

import type { PublicCompany } from "@/services/company.service";

type CompanyOverviewProps = {
  company: PublicCompany;
};

type OverviewItem = {
  label: string;
  value: string;
};

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        `${word.charAt(0).toUpperCase()}${word.slice(1)}`,
    )
    .join(" ");
}

function getCompanyLocation(company: PublicCompany): string | null {
  const location = [company.city, company.country]
    .filter((value): value is string => Boolean(value))
    .join(", ");

  return location || null;
}

function getOverviewItems(
  company: PublicCompany,
): OverviewItem[] {
  const location = getCompanyLocation(company);

  const items: Array<OverviewItem | null> = [
    company.industry
      ? {
          label: "Industry",
          value: company.industry,
        }
      : null,
    {
      label: "Company size",
      value: formatEnumLabel(company.companySize),
    },
    company.employeeCount !== null
      ? {
          label: "Employees",
          value: company.employeeCount.toLocaleString(),
        }
      : null,
    company.foundedYear !== null
      ? {
          label: "Founded",
          value: String(company.foundedYear),
        }
      : null,
    location
      ? {
          label: "Headquarters",
          value: location,
        }
      : null,
  ];

  return items.filter(
    (item): item is OverviewItem => item !== null,
  );
}

export default function CompanyOverview({
  company,
}: CompanyOverviewProps) {
  const items = getOverviewItems(company);

  return (
    <PremiumCard>
      <SectionTitle title="Company overview" />

      <div className="my-6 h-px bg-slate-200" />

      <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-sm font-medium text-slate-500">
              {item.label}
            </dt>

            <dd className="mt-1 text-base font-semibold text-slate-900">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </PremiumCard>
  );
}