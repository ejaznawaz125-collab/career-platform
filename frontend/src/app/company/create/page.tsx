import { auth } from "@/auth";
import { redirect } from "next/navigation";

import EmployerShell from "@/components/employer/EmployerShell";
import { prisma } from "@/lib/prisma";

import CreateCompanyForm from "@/components/company/CreateCompanyForm";

export default async function CreateCompanyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "EMPLOYER") {
    redirect("/dashboard");
  }

  const existingCompany = await prisma.company.findFirst({ where: { ownerId: session.user.id }, select: { id: true } });
  if (existingCompany) redirect("/employer/company");

  return (
    <EmployerShell name={session.user.name ?? "Employer"}>
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
    </EmployerShell>
  );
}
