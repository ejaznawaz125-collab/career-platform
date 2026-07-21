"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut } from "lucide-react";

type Props = {
  name: string;
  role: string;
};

export default function UserMenu({
  name,
  role,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="text-left">
          <p className="font-semibold">
            {name}
          </p>

          <p className="text-sm text-slate-500">
            {role}
          </p>
        </div>

        <ChevronDown size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-48 rounded-xl border bg-white shadow-lg">

          <button
            onClick={() =>
              signOut({
                callbackUrl: "/login",
              })
            }
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />

            Logout
          </button>

        </div>
      )}

    </div>
  );
}