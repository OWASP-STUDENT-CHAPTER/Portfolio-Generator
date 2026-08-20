/**
 * =====================================================================
 * Moderation Result Caching Engine
 * =====================================================================
 * Computes deterministic SHA-256 hashes of aggregated public portfolio content.
 * Stores and queries verified moderation decisions in the database to prevent
 * duplicate Hive API calls for unchanged content and strictly protect the 100 req/day quota.
 */

import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { MODERATION_POLICY_VERSION } from './policy';

/**
 * Computes a deterministic SHA-256 hash of normalized public content
 */
export function computeContentHash(normalizedText: string, extraItems: string[] = []): string {
  const hasher = crypto.createHash('sha256');
  hasher.update(`POLICY:${MODERATION_POLICY_VERSION}|`);
  hasher.update(normalizedText.trim().toLowerCase());

  for (const item of extraItems) {
    if (item && item.trim()) {
      hasher.update(`|IMG:${item.trim()}`);
    }
  }

  return hasher.digest('hex');
}

export interface CachedDecision {
  found: boolean;
  isApproved: boolean;
  decision: 'ALLOW' | 'BLOCK' | 'NONE';
  reason?: string | null;
}

/**
 * Retrieves a cached moderation decision from the database
 */
export async function getCachedModerationResult(contentHash: string): Promise<CachedDecision> {
  try {
    const cached = await prisma.moderationCache.findUnique({
      where: { contentHash },
    });

    if (cached && cached.policyVersion === MODERATION_POLICY_VERSION) {
      return {
        found: true,
        isApproved: cached.isApproved,
        decision: cached.decision as 'ALLOW' | 'BLOCK',
        reason: cached.reason,
      };
    }
  } catch (err) {
    console.error('[ModerationCache] Lookup error:', err);
  }

  return {
    found: false,
    isApproved: false,
    decision: 'NONE',
  };
}

/**
 * Saves a moderation decision to the database cache
 */
export async function saveModerationResult(
  contentHash: string,
  isApproved: boolean,
  decision: 'ALLOW' | 'BLOCK',
  reason?: string
): Promise<void> {
  try {
    await prisma.moderationCache.upsert({
      where: { contentHash },
      create: {
        contentHash,
        isApproved,
        decision,
        reason: reason || null,
        policyVersion: MODERATION_POLICY_VERSION,
      },
      update: {
        isApproved,
        decision,
        reason: reason || null,
        policyVersion: MODERATION_POLICY_VERSION,
      },
    });
  } catch (err) {
    console.error('[ModerationCache] Save error:', err);
  }
}
