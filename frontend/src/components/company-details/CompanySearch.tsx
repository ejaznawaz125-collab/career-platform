import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function CompanySearch() {
  return (
    <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-4">

        <Input
          type="text"
          placeholder="Company name"
        />

        <Input
          type="text"
          placeholder="Industry"
        />

        <Input
          type="text"
          placeholder="Country"
        />

        <Button
          text="Search Companies"
        />

      </div>
    </div>
  );
}