import { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
};

export default function EmptyState({
  title,
  description,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-8 py-14 text-center">

      {icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
          {icon}
        </div>
      )}

      <h3 className="text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 max-w-md text-slate-500">
        {description}
      </p>

    </div>
  );
}