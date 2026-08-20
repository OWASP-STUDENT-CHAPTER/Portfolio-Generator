import React from 'react';
import { TemplateProps } from '../types';
import styles from './creative.module.css';
import { Zap, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

export default function CreativeTemplate({
  username,
  profile,
  projects,
  experiences,
  educations,
  skills,
  socialLinks,
}: TemplateProps) {
  const name = profile.name || username || 'CREATIVE';

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.hero}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 900, letterSpacing: '0.1em' }}>⚡ PORTFOLIO</span>
            <span>📍 {profile.location || 'Creative Hub'}</span>
          </div>

          <h1 className={styles.name}>{name}</h1>
          {profile.headline && <div className={styles.headline}>★ {profile.headline}</div>}
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

          {socialLinks && socialLinks.length > 0 && (
            <div className={styles.socialRow}>
              {socialLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                >
                  {link.platform} ↗
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Selected Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className={styles.sectionTitle}>
              <Zap size={28} color="#ff3366" />
              <span>Epic Projects</span>
            </h2>
            <div>
              {projects.map((proj, idx) => (
                <div key={idx} className={styles.projectCard}>
                  <h3 className={styles.projectTitle}>{proj.title}</h3>
                  {proj.description && <p style={{ fontSize: '1.05rem', color: '#444' }}>{proj.description}</p>}
                  {proj.tags && (
                    <div className={styles.projectTags}>
                      {proj.tags.split(',').map((t, ti) => (
                        <span key={ti} className={styles.tag}>
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialBtn}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
                    >
                      <span>Check it out</span>
                      <ArrowRight size={16} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section>
            <h2 className={styles.sectionTitle}>
              <Sparkles size={28} color="#ffe600" />
              <span>Superpowers</span>
            </h2>
            <div className={styles.skillsMarquee}>
              {skills.map((s, idx) => (
                <span key={idx} className={styles.skillBadge}>
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Journey */}
        {experiences && experiences.length > 0 && (
          <section>
            <h2 className={styles.sectionTitle}>
              <span>The Journey</span>
            </h2>
            <div>
              {experiences.map((exp, idx) => (
                <div key={idx} className={styles.projectCard}>
                  <div style={{ fontWeight: 900, fontSize: '1.3rem' }}>
                    {exp.role} @ {exp.company}
                  </div>
                  <div style={{ fontWeight: 700, color: '#ff3366', marginBottom: '0.5rem' }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </div>
                  {exp.description && <p style={{ margin: 0 }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <p>Built with Passion • {name}</p>
        </footer>
      </div>
    </div>
  );
}
