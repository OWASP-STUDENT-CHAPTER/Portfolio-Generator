import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { APP_CONFIG, getPublicSiteUrl } from "@/lib/config";
import { ArrowRight, Check } from "lucide-react";
import { Btn, Tag } from "@/components/ui/Primitives";
import { DarkToggle } from "@/components/DarkToggle";

const TEMPLATES = [
  { id: "craftsman", name: "Craftsman", desc: "Warm parchment, serif editorial", tags: ["Editorial", "Warm", "Serif"], bg: "#FBF8F2", fg: "#2C2218", accent: "#C4622D" },
  { id: "minimal", name: "Minimal", desc: "Clean Scandinavian whitespace", tags: ["Minimal", "Clean", "Light"], bg: "#FFFFFF", fg: "#111111", accent: "#000000" },
  { id: "developer", name: "Developer", desc: "Dark mode, syntax-highlighted", tags: ["Dark", "Code", "Mono"], bg: "#0D1117", fg: "#E6EDF3", accent: "#58A6FF" },
  { id: "editorial", name: "Editorial", desc: "Magazine asymmetry, drop caps", tags: ["Magazine", "Serif", "Layout"], bg: "#FAFAF8", fg: "#1A1A1A", accent: "#E05A47" },
  { id: "bento", name: "Bento", desc: "Modular card grid, Apple-style", tags: ["Grid", "Modern", "Cards"], bg: "#F0F0EE", fg: "#1D1D1F", accent: "#5856D6" },
  { id: "terminal", name: "Terminal", desc: "CRT glow, matrix green aesthetic", tags: ["Terminal", "Mono", "Dark"], bg: "#060C06", fg: "#33FF33", accent: "#00FF41" },
  { id: "spotlight", name: "Spotlight", desc: "Cinematic, dramatic presentation", tags: ["Cinematic", "Dark", "Bold"], bg: "#070707", fg: "#F5F5F5", accent: "#E5C07B" },
  { id: "elegant", name: "Elegant", desc: "Luxury restraint, gold accents", tags: ["Luxury", "Serif", "Dark"], bg: "#0E0C09", fg: "#F2ECD8", accent: "#C9A84C" },
  { id: "creative", name: "Creative", desc: "Neo-brutalist, high-energy", tags: ["Brutalist", "Bold", "Color"], bg: "#F5F500", fg: "#000000", accent: "#FF2D55" },
  { id: "professional", name: "Professional", desc: "Executive résumé, navy header", tags: ["Corporate", "Clean", "Navy"], bg: "#FFFFFF", fg: "#1C3C6B", accent: "#2563EB" },
  { id: "academic", name: "Academic", desc: "Scholarly, research-forward", tags: ["Academic", "Serif", "Clean"], bg: "#F9F8F5", fg: "#1E293B", accent: "#475569" },
  { id: "narrative", name: "Narrative", desc: "Case-study driven, long-form", tags: ["Story", "Modern", "Case Study"], bg: "#F7F7F8", fg: "#0F172A", accent: "#3B5BDB" },
];

export default async function HomePage() {
  const session = await auth();
  const siteName = APP_CONFIG.name;
  const demoUrl = getPublicSiteUrl("harsh");

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border/60 bg-background/85 backdrop-blur-md flex items-center px-6 md:px-12">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="w-7 h-7 bg-foreground text-background rounded-[3px] flex items-center justify-center text-xs font-bold">
            {siteName.charAt(0)}
          </span>
          <span className="text-foreground">{siteName}</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <DarkToggle />
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Live Demo
          </a>
          {session ? (
            <Link href="/dashboard">
              <Btn variant="primary" size="sm">
                Dashboard
              </Btn>
            </Link>
          ) : (
            <Link href="/login">
              <Btn variant="primary" size="sm">
                Sign In
              </Btn>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[3px] border border-border bg-muted/60 text-xs text-muted-foreground mb-6 font-mono-code">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            12 curated design philosophies · Live subdomain instant deploy
          </div>
          <h1 className="text-4xl md:text-6xl font-normal tracking-tight font-display text-foreground leading-[1.1] mb-6">
            The personal website you actually want to share.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl font-sans">
            Build and publish an engineering portfolio in minutes. Switch between 12 distinct template aesthetics anytime without re-entering your projects.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={session ? "/dashboard" : "/login"}>
              <Btn variant="primary" size="lg">
                Create your portfolio <ArrowRight size={16} />
              </Btn>
            </Link>
            <a href={demoUrl} target="_blank" rel="noopener noreferrer">
              <Btn variant="secondary" size="lg">
                View live demo
              </Btn>
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground font-mono-code">
            <span className="flex items-center gap-1.5">
              <Check size={13} className="text-foreground" /> yourname.{APP_CONFIG.rootDomain}
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={13} className="text-foreground" /> Google OAuth
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={13} className="text-foreground" /> AI resume import
            </span>
          </div>
        </div>
      </section>

      {/* 12 Design Philosophies */}
      <section className="border-t border-border py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-mono-code uppercase tracking-widest text-muted-foreground mb-2">
            Visual presentation layer
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            12 design philosophies. One single data source.
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Never rewrite your bio or projects again. Your content lives cleanly in your database — change the visual skin whenever you want.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {TEMPLATES.map((t) => (
            <a
              key={t.id}
              href={getPublicSiteUrl("harsh", t.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="group text-left border border-border rounded-[3px] overflow-hidden hover:border-foreground/40 transition-all duration-150 bg-card flex flex-col"
            >
              <div
                className="h-28 relative flex items-end p-3 overflow-hidden select-none"
                style={{ backgroundColor: t.bg }}
              >
                <div style={{ color: t.fg }}>
                  <div
                    className="text-xs font-bold font-mono-code"
                    style={{ color: t.fg }}
                  >
                    {t.id === "terminal" ? "$ ./portfolio" : t.id === "creative" ? t.name.toUpperCase() : t.name}
                  </div>
                  <div className="text-[10px] opacity-40 mt-0.5">demo.{APP_CONFIG.rootDomain}</div>
                </div>
                <div
                  className="absolute top-0 right-0 bottom-0 w-16 opacity-15"
                  style={{ background: `linear-gradient(to left, ${t.accent}, transparent)` }}
                />
              </div>
              <div className="p-3 bg-card flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold mb-0.5 text-foreground">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground">{t.desc}</div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {t.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-mono-code uppercase tracking-widest text-muted-foreground mb-2">
            Workflow
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            From zero to published in three steps
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              n: "01",
              title: "Sign in with Google",
              desc: "Instant authentication with your Google account. Your unique subdomain is reserved automatically upon registration.",
            },
            {
              n: "02",
              title: "Add your content or AI Import",
              desc: "Paste your LinkedIn profile text or résumé to auto-populate projects, experience, education, and technical skills.",
            },
            {
              n: "03",
              title: "Choose template & deploy",
              desc: "Pick from 12 distinct design systems, toggle publication, and share your live custom domain immediately.",
            },
          ].map(({ n, title, desc }) => (
            <div key={n} className="space-y-2 border-t border-border/80 pt-4">
              <div className="font-mono-code text-xs text-muted-foreground font-semibold">
                {n}
              </div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <Link href={session ? "/dashboard" : "/login"}>
            <Btn variant="primary" size="lg">
              Get started — it&apos;s free <ArrowRight size={16} />
            </Btn>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 md:px-12 py-8 max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 bg-foreground text-background rounded-[2px] flex items-center justify-center text-[10px] font-bold">
            {siteName.charAt(0)}
          </span>
          <span className="font-semibold text-foreground">{siteName}</span>
          <span>·</span>
          <span>{APP_CONFIG.tagline}</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Demo Site
          </a>
          <Link href={session ? "/dashboard" : "/login"} className="hover:text-foreground transition-colors">
            Sign In
          </Link>
        </div>
      </footer>
    </div>
  );
}
