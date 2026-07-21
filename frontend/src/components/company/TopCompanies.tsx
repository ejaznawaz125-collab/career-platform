import Container from "@/components/common/Container";
import SectionTitle from "@/components/common/SectionTitle";
import CompanyCard from "./CompanyCard";

export default function TopCompanies() {

  const companies = [
    {
      company: "Nestlé",
      industry: "Food & Beverage",
      location: "Pakistan",
      jobs: "42",
    },
    {
      company: "Unilever",
      industry: "Consumer Goods",
      location: "UAE",
      jobs: "18",
    },
    {
      company: "DHL",
      industry: "Logistics",
      location: "Saudi Arabia",
      jobs: "26",
    },
    {
      company: "Maersk",
      industry: "Shipping",
      location: "Singapore",
      jobs: "14",
    },
  ];

  return (
    <section className="py-24">

      <Container>

        <SectionTitle
          title="Top Companies"
          subtitle="Discover trusted employers hiring across Asia and the Middle East."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {companies.map((company) => (
            <CompanyCard
              key={company.company}
              company={company.company}
              industry={company.industry}
              location={company.location}
              jobs={company.jobs}
            />
          ))}

        </div>

      </Container>

    </section>
  );
}