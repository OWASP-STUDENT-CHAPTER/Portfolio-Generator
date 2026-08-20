import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getTemplateById } from '@/templates/registry';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { APP_CONFIG } from '@/lib/config';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const username = subdomain.toLowerCase();

  const website = await prisma.website.findUnique({
    where: { username },
    include: { user: true, profile: true },
  });

  if (!website || website.deactivated) {
    return {
      title: `Website Not Found — ${APP_CONFIG.name}`,
      description: 'The requested personal website is not available.',
    };
  }

  const name = website.user.name || website.profile?.headline || username;
  const description = website.profile?.bio || website.profile?.headline || `Personal website of ${name} hosted on ${APP_CONFIG.name}`;

  return {
    title: `${name} — ${username}.${APP_CONFIG.rootDomain}`,
    description,
    openGraph: {
      title: `${name} — Personal Website`,
      description,
      images: website.profile?.avatarUrl ? [website.profile.avatarUrl] : [],
    },
  };
}

export default async function SubdomainPage({ params }: PageProps) {
  const { subdomain } = await params;
  const username = subdomain.toLowerCase();

  const website = await prisma.website.findUnique({
    where: { username },
    include: {
      user: { select: { name: true, email: true } },
      profile: true,
      projects: { orderBy: { order: 'asc' } },
      experiences: { orderBy: { order: 'asc' } },
      educations: { orderBy: { order: 'asc' } },
      skills: { orderBy: { order: 'asc' } },
      socialLinks: { orderBy: { order: 'asc' } },
      customSections: { orderBy: { order: 'asc' } },
    },
  });

  // 1. If website does not exist
  if (!website) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '500px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌐</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Subdomain Available!</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            <strong>{username}.{APP_CONFIG.rootDomain}</strong> has not been claimed yet.
          </p>
          <Link
            href="/"
            style={{ display: 'inline-block', background: '#3b82f6', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}
          >
            Claim on {APP_CONFIG.name} →
          </Link>
        </div>
      </main>
    );
  }

  // 2. If website is deactivated by administrator
  if (website.deactivated) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', background: '#131b2e', border: '1px solid #1e293b', borderRadius: '16px', padding: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Website Unavailable</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
            This website is currently not accessible.
          </p>
        </div>
      </main>
    );
  }

  // 3. If website is unpublished
  if (!website.published) {
    const session = await auth();
    const isOwner = Boolean(
      session?.user?.email &&
      website.user?.email &&
      session.user.email.toLowerCase() === website.user.email.toLowerCase()
    );

    if (!isOwner) {
      return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '480px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚧</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Work in Progress</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {website.user.name || username} is currently editing this website. Please check back later!
            </p>
          </div>
        </main>
      );
    }
  }

  // 4. Resolve Template from Registry
  const template = getTemplateById(website.templateId);
  const TemplateComponent = template.component;

  // Normalized template props
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
  };

  return <TemplateComponent {...templateProps} />;
}
