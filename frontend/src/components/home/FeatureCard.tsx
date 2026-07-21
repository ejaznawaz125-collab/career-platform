import Card from "@/components/common/Card";
import { Brain } from "lucide-react";

type FeatureCardProps = {
  title: string;
  description: string;
};

export default function FeatureCard({
  title,
  description,
}: FeatureCardProps) {
  return (
    <Card>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
        <Brain size={28} className="text-blue-600" />
      </div>

      <h3 className="mb-3 text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="leading-7 text-slate-600">
        {description}
      </p>
    </Card>
  );
}