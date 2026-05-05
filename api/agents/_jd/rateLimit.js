// Lightweight in-memory rate limiter.
//
// Caveat: Vercel serverless instances are ephemeral and per-region, so this is
// best-effort — it blocks casual abuse and accidental retries on a warm
// instance, but a determined attacker hitting many cold starts can bypass it.
// For hard guarantees, swap to Upstash Redis or Vercel KV via a swappable
// adapter; the interface here is `consume(key) -> { ok, retryAfterMs }`.
/* eslint-env node */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;

const buckets = new Map();

function nowMs() {
  return Date.now();
}

function prune(now) {
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

export function consume(key) {
  const now = nowMs();
  if (buckets.size > 1000) prune(now);

  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_REQUESTS - 1, retryAfterMs: 0 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { ok: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { ok: true, remaining: MAX_REQUESTS - entry.count, retryAfterMs: 0 };
}

export function clientKey(req) {
  // Vercel sets x-forwarded-for; fall back to remoteAddress / "anon".
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) {
    return fwd.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "anon";
}

export const RATE_LIMIT_CONFIG = { WINDOW_MS, MAX_REQUESTS };
