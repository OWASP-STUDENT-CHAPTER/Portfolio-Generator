/**
 * Centralized Platform Configuration
 *
 * All platform naming, domain routing, and admin privileges
 * are dynamically configurable via environment variables.
 */

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Folio',
  tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || 'Personal Portfolios Made Effortless',
  description: 'One account → One beautiful personal website → One unique subdomain.',
  rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000',
  protocol: process.env.NEXT_PUBLIC_PROTOCOL || 'http',

  // Admin emails list
  adminEmails: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean),

  // Reserved Subdomains & Usernames
  reservedUsernames: [
    'admin', 'administrator', 'api', 'app', 'dashboard', 'login', 'signup',
    'auth', 'oauth', 'support', 'help', 'docs', 'documentation', 'status',
    'mail', 'email', 'www', 'cdn', 'assets', 'static', 'folio',
    'dev', 'staging', 'test', 'demo', 'blog', 'news', 'billing',
    'settings', 'account', 'profile', 'null', 'undefined', 'root', 'web',
    'portfolio', 'create', 'preview', 'explore', 'discover', 'directory'
  ],

  // Username validation constraints
  username: {
    minLength: 3,
    maxLength: 30,
    regex: /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/,
  }
};

/**
 * Open eligibility - all authenticated Google accounts allowed
 */
export function isEmailDomainAllowed(_email?: string | null): boolean {
  return true;
}

/**
 * Checks if an email has administrative privileges.
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const rawAdmins = process.env.ADMIN_EMAILS || '';
  const adminList = rawAdmins
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  const normalized = email.trim().toLowerCase();
  return adminList.includes(normalized);
}

/**
 * Generates suggested username from a display name or email prefix
 */
export function generateSuggestedUsername(name?: string | null, email?: string | null): string {
  if (name) {
    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (sanitized.length >= 3) {
      return sanitized.slice(0, 24);
    }
  }

  if (email) {
    const prefix = email.split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (prefix.length >= 3) {
      return prefix.slice(0, 24);
    }
  }

  return 'user';
}

/**
 * Computes the real, live public portfolio URL for a user
 * Returns direct subdomain: e.g. https://username.yourdomain.com or http://username.localhost:3000
 */
export function getPublicSiteUrl(username: string, templateOverride?: string): string {
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000').replace(/:\d+$/, '').toLowerCase();
  let protocol = process.env.NEXT_PUBLIC_PROTOCOL || 'http';
  let port = '';

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('localhost') || host === '127.0.0.1') {
      protocol = 'http';
      port = window.location.port ? `:${window.location.port}` : '';
      let url = `${protocol}://${username}.localhost${port}`;
      if (templateOverride) url += `?template=${encodeURIComponent(templateOverride)}`;
      return url;
    }
  }

  let url = `${protocol}://${username}.${root}${port}`;
  if (templateOverride) {
    url += `?template=${encodeURIComponent(templateOverride)}`;
  }

  return url;
}
