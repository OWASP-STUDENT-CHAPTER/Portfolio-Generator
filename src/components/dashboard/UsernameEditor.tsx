'use client';

import React, { useState, useEffect } from 'react';
import { changeUsername } from '@/actions/website';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { checkLocalProfanity } from '@/lib/moderation/veil-local';
import { ProfanityWarning } from '@/components/ui/ProfanityWarning';

export default function UsernameEditor({
  currentUsername,
  rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000',
}: {
  currentUsername: string;
  rootDomain?: string;
}) {
  const [username, setUsername] = useState(currentUsername);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; error?: string; isCurrent?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const localCheck = checkLocalProfanity(username);

  useEffect(() => {
    if (!username.trim()) {
      setAvailability(null);
      return;
    }

    if (!localCheck.isSafe) {
      setAvailability({ available: false, error: 'Username contains prohibited language' });
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await fetch(`/api/username/check?username=${encodeURIComponent(username.toLowerCase().trim())}`);
        const data = await res.json();
        setAvailability(data);
      } catch {
        setAvailability({ available: false, error: 'Network error checking availability' });
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localCheck.isSafe || !availability?.available) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await changeUsername(username.toLowerCase().trim());
      if (res && typeof res === 'object' && !(res as any).success) {
        setMessage({ text: (res as any).error || 'Failed to update username.', type: 'error' });
        return;
      }
      if (res && typeof res === 'object' && (res as any).unpublishWarning) {
        setMessage({
          text: `Subdomain updated to ${username.toLowerCase().trim()}.${rootDomain}, but portfolio saved as draft due to safety review.`,
          type: 'error',
        });
        return;
      }
      setMessage({ text: `Subdomain updated to ${username.toLowerCase().trim()}.${rootDomain}!`, type: 'success' });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update username.';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="form-group">
        <label className="form-label">Subdomain Identifier</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="form-input"
              placeholder="yourname"
              style={{
                paddingRight: '2.5rem',
                borderColor: !localCheck.isSafe && username.trim() ? '#ef4444' : undefined,
              }}
            />
            <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
              {checking ? (
                <RefreshCw size={14} className="animate-spin" color="#94a3b8" />
              ) : !localCheck.isSafe && username.trim() ? (
                <AlertCircle size={16} color="#ef4444" />
              ) : availability?.available ? (
                <CheckCircle2 size={16} color="#34d399" />
              ) : availability?.error ? (
                <AlertCircle size={16} color="#ef4444" />
              ) : null}
            </div>
          </div>
          <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem' }}>.{rootDomain}</span>
        </div>

        {/* Real-time profanity warning */}
        {username.trim() && !localCheck.isSafe ? (
          <ProfanityWarning isFlagged={true} reason="Username contains prohibited language" />
        ) : availability?.isCurrent ? (
          <div className="form-help" style={{ color: '#818cf8' }}>
            This is your currently active subdomain.
          </div>
        ) : availability?.available ? (
          <div className="form-help" style={{ color: '#34d399' }}>
            ✓ <strong>{username}.{rootDomain}</strong> is available to claim!
          </div>
        ) : availability?.error ? (
          <div className="form-help" style={{ color: '#f87171' }}>
            ✗ {availability.error}
          </div>
        ) : (
          <div className="form-help">
            Only lowercase letters, numbers, and hyphens (3-30 characters).
          </div>
        )}
      </div>

      {message && (
        <div
          style={{
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: message.type === 'success' ? '#6ee7b7' : '#fca5a5',
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={!availability?.available || availability?.isCurrent || saving}
          className="btn btn-primary btn-sm"
        >
          {saving ? 'Updating...' : 'Save New Subdomain'}
        </button>
      </div>
    </form>
  );
}
