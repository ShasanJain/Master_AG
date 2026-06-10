"use client";
// components/ui/Badge.tsx
import { ReactNode } from "react";

type BadgeVariant = "primary" | "success" | "warning" | "error" | "neutral";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
}

export function Badge({ children, variant = "neutral", icon }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
