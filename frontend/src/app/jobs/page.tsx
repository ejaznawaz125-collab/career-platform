import Header from "@/components/layout/Header";
import JobsLayout from "@/components/jobs/JobsLayout";
import JobsSearch from "@/components/jobs/JobsSearch";
import JobsFilters from "@/components/jobs/JobsFilters";
import JobsGrid from "@/components/jobs/JobsGrid";
import JobsPagination from "@/components/jobs/JobsPagination";

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-7xl px-6 pt-16">
        <h1 className="mb-3 text-4xl font-bold text-slate-900">
          Find Your Dream Job
        </h1>

        <p className="mb-10 max-w-3xl text-lg text-slate-600">
          Browse thousands of verified jobs from trusted companies
          across Asia and the Middle East.
        </p>
      </section>

      <JobsSearch />

      <JobsLayout
        filters={<JobsFilters />}
        jobs={
          <>
            <JobsGrid />
            <JobsPagination />
          </>
        }
      />
    </main>
  );
}