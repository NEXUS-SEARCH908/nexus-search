/**
 * Zero-Cost Client Rate Limiting Engine
 * Uses an efficient in-memory token-bucket tracking strategy.
 * Designed to execute cleanly inside lightweight free edge deployment containers.
 */

interface RateLimitTracker {
  tokens: number;
  lastRefilled: number;
}

const memoryStore = new Map<string, RateLimitTracker>();

// Rigid default boundaries configured for public ingress nodes
const MAX_TOKENS = 60; // Allow 60 burst search events maximum
const REFILL_RATE_PER_MS = 1 / 1000; // Refill exactly 1 token every 1000ms (1 second)

export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  let record = memoryStore.get(identifier);

  if (!record) {
    record = { tokens: MAX_TOKENS, lastRefilled: now };
    memoryStore.set(identifier, record);
    return false;
  }

  // Calculate elapsed duration to compute exact fractional token updates
  const elapsed = now - record.lastRefilled;
  record.tokens = Math.min(MAX_TOKENS, record.tokens + elapsed * REFILL_RATE_PER_MS);
  record.lastRefilled = now;

  if (record.tokens >= 1) {
    record.tokens -= 1;
    memoryStore.set(identifier, record);
    return false; // Request approved
  }

  memoryStore.set(identifier, record);
  return true; // Threshold breached
}

/**
 * Periodically clears stagnant IP records out of heap space memory profiles 
 * to guarantee compliance with zero-cost RAM optimization limits.
 */
export function cleanRateLimitCache(): void {
  const now = Date.now();
  const maxStagnantAge = 1000 * 60 * 10; // 10 minutes cache duration threshold
  
  for (const [key, record] of memoryStore.entries()) {
    if (now - record.lastRefilled > maxStagnantAge) {
      memoryStore.delete(key);
    }
  }
}
