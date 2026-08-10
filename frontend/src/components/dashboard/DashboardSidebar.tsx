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

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full bg-white p-4 lg:w-64 lg:p-6">

      <h2 className="mb-4 text-xl font-bold lg:mb-8 lg:text-2xl">
        Dashboard
      </h2>

      <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible">

        {menu.map((item) => {
          const Icon = item.icon;

          const active = item.href === "/dashboard"
            ? pathname === item.href
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
