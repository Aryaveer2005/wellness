import { z } from "zod";
import { clientIp, takeDailyQuota } from "@/lib/rate-limit";
import { redact } from "@/lib/server/env";
import { EXPRESSION_HEIGHT, EXPRESSION_IDS, EXPRESSION_STEPS, EXPRESSION_WIDTH, expressionPrompt, pickSeed } from "@/lib/server/expression-prompts";
import { generateImage, isNvidiaImageConfigured } from "@/lib/server/nvidia";
import { forbidden, isSameOrigin, readJson } from "@/lib/server/request-guard";

// "Suggested expression" illustration for the Confidence boost (FLUX.2 klein via NVIDIA).
// POST { situation, exclude? } → 200 { image: "data:image/jpeg;base64,…", seed }
//                              → 400 invalid · 403 forbidden · 429 limit · 503 offline
// The user only picks a situation; prompt and seed pool are fixed and verified on the server.
// The same prompt + seed always gives the same drawing, so results are cached in memory
// (no user data in them) — repeat requests are instant and don't cost API credits.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  situation: z.enum(EXPRESSION_IDS),
  exclude: z.number().int().nonnegative().max(1_000_000).optional(),
});

const OFFLINE = { error: "offline", message: "The illustration isn't available right now — the tips still work." };

const cache = new Map<string, string>(); // `${situation}:${seed}` → base64
const MAX_CACHE = 60;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbidden();
  const parsed = BodySchema.safeParse(await readJson(req, 2_000));
  if (!parsed.success) return Response.json({ error: "invalid", message: "Unknown situation." }, { status: 400 });
  if (!isNvidiaImageConfigured()) return Response.json(OFFLINE, { status: 503 });

  const { situation, exclude } = parsed.data;
  const seed = pickSeed(situation, exclude);
  const key = `${situation}:${seed}`;
  const headers = { "Cache-Control": "no-store" };

  const hit = cache.get(key);
  if (hit) return Response.json({ image: `data:image/jpeg;base64,${hit}`, seed }, { headers });

  if (!takeDailyQuota("expression", clientIp(req), 20)) {
    return Response.json({ error: "limit", message: "That's today's illustrations — the tips work just as well." }, { status: 429 });
  }

  try {
    const b64 = await generateImage(expressionPrompt(situation), {
      seed,
      width: EXPRESSION_WIDTH,
      height: EXPRESSION_HEIGHT,
      steps: EXPRESSION_STEPS,
    });
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
    cache.set(key, b64);
    return Response.json({ image: `data:image/jpeg;base64,${b64}`, seed }, { headers });
  } catch (err) {
    console.error("[expression] image error:", redact(err));
    return Response.json(OFFLINE, { status: 503 });
  }
}
