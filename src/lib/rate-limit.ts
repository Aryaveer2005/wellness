import "server-only";

// Simple in-memory, per-IP daily cap for the AI routes (server-side only).
// Note: memory resets on server restart and isn't shared between serverless
// instances — good enough for v1 cost protection, not a security boundary.

type Bucket = { day: string; count: number };
const buckets = new Map<string, Bucket>();

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Counts one use. Returns false (and does not count) when the daily cap is reached. */
export function takeDailyQuota(scope: string, ip: string, limit: number): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const key = `${scope}:${ip}`;
  const b = buckets.get(key);
  if (!b || b.day !== day) {
    if (buckets.size > 10_000) buckets.clear(); // keep memory bounded
    buckets.set(key, { day, count: 1 });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}
