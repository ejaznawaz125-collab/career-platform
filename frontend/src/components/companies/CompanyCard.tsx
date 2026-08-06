import Link from "next/link";
import { Building2, Briefcase, MapPin } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import PremiumCard from "@/components/ui/PremiumCard";

import type { PublicCompany } from "@/services/company.service";

type CompanyCardProps = {
  company: PublicCompany;
};

function getLocation(company: PublicCompany) {
  return [company.city, company.country]
    .filter(Boolean)
    .join(", ");
}

export default function CompanyCard({
  company,
}: CompanyCardProps) {
  const location = getLocation(company);

  return (
    <Link
      href={`/companies/${company.slug}`}
      className="block"
    >
      <PremiumCard
        hover
        className="h-full"
      >
        <div className="flex items-start gap-4">

          <Avatar
            src={company.logo ?? undefined}
            alt={company.name}
            name={company.name}
            size="lg"
          />

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <h3
                className="
                  truncate
                  text-xl
                  font-bold
                  text-slate-900
                "
              >
                {company.name}
              </h3>

              {company.verified && (
                <Badge
                  text="Verified"
                  variant="success"
                />
              )}

            </div>

            {company.tagline && (
              <p
                className="
                  mt-2
                  line-clamp-2
                  text-sm
                  text-slate-600
                "
              >
                {company.tagline}
              </p>
            )}

            <div className="mt-5 space-y-3">

              {company.industry && (
                <div className="flex items-center gap-2 text-sm text-slate-600">

                  <Building2
                    size={16}
                    className="text-blue-600"
                  />

                  <span>
                    {company.industry}
                  </span>

                </div>
              )}

              {location && (
                <div className="flex items-center gap-2 text-sm text-slate-600">

                  <MapPin
                    size={16}
                    className="text-red-500"
                  />

                  <span>
                    {location}
                  </span>

                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-slate-600">

                <Briefcase
                  size={16}
                  className="text-emerald-600"
                />

                <span>
                  {company._count.jobs}
                  {" "}
                  Open Jobs
                </span>

              </div>

            </div>

          </div>

        </div>
      </PremiumCard>
    </Link>
  );
}