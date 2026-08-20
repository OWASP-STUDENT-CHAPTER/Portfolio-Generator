import React from 'react';
import { TemplateProps } from '../types';
import styles from './bento.module.css';
import { Sparkles, MapPin, ExternalLink, Briefcase, GraduationCap, Code, Share2 } from 'lucide-react';

export default function BentoTemplate({
  username,
  profile,
  projects,
  experiences,
  educations,
  skills,
  socialLinks,
}: TemplateProps) {
  const name = profile.name || username || 'Creator';

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.bentoGrid}>
          {/* Card 1: Hero Identity */}
          <div className={`${styles.card} ${styles.heroCard}`}>
            {profile.avatarUrl && (
              <div className={styles.avatarBox}>
                <img src={profile.avatarUrl} alt={name} className={styles.avatar} />
              </div>
            )}
            <div>
              <h1 className={styles.name}>{name}</h1>
              {profile.headline && <div className={styles.headline}>{profile.headline}</div>}
              {profile.location && (
                <div className={styles.location}>
                  <MapPin size={14} />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Socials */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <Share2 size={16} color="#818cf8" />
              <span>Connect</span>
            </div>
            <div className={styles.socialGrid}>
              {socialLinks &&
                socialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialPill}
                  >
                    <span>{link.platform}</span>
                    <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                  </a>
                ))}
            </div>
          </div>

          {/* Card 3: Bio */}
          {profile.bio && (
            <div className={`${styles.card} ${styles.spanTwo}`}>
              <div className={styles.cardTitle}>
                <Sparkles size={16} color="#ec4899" />
                <span>About</span>
              </div>
              <p className={styles.bioText}>{profile.bio}</p>
            </div>
          )}

          {/* Card 4: Skills Matrix */}
          {skills && skills.length > 0 && (
            <div className={`${styles.card} ${styles.spanTwo}`}>
              <div className={styles.cardTitle}>
                <Code size={16} color="#38bdf8" />
                <span>Skills & Tech</span>
              </div>
              <div className={styles.skillBadges}>
                {skills.map((skill, idx) => (
                  <span key={idx} className={styles.skillPill}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Card 5: Projects */}
          {projects && projects.length > 0 && (
            <div className={`${styles.card} ${styles.spanTwo}`}>
              <div className={styles.cardTitle}>
                <Sparkles size={16} color="#f59e0b" />
                <span>Featured Projects</span>
              </div>
              <div>
                {projects.map((proj, idx) => (
                  <div key={idx} className={styles.projectItem}>
                    <div className={styles.projectHeader}>
                      <span className={styles.projectTitle}>{proj.title}</span>
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#818cf8', fontSize: '0.85rem' }}
                        >
                          Visit ↗
                        </a>
                      )}
                    </div>
                    {proj.description && <p className={styles.projectDesc}>{proj.description}</p>}
                    {proj.tags && (
                      <div className={styles.tags}>
                        {proj.tags.split(',').map((t, tidx) => (
                          <span key={tidx} className={styles.tag}>
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 6: Experience & Education */}
          <div className={`${styles.card} ${styles.spanTwo}`}>
            <div className={styles.cardTitle}>
              <Briefcase size={16} color="#10b981" />
              <span>Career & Education</span>
            </div>
            <div>
              {experiences &&
                experiences.map((exp, idx) => (
                  <div key={idx} className={styles.projectItem}>
                    <div className={styles.projectTitle}>
                      {exp.role} @ {exp.company}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </div>
                  </div>
                ))}
              {educations &&
                educations.map((edu, idx) => (
                  <div key={idx} className={styles.projectItem}>
                    <div className={styles.projectTitle}>{edu.institution}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {edu.degree} {edu.field ? `in ${edu.field}` : ''} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <div>{name} • {profile.headline || 'Portfolio'}</div>
        </footer>
      </div>
    </div>
  );
}
