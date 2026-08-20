import React from 'react';
import { TemplateProps } from '../types';
import styles from './spotlight.module.css';
import { ExternalLink, Star, ArrowUpRight } from 'lucide-react';

export default function SpotlightTemplate({
  username,
  profile,
  projects,
  experiences,
  educations,
  skills,
  socialLinks,
}: TemplateProps) {
  const name = profile.name || username || 'Spotlight Portfolio';

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Cinematic Spotlight Hero */}
        <section className={styles.hero}>
          {profile.avatarUrl && (
            <img src={profile.avatarUrl} alt={name} className={styles.avatar} />
          )}
          <h1 className={styles.name}>{name}</h1>
          {profile.headline && <div className={styles.headline}>{profile.headline}</div>}
          {profile.bio && (
            <p style={{ maxWidth: '650px', margin: '0 auto 2rem', color: '#9ca3af', lineHeight: 1.7 }}>
              {profile.bio}
            </p>
          )}

          {socialLinks && socialLinks.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {socialLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.skillPill}
                  style={{ textDecoration: 'none' }}
                >
                  {link.platform} ↗
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Featured Projects Grid */}
        {projects && projects.length > 0 && (
          <section>
            <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2.5rem', fontWeight: 800 }}>
              Featured Work
            </h2>
            <div className={styles.spotlightGrid}>
              {projects.map((proj, idx) => (
                <div key={idx} className={styles.card}>
                  <h3 className={styles.cardTitle}>{proj.title}</h3>
                  {proj.description && <p className={styles.cardDesc}>{proj.description}</p>}
                  {proj.tags && (
                    <div style={{ fontSize: '0.8rem', color: '#c084fc', marginBottom: '1.25rem' }}>
                      {proj.tags}
                    </div>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.cardLink}
                    >
                      <span>Explore Project</span>
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Technologies & Tools
            </h3>
            <div className={styles.skillsRow}>
              {skills.map((skill, idx) => (
                <span key={idx} className={styles.skillPill}>
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <p>{name} • {profile.headline || 'Spotlight Portfolio'}</p>
        </footer>
      </div>
    </div>
  );
}
