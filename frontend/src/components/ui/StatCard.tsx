import { ReactNode } from "react";
import PremiumCard from "./PremiumCard";

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  description,
}: StatCardProps) {
  return (
    <PremiumCard className="h-full">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </h3>

          {description && (
            <p className="mt-2 text-sm text-slate-500">
              {description}
            </p>
          )}

        </div>

        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}

      </div>

    </PremiumCard>
  );
}