import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { BriefcaseBusiness } from "lucide-react";

type CategoryCardProps = {
  title: string;
  jobs: string;
};

export default function CategoryCard({
  title,
  jobs,
}: CategoryCardProps) {
  return (
    <Card>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
        <BriefcaseBusiness size={28} className="text-blue-600" />
      </div>

      <h3 className="mb-2 text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mb-6 text-slate-500">
        {jobs} Jobs Available
      </p>

      <Button text="Browse Jobs" />
    </Card>
  );
}