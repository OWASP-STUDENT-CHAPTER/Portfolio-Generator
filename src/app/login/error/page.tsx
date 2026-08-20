import React from 'react';
import Link from 'next/link';
import { ShieldAlert, AlertCircle, ArrowLeft } from 'lucide-react';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const isDomainError = error === 'DomainRestricted';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#070a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        color: '#f8fafc',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(17, 24, 39, 0.9)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '24px',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(239, 68, 68, 0.2)',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          {isDomainError ? (
            <ShieldAlert size={32} color="#ef4444" />
          ) : (
            <AlertCircle size={32} color="#ef4444" />
          )}
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#f87171' }}>
          {isDomainError ? 'Domain Eligibility Required' : 'Authentication Error'}
        </h1>

        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {isDomainError ? (
            <>
              Sign-in is currently restricted to authorized email domains. Please sign in with an eligible account.
            </>
          ) : (
            <>
              Unable to complete sign in. Error code: <code>{error || 'OAuthError'}</code>.
            </>
          )}
        </p>

        {isDomainError ? (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '2rem',
              textAlign: 'left',
              fontSize: '0.85rem',
              color: '#94a3b8',
            }}
          >
            <div>Please check with your administrator or ensure your email domain is allowed in the platform configuration.</div>
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '2rem',
              textAlign: 'left',
              fontSize: '0.85rem',
              color: '#94a3b8',
            }}
          >
            <div>Please ensure your Google OAuth credentials and redirect URIs match your domain in Google Cloud Console.</div>
          </div>
        )}

        <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
          <ArrowLeft size={16} />
          <span>Return to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
