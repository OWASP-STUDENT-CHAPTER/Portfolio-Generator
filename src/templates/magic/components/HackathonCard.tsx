"use client";

import React from "react";
import { Trophy, ExternalLink, Calendar } from "lucide-react";

interface HackathonCardProps {
  title: string;
  subtitle?: string | null;
  dates?: string | null;
  description?: string | null;
  links?: { title: string; href: string }[];
}

export function HackathonCard({
  title,
  subtitle,
  dates,
  description,
  links = [],
}: HackathonCardProps) {
  return (
    <div className="relative pl-6 pb-6 border-l border-border/60 last:border-l-transparent last:pb-0">
      {/* Node Dot */}
      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-background border-2 border-foreground flex items-center justify-center shadow-xs">
        <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-500 shrink-0" />
            <span>{title}</span>
          </h4>
          {dates && (
            <span className="text-[11px] font-mono-code text-muted-foreground flex items-center gap-1">
              <Calendar size={11} />
              <span>{dates}</span>
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-muted-foreground font-medium">
            {subtitle}
          </p>
        )}

        {description && (
          <p className="text-xs text-muted-foreground/90 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        )}

        {links.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {links.map((l) => (
              <a
                key={l.title}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono-code text-foreground hover:underline"
              >
                <ExternalLink size={11} />
                <span>{l.title}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
