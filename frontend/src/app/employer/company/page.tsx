import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import EditCompanyForm from "@/components/company/EditCompanyForm";
import EmployerShell from "@/components/employer/EmployerShell";
import { prisma } from "@/lib/prisma";

export default async function EmployerCompanyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "EMPLOYER") redirect("/dashboard");
  const company = await prisma.company.findFirst({ where: { ownerId: session.user.id } });
  if (!company) redirect("/company/create");
  return <EmployerShell name={session.user.name ?? "Employer"}><div className="mx-auto max-w-5xl space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold text-slate-950">Company Profile</h1><p className="mt-2 text-slate-600">Manage the company information shown to candidates.</p></div><Link href={`/companies/${company.slug}`} className="font-semibold text-blue-700 hover:underline">View public profile</Link></div><EditCompanyForm initial={{ name: company.name, tagline: company.tagline ?? "", description: company.description ?? "", website: company.website ?? "", email: company.email ?? "", phone: company.phone ?? "", industry: company.industry ?? "", companySize: company.companySize, country: company.country ?? "", city: company.city ?? "", address: company.address ?? "" }} /><p className="text-sm text-slate-500">Company logo upload is not available because no managed company-image upload flow exists yet.</p></div></EmployerShell>;
}
