import SectionTitle from "@/components/ui/SectionTitle";
import RelatedJobCard from "./RelatedJobCard";

type RelatedJob = {
  id: string;
  slug: string;
  title: string;
  city: string;
  country: string;
  salary: string;
  company: {
    name: string;
    logo: string | null;
  };
};

type RelatedJobsProps = {
  jobs: RelatedJob[];
};

export default function RelatedJobs({
  jobs,
}: RelatedJobsProps) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">

      <SectionTitle
        title="Related Jobs"
        subtitle="Similar opportunities you may like"
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {jobs.map((job) => (
          <RelatedJobCard
            key={job.id}
            job={job}
          />
        ))}

      </div>

    </section>
  );
}