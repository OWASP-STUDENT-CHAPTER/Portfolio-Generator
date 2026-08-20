"use client";

import React, { useState, useTransition } from "react";
import { saveEducation, deleteEducation } from "@/actions/website";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Grip,
  GraduationCap,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Btn, Field, SectionHeader } from "@/components/ui/Primitives";
import { checkLocalProfanity } from "@/lib/moderation/veil-local";

interface EducationItem {
  id: string;
  institution: string;
  degree?: string | null;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
  gpa?: string | null;
}

export default function EducationEditor({
  initialEducations,
}: {
  initialEducations: EducationItem[];
}) {
  const [educations, setEducations] = useState<EducationItem[]>(initialEducations);
  const [editingId, setEditingId] = useState<string | null>(
    initialEducations.length > 0 ? initialEducations[0].id : null
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

  const handleAddEducation = () => {
    startTransition(async () => {
      try {
        const newEdu = {
          institution: "Thapar Institute of Engineering and Technology",
          degree: "Bachelor of Engineering (B.E.)",
          field: "Computer Science & Engineering",
          startDate: "2022",
          endDate: "2026",
          current: true,
          gpa: "9.2 / 10.0",
        };
        const res = await saveEducation(newEdu);
        if (res && typeof res === "object" && !(res as any).success) {
          showToast("error", "Error", (res as any).error || "Failed to add education");
          return;
        }
        window.location.reload();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to add education";
        showToast("error", "Error", msg);
      }
    });
  };

  const handleUpdateEducation = (edu: EducationItem) => {
    const instCheck = checkLocalProfanity(edu.institution);
    const degCheck = checkLocalProfanity(edu.degree || "");
    const fieldCheck = checkLocalProfanity(edu.field || "");

    if (!instCheck.isSafe || !degCheck.isSafe || !fieldCheck.isSafe) {
      showToast("error", "Prohibited Language", "Please fix fields containing inappropriate language.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveEducation({
          id: edu.id,
          institution: edu.institution.trim() || "University / College",
          degree: edu.degree?.trim() || "",
          field: edu.field?.trim() || "",
          startDate: edu.startDate?.trim() || "",
          endDate: edu.endDate?.trim() || "",
          current: edu.current || false,
          gpa: edu.gpa?.trim() || "",
        });

        if (res && typeof res === "object" && !(res as any).success) {
          showToast("error", "Update Blocked", (res as any).error || "Failed to save education");
          return;
        }

        if (res && typeof res === "object" && (res as any).unpublishWarning) {
          showToast("error", "Saved as Draft", (res as any).error || "Education saved as draft due to safety review.");
          return;
        }

        showToast("success", "Education Saved", `"${edu.institution}" updated successfully.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to save education";
        showToast("error", "Update Failed", msg);
      }
    });
  };

  const handleDeleteEducation = (id: string, institution: string) => {
    if (!confirm(`Are you sure you want to delete "${institution || "this education"}"?`)) return;
    startTransition(async () => {
      try {
        await deleteEducation(id);
        setEducations((prev) => prev.filter((e) => e.id !== id));
        if (editingId === id) setEditingId(null);
        showToast("success", "Deleted", `Education record removed successfully.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete education";
        showToast("error", "Delete Failed", msg);
      }
    });
  };

  const handleFieldChange = (
    id: string,
    key: keyof EducationItem,
    value: string | boolean
  ) => {
    setEducations((prev) =>
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
        title="Education"
        action={
          <Btn
            variant="primary"
            size="sm"
            onClick={handleAddEducation}
            disabled={isPending}
          >
            <Plus size={13} /> Add education
          </Btn>
        }
      />

      {educations.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-[3px] bg-card/40">
          <GraduationCap size={24} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No education added yet.</p>
          <Btn
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={handleAddEducation}
            disabled={isPending}
          >
            <Plus size={13} /> Add your first education
          </Btn>
        </div>
      )}

      <div className="space-y-3">
        {educations.map((e) => {
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
                    {e.institution || <span className="text-muted-foreground italic">Institution</span>}
                  </span>
                  {(e.degree || e.field) && (
                    <span className="text-xs text-muted-foreground">
                      — {e.degree} {e.field ? `in ${e.field}` : ""}
                    </span>
                  )}
                  {e.gpa && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-[2px] font-medium border border-border/40">
                      GPA: {e.gpa}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDeleteEducation(e.id, e.institution);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-[3px] cursor-pointer"
                    title="Delete education"
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
                  <Field
                    label="Institution / University"
                    value={e.institution}
                    onChange={(v) => handleFieldChange(e.id, "institution", v)}
                    placeholder="e.g. Thapar Institute of Engineering & Technology"
                    error={!checkLocalProfanity(e.institution).isSafe ? "Institution contains prohibited language" : undefined}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Degree"
                      value={e.degree || ""}
                      onChange={(v) => handleFieldChange(e.id, "degree", v)}
                      placeholder="e.g. Bachelor of Engineering (B.E.)"
                      error={e.degree && !checkLocalProfanity(e.degree).isSafe ? "Degree contains prohibited language" : undefined}
                    />
                    <Field
                      label="Field of study / Branch"
                      value={e.field || ""}
                      onChange={(v) => handleFieldChange(e.id, "field", v)}
                      placeholder="e.g. Computer Science and Engineering"
                      error={e.field && !checkLocalProfanity(e.field).isSafe ? "Field of study contains prohibited language" : undefined}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        End Year / Expected
                      </label>
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
                    </div>
                    <Field
                      label="GPA / CGPA"
                      value={e.gpa || ""}
                      onChange={(v) => handleFieldChange(e.id, "gpa", v)}
                      placeholder="9.4 / 10.0"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Btn
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateEducation(e)}
                      disabled={isPending}
                    >
                      <Check size={13} /> Save education
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
