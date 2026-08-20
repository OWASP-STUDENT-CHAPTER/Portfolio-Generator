'use server';

import { requireAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Gets all user websites for the admin dashboard
 */
export async function getAllWebsitesAdmin() {
  await requireAdmin();

  const websites = await prisma.website.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          lastLoginAt: true,
        },
      },
      profile: true,
      _count: {
        select: {
          projects: true,
          experiences: true,
          skills: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return websites;
}

/**
 * Deactivates or reactivates a website
 */
export async function toggleWebsiteDeactivation(websiteId: string, deactivate: boolean) {
  await requireAdmin();

  await prisma.website.update({
    where: { id: websiteId },
    data: {
      deactivated: deactivate,
      deactivatedAt: deactivate ? new Date() : null,
    },
  });

  revalidatePath('/dashboard/admin');
  return { success: true, deactivated: deactivate };
}

/**
 * Gets reserved usernames list
 */
export async function getReservedUsernamesAdmin() {
  await requireAdmin();
  return await prisma.reservedUsername.findMany({
    orderBy: { username: 'asc' },
  });
}

/**
 * Adds a new reserved username
 */
export async function addReservedUsernameAdmin(username: string, reason?: string) {
  await requireAdmin();
  const sanitized = username.trim().toLowerCase();

  await prisma.reservedUsername.upsert({
    where: { username: sanitized },
    create: {
      username: sanitized,
      reason: reason?.trim() || 'Admin reserved',
    },
    update: {
      reason: reason?.trim() || 'Admin reserved',
    },
  });

  revalidatePath('/dashboard/admin');
  return { success: true };
}

/**
 * Deletes a reserved username
 */
export async function deleteReservedUsernameAdmin(username: string) {
  await requireAdmin();
  const sanitized = username.trim().toLowerCase();

  await prisma.reservedUsername.deleteMany({
    where: { username: sanitized },
  });

  revalidatePath('/dashboard/admin');
  return { success: true };
}
