import React from "react";
import { cn } from "@/lib/utils";

export { cn };

export function Btn({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "accent" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none rounded-[3px]";
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-sm gap-2",
  };
  const variants = {
    primary: "bg-foreground text-background hover:opacity-85 active:opacity-95 shadow-sm",
    secondary: "border border-border text-foreground bg-card hover:bg-muted active:bg-muted/80",
    ghost: "text-foreground hover:bg-muted active:bg-muted/80",
    accent: "bg-accent text-accent-foreground hover:opacity-85",
    danger: "border border-destructive/30 text-destructive hover:bg-destructive hover:text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        base,
        sizes[size],
        variants[variant],
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  multiline,
  rows = 4,
  hint,
  disabled,
  error,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}) {
  const base = cn(
    "w-full px-3 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors",
    error && "border-destructive focus:border-destructive ring-1 ring-destructive/40"
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {multiline ? (
        <textarea
          className={cn(base, "resize-y")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
        />
      ) : (
        <input
          className={base}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {error && (
        <p className="text-[11px] font-medium text-destructive flex items-center gap-1 mt-0.5">
          <span>⚠️ {error}</span>
        </p>
      )}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      {action && <div className="flex items-center gap-2 flex-wrap">{action}</div>}
    </div>
  );
}

export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-[3px] text-xs font-medium bg-muted text-muted-foreground border border-border/40",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-[3px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
        className
      )}
    >
      {children}
    </div>
  );
}
