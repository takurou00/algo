import type { Context, Next } from "hono";

interface RateLimitOptions {
  windowMs: number;   // window in milliseconds
  max: number;        // max requests per window
  keyFn?: (c: Context) => string;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis in production for multi-instance)
const store = new Map<string, WindowEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 5 * 60 * 1000);

function getIp(c: Context): string {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    c.req.header("x-real-ip") ??
    "unknown"
  );
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyFn } = options;

  return async (c: Context, next: Next) => {
    const key = keyFn ? keyFn(c) : `${c.req.path}:${getIp(c)}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + windowMs };
      store.set(key, entry);
    } else {
      entry.count++;
    }

    const remaining = Math.max(0, max - entry.count);
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

    c.header("X-RateLimit-Limit", String(max));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header("X-RateLimit-Reset", String(resetSeconds));

    if (entry.count > max) {
      c.header("Retry-After", String(resetSeconds));
      return c.json(
        { error: "Too many requests. Please try again later." },
        429
      );
    }

    await next();
  };
}

// Preset configs
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  keyFn: (c) => `auth:${c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`,
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  keyFn: (c) =>
    `upload:${c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`,
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 120,
});
