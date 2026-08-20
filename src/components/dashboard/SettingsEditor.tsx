"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { togglePublish, changeUsername } from "@/actions/website";
import { APP_CONFIG, getPublicSiteUrl } from "@/lib/config";
import { getTemplateById } from "@/templates/registry";
import {
  Globe,
  Copy,
  CheckCheck,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldCheck,
  Edit2,
} from "lucide-react";
import { Btn, Card, SectionHeader, cn } from "@/components/ui/Primitives";

interface SettingsEditorProps {
  initialUsername: string;
  initialPublished: boolean;
  templateId: string;
  userEmail?: string | null;
}

export default function SettingsEditor({
  initialUsername,
  initialPublished,
  templateId,
  userEmail,
}: SettingsEditorProps) {
  const [username, setUsername] = useState(initialUsername);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState(initialUsername);
  const [published, setPublished] = useState(initialPublished);
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = () => {
    const fullUrl = getPublicSiteUrl(username);
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePublish = (publishState: boolean) => {
    startTransition(async () => {
      try {
        const res = await togglePublish(publishState);
        if (res && typeof res === "object" && !res.success) {
          showToast("error", "Publish Blocked", res.error || "Failed to publish portfolio");
          setPublished(false);
          return;
        }
        setPublished(publishState);
        showToast(
          "success",
          publishState ? "Published" : "Unpublished",
          publishState
            ? `Your website is live at ${username}.${APP_CONFIG.rootDomain}`
            : "Your website is now in draft mode."
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to change publication status";
        showToast("error", "Error", msg);
      }
    });
  };

  const handleSaveUsername = () => {
    if (!newUsernameInput.trim() || newUsernameInput === username) {
      setEditingUsername(false);
      return;
    }

    startTransition(async () => {
      try {
        const res = await changeUsername(newUsernameInput);
        if (res && typeof res === "object" && !res.success) {
          showToast("error", "Claim Failed", res.error || "Failed to update username");
          return;
        }
        if (res && typeof res === "object" && res.unpublishWarning) {
          showToast("error", "Saved as Draft", res.error || "Subdomain updated, but saved as draft.");
          if (res.username) setUsername(res.username);
          setEditingUsername(false);
          setPublished(false);
          return;
        }
        if (res.success && res.username) {
          setUsername(res.username);
          setEditingUsername(false);
          showToast(
            "success",
            "Username Updated",
            `Your portfolio is now at ${res.username}.${APP_CONFIG.rootDomain}`
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update username";
        showToast("error", "Claim Failed", msg);
      }
    });
  };

  const template = getTemplateById(templateId);

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

      <SectionHeader title="Settings & Publishing" />

      <div className="space-y-4">
        {/* URL Card */}
        <Card className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Your portfolio URL</h3>
            <p className="text-xs text-muted-foreground">
              This is the permanent link you share on resumes, LinkedIn, and social profiles.
            </p>
          </div>

          {!editingUsername ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-[3px] font-mono-code text-xs text-foreground">
                <Globe size={13} className="text-muted-foreground shrink-0" />
                <span>
                  {username}.{APP_CONFIG.rootDomain}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Btn variant="secondary" size="md" onClick={handleCopyLink}>
                  {copied ? (
                    <>
                      <CheckCheck size={13} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy Link
                    </>
                  )}
                </Btn>
                <Btn
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setNewUsernameInput(username);
                    setEditingUsername(true);
                  }}
                >
                  <Edit2 size={13} /> Change
                </Btn>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center rounded-[3px] border border-border overflow-hidden bg-input-background focus-within:ring-1 focus-within:ring-foreground/30">
                <input
                  type="text"
                  value={newUsernameInput}
                  onChange={(e) => setNewUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="username"
                  className="flex-1 px-3 py-2 text-xs font-mono-code bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                />
                <span className="px-3 py-2 text-xs text-muted-foreground font-mono-code bg-muted border-l border-border select-none">
                  .{APP_CONFIG.rootDomain}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Btn
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingUsername(false)}
                >
                  Cancel
                </Btn>
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={handleSaveUsername}
                  disabled={isPending}
                >
                  {isPending ? "Checking..." : "Claim Subdomain"}
                </Btn>
              </div>
            </div>
          )}
        </Card>

        {/* Publication Status Card */}
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Publication status</h3>
              <p className="text-xs text-muted-foreground">
                {published
                  ? "Your portfolio is live and publicly accessible on the web."
                  : "Your portfolio is currently in draft mode. Only you can view it."}
              </p>
            </div>
            <div
              className={cn(
                "text-xs px-3 py-1.5 rounded-[3px] font-medium border self-start sm:self-auto inline-flex items-center gap-1.5",
                published
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-muted border-border text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  published ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                )}
              />
              <span>{published ? "Published" : "Draft"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {published ? (
              <>
                <a
                  href={getPublicSiteUrl(username)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Btn variant="secondary" size="md">
                    <Eye size={14} /> View live site
                  </Btn>
                </a>
                <Btn
                  variant="danger"
                  size="md"
                  onClick={() => handleTogglePublish(false)}
                  disabled={isPending}
                >
                  Unpublish
                </Btn>
              </>
            ) : (
              <Btn
                variant="accent"
                size="md"
                onClick={() => handleTogglePublish(true)}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Publishing…
                  </>
                ) : (
                  <>
                    <Globe size={14} /> Publish portfolio
                  </>
                )}
              </Btn>
            )}
          </div>
        </Card>

        {/* Template Summary Card */}
        <Card>
          <h3 className="text-sm font-semibold text-foreground mb-3">Active template</h3>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[3px] border border-border overflow-hidden shrink-0 flex items-center justify-center font-mono-code text-xs font-bold"
              style={{
                backgroundColor: template.id === "terminal" ? "#060C06" : "#f1f1f1",
                color: template.id === "terminal" ? "#33FF33" : "#111",
              }}
            >
              {template.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{template.name}</div>
              <div className="text-xs text-muted-foreground">{template.description}</div>
            </div>
            <Link href="/dashboard/templates" className="ml-auto">
              <Btn variant="secondary" size="sm">
                Change template
              </Btn>
            </Link>
          </div>
        </Card>

        {/* Account Authentication Card */}
        <Card className="bg-muted/40 border-border/60">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Signed in as <strong className="text-foreground">{userEmail || "Student"}</strong>.
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
