# EaseMind — Build Plan

> Written 2026-10-21 from `PROJECT_STATUS.md` (Activity Log) and the current code. Build **one task at a time**, explain how to test it, then stop (`CLAUDE.md` rule 4).
> 🔒 = blocked on the owner.

## 1. Phases done

| Phase | What was built | When |
|---|---|---|
| 0. Setup | Node.js 24, Next.js app, libraries, shadcn/ui, design tokens, fonts, app shell, on-device storage, `.env.example`, `PROJECT_STATUS.md`, `CHANGELOG.md` | 2026-10-20 |
| 1. Landing | `/` with 3D hero, how it works, tools, privacy promise, disclaimer; favicon; friendly 404 | 2026-10-20 |
| 2. Core tools | `/start`, `/home` + mood check-in, `/confidence`, `/reframe`, `/reframe/history`, `/progress` (all on-device) | 2026-10-20 |
| 3. Companion & safety | `/chat` + `/api/chat` (streaming, crisis-first, limits), `/api/reframe-hint`, `/help`, `/login` + `/auth/callback`, `/settings`, `/about`, placeholder `/privacy` & `/terms`, `safety.ts` | 2026-10-20 |
| 4. Psychologists | `/psychologists` (Top 5 near me + placeholder directory), `/psychologists/[id]`, `/api/psychiatrists/nearby` | 2026-10-20 |
| 5. QA pass | All routes checked, red removed from non-crisis UI, unapproved OSM mirror removed | 2026-10-20 |
| 6. Redesign v2 | "Calm Liquid Glass", GSAP/Lenis motion, Phosphor icons, all pages restyled, browser QA at 360/768/1440 light+dark | 2026-10-20 |
| 7. Media & sound | 5 filmed Pexels videos, code-made UI sounds + Settings switch | 2026-10-20 |
| 8. NVIDIA AI | Nemotron chat + hints, NemoGuard guard, FLUX.2 expression images, Chatterbox voice guide + Listen, security hardening (server-only, same-origin, quotas, headers) | 2026-10-20 |
| 9. Precision + voice mode | Google Places precise search, voice mode (Parakeet STT), expression shown on situation pick with verified seeds + cache | 2026-10-21 |
| 10. Docs | `FEATURES.md`, `TECH_STACK.md`, `SAFETY.md`, `BUILD_PLAN.md` written | 2026-10-21 |
| — In progress | Design v3 "Warm Editorial" with real photos (`docs/DESIGN.md`) — being built by other agents | 2026-10-21 |

## 2. Remaining work

### Owner-blocked 🔒
| Item | What the owner needs to do | Where it goes |
|---|---|---|
| Helpline verification | Confirm Tele-MANAS, KIRAN and 112 numbers are correct and current | `src/lib/safety.ts` → `verified: true` |
| Real psychologists | Supply real entries (name, credentials, RCI registration, city, languages, modes, fees, booking link) with their consent | `src/data/psychologists.json` (remove placeholders) |
| Legal text | Supply final Privacy Policy and Terms of Use | `/privacy`, `/terms` pages |
| Accounts | Create a Supabase project; decide what (if anything) syncs to the cloud | `.env.local` + a spec update |
| Key rotation | Rotate NVIDIA keys + Google Places key; restrict Google key to Places API (New); set a budget alert | build.nvidia.com, Google Cloud, `.env.local` |
| Hindi / Hinglish voice | Approve trying the multilingual Parakeet model | `NVIDIA_ASR_FUNCTION_ID` |
| Landing photos | Approve/supply photos for the new design | `public/images/` + `CREDITS.md` |
| Spec decisions | See §4 | `docs/PROJECT_SPEC.md` |

### Technical (no owner input needed, but ask before adding anything new)
- Real-phone check (iOS/Android: safe-area, touch scrolling, microphone).
- Chat tested end-to-end with live keys on a phone.
- Shared rate-limit store (e.g. Upstash/Redis) before hosting on more than one server — **new service → ask first**.
- Deploy to Vercel.

## 3. Recommended order (with "done when")

| # | Task | Done when |
|---|---|---|
| 1 | 🔒 Verify helplines | Owner confirmed each number; `verified: true` for all; the "pending verification" note no longer shows on `/help` |
| 2 | 🔒 Rotate + restrict keys | New keys in `.env.local`; old keys revoked; Google key restricted + budget alert set; chat, voice, images, near-me all work again |
| 3 | Finish design v3 | All pages match `docs/DESIGN.md`; Need help now + disclaimers intact; 360/768/1280 light + dark checked; `npm run build` passes |
| 4 | Real-device QA | `/chat` voice mode, `/confidence` session, `/psychologists` near me tested on one iPhone and one Android; issues fixed |
| 5 | 🔒 Legal text | Owner text on `/privacy` and `/terms`; placeholder notes removed |
| 6 | 🔒 Real directory | At least one verified real professional; all placeholder entries removed or still clearly labelled |
| 7 | 🔒 Accounts (Supabase) | Spec says what syncs; login works with email + Google; RLS on every table; "Delete my data" also deletes cloud data |
| 8 | Deploy | Live on Vercel with env vars set; build output grepped for keys (none); quotas reviewed for multi-server |
| 9 | 🔒 Hindi voice (optional) | Multilingual model tested with Hindi/Hinglish phrases; crisis phrases still detected in voice mode |

## 4. Open spec questions for the owner 🔒
The code differs from `docs/PROJECT_SPEC.md` in these places — the owner should decide, then the spec or code is updated:
1. Spec says `/reframe/history`, `/progress` and `/settings` need login — today they work on-device without login.
2. Spec's "Out of scope" list still says "Voice chat", but voice mode was approved and built (CHANGELOG 2026-10-21).
3. Spec §6 still lists Anthropic Claude as the main AI; NVIDIA is now primary, Claude optional fallback.

(Already settled 2026-10-21: photorealistic expression images, real photography and the "Warm Editorial" design — see CHANGELOG.)
