import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold text-blue-600">CareerHub</h2>
          <p className="text-gray-600">
            Helping professionals discover better careers across Asia and the Middle East.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-bold">Explore</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link href="/jobs" className="hover:text-blue-700 hover:underline">
                Browse Jobs
              </Link>
            </li>
            <li>
              <Link href="/companies" className="hover:text-blue-700 hover:underline">
                Browse Companies
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 py-6 text-center text-gray-500">
        © 2026 CareerHub. All rights reserved.
      </div>
    </footer>
  );
}
