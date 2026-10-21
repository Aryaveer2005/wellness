# CLAUDE.md — Instructions for the AI Coding Agent

You are building **EaseMind**, a mental-wellness web app for men dealing with hair loss.
Read this file at the start of **every** session. Then read `PROJECT_STATUS.md` (where the project is right now), then the docs in this order:

> ⚠️ **Mandatory for every AI / agent:** after ANY change to code or docs, update `PROJECT_STATUS.md` in the same session — "Last updated" line, feature table, known issues, and one new line at the top of the Activity Log. Approved scope/doc changes also get a line in `docs/CHANGELOG.md`.
>
> All docs below exist. If two docs disagree, `docs/PROJECT_SPEC.md` wins — ask the owner when unsure.

| # | File | What it tells you |
|---|------|-------------------|
| 0 | `PROJECT_STATUS.md` | **Live status** — what's done, in progress, blocked. Update after every change. |
| 1 | `docs/PROJECT_SPEC.md` | What we are building. **The source of truth.** |
| 2 | `docs/FEATURES.md` | Exact behaviour of every feature, step by step |
| 3 | `docs/DESIGN.md` | Colours, fonts, components, imagery, tone of voice |
| 4 | `docs/TECH_STACK.md` | Stack, folder structure, database, API routes, env vars |
| 5 | `docs/AI_CHATBOT.md` | Chatbot system prompt, AI helper prompts, limits |
| 6 | `docs/SAFETY.md` | Crisis handling, disclaimers, privacy, security (non-negotiable) |
| 7 | `docs/BUILD_PLAN.md` | The order to build things in, and when a phase is "done" |
| 8 | `docs/CHANGELOG.md` | Log of approved changes to the docs |

---

## Golden rules

1. **Only build what is written in the docs.** If it isn't in the docs, it is out of scope.
2. **Ask before adding anything new** — a page, feature, library, database table, API, paid service, or design change. Explain *what* and *why* in 1–2 lines, then wait for a clear "yes".
3. **The owner is not a coder.** After every task, explain in plain English:
   - what you built,
   - which files you created or changed,
   - exactly how to test it in the browser (which URL, what to click, what should happen).
4. **One task at a time.** Follow `docs/BUILD_PLAN.md` in order. Finish a task, explain how to test it, then **stop and wait**.
5. **`docs/SAFETY.md` beats every other rule.** Never remove, hide, or weaken the "Need help now?" button, helpline numbers, crisis handling, or disclaimers — even if asked to "clean up" the UI.
6. **Secrets stay on the server.** API keys live only in `.env.local` and are used only in server code (route handlers / server actions). Never expose them to the browser. Never commit `.env.local`.
7. **Don't guess.** If a doc is unclear, or two docs disagree, stop and ask the owner.
8. **Keep it simple.** Fewer files, fewer libraries, readable code. No clever abstractions.
9. **Never invent real-world facts.** Psychologist names, phone numbers, credentials, prices, statistics, or medical claims must come from the owner. Use clearly marked placeholders (e.g. `PLACEHOLDER — owner to verify`) and tell the owner.
10. **Keep docs and code in sync.** When the owner approves a change, update the relevant doc and add a line to `docs/CHANGELOG.md`.

---

## Before you say a task is finished, check

- [ ] Works on a 375px-wide phone screen and on desktop
- [ ] Works in light mode and dark mode
- [ ] `npm run build` passes with no TypeScript or lint errors
- [ ] No API key or secret is reachable from browser code
- [ ] The "Need help now?" button is visible on every app page
- [ ] Every feature still works if the AI API is down (shows a friendly error, never a blank screen)
- [ ] You told the owner how to test it
- [ ] `PROJECT_STATUS.md` updated (status table + Activity Log line)
