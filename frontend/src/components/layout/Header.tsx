import Link from "next/link";
import { NAVIGATION, SITE } from "@/lib/constants";

export default function Header() {
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

        <div className="flex items-center gap-3">

          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium transition hover:bg-gray-100"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Register
          </Link>

        </div>

      </div>

    </header>
  );
}
