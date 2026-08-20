import React from 'react';
import { TemplateProps } from '../types';
import styles from './professional.module.css';
import { MapPin, Mail, Globe, ExternalLink, Briefcase, GraduationCap, Award } from 'lucide-react';

export default function ProfessionalTemplate({
  username,
  profile,
  projects,
  experiences,
  educations,
  skills,
  socialLinks,
}: TemplateProps) {
  const name = profile.name || username || 'Professional';

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Executive Header */}
        <header className={styles.header}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {profile.avatarUrl && (
              <img src={profile.avatarUrl} alt={name} className={styles.avatar} />
            )}
            <div>
              <h1 className={styles.name}>{name}</h1>
              {profile.headline && <div className={styles.headline}>{profile.headline}</div>}
              {profile.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <MapPin size={13} />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>

          {socialLinks && socialLinks.length > 0 && (
            <div className={styles.contactRow}>
              {socialLinks.map((link, idx) => (
                <div key={idx} className={styles.contactItem}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    {link.platform} ↗
                  </a>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* Two Column Layout */}
        <div className={styles.bodyLayout}>
          {/* Main Experience & Projects */}
          <div>
            {profile.bio && (
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 className={styles.sectionTitle}>Executive Summary</h2>
                <p className={styles.itemDesc}>{profile.bio}</p>
              </section>
            )}

            {experiences && experiences.length > 0 && (
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 className={styles.sectionTitle}>Professional Experience</h2>
                {experiences.map((exp, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>{exp.role}</span>
                      <span className={styles.itemDate}>
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className={styles.itemSubtitle}>{exp.company}</div>
                    {exp.description && <p className={styles.itemDesc}>{exp.description}</p>}
                  </div>
                ))}
              </section>
            )}

            {projects && projects.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Key Projects & Initiatives</h2>
                {projects.map((proj, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>{proj.title}</span>
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#0284c7', fontSize: '0.85rem' }}
                        >
                          View Project ↗
                        </a>
                      )}
                    </div>
                    {proj.description && <p className={styles.itemDesc}>{proj.description}</p>}
                    {proj.tags && (
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Technologies: {proj.tags}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>

          {/* Sidebar: Education & Skills */}
          <div>
            {educations && educations.length > 0 && (
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 className={styles.sectionTitle}>Education</h2>
                {educations.map((edu, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.itemTitle}>{edu.institution}</div>
                    <div className={styles.itemSubtitle}>
                      {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                    </div>
                    <div className={styles.itemDate}>
                      {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                      {edu.gpa ? ` • CGPA: ${edu.gpa}` : ''}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {skills && skills.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Core Competencies</h2>
                <div className={styles.skillPills}>
                  {skills.map((skill, idx) => (
                    <span key={idx} className={styles.skillPill}>
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <footer className={styles.footer}>
          <span>{profile.headline || 'Professional Profile'}</span>
          <span>{name}</span>
        </footer>
      </div>
    </div>
  );
}
