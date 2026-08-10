import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";


import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

import { getSavedJobs } from "@/lib/saved-jobs";

export default async function SavedJobsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const savedJobs = await getSavedJobs(
    session.user.id
  );

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">
        Saved Jobs
      </h1>

      {savedJobs.length === 0 ? (
        <Card>
          <p className="text-center text-slate-500">
            You haven't saved any jobs yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {savedJobs.map((savedJob) => (
            <Card key={savedJob.id}>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h2 className="text-xl font-bold">
                    {savedJob.job.title}
                  </h2>

                  <p className="mt-1 text-slate-600">
                    {savedJob.job.company.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {savedJob.job.city},{" "}
                    {savedJob.job.country}
                  </p>
                </div>

                <Link
                  href={`/jobs/${savedJob.job.slug}`}
                >
                  <Button
                    text="View Job"
                  />
                </Link>

              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
