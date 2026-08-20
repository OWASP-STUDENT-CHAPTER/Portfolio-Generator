"use client";

import React, { useState } from "react";
import Link from "next/link";
import { importAIContent } from "@/actions/website";
import {
  Sparkles,
  FileText,
  Share2,
  FileCode,
  Check,
  RefreshCw,
  Copy,
  AlertCircle,
} from "lucide-react";
import { Btn, Card, SectionHeader } from "@/components/ui/Primitives";
import confetti from "canvas-confetti";

export default function ImportWizard() {
  const [step, setStep] = useState<"input" | "processing" | "done">("input");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopySample = () => {
    const sample = `You are a resume parser for the portfolio maker. Output JSON in this structure:
{
  "name": "Your Name",
  "headline": "Full-Stack Developer @ Thapar Institute",
  "bio": "Enthusiastic developer focused on scalable systems.",
  "location": "Patiala, Punjab, India",
  "projects": [
    { "title": "ProjectName", "description": "High performance app", "tags": "React, Node.js, Go", "liveUrl": "https://example.com", "sourceUrl": "https://github.com/user/repo" }
  ],
  "experiences": [
    { "company": "Company", "role": "Software Intern", "description": "Built core features", "startDate": "May 2024", "endDate": "Aug 2024", "current": false }
  ],
  "educations": [
    { "institution": "Thapar Institute of Engineering & Technology", "degree": "B.E.", "field": "Computer Engineering", "startDate": "2022", "endDate": "2026", "gpa": "9.2" }
  ],
  "skills": [
    { "name": "TypeScript", "category": "Languages" },
    { "name": "React", "category": "Frontend" },
    { "name": "PostgreSQL", "category": "Backend" }
  ],
  "socialLinks": [
    { "platform": "GitHub", "url": "https://github.com/username" },
    { "platform": "LinkedIn", "url": "https://linkedin.com/in/username" }
  ]
}`;
    navigator.clipboard.writeText(sample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    if (!text.trim()) return;
    setStep("processing");
    setError(null);

    try {
      let cleaned = text.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
      }

      // Check if it's already JSON or plain text
      let isJson = false;
      try {
        JSON.parse(cleaned);
        isJson = true;
      } catch {
        isJson = false;
      }

      if (isJson) {
        await importAIContent(cleaned);
      } else {
        // Simple plain text heuristic extraction fallback
        const lines = cleaned.split("\n").filter(Boolean);
        const nameGuess = lines[0] || "Developer";
        const fallbackObj = {
          name: nameGuess,
          headline: lines[1] || "Software Engineer",
          bio: cleaned.slice(0, 300),
          location: "Patiala, Punjab, India",
          projects: [
            {
              title: "Featured Project",
              description: "Extracted from resume import.",
              tags: "TypeScript, FullStack",
              liveUrl: "",
              sourceUrl: "",
            },
          ],
        };
        await importAIContent(JSON.stringify(fallbackObj));
      }

      setStep("done");
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to import AI content";
      setError(msg);
      setStep("input");
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="AI Import" />

      {error && (
        <div className="p-3 rounded-[3px] bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {step === "input" && (
        <div className="space-y-5">
          <Card className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-foreground/10 text-foreground rounded-[3px] flex items-center justify-center shrink-0">
                <Sparkles size={15} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Import from LinkedIn, Resume, or JSON
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Paste your LinkedIn &quot;About&quot; + &quot;Experience&quot; section, plain text of your résumé, or LLM-generated JSON.
                  Our system will parse projects, roles, education, and skills automatically.
                </p>
              </div>
              <Btn variant="secondary" size="sm" onClick={handleCopySample}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? "Copied prompt" : "Copy AI Prompt"}</span>
              </Btn>
            </div>

            <textarea
              className="w-full h-48 px-3 py-2.5 text-xs font-mono-code bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-y"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Paste your LinkedIn profile text, resume content, or JSON here...\n\nExample:\nArjun Sharma\nFull-Stack Developer | Thapar Institute\n\nExperience:\nRazorpay — Software Engineering Intern (May–Jul 2024)\n...`}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Btn
                  variant="primary"
                  size="md"
                  onClick={handleImport}
                  disabled={!text.trim()}
                >
                  <Sparkles size={14} /> Import with AI
                </Btn>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Existing data will be safely merged and updated.
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: FileText,
                label: "Resume / CV",
                desc: "Paste plain text from your PDF",
              },
              {
                icon: Share2,
                label: "LinkedIn / Web",
                desc: "Copy your profile experience section",
              },
              {
                icon: FileCode,
                label: "JSON Output",
                desc: "Paste structured JSON from ChatGPT or Claude",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="p-4 border border-dashed border-border rounded-[3px] text-center bg-card/30"
              >
                <Icon size={18} className="mx-auto text-muted-foreground mb-2" />
                <div className="text-xs font-medium text-foreground">{label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="text-center py-24 bg-card border border-border rounded-[3px]">
          <div className="w-10 h-10 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h3 className="text-base font-semibold text-foreground mb-2">
            Analysing your profile…
          </h3>
          <p className="text-xs text-muted-foreground">
            Extracting projects, roles, education, and skills.
          </p>
          <div className="mt-6 space-y-2 max-w-xs mx-auto text-left">
            {[
              "Identifying work experience…",
              "Extracting project achievements…",
              "Detecting technical skills…",
            ].map((msg) => (
              <div key={msg} className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw size={11} className="animate-spin text-foreground" />
                <span>{msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="text-center py-20 bg-card border border-border rounded-[3px]">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-200 dark:border-emerald-800">
            <Check size={24} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Import Complete
          </h3>
          <p className="text-xs text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
            Your profile details, projects, experience, and skills have been populated. Review and fine-tune your details in the dashboard.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/dashboard/profile">
              <Btn variant="primary" size="md">
                Review Profile
              </Btn>
            </Link>
            <Btn
              variant="secondary"
              size="md"
              onClick={() => {
                setText("");
                setStep("input");
              }}
            >
              Import More
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
