import { auth } from "@/auth";
import { redirect } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

import { prisma } from "@/lib/prisma";

export default async function EmployerDashboardPage() {
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

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <h1 className="text-4xl font-bold text-slate-900">
            Employer Dashboard
          </h1>

          <p className="mt-3 text-slate-600">
            Welcome back! Your company is ready to start hiring.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-4">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Company
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              {company.name}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Jobs
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              0
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Applications
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              0
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Profile Status
            </p>

            <h2 className="mt-3 text-2xl font-bold text-green-600">
              Active
            </h2>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}