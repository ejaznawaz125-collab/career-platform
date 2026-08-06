import { ReactNode } from "react";

type IconTextProps = {
  icon: ReactNode;
  text: string;
  className?: string;
};

export default function IconText({
  icon,
  text,
  className = "",
}: IconTextProps) {
  return (
    <div
      className={`flex items-center gap-2 text-slate-600 ${className}`}
    >
      <span className="flex items-center justify-center">
        {icon}
      </span>

      <span className="text-sm font-medium">
        {text}
      </span>
    </div>
  );
}