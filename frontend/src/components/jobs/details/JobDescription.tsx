import Card from "@/components/common/Card";
import { FileText } from "lucide-react";

type JobDescriptionProps = {
  description: string;
};

export default function JobDescription({
  description,
}: JobDescriptionProps) {
  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div className="rounded-xl bg-blue-100 p-3">
          <FileText
            size={24}
            className="text-blue-600"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Job Description
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Read the complete job details before applying.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="whitespace-pre-wrap text-[16px] leading-8 text-slate-700">
          {description}
        </p>
      </div>
    </Card>
  );
}