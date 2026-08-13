import Link from "next/link";
import Card from "@/components/common/Card";

export default function SavedJobs({ jobs }: { jobs: Array<{ id: string; job: { title: string; slug: string; company: { name: string } } }> }) {
  return (
    <Card>
      <h2 className="mb-6 text-xl font-bold">
        Saved Jobs
      </h2>

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <p className="text-sm text-slate-500">No saved jobs yet.</p>
        ) : jobs.map((savedJob) => (
          <Link
            key={savedJob.id}
            href={`/jobs/${savedJob.job.slug}`}
            className="block w-full rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <span className="block font-semibold text-slate-900">{savedJob.job.title}</span>
            <span className="mt-1 block text-sm text-slate-500">{savedJob.job.company.name}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
