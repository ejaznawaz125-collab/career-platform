import Container from "@/components/common/Container";
import StatsCard from "./StatsCard";

export default function StatsSection() {
  const stats = [
    {
      number: "25,000+",
      label: "Verified Jobs",
    },
    {
      number: "8,500+",
      label: "Companies",
    },
    {
      number: "1.2M+",
      label: "Professionals",
    },
    {
      number: "98%",
      label: "Success Rate",
    },
  ];

  return (
    <section className="py-20 bg-slate-50">

      <Container>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {stats.map((item) => (
            <StatsCard
              key={item.label}
              number={item.number}
              label={item.label}
            />
          ))}

        </div>

      </Container>

    </section>
  );
}