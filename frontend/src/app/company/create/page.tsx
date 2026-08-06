import { auth } from "@/auth";
import { redirect } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

import CreateCompanyForm from "@/components/company/CreateCompanyForm";

export default async function CreateCompanyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "EMPLOYER") {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      sidebar={<DashboardSidebar />}
      header={<DashboardHeader />}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            Create Company
          </h1>

          <p className="mt-2 text-slate-600">
            Complete your company profile to start posting jobs.
          </p>
        </div>

        <CreateCompanyForm />
      </div>
    </DashboardLayout>
  );
}