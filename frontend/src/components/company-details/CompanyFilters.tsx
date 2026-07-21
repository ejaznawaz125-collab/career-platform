import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function CompanyFilters() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-xl font-bold text-slate-900">
        Filters
      </h2>

      <div className="space-y-5">

        <Input
          type="text"
          placeholder="Industry"
        />

        <Input
          type="text"
          placeholder="Company Size"
        />

        <Input
          type="text"
          placeholder="Country"
        />

        <Input
          type="text"
          placeholder="Hiring Status"
        />

        <Button
          text="Apply Filters"
        />

      </div>
    </div>
  );
}