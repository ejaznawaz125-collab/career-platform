import Header from "@/components/layout/Header";

import CompanyHeader from "@/components/company-details/CompanyHeader";
import CompanyOverview from "@/components/company-details/CompanyOverview";
import CompanyAbout from "@/components/company-details/CompanyAbout";
import CompanyBenefits from "@/components/company-details/CompanyBenefits";
import CompanyJobs from "@/components/company-details/CompanyJobs";
import CompanyGallery from "@/components/company-details/CompanyGallery";
import CompanyReviews from "@/components/company-details/CompanyReviews";
import CompanyContact from "@/components/company-details/CompanyContact";

type CompanyDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CompanyDetailsPage({
  params,
}: CompanyDetailsPageProps) {
  await params;

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">

        <CompanyHeader />

        <div className="mt-8 space-y-8">

          <CompanyOverview />

          <CompanyAbout />

          <CompanyBenefits />

          <CompanyJobs />

          <CompanyGallery />

          <CompanyReviews />

          <CompanyContact />

        </div>

      </section>
    </main>
  );
}