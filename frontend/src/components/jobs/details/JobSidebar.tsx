import Card from "@/components/common/Card";
import ApplyButton from "@/components/jobs/ApplyButton";
import SaveJobButton from "@/components/jobs/SaveJobButton";

import {
  Globe,
  Building2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { Prisma } from "@prisma/client";

type JobSidebarProps = {
  job: Prisma.JobGetPayload<{
    include: {
      company: true;
      category: true;
    };
  }>;
  initiallyApplied?: boolean;
  initiallySaved?: boolean;
};

export default function JobSidebar({
  job,
  initiallyApplied = false,
  initiallySaved = false,
}: JobSidebarProps) {
  return (
    <div className="sticky top-24 space-y-6">

      <Card>

        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          Apply Now
        </h2>

        <ApplyButton
          jobId={job.id}
          initiallyApplied={initiallyApplied}
        />

        <div className="mt-4">
          <SaveJobButton jobId={job.id} initiallySaved={initiallySaved} />
        </div>

      </Card>

      <Card>

        <div className="flex items-center gap-4">

          {job.company.logo ? (
            <img
              src={job.company.logo}
              alt={job.company.name}
              className="h-16 w-16 rounded-2xl border object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Building2
                size={28}
                className="text-slate-500"
              />
            </div>
          )}

          <div>

            <h3 className="text-xl font-bold text-slate-900">
              {job.company.name}
            </h3>

            <div className="mt-2 flex items-center gap-2">

              <ShieldCheck
                size={18}
                className={
                  job.company.verified
                    ? "text-green-600"
                    : "text-red-500"
                }
              />

              <span
                className={
                  job.company.verified
                    ? "text-sm font-semibold text-green-600"
                    : "text-sm font-semibold text-red-500"
                }
              >
                {job.company.verified
                  ? "Verified Company"
                  : "Not Verified"}
              </span>

            </div>

          </div>

        </div>

        <div className="mt-8 space-y-5">

          <div className="flex items-start gap-3">

            <Globe
              size={18}
              className="mt-1 text-blue-600"
            />

            <div>

              <p className="text-sm text-slate-500">
                Website
              </p>

              <p className="break-all font-semibold text-slate-900">
                {job.company.website ??
                  "Not Available"}
              </p>

            </div>

          </div>

          <div className="flex items-start gap-3">

            <Building2
              size={18}
              className="mt-1 text-blue-600"
            />

            <div>

              <p className="text-sm text-slate-500">
                Industry
              </p>

              <p className="font-semibold text-slate-900">
                {job.company.industry ??
                  "Not Specified"}
              </p>

            </div>

          </div>

          <div className="flex items-start gap-3">

            <Building2
              size={18}
              className="mt-1 text-blue-600"
            />

            <div>

              <p className="text-sm text-slate-500">
                Company Size
              </p>

              <p className="font-semibold text-slate-900">
                {job.company.companySize}
              </p>

            </div>

          </div>

          <div className="flex items-start gap-3">

            <MapPin
              size={18}
              className="mt-1 text-blue-600"
            />

            <div>

              <p className="text-sm text-slate-500">
                Location
              </p>

              <p className="font-semibold text-slate-900">
                {job.company.city},{" "}
                {job.company.country}
              </p>

            </div>

          </div>

        </div>

      </Card>

    </div>
  );
}
