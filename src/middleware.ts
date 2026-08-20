import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory token bucket rate limiter for API protection
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const hostname = req.headers.get('host') || '';

  // 1. Rate limiting on API routes
  if (pathname.startsWith('/api')) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded. Please wait a minute.' }),
        { status: 429, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // 2. Subdomain Extraction
  // Examples:
  // "username.yourdomain.com" -> subdomain = "username"
  // "username.localhost:3000" -> subdomain = "username"
  // "yourdomain.com" / "localhost:3000" / "www.yourdomain.com" -> root domain (no rewrite)

  const configuredRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000').replace(/:\d+$/, '').toLowerCase();
  const cleanHost = hostname.replace(/:\d+$/, '').toLowerCase();

  let subdomain: string | null = null;

  if (cleanHost.endsWith('.localhost')) {
    subdomain = cleanHost.replace('.localhost', '');
  } else if (configuredRoot && cleanHost.includes(configuredRoot) && cleanHost !== configuredRoot && cleanHost !== `www.${configuredRoot}`) {
    subdomain = cleanHost.replace(`.${configuredRoot}`, '');
  }

  // If request has a valid personal website subdomain
  if (subdomain && subdomain !== 'app' && subdomain !== 'admin' && subdomain !== 'api' && subdomain !== 'www') {
    // Rewrite subdomain -> /[subdomain]
    return NextResponse.rewrite(new URL(`/${subdomain}${pathname}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /_next/ (Next.js internals)
     * 2. /_static (inside /public)
     * 3. Static files (.png, .jpg, .svg, .ico, .css, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
