import Header from "@/components/layout/Header";
import JobsLayout from "@/components/jobs/JobsLayout";
import JobsSearch from "@/components/jobs/JobsSearch";
import JobsFilters from "@/components/jobs/JobsFilters";
import JobsGrid from "@/components/jobs/JobsGrid";
import JobsPagination from "@/components/jobs/JobsPagination";
import { getJobs } from "@/services/job.service";

type JobsPageSearchParams = {
  search?: string;
  country?: string;
  company?: string;
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

type JobsPageProps = {
  searchParams: Promise<JobsPageSearchParams>;
};

export default async function JobsPage({
  searchParams,
}: JobsPageProps) {
  const params = await searchParams;

  const currentPage = Number(params.page || "1");

  const result = await getJobs({
    ...params,
    page: currentPage,
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="mb-3 text-4xl font-bold text-slate-900">
          Find Your Dream Job
        </h1>

        <p className="mb-10 max-w-3xl text-lg text-slate-600">
          Browse thousands of verified jobs from trusted companies across Asia
          and the Middle East.
        </p>

        <JobsSearch />

        <div className="mt-10">
          <JobsLayout
            filters={<JobsFilters />}
            jobs={
              <>
                <JobsGrid searchParams={params} />

                <div className="mt-10">
                  <JobsPagination
                    currentPage={currentPage}
                    totalPages={result.totalPages}
                  />
                </div>
              </>
            }
          />
        </div>
      </section>
    </main>
  );
}