import Card from "@/components/common/Card";
import { BriefcaseBusiness } from "lucide-react";
import Link from "next/link";

type CategoryCardProps = {
  title: string;
  jobs: string;
  slug: string;
};

export default function CategoryCard({
  title,
  jobs,
  slug,
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

      <Link
        href={`/jobs?category=${encodeURIComponent(slug)}`}
        className="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-blue-700"
      >
        Browse Jobs
      </Link>
    </Card>
  );
}
