import Button from "@/components/common/Button";
import {
  Building2,
  MapPin,
  Briefcase,
  Clock3,
} from "lucide-react";

export default function JobHeader() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
        Full Time
      </span>

      <h1 className="mt-6 text-4xl font-bold text-slate-900">
        Warehouse Supervisor
      </h1>

      <div className="mt-6 flex flex-wrap gap-6 text-slate-600">

        <div className="flex items-center gap-2">
          <Building2 size={18} />
          <span>ABC Logistics</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={18} />
          <span>Dubai, UAE</span>
        </div>

        <div className="flex items-center gap-2">
          <Briefcase size={18} />
          <span>Warehouse</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock3 size={18} />
          <span>Posted 2 Days Ago</span>
        </div>

      </div>

      <div className="mt-8">
        <Button
          text="Apply Now"
          size="lg"
        />
      </div>
    </div>
  );
}