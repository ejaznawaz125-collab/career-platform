import { notFound } from "next/navigation";
import Link from "next/link";

import { getAuthenticatedCandidateOwner } from "@/lib/candidate-server";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Container from "@/components/common/Container";

import {
  getJobBySlug,
  getRelatedJobs,
} from "@/services/job.service";

import JobHero from "@/components/jobs/details/JobHero";
import JobInformation from "@/components/jobs/details/JobInformation";
import JobDescription from "@/components/jobs/details/JobDescription";
import JobSection from "@/components/jobs/details/JobSection";
import JobSidebar from "@/components/jobs/details/JobSidebar";
import RelatedJobs from "@/components/jobs/details/RelatedJobs";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const experienceMap: Record<string, string> = {
  ENTRY: "Entry Level",
  JUNIOR: "Junior",
  MID: "Mid Level",
  SENIOR: "Senior",
  LEAD: "Lead",
  MANAGER: "Manager",
  DIRECTOR: "Director",
  EXECUTIVE: "Executive",
};

const jobTypeMap: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
  TEMPORARY: "Temporary",
};

const workModeMap: Record<string, string> = {
  ONSITE: "On Site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

export default async function JobDetailsPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const job = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  const candidate = await getAuthenticatedCandidateOwner();
  const existingApplication = candidate
    ? await prisma.application.findUnique({
        where: {
          userId_jobId: {
            userId: candidate.userId,
            jobId: job.id,
          },
        },
        select: { id: true },
      })
    : null;

  const relatedJobsData = await getRelatedJobs(
    job.id,
    job.categoryId,
    6,
  );

  const relatedJobs = relatedJobsData.map(
    (relatedJob) => ({
      id: relatedJob.id,
      slug: relatedJob.slug,
      title: relatedJob.title,
      city: relatedJob.city,
      country: relatedJob.country,

      salary:
        relatedJob.salaryMin ||
        relatedJob.salaryMax
          ? `${relatedJob.salaryCurrency} ${
              relatedJob.salaryMin ?? 0
            } - ${relatedJob.salaryMax ?? 0}`
          : "Salary Not Disclosed",

      company: {
        name: relatedJob.company.name,
        logo: relatedJob.company.logo,
      },
    }),
  );

  const salary =
    job.salaryMin || job.salaryMax
      ? `${job.salaryCurrency} ${job.salaryMin ?? 0} - ${
          job.salaryMax ?? 0
        }`
      : "Salary Not Disclosed";

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="py-16">
        <Container>
          <Link href="/jobs" className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:underline">â† Back to Jobs</Link>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">

              <JobHero
                title={job.title}
                company={job.company.name}
                city={job.city}
                country={job.country}
                logo={job.company.logo}
                salary={salary}
                posted={job.createdAt.toLocaleDateString()}
                jobType={jobTypeMap[job.jobType]}
                workMode={workModeMap[job.workMode]}
                featured={job.featured}
                urgent={job.urgent}
                verified={job.company.verified}
              />

              <JobInformation
                category={job.category.name}
                experience={experienceMap[job.experienceLevel]}
                jobType={jobTypeMap[job.jobType]}
                workMode={workModeMap[job.workMode]}
                education={job.education}
                vacancies={job.vacancies}
                salary={salary}
                posted={job.createdAt.toLocaleDateString()}
              />

              <JobDescription
                description={job.description}
              />

              <JobSection
                title="Requirements"
                content={job.requirements}
                emptyMessage="No requirements specified."
              />

              <JobSection
                title="Responsibilities"
                content={job.responsibilities}
                emptyMessage="No responsibilities specified."
              />

              <JobSection
                title="Benefits"
                content={job.benefits}
                emptyMessage="No benefits specified."
              />

              <RelatedJobs jobs={relatedJobs} />

            </div>

            <div className="space-y-6">
              <JobSidebar
                job={job}
                initiallyApplied={Boolean(existingApplication)}
              />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
