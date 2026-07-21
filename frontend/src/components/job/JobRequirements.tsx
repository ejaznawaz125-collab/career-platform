import Card from "@/components/common/Card";
import { CheckCircle2 } from "lucide-react";

export default function JobRequirements() {
  const requirements = [
    "Bachelor's degree in Supply Chain, Business, or related field.",
    "Minimum 3 years of warehouse supervision experience.",
    "Strong knowledge of inventory management and warehouse operations.",
    "Excellent leadership and communication skills.",
    "Experience with Microsoft Excel and warehouse systems.",
    "Ability to work under pressure and meet deadlines.",
  ];

  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Requirements
      </h2>

      <ul className="space-y-4">
        {requirements.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3"
          >
            <CheckCircle2
              size={20}
              className="mt-1 text-green-600"
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