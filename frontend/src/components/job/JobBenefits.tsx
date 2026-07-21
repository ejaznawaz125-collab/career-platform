import Card from "@/components/common/Card";
import { Gift } from "lucide-react";

export default function JobBenefits() {
  const benefits = [
    "Competitive salary package.",
    "Annual performance bonus.",
    "Medical insurance.",
    "Paid annual leave.",
    "Career growth opportunities.",
    "Professional training and development.",
  ];

  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Benefits
      </h2>

      <ul className="space-y-4">
        {benefits.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3"
          >
            <Gift
              size={20}
              className="mt-1 text-purple-600"
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