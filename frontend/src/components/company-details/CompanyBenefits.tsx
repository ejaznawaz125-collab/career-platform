import Card from "@/components/common/Card";
import { CheckCircle2 } from "lucide-react";

export default function CompanyBenefits() {
  const benefits = [
    "Competitive Salary",
    "Annual Performance Bonus",
    "Medical Insurance",
    "Paid Annual Leave",
    "Professional Training",
    "Career Growth Opportunities",
  ];

  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Employee Benefits
      </h2>

      <ul className="space-y-4">
        {benefits.map((benefit, index) => (
          <li
            key={index}
            className="flex items-start gap-3"
          >
            <CheckCircle2
              size={20}
              className="mt-1 text-green-600"
            />

            <span className="text-slate-600">
              {benefit}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}