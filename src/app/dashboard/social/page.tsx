import React from 'react';
import { requireAuth } from '@/lib/auth-utils';
import SocialEditor from '@/components/dashboard/SocialEditor';

export default async function SocialLinksPage() {
  const user = await requireAuth();
  const existingLinks = user.website?.socialLinks || [];

  return (
    <div style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Social & Professional Links
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Connect your GitHub, LinkedIn, Twitter/X, competitive coding profiles, or personal contact email.
        </p>
      </div>

      <SocialEditor initialLinks={existingLinks} userEmail={user.email} />
    </div>
  );
}
