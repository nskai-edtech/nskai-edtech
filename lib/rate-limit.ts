interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * In-memory sliding-window IP rate limiter.
 *
 * Designed as a drop-in replacement for the Upstash/Redis IP limiter.
 * When budget allows, swap this back to Upstash by replacing the returned
 * function with an Upstash `Ratelimit.slidingWindow` call — the
 * RateLimitResult interface is identical.
 *
 * NOTE: Because Next.js may run multiple serverless instances, limits are
 * per-instance. This is acceptable for cost-free bot protection; for
 * distributed-exact counting, restore Upstash.
 */
export function createIpRateLimiter({
  maxRequests,
  windowMs,
}: {
  maxRequests: number;
  windowMs: number;
}) {
  return createRateLimiter({ maxRequests, windowMs });
}

export function createRateLimiter({
  maxRequests,
  windowMs,
}: {
  /** Maximum requests allowed within the window. */
  maxRequests: number;
  /** Time window in milliseconds. */
  windowMs: number;
}) {
  const store = new Map<string, number[]>();

  // Periodically evict stale keys to prevent unbounded growth (every 60 s)
  const CLEANUP_INTERVAL = 60_000;
  let lastCleanup = Date.now();

  function cleanup(now: number) {
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, timestamps] of store.entries()) {
      const fresh = timestamps.filter((t) => now - t < windowMs);
      if (fresh.length === 0) {
        store.delete(key);
      } else {
        store.set(key, fresh);
      }
    }
  }

  return function check(key: string): RateLimitResult {
    const now = Date.now();
    cleanup(now);

    const timestamps = (store.get(key) ?? []).filter((t) => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      const oldestInWindow = timestamps[0]!;
      return {
        allowed: false,
        remaining: 0,
        resetInMs: windowMs - (now - oldestInWindow),
      };
    }

    timestamps.push(now);
    store.set(key, timestamps);

    return {
      allowed: true,
      remaining: maxRequests - timestamps.length,
      resetInMs: windowMs - (now - timestamps[0]!),
    };
  };
}
