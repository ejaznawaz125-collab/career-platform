import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ApplicationStatusBadge from "@/components/dashboard/ApplicationStatusBadge";
import WithdrawButton from "@/components/dashboard/WithdrawButton";
import { getUserApplications } from "@/lib/applications";
import Link from "next/link";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

export default async function ApplicationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const applications = await getUserApplications(
    session.user.id
  );

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">
        My Applications
      </h1>

      {applications.length === 0 ? (
        <Card>
          <p className="text-center text-slate-500">
            You haven't applied for any jobs yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <Card key={application.id}>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    {application.job.title}
                  </h2>

                  <p className="mt-1 text-slate-600">
                    {application.job.company.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {application.job.city},{" "}
                    {application.job.country}
                  </p>

                  <p className="mt-3 text-sm text-slate-500">
                    Applied:
                    {" "}
                    {application.appliedAt.toLocaleDateString()}
                  </p>

                </div>

                <div className="flex items-center gap-4">

                 <ApplicationStatusBadge
  status={application.status}
/>
                  <div className="flex gap-3">

  <Link href={`/jobs/${application.job.slug}`}>
    <Button
      text="View Job"
    />
  </Link>
  <WithdrawButton
    applicationId={application.id}
  />

</div>

                </div>

              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
