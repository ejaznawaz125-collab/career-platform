import Link from "next/link";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { MapPin } from "lucide-react";

type JobCardProps = {
  title: string;
  company: string;
  location: string;
};

export default function JobCard({
  title,
  company,
  location,
}: JobCardProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-2 text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mb-4 text-slate-600">
        {company}
      </p>

      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <MapPin size={16} />
        <span>{location || "Location not specified"}</span>
      </div>

      <Link href="#">
        <Button
          text="View Job"
          className="w-full"
        />
      </Link>
    </Card>
  );
}