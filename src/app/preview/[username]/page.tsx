import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTemplateById } from "@/templates/registry";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ template?: string }>;
}

const DEMO_PROFILE = {
  username: "harsh",
  profile: {
    name: "Harsh Mittal",
    email: "harsh@thapar.edu",
    headline: "Backend Engineer & Open Source Contributor",
    bio: "Pre-final year student at Thapar Institute of Engineering and Technology. Passionate about distributed systems, Go, Linux internals, and high-throughput networking. 2x Google Summer of Code contributor.",
    location: "Patiala, Punjab, India",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
    resumeUrl: "https://example.com/resume.pdf",
  },
  projects: [
    {
      id: "p1",
      title: "DistKV",
      description: "High-performance distributed key-value store built in Go with Raft consensus, WAL replication, and gRPC clustering.",
      imageUrl: null,
      liveUrl: "https://distkv.dev",
      sourceUrl: "https://github.com/harshm/distkv",
      tags: "Go, Raft, gRPC, Distributed Systems",
      order: 0,
    },
    {
      id: "p2",
      title: "ByteP2P",
      description: "Decentralized peer-to-peer file synchronization client running over WebRTC data channels with chunked cryptographic integrity.",
      imageUrl: null,
      liveUrl: "https://bytep2p.app",
      sourceUrl: "https://github.com/harshm/bytep2p",
      tags: "TypeScript, WebRTC, Node.js",
      order: 1,
    },
    {
      id: "p3",
      title: "TIET Campus Schedule",
      description: "Automated schedule parser and calendar sync for Thapar Institute student cohorts.",
      imageUrl: null,
      liveUrl: "https://thapar-sync.in",
      sourceUrl: "https://github.com/harshm/thapar-sync",
      tags: "Next.js, Tailwind CSS, PostgreSQL",
      order: 2,
    },
  ],
  experiences: [
    {
      id: "e1",
      company: "Razorpay",
      role: "Software Engineering Intern",
      description: "Engineered high-throughput webhook dispatch pipelines processing 50M+ daily events with 99.99% SLA.",
      startDate: "May 2024",
      endDate: "Jul 2024",
      current: false,
      order: 0,
    },
    {
      id: "e2",
      company: "Google Summer of Code (CNCF)",
      role: "Open Source Contributor",
      description: "Implemented telemetry collection adapters and improved Prometheus exporter throughput.",
      startDate: "Jun 2023",
      endDate: "Aug 2023",
      current: false,
      order: 1,
    },
  ],
  educations: [
    {
      id: "ed1",
      institution: "Thapar Institute of Engineering and Technology",
      degree: "Bachelor of Engineering (B.E.)",
      field: "Computer Science & Engineering",
      startDate: "2022",
      endDate: "2026",
      current: true,
      gpa: "9.4 / 10.0",
      order: 0,
    },
  ],
  skills: [
    { id: "s1", name: "Go", category: "Languages", order: 0 },
    { id: "s2", name: "TypeScript", category: "Languages", order: 1 },
    { id: "s3", name: "C++", category: "Languages", order: 2 },
    { id: "s4", name: "Python", category: "Languages", order: 3 },
    { id: "s5", name: "SQL", category: "Languages", order: 4 },
    { id: "s6", name: "React", category: "Frontend", order: 5 },
    { id: "s7", name: "Next.js", category: "Frontend", order: 6 },
    { id: "s8", name: "Node.js", category: "Backend", order: 7 },
    { id: "s9", name: "PostgreSQL", category: "Backend", order: 8 },
    { id: "s10", name: "Redis", category: "Backend", order: 9 },
    { id: "s11", name: "Docker", category: "DevOps", order: 10 },
    { id: "s12", name: "Kubernetes", category: "DevOps", order: 11 },
    { id: "s13", name: "Linux", category: "DevOps", order: 12 },
  ],
  socialLinks: [
    { id: "sl1", platform: "GitHub", url: "https://github.com/harshm", order: 0 },
    { id: "sl2", platform: "LinkedIn", url: "https://linkedin.com/in/harsh-mittal", order: 1 },
    { id: "sl3", platform: "Twitter", url: "https://x.com/harshm_dev", order: 2 },
    { id: "sl4", platform: "Mail", url: "mailto:harsh@thapar.edu", order: 3 },
  ],
};

export default async function PreviewPage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const { template: templateOverride } = await searchParams;

  const cleanUsername = username.toLowerCase();

  const website = await prisma.website.findUnique({
    where: { username: cleanUsername },
    include: {
      user: { select: { name: true, email: true } },
      profile: true,
      projects: { orderBy: { order: "asc" } },
      experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      socialLinks: { orderBy: { order: "asc" } },
      customSections: { orderBy: { order: "asc" } },
    },
  });

  // If website not found in DB, check if it's a demo or student preview
  if (!website) {
    if (["harsh", "demo", "student", "sample", "preview"].includes(cleanUsername)) {
      const templateId = templateOverride || "craftsman";
      const template = getTemplateById(templateId);
      const TemplateComponent = template.component;
      return <TemplateComponent {...DEMO_PROFILE} previewMode={true} />;
    }
    notFound();
  }

  // Allow live template preview override in searchParams
  const templateId = templateOverride || website.templateId;
  const template = getTemplateById(templateId);
  const TemplateComponent = template.component;

  const templateProps = {
    username: website.username,
    profile: {
      name: website.user.name,
      email: website.user.email,
      headline: website.profile?.headline,
      bio: website.profile?.bio,
      location: website.profile?.location,
      avatarUrl: website.profile?.avatarUrl,
      resumeUrl: website.profile?.resumeUrl,
    },
    projects: website.projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      liveUrl: p.liveUrl,
      sourceUrl: p.sourceUrl,
      tags: p.tags,
      order: p.order,
    })),
    experiences: website.experiences.map((e) => ({
      id: e.id,
      company: e.company,
      role: e.role,
      description: e.description,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      order: e.order,
    })),
    educations: website.educations.map((ed) => ({
      id: ed.id,
      institution: ed.institution,
      degree: ed.degree,
      field: ed.field,
      startDate: ed.startDate,
      endDate: ed.endDate,
      current: ed.current,
      gpa: ed.gpa,
      order: ed.order,
    })),
    skills: website.skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      order: s.order,
    })),
    socialLinks: website.socialLinks.map((sl) => ({
      id: sl.id,
      platform: sl.platform,
      url: sl.url,
      order: sl.order,
    })),
    previewMode: true,
  };

  return <TemplateComponent {...templateProps} />;
}
