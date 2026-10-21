import "server-only";

/**
 * Basic protection for our AI routes so other websites can't use them as a
 * free proxy to our paid APIs:
 * - same-origin only (browser fetch from this site)
 * - JSON body size cap
 * Combined with per-IP daily quotas in src/lib/rate-limit.ts.
 */

export function isSameOrigin(req: Request): boolean {
  // Modern browsers send Sec-Fetch-Site on every request.
  const site = req.headers.get("sec-fetch-site");
  if (site) return site === "same-origin" || site === "none";
  // Fallback: compare Origin to Host.
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser tools (curl) — still rate-limited
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function readJson(req: Request, maxBytes = 32_000): Promise<unknown | undefined> {
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > maxBytes) return undefined;
  try {
    const text = await req.text();
    if (text.length > maxBytes) return undefined;
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export const forbidden = () => Response.json({ error: "forbidden", message: "Not allowed." }, { status: 403 });
