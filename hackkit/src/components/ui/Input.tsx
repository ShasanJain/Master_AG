"use client";
// components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : `input-${Math.random().toString(36).slice(2, 7)}`);
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="form-group">
        <label htmlFor={inputId}>{label}</label>
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? "input-error" : ""} ${className}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            [error ? errorId : "", hint ? hintId : ""]
              .filter(Boolean)
              .join(" ") || undefined
          }
          {...props}
        />
        {hint && !error && (
          <span id={hintId} className="text-xs text-muted">
            {hint}
          </span>
        )}
        {error && (
          <span id={errorId} className="error-text" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
