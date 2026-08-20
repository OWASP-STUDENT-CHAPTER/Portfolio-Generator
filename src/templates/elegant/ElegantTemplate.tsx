import React from 'react';
import { TemplateProps } from '../types';
import styles from './elegant.module.css';

export default function ElegantTemplate({
  username,
  profile,
  projects,
  experiences,
  educations,
  skills,
  socialLinks,
}: TemplateProps) {
  const name = profile.name || username || 'Elegance';

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.topBadge}>Curated Portfolio — Thapar</div>

        {profile.avatarUrl && (
          <img src={profile.avatarUrl} alt={name} className={styles.avatar} />
        )}

        <h1 className={styles.name}>{name}</h1>
        {profile.headline && <div className={styles.headline}>{profile.headline}</div>}

        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

        {socialLinks && socialLinks.length > 0 && (
          <div className={styles.socialRow}>
            {socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                {link.platform}
              </a>
            ))}
          </div>
        )}

        <div className={styles.goldDivider} />

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section>
            <div className={styles.sectionTitle}>Selected Works</div>
            <div>
              {projects.map((proj, idx) => (
                <div key={idx} className={styles.itemBlock}>
                  <div className={styles.itemTitle}>{proj.title}</div>
                  {proj.description && <div className={styles.itemDesc}>{proj.description}</div>}
                  {proj.liveUrl && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                        style={{ fontSize: '0.75rem' }}
                      >
                        Discover ↗
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <section>
            <div className={styles.goldDivider} />
            <div className={styles.sectionTitle}>Experience</div>
            <div>
              {experiences.map((exp, idx) => (
                <div key={idx} className={styles.itemBlock}>
                  <div className={styles.itemTitle}>{exp.role}</div>
                  <div className={styles.itemSubtitle}>
                    {exp.company} — {exp.startDate} to {exp.current ? 'Present' : exp.endDate}
                  </div>
                  {exp.description && <div className={styles.itemDesc}>{exp.description}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section>
            <div className={styles.goldDivider} />
            <div className={styles.sectionTitle}>Disciplines</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {skills.map((s, idx) => (
                <span key={idx} style={{ color: '#d4af37', fontStyle: 'italic' }}>
                  {s.name} {idx < skills.length - 1 ? '•' : ''}
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <div>{name} • {profile.headline || 'Portfolio'}</div>
        </footer>
      </div>
    </div>
  );
}
