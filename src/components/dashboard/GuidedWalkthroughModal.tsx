"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Copy,
  CheckCheck,
  ExternalLink,
  Globe,
  Plus,
  ArrowRight,
  Layers,
  Briefcase,
  Code2,
  User,
  Share2,
  LayoutTemplate,
  AlertCircle,
} from "lucide-react";
import { Btn, cn } from "@/components/ui/Primitives";
import { saveWalkthroughData } from "@/actions/website";
import { APP_CONFIG, getPublicSiteUrl } from "@/lib/config";
import { checkLocalProfanity } from "@/lib/moderation/veil-local";
import { ProfanityWarning } from "@/components/ui/ProfanityWarning";
import confetti from "canvas-confetti";

interface GuidedWalkthroughModalProps {
  initialData: {
    username: string;
    name?: string | null;
    headline?: string | null;
    location?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    skills?: { name: string; category?: string | null }[];
    projects?: {
      title: string;
      tags?: string | null;
      description?: string | null;
      liveUrl?: string | null;
      sourceUrl?: string | null;
    }[];
    experiences?: {
      role: string;
      company: string;
      startDate?: string | null;
      endDate?: string | null;
      current?: boolean;
      description?: string | null;
    }[];
    socialLinks?: { platform: string; url: string }[];
    templateId?: string | null;
    published?: boolean;
    completenessPct?: number;
  };
  forceOpen?: boolean;
  onCloseManual?: () => void;
}

const TEMPLATE_PREVIEWS = [
  { id: "magic", name: "Magic", desc: "Fluid particles, blur-fade, floating dock (inspired by aayushbindal.me)", tag: "Interactive", accent: "#3B82F6", bg: "#000000" },
  { id: "magic3d", name: "Magic 3D", desc: "3D celestial spiral & starfield (inspired by aayushbindal.me)", tag: "3D Visual", accent: "#EC4899", bg: "#030712" },
  { id: "craftsman", name: "Craftsman", desc: "Warm parchment, serif editorial", tag: "Editorial", accent: "#C4622D", bg: "#FBF8F2" },
  { id: "minimal", name: "Minimal", desc: "Clean Scandinavian whitespace", tag: "Clean", accent: "#000000", bg: "#FFFFFF" },
  { id: "developer", name: "Developer", desc: "Dark mode, syntax-highlighted", tag: "Code", accent: "#58A6FF", bg: "#0D1117" },
  { id: "editorial", name: "Editorial", desc: "Magazine asymmetry, drop caps", tag: "Editorial", accent: "#E05A47", bg: "#FAFAF8" },
  { id: "bento", name: "Bento", desc: "Modular card grid, Apple-style", tag: "Modular", accent: "#5856D6", bg: "#F0F0EE" },
  { id: "terminal", name: "Terminal", desc: "CRT glow, matrix green aesthetic", tag: "Terminal", accent: "#00FF41", bg: "#060C06" },
  { id: "spotlight", name: "Spotlight", desc: "Cinematic, dramatic presentation", tag: "Cinematic", accent: "#E5C07B", bg: "#070707" },
  { id: "elegant", name: "Elegant", desc: "Luxury restraint, gold accents", tag: "Luxury", accent: "#C9A84C", bg: "#0E0C09" },
  { id: "creative", name: "Creative", desc: "Neo-brutalist, high-energy", tag: "Vibrant", accent: "#FF2D55", bg: "#F5F500" },
  { id: "professional", name: "Professional", desc: "Executive résumé, navy header", tag: "Corporate", accent: "#2563EB", bg: "#FFFFFF" },
  { id: "academic", name: "Academic", desc: "Scholarly, research-forward", tag: "Research", accent: "#475569", bg: "#F9F8F5" },
  { id: "narrative", name: "Narrative", desc: "Case-study driven, long-form", tag: "Story", accent: "#3B5BDB", bg: "#F7F7F8" },
];

const POPULAR_SKILL_SUGGESTIONS = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Tailwind CSS",
  "Go",
  "Docker",
  "AWS",
  "Git",
  "C++",
  "Prisma",
  "GraphQL",
  "MongoDB",
];

export function GuidedWalkthroughModal({
  initialData,
  forceOpen,
  onCloseManual,
}: GuidedWalkthroughModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [moderationNotice, setModerationNotice] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  // Form State
  const [headline, setHeadline] = useState(initialData.headline || "");
  const [location, setLocation] = useState(
    initialData.location || "Patiala, Punjab, India"
  );
  const [bio, setBio] = useState(initialData.bio || "");

  // Skills
  const initialSkillsList =
    initialData.skills && initialData.skills.length > 0
      ? initialData.skills.map((s) => s.name)
      : [];
  const [skills, setSkills] = useState<string[]>(initialSkillsList);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Project
  const primaryProj = initialData.projects?.[0];
  const [projectTitle, setProjectTitle] = useState(primaryProj?.title || "");
  const [projectTags, setProjectTags] = useState(primaryProj?.tags || "");
  const [projectDescription, setProjectDescription] = useState(
    primaryProj?.description || ""
  );
  const [projectLiveUrl, setProjectLiveUrl] = useState(
    primaryProj?.liveUrl || ""
  );
  const [projectSourceUrl, setProjectSourceUrl] = useState(
    primaryProj?.sourceUrl || ""
  );

  // Experience
  const primaryExp = initialData.experiences?.[0];
  const [expRole, setExpRole] = useState(primaryExp?.role || "");
  const [expCompany, setExpCompany] = useState(primaryExp?.company || "");
  const [expStartDate, setExpStartDate] = useState(
    primaryExp?.startDate || "2023"
  );
  const [expEndDate, setExpEndDate] = useState(primaryExp?.endDate || "Present");
  const [expCurrent, setExpCurrent] = useState(primaryExp?.current ?? true);
  const [expDescription, setExpDescription] = useState(
    primaryExp?.description || ""
  );

  // Social Links
  const extractHandle = (platform: string, prefix: string) => {
    const found = initialData.socialLinks?.find(
      (l) => l.platform.toLowerCase() === platform.toLowerCase()
    );
    if (!found?.url) return "";
    let u = found.url;
    if (u.startsWith("https://" + prefix)) u = u.slice(("https://" + prefix).length);
    else if (u.startsWith("http://" + prefix)) u = u.slice(("http://" + prefix).length);
    else if (u.startsWith(prefix)) u = u.slice(prefix.length);
    else if (u.startsWith("mailto:")) u = u.slice("mailto:".length);
    return u;
  };

  const [github, setGithub] = useState(extractHandle("github", "github.com/"));
  const [linkedin, setLinkedin] = useState(extractHandle("linkedin", "linkedin.com/in/"));
  const [email, setEmail] = useState(extractHandle("mail", ""));

  // Template
  const [selectedTemplate, setSelectedTemplate] = useState(
    initialData.templateId || "craftsman"
  );

  // Auto-launch automatically if profile is not 100%
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    const isNotComplete = (initialData.completenessPct || 0) < 100;
    const isDismissedThisSession = sessionStorage.getItem("folio_walkthrough_dismissed");

    if (isNotComplete && !isDismissedThisSession) {
      setIsOpen(true);
    }
  }, [forceOpen, initialData.completenessPct]);

  const handleClose = () => {
    sessionStorage.setItem("folio_walkthrough_dismissed", "true");
    setIsOpen(false);
    if (onCloseManual) onCloseManual();
  };

  const handleAddSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const check = checkLocalProfanity(trimmed);
    if (!check.isSafe) {
      setStepError("This skill name contains prohibited language.");
      return;
    }
    if (!skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setCustomSkillInput("");
    setStepError(null);
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillName));
  };

  // Real-time live validations
  const headlineCheck = checkLocalProfanity(headline);
  const locationCheck = checkLocalProfanity(location);
  const bioCheck = checkLocalProfanity(bio);
  const customSkillCheck = checkLocalProfanity(customSkillInput);
  const projectTitleCheck = checkLocalProfanity(projectTitle);
  const projectTagsCheck = checkLocalProfanity(projectTags);
  const projectDescCheck = checkLocalProfanity(projectDescription);
  const expRoleCheck = checkLocalProfanity(expRole);
  const expCompanyCheck = checkLocalProfanity(expCompany);
  const expDescCheck = checkLocalProfanity(expDescription);
  const githubCheck = checkLocalProfanity(github);
  const linkedinCheck = checkLocalProfanity(linkedin);
  const emailCheck = checkLocalProfanity(email);

  const handleNext = () => {
    setStepError(null);

    // Validate Step 1
    if (step === 1) {
      if (!headlineCheck.isSafe) {
        setStepError("Your headline contains prohibited language. Please correct it to proceed.");
        return;
      }
      if (!locationCheck.isSafe) {
        setStepError("Your location contains prohibited language. Please correct it to proceed.");
        return;
      }
      if (!bioCheck.isSafe) {
        setStepError("Your bio contains prohibited language. Please correct it to proceed.");
        return;
      }
      setStep(2);
      return;
    }

    // Validate Step 2
    if (step === 2) {
      for (const s of skills) {
        if (!checkLocalProfanity(s).isSafe) {
          setStepError(`The skill "${s}" contains prohibited language. Please remove it.`);
          return;
        }
      }
      setStep(3);
      return;
    }

    // Validate Step 3
    if (step === 3) {
      if (projectTitle.trim() && !projectTitleCheck.isSafe) {
        setStepError("Your project title contains prohibited language. Please correct it.");
        return;
      }
      if (projectTags.trim() && !projectTagsCheck.isSafe) {
        setStepError("Your project tech stack contains prohibited language.");
        return;
      }
      if (projectDescription.trim() && !projectDescCheck.isSafe) {
        setStepError("Your project description contains prohibited language.");
        return;
      }
      setStep(4);
      return;
    }

    // Validate Step 4
    if (step === 4) {
      if (expRole.trim() && !expRoleCheck.isSafe) {
        setStepError("Your role title contains prohibited language.");
        return;
      }
      if (expCompany.trim() && !expCompanyCheck.isSafe) {
        setStepError("Your company name contains prohibited language.");
        return;
      }
      if (expDescription.trim() && !expDescCheck.isSafe) {
        setStepError("Your experience description contains prohibited language.");
        return;
      }
      setStep(5);
      return;
    }

    // Validate Step 5
    if (step === 5) {
      if (github.trim() && !githubCheck.isSafe) {
        setStepError("GitHub handle contains prohibited text.");
        return;
      }
      if (linkedin.trim() && !linkedinCheck.isSafe) {
        setStepError("LinkedIn handle contains prohibited text.");
        return;
      }
      if (email.trim() && !emailCheck.isSafe) {
        setStepError("Email handle contains prohibited text.");
        return;
      }
      setStep(6);
      return;
    }

    // Step 6: Final Submission
    if (step === 6) {
      startTransition(async () => {
        try {
          const res = await saveWalkthroughData({
            headline,
            location,
            bio,
            skills,
            project: projectTitle.trim()
              ? {
                  title: projectTitle,
                  tags: projectTags,
                  description: projectDescription,
                  liveUrl: projectLiveUrl,
                  sourceUrl: projectSourceUrl,
                }
              : null,
            experience:
              expRole.trim() || expCompany.trim()
                ? {
                    role: expRole,
                    company: expCompany,
                    startDate: expStartDate,
                    endDate: expEndDate,
                    current: expCurrent,
                    description: expDescription,
                  }
                : null,
            socialLinks: {
              github,
              linkedin,
              email,
            },
            templateId: selectedTemplate,
          });

          if (res.published === false) {
            setIsPublished(false);
            setModerationNotice(
              res.error || "Your portfolio was saved as a draft. Some content was flagged during safety review before it can be published live."
            );
            setStepError(
              res.error || "Publishing was blocked by safety review. Content saved as draft."
            );
            localStorage.setItem("folio_walkthrough_seen", "true");
            setStep(7); // Advance to completion screen showing draft state and moderation notice
            return;
          }

          setIsPublished(true);
          setModerationNotice(null);
          localStorage.setItem("folio_walkthrough_seen", "true");
          setStep(7); // Go to "Here is your link"
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (err) {
          console.error("Failed to complete walkthrough", err);
          const msg = err instanceof Error ? err.message : "Failed to complete walkthrough";
          setStepError(msg);
        }
      });
    }
  };

  const handleBack = () => {
    setStepError(null);
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleCopy = () => {
    const link = getPublicSiteUrl(initialData.username);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const totalSteps = 6;
  const progressPct = Math.round((Math.min(step, totalSteps) / totalSteps) * 100);
  const publicUrl = getPublicSiteUrl(initialData.username);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-card border border-border rounded-[4px] shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden my-auto max-h-[94vh]">
        {/* Header with Step Progress */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-foreground text-background rounded-[2px] flex items-center justify-center text-[10px] font-bold shrink-0">
                {APP_CONFIG.name.charAt(0)}
              </span>
              <span className="text-xs font-semibold tracking-tight text-foreground uppercase tracking-widest">
                Guided Setup
              </span>
              {step <= totalSteps && (
                <span className="text-[11px] sm:text-xs text-muted-foreground font-mono-code">
                  · {step}/{totalSteps}
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-[2px] cursor-pointer"
              title="Close and continue to dashboard"
            >
              <X size={16} />
            </button>
          </div>

          {step <= totalSteps && (
            <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
              <div
                className="bg-foreground h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Modal Body - Conversational Q&A */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 space-y-5 sm:space-y-6">
          {/* ================= STEP 1: IDENTITY & HEADLINE ================= */}
          {step === 1 && (
            <div className="space-y-5 sm:space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  <User size={13} />
                  <span>Profile & Identity</span>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                  What is your primary title and professional focus?
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  This appears at the top of your portfolio right below your name.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => {
                      setHeadline(e.target.value);
                      if (stepError) setStepError(null);
                    }}
                    placeholder="e.g. Full-Stack Engineer & AI Researcher"
                    className={cn(
                      "w-full px-3.5 py-2.5 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors font-sans",
                      !headlineCheck.isSafe && "border-destructive focus:border-destructive ring-1 ring-destructive/40"
                    )}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleNext();
                    }}
                  />
                  <ProfanityWarning isFlagged={!headlineCheck.isSafe} reason={headlineCheck.reason || "Headline contains prohibited language"} />
                  <p className="text-[11px] text-muted-foreground">
                    Example: Software Developer, Systems Engineer @ Thapar, Product Designer
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (stepError) setStepError(null);
                    }}
                    placeholder="e.g. Patiala, Punjab, India or San Francisco, CA"
                    className={cn(
                      "w-full px-3.5 py-2.5 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors font-sans",
                      !locationCheck.isSafe && "border-destructive focus:border-destructive ring-1 ring-destructive/40"
                    )}
                  />
                  <ProfanityWarning isFlagged={!locationCheck.isSafe} reason={locationCheck.reason || "Location contains prohibited language"} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    About / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value);
                      if (stepError) setStepError(null);
                    }}
                    placeholder="Write 1-2 sentences about your background, interests, and what you build..."
                    className={cn(
                      "w-full px-3.5 py-2.5 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors font-sans resize-y",
                      !bioCheck.isSafe && "border-destructive focus:border-destructive ring-1 ring-destructive/40"
                    )}
                  />
                  <ProfanityWarning isFlagged={!bioCheck.isSafe} reason={bioCheck.reason || "Bio contains prohibited language"} />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: CORE STACK & SKILLS ================= */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  <Code2 size={13} />
                  <span>Technical Skills</span>
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  What technologies and tools are in your core stack?
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Click suggestions or type custom technologies to add them to your portfolio.
                </p>
              </div>

              <div className="space-y-4">
                {/* Active Skills List */}
                <div className="min-h-16 p-3 bg-muted/40 border border-border rounded-[3px] flex flex-wrap gap-1.5 items-center">
                  {skills.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">
                      No skills selected yet. Click pills below or type your own.
                    </span>
                  ) : (
                    skills.map((s) => {
                      const isBad = !checkLocalProfanity(s).isSafe;
                      return (
                        <span
                          key={s}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-xs font-medium border shadow-xs",
                            isBad
                              ? "bg-destructive/10 text-destructive border-destructive/40"
                              : "bg-card text-foreground border-border"
                          )}
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(s)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>

                {/* Add Custom Skill Input */}
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => {
                        setCustomSkillInput(e.target.value);
                        if (stepError) setStepError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill(customSkillInput);
                        }
                      }}
                      placeholder="Type a skill and press Enter..."
                      className={cn(
                        "flex-1 px-3.5 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors",
                        !customSkillCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
                      )}
                    />
                    <Btn
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddSkill(customSkillInput)}
                      disabled={!customSkillInput.trim() || !customSkillCheck.isSafe}
                    >
                      <Plus size={13} /> Add
                    </Btn>
                  </div>
                  <ProfanityWarning isFlagged={!customSkillCheck.isSafe} reason="Skill contains prohibited language" />
                </div>

                {/* Quick Suggestion Pills */}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Popular suggestions:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILL_SUGGESTIONS.map((item) => {
                      const isAdded = skills.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            isAdded ? handleRemoveSkill(item) : handleAddSkill(item)
                          }
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-[3px] border transition-colors cursor-pointer inline-flex items-center gap-1",
                            isAdded
                              ? "bg-foreground text-background border-foreground font-medium"
                              : "bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                          )}
                        >
                          {isAdded ? <Check size={11} strokeWidth={2.5} /> : <Plus size={11} />}
                          <span>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: FEATURED PROJECT ================= */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    <Layers size={13} />
                    <span>Featured Work</span>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    What is a standout project you have built?
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Showcase a key application, open-source library, or research system.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => {
                        setProjectTitle(e.target.value);
                        if (stepError) setStepError(null);
                      }}
                      placeholder="e.g. Distributed Task Engine"
                      className={cn(
                        "w-full px-3.5 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors",
                        projectTitle.trim() && !projectTitleCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
                      )}
                      autoFocus
                    />
                    <ProfanityWarning isFlagged={Boolean(projectTitle.trim() && !projectTitleCheck.isSafe)} reason="Project title contains prohibited language" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Tech Stack (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={projectTags}
                      onChange={(e) => {
                        setProjectTags(e.target.value);
                        if (stepError) setStepError(null);
                      }}
                      placeholder="e.g. Go, Redis, Docker, gRPC"
                      className={cn(
                        "w-full px-3.5 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors",
                        projectTags.trim() && !projectTagsCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
                      )}
                    />
                    <ProfanityWarning isFlagged={Boolean(projectTags.trim() && !projectTagsCheck.isSafe)} reason="Tech stack contains prohibited language" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Summary / Description
                  </label>
                  <textarea
                    rows={3}
                    value={projectDescription}
                    onChange={(e) => {
                      setProjectDescription(e.target.value);
                      if (stepError) setStepError(null);
                    }}
                    placeholder="Briefly describe what problem it solves, architecture decisions, and results..."
                    className={cn(
                      "w-full px-3.5 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors resize-y",
                      projectDescription.trim() && !projectDescCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
                    )}
                  />
                  <ProfanityWarning isFlagged={Boolean(projectDescription.trim() && !projectDescCheck.isSafe)} reason="Project description contains prohibited language" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Live Demo URL (Optional)
                    </label>
                    <input
                      type="url"
                      inputMode="url"
                      value={projectLiveUrl}
                      onChange={(e) => setProjectLiveUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3.5 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors font-mono-code text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      GitHub / Repo URL (Optional)
                    </label>
                    <input
                      type="url"
                      inputMode="url"
                      value={projectSourceUrl}
                      onChange={(e) => setProjectSourceUrl(e.target.value)}
                      placeholder="https://github.com/username/project"
                      className="w-full px-3.5 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors font-mono-code text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: EXPERIENCE / EDUCATION ================= */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    <Briefcase size={13} />
                    <span>Experience & Background</span>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    Where do you currently work or study?
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your most relevant role, internship, or university background.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Role / Degree
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={expRole}
                      onChange={(e) => {
                        setExpRole(e.target.value);
                        if (stepError) setStepError(null);
                      }}
                      placeholder="e.g. Software Engineer Intern or B.E. in CS"
                      className={cn(
                        "w-full px-3.5 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors",
                        expRole.trim() && !expRoleCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
                      )}
                      autoFocus
                    />
                    <ProfanityWarning isFlagged={Boolean(expRole.trim() && !expRoleCheck.isSafe)} reason="Role contains prohibited language" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Company / University
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={expCompany}
                      onChange={(e) => {
                        setExpCompany(e.target.value);
                        if (stepError) setStepError(null);
                      }}
                      placeholder="e.g. Acme Labs or Thapar Institute"
                      className={cn(
                        "w-full px-3.5 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors",
                        expCompany.trim() && !expCompanyCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
                      )}
                    />
                    <ProfanityWarning isFlagged={Boolean(expCompany.trim() && !expCompanyCheck.isSafe)} reason="Company contains prohibited language" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">
                        Start Year
                      </label>
                      <select
                        value={expStartDate}
                        onChange={(e) => setExpStartDate(e.target.value)}
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
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">
                        End Year
                      </label>
                      {expCurrent ? (
                        <input
                          type="text"
                          value="Present"
                          disabled
                          className="w-full px-3 py-2 text-xs bg-input-background border border-border rounded-[3px] text-foreground font-mono-code opacity-60 cursor-not-allowed select-none"
                        />
                      ) : (
                        <select
                          value={expEndDate}
                          onChange={(e) => setExpEndDate(e.target.value)}
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

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none pt-4">
                    <input
                      type="checkbox"
                      checked={expCurrent}
                      onChange={(e) => setExpCurrent(e.target.checked)}
                      className="rounded-[2px] border-border text-foreground accent-foreground cursor-pointer"
                    />
                    <span>I currently work / study here</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Key Highlights / Responsibilities (Optional)
                  </label>
                  <textarea
                    rows={2}
                    maxLength={400}
                    value={expDescription}
                    onChange={(e) => {
                      setExpDescription(e.target.value);
                      if (stepError) setStepError(null);
                    }}
                    placeholder="Built user-facing features, led technical architecture..."
                    className={cn(
                      "w-full px-3.5 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors resize-y",
                      expDescription.trim() && !expDescCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
                    )}
                  />
                  <ProfanityWarning isFlagged={Boolean(expDescription.trim() && !expDescCheck.isSafe)} reason="Description contains prohibited language" />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5: SOCIAL PRESENCE & CONTACT ================= */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  <Share2 size={13} />
                  <span>Connect & Socials</span>
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Where should visitors find and contact you?
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  These links are pinned cleanly across your header and contact sections.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* GitHub */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">GitHub</label>
                  <div className={cn(
                    "flex rounded-[3px] border border-border overflow-hidden bg-input-background focus-within:ring-1 focus-within:ring-foreground/30",
                    github.trim() && !githubCheck.isSafe && "border-destructive"
                  )}>
                    <span className="px-3 py-2 text-xs text-muted-foreground font-mono-code bg-muted/60 border-r border-border select-none flex items-center">
                      github.com/
                    </span>
                    <input
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      value={github}
                      onChange={(e) => {
                        setGithub(e.target.value);
                        if (stepError) setStepError(null);
                      }}
                      placeholder="username"
                      className="flex-1 px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none font-mono-code text-xs"
                      autoFocus
                    />
                  </div>
                  <ProfanityWarning isFlagged={Boolean(github.trim() && !githubCheck.isSafe)} reason="GitHub handle contains prohibited text" />
                </div>

                {/* LinkedIn */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">LinkedIn</label>
                  <div className={cn(
                    "flex rounded-[3px] border border-border overflow-hidden bg-input-background focus-within:ring-1 focus-within:ring-foreground/30",
                    linkedin.trim() && !linkedinCheck.isSafe && "border-destructive"
                  )}>
                    <span className="px-3 py-2 text-xs text-muted-foreground font-mono-code bg-muted/60 border-r border-border select-none flex items-center">
                      linkedin.com/in/
                    </span>
                    <input
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      value={linkedin}
                      onChange={(e) => {
                        setLinkedin(e.target.value);
                        if (stepError) setStepError(null);
                      }}
                      placeholder="username"
                      className="flex-1 px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none font-mono-code text-xs"
                    />
                  </div>
                  <ProfanityWarning isFlagged={Boolean(linkedin.trim() && !linkedinCheck.isSafe)} reason="LinkedIn handle contains prohibited text" />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Contact Email</label>
                  <input
                    type="email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (stepError) setStepError(null);
                    }}
                    placeholder="you@domain.com"
                    className={cn(
                      "w-full px-3.5 py-2 text-sm bg-input-background border border-border rounded-[3px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/40 transition-colors font-mono-code text-xs",
                      email.trim() && !emailCheck.isSafe && "border-destructive ring-1 ring-destructive/40"
                    )}
                  />
                  <ProfanityWarning isFlagged={Boolean(email.trim() && !emailCheck.isSafe)} reason="Email handle contains prohibited text" />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 6: CHOOSE TEMPLATE ================= */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  <LayoutTemplate size={13} />
                  <span>Visual Aesthetic</span>
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Which visual aesthetic best matches your work?
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  You can change or tweak your template at any time with one click.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[46vh] overflow-y-auto pr-1">
                {TEMPLATE_PREVIEWS.map((t) => {
                  const isSelected = selectedTemplate === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={cn(
                        "p-3 rounded-[3px] border text-left cursor-pointer transition-all flex flex-col justify-between select-none relative",
                        isSelected
                          ? "border-foreground bg-foreground/5 ring-1 ring-foreground"
                          : "border-border hover:border-foreground/40 bg-card"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground">
                            {t.name}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 bg-foreground text-background rounded-full flex items-center justify-center shrink-0">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                          {t.desc}
                        </p>
                      </div>

                      <div className="mt-2.5 flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-border"
                          style={{ backgroundColor: t.accent }}
                        />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono-code">
                          {t.tag}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= STEP 7: HERE IS YOUR LINK (FINAL SCREEN) ================= */}
          {step === 7 && (
            <div className="space-y-5 sm:space-y-6 text-center py-2 sm:py-4 animate-fade-in">
              <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check size={24} strokeWidth={2.5} />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Here is your portfolio link
                </h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
                  Your website has been assembled and is live on your unique subdomain.
                </p>
              </div>

              {/* URL Display Card */}
              <div className="p-3.5 sm:p-4 bg-muted/60 border border-border rounded-[4px] max-w-lg mx-auto space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-background border border-border rounded-[3px] p-2.5 sm:px-3.5 sm:py-2.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Globe size={15} className="text-muted-foreground shrink-0" />
                    <span className="text-xs sm:text-sm font-mono-code font-medium text-foreground truncate text-left">
                      {initialData.username}.{APP_CONFIG.rootDomain}
                    </span>
                  </div>
                  <Btn
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    className="shrink-0 w-full sm:w-auto"
                  >
                    {copied ? (
                      <>
                        <CheckCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Link</span>
                      </>
                    )}
                  </Btn>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs text-muted-foreground px-1">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isPublished ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                      )}
                    />
                    <strong className="text-foreground">
                      Status: {isPublished ? "Live & Published" : "Saved as Draft"}
                    </strong>
                  </span>
                  <span className="font-mono-code text-[11px]">
                    Template: {selectedTemplate}
                  </span>
                </div>

                {moderationNotice && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded text-left text-xs text-amber-700 dark:text-amber-300">
                    {moderationNotice}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2 max-w-md mx-auto">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Btn variant="primary" size="md" className="w-full">
                    <ExternalLink size={14} /> Visit Live Portfolio
                  </Btn>
                </a>
                <Btn
                  variant="secondary"
                  size="md"
                  onClick={handleClose}
                  className="w-full sm:w-auto"
                >
                  Done & Go to Dashboard
                </Btn>
              </div>
            </div>
          )}
        </div>

        {/* Step Error Notice Above Footer */}
        {stepError && step <= totalSteps && (
          <div className="px-4 sm:px-6 py-2.5 bg-destructive/10 border-t border-destructive/20 text-xs font-medium text-destructive flex items-center gap-2 animate-fade-in">
            <AlertCircle size={14} className="shrink-0" />
            <span>{stepError}</span>
          </div>
        )}

        {/* Modal Footer Controls (Steps 1 - 6) */}
        {step <= totalSteps && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-card flex items-center justify-between gap-2">
            <div>
              {step > 1 ? (
                <Btn variant="ghost" size="sm" onClick={handleBack} disabled={isPending}>
                  <ChevronLeft size={14} /> Back
                </Btn>
              ) : (
                <span className="text-[11px] text-muted-foreground font-mono-code hidden sm:inline">
                  Press Continue to begin
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {(step === 3 || step === 4) && (
                <button
                  type="button"
                  onClick={() => setStep((prev) => prev + 1)}
                  disabled={isPending}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 cursor-pointer"
                >
                  Skip for now
                </button>
              )}

              <Btn
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={isPending}
              >
                {isPending ? (
                  "Saving..."
                ) : step === totalSteps ? (
                  <>
                    <span>Generate & Publish</span>
                    <ArrowRight size={14} />
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronRight size={14} />
                  </>
                )}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
