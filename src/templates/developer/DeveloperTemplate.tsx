import React from 'react';
import { TemplateProps } from '../types';
import styles from './developer.module.css';
import { Terminal, MapPin, ExternalLink, Code2, GitBranch } from 'lucide-react';

export default function DeveloperTemplate({
  username,
  profile,
  projects,
  experiences,
  educations,
  skills,
  socialLinks,
}: TemplateProps) {
  const name = profile.name || username || 'dev';

  return (
    <div className={styles.container}>
      {/* Developer Sidebar */}
      <aside className={styles.sidebar}>
        {profile.avatarUrl && (
          <img src={profile.avatarUrl} alt={name} className={styles.avatar} />
        )}
        <div className={styles.statusPill}>
          <span>●</span>
          <span>Open for Opportunities</span>
        </div>
        <h1 className={styles.name}>{name}</h1>
        {profile.headline && <div className={styles.headline}>{profile.headline}</div>}

        {profile.location && (
          <div className={styles.metaItem}>
            <MapPin size={14} />
            <span>{profile.location}</span>
          </div>
        )}

        <div className={styles.metaItem}>
          <Terminal size={14} />
          <span>{username || 'developer'}</span>
        </div>

        {socialLinks && socialLinks.length > 0 && (
          <div className={styles.socialList}>
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
              >
                <GitBranch size={13} />
                <span>{link.platform}</span>
                <ExternalLink size={11} style={{ marginLeft: 'auto' }} />
              </a>
            ))}
          </div>
        )}
      </aside>

      {/* Main Terminal View */}
      <main className={styles.content}>
        {/* About Bio */}
        {profile.bio && (
          <section className={styles.section}>
            <div className={styles.codeHeader}>
              <span>{'// 01.'}</span>
              <span>README.md</span>
            </div>
            <p style={{ lineHeight: 1.7, color: '#c9d1d9' }}>{profile.bio}</p>
          </section>
        )}

        {/* Repositories / Projects */}
        {projects && projects.length > 0 && (
          <section className={styles.section}>
            <div className={styles.codeHeader}>
              <span>{'// 02.'}</span>
              <span>Repositories & Projects</span>
            </div>
            <div className={styles.gridProjects}>
              {projects.map((proj, idx) => (
                <div key={idx} className={styles.card}>
                  <div>
                    <h3 className={styles.cardTitle}>{proj.title}</h3>
                    {proj.description && <p className={styles.cardDesc}>{proj.description}</p>}
                  </div>
                  <div>
                    {proj.tags && (
                      <div className={styles.tagList}>
                        {proj.tags.split(',').map((t, ti) => (
                          <span key={ti} className={styles.tagChip}>
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className={styles.linkGroup}>
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer">
                          demo ↗
                        </a>
                      )}
                      {proj.sourceUrl && (
                        <a href={proj.sourceUrl} target="_blank" rel="noopener noreferrer">
                          source ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Career / Work */}
        {experiences && experiences.length > 0 && (
          <section className={styles.section}>
            <div className={styles.codeHeader}>
              <span>{'// 03.'}</span>
              <span>Work & Experience</span>
            </div>
            <div>
              {experiences.map((exp, idx) => (
                <div key={idx} className={styles.timelineEntry}>
                  <div className={styles.entryRole}>{exp.role}</div>
                  <div className={styles.entrySub}>
                    {exp.company} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </div>
                  {exp.description && <div className={styles.entryDesc}>{exp.description}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {educations && educations.length > 0 && (
          <section className={styles.section}>
            <div className={styles.codeHeader}>
              <span>{'// 04.'}</span>
              <span>Education</span>
            </div>
            <div>
              {educations.map((edu, idx) => (
                <div key={idx} className={styles.timelineEntry}>
                  <div className={styles.entryRole}>{edu.institution}</div>
                  <div className={styles.entrySub}>
                    {edu.degree} {edu.field ? `in ${edu.field}` : ''} • {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                    {edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Stack */}
        {skills && skills.length > 0 && (
          <section className={styles.section}>
            <div className={styles.codeHeader}>
              <span>{'// 05.'}</span>
              <span>Stack & Dependencies</span>
            </div>
            <div className={styles.skillsMatrix}>
              {skills.map((s, idx) => (
                <div key={idx} className={styles.skillPill}>
                  <Code2 size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: '#58a6ff' }} />
                  {s.name}
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <span>$ folio build --profile {username || 'developer'}</span>
          <span>Status: 200 OK</span>
        </footer>
      </main>
    </div>
  );
}
