"use client";

import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import UserMenu from "./UserMenu";

export default function DashboardHeader() {
  const { data: session } = useSession();

  const name = session?.user?.name || "User";
  const role = (session?.user as any)?.role || "Job Seeker";

  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome Back
        </h1>

        <p className="mt-2 text-slate-500">
          Here's what's happening with your career today.
        </p>
      </div>

      <div className="flex items-center gap-5">
        <button className="rounded-xl bg-slate-100 p-3 transition hover:bg-slate-200">
          <Bell size={22} />
        </button>

        <UserMenu
          name={name}
          role={role}
        />
      </div>
    </header>
  );
}