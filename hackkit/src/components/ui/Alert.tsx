"use client";
// components/ui/Alert.tsx
import { ReactNode } from "react";

type AlertVariant = "error" | "success" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  role?: "alert" | "status";
}

export function Alert({ variant = "info", children, role = "alert" }: AlertProps) {
  return (
    <div className={`alert alert-${variant}`} role={role} aria-live="polite">
      {children}
    </div>
  );
}
