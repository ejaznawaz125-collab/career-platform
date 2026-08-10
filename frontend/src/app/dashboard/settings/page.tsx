import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function CandidateSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Settings
        </h1>
        <p className="mt-2 text-slate-600">
          Review the account information currently associated with your login.
        </p>
      </div>

      <section
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        aria-labelledby="account-information-heading"
      >
        <h2 id="account-information-heading" className="text-xl font-bold text-slate-950">
          Account information
        </h2>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-slate-500">Name</dt>
            <dd className="mt-1 text-slate-900">{user.firstName} {user.lastName}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">Email</dt>
            <dd className="mt-1 break-all text-slate-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">Account type</dt>
            <dd className="mt-1 capitalize text-slate-900">{user.role.toLowerCase().replaceAll("_", " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">Account status</dt>
            <dd className="mt-1 capitalize text-slate-900">{user.status.toLowerCase()}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">Member since</dt>
            <dd className="mt-1 text-slate-900">{user.createdAt.toLocaleDateString()}</dd>
          </div>
        </dl>
        <p className="mt-6 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600">
          Profile details are managed separately from account settings in My Profile.
        </p>
      </section>
    </div>
  );
}
