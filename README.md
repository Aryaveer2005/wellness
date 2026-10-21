# EaseMind

A private, judgement-free self-help web app for men in India (18–40) dealing with hair loss — to rebuild confidence and manage the stress and anxiety that can come with it.
(Formerly called "Show Up".) EaseMind is **not** therapy, **not** a medical service, and **not** for emergencies.

## Features

- **60-Second Confidence Builder** — pick a situation (date, interview, meeting…), rate yourself, do a guided 60-second session (breathe · posture · affirm · visualise) with an optional voice guide and a suggested confident expression, then rate again.
- **CBT Thought Reframer** — a 7-step thought record with optional AI hints and an on-device history.
- **AI Companion** — a warm, short-reply chat (streamed), with "Listen" read-aloud and hands-free voice mode.
- **Find a professional** — Top 5 psychiatrists near you (Google Places, OpenStreetMap fallback) + a directory (placeholders for now).
- **Daily mood check-in** and **My progress** (30-day mood chart, confidence change, reframes).
- **Need help now?** — on every page; crisis helplines with tap-to-call; crisis detection in chat that never depends on AI.
- **No account needed** — everything is stored on your device; download or delete it any time in Settings. Light and dark mode.

## Quick start (on your computer)

```bash
npm install        # first time only
npm run dev        # start the app
```

Open **http://localhost:3000**.

- Node.js v24 is needed (a portable copy lives in `%LOCALAPPDATA%\node-portable`).
- Don't run `npm run build` while `npm run dev` is running. If dev shows an `EINVAL ... .next` error (OneDrive quirk), stop it, delete the `.next` folder, and start again.
- All API keys are optional — without them each AI feature shows a friendly "offline" message and the rest of the app works.

## Project docs

| File | What's inside |
|------|---------------|
| `CLAUDE.md` | Rules for the AI coding agent (read first) |
| `AGENTS.md` | Pointer for other AI tools (Cursor, Copilot, Codex…) |
| `PROJECT_STATUS.md` | **Live status** — updated by every AI/agent after each change |
| `docs/PROJECT_SPEC.md` | What we're building (source of truth) |
| `docs/FEATURES.md` | How every page and feature works today, step by step |
| `docs/DESIGN.md` | Colours, fonts, style, imagery, tone |
| `docs/TECH_STACK.md` | Stack, folders, API routes, env vars, external services, how to run |
| `docs/AI_CHATBOT.md` | Chatbot prompts, AI models and limits |
| `docs/SAFETY.md` | Crisis handling, disclaimers, privacy, security, change checklist |
| `docs/BUILD_PLAN.md` | What's done, what's left, and the next steps in order |
| `docs/CHANGELOG.md` | Approved changes |

## Secrets

- Copy `.env.example` to `.env.local` and fill in your keys (NVIDIA, Google Places, optional Anthropic and Supabase). Details: `docs/TECH_STACK.md` §4.
- Keys are used **only on the server** — never add `NEXT_PUBLIC_` to them (only the Supabase URL + anon key are meant to be public).
- **Never** share `.env.local` or upload it to GitHub (it's git-ignored).
- Set spending limits / budget alerts on every paid API account.
