import Card from "@/components/common/Card";

const applications = [
  {
    job: "Warehouse Supervisor",
    company: "DHL",
    status: "Under Review",
  },
  {
    job: "Inventory Controller",
    company: "Nestlé",
    status: "Interview",
  },
  {
    job: "Storekeeper",
    company: "Unilever",
    status: "Applied",
  },
];

export default function RecentApplications() {
  return (
    <Card>
      <h2 className="mb-6 text-xl font-bold">
        Recent Applications
      </h2>

      <div className="space-y-4">
        {applications.map((item) => (
          <div
            key={item.job}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
          >
            <div>
              <h3 className="font-semibold text-slate-900">
                {item.job}
              </h3>

              <p className="text-sm text-slate-500">
                {item.company}
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-600">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}