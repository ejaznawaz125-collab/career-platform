import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { BookOpen } from "lucide-react";

type ResourceCardProps = {
  title: string;
  description: string;
};

export default function ResourceCard({
  title,
  description,
}: ResourceCardProps) {
  return (
    <Card>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
        <BookOpen size={28} className="text-blue-600" />
      </div>

      <h3 className="mb-3 text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mb-6 leading-7 text-slate-600">
        {description}
      </p>

      <Button text="Read More" />
    </Card>
  );
}