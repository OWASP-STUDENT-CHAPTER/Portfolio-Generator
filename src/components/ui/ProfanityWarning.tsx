import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/components/ui/Primitives";

export function ProfanityWarning({
  isFlagged,
  reason,
  className,
}: {
  isFlagged: boolean;
  reason?: string;
  className?: string;
}) {
  if (!isFlagged) return null;
  return (
    <p
      className={cn(
        "text-[11px] font-medium text-destructive flex items-center gap-1 mt-1 animate-fade-in",
        className
      )}
    >
      <AlertCircle size={12} className="shrink-0" />
      <span>{reason || "Contains inappropriate or prohibited language"}</span>
    </p>
  );
}
