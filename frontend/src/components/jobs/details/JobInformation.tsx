import Card from "@/components/common/Card";
import {
  FolderOpen,
  BadgeCheck,
  Briefcase,
  Building2,
  GraduationCap,
  Users,
  DollarSign,
  CalendarDays,
} from "lucide-react";

type JobInformationProps = {
  category: string;
  experience: string;
  jobType: string;
  workMode: string;
  education: string | null;
  vacancies: number;
  salary: string;
  posted: string;
};

type InfoItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function InfoItem({
  icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-md">
      <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
        {icon}
      </div>

      <div>
        <p className="text-sm text-slate-500">
          {label}
        </p>

        <p className="mt-1 font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function JobInformation({
  category,
  experience,
  jobType,
  workMode,
  education,
  vacancies,
  salary,
  posted,
}: JobInformationProps) {
  return (
    <Card>
      <h2 className="mb-8 text-2xl font-bold text-slate-900">
        Job Information
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        <InfoItem
          icon={<FolderOpen size={22} />}
          label="Category"
          value={category}
        />

        <InfoItem
          icon={<BadgeCheck size={22} />}
          label="Experience"
          value={experience}
        />

        <InfoItem
          icon={<Briefcase size={22} />}
          label="Job Type"
          value={jobType}
        />

        <InfoItem
          icon={<Building2 size={22} />}
          label="Work Mode"
          value={workMode}
        />

        <InfoItem
          icon={<GraduationCap size={22} />}
          label="Education"
          value={education ?? "Not Specified"}
        />

        <InfoItem
          icon={<Users size={22} />}
          label="Vacancies"
          value={String(vacancies)}
        />

        <InfoItem
          icon={<DollarSign size={22} />}
          label="Salary"
          value={salary}
        />

        <InfoItem
          icon={<CalendarDays size={22} />}
          label="Posted"
          value={posted}
        />
      </div>
    </Card>
  );
}