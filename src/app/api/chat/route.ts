import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { CRISIS_RESPONSE, detectCrisis } from "@/lib/safety";
import { clientIp, takeDailyQuota } from "@/lib/rate-limit";
import { redact, serverEnv } from "@/lib/server/env";
import { forbidden, isSameOrigin, readJson } from "@/lib/server/request-guard";
import { isNvidiaChatConfigured, nvidiaStream, topicGuard, type ChatMessage } from "@/lib/server/nvidia";

// AI Companion chat — everything here runs on the server; keys never reach the browser.
//
// Pipeline: same-origin check → validate → CRISIS CHECK (fixed reply, no AI) → daily quota
//           → NemoGuard topic check → stream reply (NVIDIA Nemotron; Anthropic fallback).
//
// Response protocol:
//  - AI reply  → 200, Content-Type text/plain, streamed text.
//  - Otherwise → JSON { mode: "crisis" | "offline" | "limit" | "invalid" | "offtopic", message }.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY = 20;
const DAILY_LIMIT_ANON = 30;

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS * 3),
      })
    )
    .min(1)
    .max(100),
});

type ChatMode = "crisis" | "offline" | "limit" | "invalid" | "offtopic";

const OFFLINE_MESSAGE =
  "The companion is offline right now — sorry about that. You can still use the 60-second confidence builder (/confidence) or the thought reframer (/reframe). If you're struggling or feel unsafe, please go to /help for helplines.";

const OFFTOPIC_MESSAGE =
  "I'm here for the stuff that weighs on you — confidence, stress, how hair loss makes you feel, nerves before a date or interview. I can't help with that one, but I'm all ears if something's on your mind. You can also try the confidence builder (/confidence) or the thought reframer (/reframe).";

function json(mode: ChatMode, message: string, status = 200) {
  return Response.json({ mode, message }, { status, headers: { "Cache-Control": "no-store" } });
}

const encoder = new TextEncoder();

function textStream(chunks: AsyncIterable<string>, onCancel: () => void) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const c of chunks) controller.enqueue(encoder.encode(c));
      } catch {
        controller.enqueue(encoder.encode("\n\n(The connection dropped — please try sending that again.)"));
      } finally {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
    cancel: onCancel,
  });
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbidden();

  const body = await readJson(req, 64_000);
  if (body === undefined) return json("invalid", "Something went wrong sending that. Please try again.", 400);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return json("invalid", "That message couldn't be sent. Please keep it a bit shorter and try again.", 400);
  }

  const history = parsed.data.messages.slice(-MAX_HISTORY);
  const latest = history[history.length - 1];
  if (latest.role !== "user") return json("invalid", "Please type a message first.", 400);
  if (latest.content.length > MAX_MESSAGE_CHARS) {
    return json("invalid", `Please keep messages under ${MAX_MESSAGE_CHARS} characters.`, 400);
  }

  // SAFETY: crisis check runs BEFORE rate limiting and BEFORE any AI call — the
  // crisis reply is fixed text and never depends on the AI being available.
  if (detectCrisis(latest.content)) return json("crisis", CRISIS_RESPONSE);

  if (!takeDailyQuota("chat", clientIp(req), DAILY_LIMIT_ANON)) {
    return json(
      "limit",
      "You've reached today's chat limit — it resets tomorrow. Meanwhile, the confidence builder (/confidence) and thought reframer (/reframe) are always available. If you need someone now, see /help."
    );
  }

  // The conversation must start with a user turn.
  const firstUser = history.findIndex((m) => m.role === "user");
  const convo: ChatMessage[] = history.slice(firstUser).map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));

  // Keep the companion on wellness topics (NemoGuard). Fails open if the guard is down.
  if ((await topicGuard(convo)) === "off-topic") return json("offtopic", OFFTOPIC_MESSAGE);

  const headers = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

  // 1) NVIDIA Nemotron (primary)
  if (isNvidiaChatConfigured()) {
    const ctrl = new AbortController();
    req.signal.addEventListener("abort", () => ctrl.abort());
    try {
      const chunks = await nvidiaStream([{ role: "system", content: CHAT_SYSTEM_PROMPT }, ...convo], ctrl.signal);
      return new Response(textStream(chunks, () => ctrl.abort()), { headers });
    } catch (err) {
      console.error("[chat] NVIDIA error:", redact(err));
      // fall through to Anthropic if configured
    }
  }

  // 2) Anthropic Claude (optional fallback)
  const anthropicKey = serverEnv.anthropicKey();
  if (anthropicKey) {
    try {
      const client = new Anthropic({ apiKey: anthropicKey });
      const stream = client.messages.stream({
        model: serverEnv.anthropicModel(),
        max_tokens: 2000,
        output_config: { effort: "low" },
        system: CHAT_SYSTEM_PROMPT,
        messages: convo.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      });
      req.signal.addEventListener("abort", () => stream.abort());
      const iterator = stream[Symbol.asyncIterator]();
      const first = await iterator.next(); // surface connection/auth errors here
      const chunks = (async function* () {
        const text = (ev: Anthropic.MessageStreamEvent) =>
          ev.type === "content_block_delta" && ev.delta.type === "text_delta" ? ev.delta.text : "";
        if (!first.done) yield text(first.value);
        for (let r = await iterator.next(); !r.done; r = await iterator.next()) yield text(r.value);
      })();
      return new Response(textStream(chunks, () => stream.abort()), { headers });
    } catch (err) {
      console.error("[chat] Anthropic error:", redact(err));
    }
  }

  return json("offline", OFFLINE_MESSAGE);
}
