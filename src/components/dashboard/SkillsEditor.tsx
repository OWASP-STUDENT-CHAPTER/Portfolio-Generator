"use client";

import React, { useState, useTransition } from "react";
import { updateSkills } from "@/actions/website";
import {
  Plus,
  Trash2,
  X,
  Code2,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Btn, Field, SectionHeader, Card } from "@/components/ui/Primitives";
import { checkLocalProfanity } from "@/lib/moderation/veil-local";

interface SkillItem {
  id?: string;
  name: string;
  category?: string | null;
}

interface SkillGroup {
  id: string;
  category: string;
  items: string[];
}

const PRESET_CATEGORIES = [
  {
    category: "Languages",
    suggestions: ["TypeScript", "JavaScript", "Python", "C++", "Java", "Go", "Rust", "SQL", "HTML/CSS"],
  },
  {
    category: "Frontend",
    suggestions: ["React", "Next.js", "Tailwind CSS", "Vue.js", "Redux", "Zustand", "Framer Motion"],
  },
  {
    category: "Backend",
    suggestions: ["Node.js", "Express", "FastAPI", "Django", "PostgreSQL", "MongoDB", "Redis", "Prisma"],
  },
  {
    category: "DevOps & Cloud",
    suggestions: ["Docker", "Kubernetes", "AWS", "Git & GitHub", "CI/CD", "Linux", "Vercel"],
  },
];

export default function SkillsEditor({
  initialSkills,
}: {
  initialSkills: SkillItem[];
}) {
  // Group existing skills by category
  const initGroups = (): SkillGroup[] => {
    if (initialSkills.length === 0) {
      return [
        { id: "1", category: "Languages", items: ["TypeScript", "Python", "C++"] },
        { id: "2", category: "Frontend", items: ["React", "Next.js", "Tailwind CSS"] },
        { id: "3", category: "Backend", items: ["Node.js", "PostgreSQL", "Prisma"] },
      ];
    }

    const map = new Map<string, string[]>();
    for (const s of initialSkills) {
      const cat = s.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s.name);
    }

    return Array.from(map.entries()).map(([category, items], idx) => ({
      id: String(idx + 1),
      category,
      items,
    }));
  };

  const [groups, setGroups] = useState<SkillGroup[]>(initGroups());
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
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

  const addGroup = (categoryName = "New Category") => {
    setGroups((prev) => [
      ...prev,
      { id: Date.now().toString(), category: categoryName, items: [] },
    ]);
  };

  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const updateCategory = (id: string, category: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, category } : g))
    );
  };

  const updateItems = (id: string, items: string[]) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, items } : g))
    );
  };

  const addItemToGroup = (groupId: string, item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    const check = checkLocalProfanity(trimmed);
    if (!check.isSafe) {
      showToast("error", "Prohibited Language", "This skill name contains inappropriate language.");
      return;
    }
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        if (g.items.includes(trimmed)) return g;
        return { ...g, items: [...g.items, trimmed] };
      })
    );
  };

  const removeItemFromGroup = (groupId: string, item: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, items: g.items.filter((i) => i !== item) }
          : g
      )
    );
  };

  const handleSave = () => {
    const payload: { name: string; category?: string }[] = [];
    for (const g of groups) {
      const catCheck = checkLocalProfanity(g.category);
      if (!catCheck.isSafe) {
        showToast("error", "Prohibited Language", `Category "${g.category}" contains inappropriate language.`);
        return;
      }
      for (const item of g.items) {
        if (item.trim()) {
          const itemCheck = checkLocalProfanity(item);
          if (!itemCheck.isSafe) {
            showToast("error", "Prohibited Language", `Skill "${item}" contains inappropriate language.`);
            return;
          }
          payload.push({
            name: item.trim(),
            category: g.category.trim() || "General",
          });
        }
      }
    }

    startTransition(async () => {
      try {
        const res = await updateSkills(payload);

        if (res && typeof res === "object" && !(res as any).success) {
          showToast("error", "Update Blocked", (res as any).error || "Failed to save skills");
          return;
        }

        if (res && typeof res === "object" && (res as any).unpublishWarning) {
          showToast("error", "Saved as Draft", (res as any).error || "Skills saved as draft due to safety review.");
          return;
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        showToast("success", "Skills Saved", "Your technical skills have been updated on your live portfolio.");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to save skills";
        showToast("error", "Update Failed", msg);
      }
    });
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
        title="Skills"
        action={
          <div className="flex items-center gap-2">
            <Btn
              variant="secondary"
              size="sm"
              onClick={() => addGroup("New Category")}
              disabled={isPending}
            >
              <Plus size={13} /> Add category
            </Btn>
            <Btn
              variant={saved ? "secondary" : "primary"}
              size="sm"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? (
                "Saving..."
              ) : saved ? (
                <>
                  <Check size={13} /> Saved
                </>
              ) : (
                "Save changes"
              )}
            </Btn>
          </div>
        }
      />

      {groups.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-[3px] bg-card/40">
          <Code2 size={24} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No skills added yet.</p>
          <Btn
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => addGroup("Languages")}
          >
            <Plus size={13} /> Add skill category
          </Btn>
        </div>
      )}

      <div className="space-y-4">
        {groups.map((sg) => {
          const matchingPreset = PRESET_CATEGORIES.find(
            (p) => p.category.toLowerCase() === sg.category.toLowerCase()
          );

          return (
            <Card key={sg.id} className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Field
                    label="Category name"
                    value={sg.category}
                    onChange={(v) => updateCategory(sg.id, v)}
                    placeholder="e.g. Languages, Frontend, Backend, Cloud"
                    error={!checkLocalProfanity(sg.category).isSafe ? "Category contains prohibited language" : undefined}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeGroup(sg.id)}
                  className="p-1.5 mt-5 text-muted-foreground hover:text-destructive transition-colors rounded-[3px] cursor-pointer"
                  title="Remove category"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {(() => {
                const invalidSkill = sg.items.find((item) => !checkLocalProfanity(item).isSafe);
                return (
                  <Field
                    label="Skills (comma-separated or type below)"
                    value={sg.items.join(", ")}
                    onChange={(v) =>
                      updateItems(
                        sg.id,
                        v.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="TypeScript, Python, Go"
                    error={invalidSkill ? `Skill "${invalidSkill}" contains prohibited language` : undefined}
                  />
                );
              })()}

              {/* Active Skill Pills */}
              {sg.items.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sg.items.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-[3px] text-xs font-medium text-foreground border border-border/40"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeItemFromGroup(sg.id, item)}
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Preset Suggestions */}
              {matchingPreset && (
                <div className="pt-2 border-t border-border/40">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest mb-1.5 flex items-center gap-1">
                    <Sparkles size={11} /> Quick suggestions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {matchingPreset.suggestions
                      .filter((s) => !sg.items.includes(s))
                      .map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => addItemToGroup(sg.id, sug)}
                          className="text-[11px] px-2 py-0.5 rounded-[2px] bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Plus size={10} /> {sug}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
