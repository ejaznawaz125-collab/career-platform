import Card from "@/components/common/Card";

const jobs = [
  "Warehouse Supervisor",
  "Storekeeper",
  "Logistics Coordinator",
  "Inventory Controller",
];

export default function SavedJobs() {
  return (
    <Card>
      <h2 className="mb-6 text-xl font-bold">
        Saved Jobs
      </h2>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job}
            className="rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
          >
            {job}
          </div>
        ))}
      </div>
    </Card>
  );
}