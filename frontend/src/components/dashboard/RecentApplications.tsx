import Card from "@/components/common/Card";
import { ApplicationStatus } from "@prisma/client";

type RecentApplicationsProps = {
  applications: {
    id: string;
    status: ApplicationStatus;
    job: {
      title: string;
      company: {
        name: string;
      };
    };
  }[];
};

export default function RecentApplications({
  applications,
}: RecentApplicationsProps) {
  return (
    <Card>
      <h2 className="mb-6 text-xl font-semibold">
        Recent Applications
      </h2>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <p className="text-slate-500">
            No applications found.
          </p>
        ) : (
          applications.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
            >
              <div>
                <h3 className="font-semibold text-slate-900">
                  {item.job.title}
                </h3>

                <p className="text-sm text-slate-500">
                  {item.job.company.name}
                </p>
              </div>

              <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-600">
                {item.status}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}