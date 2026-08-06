import Link from "next/link";

import Badge from "@/components/ui/Badge";
import PremiumCard from "@/components/ui/PremiumCard";
import SectionTitle from "@/components/ui/SectionTitle";

import type { PublicCompany } from "@/services/company.service";
import type { JobWithRelations } from "@/services/job.service";

type CompanyOpenJobsProps = {
  company: PublicCompany;
  jobs: JobWithRelations[];
  total: number;
};

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        `${word.charAt(0).toUpperCase()}${word.slice(1)}`,
    )
    .join(" ");
}

function getJobLocation(job: JobWithRelations): string {
  return [job.city, job.country]
    .filter((value): value is string => Boolean(value))
    .join(", ");
}

function formatSalary(job: JobWithRelations): string | null {
  if (
    job.salaryMin === null &&
    job.salaryMax === null
  ) {
    return null;
  }

  const currency = job.salaryCurrency;

  if (
    job.salaryMin !== null &&
    job.salaryMax !== null
  ) {
    return `${currency} ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`;
  }

  if (job.salaryMin !== null) {
    return `From ${currency} ${job.salaryMin.toLocaleString()}`;
  }

  return `Up to ${currency} ${job.salaryMax?.toLocaleString()}`;
}

export default function CompanyOpenJobs({
  company,
  jobs,
  total,
}: CompanyOpenJobsProps) {
  return (
    <section aria-labelledby="company-open-jobs-title">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div id="company-open-jobs-title">
            <SectionTitle title="Open jobs" />
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {total.toLocaleString()}{" "}
            {total === 1 ? "position" : "positions"} currently
            available at {company.name}
          </p>
        </div>

        {total > jobs.length ? (
          <Link
            href={`/jobs?company=${encodeURIComponent(company.name)}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            View all jobs
          </Link>
        ) : null}
      </div>

      {jobs.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {jobs.map((job) => {
            const location = getJobLocation(job);
            const salary = formatSalary(job);

            return (
              <PremiumCard
                key={job.id}
                className="flex h-full flex-col"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="text-lg font-bold leading-7 text-slate-950 transition hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                    >
                      {job.title}
                    </Link>

                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {job.company.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.featured ? (
                      <Badge
                        text="Featured"
                        variant="primary"
                      />
                    ) : null}

                    {job.urgent ? (
                      <Badge
                        text="Urgent"
                        variant="danger"
                      />
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {formatEnumLabel(job.jobType)}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {formatEnumLabel(job.workMode)}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {formatEnumLabel(job.experienceLevel)}
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p>{location}</p>

                  {salary ? <p>{salary}</p> : null}

                  <p>{job.category.name}</p>
                </div>

                <div className="mt-auto pt-6">
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                  >
                    View job
                  </Link>
                </div>
              </PremiumCard>
            );
          })}
        </div>
      ) : (
        <PremiumCard className="py-12 text-center">
          <h3 className="text-lg font-semibold text-slate-950">
            No open positions
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            {company.name} does not have any published vacancies
            at the moment.
          </p>

          <Link
            href="/jobs"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            Browse all jobs
          </Link>
        </PremiumCard>
      )}
    </section>
  );
}