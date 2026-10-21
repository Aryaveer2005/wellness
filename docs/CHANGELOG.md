# Changelog — approved changes to the docs and scope

Newest first. One line per approved change. Format: `date — change — approved by`.

- 2026-10-21 — **Brand renamed "Show Up" → "EaseMind"** across app and docs (internal storage keys unchanged so saved data is kept). — approved by owner
- 2026-10-21 — **Redesign "Warm Editorial"** using rockethealth.app as design-language reference only (no content/assets copied): peach hero + photo collage, serif headlines (Instrument Serif), Hanken Grotesk body, Caveat accent, black pill buttons, periwinkle/blush bands, black footer. Replaces "Calm Liquid Glass". — approved by owner
- 2026-10-21 — **Real photography allowed** (Pexels, credited; adults, positive/neutral moments; never before/after, mirrors, hair close-ups). Replaces "abstract shapes only". — approved by owner ("realistic images")
- 2026-10-21 — **Suggested expression images are now photorealistic** (were line art): close-ups shown brows-to-chin so the hairline is out of view; verified seed pool; labelled "AI-generated photo · not a real person". — approved by owner ("realistic expression image generation")

- 2026-10-21 — **Google Places key added** (server-only) and "Top 5 near me" made precise: strict search area that widens 5→15→30 km, Google city geocoding (rejects nonsense, accepts aliases), psychiatry-confirmed listings first, duplicates merged, clean names, same-site + daily cap. — approved by owner (chat request)
- 2026-10-21 — **Voice mode (speech-to-speech) in /chat** using NVIDIA Parakeet speech-to-text + Chatterbox voice. Microphone allowed for this site only. — approved by owner ("activate the voice mode")
- 2026-10-21 — **Suggested expression made visible and precise**: appears as soon as a situation is picked; prompts + verified seed pool in `expression-prompts.json` (no head outlines/hair); server cache; 429 retry. — approved by owner ("make it more precise and accurate")

- 2026-10-20 — **NVIDIA AI enabled** (owner supplied keys): companion chat + reframer hints on Nemotron 3.5 Lightning, NemoGuard topic guard, FLUX.2 klein "suggested expression" illustrations, Chatterbox voice (Confidence voice guide + "Listen" on replies). Claude kept as optional fallback. New `docs/AI_CHATBOT.md`. — approved by owner (chat request)
- 2026-10-20 — **Exception to "no AI content"**: the labelled expression illustration and the voice guide only. Illustrations are locked to hair-free line art of facial features. — approved by owner (supplied image + voice APIs for this feature)
- 2026-10-20 — **Security hardening**: `server-only` modules for all secrets, same-origin checks + size caps on AI routes, site-wide security headers, keys redacted from logs. New packages: `server-only`, `@grpc/grpc-js`, `@grpc/proto-loader` (voice). — approved by owner ("follow the security parameters")

- 2026-10-20 — **Real filmed videos** (Pexels, free licence, no people, no AI) as calm backgrounds on landing, /home, /start, /confidence session, /progress. Sources in `public/videos/CREDITS.md`. Imagery rule updated to allow filmed nature footage. — approved by owner (chat request)
- 2026-10-20 — **Sound effects** for number count-ups and progress bars (code-generated tones, no audio files), with Settings → Sound on/off. — approved by owner (chat request)
- 2026-10-20 — **No AI-generated content** rule added to DESIGN.md (images, video, audio). — approved by owner
- 2026-10-20 — **Planned (not built): "suggested expression" image generation during the Confidence boost** — recorded in PROJECT_SPEC.md; waits for owner's API + spec. — noted by owner
- 2026-10-20 — **Fix:** text that faded almost to white after switching dark → light (landing privacy statement starts at 30% instead of 14% opacity). — reported by owner

- 2026-10-20 — **UI redesign "Calm Liquid Glass"** — liquid-glass surfaces (more transparent on hover), soft neumorphic controls, morphing aurora background, 3D scroll reveals. Full rules in new `docs/DESIGN.md`. — approved by owner (chat request)
- 2026-10-20 — **New libraries: gsap + @gsap/react** (animations, ScrollTrigger, SplitText) and **lenis** (smooth scrolling). framer-motion kept only for existing step transitions. — approved by owner (chat request)
- 2026-10-20 — **Icons: Phosphor Icons (duotone) replace lucide-react** everywhere, via `src/components/icons.tsx`. — approved by owner (asked for premium icons)
- 2026-10-20 — **Fonts: Apple system fonts** — SF Pro (headings/body) and New York (display accents) on Apple devices; Inter and Fraunces as fallbacks elsewhere (Apple fonts can't be web-hosted). Plus Jakarta Sans removed. — approved by owner (asked for Apple calm fonts)

- 2026-10-20 — **New feature: "Top 5 psychiatrists near me"** on `/psychologists`. Uses the user's location (asked with browser permission, never stored) or a typed city, and ranks nearby psychiatrists by Google rating and review count. — approved by owner (chat request)
- 2026-10-20 — **New external API: Google Places API (New)**, server-side only, key in `GOOGLE_PLACES_API_KEY`. Fallback when no key: OpenStreetMap (Nominatim + Overpass), which gives names/addresses but no ratings. — approved by owner (chat request)
- 2026-10-20 — **New libraries: three.js, @react-three/fiber, @react-three/drei** for a calm 3D hero on the landing page; **next-themes** for light/dark toggle. — approved by owner (chat request)
- 2026-10-20 — **Fonts:** kept Plus Jakarta Sans (headings) + Inter (body); added **Fraunces** (display serif) for hero accent words only. — approved by owner (asked for premium, eye-catching fonts)
- 2026-10-20 — **New file `PROJECT_STATUS.md`** — living status tracker every AI/agent must update after any change. — approved by owner
