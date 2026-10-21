import { clientIp, takeDailyQuota } from "@/lib/rate-limit";
import { redact } from "@/lib/server/env";
import { forbidden, isSameOrigin } from "@/lib/server/request-guard";
import { isAsrConfigured, transcribe } from "@/lib/server/asr";

// Speech-to-text for voice mode (NVIDIA Parakeet via gRPC).
// POST body: a WAV file (16-bit mono PCM, 8–48 kHz), max ~30 s.
// → 200 { text }  · 400 invalid · 403 forbidden · 413 too long · 429 limit · 503 offline
// Audio is transcribed in memory and discarded — never stored or logged.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 1_100_000; // ≈ 34 s at 16 kHz mono 16-bit

function parseWav(buf: Buffer): { pcm: Buffer; sampleRate: number } | null {
  if (buf.length < 44 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") return null;
  let off = 12;
  let sampleRate = 0;
  let fmtOk = false;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    const body = off + 8;
    if (id === "fmt ") {
      const format = buf.readUInt16LE(body);
      const channels = buf.readUInt16LE(body + 2);
      sampleRate = buf.readUInt32LE(body + 4);
      const bits = buf.readUInt16LE(body + 14);
      fmtOk = format === 1 && channels === 1 && bits === 16 && sampleRate >= 8000 && sampleRate <= 48000;
    } else if (id === "data") {
      if (!fmtOk) return null;
      return { pcm: buf.subarray(body, Math.min(buf.length, body + size)), sampleRate };
    }
    off = body + size + (size % 2);
  }
  return null;
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbidden();
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > MAX_BYTES) return Response.json({ error: "too_long", message: "That was a bit long — try shorter turns." }, { status: 413 });
  if (!isAsrConfigured()) return Response.json({ error: "offline", message: "Voice input is offline right now." }, { status: 503 });

  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length > MAX_BYTES) return Response.json({ error: "too_long", message: "That was a bit long — try shorter turns." }, { status: 413 });
  const wav = parseWav(buf);
  if (!wav || wav.pcm.length < wav.sampleRate * 0.25 * 2) {
    return Response.json({ error: "invalid", message: "I couldn't hear that — try again." }, { status: 400 });
  }

  if (!takeDailyQuota("stt", clientIp(req), 120)) {
    return Response.json({ error: "limit", message: "You've reached today's voice limit — you can keep typing." }, { status: 429 });
  }

  try {
    const text = await transcribe(wav.pcm, wav.sampleRate);
    return Response.json({ text }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[stt] error:", redact(err));
    return Response.json({ error: "offline", message: "Voice input is offline right now." }, { status: 503 });
  }
}
