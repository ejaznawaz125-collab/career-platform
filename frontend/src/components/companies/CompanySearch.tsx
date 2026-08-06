"use client";

import { Search } from "lucide-react";

type CompanySearchProps = {
  defaultValue?: string;
};

export default function CompanySearch({
  defaultValue = "",
}: CompanySearchProps) {
  return (
    <form className="relative">
      <Search
        size={20}
        className="
          absolute
          left-5
          top-1/2
          -translate-y-1/2
          text-slate-400
        "
      />

      <input
        type="text"
        name="search"
        defaultValue={defaultValue}
        placeholder="Search companies..."
        className="
          w-full
          rounded-2xl
          border
          border-slate-200
          bg-white
          py-4
          pl-14
          pr-5
          text-sm
          outline-none
          transition
          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-100
        "
      />
    </form>
  );
}