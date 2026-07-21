import Card from "@/components/common/Card";
import {
  Building2,
  CalendarDays,
  Users,
  Briefcase,
  Globe,
  MapPin,
} from "lucide-react";

export default function CompanyOverview() {
  const items = [
    {
      icon: <CalendarDays size={20} />,
      label: "Founded",
      value: "2012",
    },
    {
      icon: <Users size={20} />,
      label: "Employees",
      value: "500+",
    },
    {
      icon: <Building2 size={20} />,
      label: "Industry",
      value: "Logistics",
    },
    {
      icon: <Briefcase size={20} />,
      label: "Open Jobs",
      value: "26",
    },
    {
      icon: <Globe size={20} />,
      label: "Website",
      value: "abclogistics.com",
    },
    {
      icon: <MapPin size={20} />,
      label: "Head Office",
      value: "Dubai",
    },
  ];

  return (
    <Card>
      <h2 className="mb-8 text-2xl font-bold text-slate-900">
        Company Overview
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-4"
          >
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              {item.icon}
            </div>

            <div>
              <p className="text-sm text-slate-500">
                {item.label}
              </p>

              <p className="font-semibold text-slate-900">
                {item.value}
              </p>
            </div>

          </div>
        ))}
      </div>
    </Card>
  );
}