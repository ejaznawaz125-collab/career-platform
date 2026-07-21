import { getJobs, type JobWithRelations } from "@/services/job.service";
import Container from "@/components/common/Container";
import SectionTitle from "@/components/common/SectionTitle";
import JobCard from "@/components/common/JobCard";

export default async function FeaturedJobs() {
  const jobs = await getJobs();

  return (
    <section className="py-20">
      <Container>
        <SectionTitle
          title="Featured Jobs"
          subtitle="Explore hand-picked opportunities from trusted companies."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {jobs.slice(0, 8).map((job: JobWithRelations) => (
            <JobCard
              key={job.id}
              title={job.title}
              company={job.company.name}
              location={`${job.company.city ?? ""}${
                job.company.city && job.company.country ? ", " : ""
              }${job.company.country ?? ""}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}