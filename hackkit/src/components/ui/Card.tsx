"use client";
// components/ui/Card.tsx
import { HTMLAttributes, ReactNode, ElementType } from "react";

interface CardProps {
  children: ReactNode;
  elevated?: boolean;
  padding?: "sm" | "md" | "lg";
  as?: "div" | "article" | "section" | "li";
  className?: string;
  id?: string;
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export function Card({
  children,
  elevated = false,
  padding = "md",
  as: Tag = "div",
  className = "",
  ...props
}: CardProps) {
  const paddingMap = { sm: "p-4", md: "p-6", lg: "p-8" };

  const classes = [
    elevated ? "glass-card-elevated" : "glass-card",
    paddingMap[padding],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const Comp = Tag as ElementType;

  return (
    <Comp className={classes} {...(props as HTMLAttributes<HTMLElement>)}>
      {children}
    </Comp>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div
      className="flex justify-between items-center"
      style={{ marginBottom: "var(--space-5)" }}
    >
      <div>
        <h3 style={{ marginBottom: subtitle ? "var(--space-1)" : 0 }}>{title}</h3>
        {subtitle && <p className="text-sm text-muted" style={{ marginBottom: 0 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
