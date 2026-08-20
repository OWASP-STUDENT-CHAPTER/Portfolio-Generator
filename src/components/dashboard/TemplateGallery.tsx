"use client";

import React, { useState, useTransition } from "react";
import { updateTemplate } from "@/actions/website";
import { Check, CheckCircle2, AlertCircle, X, Eye } from "lucide-react";
import { Btn, SectionHeader, Tag, cn } from "@/components/ui/Primitives";
import { getPublicSiteUrl } from "@/lib/config";

interface TemplateItem {
  id: string;
  name: string;
  desc: string;
  tags: string[];
  bg: string;
  fg: string;
  accent: string;
}

const TEMPLATES: TemplateItem[] = [
  { id: "magic", name: "Magic", desc: "Fluid particle background, blur-fade, floating dock (inspired by aayushbindal.me)", tags: ["Interactive", "MagicUI", "Particles"], bg: "#000000", fg: "#F8FAFC", accent: "#3B82F6" },
  { id: "magic3d", name: "Magic 3D", desc: "3D celestial spiral & starfield canvas (inspired by aayushbindal.me)", tags: ["3D Visual", "Celestial", "Warp"], bg: "#030712", fg: "#F8FAFC", accent: "#EC4899" },
  { id: "craftsman", name: "Craftsman", desc: "Warm parchment, serif editorial", tags: ["Editorial", "Warm", "Serif"], bg: "#FBF8F2", fg: "#2C2218", accent: "#C4622D" },
  { id: "minimal", name: "Minimal", desc: "Clean Scandinavian whitespace", tags: ["Minimal", "Clean", "Light"], bg: "#FFFFFF", fg: "#111111", accent: "#000000" },
  { id: "developer", name: "Developer", desc: "Dark mode, syntax-highlighted", tags: ["Dark", "Code", "Mono"], bg: "#0D1117", fg: "#E6EDF3", accent: "#58A6FF" },
  { id: "editorial", name: "Editorial", desc: "Magazine asymmetry, drop caps", tags: ["Magazine", "Serif", "Layout"], bg: "#FAFAF8", fg: "#1A1A1A", accent: "#E05A47" },
  { id: "bento", name: "Bento", desc: "Modular card grid, Apple-style", tags: ["Grid", "Modern", "Cards"], bg: "#F0F0EE", fg: "#1D1D1F", accent: "#5856D6" },
  { id: "terminal", name: "Terminal", desc: "CRT glow, matrix green aesthetic", tags: ["Terminal", "Mono", "Dark"], bg: "#060C06", fg: "#33FF33", accent: "#00FF41" },
  { id: "spotlight", name: "Spotlight", desc: "Cinematic, dramatic presentation", tags: ["Cinematic", "Dark", "Bold"], bg: "#070707", fg: "#F5F5F5", accent: "#E5C07B" },
  { id: "elegant", name: "Elegant", desc: "Luxury restraint, gold accents", tags: ["Luxury", "Serif", "Dark"], bg: "#0E0C09", fg: "#F2ECD8", accent: "#C9A84C" },
  { id: "creative", name: "Creative", desc: "Neo-brutalist, high-energy", tags: ["Brutalist", "Bold", "Color"], bg: "#F5F500", fg: "#000000", accent: "#FF2D55" },
  { id: "professional", name: "Professional", desc: "Executive résumé, navy header", tags: ["Corporate", "Clean", "Navy"], bg: "#FFFFFF", fg: "#1C3C6B", accent: "#2563EB" },
  { id: "academic", name: "Academic", desc: "Scholarly, research-forward", tags: ["Academic", "Serif", "Clean"], bg: "#F9F8F5", fg: "#1E293B", accent: "#475569" },
  { id: "narrative", name: "Narrative", desc: "Case-study driven, long-form", tags: ["Story", "Modern", "Case Study"], bg: "#F7F7F8", fg: "#0F172A", accent: "#3B5BDB" },
];

export default function TemplateGallery({
  currentTemplateId,
  username,
}: {
  currentTemplateId: string;
  username: string;
}) {
  const [selected, setSelected] = useState(currentTemplateId);
  const [, startTransition] = useTransition();
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => (prev?.title === title ? null : prev));
    }, 4000);
  };

  const handleApply = (templateId: string) => {
    setSelected(templateId);
    startTransition(async () => {
      try {
        await updateTemplate(templateId);
        showToast(
          "success",
          "Template Applied",
          `Switched to ${TEMPLATES.find((t) => t.id === templateId)?.name || templateId}.`
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to switch template";
        showToast("error", "Error", msg);
      }
    });
  };

  const currentTemplate = TEMPLATES.find((t) => t.id === selected) || TEMPLATES[0];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-toast flex items-start gap-3 bg-card border border-border text-foreground px-4 py-3 rounded-[3px] shadow-lg max-w-sm">
          <div className="mt-0.5 shrink-0">
            {toast.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle size={16} className="text-destructive" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold">{toast.title}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              {toast.message}
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-muted-foreground hover:text-foreground p-0.5 rounded-[2px]"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <SectionHeader
        title="Choose a Template"
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Selected: <strong className="text-foreground">{currentTemplate.name}</strong>
            </span>
            <a
              href={getPublicSiteUrl(username, selected)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Btn variant="secondary" size="sm">
                <Eye size={13} /> Live Preview
              </Btn>
            </a>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {TEMPLATES.map((t) => {
          const isSelected = selected === t.id;

          return (
            <div
              key={t.id}
              onClick={() => handleApply(t.id)}
              className={cn(
                "group text-left border rounded-[3px] overflow-hidden transition-all duration-150 cursor-pointer flex flex-col bg-card",
                isSelected
                  ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background shadow-md"
                  : "border-border hover:border-foreground/30 hover:shadow-sm"
              )}
            >
              <div
                className="h-32 relative flex items-end p-3 overflow-hidden select-none"
                style={{ backgroundColor: t.bg }}
              >
                <div style={{ color: t.fg }}>
                  <div
                    className={cn(
                      "text-xs font-bold font-mono-code",
                      t.id === "terminal" ? "text-[#33FF33]" : ""
                    )}
                    style={{ color: t.fg }}
                  >
                    {t.id === "terminal"
                      ? "$ ./portfolio --open"
                      : t.id === "creative"
                      ? t.name.toUpperCase()
                      : t.name}
                  </div>
                  <div className="text-[10px] opacity-50 mt-0.5">{username}</div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center shadow-sm">
                    <Check size={11} strokeWidth={3} />
                  </div>
                )}

                <div
                  className="absolute top-0 right-0 bottom-0 w-24 opacity-15"
                  style={{
                    background: `linear-gradient(to left, ${t.accent}, transparent)`,
                  }}
                />
              </div>

              <div className="bg-card p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-foreground">{t.name}</span>
                    {isSelected ? (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to apply
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{t.desc}</p>
                </div>

                <div className="flex flex-wrap gap-1 mt-2.5">
                  {t.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
