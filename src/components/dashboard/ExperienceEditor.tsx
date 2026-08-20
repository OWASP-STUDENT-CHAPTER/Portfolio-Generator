"use client";

import React, { useState, useTransition } from "react";
import { saveExperience, deleteExperience } from "@/actions/website";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Grip,
  Briefcase,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Btn, Field, SectionHeader } from "@/components/ui/Primitives";
import { checkLocalProfanity } from "@/lib/moderation/veil-local";

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
}

export default function ExperienceEditor({
  initialExperiences,
}: {
  initialExperiences: ExperienceItem[];
}) {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(initialExperiences);
  const [editingId, setEditingId] = useState<string | null>(
    initialExperiences.length > 0 ? initialExperiences[0].id : null
  );
  const [isPending, startTransition] = useTransition();
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

  const handleAddExperience = () => {
    startTransition(async () => {
      try {
        const newExp = {
          role: "Software Engineering Intern",
          company: "Company Name",
          description: "",
          startDate: "May 2024",
          endDate: "Aug 2024",
          current: false,
        };
        const res = await saveExperience(newExp);
        if (res && typeof res === "object" && !(res as any).success) {
          showToast("error", "Error", (res as any).error || "Failed to add experience");
          return;
        }
        window.location.reload();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to add experience";
        showToast("error", "Error", msg);
      }
    });
  };

  const handleUpdateExperience = (exp: ExperienceItem) => {
    const roleCheck = checkLocalProfanity(exp.role);
    const companyCheck = checkLocalProfanity(exp.company);
    const descCheck = checkLocalProfanity(exp.description || "");

    if (!roleCheck.isSafe || !companyCheck.isSafe || !descCheck.isSafe) {
      showToast("error", "Prohibited Language", "Please fix fields containing inappropriate language.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveExperience({
          id: exp.id,
          role: exp.role.trim() || "Untitled Role",
          company: exp.company.trim() || "Company",
          description: exp.description?.trim() || "",
          startDate: exp.startDate?.trim() || "",
          endDate: exp.endDate?.trim() || "",
          current: exp.current || false,
        });

        if (res && typeof res === "object" && !(res as any).success) {
          showToast("error", "Update Blocked", (res as any).error || "Failed to save experience");
          return;
        }

        if (res && typeof res === "object" && (res as any).unpublishWarning) {
          showToast("error", "Saved as Draft", (res as any).error || "Experience saved as draft due to safety review.");
          return;
        }

        showToast("success", "Experience Saved", `"${exp.role}" updated successfully.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to save experience";
        showToast("error", "Update Failed", msg);
      }
    });
  };

  const handleDeleteExperience = (id: string, role: string) => {
    if (!confirm(`Are you sure you want to delete "${role || "this role"}"?`)) return;
    startTransition(async () => {
      try {
        await deleteExperience(id);
        setExperiences((prev) => prev.filter((e) => e.id !== id));
        if (editingId === id) setEditingId(null);
        showToast("success", "Deleted", `Role removed successfully.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete experience";
        showToast("error", "Delete Failed", msg);
      }
    });
  };

  const handleFieldChange = (
    id: string,
    key: keyof ExperienceItem,
    value: string | boolean
  ) => {
    setExperiences((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [key]: value } : e))
    );
  };

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
        title="Experience"
        action={
          <Btn
            variant="primary"
            size="sm"
            onClick={handleAddExperience}
            disabled={isPending}
          >
            <Plus size={13} /> Add role
          </Btn>
        }
      />

      {experiences.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-[3px] bg-card/40">
          <Briefcase size={24} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No experience added yet.</p>
          <Btn
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={handleAddExperience}
            disabled={isPending}
          >
            <Plus size={13} /> Add your first role
          </Btn>
        </div>
      )}

      <div className="space-y-3">
        {experiences.map((e) => {
          const isExpanded = editingId === e.id;

          return (
            <div
              key={e.id}
              className="bg-card border border-border rounded-[3px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all"
            >
              {/* Accordion Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => setEditingId(isExpanded ? null : e.id)}
              >
                <Grip size={14} className="text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {e.role || <span className="text-muted-foreground italic">Untitled role</span>}
                  </span>
                  {e.company && (
                    <span className="text-xs text-muted-foreground">
                      @ {e.company}
                    </span>
                  )}
                  {e.current && (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-[2px] font-medium border border-emerald-200 dark:border-emerald-800">
                      Current
                    </span>
                  )}
                  {(e.startDate || e.endDate) && (
                    <span className="text-xs text-muted-foreground ml-auto pr-2">
                      {e.startDate} {e.startDate && (e.endDate || e.current) ? "–" : ""} {e.current ? "Present" : e.endDate}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDeleteExperience(e.id, e.role);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-[3px] cursor-pointer"
                    title="Delete role"
                  >
                    <Trash2 size={13} />
                  </button>
                  {isExpanded ? (
                    <ChevronUp size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={14} className="text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Accordion Form */}
              {isExpanded && (
                <div className="border-t border-border p-4 space-y-4 bg-card/60">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Role / Title"
                      value={e.role}
                      onChange={(v) => handleFieldChange(e.id, "role", v)}
                      placeholder="e.g. Frontend Engineer"
                      error={!checkLocalProfanity(e.role).isSafe ? "Role contains prohibited language" : undefined}
                    />
                    <Field
                      label="Company / Organization"
                      value={e.company}
                      onChange={(v) => handleFieldChange(e.id, "company", v)}
                      placeholder="e.g. Google, Microsoft, Startup"
                      error={!checkLocalProfanity(e.company).isSafe ? "Company contains prohibited language" : undefined}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Start Year
                        </label>
                        <select
                          value={e.startDate || ""}
                          onChange={(ev) => handleFieldChange(e.id, "startDate", ev.target.value)}
                          className="w-full px-3 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors font-mono-code text-xs cursor-pointer"
                        >
                          <option value="">Select Year</option>
                          {Array.from({ length: 45 }, (_, i) => String(new Date().getFullYear() + 6 - i)).map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          End Year
                        </label>
                        {e.current ? (
                          <input
                            type="text"
                            value="Present"
                            disabled
                            className="w-full px-3 py-2 text-xs bg-input-background border border-border rounded-[3px] text-foreground font-mono-code opacity-60 cursor-not-allowed select-none"
                          />
                        ) : (
                          <select
                            value={e.endDate || ""}
                            onChange={(ev) => handleFieldChange(e.id, "endDate", ev.target.value)}
                            className="w-full px-3 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors font-mono-code text-xs cursor-pointer"
                          >
                            <option value="">Select Year</option>
                            {Array.from({ length: 45 }, (_, i) => String(new Date().getFullYear() + 6 - i)).map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none pb-2">
                      <input
                        type="checkbox"
                        checked={!!e.current}
                        onChange={(ev) => handleFieldChange(e.id, "current", ev.target.checked)}
                        className="rounded-[2px] border-border text-foreground accent-foreground cursor-pointer"
                      />
                      <span>I currently work here</span>
                    </label>
                  </div>

                  <Field
                    label="Description & Responsibilities"
                    value={e.description || ""}
                    onChange={(v) => handleFieldChange(e.id, "description", v)}
                    multiline
                    rows={3}
                    placeholder="Describe your key achievements, team leadership, systems built, and technologies leveraged..."
                    error={e.description && !checkLocalProfanity(e.description).isSafe ? "Description contains prohibited language" : undefined}
                  />

                  <div className="flex justify-end pt-2">
                    <Btn
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateExperience(e)}
                      disabled={isPending}
                    >
                      <Check size={13} /> Save role
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
