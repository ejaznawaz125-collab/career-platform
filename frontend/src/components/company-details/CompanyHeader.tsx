import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import {
  Building2,
  MapPin,
  Globe,
  Users,
} from "lucide-react";

export default function CompanyHeader() {
  return (
    <Card>
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

        <div className="flex items-start gap-6">

          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-100">
            <Building2
              size={46}
              className="text-blue-600"
            />
          </div>

          <div>

            <h1 className="text-4xl font-bold text-slate-900">
              ABC Logistics
            </h1>

            <p className="mt-2 text-lg text-slate-600">
              Logistics & Supply Chain
            </p>

            <div className="mt-6 flex flex-wrap gap-6 text-slate-600">

              <div className="flex items-center gap-2">
                <MapPin size={18} />
                Dubai, UAE
              </div>

              <div className="flex items-center gap-2">
                <Users size={18} />
                500+ Employees
              </div>

              <div className="flex items-center gap-2">
                <Globe size={18} />
                www.abclogistics.com
              </div>

            </div>

          </div>

        </div>

        <Button
          text="Follow Company"
          size="lg"
        />

      </div>
    </Card>
  );
}