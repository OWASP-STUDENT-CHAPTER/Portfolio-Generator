import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { APP_CONFIG } from '@/lib/config';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username')?.trim().toLowerCase();

  if (!username) {
    return NextResponse.json({ available: false, error: 'Username is required' }, { status: 400 });
  }

  // Format check
  if (!APP_CONFIG.username.regex.test(username)) {
    return NextResponse.json({
      available: false,
      error: 'Can only contain lowercase letters, numbers, and hyphens (min 3, max 30 chars)',
    });
  }

  // Local profanity check
  const { checkLocalProfanity } = await import('@/lib/moderation');
  const profanityCheck = checkLocalProfanity(username);
  if (!profanityCheck.isSafe) {
    return NextResponse.json({ available: false, error: 'This username is not permitted' });
  }

  // Reserved check
  if (APP_CONFIG.reservedUsernames.includes(username)) {
    return NextResponse.json({ available: false, error: 'This username is reserved for platform use' });
  }

  const reservedInDb = await prisma.reservedUsername.findUnique({
    where: { username },
  });
  if (reservedInDb) {
    return NextResponse.json({ available: false, error: 'This username is reserved for platform use' });
  }

  // Current user's own username exemption check
  const session = await auth();
  let currentUserId: string | null = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    currentUserId = user?.id || null;
  }

  const existing = await prisma.website.findUnique({
    where: { username },
    select: { userId: true },
  });

  if (existing) {
    if (currentUserId && existing.userId === currentUserId) {
      return NextResponse.json({ available: true, isCurrent: true });
    }
    return NextResponse.json({ available: false, error: 'Username is already taken' });
  }

  return NextResponse.json({ available: true });
}
