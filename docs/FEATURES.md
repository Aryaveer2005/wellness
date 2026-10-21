# EaseMind — Features (how every page behaves today)

> Written 2026-10-21 from the **current code**. `docs/PROJECT_SPEC.md` is still the source of truth — if this file and the spec disagree, the spec wins and the owner decides.
> Safety rules live in `docs/SAFETY.md`. AI details (prompts, models) live in `docs/AI_CHATBOT.md`.
> 🔒 = needs the owner.

## 0. Things that are true on every page

| What | How it works |
|---|---|
| **"Need help now?" button** | Red pill in the header of every app page, the landing top bar, the 404 page and the voice-mode screen. Always links to `/help`. (`src/components/layout/need-help-button.tsx`) |
| **Disclaimer footer** | Every app page: "EaseMind is a self-help tool. It is not therapy, not a medical service, and not for emergencies." + link to `/help`. (`app-footer.tsx`) |
| **Navigation** | Phone: bottom dock — Home, Confidence, Reframe, Chat, More (More → Find a professional, My progress, Settings, About). Desktop: same items in the top bar. (`nav-items.ts`) |
| **No account needed** | Everything is saved **on this device** (browser storage). See §15 for exactly what is stored. |
| **Light / dark mode** | Follows the device; can be changed in the header toggle or Settings. |
| **Sounds** | Quiet code-made tones when numbers count up, progress bars fill, or a session finishes. Off switch in Settings. |

---

## 1. `/` Landing

1. Top bar: logo, **Need help now?**, and **Start now** (→ `/start`).
2. Hero, a short "how it works", the four tools, a privacy promise and the disclaimer.
3. ℹ️ The landing page is being redesigned right now ("Warm Editorial", real photos of adults in India — see `docs/DESIGN.md` §10). Photo files go in `public/images/`; if a photo file is missing, its frame shows as a plain soft block instead of breaking.

No AI on this page.

## 2. `/start` Quick start (3 steps)

1. **Before we begin** — explains EaseMind is a self-help tool, not therapy, not medical care, not for emergencies (with a link to get help now). The user must tick **"I'm 18 or older"** and **"I understand EaseMind is a self-help tool…"** before Continue works.
2. **What brings you here?** — pick 1 to 3 of: Dating nerves · Work & interviews · Social situations · Mirror anxiety · Stress about the future · Feeling alone with it.
3. **Quick check-in** — one tap on a mood face (1–5).
4. **Finish** saves to the device profile (18+ confirmed, time the disclaimer was accepted, reasons) plus the first mood, then goes to `/home`.

Back button on steps 2–3. Calm filmed ocean video in the background. No AI.

## 3. `/home` Dashboard + daily mood check-in

1. Greeting by time of day ("Good morning / afternoon / evening"), with the user's name if set in Settings.
2. **Daily check-in**: five faces — Rough, Low, Okay, Good, Great — plus an optional note (max 280 characters, "stays on this device"). Saving adds a new entry; checking in again the same day adds another entry and the latest one is shown as "today's".
3. **Days you showed up** — count of distinct days with any activity.
4. Four tool cards: Confidence Builder, Thought Reframer, AI Companion, Find a Psychologist.
5. **Recent activity** — the 5 most recent moods / confidence sessions / reframes, with a link to `/progress`.
6. "New here? Take the 1-minute quick start" link to `/start`.

No AI.

## 4. `/confidence` 60-Second Confidence Builder

**Steps**
1. **Pick a situation** (6): A date · An interview · A meeting · Party / social · A presentation · Just need a boost.
   - As soon as a situation is tapped, the **Suggested expression** card appears (see below).
2. **Rate confidence before** — slider 0–10 ("Not at all" → "Very confident").
   - **Voice guide** switch on this screen (on by default, remembered on the device).
3. **60-second session** with a filmed water video behind it. Four phases:

   | Phase | Seconds | What the user sees |
   |---|---|---|
   | Breathe | 20 | Breathing orb: in 4 s · hold 4 s · out 6 s |
   | Posture | 10 | "Plant both feet. Roll your shoulders back…" |
   | Affirm | 20 | Three affirmations for the chosen situation |
   | Visualise | 10 | A short scene to picture |

   - **Pause / Resume** and **Skip** (last phase says **Finish**). A chime plays at the end.
   - From the Posture phase on, a small version of the suggested-expression card shows under the timer.
4. **Rate confidence after** (0–10, starts at the "before" value).
5. **Result**: Before → After with the change in points and a kind message (up / same / down). Saved on the device. Buttons: Back to home · Do another. The full suggested-expression card shows again below.

**Voice guide** (when on): at the start of each phase a calm male voice reads that phase's text (Breathe cue, posture cue, the three affirmations, or the visualisation). Audio for all four phases is pre-loaded while the user rates themselves. Pausing or leaving stops the voice. The text is always our own fixed content — users can't make it say anything else.

**Suggested expression**
- Hand-written tips (3 per situation, e.g. "Warm and open", "Steady and attentive") are **always** shown — they don't need AI.
- Next to the tips: an **AI-generated photorealistic close-up** of a calm, confident expression, made on our server by NVIDIA FLUX.2 [klein] from a fixed prompt. It's shown cropped **brows to chin** so the hairline is never visible, and the full card labels it **"AI-generated photo · not a real person · not saved"**.
- **Show another example** asks for a different pre-checked image. Images are never stored on the device.

**If the AI is down**
- Image fails / no key / daily limit → the image box shows a smiley icon and **"Try again"**; the tips still work.
- Voice fails → the session runs silently, nothing breaks.

## 5. `/reframe` Thought Reframer (CBT) + `/reframe/history`

**Seven steps** (progress bar with 7 beads):

| # | Step | Required to continue? |
|---|---|---|
| 1 | What happened? (the situation, facts only) | Yes |
| 2 | What went through your mind? (the thought) | Yes |
| 3 | What did you feel? (pick or type an emotion + intensity 0–100) | Emotion yes |
| 4 | Spot the thinking traps (9 traps, tap any that fit) | No |
| 5 | Evidence for the thought | No |
| 6 | Evidence against the thought | No |
| 7 | A more balanced thought + re-rate the feeling 0–100 ("It started at X") | Balanced thought yes |

- Emotion chips: Anxious, Embarrassed, Sad, Frustrated, Ashamed, Lonely, Angry, Hopeless.
- Traps: All-or-nothing, Mind reading, Fortune telling, Catastrophising, Labelling, Should statements, Emotional reasoning, Discounting the positive, Spotlight effect.
- **Finish** saves the record on the device and shows a summary ("Your [emotion] dropped from X to Y" or an encouraging line), with **Reframe another thought** and **My reframes**.

**AI hint (steps 5, 6, 7)**
1. Tap **Get an AI hint** → the draft so far is sent to `/api/reframe-hint`.
2. The server first runs the **crisis check** on everything the user wrote. If it fires, the fixed crisis message with helpline numbers is returned and shown in the hint box.
3. Otherwise the AI returns one short Socratic hint (≤ 60 words, 1–2 questions, never the answer).
- **If the AI is down** (no key, error, limit, or 15 s timeout): the hint box says *"Hints are resting right now — you're doing great on your own."* The step still works.

**`/reframe/history`** — all saved reframes, newest first, as expandable cards (situation, thought, traps, evidence, balanced thought, before → after). Each has **Delete** with an inline "Delete this reframe for good?" confirm. Empty state: "No reframes yet". Works without login (the spec says login — see BUILD_PLAN open questions).

## 6. `/chat` AI Companion

**Typing**
1. Empty chat shows 4 starter prompts (e.g. "I just need to vent for a minute").
2. User types (max 2,000 characters) and sends.
3. **Crisis check in the browser** — if the text looks like crisis language, the red **crisis card** appears immediately, before the server answers.
4. The last 20 normal messages go to `/api/chat`. The server runs: same-site check → validation → **crisis check** → daily limit (30/day) → topic guard → AI reply.
5. The reply **streams** in word by word. Replies are short (≈ 80 words), plain text, warm "older brother" tone, may point to `/confidence`, `/reframe`, `/psychologists` or `/help` (these show as tappable links).
6. **Listen** under each normal companion reply reads it aloud (max 700 characters, 40/day). Shows "Voice unavailable" if voice fails.

**Special replies** (fixed text, not AI): crisis, offline, daily limit, off-topic, invalid. They are styled differently and are **not** sent back to the AI as history.

**Crisis card** — "You deserve support right now": tap-to-call Tele-MANAS and KIRAN, a big "In immediate danger? Call 112" button, and a link to `/help`. The chat scrolls so the card's heading and first helpline stay in view. It stays visible for the rest of the conversation (until "Clear").

**Topic guard** — off-topic requests (coding, homework, politics, hair-loss treatments…) get a friendly redirect back to wellbeing. If NVIDIA's guard service is down, it's skipped for 5 minutes ("fails open"); the companion's own instructions still keep it on topic.

**Privacy line** at the top: by default "Private — cleared when you close this tab". If **Save chat history** is on in Settings: "Saved only on this device". **Clear** empties the conversation.

**Voice mode** (mic button next to Send)
1. Opens a full-screen voice view with a breathing orb; **Need help now?** stays in its top bar.
2. Browser asks for the microphone. It listens, adapts to background noise, and ends your turn after ~1.1 s of silence (max 30 s per turn).
3. The audio goes to `/api/stt` → text → **the same chat pipeline** as typing (crisis check first). Your words and the reply also appear in the chat.
4. The reply is spoken aloud, then it listens again. Tap the orb to interrupt; Pause/Resume; Esc or ✕ to end.
5. **Crisis**: it stops listening, says one short caring line, and shows big red tap-to-call buttons (Tele-MANAS, KIRAN, Emergency 112) + "More ways to get help now".
6. Note at the bottom: "Your voice is turned into text to reply and isn't stored. AI companion — not a therapist."
7. Mic blocked → "Allow microphone access in your browser to talk. You can always type instead."

**If the AI is down**
- No AI key / NVIDIA and Claude both fail → fixed message: "The companion is offline right now… You can still use /confidence or /reframe… go to /help."
- Network drop mid-reply → "(The connection dropped — please try sending that again.)"
- Daily limit → "You've reached today's chat limit — it resets tomorrow…" with links.
- **Crisis replies never depend on the AI** — they always work.
- Voice mode: speech-to-text down → "Voice input is offline right now — you can keep typing." Voice playback fails → "Couldn't play the voice — the reply is in the chat."

## 7. `/psychologists` Find a professional (+ `/psychologists/[id]`)

### Top 5 psychiatrists near me
1. **Use my location** (browser asks permission; precision is low, max 10 s) **or** type a city (letters only, 2–80 characters).
2. The browser sends coordinates (4 decimals) or the city to `/api/psychiatrists/nearby`. The server rounds coordinates to ~110 m before anything leaves our server.
3. **With a Google key (current setup):**
   - City → found with Google; nonsense names are rejected ("We couldn't find that city…"). Aliases work (Gurgaon, Bombay).
   - Searches "psychiatrist" strictly inside a box of **5 km**, then **15 km**, then **30 km**, stopping once 5 psychiatry-confirmed places are found.
   - Keeps only: open businesses, with a rating and reviews, medical place types; drops pharmacies, salons, spas, gyms, stores. Same doctor listed twice → keep the one with more reviews.
   - **Ranking:** listings whose name/website clearly mention psychiatry/mental health first (badge "Psychiatry listed on Google"), then places with 5+ reviews, then a fair score (rating weighted by number of reviews, slight preference for closer places).
   - Long marketing names are cleaned ("Dr X | Best Psychiatrist in…" → "Dr X").
   - Each card: rank, name, rating + review count, distance, address, open now, buttons to Google Maps / website / phone.
4. **Without a Google key, or if Google fails:** OpenStreetMap (Nominatim for the city, Overpass for places within 15 km). Names and addresses only, **no ratings** — shows "Ratings unavailable — showing nearest instead."
5. Footer note: "Ratings come from Google reviews and aren't an endorsement by EaseMind" (or the OpenStreetMap version).
- **If the service is down:** "Couldn't load results" notice with the reason; no results → "No psychiatrists found nearby". Limit: 40 searches per visitor per day.

### Directory (placeholders) 🔒
- 6 **sample** listings from `src/data/psychologists.json`, clearly labelled "Sample listings — … placeholders, not real people." Names, credentials, registration and fees are **PLACEHOLDER — owner to verify**.
- Search (name, city, topic, language) and filters: City, Language, Mode (Online / In person), Fee per session (Any, Under ₹1,000, ₹1,000–₹2,000, Above ₹2,000). "Clear filters".
- `/psychologists/[id]` profile: title, qualifications, registration, languages, modes, fee, about, and an external **Visit / Book** link (opens the professional's own site — no in-app booking). Placeholder banner shown. Unknown id → 404.

## 8. `/progress` My progress
All from on-device data (no login needed today):
- **Mood, last 30 days** chart (empty state: "Check in on the home page…").
- **Days used**, **Avg. confidence change** (after − before, 0–10 scale), **Reframes done**, **Avg. intensity drop** (0–100 scale).
- Empty states link to `/confidence` and `/reframe`. Filmed clouds video behind. No AI.

## 9. `/help` Need help now
1. Headline "You're not alone. Talk to someone right now." — everything visible instantly (never animated in).
2. **In immediate danger? Call 112** panel.
3. Helpline cards with tap-to-call numbers: **Tele-MANAS** (14416, 1-800-891-4416) and **KIRAN** (1800-599-0019), hours 24×7.
4. Note: "Placeholder: these numbers are pending final verification by the EaseMind team." 🔒 (shown while any number has `verified: false` in `src/lib/safety.ts`).
5. **5-4-3-2-1 grounding** cards (see, touch, hear, smell, taste) with a breathing dot (in 4 · out 6).

No AI, no network needed beyond loading the page.

## 10. `/login`
- **Without Supabase keys (today):** "Accounts are coming soon" + link to manage data in Settings.
- **With Supabase keys:** email magic link ("Check your email") or **Continue with Google**. After sign-in Supabase returns to `/auth/callback`, which only redirects to same-site paths; a failed link shows "That sign-in link didn't work or has expired."
- ℹ️ Signing in does not yet sync any data to the cloud — everything stays on the device.

## 11. `/settings`
| Group | What it does |
|---|---|
| Profile | Name ("Used only to greet you. Stays on this device.") |
| Theme | Light / Dark / System |
| Sound | On/off for UI sounds |
| Privacy | **Save chat history** — off: chats vanish when the tab closes; on: kept on this device only. Turning it off deletes saved chats. |
| Your data | **Download my data (JSON)** — profile, moods, sessions, reframes, days, saved chat. **Delete my data** — two-step inline confirm, wipes EaseMind data on this device. |
| Account | Shows "using EaseMind without an account" or the signed-in email + Log out. |

## 12. `/about`
What EaseMind is and isn't (self-help, not therapy/medical/emergency), with an "is / isn't" comparison. No AI.

## 13. `/privacy` and `/terms` 🔒
Suggested headings only, with a visible **"PLACEHOLDER — owner will supply final text"** note. Not legal documents yet.

## 14. 404 page
Friendly "page not found" with Need help now? and links home.

## 15. What is saved on the device

| Browser key | Contents | Cleared by "Delete my data"? |
|---|---|---|
| `showup.profile` | name, 18+ confirmed, disclaimer time, reasons, save-chat setting | Yes |
| `showup.moods` | mood entries (1–5, optional note, date) | Yes |
| `showup.confidence` | sessions (situation, before, after, date) | Yes |
| `showup.reframes` | thought records | Yes |
| `showup.activeDays` | dates the app was used | Yes |
| `showup.chat.session` (sessionStorage) | this tab's chat (last 200 messages) | Yes |
| `showup.chat.saved` | saved chat, only if the user turned it on | Yes |
| `showup.voiceGuide`, `showup.sound`, `theme` | preferences | No (preferences only) |

ℹ️ Keys start with `showup.` because the app was first called "Show Up". Renaming them would make existing users lose their data, so they were kept.
