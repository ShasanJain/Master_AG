"use client";
// components/ui/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "cta" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  full = false,
  loading = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const classes = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "",
    full ? "btn-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <span
          className="spinner"
          style={{ width: 16, height: 16, borderWidth: 2 }}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
