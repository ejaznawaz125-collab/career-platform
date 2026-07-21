import Card from "@/components/common/Card";
import { ArrowRightCircle } from "lucide-react";

export default function JobResponsibilities() {
  const responsibilities = [
    "Supervise daily warehouse operations.",
    "Maintain inventory accuracy and stock control.",
    "Manage receiving, storage, picking, and dispatch activities.",
    "Lead and motivate warehouse staff.",
    "Ensure workplace safety and company policies are followed.",
    "Prepare warehouse performance reports.",
  ];

  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Responsibilities
      </h2>

      <ul className="space-y-4">
        {responsibilities.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3"
          >
            <ArrowRightCircle
              size={20}
              className="mt-1 text-blue-600"
            />

            <span className="leading-7 text-slate-600">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}