import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      className={`
        w-full
        rounded-xl
        border
        border-slate-300
        bg-white
        px-4
        py-3
        text-slate-900
        placeholder:text-slate-400
        outline-none
        transition-all
        duration-200
        focus:border-blue-600
        focus:ring-4
        focus:ring-blue-100
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    />
  );
}