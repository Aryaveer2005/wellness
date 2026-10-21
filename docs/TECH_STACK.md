# EaseMind — Tech Stack

> Written 2026-10-21 from the current code (`package.json`, `src/`, `next.config.ts`, `.env.example`).
> AI prompts and model behaviour: `docs/AI_CHATBOT.md`. Safety/privacy rules: `docs/SAFETY.md`. 🔒 = needs the owner.

## 1. Stack

| Layer | Package | Version (package.json) |
|---|---|---|
| Framework | `next` (App Router) | 15.5.28 |
| UI library | `react`, `react-dom` | 19.1.0 |
| Language | TypeScript | ^5 |
| Styling | `tailwindcss` + `@tailwindcss/postcss`, `tw-animate-css` | ^4, ^1.4.0 |
| Components | shadcn/ui (`shadcn` ^4.22.1, `radix-ui` ^1.8.1, `class-variance-authority` ^0.7.1), `sonner` toasts ^2.0.8 | — |
| Icons | `@phosphor-icons/react` (only via `src/components/icons.tsx`) | ^2.1.10 |
| Motion | `gsap` ^3.15.0 + `@gsap/react` ^2.1.2, `lenis` ^1.3.27, `framer-motion` ^14.4.0 | — |
| 3D | `three` ^0.186.1, `@react-three/fiber` ^9.8.2, `@react-three/drei` ^10.7.9 | — |
| Charts | `recharts` | ^3.10.1 |
| Theme | `next-themes` | ^0.4.6 |
| Validation | `zod` | ^4.6.7 |
| Accounts (optional) | `@supabase/ssr` ^0.12.7, `@supabase/supabase-js` ^2.118.0 | — |
| AI (optional fallback) | `@anthropic-ai/sdk` | ^0.135.0 |
| Voice (gRPC to NVIDIA) | `@grpc/grpc-js` ^1.14.3, `@grpc/proto-loader` ^0.8.1 | — |
| Secret guard | `server-only` | ^0.0.1 |
| Lint | `eslint` ^9, `eslint-config-next` 15.5.28 | — |

No database tables exist yet. All user data lives in the browser (see `docs/FEATURES.md` §15).

## 2. Folder structure

```
src/
  app/
    page.tsx                 Landing "/"
    layout.tsx               Root layout (fonts, theme, metadata "EaseMind")
    not-found.tsx            Friendly 404
    icon.svg                 Favicon
    globals.css              Design tokens + glass/aurora styles
    (app)/                   Every app page (shares header, dock, footer, aurora)
      layout.tsx
      start/ home/ confidence/ reframe/ reframe/history/ chat/
      psychologists/ psychologists/[id]/ progress/ help/
      login/ settings/ about/ privacy/ terms/
    api/                     Server routes (see §3)
      chat/ reframe-hint/ expression/ tts/ stt/ psychiatrists/nearby/
    auth/callback/route.ts   Supabase sign-in return
  components/
    layout/   header, bottom dock, footer, Need-help button, nav items, theme toggle
    tools/    confidence builder + content, expression card, reframer, mood check-in, progress, start flow
    chat/     chat view, bubbles, crisis card, Listen button, voice mode, chat storage
    psychologists/  near-me search, directory, data loader
    account/  login form, settings
    landing/  landing sections (being redesigned)
    media/    ambient video   motion/  GSAP helpers   ui/  shadcn kit
  data/psychologists.json    Directory entries (placeholders 🔒)
  hooks/                     use-store, use-progress-sound
  lib/
    safety.ts                Crisis detection + helplines (client AND server)
    local-store.ts           On-device storage
    places.ts                Near-me search (server-only)
    prompts.ts               AI system prompts (server-only)
    rate-limit.ts            Daily per-IP quotas (server-only)
    sound.ts, voice-client.ts, voice-recorder.ts   Browser-side audio
    supabase/                Optional Supabase clients
    server/                  server-only: env.ts, nvidia.ts, tts.ts, asr.ts,
                             request-guard.ts, expression-prompts.ts/.json, proto/ (Riva gRPC files)
public/videos/               5 filmed Pexels loops (+ CREDITS.md)
public/images/               Landing photos (being added — see DESIGN.md §10)
```

## 3. API routes

All AI routes run on Node.js, are never cached (`no-store`), and log errors with keys removed (`redact()`).
**Same-origin check** (`src/lib/server/request-guard.ts`): allowed if the browser says `Sec-Fetch-Site: same-origin` / `none`; otherwise the `Origin` must match the host; requests with no `Origin` at all (e.g. curl) are allowed but still rate-limited. Fail → **403** `{ error: "forbidden" }`.

| Route | Method | Input | Output | Limits | Security / safety |
|---|---|---|---|---|---|
| `/api/chat` | POST | JSON `{ messages: [{ role: "user"\|"assistant", content }] }` (1–100 items) | **200 streamed plain text** (AI reply) **or** JSON `{ mode: "crisis"\|"offline"\|"limit"\|"invalid"\|"offtopic", message }` | Body ≤ 64 KB; last 20 turns used; latest message ≤ 2,000 chars; **30/day per IP**; NVIDIA stream ≤ 500 tokens, 60 s timeout | same-origin → zod → **crisis check (before quota and AI)** → quota → NemoGuard topic guard (3.5 s timeout, fail-open 5 min) → Nemotron → Claude fallback → offline message |
| `/api/reframe-hint` | POST | `{ step: 5\|6\|7, record: { situation, thought, emotion, intensityBefore, traps[], evidenceFor, evidenceAgainst, balancedThought } }` (each text ≤ 1,500) | 200 `{ hint }` · 200 `{ crisis: true, message }` · 400 invalid · 429 limit · 503 offline | Body ≤ 16 KB; **40/day per IP**; 220 tokens, 25 s timeout | same-origin → zod → **crisis check on all fields** → quota → Nemotron → Claude fallback |
| `/api/expression` | POST | `{ situation: "date"\|"interview"\|"meeting"\|"social"\|"presentation"\|"boost", exclude?: seed }` | 200 `{ image: "data:image/jpeg;base64,…", seed }` · 400 · 429 · 503 | Body ≤ 2 KB; **20 new images/day per IP** (cached repeats are free); 45 s timeout, 429 retried twice | same-origin; user sends **no text** — prompt + verified seeds fixed on server; server memory cache of ≤ 60 images (no user data) |
| `/api/tts` | POST | `{ kind: "cue", situation, phase: "breathe"\|"posture"\|"affirm"\|"visualise" }` or `{ kind: "reply", text }` (≤ 700 chars) | 200 `audio/wav` (24 kHz mono) · 400 · 429 · 503 | Body ≤ 4 KB; cues **120/day**, replies **40/day** per IP; text split into ≤ 4 chunks of ≤ 220 chars; 30 s per chunk | same-origin; cue text built on server from our own content; cue audio cached (server memory + browser 1 day) |
| `/api/stt` | POST | Raw WAV body (16-bit mono PCM, 8–48 kHz) | 200 `{ text }` · 400 (can't hear) · 413 too long · 429 · 503 | ≤ 1.1 MB (≈ 34 s); min 0.25 s audio; **120/day per IP**; 30 s timeout | same-origin; audio handled in memory only, never stored or logged |
| `/api/psychiatrists/nearby` | GET | `?lat=..&lng=..` or `?city=..` (letters, 2–80 chars) | `{ ok: true, source: "google"\|"openstreetmap", ratingsAvailable, results[≤5], radiusKm? }` or `{ ok: false, error }` (400/403/429/500/502) | **40/day per IP**; Google 8 s per call; Overpass 20 s | same-origin; coordinates rounded to 3 decimals (~110 m) before leaving the server; never logged; coordinate results `private, no-store`, city results cacheable 5 min |
| `/auth/callback` | GET | `?code=..&next=/path` | Redirect | — | `next` must be a same-site path (no `//`); bad code → `/login?error=auth` |

## 4. Environment variables

Copy `.env.example` → `.env.local` (git-ignored). Every key is **optional** — features show friendly fallbacks without them. Read only in `src/lib/server/env.ts`, `src/lib/places.ts` and `src/lib/supabase/*`.

| Variable | Default in code | Used for |
|---|---|---|
| `NVIDIA_GUARD_API_KEY` | — | NemoGuard topic guard; **also chat + hints if `NVIDIA_CHAT_API_KEY` is empty** |
| `NVIDIA_CHAT_API_KEY` | falls back to guard key | Companion replies + reframer hints |
| `NVIDIA_CHAT_MODEL` | `nvidia/nemotron-3.5-lightning-30b-a3b` | Chat model |
| `NVIDIA_GUARD_MODEL` | `nvidia/llama-3.1-nemoguard-8b-topic-control` | Guard model (not in `.env.example`) |
| `NVIDIA_IMAGE_API_KEY` | — | FLUX.2 klein expression images |
| `NVIDIA_IMAGE_MODEL` | `black-forest-labs/flux.2-klein-4b` | Image model (not in `.env.example`) |
| `NVIDIA_TTS_API_KEY` | — | Chatterbox voice; **also speech-to-text if `NVIDIA_ASR_API_KEY` is empty** |
| `NVIDIA_TTS_FUNCTION_ID` | `ddacc747-1269-4fab-bfd9-8f593dead106` | Chatterbox Multilingual TTS function |
| `NVIDIA_TTS_VOICE` | `Chatterbox-Multilingual.en-US.Male` | Voice name |
| `NVIDIA_ASR_API_KEY` | falls back to TTS key | Parakeet speech-to-text |
| `NVIDIA_ASR_FUNCTION_ID` | `d3fe9151-442b-4204-a70d-5fcc597fd610` | Parakeet TDT 0.6B v2 (English). Multilingual alternative noted in code: `71203149-d3b7-4460-8231-1be2543a1fca` (untested) |
| `NVIDIA_ASR_LANGUAGE` | `en-US` | Speech-to-text language |
| `ANTHROPIC_API_KEY` | — | Optional Claude fallback for chat + hints |
| `ANTHROPIC_MODEL` | `claude-sonnet-5-5` | Claude model |
| `GOOGLE_PLACES_API_KEY` | — | Places API (New). Without it → OpenStreetMap |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | — | Optional accounts. These two are **meant** to be public (protected by Supabase Row Level Security). 🔒 not set yet |

Never add `NEXT_PUBLIC_` to any other key.

## 5. External services

| Service | Endpoint (server → service) | What we send | Used by |
|---|---|---|---|
| NVIDIA chat (Nemotron) | `https://integrate.api.nvidia.com/v1/chat/completions` | System prompt + last ≤ 20 chat turns (or the reframe draft) | `/api/chat`, `/api/reframe-hint` |
| NVIDIA NemoGuard | same URL | Guard instructions + last 6 turns | `/api/chat` |
| NVIDIA FLUX.2 klein | `https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b` | Fixed prompt, seed, 1184×880, 4 steps | `/api/expression` |
| NVIDIA Chatterbox TTS | gRPC `grpc.nvcf.nvidia.com:443`, function `ddacc747-1269-4fab-bfd9-8f593dead106` | Text to speak | `/api/tts` |
| NVIDIA Parakeet ASR | gRPC `grpc.nvcf.nvidia.com:443`, function `d3fe9151-442b-4204-a70d-5fcc597fd610` | 16 kHz audio of one turn | `/api/stt` |
| Anthropic Claude (optional) | via `@anthropic-ai/sdk` | Same as NVIDIA chat | fallback only |
| Google Places API (New) | `https://places.googleapis.com/v1/places:searchText` | City name, or rounded coordinates + "psychiatrist" | `/api/psychiatrists/nearby` |
| OpenStreetMap Nominatim | `https://nominatim.openstreetmap.org/search` | City name (cached 1 day) | fallback |
| OpenStreetMap Overpass | `https://overpass-api.de/api/interpreter` (only host — adding another needs owner approval) | Rounded coordinates, 15 km radius | fallback |
| Supabase (optional) | your project URL | Email / Google sign-in | `/login`, `/auth/callback` |
| Pexels | none at runtime | Videos were downloaded once and are served from `public/videos/` | — |

The browser only ever talks to our own `/api/*` routes (plus Supabase sign-in if configured, and tap-out links to Google Maps / clinic sites / `tel:`).

## 6. Site-wide settings (`next.config.ts`)
- Headers on every page: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(self), microphone=(self), camera=(), payment=()`.
- `poweredByHeader: false`.
- gRPC packages kept out of the bundle (`serverExternalPackages`); Riva `.proto` files shipped with `/api/tts` and `/api/stt`.

## 7. Running the app

| Task | Command |
|---|---|
| First time | `npm install` |
| Develop | `npm run dev` → http://localhost:3000 |
| Production build | `npm run build` then `npm run start` |
| Lint | `npm run lint` |

**Node.js:** v24.20.0, a portable copy at `%LOCALAPPDATA%\node-portable\node-v24.20.0-win-x64` (added to the user PATH). If `npm` isn't found in a new terminal, open a fresh terminal or add that folder to PATH.

**Windows / OneDrive `.next` note**
- Don't run `npm run build` while `npm run dev` is running — both use the `.next` folder, and the dev site shows "Internal Server Error" until restarted.
- If dev fails with `EINVAL: invalid argument, readlink ... .next` (a OneDrive quirk), stop the server, delete the `.next` folder, start again.

## 8. Hosting (planned)
Vercel (app) + Supabase (accounts) — free tiers. Before going live: set env vars in Vercel, and note that quotas are in-memory per server (see `docs/SAFETY.md` §5). 🔒
