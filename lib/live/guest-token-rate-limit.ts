import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { createRateLimiter } from "@/lib/rate-limit";

type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    resetInMs: number;
};

const localLimiter = createRateLimiter({
    maxRequests: 5,
    windowMs: 60_000,
});

const hasUpstash =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const ratelimit = hasUpstash
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, "60 s"),
        analytics: true,
        prefix: "ratelimit:live-guest-token",
    })
    : null;

export async function checkGuestTokenRateLimit(
    key: string,
): Promise<RateLimitResult> {
    if (!ratelimit) {
        return localLimiter(key);
    }

    const result = await ratelimit.limit(key);

    return {
        allowed: result.success,
        remaining: result.remaining,
        resetInMs: Math.max(0, result.reset - Date.now()),
    };
}