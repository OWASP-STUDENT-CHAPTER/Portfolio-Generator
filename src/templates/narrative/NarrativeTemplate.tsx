import React from 'react';
import { TemplateProps } from '../types';
import styles from './narrative.module.css';
import { Globe, GitBranch, ArrowUpRight, Mail } from 'lucide-react';

export default function NarrativeTemplate({
  username,
  profile,
  projects,
  experiences,
  educations,
  skills,
  socialLinks,
}: TemplateProps) {
  const name = profile.name || username || 'Engineer';
  const headline = profile.headline || 'Builder, systems thinker, power user at heart';

  const defaultValues = [
    {
      title: 'Curiosity-Driven',
      desc: 'Building to understand how systems work from first principles, not just shipping features.',
    },
    {
      title: 'Problem-First Engineering',
      desc: 'Technology is a tool, not the goal. Solving real constraints with scalable, maintainable architectures.',
    },
    {
      title: 'Systems & Tradeoffs',
      desc: 'Understanding feedback loops, latency boundaries, and emergent behavior over plain syntax.',
    },
    {
      title: 'Learning in Public',
      desc: 'Writing case studies and documenting decisions forces clarity and deep technical precision.',
    },
  ];

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          {profile.avatarUrl && (
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarCircle}>
                <img src={profile.avatarUrl} alt={name} className={styles.avatarImg} />
              </div>
            </div>
          )}

          <div className={styles.heroContent}>
            <div className={styles.greetingPill}>Hi, I&apos;m {name}.</div>
            <h1 className={styles.heroHeadline}>
              {headline}
              <br />
              <span className={styles.heroHeadlineMuted}>documenting thoughts and engineering case studies.</span>
            </h1>

            <p className={styles.heroBio}>
              {profile.bio || (
                <>
                  I&apos;m a computer engineering student at Thapar Institute of Engineering and Technology who documents how I think, not just what I build. My work lives somewhere between low-level systems, distributed architectures, and clean code.
                </>
              )}
            </p>

            {socialLinks && socialLinks.length > 0 && (
              <div className={styles.socialRow}>
                {socialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialChip}
                  >
                    {link.platform.toLowerCase().includes('github') ? (
                      <GitBranch size={13} />
                    ) : link.platform.toLowerCase().includes('mail') ? (
                      <Mail size={13} />
                    ) : (
                      <Globe size={13} />
                    )}
                    <span>{link.platform}</span>
                    <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Case Studies & Projects */}
        {projects && projects.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Technical Case Studies &amp; Projects</h2>
            <div className={styles.caseStudiesList}>
              {projects.map((proj, idx) => (
                <article key={idx} className={styles.caseStudyCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{proj.title}</h3>
                    <div className={styles.projectLinks}>
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.projectLink}
                        >
                          Live System ↗
                        </a>
                      )}
                      {proj.sourceUrl && (
                        <a
                          href={proj.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.projectLink}
                        >
                          Source Code ↗
                        </a>
                      )}
                    </div>
                  </div>

                  {proj.description && <p className={styles.cardDesc}>{proj.description}</p>}

                  {proj.tags && (
                    <div className={styles.tagRow}>
                      {proj.tags.split(',').map((tag, tIdx) => (
                        <span key={tIdx} className={styles.tagBadge}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* What I'm Into / Skills */}
        {skills && skills.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What I&apos;m Into &amp; Working On</h2>
            <div className={styles.interestsGrid}>
              {skills.map((s, idx) => (
                <div key={idx} className={styles.interestCard}>
                  <strong>{s.name}</strong>
                  {s.category ? (
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      {s.category}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Engineering Values & Philosophy */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Values &amp; Engineering Philosophy</h2>
          <div className={styles.valuesGrid}>
            {defaultValues.map((v, idx) => (
              <div key={idx} className={styles.valueCard}>
                <div className={styles.valueTitle}>{v.title}</div>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <span>{name}</span>
          <span>{profile.headline || 'Narrative Portfolio'}</span>
        </footer>
      </div>
    </main>
  );
}
