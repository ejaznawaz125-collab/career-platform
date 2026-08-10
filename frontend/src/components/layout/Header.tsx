"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { NAVIGATION, SITE } from "@/lib/constants";

export default function Header() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const accountLabel = session?.user?.name?.trim() || "My account";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <Link
          href="/"
          className="text-2xl font-bold text-blue-600"
        >
          {SITE.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">

          {NAVIGATION.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-700 transition hover:text-blue-600"
            >
              {item.name}
            </Link>
          ))}

        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {status === "loading" ? (
            <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-100" aria-label="Loading account" />
          ) : isAuthenticated ? (
            <>
              <Link
                href="/dashboard/profile"
                className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
                aria-label={`${accountLabel} profile`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <UserRound size={16} aria-hidden="true" />
                </span>
                <span className="hidden max-w-36 truncate sm:inline">{accountLabel}</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <LayoutDashboard size={17} aria-hidden="true" />
                <span className="hidden lg:inline">Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <LogOut size={17} aria-hidden="true" />
                <span className="hidden lg:inline">Logout</span>
                <span className="sr-only lg:hidden">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:px-5"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:px-5"
              >
                Register
              </Link>
            </>
          )}
        </div>

      </div>

    </header>
  );
}
