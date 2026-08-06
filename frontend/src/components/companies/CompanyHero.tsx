import Image from "next/image";

import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import PremiumCard from "@/components/ui/PremiumCard";

import type { PublicCompany } from "@/services/company.service";

type CompanyHeroProps = {
  company: PublicCompany;
};

function getCompanyLocation(
  company: PublicCompany,
): string | null {
  const location = [
    company.city,
    company.country,
  ]
    .filter(
      (value): value is string =>
        Boolean(value?.trim()),
    )
    .join(", ");

  return location || null;
}

export default function CompanyHero({
  company,
}: CompanyHeroProps) {
  const location =
    getCompanyLocation(company);

  const coverImage =
    company.coverImage?.trim() || null;

  const coverImageAlt =
    company.coverImageAlt?.trim() ||
    `${company.name} cover image`;

  return (
    <PremiumCard className="overflow-hidden p-0">
      <div className="relative h-48 bg-slate-200 sm:h-56 lg:h-64">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={coverImageAlt}
            fill
            priority
            sizes="(max-width:1280px) 100vw, 1280px"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full bg-gradient-to-br from-slate-950 via-slate-800 to-slate-700"
          />
        )}
      </div>

      <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end">
          <div className="w-fit rounded-2xl border-4 border-white bg-white shadow-sm">
            <Avatar
              src={company.logo ?? undefined}
              alt={`${company.name} logo`}
              
              size="xl"
            />
          </div>

          <div className="min-w-0 flex-1 sm:pb-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {company.name}
              </h1>

              {company.verified && (
                <Badge
                  text="Verified"
                  variant="success"
                />
              )}
            </div>

            {company.tagline && (
              <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                {company.tagline}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              {company.industry && (
                <span>{company.industry}</span>
              )}

              {location && (
                <span>{location}</span>
              )}

              <span>
                {company._count.jobs}{" "}
                {company._count.jobs === 1
                  ? "open job"
                  : "open jobs"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}