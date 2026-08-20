"use client";

import React, { useState, useEffect } from "react";
import { TemplateProps } from "../types";
import { FluidParticles } from "./components/FluidParticles";
import { BlurFade } from "./components/BlurFade";
import { TextScramble } from "./components/TextScramble";
import { Dock, DockIcon } from "./components/Dock";
import { ResumeCard } from "./components/ResumeCard";
import { ProjectCard } from "./components/ProjectCard";
import { HackathonCard } from "./components/HackathonCard";
import { Icons } from "./components/Icons";
import {
  Home,
  Mail,
  FileText,
  Sun,
  Moon,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

export default function MagicTemplate({
  profile,
  projects = [],
  experiences = [],
  educations = [],
  skills = [],
  socialLinks = [],
}: TemplateProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setIsDark(true);
    }
  };

  const getSocial = (platform: string) => {
    return socialLinks.find(
      (l) => l.platform.toLowerCase() === platform.toLowerCase()
    )?.url;
  };

  const githubUrl = getSocial("github");
  const linkedinUrl = getSocial("linkedin");
  const twitterUrl = getSocial("twitter") || getSocial("x");
  const emailUrl = getSocial("mail") || (profile.email ? `mailto:${profile.email}` : undefined);

  // Group skills by category if available
  const skillsList = skills.map((s) => s.name);

  // Check if any projects or custom notes represent hackathons
  const hackathonProjects = projects.filter(
    (p) =>
      p.tags?.toLowerCase().includes("hackathon") ||
      p.title.toLowerCase().includes("hack") ||
      p.tags?.toLowerCase().includes("winner") ||
      p.tags?.toLowerCase().includes("award")
  );

  const standardProjects = projects.filter(
    (p) => !hackathonProjects.includes(p)
  );

  const BLUR_FADE_DELAY = 0.05;

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background font-sans antialiased overflow-x-hidden pb-28">
      {/* Interactive Fluid Particles Background */}
      <FluidParticles particleCount={48} noiseIntensity={0.0012} />

      {/* Main Container */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 space-y-12 sm:space-y-16">
        {/* ================= HERO SECTION ================= */}
        <section id="hero" className="space-y-4">
          <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <BlurFade delay={BLUR_FADE_DELAY}>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>Hi, I&apos;m</span>
                  <TextScramble
                    text={profile.name || "Developer"}
                    className="text-foreground underline decoration-border decoration-2 underline-offset-4"
                  />
                </h1>
              </BlurFade>

              <BlurFade delay={BLUR_FADE_DELAY * 2}>
                <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-md leading-relaxed">
                  {profile.headline || "Full-Stack Engineer & Creative Builder"}
                </p>
              </BlurFade>

              {profile.location && (
                <BlurFade delay={BLUR_FADE_DELAY * 2.5}>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                    <MapPin size={12} className="text-muted-foreground/70" />
                    <span>{profile.location}</span>
                  </div>
                </BlurFade>
              )}
            </div>

            {/* Avatar */}
            <BlurFade delay={BLUR_FADE_DELAY}>
              <div className="relative group shrink-0">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name || "Profile"}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-border shadow-md ring-2 ring-background transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted border-2 border-border flex items-center justify-center text-xl font-bold text-muted-foreground">
                    {(profile.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>
              </div>
            </BlurFade>
          </div>

          {/* About / Bio */}
          {profile.bio && (
            <BlurFade delay={BLUR_FADE_DELAY * 3}>
              <div className="pt-2 text-xs sm:text-sm text-muted-foreground/90 leading-relaxed space-y-2 whitespace-pre-line">
                <p>{profile.bio}</p>
              </div>
            </BlurFade>
          )}
        </section>

        {/* ================= WORK EXPERIENCE ================= */}
        {experiences.length > 0 && (
          <section id="experience" className="space-y-4">
            <BlurFade delay={BLUR_FADE_DELAY * 4}>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono-code font-semibold uppercase tracking-wider bg-foreground text-background">
                  Work Experience
                </span>
              </div>
            </BlurFade>

            <div className="space-y-3">
              {experiences.map((exp, idx) => (
                <BlurFade key={exp.id || idx} delay={BLUR_FADE_DELAY * (5 + idx)}>
                  <ResumeCard
                    title={exp.company}
                    subtitle={exp.role}
                    period={`${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}`}
                    description={exp.description}
                  />
                </BlurFade>
              ))}
            </div>
          </section>
        )}

        {/* ================= EDUCATION ================= */}
        {educations.length > 0 && (
          <section id="education" className="space-y-4">
            <BlurFade delay={BLUR_FADE_DELAY * 6}>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono-code font-semibold uppercase tracking-wider bg-foreground text-background">
                  Education
                </span>
              </div>
            </BlurFade>

            <div className="space-y-3">
              {educations.map((edu, idx) => (
                <BlurFade key={edu.id || idx} delay={BLUR_FADE_DELAY * (7 + idx)}>
                  <ResumeCard
                    title={edu.institution}
                    subtitle={`${edu.degree || ""}${edu.field ? ` in ${edu.field}` : ""}`}
                    period={`${edu.startDate || ""} - ${edu.endDate || "Present"}`}
                    description={edu.gpa ? `GPA: ${edu.gpa}` : undefined}
                    isEducation
                  />
                </BlurFade>
              ))}
            </div>
          </section>
        )}

        {/* ================= SKILLS ================= */}
        {skillsList.length > 0 && (
          <section id="skills" className="space-y-4">
            <BlurFade delay={BLUR_FADE_DELAY * 8}>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono-code font-semibold uppercase tracking-wider bg-foreground text-background">
                  Skills & Technologies
                </span>
              </div>
            </BlurFade>

            <BlurFade delay={BLUR_FADE_DELAY * 9}>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-[5px] text-xs font-mono-code font-medium bg-muted text-foreground border border-border/50 hover:bg-foreground hover:text-background transition-colors select-none"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </BlurFade>
          </section>
        )}

        {/* ================= PROJECTS ================= */}
        {projects.length > 0 && (
          <section id="projects" className="space-y-4">
            <BlurFade delay={BLUR_FADE_DELAY * 10}>
              <div className="space-y-1 text-center sm:text-left">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono-code font-semibold uppercase tracking-wider bg-foreground text-background inline-block">
                  Featured Projects
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pt-1">
                  Check out my latest work
                </h2>
                <p className="text-xs text-muted-foreground">
                  I&apos;ve built a variety of applications ranging from full-stack platforms to developer tools.
                </p>
              </div>
            </BlurFade>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {(standardProjects.length > 0 ? standardProjects : projects).map((project, idx) => {
                const tagsList = project.tags
                  ? project.tags.split(",").map((t) => t.trim()).filter(Boolean)
                  : [];
                return (
                  <BlurFade key={project.id || idx} delay={BLUR_FADE_DELAY * (11 + idx)}>
                    <ProjectCard
                      title={project.title}
                      description={project.description}
                      tags={tagsList}
                      liveUrl={project.liveUrl}
                      sourceUrl={project.sourceUrl}
                      imageUrl={project.imageUrl}
                    />
                  </BlurFade>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= HACKATHONS & AWARDS ================= */}
        {hackathonProjects.length > 0 && (
          <section id="hackathons" className="space-y-4">
            <BlurFade delay={BLUR_FADE_DELAY * 13}>
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono-code font-semibold uppercase tracking-wider bg-foreground text-background inline-block">
                  Hackathons & Awards
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground pt-1">
                  Competitions & Achievements
                </h2>
              </div>
            </BlurFade>

            <div className="pt-2 pl-2">
              {hackathonProjects.map((h, idx) => (
                <BlurFade key={h.id || idx} delay={BLUR_FADE_DELAY * (14 + idx)}>
                  <HackathonCard
                    title={h.title}
                    subtitle={h.tags || undefined}
                    description={h.description}
                    links={[
                      ...(h.liveUrl ? [{ title: "Demo", href: h.liveUrl }] : []),
                      ...(h.sourceUrl ? [{ title: "Source", href: h.sourceUrl }] : []),
                    ]}
                  />
                </BlurFade>
              ))}
            </div>
          </section>
        )}

        {/* ================= CONTACT SECTION ================= */}
        <section id="contact" className="space-y-4 text-center py-6">
          <BlurFade delay={BLUR_FADE_DELAY * 15}>
            <div className="space-y-2 max-w-md mx-auto">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono-code font-semibold uppercase tracking-wider bg-foreground text-background inline-block">
                Get in touch
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Let&apos;s build something together
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Want to discuss a project, internship opportunity, or just chat tech? Feel free to reach out.
              </p>

              {emailUrl && (
                <div className="pt-3">
                  <a
                    href={emailUrl}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm"
                  >
                    <Mail size={13} />
                    <span>Send me an email</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              )}
            </div>
          </BlurFade>
        </section>

        {/* ================= ATTRIBUTION FOOTER ================= */}
        <footer className="pt-6 pb-2 text-center">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <p className="text-[11px] text-muted-foreground/70 font-mono-code">
              This template is inspired by portfolio of{" "}
              <a
                href="https://aayushbindal.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/90 underline decoration-muted-foreground/40 hover:decoration-foreground transition-colors"
              >
                aayushbindal.me
              </a>
            </p>
          </BlurFade>
        </footer>
      </main>

      {/* ================= FLOATING BOTTOM DOCK ================= */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <Dock>
            <DockIcon tooltip="Home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <Home size={18} />
            </DockIcon>

            {githubUrl && (
              <DockIcon tooltip="GitHub" href={githubUrl}>
                <Icons.gitHub className="w-4 h-4 text-foreground" />
              </DockIcon>
            )}

            {linkedinUrl && (
              <DockIcon tooltip="LinkedIn" href={linkedinUrl}>
                <Icons.linkedIn className="w-4 h-4 text-foreground" />
              </DockIcon>
            )}

            {twitterUrl && (
              <DockIcon tooltip="Twitter / X" href={twitterUrl}>
                <Icons.x className="w-4 h-4 text-foreground" />
              </DockIcon>
            )}

            {emailUrl && (
              <DockIcon tooltip="Email" href={emailUrl}>
                <Mail size={18} />
              </DockIcon>
            )}

            {profile.resumeUrl && (
              <DockIcon tooltip="Resume" href={profile.resumeUrl}>
                <FileText size={18} />
              </DockIcon>
            )}

            <div className="h-5 w-px bg-border/60 mx-0.5" />

            <DockIcon tooltip={isDark ? "Light Mode" : "Dark Mode"} onClick={toggleTheme}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </DockIcon>
          </Dock>
        </div>
      </div>
    </div>
  );
}
