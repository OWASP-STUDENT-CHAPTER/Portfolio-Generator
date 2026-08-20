import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { APP_CONFIG } from "@/lib/config";
import { getTemplateById } from "@/templates/registry";
import {
  User,
  Layers,
  Briefcase,
  LayoutTemplate,
  Sparkles,
  Check,
  ChevronRight,
} from "lucide-react";
import { Btn, Card, cn } from "@/components/ui/Primitives";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const user = await requireAuth();
  const website = user.website;
  const username = website?.username || "student";
  const currentTemplate = getTemplateById(website?.templateId);

  const projects = website?.projects || [];
  const experiences = website?.experiences || [];
  const educations = website?.educations || [];
  const skills = website?.skills || [];
  const socialLinks = website?.socialLinks || [];

  const completeness = [
    { key: "name", label: "Name", done: !!user.name },
    { key: "title", label: "Title", done: !!website?.profile?.headline },
    { key: "bio", label: "Bio", done: !!website?.profile?.bio },
    { key: "projects", label: "Projects", done: projects.length > 0 },
    { key: "experience", label: "Experience", done: experiences.length > 0 },
    { key: "education", label: "Education", done: educations.length > 0 },
    { key: "skills", label: "Skills", done: skills.length > 0 },
    { key: "social", label: "Social links", done: socialLinks.length > 0 },
  ];

  const pct = Math.round(
    (completeness.filter((c) => c.done).length / completeness.length) * 100
  );

  const firstName = (user.name || "there").split(" ")[0];

  const initialWalkthroughData = {
    username,
    name: user.name,
    headline: website?.profile?.headline,
    location: website?.profile?.location,
    bio: website?.profile?.bio,
    avatarUrl: website?.profile?.avatarUrl || user.image,
    skills: skills.map((s) => ({ name: s.name, category: s.category })),
    projects: projects.map((p) => ({
      title: p.title,
      tags: p.tags,
      description: p.description,
      liveUrl: p.liveUrl,
      sourceUrl: p.sourceUrl,
    })),
    experiences: experiences.map((e) => ({
      role: e.role,
      company: e.company,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      description: e.description,
    })),
    socialLinks: socialLinks.map((l) => ({ platform: l.platform, url: l.url })),
    templateId: website?.templateId,
    published: website?.published,
    completenessPct: pct,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your portfolio is at{" "}
          <span className="font-mono-code text-foreground font-medium">
            {username}.{APP_CONFIG.rootDomain}
          </span>
          {" · "}
          <span
            className={
              website?.published
                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                : "text-amber-600 dark:text-amber-400 font-medium"
            }
          >
            {website?.published ? "Published" : "Draft"}
          </span>
        </p>
      </div>

      {/* Guided Walkthrough Launcher */}
      <DashboardClient initialData={initialWalkthroughData} />


      {/* Completeness Meter */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Profile completeness</h3>
          <span className="font-mono-code text-sm text-foreground font-semibold">
            {pct}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-foreground rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {completeness.map(({ key, label, done }) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                  done
                    ? "bg-foreground border-foreground text-background"
                    : "border-border text-transparent"
                )}
              >
                {done && <Check size={10} strokeWidth={3} />}
              </span>
              <span
                className={
                  done ? "text-foreground font-medium" : "text-muted-foreground"
                }
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Action Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Link
          href="/dashboard/profile"
          className="group text-left bg-card border border-border rounded-[3px] p-5 hover:border-foreground/30 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 bg-muted rounded-[3px] flex items-center justify-center text-foreground">
              <User size={15} />
            </div>
            <ChevronRight
              size={14}
              className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1"
            />
          </div>
          <div className="text-sm font-semibold mb-0.5 text-foreground">Edit profile</div>
          <div className="text-xs text-muted-foreground">
            {user.name ? `${user.name} · ${website?.profile?.headline || "No title yet"}` : "Name, bio, location, photo"}
          </div>
        </Link>

        <Link
          href="/dashboard/projects"
          className="group text-left bg-card border border-border rounded-[3px] p-5 hover:border-foreground/30 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 bg-muted rounded-[3px] flex items-center justify-center text-foreground">
              <Layers size={15} />
            </div>
            <ChevronRight
              size={14}
              className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1"
            />
          </div>
          <div className="text-sm font-semibold mb-0.5 text-foreground">Projects</div>
          <div className="text-xs text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? "s" : ""} added
          </div>
        </Link>

        <Link
          href="/dashboard/experience"
          className="group text-left bg-card border border-border rounded-[3px] p-5 hover:border-foreground/30 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 bg-muted rounded-[3px] flex items-center justify-center text-foreground">
              <Briefcase size={15} />
            </div>
            <ChevronRight
              size={14}
              className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1"
            />
          </div>
          <div className="text-sm font-semibold mb-0.5 text-foreground">Experience</div>
          <div className="text-xs text-muted-foreground">
            {experiences.length} role{experiences.length !== 1 ? "s" : ""} added
          </div>
        </Link>

        <Link
          href="/dashboard/templates"
          className="group text-left bg-card border border-border rounded-[3px] p-5 hover:border-foreground/30 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 bg-muted rounded-[3px] flex items-center justify-center text-foreground">
              <LayoutTemplate size={15} />
            </div>
            <ChevronRight
              size={14}
              className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1"
            />
          </div>
          <div className="text-sm font-semibold mb-0.5 text-foreground">Choose template</div>
          <div className="text-xs text-muted-foreground">
            Current: {currentTemplate.name}
          </div>
        </Link>

        {/* AI Import Banner Card */}
        <Card className="sm:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-1 text-foreground">AI Import</h3>
              <p className="text-xs text-muted-foreground">
                Paste your LinkedIn profile or resume to auto-fill all portfolio sections.
              </p>
            </div>
            <Link href="/dashboard/import">
              <Btn variant="accent" size="sm">
                <Sparkles size={13} /> Try AI Import
              </Btn>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
