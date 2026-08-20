import React from 'react';
import { TemplateProps } from '../types';
import styles from './terminal.module.css';

export default function TerminalTemplate({
  username,
  profile,
  projects,
  experiences,
  educations,
  skills,
  socialLinks,
}: TemplateProps) {
  const name = profile.name || username || 'root';

  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <div className={styles.titleBar}>
          <span>bash — {username || 'student'}@thapar.edu</span>
          <span>● ■ ▲</span>
        </div>

        <div className={styles.screen}>
          <div className={styles.asciiBanner}>
{`
   _____       _             _         _       
  / ____|     | |           (_)       (_)      
 | (___   __ _| |__  _   _   _  __ _   _ _ __  
  \\___ \\ / _\` | '_ \\| | | | | |/ _\` | | | '_ \\ 
  ____) | (_| | | | | |_| |_| | (_| |_| | | | |
 |_____/ \\__,_|_| |_|\\__,_(_)_|\\__,_(_)_|_| |_|
==================================================
              THAPAR IDENTITY SYSTEM              
`}
          </div>

          {/* whoami */}
          <div className={styles.cmdLine}>
            <span className={styles.prompt}>user@{username || 'guest'}:~$</span>
            <span className={styles.cmdText}>whoami</span>
            <div className={styles.response}>
              <p>
                <strong>NAME:</strong> {name}
              </p>
              {profile.headline && (
                <p>
                  <strong>ROLE:</strong> {profile.headline}
                </p>
              )}
              {profile.location && (
                <p>
                  <strong>LOC :</strong> {profile.location}
                </p>
              )}
              {profile.bio && (
                <p>
                  <strong>BIO :</strong> {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* cat ./skills.json */}
          {skills && skills.length > 0 && (
            <div className={styles.cmdLine}>
              <span className={styles.prompt}>user@{username || 'guest'}:~$</span>
              <span className={styles.cmdText}>cat ./skills.json</span>
              <div className={styles.response}>
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(
                    skills.map((s) => s.name),
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}

          {/* ls -la ./projects/ */}
          {projects && projects.length > 0 && (
            <div className={styles.cmdLine}>
              <span className={styles.prompt}>user@{username || 'guest'}:~$</span>
              <span className={styles.cmdText}>ls -la ./projects/</span>
              <div className={styles.response}>
                {projects.map((proj, idx) => (
                  <div key={idx} className={styles.itemBlock}>
                    <div>
                      <strong>{proj.title}</strong>
                    </div>
                    {proj.description && <div>{proj.description}</div>}
                    {proj.tags && <div style={{ color: '#00ff66', opacity: 0.8 }}>tags: {proj.tags}</div>}
                    {proj.liveUrl && (
                      <div>
                        URL:{' '}
                        <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                          {proj.liveUrl}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* cat ./career.log */}
          {experiences && experiences.length > 0 && (
            <div className={styles.cmdLine}>
              <span className={styles.prompt}>user@{username || 'guest'}:~$</span>
              <span className={styles.cmdText}>cat ./experience.log</span>
              <div className={styles.response}>
                {experiences.map((exp, idx) => (
                  <div key={idx} className={styles.itemBlock}>
                    <div>
                      [{exp.startDate} - {exp.current ? 'Present' : exp.endDate}] {exp.role} @ {exp.company}
                    </div>
                    {exp.description && <div>{exp.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* social links */}
          {socialLinks && socialLinks.length > 0 && (
            <div className={styles.cmdLine}>
              <span className={styles.prompt}>user@{username || 'guest'}:~$</span>
              <span className={styles.cmdText}>curl -s https://socials.io</span>
              <div className={styles.response}>
                {socialLinks.map((link, idx) => (
                  <div key={idx}>
                    → {link.platform}:{' '}
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                      {link.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.cmdLine}>
            <span className={styles.prompt}>user@{username || 'guest'}:~$</span>
            <span className={styles.cursor}></span>
          </div>
        </div>
      </div>
    </div>
  );
}
