/**
 * Sliding-window in-memory rate limiter.
 *
 * Good enough for a single serverless instance / low-volume endpoints
 * (checkout). For multi-region production scale, swap the store for
 * Upstash Redis — the `RateLimiter` interface stays the same.
 */
export interface RateLimiter {
  check(key: string): { allowed: boolean; retryAfterSeconds: number };
}

interface Window {
  timestamps: number[];
}

export function createRateLimiter(options: {
  maxRequests: number;
  windowMs: number;
}): RateLimiter {
  const store = new Map<string, Window>();

  return {
    check(key: string) {
      const now = Date.now();
      const cutoff = now - options.windowMs;
      const win = store.get(key) ?? { timestamps: [] };

      win.timestamps = win.timestamps.filter((t) => t > cutoff);

      if (win.timestamps.length >= options.maxRequests) {
        const oldest = win.timestamps[0] ?? now;
        return {
          allowed: false,
          retryAfterSeconds: Math.ceil((oldest + options.windowMs - now) / 1000),
        };
      }

      win.timestamps.push(now);
      store.set(key, win);

      // opportunistic cleanup
      if (store.size > 10_000) {
        for (const [k, v] of store) {
          if (v.timestamps.every((t) => t <= cutoff)) store.delete(k);
        }
      }

      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

/** Extract the client IP from a Next.js request (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() ?? "unknown";
}
