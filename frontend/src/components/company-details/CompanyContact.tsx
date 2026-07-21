import Card from "@/components/common/Card";
import {
  Globe,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function CompanyContact() {
  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Contact Information
      </h2>

      <div className="space-y-5">

        <div className="flex items-center gap-3">
          <Globe size={20} className="text-blue-600" />
          <span>www.abclogistics.com</span>
        </div>

        <div className="flex items-center gap-3">
          <Mail size={20} className="text-blue-600" />
          <span>careers@abclogistics.com</span>
        </div>

        <div className="flex items-center gap-3">
          <Phone size={20} className="text-blue-600" />
          <span>+971 4 123 4567</span>
        </div>

        <div className="flex items-center gap-3">
          <MapPin size={20} className="text-blue-600" />
          <span>Dubai, United Arab Emirates</span>
        </div>

      </div>
    </Card>
  );
}