# EaseMind — Design System v3 ("Warm Editorial")

> Approved by the owner 2026-10-21 (see `docs/CHANGELOG.md`). Brand renamed **Show Up → EaseMind**.
> Reference for *design language only*: rockethealth.app (warm gradient hero, real photography, serif headlines, black pill buttons, flat editorial bands). **Never copy their text, logo, illustrations, photos or claims.** Safety rules (`CLAUDE.md`, `docs/SAFETY.md`) beat everything here.

## 1. Feeling
Warm, human, editorial, judgement-free — a modern Indian health brand that feels like a magazine, not an app template. Real people, real light, generous white space, confident serif type. Calm, never clinical, never cheesy.

## 2. Typography
| Role | Font | Rules |
|---|---|---|
| Headlines (`h1–h3`, `font-heading`, `font-display`) | **Instrument Serif** (400 + italic) | Never bold (only one weight — don't use `font-semibold`/`font-bold` on serif). Big and airy: page title `text-[2.75rem] sm:text-6xl lg:text-7xl leading-[1.02]`; section title `text-4xl sm:text-5xl`. Italic for one accent phrase. |
| Body / UI (`font-sans`) | **Hanken Grotesk** | 15–18px, `leading-relaxed`. Labels/buttons `font-medium`. Small caps eyebrow: `text-xs font-semibold uppercase tracking-[0.18em]`. |
| Script accent (`font-script`) | **Caveat** | At most ONE handwritten word per page (e.g. hero), optionally with `.scribble-underline`. |

## 3. Colour (tokens in `src/app/globals.css`)
| Token | Light | Use |
|---|---|---|
| `ink` / `primary` | #161514 | Text, **black pill buttons** (primary CTA) |
| `background` | #FFFCFA | Page |
| `peach` → `peach-deep`, `.band-peach` | #FFD9C2 → #FF8F63 gradient | Hero band, one feature band |
| `periwinkle`, `.band-periwinkle` | #E8EEFB | "How it works"-style bands |
| `blush`, `.band-blush` / `muted` | #F7F0EE | Soft sections, inputs |
| `ember` (= legacy `amber`) | #E8673E | Accent words, confidence moments, icons, focus ring |
| `slate` | #33464F | Secondary dark text |
| `.band-ink` | #121110 | Footer |
| `crisis` | #B3261E | **Crisis / help ONLY** — never for decoration or errors |

Dark mode: every token has a dark value — always check both themes.

## 4. Layout & components
- **Full-width bands** alternate: peach hero → white → periwinkle → white → blush → photo band → ink footer. Content max-width `max-w-6xl`, generous padding `py-20 sm:py-28`.
- **Buttons:** primary = black pill (`<Button>` default), secondary = outline pill, accent = `variant="amber"` (ember). Height 44–52px.
- **Cards:** the `liquid-glass` / `<GlassSurface>` / `<Card>` classes now render as clean white cards (hairline border, soft shadow, gentle hover lift). Radii `rounded-3xl`. No glass blur except the sticky header/dock (`.glass-bar`).
- **Photo collage:** 2–3 overlapping rectangular photos (no blobs), slight offsets, like an editorial spread.
- **Icon row:** Phosphor duotone icons in ember, 40–48px, with serif titles and short grotesk text.
- **Inputs:** pill-shaped, blush fill.
- **Footer:** ink band, serif tagline, link columns, disclaimer + crisis link.
- Retired: aurora backgrounds, rainbow gradients, glass sheen.

## 5. Imagery
- **Real photography** (Pexels, free licence, credits in `public/images/CREDITS.md`) of adults in India in calm, confident, everyday moments: friends, work, outdoors, reflection, conversation. Natural light, warm tones.
- **Never:** before/after, mirrors, hair close-ups, hair products, anyone mocked, "sad man holding head" clichés, logos/brands, children.
- Real filmed nature video (`public/videos/`) stays for immersive moments (Confidence session, voice mode).
- **Suggested expression** images are AI-generated (FLUX.2 klein), photorealistic close-ups, always displayed brows-to-chin (hairline out of view) and labelled "AI-generated photo · not a real person · not saved". No other AI imagery.

## 6. Icons
Only `@/components/icons` (Phosphor, duotone default). `weight="fill"` for active states.

## 7. Motion
GSAP + Lenis (`@/components/motion/*`, `@/lib/gsap`): `SplitHeading` for serif titles, `Reveal3D` for card rows (keep tilt small, ≤ 8° — this design is calmer), `Parallax` on photos (gentle), `Magnetic` on the hero CTA. Always respect reduced motion.

## 8. Responsive
Designed at **360 / 768 / 1280+**. Photo collages collapse to one photo or 2-up on phones. No horizontal scroll. Tap targets ≥ 44px. Mobile bottom dock stays; leave `pb-32`.

## 9. Sound & voice
Quiet code-generated UI sounds (`@/lib/sound`) with Settings → Sound switch; voice guide, Listen and voice mode via NVIDIA (see `docs/AI_CHATBOT.md`). Never add sound to crisis elements.

## 10. Photo slots (files in `public/images/`)
| File | Used for |
|---|---|
| `hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg` | Landing hero collage (portrait-orientation) |
| `tool-confidence.jpg`, `tool-reframe.jpg`, `tool-chat.jpg`, `tool-psychologist.jpg` | 4 tall photo cards ("Your wellbeing, in your hands") |
| `band-support.jpg` | Wide photo in the "talk to a professional" band |
| `about.jpg` | About page |
| `home.jpg` | /home greeting card |

Each slot: JPEG, ~1600px long side, < 350 KB, credited in `public/images/CREDITS.md`.
