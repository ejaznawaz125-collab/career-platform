import Card from "@/components/common/Card";
import {
  Briefcase,
  DollarSign,
  Clock3,
  GraduationCap,
} from "lucide-react";

export default function JobOverview() {
  const items = [
    {
      icon: <Briefcase size={20} />,
      label: "Job Type",
      value: "Full Time",
    },
    {
      icon: <DollarSign size={20} />,
      label: "Salary",
      value: "$2,500 - $3,500",
    },
    {
      icon: <Clock3 size={20} />,
      label: "Experience",
      value: "3+ Years",
    },
    {
      icon: <GraduationCap size={20} />,
      label: "Education",
      value: "Bachelor's Degree",
    },
  ];

  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Job Overview
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
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