# EaseMind — AI services (chat, guard, image, voice)

> Added 2026-10-20 when the owner supplied NVIDIA API keys. Safety rules in `CLAUDE.md` / `PROJECT_SPEC.md` still win over anything here.

## 1. Overview

| Feature | Where in the app | Model (NVIDIA, build.nvidia.com) | Server code |
|---|---|---|---|
| AI Companion replies (streamed) | `/chat` | `nvidia/nemotron-3.5-lightning-30b-a3b` (thinking off) — set `NVIDIA_CHAT_MODEL` to change | `src/app/api/chat/route.ts` |
| Topic guard (keeps chat on wellness) | `/chat` (before every reply) | `nvidia/llama-3.1-nemoguard-8b-topic-control` | `topicGuard()` in `src/lib/server/nvidia.ts` |
| Reframer hints | `/reframe` steps 5–7 | same chat model | `src/app/api/reframe-hint/route.ts` |
| Suggested expression illustration | `/confidence` (session + result) | `black-forest-labs/flux.2-klein-4b` | `src/app/api/expression/route.ts` |
| Voice guide + "Listen" | `/confidence` session cues, `/chat` replies | Chatterbox Multilingual TTS (Resemble AI) over gRPC | `src/app/api/tts/route.ts`, `src/lib/server/tts.ts` |
| **Voice mode** (speech-to-speech) | `/chat` → microphone button | Speech-to-text: NVIDIA Parakeet TDT 0.6B v2 (gRPC) → chat pipeline → Chatterbox | `src/app/api/stt/route.ts`, `src/lib/server/asr.ts`, `src/components/chat/voice-mode.tsx`, `src/lib/voice-recorder.ts` |

Optional fallback: if `ANTHROPIC_API_KEY` is set and NVIDIA chat fails, chat and hints use Claude (`ANTHROPIC_MODEL`).

## 2. Request pipeline (chat)

1. Same-origin check (blocks other websites using our API) → 403
2. Validate body (zod), size cap 64 KB, max 2,000 characters per message, last 20 turns
3. **Crisis check** (`src/lib/safety.ts`) → fixed helpline reply. Runs before quotas and before any AI. Never depends on AI.
4. Daily per-IP quota (30 chats)
5. NemoGuard topic check → off-topic → friendly redirect (`mode: "offtopic"`)
6. Stream reply from Nemotron with `CHAT_SYSTEM_PROMPT` (`src/lib/prompts.ts`): warm older-brother tone, ≤ ~80 words, plain text, no medical/hair-treatment advice, points to in-app tools
7. Any failure → friendly offline message (never a blank screen)

**NemoGuard note:** on 2026-10-20 NVIDIA's hosted NemoGuard endpoint returned HTTP 500 (a GPU error on NVIDIA's side; a known issue on their forum) for every request. The guard **fails open**: after a failure it is skipped for 5 minutes, then retried automatically. The chat prompt itself also declines off-topic requests, and crisis detection never depends on the guard.

## 3. Image — "suggested expression"

**Updated 2026-10-21 — precision:**
- Shown as soon as the user taps a situation on /confidence (not only after the session), again during the session and on the result.
- Prompts + verified seeds live in `src/lib/server/expression-prompts.json` (single source of truth). FLUX.2 klein gives the same image for the same prompt + seed + size + steps, so the app only uses **seeds checked by eye** (5–7 per situation) — no head outlines, no hair, ever. "Show another drawing" picks a different verified seed.
- Lessons from testing 80+ images: naming "a face"/"head" draws head outlines (incl. bald heads); neutral words ("steady", "attentive") push the model to portraits — so every prompt leads with floating features and a gentle smile.
- **If you change any prompt text, re-verify the seeds** (generate each seed, look at it, keep only clean ones).
- Finished images are cached in server memory by situation+seed (no user data), so repeats are instant and free. NVIDIA 429 rate limits are retried automatically.


- The user only picks a situation (date, interview, meeting, social, presentation, boost). **Prompts are fixed on the server** (`src/lib/server/expression-prompts.ts`); no user text reaches the image model.
- Style is locked: single-line drawing of **facial features only — no hair, no head outline, no body, no text** (spec imagery rules; a test prompt that showed a full head of hair was rejected for this audience).
- Shown with hand-written tips (`EXPRESSIONS` in `confidence-content.ts`) and labelled **"AI-generated photo · not a real person · not saved"**. Never stored. 20 new images per IP per day (cached repeats are free). Failure → tips only.
- **Realistic since 2026-10-21:** photorealistic close-ups (1184×880) framed mid-forehead → chin, displayed in a 16:10 crop anchored low so the hairline is never visible. 4 verified seeds per situation.

## 4. Voice

- `kind: "cue"` — spoken guide for each Confidence phase. Text comes from our own content (breathe cue, posture cue, the three affirmations, the visualisation). Users can't make it say anything else. Cached in server memory and in the browser.
- `kind: "reply"` — reads a companion reply aloud (max 700 characters, 40 per IP per day).
- Output: WAV, 24 kHz mono. Text is split into sentence chunks (Chatterbox max ~15 s each), synthesised in parallel and joined.
- The voice guide toggle is on the Confidence "before" screen (remembered on the device). "Listen" button under each companion reply.

## 4b. Voice mode (speech-to-speech)

1. Mic button in the chat composer opens a full-screen voice view ("Need help now?" stays visible).
2. The browser listens with voice-activity detection (adapts to background noise, ends a turn after ~1.1 s of silence, max 30 s) and sends a 16 kHz WAV to `/api/stt`.
3. NVIDIA Parakeet (function `d3fe9151-…`, English with punctuation) returns the text — tested word-perfect in ~0.3–1.4 s.
4. The text goes through the **same chat pipeline** (crisis check first, quota, topic guard, Nemotron) and appears in the chat as normal messages.
5. The reply is spoken with Chatterbox, then it listens again. Tap the orb to interrupt; Pause/Resume; Esc or ✕ to end.
6. **Crisis:** if the crisis check fires, voice mode stops listening, says one short caring line, and shows big tap-to-call helpline buttons.
7. Audio is processed in memory only — never stored or logged. Microphone is allowed for this site only (`Permissions-Policy: microphone=(self)`).

## 4c. Google Places — "Top 5 psychiatrists near me" (precision, 2026-10-21)

- Text Search (New), `includedType: doctor`, **locationRestriction** (results strictly inside the area), searching 5 km → 15 km → 30 km only until 5 confirmed matches are found.
- City searches are geocoded with Google too (aliases work: Gurgaon→Gurugram, Bombay→Mumbai); only real places-on-a-map types are accepted, so nonsense like "Qwertyville" is rejected instead of matching a random building.
- Filters: operational only, must have rating + reviews, medical place types only, no pharmacies/salons. Duplicate listings of the same doctor are merged.
- Ranking: listings whose name/website clearly mention psychiatry/mental health first ("Psychiatry listed on Google" badge), then established ones (5+ reviews), then Bayesian rating × reviews with a gentle distance preference.
- SEO-stuffed names are cleaned for display ("Dr X | Best Psychiatrist in…" → "Dr X"); the full name shows on hover.
- Route is same-site only and capped at 40 searches per visitor per day (each search costs money).

## 5. Security rules (non-negotiable)

- Keys live **only** in `.env.local` (git-ignored), read only by `src/lib/server/*`, which starts with `import "server-only"` so the build fails if browser code imports it. Never use `NEXT_PUBLIC_` for these.
- The browser only ever calls our own `/api/*` routes. Verified 2026-10-20: the production client bundle contains no keys, NVIDIA hostnames, function IDs or prompts.
- All AI routes: same-origin check, JSON size caps, zod validation, per-IP daily quotas (`src/lib/rate-limit.ts`, in-memory — resets on restart), timeouts, errors logged with keys redacted (`redact()`).
- Site-wide headers (`next.config.ts`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (location and microphone for this site only — mic is for voice mode; no camera).
- **Key hygiene:** the NVIDIA keys (2026-10-20) and the Google Places key (2026-10-21) were shared in a chat with the AI assistant. Rotate them on build.nvidia.com when convenient, then update `.env.local`.

## 6. Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NVIDIA_GUARD_API_KEY` | yes | NemoGuard; also used for chat if `NVIDIA_CHAT_API_KEY` is empty |
| `NVIDIA_CHAT_API_KEY` | no | separate key for chat replies |
| `NVIDIA_CHAT_MODEL` | no | default `nvidia/nemotron-3.5-lightning-30b-a3b` |
| `NVIDIA_IMAGE_API_KEY` | yes | FLUX.2 klein |
| `NVIDIA_TTS_API_KEY` | yes | Chatterbox TTS |
| `NVIDIA_TTS_FUNCTION_ID` / `NVIDIA_TTS_VOICE` | no | defaults `ddacc747-1269-4fab-bfd9-8f593dead106` / `Chatterbox-Multilingual.en-US.Male` |
| `NVIDIA_GUARD_MODEL` / `NVIDIA_IMAGE_MODEL` | no | override model IDs |
| `NVIDIA_ASR_API_KEY` | no | speech-to-text key (defaults to `NVIDIA_TTS_API_KEY`) |
| `NVIDIA_ASR_FUNCTION_ID` / `NVIDIA_ASR_LANGUAGE` | no | defaults `d3fe9151-442b-4204-a70d-5fcc597fd610` (Parakeet TDT 0.6B v2) / `en-US` |
| `GOOGLE_PLACES_API_KEY` | yes (for ratings) | Places API (New) — restrict it to Places API (New) in Google Cloud and set a budget alert |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | no | Claude fallback |
