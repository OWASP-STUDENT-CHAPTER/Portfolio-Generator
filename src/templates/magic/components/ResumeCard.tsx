"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Calendar, MapPin, Building2, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeCardProps {
  title: string;
  subtitle: string;
  period: string;
  description?: string | null;
  location?: string | null;
  badges?: string[];
  isEducation?: boolean;
}

export function ResumeCard({
  title,
  subtitle,
  period,
  description,
  location,
  badges = [],
  isEducation = false,
}: ResumeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = Boolean(description || badges.length > 0);

  return (
    <div
      onClick={() => hasDetails && setIsExpanded(!isExpanded)}
      className={cn(
        "group relative flex flex-col p-4 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-border/80 transition-all duration-200 backdrop-blur-xs",
        hasDetails ? "cursor-pointer" : ""
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left icon & info */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-muted/80 border border-border/60 flex items-center justify-center text-muted-foreground group-hover:text-foreground shrink-0 transition-colors">
            {isEducation ? <GraduationCap size={18} /> : <Building2 size={18} />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-foreground tracking-tight flex items-center gap-1.5 flex-wrap">
              <span>{title}</span>
              {hasDetails && (
                <ChevronRight
                  size={14}
                  className={cn(
                    "text-muted-foreground/60 transition-transform duration-200",
                    isExpanded ? "rotate-90 text-foreground" : "group-hover:translate-x-0.5"
                  )}
                />
              )}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate mt-0.5">
              {subtitle}
            </p>
            {location && (
              <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-1 font-mono-code">
                <MapPin size={11} />
                <span>{location}</span>
              </p>
            )}
          </div>
        </div>

        {/* Period badge */}
        <div className="shrink-0 text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono-code font-medium bg-muted/70 text-muted-foreground border border-border/40">
            <Calendar size={11} />
            <span>{period}</span>
          </span>
        </div>
      </div>

      {/* Expandable details */}
      {hasDetails && (
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="pt-3 mt-3 border-t border-border/40 space-y-2.5 text-xs text-muted-foreground leading-relaxed">
            {description && <p className="whitespace-pre-line">{description}</p>}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {badges.map((b) => (
                  <span
                    key={b}
                    className="px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-foreground/5 text-foreground border border-border/50 font-mono-code"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
