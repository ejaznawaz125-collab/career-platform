"use client";

const industries = [
  "All Industries",
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Logistics",
];

export default function CompanyFilters() {
  return (
    <div className="flex flex-wrap gap-3">
      {industries.map((industry) => (
        <button
          key={industry}
          type="button"
          className="
            rounded-full
            border
            border-slate-200
            bg-white
            px-5
            py-2
            text-sm
            font-medium
            text-slate-700
            transition-all
            hover:border-blue-500
            hover:bg-blue-50
            hover:text-blue-700
          "
        >
          {industry}
        </button>
      ))}
    </div>
  );
}