import PremiumCard from "@/components/ui/PremiumCard";
import SectionTitle from "@/components/ui/SectionTitle";

import type { PublicCompany } from "@/services/company.service";

type CompanyAboutProps = {
  company: PublicCompany;
};

export default function CompanyAbout({
  company,
}: CompanyAboutProps) {
  const description = company.description?.trim();

  if (!description) {
    return null;
  }

  return (
    <PremiumCard>
      <SectionTitle title={`About ${company.name}`} />

      <div className="my-6 h-px bg-slate-200" />

      <div className="whitespace-pre-line text-base leading-8 text-slate-700">
        {description}
      </div>
    </PremiumCard>
  );
}