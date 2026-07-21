import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { Building2 } from "lucide-react";

export default function CompanyInfo() {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-blue-100 p-4">
          <Building2
            size={32}
            className="text-blue-600"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            ABC Logistics
          </h2>

          <p className="text-slate-600">
            Logistics & Supply Chain
          </p>
        </div>
      </div>

      <p className="mt-6 leading-7 text-slate-600">
        ABC Logistics is one of the leading logistics companies
        in the Middle East, providing warehousing,
        transportation, and supply chain solutions.
      </p>

      <div className="mt-8">
        <Button
          text="View Company"
          variant="outline"
        />
      </div>
    </Card>
  );
}