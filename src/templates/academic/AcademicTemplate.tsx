import React from 'react';
import { TemplateProps } from '../types';
import styles from './academic.module.css';
import { BookOpen, GraduationCap, MapPin, Mail, ExternalLink } from 'lucide-react';

export default function AcademicTemplate({
  username,
  profile,
  projects,
  experiences,
  educations,
  skills,
  socialLinks,
}: TemplateProps) {
  const name = profile.name || username || 'Scholar';

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.name}>{name}</h1>
            <div className={styles.institution}>
              {profile.headline || 'Scholar & Researcher'}
            </div>
            <div className={styles.meta}>
              {profile.location && <span>📍 {profile.location}</span>}
              {socialLinks &&
                socialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#002b49', textDecoration: 'underline' }}
                  >
                    {link.platform}
                  </a>
                ))}
            </div>
          </div>

          {profile.avatarUrl && (
            <img src={profile.avatarUrl} alt={name} className={styles.avatar} />
          )}
        </header>

        {/* Bio / Research Interests */}
        {profile.bio && (
          <section>
            <h2 className={styles.sectionHeading}>About & Research Interests</h2>
            <p>{profile.bio}</p>
          </section>
        )}

        {/* Education */}
        {educations && educations.length > 0 && (
          <section>
            <h2 className={styles.sectionHeading}>Education</h2>
            {educations.map((edu, idx) => (
              <div key={idx} className={styles.pubItem}>
                <div className={styles.pubTitle}>{edu.institution}</div>
                <div>
                  {edu.degree} {edu.field ? `in ${edu.field}` : ''} • {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                </div>
                {edu.gpa && <div style={{ color: '#555' }}>Cumulative GPA: {edu.gpa}</div>}
              </div>
            ))}
          </section>
        )}

        {/* Research / Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className={styles.sectionHeading}>Publications & Projects</h2>
            {projects.map((proj, idx) => (
              <div key={idx} className={styles.pubItem}>
                <div className={styles.pubTitle}>
                  [{idx + 1}] {proj.title}
                </div>
                {proj.description && <div className={styles.pubDesc}>{proj.description}</div>}
                {proj.tags && <div style={{ fontSize: '0.85rem', color: '#666' }}>Keywords: {proj.tags}</div>}
                {proj.liveUrl && (
                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.pubLink}
                  >
                    [Full Text / Artifact ↗]
                  </a>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Academic / Industrial Experience */}
        {experiences && experiences.length > 0 && (
          <section>
            <h2 className={styles.sectionHeading}>Experience & Appointments</h2>
            {experiences.map((exp, idx) => (
              <div key={idx} className={styles.pubItem}>
                <div className={styles.pubTitle}>
                  {exp.role}, {exp.company}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </div>
                {exp.description && <div className={styles.pubDesc}>{exp.description}</div>}
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section>
            <h2 className={styles.sectionHeading}>Technical Skills & Methodologies</h2>
            <div className={styles.skillsList}>
              {skills.map((skill, idx) => (
                <span key={idx} className={styles.skillItem}>
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <span>{profile.headline || 'Academic Portfolio'}</span>
          <span>{username || ''}</span>
        </footer>
      </div>
    </main>
  );
}
