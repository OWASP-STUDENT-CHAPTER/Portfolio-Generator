"use client";

import React from "react";
import { ExternalLink, Globe } from "lucide-react";
import { Icons } from "./Icons";

interface ProjectCardProps {
  title: string;
  description?: string | null;
  tags?: string[];
  liveUrl?: string | null;
  sourceUrl?: string | null;
  imageUrl?: string | null;
}

export function ProjectCard({
  title,
  description,
  tags = [],
  liveUrl,
  sourceUrl,
  imageUrl,
}: ProjectCardProps) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-border transition-all duration-300 backdrop-blur-xs hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30">
      {/* Top Banner or Preview Graphic */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-muted/80 via-muted to-card border-b border-border/40 flex items-center justify-center p-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 rounded-lg bg-background/40 border border-border/30 backdrop-blur-xs">
            <Globe className="w-8 h-8 text-muted-foreground/40 mb-2 group-hover:text-foreground/70 transition-colors" />
            <span className="text-xs font-mono-code text-muted-foreground tracking-tight line-clamp-1">
              {title}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 space-y-3">
        <div>
          <h3 className="font-semibold text-base text-foreground tracking-tight group-hover:text-foreground/90 flex items-center justify-between">
            <span>{title}</span>
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mt-1.5">
              {description}
            </p>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono-code font-medium bg-muted text-muted-foreground border border-border/40"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-3 mt-auto border-t border-border/30">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-xs"
            >
              <ExternalLink size={12} />
              <span>Live Preview</span>
            </a>
          )}
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground hover:bg-muted/80 border border-border/50 transition-colors"
            >
              <Icons.gitHub className="w-3 h-3" />
              <span>Source</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
