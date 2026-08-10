import Container from "@/components/common/Container";
import SectionTitle from "@/components/common/SectionTitle";
import CompanyCard from "@/components/companies/CompanyCard";
import { getCompanies } from "@/services/company.service";

export default async function TopCompanies() {
  const { companies } = await getCompanies({ limit: 4 });

  if (companies.length === 0) return null;

  return (
    <section className="py-24">
      <Container>
        <SectionTitle
          title="Top Companies"
          subtitle="Discover active employers and their published opportunities."
        />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </Container>
    </section>
  );
}
