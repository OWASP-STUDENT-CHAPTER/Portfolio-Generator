import React from 'react';
import { TemplateProps } from '../types';
import styles from './craftsman.module.css';

export default function CraftsmanTemplate({
  username,
  profile,
  projects,
  experiences,
  educations,
  skills,
  socialLinks,
}: TemplateProps) {
  const name = profile.name || username || 'Developer';
  const firstName = name.split(' ')[0];
  const headline = profile.headline || 'Freelance Developer & Engineer';
  const location = profile.location || 'India';

  // Find standard contacts from socialLinks
  const whatsappLink = socialLinks?.find(
    (l) => l.platform.toLowerCase().includes('whatsapp') || l.platform.toLowerCase().includes('chat')
  )?.url || 'https://wa.me/919999999999';

  const mailLink = socialLinks?.find(
    (l) => l.platform.toLowerCase().includes('mail') || l.platform.toLowerCase().includes('email')
  )?.url || (profile.email ? `mailto:${profile.email}` : '#contact');

  const githubLink = socialLinks?.find((l) => l.platform.toLowerCase().includes('github'))?.url;
  const linkedinLink = socialLinks?.find((l) => l.platform.toLowerCase().includes('linkedin'))?.url;

  // Generate capability list from skills or standard developer craft
  const defaultCapabilities = [
    { title: 'Websites & web apps', desc: 'Fast, modern sites and web tools built around your business.' },
    { title: 'Mobile apps & APIs', desc: 'Cross-platform apps and scalable services for your customers or team.' },
    { title: 'Online stores & payments', desc: 'E-commerce that brings in customers, with seamless payments built in.' },
    { title: 'Dashboards & internal tools', desc: 'One screen to manage operations, users, and real-time data from.' },
    { title: 'AI & automation', desc: 'Repetitive daily workflows and intelligence, handled automatically.' },
  ];

  const capabilityItems = skills && skills.length >= 3
    ? skills.slice(0, 5).map((s) => ({
        title: s.name,
        desc: s.category ? `High-performance ${s.category.toLowerCase()} and production engineering.` : 'Engineered for reliability, performance, and clean maintainability.',
      }))
    : defaultCapabilities;

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        {/* Top Header */}
        <header className={styles.header}>
          <div className={styles.brandName}>{name}</div>
          <div className={styles.brandSubtitle}>
            {headline.toUpperCase()} • {location.toUpperCase()}
          </div>
          <div className={styles.headerDivider} />
        </header>

        {/* Section 1: A Quick Note */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>A Quick Note</span>
            <div className={styles.sectionLine} />
          </div>

          <h1 className={styles.greeting}>Hi, I am {name}.</h1>

          <div className={styles.introBio}>
            {profile.bio ? (
              <p>{profile.bio}</p>
            ) : (
              <p>
                I build software for businesses, teams, and ideas, and I&apos;d be glad to help with yours. I&apos;m a student at a reputed college in North India{' '}
                <span className={styles.thaparNote}>
                  (Thapar Institute of Engineering &amp; Technology)
                </span>
                .
              </p>
            )}
          </div>
        </section>

        {/* Section 2: What I Make */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>What I Make</span>
            <div className={styles.sectionLine} />
          </div>

          <div className={styles.capabilitiesList}>
            {capabilityItems.map((item, idx) => (
              <div key={idx} className={styles.capabilityItem}>
                <div className={styles.capabilityTitle}>{item.title}</div>
                <p className={styles.capabilityDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Something I've Built */}
        {projects && projects.length > 0 && (
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Something I&apos;ve Built</span>
              <div className={styles.sectionLine} />
            </div>

            <div>
              {projects.map((proj, idx) => (
                <div key={idx} className={styles.projectShowcase}>
                  <div className={styles.projectTitleRow}>
                    <h2 className={styles.projectTitle}>{proj.title}</h2>
                    <span className={styles.liveBadge}>
                      <span className={styles.liveDot} />
                      <span>LIVE</span>
                    </span>
                  </div>

                  {proj.description && (
                    <p className={styles.projectStory}>{proj.description}</p>
                  )}

                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.projectLink}
                    >
                      {proj.liveUrl.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Closing Note & Handwritten Signature */}
        <div className={styles.closingNote}>
          If any of this sounds useful, the easiest thing is a quick message on WhatsApp or email. Even a one-line reply is perfectly fine, whenever suits you.
        </div>

        <div className={styles.signatureWrapper}>
          {/* Authentic SVG Signature */}
          <svg
            className={styles.signatureSvg}
            viewBox="0 0 160 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 35C20 15 35 10 45 28C52 40 40 45 35 30C30 15 50 12 60 25C70 38 75 15 85 20C95 25 105 10 115 30C125 15 135 22 145 18C150 16 155 25 140 32C125 38 100 42 70 40"
              stroke="#1a4338"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className={styles.signeeName}>{name}</div>
        </div>

        {/* Section 4: Reach Me */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Reach Me</span>
            <div className={styles.sectionLine} />
          </div>

          <div className={styles.actionsRow}>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              <span>WhatsApp</span>
            </a>

            <a href={mailLink} className={styles.reachLink}>
              Email
            </a>

            {linkedinLink && (
              <a href={linkedinLink} target="_blank" rel="noopener noreferrer" className={styles.reachLink}>
                LinkedIn
              </a>
            )}

            {githubLink && (
              <a href={githubLink} target="_blank" rel="noopener noreferrer" className={styles.reachLink}>
                GitHub
              </a>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <span>{name}</span>
          <span>{profile.location || 'Available for freelance & full-time work'}</span>
        </footer>
      </div>
    </main>
  );
}
