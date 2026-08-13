import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DeleteJobButton from "@/components/employer/DeleteJobButton";
export default async function EmployerJobsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "EMPLOYER") {
    redirect("/dashboard");
  }

  const company = await prisma.company.findFirst({
    where: {
      ownerId: session.user.id,
    },
    include: {
      jobs: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!company) {
    redirect("/company/create");
  }

  return (
    <DashboardLayout
      sidebar={<DashboardSidebar />}
      header={<DashboardHeader />}
    >
      <div className="space-y-8">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              My Jobs
            </h1>

            <p className="mt-2 text-slate-600">
              Manage all jobs posted by{" "}
              <strong>{company.name}</strong>
            </p>
          </div>

          <Link
            href="/employer/jobs/create"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Create New Job
          </Link>

        </div>

        <div className="grid gap-6 md:grid-cols-4">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Jobs
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {company.jobs.length}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Published
            </p>

            <h2 className="mt-3 text-3xl font-bold text-green-600">
              {
                company.jobs.filter(
                  (job) => job.status === "PUBLISHED"
                ).length
              }
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Draft
            </p>

            <h2 className="mt-3 text-3xl font-bold text-orange-500">
              {
                company.jobs.filter(
                  (job) => job.status === "DRAFT"
                ).length
              }
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Company
            </p>

            <h2 className="mt-3 text-xl font-bold">
              {company.name}
            </h2>
          </div>

        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-6 py-4 text-left">
                  Job
                </th>

                <th className="px-6 py-4 text-left">
                  Location
                </th>

                <th className="px-6 py-4 text-left">
                  Salary
                </th>

                <th className="px-6 py-4 text-left">
                  Status
                </th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>
                {company.jobs.length === 0 ? (

  <tr>
    <td
      colSpan={5}
      className="px-6 py-12 text-center text-slate-500"
    >
      No jobs posted yet.
    </td>
  </tr>

) : (

  company.jobs.map((job) => (

    <tr
      key={job.id}
      className="border-t hover:bg-slate-50"
    >

      <td className="px-6 py-5">

        <h3 className="font-semibold text-slate-900">
          {job.title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {job.jobType} • {job.workMode}
        </p>

      </td>

      <td className="px-6 py-5">
        {job.city}, {job.country}
      </td>

      <td className="px-6 py-5">
        ${job.salaryMin} - ${job.salaryMax}
      </td>

      <td className="px-6 py-5">

        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            job.status === "PUBLISHED"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {job.status}
        </span>

      </td>

      <td className="px-6 py-5">

        <div className="flex justify-end gap-3">

          <Link
            href={`/employer/jobs/${job.id}/applications`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Applicants
          </Link>

          <Link
            href={`/employer/jobs/${job.id}/edit`}
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            Edit
          </Link>

          <DeleteJobButton jobId={job.id} />

        </div>

      </td>

    </tr>

  ))

)}
            </tbody>

          </table>

        </div>

      </div>

    </DashboardLayout>
  );
}
