/**
 * =====================================================================
 * Hive API Key Cycler & Rotation Manager
 * =====================================================================
 * Supports round-robin rotation across multiple configured API keys (1-6+)
 * with automatic fallback and failover on rate-limiting (429) or quota errors.
 */

export interface HiveKeyPair {
  index: number;
  accessKeyId?: string;
  secretKey?: string;
  token: string;
}

// In-memory atomic pointer for round-robin cycling
let currentKeyPointer = 0;

/**
 * Scans environment variables for all available Hive API key slots (1 through 6+)
 */
export function getLoadedHiveKeys(): HiveKeyPair[] {
  const keys: HiveKeyPair[] = [];

  // Check indexed slots 1 through 6
  for (let i = 1; i <= 6; i++) {
    const accessKeyId = process.env[`HIVE_ACCESS_KEY_${i}`]?.trim() || undefined;
    const secretKey = process.env[`HIVE_SECRET_KEY_${i}`]?.trim() || undefined;
    const tokenFallback = process.env[`HIVE_API_KEY_${i}`]?.trim() || undefined;

    const effectiveToken = secretKey || tokenFallback || accessKeyId;
    if (effectiveToken && effectiveToken.length > 0) {
      keys.push({
        index: i,
        accessKeyId,
        secretKey,
        token: effectiveToken,
      });
    }
  }

  // Fallback to legacy single key if no indexed keys are configured
  if (keys.length === 0) {
    const legacyKey = process.env.HIVE_API_KEY?.trim();
    if (legacyKey && legacyKey.length > 0) {
      keys.push({
        index: 1,
        token: legacyKey,
      });
    }
  }

  return keys;
}

/**
 * Returns the total count of active configured keys
 */
export function getConfiguredKeyCount(): number {
  return getLoadedHiveKeys().length;
}

/**
 * Gets the next key in the round-robin cycle and advances the pointer
 */
export function getNextHiveKey(): HiveKeyPair | null {
  const keys = getLoadedHiveKeys();
  if (keys.length === 0) {
    return null;
  }

  const selected = keys[currentKeyPointer % keys.length];
  currentKeyPointer = (currentKeyPointer + 1) % keys.length;
  return selected;
}

/**
 * Executes a Hive API call with automatic round-robin cycling and failover.
 * If the current key returns an error (429, 401, 403, 5xx), automatically
 * fails over to the next key in the pool up to `totalKeys` times.
 */
export async function executeWithHiveRotation<T>(
  operation: (key: HiveKeyPair) => Promise<T>
): Promise<T> {
  const keys = getLoadedHiveKeys();
  if (keys.length === 0) {
    throw new Error('No Hive API keys are configured in environment variables (HIVE_ACCESS_KEY_1..6 or HIVE_API_KEY)');
  }

  let lastError: Error | null = null;
  const initialIndex = currentKeyPointer % keys.length;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const keyIndex = (initialIndex + attempt) % keys.length;
    const key = keys[keyIndex];

    try {
      // Advance pointer for subsequent calls
      currentKeyPointer = (keyIndex + 1) % keys.length;
      return await operation(key);
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[Hive Key Rotation] Key slot #${key.index} encountered error: "${lastError.message}". Attempting failover to next key in pool (${attempt + 1}/${keys.length})...`
      );
    }
  }

  throw lastError || new Error('All configured Hive API keys failed');
}
