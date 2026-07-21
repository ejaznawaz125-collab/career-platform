import Link from "next/link";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { MapPin, Briefcase } from "lucide-react";

type CompanyCardProps = {
  company: string;
  industry: string;
  location: string;
  jobs: string;
};

export default function CompanyCard({
  company,
  industry,
  location,
  jobs,
}: CompanyCardProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-2 text-xl font-bold text-slate-900">
        {company}
      </h3>

      <p className="mb-4 text-slate-600">
        {industry}
      </p>

      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <MapPin size={16} />
        <span>{location}</span>
      </div>

      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Briefcase size={16} />
        <span>{jobs} Open Jobs</span>
      </div>

      <Link href="#">
        <Button
          text="View Company"
          className="w-full"
        />
      </Link>
    </Card>
  );
}