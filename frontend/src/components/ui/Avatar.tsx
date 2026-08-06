"use client";

import { useState } from "react";

type AvatarProps = {
  src?: string;
  alt: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-24 w-24",
};

export default function Avatar({
  src,
  alt,
  name,
  size = "lg",
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] =
    useState(false);

  const showImage =
    !!src && !imageError;

  const initial =
    (name ?? alt)
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

  return (
    <div
      className={`
        ${sizes[size]}
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        flex
        items-center
        justify-center
        shrink-0
        ${className}
      `}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() =>
            setImageError(true)
          }
        />
      ) : (
        <span className="text-2xl font-bold text-slate-400">
          {initial}
        </span>
      )}
    </div>
  );
}