import React from 'react';
import { TemplateProps } from '../types';
import styles from './editorial.module.css';

export default function EditorialTemplate({
  username,
  profile,
  projects,
  experiences,
  educations,
  skills,
  socialLinks,
}: TemplateProps) {
  const name = profile.name || username || 'Editorial Profile';

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.topBar}>
          <span>Vol. I — Thapar Edition</span>
          <span>{new Date().getFullYear()} Archive</span>
          <span>{profile.location || 'Patiala, Punjab'}</span>
        </div>

        <section className={styles.heroGrid}>
          <div>
            <div className={styles.headlineTag}>Feature Profile</div>
            <h1 className={styles.name}>{name}</h1>
            {profile.headline && <div className={styles.headline}>&ldquo;{profile.headline}&rdquo;</div>}
            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

            {socialLinks && socialLinks.length > 0 && (
              <div className={styles.socialRow}>
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    {link.platform} ↗
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className={styles.avatarCard}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={name} className={styles.avatar} />
            ) : (
              <div
                className={styles.avatar}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#eae7df',
                  fontSize: '2rem',
                }}
              >
                {name.charAt(0)}
              </div>
            )}
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Selected Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className={styles.sectionHeading}>Selected Projects & Works</h2>
            <div className={styles.worksGrid}>
              {projects.map((proj, idx) => (
                <article key={idx} className={styles.articleCard}>
                  <div className={styles.cardNum}>ENTRY No. 0{idx + 1}</div>
                  <h3 className={styles.projectTitle}>{proj.title}</h3>
                  {proj.description && <p className={styles.projectDesc}>{proj.description}</p>}
                  <div className={styles.projectMeta}>
                    <span className={styles.tags}>{proj.tags}</span>
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkButton}
                      >
                        Read More
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <hr className={styles.divider} />

        {/* Experience & Career */}
        {experiences && experiences.length > 0 && (
          <section>
            <h2 className={styles.sectionHeading}>Chronology of Experience</h2>
            <div>
              {experiences.map((exp, idx) => (
                <div key={idx} className={styles.expRow}>
                  <div className={styles.expDate}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </div>
                  <div>
                    <div className={styles.expRole}>{exp.role}</div>
                    <div className={styles.expCompany}>{exp.company}</div>
                    {exp.description && <p style={{ margin: 0, color: '#4a4845' }}>{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {educations && educations.length > 0 && (
          <section>
            <h2 className={styles.sectionHeading}>Academic Qualifications</h2>
            <div>
              {educations.map((edu, idx) => (
                <div key={idx} className={styles.expRow}>
                  <div className={styles.expDate}>
                    {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                  </div>
                  <div>
                    <div className={styles.expRole}>{edu.institution}</div>
                    <div className={styles.expCompany}>
                      {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                      {edu.gpa ? ` (GPA: ${edu.gpa})` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section>
            <h2 className={styles.sectionHeading}>Repertoire & Skills</h2>
            <div className={styles.skillsContainer}>
              {skills.map((skill, idx) => (
                <span key={idx} className={styles.skillItem}>
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <span>{profile.headline || 'Editorial Portfolio'}</span>
          <span>© {new Date().getFullYear()} {name}</span>
        </footer>
      </div>
    </main>
  );
}
