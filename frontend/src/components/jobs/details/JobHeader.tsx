import { Prisma } from "@prisma/client";

type JobHeaderProps = {
  job: Prisma.JobGetPayload<{
    include: {
      company: true;
      category: true;
    };
  }>;
};

export default function JobHeader({
  job,
}: JobHeaderProps) {
  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {job.title}
          </h1>

          <p className="mt-3 text-xl text-blue-600">
            {job.company.name}
          </p>

          <p className="mt-2 text-slate-500">
            {job.city}, {job.country}
          </p>
        </div>

        {job.company.logo && (
          <img
            src={job.company.logo}
            alt={job.company.name}
            className="h-20 w-20 rounded-xl border object-cover"
          />
        )}
      </div>
    </div>
  );
}