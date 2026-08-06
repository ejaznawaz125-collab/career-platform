import JobCard from "@/components/common/JobCard";
import { getJobs } from "@/services/job.service";

type JobsGridProps = {
  searchParams: {
    search?: string;
    company?: string;
    country?: string;

    category?: string;
    jobType?: string;
    workMode?: string;
    experienceLevel?: string;

    featured?: string;
    urgent?: string;

    salaryMin?: string;
    salaryMax?: string;

    page?: string;
  };
};

export default async function JobsGrid({
  searchParams,
}: JobsGridProps) {
  const result = await getJobs({
    search: searchParams.search,
    company: searchParams.company,
    country: searchParams.country,

    category: searchParams.category,
    jobType: searchParams.jobType,
    workMode: searchParams.workMode,
    experienceLevel: searchParams.experienceLevel,

    featured: searchParams.featured,
    urgent: searchParams.urgent,

    salaryMin: searchParams.salaryMin,
    salaryMax: searchParams.salaryMax,

    page: searchParams.page,
  });
console.log("GRID =", result.jobs.length);
  if (result.jobs.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">
          No Jobs Available
        </h2>

        <p className="mt-3 text-slate-600">
          There are currently no published jobs matching your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {result.jobs.map((job) => (
        <JobCard
          key={job.id}
          title={job.title}
          company={job.company.name}
          location={`${job.city}, ${job.country}`}
          slug={job.slug}
        />
      ))}
    </div>
  );
}