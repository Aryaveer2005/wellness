import { z } from "zod";
import { clientIp, takeDailyQuota } from "@/lib/rate-limit";
import { redact } from "@/lib/server/env";
import { forbidden, isSameOrigin, readJson } from "@/lib/server/request-guard";
import { isTtsConfigured, synthesizeSpeech } from "@/lib/server/tts";
import { BREATHE_CUE, POSTURE_CUE, SITUATIONS } from "@/components/tools/confidence-content";

// Voice (Chatterbox Multilingual TTS via NVIDIA). Returns audio/wav.
// POST { kind: "cue", situation, phase }  → spoken guide for a Confidence-session phase.
//      Text is built here from our own content (users can't make it say anything) and cached.
// POST { kind: "reply", text }            → read a companion reply aloud (length-capped, rate-limited).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("cue"),
    situation: z.enum(SITUATIONS.map((s) => s.id) as [string, ...string[]]),
    phase: z.enum(["breathe", "posture", "affirm", "visualise"]),
  }),
  z.object({ kind: z.literal("reply"), text: z.string().trim().min(1).max(700) }),
]);

// Fixed cue audio is the same for everyone — cache it in memory (bounded).
const cueCache = new Map<string, Buffer>();

function cueText(situationId: string, phase: string): string {
  const s = SITUATIONS.find((x) => x.id === situationId)!;
  switch (phase) {
    case "breathe":
      return BREATHE_CUE;
    case "posture":
      return POSTURE_CUE;
    case "affirm":
      return s.affirmations.join(" ");
    default:
      return s.visualise;
  }
}

const audio = (buf: Buffer, cache: string) =>
  new Response(new Uint8Array(buf), {
    headers: { "Content-Type": "audio/wav", "Content-Length": String(buf.length), "Cache-Control": cache, "X-Content-Type-Options": "nosniff" },
  });

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbidden();
  const parsed = BodySchema.safeParse(await readJson(req, 4_000));
  if (!parsed.success) return Response.json({ error: "invalid", message: "Couldn't read that request." }, { status: 400 });
  if (!isTtsConfigured()) return Response.json({ error: "offline", message: "Voice is offline right now." }, { status: 503 });

  const data = parsed.data;
  try {
    if (data.kind === "cue") {
      const key = `${data.situation}:${data.phase}`;
      const hit = cueCache.get(key);
      if (hit) return audio(hit, "private, max-age=86400");
      if (!takeDailyQuota("tts-cue", clientIp(req), 120)) {
        return Response.json({ error: "limit", message: "Voice guide limit reached for today." }, { status: 429 });
      }
      const buf = await synthesizeSpeech(cueText(data.situation, data.phase));
      if (cueCache.size > 60) cueCache.clear();
      cueCache.set(key, buf);
      return audio(buf, "private, max-age=86400");
    }

    if (!takeDailyQuota("tts-reply", clientIp(req), 40)) {
      return Response.json({ error: "limit", message: "You've used today's read-alouds — they reset tomorrow." }, { status: 429 });
    }
    return audio(await synthesizeSpeech(data.text), "no-store");
  } catch (err) {
    console.error("[tts] error:", redact(err));
    return Response.json({ error: "offline", message: "Voice is offline right now." }, { status: 503 });
  }
}
