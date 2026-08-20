import React from 'react';
import { requireAuth } from '@/lib/auth-utils';
import SkillsEditor from '@/components/dashboard/SkillsEditor';

export default async function SkillsPage() {
  const user = await requireAuth();
  const skills = user.website?.skills || [];

  return (
    <div style={{ maxWidth: '880px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Skills & Tech Stack
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Add your programming languages, frameworks, developer tools, and concepts. Click any button below to toggle it instantly.
        </p>
      </div>

      <SkillsEditor initialSkills={skills} />
    </div>
  );
}
