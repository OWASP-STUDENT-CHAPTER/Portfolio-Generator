"use client";

import React, { useState, useTransition } from "react";
import { saveProject, deleteProject } from "@/actions/website";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Grip,
  Check,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
} from "lucide-react";
import { Btn, Field, SectionHeader, Tag } from "@/components/ui/Primitives";
import { checkLocalProfanity } from "@/lib/moderation/veil-local";

export interface ProjectItem {
  id: string;
  title: string;
  description?: string | null;
  tags?: string | null;
  liveUrl?: string | null;
  sourceUrl?: string | null;
  order: number;
}

export default function ProjectsEditor({
  initialProjects,
}: {
  initialProjects: ProjectItem[];
}) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [editingId, setEditingId] = useState<string | null>(
    initialProjects[0]?.id || null
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

  const handleAddProject = () => {
    startTransition(async () => {
      try {
        const newProj = {
          title: "New Project",
          description: "",
          tags: "React, TypeScript",
          liveUrl: "",
          sourceUrl: "",
        };
        const res = await saveProject(newProj);
        if (res && typeof res === "object" && !(res as any).success) {
          showToast("error", "Error", (res as any).error || "Failed to add project");
          return;
        }
        window.location.reload();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to add project";
        showToast("error", "Error", msg);
      }
    });
  };

  const handleUpdateProject = (proj: ProjectItem) => {
    const titleCheck = checkLocalProfanity(proj.title);
    const tagsCheck = checkLocalProfanity(proj.tags || "");
    const descCheck = checkLocalProfanity(proj.description || "");

    if (!titleCheck.isSafe || !tagsCheck.isSafe || !descCheck.isSafe) {
      showToast("error", "Prohibited Language", "Please fix fields containing inappropriate language.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveProject({
          id: proj.id,
          title: proj.title.trim() || "Untitled Project",
          description: proj.description?.trim() || "",
          tags: proj.tags?.trim() || "",
          liveUrl: proj.liveUrl?.trim() || "",
          sourceUrl: proj.sourceUrl?.trim() || "",
        });

        if (res && typeof res === "object" && !(res as any).success) {
          showToast("error", "Update Blocked", (res as any).error || "Failed to save project");
          return;
        }

        if (res && typeof res === "object" && (res as any).unpublishWarning) {
          showToast("error", "Saved as Draft", (res as any).error || "Project saved as draft due to safety review.");
          return;
        }

        showToast("success", "Project Saved", `"${proj.title}" updated successfully.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to save project";
        showToast("error", "Update Failed", msg);
      }
    });
  };

  const handleDeleteProject = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title || "this project"}"?`)) return;
    startTransition(async () => {
      try {
        await deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (editingId === id) setEditingId(null);
        showToast("success", "Deleted", `Project removed successfully.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete project";
        showToast("error", "Delete Failed", msg);
      }
    });
  };

  const handleFieldChange = (
    id: string,
    key: keyof ProjectItem,
    value: string
  ) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: value } : p))
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
        title="Projects"
        action={
          <Btn
            variant="primary"
            size="sm"
            onClick={handleAddProject}
            disabled={isPending}
          >
            <Plus size={13} /> Add project
          </Btn>
        }
      />

      {projects.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-[3px] bg-card/40">
          <Layers size={24} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No projects yet.</p>
          <Btn
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={handleAddProject}
            disabled={isPending}
          >
            <Plus size={13} /> Add your first project
          </Btn>
        </div>
      )}

      <div className="space-y-3">
        {projects.map((p) => {
          const isExpanded = editingId === p.id;
          const techList = p.tags ? p.tags.split(",").map((s) => s.trim()).filter(Boolean) : [];

          return (
            <div
              key={p.id}
              className="bg-card border border-border rounded-[3px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all"
            >
              {/* Accordion Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => setEditingId(isExpanded ? null : p.id)}
              >
                <Grip size={14} className="text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {p.title || <span className="text-muted-foreground italic">Untitled project</span>}
                  </div>
                  {techList.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {techList.slice(0, 4).map((tech) => (
                        <Tag key={tech}>{tech}</Tag>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(p.id, p.title);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-[3px] cursor-pointer"
                    title="Delete project"
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
                      label="Project title"
                      value={p.title}
                      onChange={(v) => handleFieldChange(p.id, "title", v)}
                      placeholder="e.g. CampusConnect"
                      error={!checkLocalProfanity(p.title).isSafe ? "Project title contains prohibited language" : undefined}
                    />
                    <Field
                      label="Tech stack (comma-separated)"
                      value={p.tags || ""}
                      onChange={(v) => handleFieldChange(p.id, "tags", v)}
                      placeholder="React, TypeScript, Supabase"
                      error={p.tags && !checkLocalProfanity(p.tags).isSafe ? "Tech stack contains prohibited language" : undefined}
                    />
                  </div>

                  <Field
                    label="Description"
                    value={p.description || ""}
                    onChange={(v) => handleFieldChange(p.id, "description", v)}
                    multiline
                    rows={3}
                    placeholder="What did you build, what problem does it solve, and what technologies did you use?"
                    error={p.description && !checkLocalProfanity(p.description).isSafe ? "Description contains prohibited language" : undefined}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Live Demo URL"
                      type="url"
                      value={p.liveUrl || ""}
                      onChange={(v) => handleFieldChange(p.id, "liveUrl", v)}
                      placeholder="https://myproject.com"
                      error={p.liveUrl && !checkLocalProfanity(p.liveUrl).isSafe ? "Live URL contains prohibited language or invalid scripts" : undefined}
                    />
                    <Field
                      label="GitHub / Source Code URL"
                      type="url"
                      value={p.sourceUrl || ""}
                      onChange={(v) => handleFieldChange(p.id, "sourceUrl", v)}
                      placeholder="https://github.com/username/repo"
                      error={p.sourceUrl && !checkLocalProfanity(p.sourceUrl).isSafe ? "Source URL contains prohibited language or invalid scripts" : undefined}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Btn
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateProject(p)}
                      disabled={isPending}
                    >
                      <Check size={13} /> Save project
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
