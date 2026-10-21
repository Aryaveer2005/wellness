# EaseMind — Project Spec

> **Source of truth.** If the code and this file disagree, this file wins.
> Only the owner can change this file. Log every approved change in `docs/CHANGELOG.md`.

---

## 1. What the app does

**EaseMind** is a cognitive wellness web app that helps men experiencing hair loss rebuild their self-confidence and manage the stress and anxiety that come with it.

It gives them short, practical tools they can use in the moment:

- a **60-second confidence builder** to use right before a date, interview or meeting,
- a **negative thought reframer** based on CBT (Cognitive Behavioural Therapy),
- an **AI companion** to talk things through, any time,
- a **directory to find a real psychologist** when they need more support.

EaseMind is a **self-help tool**. It is **not** therapy, **not** a medical service, and it does **not** treat hair loss or recommend hair products.

---

## 2. Target users

**Primary user:** Men in India, roughly **18–40 years old**, experiencing hair loss (thinning, receding hairline, bald patches, baldness) who feel:

- low confidence in social, dating or work situations,
- stress or anxiety about how they look,
- embarrassed to talk about it with friends or family.

**What we know about them:**

- They mostly use **mobile phones**.
- They are comfortable with **simple English** (Hindi is a future idea, not v1).
- Most have **never seen a therapist** and may feel shy about it.
- They want **quick help**, not long courses or heavy reading.
- They may feel embarrassed even opening the app — the experience must feel private and judgement-free.

**Not for (v1):**

- Anyone under 18 (users must confirm they are 18+).
- People in crisis who need urgent care — we route them to helplines (see `docs/SAFETY.md`).
- People looking for hair-loss treatment.

---

## 3. Pages / screens

| Route | Page | Purpose | Login needed? |
|-------|------|---------|---------------|
| `/` | Landing | Explain EaseMind in one screen; "Start now" button | No |
| `/start` | Quick start | Confirm 18+, accept disclaimer, "What brings you here?" (pick 1–3), first mood check | No |
| `/home` | Home dashboard | Greeting, daily mood check-in, 4 tool cards, recent activity (if logged in) | No |
| `/confidence` | 60-Second Confidence Builder | Pick a situation → rate → 60-second guided session → rate again | No |
| `/reframe` | Thought Reframer | Step-by-step CBT thought record | No |
| `/reframe/history` | My reframes | List and view saved thought records | No — saved on this device (account sync later 🔒) |
| `/chat` | AI Companion | Chat with the AI companion | No (lower daily limit) |
| `/psychologists` | Find a Psychologist | Searchable, filterable list of psychologists | No |
| `/psychologists/[id]` | Psychologist profile | Details + external "Visit / Book" link | No |
| `/progress` | My Progress | Mood trend, confidence change, reframes done | No — saved on this device (account sync later 🔒) |
| `/help` | Need help now | Crisis helplines with tap-to-call buttons | No |
| `/login` | Log in / Sign up | Email magic link + Google | No |
| `/settings` | Settings | Name, theme, sound, chat history toggle, download my data, delete my data, log out | No |
| `/about` | About | What EaseMind is and isn't | No |
| `/privacy` | Privacy policy | Placeholder text — owner will supply final text | No |
| `/terms` | Terms of use | Placeholder text — owner will supply final text | No |

**On every app page (everything except `/`):**

- **Mobile:** bottom navigation bar — Home, Confidence, Reframe, Chat, More (More → Psychologists, Progress, Settings, About).
- **Desktop:** top navigation bar with the same items.
- **"Need help now?" button** in the header, always visible → links to `/help`.

---

## 4. Features (main ones)

Full behaviour for each is in `docs/FEATURES.md`.

1. **60-Second Confidence Builder** — guided breathing, posture, affirmations and visualisation for a chosen situation, with a before/after confidence rating.
2. **Negative Thought Reframer (CBT)** — a 7-step thought record that helps users spot thinking traps and write a balanced thought. Optional AI hints.
3. **AI Companion chat** — a warm, CBT-informed chatbot that can point users to the in-app tools.
4. **Find a Psychologist** — curated list with filters; booking happens on the psychologist's own site.
   - **Top 5 psychiatrists near me** *(added 2026-10-20, owner-approved)* — with the user's permission, uses their location (or a typed city) to show the 5 best-rated nearby psychiatrists, ranked by Google rating and number of reviews. Location is used only for the search and never stored. Links out to Google Maps / the clinic's own site; no in-app booking.
5. **Daily mood check-in** — one tap, 1–5 faces, optional note.
6. **Progress tracking** — mood trend and tool history (logged-in users).
7. **Optional account** — use everything without signing up; sign up to save progress.
8. **Crisis support** — always-visible help button, helpline page, and crisis detection in chat.
9. **Light and dark mode** — follows the device setting, with a manual toggle.

### Built 2026-10-20 (owner supplied NVIDIA APIs) — details in docs/AI_CHATBOT.md

- **Suggested expression during the Confidence boost** — BUILT: photorealistic close-up (FLUX.2 klein, verified seeds, displayed brows-to-chin) + hand-written tips, labelled "AI-generated photo · not a real person", never stored. *(realistic since 2026-10-21; was line art)*
- **Voice guide + Listen** — BUILT: Chatterbox TTS reads Confidence session cues and companion replies.
- **Voice mode (speech-to-speech)** — BUILT 2026-10-21: talk to the companion hands-free from /chat (NVIDIA Parakeet speech-to-text → companion → Chatterbox voice). Same crisis safety as typed chat; audio never stored.
- *(Original note, kept for history)* **Suggested expression during the Confidence boost** *(noted 2026-10-20)* — idea: while the user does the confidence boost, suggest a confident facial expression / posture, with image generation via an API. **Do not build until the owner supplies the API and detailed spec.** Open questions to settle first: it conflicts with today's "no AI-generated content" rule and the imagery rules (no photos of men/hair/mirrors) — the owner must decide how generated images fit those rules, plus privacy (no user photos stored), cost limits and safety review.

### Out of scope for v1 — do NOT build

- Hair-loss treatments, product recommendations, a shop, or links to hair brands
- In-app booking, payments, or video calls with psychologists
- Community, forum, comments, or any social features
- Push notifications, email newsletters, native mobile apps *(voice chat moved in-scope 2026-10-21 — see Voice mode)*
- Hindi or other languages
- Admin dashboard (the psychologist list is edited directly in Supabase or a JSON file)
- Analytics, ad trackers, or third-party pixels
- Gamification beyond a simple "days used" count (no points, badges, leaderboards)

---

## 5. Design (summary)

Full details in `docs/DESIGN.md`.

- **Brand:** **EaseMind** *(renamed from "Show Up" on 2026-10-21, owner-approved)*.
- **Feeling:** warm, human, editorial, judgement-free — like a supportive older brother or a good coach. Not clinical, not cheesy.
- **Look:** "Warm Editorial" *(2026-10-21; design language inspired by rockethealth.app — nothing copied)*: peach gradient hero, real photography, serif headlines, black pill buttons, periwinkle / blush bands, black footer. Full rules in `docs/DESIGN.md`.
- **Colours:** ink `#161514` (text + primary buttons), warm white `#FFFCFA`, peach gradient `#FFD9C2 → #FF8F63`, periwinkle `#E8EEFB`, blush `#F7F0EE`, ember accent `#E8673E`. Red (`#B3261E`) is used **only** for crisis elements.
- **Fonts:** Instrument Serif (headlines), Hanken Grotesk (body/UI), Caveat (one handwritten accent word). *(changed 2026-10-21)*
- **Icons:** Phosphor Icons, duotone.
- **Video & sound:** real filmed nature footage for immersive moments (Confidence session, voice mode); subtle code-generated UI sounds with an off switch.
- **Style:** mobile-first, editorial bands, generous white space, clean bordered cards, gentle GSAP motion and smooth scroll.
- **Imagery:** real photography of adults in India in calm, confident everyday moments (Pexels, credited in `public/images/CREDITS.md`). The only AI imagery is the clearly labelled, photorealistic **suggested expression** close-up (shown brows-to-chin). **Never:** before/after, mirrors, hair close-ups, hair products, children, anyone portrayed negatively. *(changed 2026-10-21, owner-approved)*

---

## 6. Tech stack and APIs (summary)

Full details in `docs/TECH_STACK.md`.

| Layer | Choice |
|-------|--------|
| Framework | Next.js (latest stable, App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui components |
| Icons / motion / charts / 3D | Phosphor Icons, GSAP (+ ScrollTrigger, SplitText) + Lenis smooth scroll, framer-motion (step transitions), recharts, three.js via @react-three/fiber + drei (landing hero only) |
| Auth + database | Supabase (Auth, Postgres, Row Level Security) |
| AI | NVIDIA (Nemotron chat, NemoGuard topic guard, FLUX.2 klein images, Chatterbox voice, Parakeet speech-to-text) — server-side only; Anthropic Claude optional fallback. See `docs/AI_CHATBOT.md` |
| Validation | zod |
| Hosting | Vercel (app) + Supabase (database) — free tiers to start |

**External APIs used:**

1. **Anthropic Claude API** — AI companion chat and reframer hints.
2. **Supabase** — login, database.
3. **NVIDIA AI** *(added 2026-10-20, owner-approved)* — chat replies (Nemotron), topic guard (NemoGuard), image (FLUX.2 klein), voice (Chatterbox TTS), speech-to-text for voice mode (Parakeet, added 2026-10-21). Server-side only. See `docs/AI_CHATBOT.md`.
4. **Google Places API (New)** *(added 2026-10-20)* — nearby psychiatrists with ratings and review counts. Server-side only (`GOOGLE_PLACES_API_KEY`). Fallback without a key: OpenStreetMap (Nominatim + Overpass) — names and addresses only, no ratings.

No other external APIs in v1.

---

## 7. Rules for the AI coding agent

Full rules in `CLAUDE.md`. The short version:

1. **Only build what is listed in these docs.**
2. **Ask before adding anything new** — features, pages, libraries, tables, APIs, services.
3. Build **one task at a time** in the order in `docs/BUILD_PLAN.md`, then stop and explain how to test it.
4. **Safety rules (`docs/SAFETY.md`) beat all other rules.**
5. **Never expose API keys** to the browser.
6. **Never invent real-world facts** (therapists, phone numbers, credentials, medical claims).
7. Explain everything in **plain English** — the owner is not a coder.
