import { auth } from "@/auth";
import { redirect } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

import { prisma } from "@/lib/prisma";
import CreateJobForm from "@/components/employer/CreateJobForm";

export default async function CreateJobPage() {
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
      jobs: true,
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
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Post a New Job
            </h1>

            <p className="mt-2 text-slate-600">
              Publish a new vacancy under <strong>{company.name}</strong>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">

            <p className="text-sm text-slate-500">
              Existing Jobs
            </p>

            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {company.jobs.length}
            </h2>

          </div>

        </div>

        <CreateJobForm />

      </div>
    </DashboardLayout>
  );
}