"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { useSession } from "next-auth/react";
import UserMenu from "./UserMenu";

const breadcrumbLabels: Record<string, string> = {
  "/dashboard/profile": "Profile",
  "/dashboard/resume": "Resume",
  "/dashboard/applications": "Applications",
  "/dashboard/saved-jobs": "Saved Jobs",
  "/dashboard/settings": "Settings",
};

type DashboardHeaderProps = {
  name?: string;
  role?: "Candidate" | "Employer";
  dashboardHref?: string;
};

export default function DashboardHeader({
  name: serverName,
  role = "Candidate",
  dashboardHref = "/dashboard",
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const name = serverName || session?.user?.name || "User";
  const currentLabel = breadcrumbLabels[pathname];

  function goBack() {
    const referrer = document.referrer;
    const hasSafeReferrer = (() => {
      if (!referrer) return false;
      try {
        const url = new URL(referrer);
        return url.origin === window.location.origin && url.pathname !== pathname;
      } catch {
        return false;
      }
    })();

    if (hasSafeReferrer && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(dashboardHref);
  }

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <nav aria-label="Dashboard breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href={dashboardHref} className="font-semibold text-blue-700 hover:underline">Dashboard</Link>
            {currentLabel ? <><span aria-hidden="true">/</span><span aria-current="page">{currentLabel}</span></> : null}
          </nav>

          <div className="mt-3 flex flex-wrap gap-2" aria-label="Dashboard navigation controls">
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"><Home size={16} aria-hidden="true" /> Home</Link>
            <button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"><ArrowLeft size={16} aria-hidden="true" /> Back</button>
          </div>
        </div>

        <div className="shrink-0">
          <UserMenu name={name} role={role} />
        </div>
      </div>
    </header>
  );
}
