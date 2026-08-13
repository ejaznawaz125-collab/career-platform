"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Bookmark,
  Settings,
  Building2,
} from "lucide-react";

const menu = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    title: "My Profile",
    href: "/dashboard/profile",
    icon: User,
  },

  {
    title: "My Resume",
    href: "/dashboard/resume",
    icon: FileText,
  },

  {
    title: "Applications",
    href: "/dashboard/applications",
    icon: Briefcase,
  },

  {
    title: "Saved Jobs",
    href: "/dashboard/saved-jobs",
    icon: Bookmark,
  },

  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const employerMenu = [
  { title: "Dashboard", href: "/employer", icon: LayoutDashboard },
  { title: "Company Profile", href: "/employer/company", icon: Building2 },
  { title: "My Jobs", href: "/employer/jobs", icon: Briefcase },
  { title: "Post a Job", href: "/employer/jobs/create", icon: FileText },
];

export default function DashboardSidebar({ variant = "candidate" }: { variant?: "candidate" | "employer" }) {
  const pathname = usePathname();
  const items = variant === "employer" ? employerMenu : menu;

  return (
    <aside className="w-full bg-white p-4 lg:w-64 lg:p-6">

      <h2 className="mb-4 text-xl font-bold lg:mb-8 lg:text-2xl">
        Dashboard
      </h2>

      <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible">

        {items.map((item) => {
          const Icon = item.icon;

          const active = item.href === "/dashboard" || item.href === "/employer"
            ? pathname === item.href
            : item.href === "/employer/jobs"
              ? pathname.startsWith(item.href) && !pathname.startsWith("/employer/jobs/create")
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={20} />

              {item.title}
            </Link>
          );
        })}

      </nav>

    </aside>
  );
}
