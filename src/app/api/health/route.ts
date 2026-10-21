import { NextResponse, type NextRequest } from "next/server";
import { clientIp, takeDailyQuota } from "@/lib/rate-limit";
import { redact, serverEnv } from "@/lib/server/env";

// GET /api/health            → which services have a key configured (true/false only — never key values)
// GET /api/health?deep=1     → also makes ONE tiny test call to Google Places and NVIDIA and reports
//                              whether each accepted the key (status code + short reason).
// Use this after changing environment variables on Vercel (remember: redeploy after any change).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function checkGoogle(key: string) {
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.id" },
      body: JSON.stringify({ textQuery: "Pune", pageSize: 1 }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (res.ok) return { ok: true, status: res.status };
    const body = (await res.json().catch(() => ({}))) as { error?: { status?: string; message?: string; details?: { reason?: string }[] } };
    return {
      ok: false,
      status: res.status,
      reason: body.error?.details?.find((d) => d.reason)?.reason ?? body.error?.status ?? "unknown",
      message: redact(body.error?.message ?? "").slice(0, 160),
    };
  } catch (err) {
    return { ok: false, status: 0, reason: "network", message: redact(err).slice(0, 160) };
  }
}

async function checkNvidia(key: string) {
  try {
    // Listing models is free and proves the key is accepted.
    const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, reason: "network", message: redact(err).slice(0, 160) };
  }
}

export async function GET(req: NextRequest) {
  const configured = {
    nvidiaChat: !!serverEnv.nvidiaChatKey(),
    nvidiaGuard: !!serverEnv.nvidiaGuardKey(),
    nvidiaImage: !!serverEnv.nvidiaImageKey(),
    nvidiaVoice: !!serverEnv.nvidiaTtsKey(),
    nvidiaSpeechToText: !!serverEnv.nvidiaAsrKey(),
    googlePlaces: !!process.env.GOOGLE_PLACES_API_KEY?.trim(),
    anthropicFallback: !!serverEnv.anthropicKey(),
  };
  const body: Record<string, unknown> = {
    configured,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    hint: Object.entries(configured).some(([k, v]) => !v && k !== "anthropicFallback")
      ? "A false value means the server can't see that key. On Vercel: check the exact variable name, tick 'Production', then Redeploy (keys only apply to new deployments)."
      : "All keys are visible to the server.",
  };

  if (req.nextUrl.searchParams.get("deep") === "1") {
    if (!takeDailyQuota("health", clientIp(req), 10)) {
      return NextResponse.json({ ...body, deep: "Deep check limit reached for today." }, { status: 429 });
    }
    const g = process.env.GOOGLE_PLACES_API_KEY?.trim();
    const n = serverEnv.nvidiaChatKey();
    const i = serverEnv.nvidiaImageKey();
    body.live = {
      googlePlaces: g ? await checkGoogle(g) : "no key",
      nvidiaChatKey: n ? await checkNvidia(n) : "no key",
      nvidiaImageKey: i ? await checkNvidia(i) : "no key",
    };
  }

  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
