import CompanyCard from "@/components/company/CompanyCard";

type CompanyGridProps = {
  companies: any[];
};

export default function CompanyGrid({
  companies,
}: CompanyGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company.name}
          industry={company.industry}
          location={company.country}
          jobs={company._count?.jobs?.toString() ?? "0"}
        />
      ))}
    </div>
  );
}