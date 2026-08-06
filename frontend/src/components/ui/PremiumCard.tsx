import { ReactNode } from "react";
import clsx from "clsx";

type PremiumCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

export default function PremiumCard({
  children,
  className,
  hover = false,
}: PremiumCardProps) {
  return (
    <div
      className={clsx(
        "rounded-3xl",
        "border border-slate-200",
        "bg-white",
        "p-8",
        "shadow-sm",
        "transition-all duration-300",

        hover &&
          "hover:-translate-y-1 hover:shadow-xl",

        className,
      )}
    >
      {children}
    </div>
  );
}