/**
 * Simple in-memory rate limiter
 * Note: This is not suitable for distributed systems. Use Redis for production.
 */

interface RateLimitEntry {
  attempts: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 60000); // Clean up every minute

export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 60000 // 1 minute default
): boolean {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetTime < now) {
    // Create new entry
    store.set(identifier, {
      attempts: 1,
      resetTime: now + windowMs,
    });
    return true; // Allow this request
  }

  if (entry.attempts < maxAttempts) {
    entry.attempts++;
    return true; // Allow this request
  }

  return false; // Reject this request
}

export function getRateLimitRemaining(
  identifier: string,
  maxAttempts: number = 5
): { remaining: number; resetTime: number | null } {
  const entry = store.get(identifier);

  if (!entry) {
    return { remaining: maxAttempts, resetTime: null };
  }

  const now = Date.now();
  if (entry.resetTime < now) {
    return { remaining: maxAttempts, resetTime: null };
  }

  return {
    remaining: Math.max(0, maxAttempts - entry.attempts),
    resetTime: entry.resetTime,
  };
}
