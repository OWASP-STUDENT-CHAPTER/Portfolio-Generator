import React from 'react';
import { requireAdmin } from '@/lib/auth-utils';
import { APP_CONFIG, getPublicSiteUrl } from '@/lib/config';
import {
  getAllWebsitesAdmin,
  toggleWebsiteDeactivation,
  getReservedUsernamesAdmin,
  addReservedUsernameAdmin,
  deleteReservedUsernameAdmin,
} from '@/actions/admin';
import { Shield, Ban, CheckCircle, Plus, Trash2, Globe } from 'lucide-react';

export default async function AdminPage() {
  await requireAdmin();

  const websites = await getAllWebsitesAdmin();
  const reservedList = await getReservedUsernamesAdmin();

  async function handleAddReserved(formData: FormData) {
    'use server';
    const username = formData.get('username') as string;
    const reason = formData.get('reason') as string;
    if (username) {
      await addReservedUsernameAdmin(username, reason);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 600 }}>
            Platform Governance
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Administrator Command Center
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Manage all Thapar user portfolios, oversee subdomains, deactivate abusive sites, and protect reserved usernames.
        </p>
      </div>

      {/* Website Directory Table */}
      <div
        style={{
          background: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '1.75rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={18} color="#818cf8" />
          <span>Active Websites ({websites.length})</span>
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem 1rem' }}>User / Email</th>
                <th style={{ padding: '0.75rem 1rem' }}>Subdomain</th>
                <th style={{ padding: '0.75rem 1rem' }}>Template</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {websites.map((site) => (
                <tr
                  key={site.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: site.deactivated ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{site.user.name || 'Unnamed'}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{site.user.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <a
                      href={getPublicSiteUrl(site.username)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}
                    >
                      {site.username}.{APP_CONFIG.rootDomain} ↗
                    </a>
                  </td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                    <span className="badge badge-primary">{site.templateId}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {site.deactivated ? (
                      <span className="badge badge-danger">Deactivated</span>
                    ) : site.published ? (
                      <span className="badge badge-success">Live</span>
                    ) : (
                      <span className="badge badge-warning">Draft</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <form
                      action={async () => {
                        'use server';
                        await toggleWebsiteDeactivation(site.id, !site.deactivated);
                      }}
                      style={{ display: 'inline' }}
                    >
                      <button
                        type="submit"
                        className={site.deactivated ? 'btn btn-primary btn-sm' : 'btn btn-danger btn-sm'}
                      >
                        {site.deactivated ? (
                          <>
                            <CheckCircle size={13} />
                            <span>Reactivate</span>
                          </>
                        ) : (
                          <>
                            <Ban size={13} />
                            <span>Deactivate</span>
                          </>
                        )}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reserved Usernames Management */}
      <div
        style={{
          background: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '1.75rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} color="#ef4444" />
          <span>Reserved Usernames Protection ({reservedList.length})</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Reserved subdomains cannot be claimed or squatted by regular users.
        </p>

        {/* Add reserved username */}
        <form action={handleAddReserved} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            name="username"
            required
            placeholder="e.g. placements, alumni"
            className="form-input"
            style={{ width: '220px' }}
          />
          <input
            type="text"
            name="reason"
            placeholder="Reason (optional)"
            className="form-input"
            style={{ width: '280px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
            <Plus size={14} />
            <span>Reserve Subdomain</span>
          </button>
        </form>

        {/* List of reserved chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {reservedList.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
              }}
            >
              <span style={{ fontWeight: 600, color: '#cbd5e1' }}>{item.username}</span>
              <form
                action={async () => {
                  'use server';
                  await deleteReservedUsernameAdmin(item.username);
                }}
                style={{ display: 'inline' }}
              >
                <button
                  type="submit"
                  style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex' }}
                  title="Remove from reserved"
                >
                  <Trash2 size={12} />
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
