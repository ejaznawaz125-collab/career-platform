import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "outline";

type PremiumButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: Variant;
    fullWidth?: boolean;
  };

export default function PremiumButton({
  children,
  variant = "primary",
  fullWidth = false,
  className,
  ...props
}: PremiumButtonProps) {
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700",

    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200",

    success:
      "bg-green-600 text-white hover:bg-green-700",

    danger:
      "bg-red-600 text-white hover:bg-red-700",

    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
  };

  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center",
        "rounded-xl",
        "px-5 py-3",
        "font-semibold",
        "transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </button>
  );
}