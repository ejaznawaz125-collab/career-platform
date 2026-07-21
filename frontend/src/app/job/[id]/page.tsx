import Header from "@/components/layout/Header";

import JobHeader from "@/components/job/JobHeader";
import JobOverview from "@/components/job/JobOverview";
import JobDescription from "@/components/job/JobDescription";
import JobRequirements from "@/components/job/JobRequirements";
import JobResponsibilities from "@/components/job/JobResponsibilities";
import JobBenefits from "@/components/job/JobBenefits";
import CompanyInfo from "@/components/job/CompanyInfo";
import ApplyCard from "@/components/job/ApplyCard";
import RelatedJobs from "@/components/job/RelatedJobs";

type JobDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobDetailsPage({
  params,
}: JobDetailsPageProps) {
  await params;

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">

        <JobHeader />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          <div className="space-y-8 lg:col-span-2">
            <JobOverview />
            <JobDescription />
            <JobRequirements />
            <JobResponsibilities />
            <JobBenefits />
          </div>

          <div className="space-y-8">
            <ApplyCard />
            <CompanyInfo />
          </div>

        </div>

        <div className="mt-12">
          <RelatedJobs />
        </div>

      </section>
    </main>
  );
}