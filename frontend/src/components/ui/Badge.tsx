import { ReactNode } from "react";

type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "secondary";

type BadgeProps = {
  text: string;
  variant?: BadgeVariant;
  icon?: ReactNode;
  className?: string;
};

export default function Badge({
  text,
  variant = "primary",
  icon,
  className = "",
}: BadgeProps) {
  const variants = {
    primary: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    secondary: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        ${variants[variant]}
        ${className}
      `}
    >
      {icon && <span className="flex items-center">{icon}</span>}

      <span>{text}</span>
    </span>
  );
}