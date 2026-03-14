import { createIpRateLimiter } from "@/lib/rate-limit";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
};

// 5 requests per 60-second window per IP+invite-code key (matches previous Upstash config).
// TODO: When budget allows, restore Upstash here:
//   import { Ratelimit } from "@upstash/ratelimit";
//   import { Redis } from "@upstash/redis";
//   const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, "60 s"), analytics: true, prefix: "ratelimit:live-guest-token" });
const limiter = createIpRateLimiter({ maxRequests: 5, windowMs: 60_000 });

export async function checkGuestTokenRateLimit(
  key: string,
): Promise<RateLimitResult> {
  return limiter(key);
}
