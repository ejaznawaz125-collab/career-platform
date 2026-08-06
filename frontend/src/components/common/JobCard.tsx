import Link from "next/link";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { MapPin, Building2 } from "lucide-react";

type JobCardProps = {
  title: string;
  company: string;
  location: string;
  slug: string;
};

export default function JobCard({
  title,
  company,
  location,
  slug,
}: JobCardProps) {
  return (
    <Card>
      <div>
        <h3 className="mb-4 text-xl font-bold text-slate-900">
          {title}
        </h3>

        <div className="mb-3 flex items-center gap-2 text-slate-700">
          <Building2 size={18} />
          <span>{company}</span>
        </div>

        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={16} />
          <span>{location || "Location not specified"}</span>
        </div>
      </div>

      <Link href={`/jobs/${slug}`}>
        <Button
          text="View Job"
          className="w-full"
        />
      </Link>
    </Card>
  );
}