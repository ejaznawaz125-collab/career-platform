import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import ApplicationStatusSelect from "@/components/employer/ApplicationStatusSelect";
import EmployerShell from "@/components/employer/EmployerShell";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export default async function EmployerJobApplicationsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "EMPLOYER") redirect("/dashboard");

  const { id } = await params;
  const job = await prisma.job.findFirst({
    where: { id, company: { ownerId: session.user.id } },
    select: {
      id: true,
      title: true,
      applications: {
        orderBy: { appliedAt: "desc" },
        select: {
          id: true,
          status: true,
          appliedAt: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!job) notFound();

  return (
    <EmployerShell name={session.user.name ?? "Employer"}>
    <main className="mx-auto max-w-5xl">
      <Link href="/employer/jobs" className="text-sm font-semibold text-blue-700 hover:underline">← Back to My Jobs</Link>
      <h1 className="mt-5 text-3xl font-bold text-slate-950">Applicants for {job.title}</h1>
      <p className="mt-2 text-slate-600">Review candidates and update their persisted application status.</p>

      {job.applications.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">No applications received yet.</div>
      ) : (
        <div className="mt-8 space-y-4">
          {job.applications.map((application) => (
            <article key={application.id} className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_240px] sm:items-center">
              <div>
                <h2 className="font-bold text-slate-950">{application.user.firstName} {application.user.lastName}</h2>
                <p className="mt-1 text-sm text-slate-500">Applied {application.appliedAt.toLocaleDateString()}</p>
              </div>
              <ApplicationStatusSelect applicationId={application.id} status={application.status} />
            </article>
          ))}
        </div>
      )}
    </main>
    </EmployerShell>
  );
}
