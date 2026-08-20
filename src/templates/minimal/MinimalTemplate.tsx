import React from 'react';
import { TemplateProps } from '../types';
import styles from './minimal.module.css';
import { MapPin, ExternalLink, GitBranch, Mail, Globe } from 'lucide-react';

export default function MinimalTemplate({
  username,
  profile,
  projects,
  experiences,
  educations,
  skills,
  socialLinks,
}: TemplateProps) {
  const name = profile.name || username || 'Student';

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          {profile.avatarUrl && (
            <img
              src={profile.avatarUrl}
              alt={name}
              className={styles.avatar}
            />
          )}
          <h1 className={styles.name}>{name}</h1>
          {profile.headline && <p className={styles.headline}>{profile.headline}</p>}
          {profile.location && (
            <div className={styles.location}>
              <MapPin size={14} />
              <span>{profile.location}</span>
            </div>
          )}
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
                  {link.platform.toLowerCase().includes('github') ? (
                    <GitBranch size={14} />
                  ) : link.platform.toLowerCase().includes('mail') ? (
                    <Mail size={14} />
                  ) : (
                    <Globe size={14} />
                  )}
                  <span>{link.platform}</span>
                </a>
              ))}
            </div>
          )}
        </header>

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Selected Works</h2>
            <div>
              {projects.map((proj, idx) => (
                <div key={idx} className={styles.projectCard}>
                  <div className={styles.projectTitleRow}>
                    <span className={styles.projectTitle}>{proj.title}</span>
                    <div className={styles.projectLinks}>
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.projectLink}
                        >
                          Live ↗
                        </a>
                      )}
                      {proj.sourceUrl && (
                        <a
                          href={proj.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.projectLink}
                        >
                          Source
                        </a>
                      )}
                    </div>
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
          </section>
        )}

        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Experience</h2>
            <div>
              {experiences.map((exp, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineRole}>{exp.role}</span>
                    <span className={styles.timelineDate}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className={styles.timelineCompany}>{exp.company}</div>
                  {exp.description && <p className={styles.timelineDesc}>{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {educations && educations.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Education</h2>
            <div>
              {educations.map((edu, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineRole}>{edu.institution}</span>
                    <span className={styles.timelineDate}>
                      {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                    </span>
                  </div>
                  <div className={styles.timelineCompany}>
                    {edu.degree} {edu.field && `in ${edu.field}`}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Expertise</h2>
            <div className={styles.skillsGrid}>
              {skills.map((skill, idx) => (
                <span key={idx} className={styles.skillBadge}>
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <span>{name}</span>
          <span className={styles.footerBadge}>
            {profile.headline || 'Minimal Portfolio'}
          </span>
        </footer>
      </div>
    </main>
  );
}
