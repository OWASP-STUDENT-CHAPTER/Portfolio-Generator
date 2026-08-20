"use client";

import React, { useState, useTransition } from "react";
import { updateSocialLinks } from "@/actions/website";
import {
  Check,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Btn, Card, SectionHeader } from "@/components/ui/Primitives";
import { checkLocalProfanity } from "@/lib/moderation/veil-local";
import { ProfanityWarning } from "@/components/ui/ProfanityWarning";
import { cn } from "@/components/ui/Primitives";

interface SocialLinkItem {
  id?: string;
  platform: string;
  url: string;
}

export default function SocialEditor({
  initialLinks,
  userEmail,
}: {
  initialLinks: SocialLinkItem[];
  userEmail?: string | null;
}) {
  const linkMap = new Map(
    initialLinks.map((l) => [l.platform.toLowerCase(), l.url])
  );

  // Helper to extract handle from full URL
  const extractHandle = (url: string, prefix: string) => {
    if (!url) return "";
    if (url.startsWith(prefix)) return url.slice(prefix.length);
    if (url.startsWith("https://" + prefix)) return url.slice(("https://" + prefix).length);
    if (url.startsWith("http://" + prefix)) return url.slice(("http://" + prefix).length);
    return url;
  };

  const [github, setGithub] = useState(
    extractHandle(linkMap.get("github") || "", "github.com/")
  );
  const [linkedin, setLinkedin] = useState(
    extractHandle(linkMap.get("linkedin") || "", "linkedin.com/in/")
  );
  const [twitter, setTwitter] = useState(
    extractHandle(linkMap.get("twitter") || "", "twitter.com/") ||
      extractHandle(linkMap.get("twitter") || "", "x.com/")
  );
  const [leetcode, setLeetcode] = useState(
    extractHandle(linkMap.get("leetcode") || "", "leetcode.com/u/")
  );
  const [email, setEmail] = useState(
    (linkMap.get("mail") || linkMap.get("email") || (userEmail ? `mailto:${userEmail}` : ""))
      .replace(/^mailto:/, "")
  );

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

  // Real-time live validations
  const ghCheck = checkLocalProfanity(github);
  const liCheck = checkLocalProfanity(linkedin);
  const twCheck = checkLocalProfanity(twitter);
  const lcCheck = checkLocalProfanity(leetcode);
  const emCheck = checkLocalProfanity(email);
  const isFormClean = ghCheck.isSafe && liCheck.isSafe && twCheck.isSafe && lcCheck.isSafe && emCheck.isSafe;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isFormClean) {
      showToast("error", "Prohibited Text", "One or more social links contain inappropriate text.");
      return;
    }

    startTransition(async () => {
      try {
        const payload: { platform: string; url: string }[] = [];
        if (github.trim()) {
          const ghVal = github.trim().startsWith("http")
            ? github.trim()
            : `https://github.com/${github.trim().replace(/^@/, "")}`;
          payload.push({ platform: "GitHub", url: ghVal });
        }
        if (linkedin.trim()) {
          const liVal = linkedin.trim().startsWith("http")
            ? linkedin.trim()
            : `https://linkedin.com/in/${linkedin.trim().replace(/^@/, "")}`;
          payload.push({ platform: "LinkedIn", url: liVal });
        }
        if (twitter.trim()) {
          const twVal = twitter.trim().startsWith("http")
            ? twitter.trim()
            : `https://x.com/${twitter.trim().replace(/^@/, "")}`;
          payload.push({ platform: "Twitter", url: twVal });
        }
        if (leetcode.trim()) {
          const lcVal = leetcode.trim().startsWith("http")
            ? leetcode.trim()
            : `https://leetcode.com/u/${leetcode.trim()}`;
          payload.push({ platform: "LeetCode", url: lcVal });
        }
        if (email.trim()) {
          const emVal = email.trim().startsWith("mailto:")
            ? email.trim()
            : `mailto:${email.trim()}`;
          payload.push({ platform: "Mail", url: emVal });
        }

        const res = await updateSocialLinks(payload);

        if (res && typeof res === "object" && !(res as any).success) {
          showToast("error", "Update Blocked", (res as any).error || "Failed to save social links");
          return;
        }

        if (res && typeof res === "object" && (res as any).unpublishWarning) {
          showToast("error", "Saved as Draft", (res as any).error || "Links saved as draft due to safety review.");
          return;
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        showToast("success", "Links Saved", "Your public contact and social links have been updated.");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to save social links";
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

      <form onSubmit={handleSave}>
        <SectionHeader
          title="Social & Links"
          action={
            <Btn
              type="submit"
              variant={saved ? "secondary" : "primary"}
              size="sm"
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
          }
        />

        <Card className="space-y-4">
          {/* GitHub */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              GitHub
            </label>
            <div className={cn(
              "flex rounded-[3px] border border-border overflow-hidden bg-input-background focus-within:ring-1 focus-within:ring-foreground/30 focus-within:border-foreground/40",
              github.trim() && !ghCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
            )}>
              <span className="px-3 py-2 text-xs text-muted-foreground font-mono-code bg-muted/60 border-r border-border select-none flex items-center">
                github.com/
              </span>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="username"
                className="flex-1 px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <ProfanityWarning isFlagged={Boolean(github.trim() && !ghCheck.isSafe)} reason="GitHub handle contains prohibited language" />
          </div>

          {/* LinkedIn */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              LinkedIn
            </label>
            <div className={cn(
              "flex rounded-[3px] border border-border overflow-hidden bg-input-background focus-within:ring-1 focus-within:ring-foreground/30 focus-within:border-foreground/40",
              linkedin.trim() && !liCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
            )}>
              <span className="px-3 py-2 text-xs text-muted-foreground font-mono-code bg-muted/60 border-r border-border select-none flex items-center">
                linkedin.com/in/
              </span>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="username"
                className="flex-1 px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <ProfanityWarning isFlagged={Boolean(linkedin.trim() && !liCheck.isSafe)} reason="LinkedIn handle contains prohibited language" />
          </div>

          {/* Twitter / X */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Twitter / X
            </label>
            <div className={cn(
              "flex rounded-[3px] border border-border overflow-hidden bg-input-background focus-within:ring-1 focus-within:ring-foreground/30 focus-within:border-foreground/40",
              twitter.trim() && !twCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
            )}>
              <span className="px-3 py-2 text-xs text-muted-foreground font-mono-code bg-muted/60 border-r border-border select-none flex items-center">
                x.com/
              </span>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="username"
                className="flex-1 px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <ProfanityWarning isFlagged={Boolean(twitter.trim() && !twCheck.isSafe)} reason="Twitter handle contains prohibited language" />
          </div>

          {/* LeetCode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              LeetCode
            </label>
            <div className={cn(
              "flex rounded-[3px] border border-border overflow-hidden bg-input-background focus-within:ring-1 focus-within:ring-foreground/30 focus-within:border-foreground/40",
              leetcode.trim() && !lcCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
            )}>
              <span className="px-3 py-2 text-xs text-muted-foreground font-mono-code bg-muted/60 border-r border-border select-none flex items-center">
                leetcode.com/u/
              </span>
              <input
                type="text"
                value={leetcode}
                onChange={(e) => setLeetcode(e.target.value)}
                placeholder="username"
                className="flex-1 px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <ProfanityWarning isFlagged={Boolean(leetcode.trim() && !lcCheck.isSafe)} reason="LeetCode handle contains prohibited language" />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Contact Email
            </label>
            <div className={cn(
              "flex rounded-[3px] border border-border overflow-hidden bg-input-background focus-within:ring-1 focus-within:ring-foreground/30 focus-within:border-foreground/40",
              email.trim() && !emCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
            )}>
              <span className="px-3 py-2 text-xs text-muted-foreground font-mono-code bg-muted/60 border-r border-border select-none flex items-center">
                mailto:
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <ProfanityWarning isFlagged={Boolean(email.trim() && !emCheck.isSafe)} reason="Email address contains prohibited language or invalid format" />
          </div>
        </Card>
      </form>
    </div>
  );
}
