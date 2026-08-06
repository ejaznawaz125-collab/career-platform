import Card from "@/components/common/Card";
import {
  CheckCircle2,
  ClipboardList,
  Gift,
} from "lucide-react";

type JobSectionProps = {
  title: string;
  content: string | null;
  emptyMessage: string;
};

function getIcon(title: string) {
  switch (title) {
    case "Requirements":
      return (
        <CheckCircle2
          size={24}
          className="text-blue-600"
        />
      );

    case "Responsibilities":
      return (
        <ClipboardList
          size={24}
          className="text-blue-600"
        />
      );

    case "Benefits":
      return (
        <Gift
          size={24}
          className="text-blue-600"
        />
      );

    default:
      return (
        <CheckCircle2
          size={24}
          className="text-blue-600"
        />
      );
  }
}

function getSubtitle(title: string) {
  switch (title) {
    case "Requirements":
      return "Skills and qualifications required for this position.";

    case "Responsibilities":
      return "Your key duties and responsibilities.";

    case "Benefits":
      return "Benefits and perks offered by the company.";

    default:
      return "";
  }
}

export default function JobSection({
  title,
  content,
  emptyMessage,
}: JobSectionProps) {
  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div className="rounded-xl bg-blue-100 p-3">
          {getIcon(title)}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {getSubtitle(title)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="whitespace-pre-wrap text-[16px] leading-8 text-slate-700">
          {content ?? emptyMessage}
        </p>
      </div>
    </Card>
  );
}