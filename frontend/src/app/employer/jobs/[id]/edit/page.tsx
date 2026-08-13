import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import EmployerShell from "@/components/employer/EmployerShell";

import EditJobForm from "@/components/employer/EditJobForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditJobPage({
  params,
}: PageProps) {
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

  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: {
      id,
      companyId: company.id,
    },
  });

  if (!job) {
    redirect("/employer/jobs");
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <EmployerShell name={session.user.name ?? "Employer"}>
      <div className="space-y-8">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold text-slate-900">
              Edit Job
            </h1>

            <p className="mt-2 text-slate-600">
              Update your job information.
            </p>

          </div>

        </div>
                <EditJobForm
          job={{
            id: job.id,
            title: job.title,
            categoryId: job.categoryId,
            country: job.country,
            city: job.city,
            jobType: job.jobType,
            workMode: job.workMode,
            experienceLevel: job.experienceLevel,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            vacancies: job.vacancies,
            description: job.description,
            requirements: job.requirements ?? "",
            responsibilities: job.responsibilities ?? "",
            benefits: job.benefits ?? "",
            status: job.status,
          }}
          categories={categories}
        />

      </div>
    </EmployerShell>
  );
}
