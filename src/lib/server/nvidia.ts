import "server-only";
import { redact, serverEnv } from "./env";

/**
 * NVIDIA AI services (build.nvidia.com), server-side only.
 *  - chat:   OpenAI-compatible chat completions (Nemotron) — companion replies & reframe hints
 *  - guard:  Llama 3.1 NemoGuard 8B Topic Control — keeps the companion on wellness topics
 *  - image:  FLUX.2 [klein] 4B — "suggested expression" line art (prompt is fixed server-side)
 *  - voice:  Chatterbox Multilingual TTS — see ./tts.ts (gRPC)
 */

const CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const IMAGE_URL = (model: string) => `https://ai.api.nvidia.com/v1/genai/${model}`;

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class NvidiaError extends Error {
  constructor(message: string, readonly status?: number) {
    super(redact(message));
  }
}

function headers(key: string) {
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" };
}

/* ------------------------------------------------------------------ */
/* Chat                                                                */
/* ------------------------------------------------------------------ */

export const isNvidiaChatConfigured = () => !!serverEnv.nvidiaChatKey();

const chatBody = (messages: ChatMessage[], maxTokens: number, temperature: number, stream: boolean) => ({
  model: serverEnv.nvidiaChatModel(),
  messages,
  max_tokens: maxTokens,
  temperature,
  top_p: 0.9,
  stream,
  // Nemotron reasoning models: answer directly (fast, short, warm replies).
  chat_template_kwargs: { enable_thinking: false },
});

/** One-shot completion (reframe hints). */
export async function nvidiaComplete(messages: ChatMessage[], { maxTokens = 300, temperature = 0.5, timeoutMs = 25_000 } = {}) {
  const key = serverEnv.nvidiaChatKey();
  if (!key) throw new NvidiaError("chat not configured");
  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify(chatBody(messages, maxTokens, temperature, false)),
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!res.ok) throw new NvidiaError(`chat ${res.status}: ${(await res.text()).slice(0, 200)}`, res.status);
  const json = (await res.json()) as { choices?: { message?: { content?: string | null } }[] };
  return (json.choices?.[0]?.message?.content ?? "").trim();
}

/**
 * Streaming completion (companion chat). Resolves once the stream is open,
 * so connection/auth errors throw here and can become a friendly reply.
 * Yields plain text chunks.
 */
export async function nvidiaStream(messages: ChatMessage[], signal: AbortSignal, { maxTokens = 500, temperature = 0.6 } = {}) {
  const key = serverEnv.nvidiaChatKey();
  if (!key) throw new NvidiaError("chat not configured");
  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: { ...headers(key), Accept: "text/event-stream" },
    body: JSON.stringify(chatBody(messages, maxTokens, temperature, true)),
    signal: AbortSignal.any([signal, AbortSignal.timeout(60_000)]),
    cache: "no-store",
  });
  if (!res.ok || !res.body) throw new NvidiaError(`chat ${res.status}: ${(await res.text()).slice(0, 200)}`, res.status);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  return (async function* () {
    let buffer = "";
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") return;
          try {
            const delta = (JSON.parse(data) as { choices?: { delta?: { content?: string | null } }[] }).choices?.[0]?.delta?.content;
            if (delta) yield delta;
          } catch {
            /* ignore keep-alive / partial lines */
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  })();
}

/* ------------------------------------------------------------------ */
/* Topic guard (NemoGuard)                                             */
/* ------------------------------------------------------------------ */

const GUARD_INSTRUCTIONS = `You are to act as a topic guard for "EaseMind", a private self-help wellness app for adult men dealing with hair loss.
Follow these guidelines:
1. Allowed: confidence, self-esteem, self-image, stress, anxiety, low mood, loneliness, dating / work / social nerves, how hair loss makes the user feel, CBT thought work, breathing and grounding, finding a psychologist or psychiatrist, and general emotional support. Greetings, thanks and small talk that leads into these are allowed.
2. Not allowed: writing code, homework, politics, news, financial or legal advice, medical diagnosis or medication dosing, recommending hair-loss treatments, products or brands, and anything unrelated to the user's wellbeing.
3. Messages about suicide, self-harm or being unsafe are always on-topic (the app routes them to crisis support).
If any of the above conditions are violated, please respond with "off-topic". Otherwise, respond with "on-topic". You must respond with "on-topic" or "off-topic".`;

// The hosted NemoGuard endpoint can be unstable; after a failure we skip it for a
// few minutes instead of slowing every message down. The companion's own system
// prompt still keeps replies on-topic in the meantime (fail-open by design —
// crisis detection runs separately and never depends on this).
let guardDownUntil = 0;

export type GuardVerdict = "on-topic" | "off-topic" | "unavailable";

export async function topicGuard(history: ChatMessage[]): Promise<GuardVerdict> {
  const key = serverEnv.nvidiaGuardKey();
  if (!key || Date.now() < guardDownUntil) return "unavailable";
  try {
    const res = await fetch(CHAT_URL, {
      method: "POST",
      headers: headers(key),
      body: JSON.stringify({
        model: serverEnv.nvidiaGuardModel(),
        messages: [{ role: "system", content: GUARD_INSTRUCTIONS }, ...history.filter((m) => m.role !== "system").slice(-6)],
        max_tokens: 10,
        temperature: 0,
      }),
      signal: AbortSignal.timeout(3_500),
      cache: "no-store",
    });
    if (!res.ok) throw new NvidiaError(`guard ${res.status}`, res.status);
    const json = (await res.json()) as { choices?: { message?: { content?: string | null } }[] };
    const out = (json.choices?.[0]?.message?.content ?? "").toLowerCase();
    if (out.includes("off-topic")) return "off-topic";
    if (out.includes("on-topic")) return "on-topic";
    return "unavailable";
  } catch (err) {
    guardDownUntil = Date.now() + 5 * 60_000;
    console.warn("[nvidia] topic guard unavailable, skipping for 5 min:", redact(err));
    return "unavailable";
  }
}

/* ------------------------------------------------------------------ */
/* Image (FLUX.2 klein)                                                */
/* ------------------------------------------------------------------ */

export const isNvidiaImageConfigured = () => !!serverEnv.nvidiaImageKey();

/** Returns a JPEG as base64. Prompt must be built server-side — never from raw user text. */
export async function generateImage(prompt: string, { seed = 0, width = 1024, height = 1024, steps = 4 } = {}) {
  const key = serverEnv.nvidiaImageKey();
  if (!key) throw new NvidiaError("image not configured");
  let res: Response | null = null;
  // NVIDIA rate-limits bursts (429) — back off briefly and retry up to twice.
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(IMAGE_URL(serverEnv.nvidiaImageModel()), {
      method: "POST",
      headers: headers(key),
      body: JSON.stringify({ prompt, width, height, seed, steps }),
      signal: AbortSignal.timeout(45_000),
      cache: "no-store",
    });
    if (res.status !== 429) break;
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  if (!res || !res.ok) throw new NvidiaError(`image ${res?.status}: ${(await res?.text())?.slice(0, 200)}`, res?.status);
  const json = (await res.json()) as { artifacts?: { base64?: string; finishReason?: string }[] };
  const art = json.artifacts?.[0];
  if (!art?.base64 || (art.finishReason && art.finishReason !== "SUCCESS")) {
    throw new NvidiaError(`image not returned (${art?.finishReason ?? "empty"})`);
  }
  return art.base64;
}
