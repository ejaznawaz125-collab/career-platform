import Link from "next/link";
import {
  MapPin,
  Briefcase,
  DollarSign,
} from "lucide-react";

import PremiumCard from "@/components/ui/PremiumCard";

type RelatedJobCardProps = {
  job: {
    id: string;
    slug: string;
    title: string;
    city: string;
    country: string;
    salary: string;
    company: {
      name: string;
      logo: string | null;
    };
  };
};

export default function RelatedJobCard({
  job,
}: RelatedJobCardProps) {
  return (
    <Link href={`/jobs/${job.slug}`}>
      <PremiumCard
        hover
        className="h-full cursor-pointer"
      >
        <div className="flex items-start gap-4">

          <div className="h-14 w-14 overflow-hidden rounded-xl border bg-white">
            {job.company.logo ? (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-400">
                {job.company.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1">

            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
              {job.title}
            </h3>

            <p className="mt-1 text-blue-600">
              {job.company.name}
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-500">

              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>
                  {job.city}, {job.country}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase size={16} />
                <span>Full Time</span>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign size={16} />
                <span>{job.salary}</span>
              </div>

            </div>

          </div>

        </div>
      </PremiumCard>
    </Link>
  );
}