import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function JobsFilters() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-slate-900">
        Filters
      </h2>

      <div className="space-y-5">
        <Input
          type="text"
          placeholder="Job Type"
        />

        <Input
          type="text"
          placeholder="Experience"
        />

        <Input
          type="text"
          placeholder="Salary Range"
        />

        <Input
          type="text"
          placeholder="Country"
        />

        <Button
          text="Apply Filters"
          variant="primary"
        />
      </div>
    </div>
  );
}