import Container from "@/components/common/Container";
import StatsCard from "./StatsCard";
import { JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default async function StatsSection() {
  const [jobs, companies, professionals] = await Promise.all([
    prisma.job.count({ where: { status: JobStatus.PUBLISHED } }),
    prisma.company.count({ where: { status: "ACTIVE" } }),
    prisma.candidateProfile.count(),
  ]);
  const stats = [
    {
      number: jobs.toLocaleString(),
      label: "Published Jobs",
    },
    {
      number: companies.toLocaleString(),
      label: "Active Companies",
    },
    {
      number: professionals.toLocaleString(),
      label: "Candidate Profiles",
    },
  ];

  return (
    <section className="py-20 bg-slate-50">

      <Container>

        <div className="grid gap-6 md:grid-cols-3">

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
