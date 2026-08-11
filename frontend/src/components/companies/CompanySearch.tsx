"use client";

import { Search } from "lucide-react";
import type { CompanyIndustryFilter } from "@/lib/company-industries";

type CompanySearchProps = {
  defaultValue?: string;
  industry?: CompanyIndustryFilter;
};

export default function CompanySearch({
  defaultValue = "",
  industry,
}: CompanySearchProps) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" role="search">
      {industry ? <input type="hidden" name="industry" value={industry} /> : null}
      <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
        <span className="sr-only">Search companies</span>
        <Search size={20} aria-hidden="true" className="shrink-0 text-slate-400" />
        <input
          type="search"
          name="search"
          defaultValue={defaultValue}
          placeholder="Search by company, industry, or location"
          className="min-w-0 flex-1 border-0 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
        />
      </label>
      <button type="submit" className="rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">
        Search companies
      </button>
    </form>
  );
}
