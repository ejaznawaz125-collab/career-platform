import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock3,
  ShieldCheck,
  Flame,
  Star,
} from "lucide-react";

import Badge from "@/components/ui/Badge";
import PremiumCard from "@/components/ui/PremiumCard";
import Avatar from "@/components/ui/Avatar";
import IconText from "@/components/ui/IconText";

type JobHeroProps = {
  title: string;
  company: string;
  city: string;
  country: string;

  logo?: string | null;

  salary: string;
  posted: string;

  jobType: string;
  workMode: string;

  featured: boolean;
  urgent: boolean;

  verified?: boolean;
};

export default function JobHero({
  title,
  company,
  city,
  country,
  logo,

  salary,
  posted,

  jobType,
  workMode,

  featured,
  urgent,

  verified = false,
}: JobHeroProps) {
  return (
    <PremiumCard>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

        <div className="flex gap-6">

          <Avatar
            src={logo ?? undefined}
            alt={company}
            size="xl"
          />

          <div className="flex-1">

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>

              {verified && (
                <Badge
  text="Verified"
  variant="success"
  icon={<ShieldCheck size={14} />}
/>
              )}

              {featured && (
                <Badge
  text="Featured"
  variant="primary"
  icon={<Star size={14} />}
/>
              )}

              {urgent && (
                <Badge
  text="Urgent"
  variant="danger"
  icon={<Flame size={14} />}
/>
              )}

            </div>

            <p className="mt-3 text-xl font-semibold text-blue-600">
              {company}
            </p>
                        <div className="mt-5 flex flex-wrap gap-6">

              <IconText
                icon={
                  <MapPin
                    size={18}
                    className="text-blue-600"
                  />
                }
                text={`${city}, ${country}`}
              />

              <IconText
                icon={
                  <DollarSign
                    size={18}
                    className="text-green-600"
                  />
                }
                text={salary}
              />

              <IconText
                icon={
                  <Briefcase
                    size={18}
                    className="text-violet-600"
                  />
                }
                text={jobType}
              />

              <IconText
                icon={
                  <Briefcase
                    size={18}
                    className="text-orange-600"
                  />
                }
                text={workMode}
              />

              <IconText
                icon={
                  <Clock3
                    size={18}
                    className="text-slate-600"
                  />
                }
                text={`Posted ${posted}`}
              />

            </div>

          </div>

        </div>

        <div className="flex flex-col gap-3 lg:items-end">

          <Badge
  text="Open Position"
  variant="primary"
  className="px-5 py-2 text-sm"
/>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-center">

            <p className="text-sm text-slate-500">
              Salary
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {salary}
            </p>

          </div>

        </div>

      </div>
            <div className="mt-8 border-t border-slate-200 pt-6">

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl bg-slate-50 p-5 transition-all hover:bg-blue-50">
            <p className="text-sm text-slate-500">
              Job Type
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {jobType}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 transition-all hover:bg-blue-50">
            <p className="text-sm text-slate-500">
              Work Mode
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {workMode}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 transition-all hover:bg-blue-50">
            <p className="text-sm text-slate-500">
              Salary
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {salary}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 transition-all hover:bg-blue-50">
            <p className="text-sm text-slate-500">
              Posted
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {posted}
            </p>
          </div>

        </div>

      </div>

    </PremiumCard>
  );
}