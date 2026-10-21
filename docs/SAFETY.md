# EaseMind — Safety, Privacy & Security

> **This file beats every other rule** (`CLAUDE.md` rule 5). Never remove, hide or weaken the "Need help now?" button, helpline numbers, crisis handling or disclaimers — even if asked to "clean up" the UI.
> Written 2026-10-21 from the current code. 🔒 = needs the owner.

## 1. Crisis handling, end to end

### 1.1 Detection — `src/lib/safety.ts`
- `detectCrisis(text)` lower-cases the text, removes punctuation, and checks ~40 patterns: suicide ("kill myself", "want to die", "end it all", "better off dead", "can't go on", "overdose"…), self-harm ("self harm", "hurt myself", "cut my wrists"…), and **Hinglish** ("marna chahta", "jeena nahi chahta", "khudkushi", "aatmahatya", "zindagi khatam"…).
- Deliberately cautious: a false alarm only shows helplines; a miss could cost a life.
- **No AI is involved.** It works even when every API is down.
- The same file is used by the browser and the server and must never contain secrets.

### 1.2 Where it runs

| Place | Client (browser) | Server |
|---|---|---|
| `/chat` typing | Yes — shows the crisis card **instantly**, before the server replies | Yes — `/api/chat` checks the latest message **before** the daily limit and **before** any AI call, and returns the fixed crisis reply |
| `/chat` voice mode | Uses the server result | Same as typing (speech is turned into text, then the chat pipeline runs) |
| `/reframe` AI hint | No | Yes — `/api/reframe-hint` checks **everything** the user wrote before calling the AI |

### 1.3 The fixed crisis reply (`CRISIS_RESPONSE`)
Model-independent text: acknowledges the person, says they deserve real support, lists **Tele-MANAS** (14416 or 1-800-891-4416), **KIRAN** (1800-599-0019), **112** for immediate danger, encourages telling one trusted person, and points to the Need help now page. Shown in chat with a red border; in the reframer it appears in the hint box.

### 1.4 Crisis card (chat) — `src/components/chat/crisis-card.tsx`
"You deserve support right now" · tap-to-call Tele-MANAS and KIRAN · big red "In immediate danger? Call 112" · link to `/help`. The chat auto-scrolls so the card's heading and first helpline stay visible. It stays until the user clears the conversation.

### 1.5 Voice-mode crisis path — `src/components/chat/voice-mode.tsx`
1. Stops listening immediately.
2. Speaks one short fixed line: "I'm really glad you told me. You deserve support right now. The numbers on your screen are free, and someone will listen."
3. Shows large red tap-to-call buttons (Tele-MANAS, KIRAN, Emergency 112) + "More ways to get help now".
4. If the voice can't play, the buttons are still there.
5. "Need help now?" stays in the voice-mode top bar.

### 1.6 The companion's own instructions
`CHAT_SYSTEM_PROMPT` (`src/lib/prompts.ts`) tells the AI to respond with care and point to `/help` (Tele-MANAS 14416, emergency 112) if suicide/self-harm comes up, and never try to handle a crisis alone. This is a **second** safety net — the fixed crisis check runs first. The topic guard treats crisis messages as always on-topic.

### 1.7 Helplines 🔒
Defined once in `src/lib/safety.ts` and used everywhere (help page, crisis card, voice mode, crisis reply):

| Name | Numbers | Hours | `verified` |
|---|---|---|---|
| Tele-MANAS | 14416 · 1-800-891-4416 | 24 × 7 | **false** |
| KIRAN | 1800-599-0019 | 24 × 7 | **false** |
| Emergency services | 112 | 24 × 7 | **false** |

All three are **PLACEHOLDER — owner to verify**. While any is `verified: false`, `/help` shows "Placeholder: these numbers are pending final verification by the EaseMind team." 🔒 Owner: check each number is correct and current, then set `verified: true`.

### 1.8 "Need help now?" everywhere
Red button → `/help` in: the app header (every app page), the landing top bar, the 404 page, the voice-mode screen. The footer on every app page links to `/help` too. `/help` itself needs no AI and no login.

## 2. Disclaimers (must stay)
- **Footer, every app page:** "EaseMind is a self-help tool. It is not therapy, not a medical service, and not for emergencies."
- **`/start` step 1:** user must tick "I'm 18 or older" and "I understand EaseMind is a self-help tool, not therapy or medical care".
- **`/chat`:** "AI companion, not a therapist or doctor. It can make mistakes. In a crisis, …"
- **Voice mode:** "Your voice is turned into text to reply and isn't stored. AI companion — not a therapist."
- **Near me:** "Ratings come from Google reviews / Listings come from OpenStreetMap and aren't an endorsement by EaseMind."
- **Directory:** "Sample listings … placeholders, not real people."
- **Expression image:** "AI-generated photo · not a real person · not saved".
- `/privacy` and `/terms` are 🔒 placeholders — not legal documents yet.

## 3. Privacy

### 3.1 Stored on the device only
Profile, moods, confidence sessions, reframes, active days, preferences, and chat (this tab only, unless the user turns on "Save chat history"). Full list: `docs/FEATURES.md` §15. Settings → **Download my data** (JSON) and **Delete my data**.

### 3.2 Sent to which service

| User action | Leaves the device to | What is sent | Stored? |
|---|---|---|---|
| Chat message / voice turn | Our server → NVIDIA (Nemotron + NemoGuard), or Anthropic as fallback | Last ≤ 20 chat turns | Not stored by us |
| Voice mode | Our server → NVIDIA Parakeet | Audio of one turn (16 kHz WAV) | **Audio never stored or logged** |
| Listen / voice guide | Our server → NVIDIA Chatterbox | The reply text, or our fixed cue text | Cue audio cached in server memory (no user data) |
| AI hint | Our server → NVIDIA / Anthropic | The reframe draft | Not stored by us |
| Expression image | Our server → NVIDIA FLUX | **Nothing from the user** — only a situation id; prompt is fixed | Image cached in server memory (no user data) |
| Near me (location) | Our server → Google Places (or OpenStreetMap Overpass) | Coordinates **rounded to ~110 m** | Never logged or stored |
| Near me (city) | Our server → Google Places (or Nominatim) | City name | City results may be cached 5 min |
| Sign-in (if configured) | Supabase | Email / Google account | By Supabase 🔒 |

- **Nothing is stored server-side.** No database, no logs of messages, audio or locations. Error logs contain only error messages with keys removed.
- Location: the browser asks permission, uses low accuracy, sends 4 decimals to our server, which rounds to 3 decimals before any third party.
- No analytics, ad trackers or third-party pixels.

## 4. AI content rules
- **Expression images** are the **only** AI imagery: photorealistic close-ups, **always displayed brows-to-chin** (16:10 crop anchored low) so the hairline is never shown, labelled "AI-generated photo · not a real person · not saved". Never stored.
- **Prompts are locked on the server** (`src/lib/server/expression-prompts.json`). Users only pick a situation; no user text ever reaches the image model. Only seeds checked by eye are used. **If you change any prompt text, re-check every seed by eye.**
- **No hair imagery**: no before/after, no mirrors, no hair close-ups, no hair products, no hairline in generated images.
- The voice guide only reads our own fixed text; "Listen" reads the companion's reply.
- Chat and hints: no medical/medication advice, no diagnosis, no hair-loss treatments/products/brands, no invented facts, numbers or names (`src/lib/prompts.ts`).
- Videos are real filmed nature footage (no people, no AI) — `public/videos/CREDITS.md`. Landing photos are real Pexels photos of adults (`docs/DESIGN.md` §5).

## 5. Security
- **Keys server-only:** in `.env.local` (git-ignored); read only in `src/lib/server/env.ts`, `src/lib/places.ts`; those files start with `import "server-only"` so the build fails if browser code imports them. Only the Supabase URL + anon key use `NEXT_PUBLIC_` (designed to be public).
- **Same-origin checks** on all AI routes and the near-me route (other websites can't use them as a free proxy).
- **Size caps + zod validation** on every request (see `docs/TECH_STACK.md` §3).
- **Daily quotas per IP** (`src/lib/rate-limit.ts`): chat 30 · hints 40 · new images 20 · voice cues 120 · read-alouds 40 · speech-to-text 120 · near-me 40. ⚠️ In-memory: they reset on restart and aren't shared between servers; the IP comes from `x-forwarded-for`, which can be faked if the host doesn't set it. Cost protection, not a security boundary — use a shared store before scaling.
- **Timeouts** on every outside call; **redaction** of NVIDIA (`nvapi-…`) and Anthropic (`sk-ant-…`) keys in logs.
- **Headers:** `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` (location + microphone for this site only, no camera/payment).
- **Sign-in redirect** only to same-site paths.
- 🔒 **Rotate keys:** the NVIDIA keys and the Google Places key were pasted into an AI chat. Rotate them, restrict the Google key to "Places API (New)", and set a Google Cloud budget alert.

## 6. Checklist for every future change
- [ ] "Need help now?" still visible on every page (incl. new pages and full-screen views).
- [ ] Footer disclaimer still on every app page.
- [ ] Any new place where users type free text → run `detectCrisis` (server-side before AI, client-side for instant UI) and show helplines.
- [ ] Crisis path never depends on AI, quotas or network to third parties.
- [ ] Helpline numbers only come from `src/lib/safety.ts` — never typed elsewhere; never invent numbers.
- [ ] No API key in browser code; no new `NEXT_PUBLIC_` secrets; new server files start with `import "server-only"`.
- [ ] New API route: same-origin check, size cap, zod, quota, timeout, `redact()` in logs, friendly offline message.
- [ ] Feature still works (friendly message, no blank screen) when the AI/API is down.
- [ ] Nothing personal stored server-side or logged; location still rounded.
- [ ] No new AI imagery; no hair imagery; expression prompts unchanged (or seeds re-verified).
- [ ] New external service / host → owner approval + CHANGELOG line.
- [ ] `PROJECT_STATUS.md` updated.
