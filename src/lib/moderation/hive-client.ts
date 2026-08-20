/**
 * =====================================================================
 * Layer 2: Hive Official API Client
 * =====================================================================
 * Server-side integration with Hive V2/V3 Synchronous Moderation API.
 * - Endpoint: https://api.thehive.ai/api/v2/task/sync
 * - Authentication: Authorization: token <HIVE_API_KEY>
 * - Chunking: Keeps text payloads <= 1024 characters per Hive specification.
 * - Fail-Closed: Network failures, timeouts, and errors fail closed.
 */

import { evaluateHiveTextResponse, evaluateHiveVisualResponse, PolicyEvaluationResult } from './policy';
import { executeWithHiveRotation, getConfiguredKeyCount } from './key-manager';

const HIVE_V3_TEXT_ENDPOINT = 'https://api.thehive.ai/api/v3/hive/text-moderation';
const HIVE_V3_VISUAL_ENDPOINT = 'https://api.thehive.ai/api/v3/hive/visual-moderation';
const HIVE_CHUNK_LIMIT = 1000; // Hive limit is 1024 chars; 1000 provides safety margin
const REQUEST_TIMEOUT_MS = 10000;

function hasConfiguredHiveKeys(): boolean {
  return getConfiguredKeyCount() > 0;
}

/**
 * Intelligent text chunker that splits long text on paragraph / sentence boundaries
 * while keeping chunks strictly under `maxChunkSize`.
 */
export function chunkText(text: string, maxChunkSize = HIVE_CHUNK_LIMIT): string[] {
  const clean = text.trim();
  if (!clean) return [];
  if (clean.length <= maxChunkSize) return [clean];

  const chunks: string[] = [];
  const paragraphs = clean.split(/\n+/);
  let currentChunk = '';

  for (const para of paragraphs) {
    if (para.length > maxChunkSize) {
      // Split large paragraph by sentence or punctuation
      const sentences = para.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [para];
      for (const sentence of sentences) {
        if ((currentChunk + ' ' + sentence).trim().length <= maxChunkSize) {
          currentChunk = (currentChunk + ' ' + sentence).trim();
        } else {
          if (currentChunk) chunks.push(currentChunk);
          if (sentence.length <= maxChunkSize) {
            currentChunk = sentence.trim();
          } else {
            // Hard split as last resort
            for (let i = 0; i < sentence.length; i += maxChunkSize) {
              chunks.push(sentence.slice(i, i + maxChunkSize).trim());
            }
            currentChunk = '';
          }
        }
      }
    } else {
      if ((currentChunk + '\n' + para).trim().length <= maxChunkSize) {
        currentChunk = (currentChunk + '\n' + para).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = para.trim();
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Executes a single Hive V3 API request with round-robin key cycling & failover
 */
async function callHiveV3(endpoint: string, payload: Record<string, unknown>): Promise<unknown> {
  return executeWithHiveRotation(async (key) => {
    const headers = {
      'authorization': `Bearer ${key.token}`,
      'accept': 'application/json',
      'Content-Type': 'application/json',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    console.log(`[Hive V3 API] 📡 Request -> Endpoint: ${endpoint} | Slot #${key.index} | Token: ${key.token.slice(0, 6)}...`);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'No response body');
        console.error(`[Hive V3 API Error] ❌ Status: ${res.status} | Slot: #${key.index} | Body: ${errorText.slice(0, 300)}`);
        throw new Error(`Hive API error (status ${res.status}, slot #${key.index}): ${errorText.slice(0, 200)}`);
      }

      const json = await res.json();
      console.log(`[Hive V3 API Success] ✅ Status: 200 | Slot: #${key.index}`);
      return json;
    } finally {
      clearTimeout(timeoutId);
    }
  });
}

/**
 * Moderates aggregated text content against Hive V3
 */
export async function moderateTextWithHive(text: string): Promise<PolicyEvaluationResult> {
  if (!hasConfiguredHiveKeys()) {
    return {
      allowed: false,
      reason: 'Hive API key is not configured',
      violations: ['MISSING_HIVE_API_KEY'],
    };
  }

  const chunks = chunkText(text);
  if (chunks.length === 0) {
    return { allowed: true, violations: [] };
  }

  // Moderate each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const payload = {
      input: [{ text: chunk }],
      processing_mode: 'sync',
    };

    try {
      const response = await callHiveV3(HIVE_V3_TEXT_ENDPOINT, payload);
      const evalResult = evaluateHiveTextResponse(response);
      if (!evalResult.allowed) {
        return evalResult;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Hive error';
      return {
        allowed: false,
        reason: `Hive moderation service unavailable: ${message}`,
        violations: ['HIVE_SERVICE_ERROR'],
      };
    }
  }

  return { allowed: true, violations: [] };
}

/**
 * Moderates a public image URL against Hive V3 Visual Moderation
 */
export async function moderateImageWithHive(imageUrl: string): Promise<PolicyEvaluationResult> {
  if (!hasConfiguredHiveKeys()) {
    return {
      allowed: false,
      reason: 'Hive API key is not configured',
      violations: ['MISSING_HIVE_API_KEY'],
    };
  }

  if (!imageUrl || !imageUrl.startsWith('http')) {
    return { allowed: true, violations: [] };
  }

  const payload = {
    input: [{ media_url: imageUrl }],
    processing_mode: 'sync_with_fallback',
  };

  try {
    const response = await callHiveV3(HIVE_V3_VISUAL_ENDPOINT, payload);
    return evaluateHiveVisualResponse(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Hive error';
    return {
      allowed: false,
      reason: `Hive visual moderation unavailable: ${message}`,
      violations: ['HIVE_SERVICE_ERROR'],
    };
  }
}
