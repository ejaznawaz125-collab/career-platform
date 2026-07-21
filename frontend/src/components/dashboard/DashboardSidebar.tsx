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
    <aside className="w-64 rounded-2xl bg-white p-6 shadow">

      <h2 className="mb-8 text-2xl font-bold">
        Dashboard
      </h2>

      <nav className="space-y-2">

        {menu.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
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