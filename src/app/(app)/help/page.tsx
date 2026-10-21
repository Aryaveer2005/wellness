import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HandHeart, Lifebuoy, PhoneCall, ShieldWarning } from "@/components/icons";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { EMERGENCY, HELPLINES } from "@/lib/safety";
import { GroundingStack } from "./grounding-stack";

// SAFETY (CLAUDE.md rule 5): never remove or weaken this page, its numbers or tap-to-call buttons.
// Call buttons and numbers are deliberately NOT hidden behind any entrance animation.

export const metadata: Metadata = {
  title: "Need help now",
  description: "Free, confidential helplines in India, available 24×7. You are not alone.",
};

/** Crisis-tinted editorial card (red is allowed on this page only). */
const crisisGlass =
  "border border-crisis/20 bg-[color-mix(in_oklab,var(--crisis)_6%,var(--card))] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_24px_50px_-28px_color-mix(in_oklab,var(--crisis)_45%,transparent)]";

export default function HelpPage() {
  const anyUnverified = [...HELPLINES, EMERGENCY].some((h) => !h.verified);
  const emergency = EMERGENCY.numbers[0];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 sm:gap-16">
      {/* Hero — headline + immediate-danger call, all visible instantly */}
      <section aria-labelledby="help-title" className={`${crisisGlass} overflow-hidden rounded-[2rem] p-6 sm:rounded-[2.5rem] sm:p-10`}>
        <div>
          <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-crisis">
            <span className="grid size-9 place-items-center rounded-full bg-crisis/12 text-crisis">
              <Lifebuoy className="size-5" aria-hidden />
            </span>
            Need help now
          </p>
          <SplitHeading
            as="h1"
            immediate
            className="mt-5 text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl"
          >
            <span id="help-title">
              You&apos;re not alone. Talk to someone{" "}
              <span className="italic text-crisis">right now.</span>
            </span>
          </SplitHeading>
          <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-muted-foreground sm:text-xl">
            If things feel too heavy right now, please talk to someone. These helplines are free, confidential, and
            answered by trained people — you don&apos;t need to explain everything perfectly. Just call.
          </p>

          {/* Immediate danger */}
          <div
            role="region"
            aria-labelledby="danger-heading"
            className="mt-8 rounded-[1.75rem] border border-crisis/25 bg-card p-5 sm:p-7"
          >
            <div className="flex items-start gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-crisis text-crisis-foreground">
                <ShieldWarning className="size-6" weight="fill" aria-hidden />
              </span>
              <div className="flex-1">
                <h2 id="danger-heading" className="text-[1.75rem] leading-tight sm:text-[2.25rem]">
                  In immediate danger? Call {emergency.display}
                </h2>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  If you might act on thoughts of hurting yourself, or someone else is in danger, call emergency
                  services now or go to the nearest hospital.
                </p>
              </div>
            </div>
            <a
              href={`tel:${emergency.tel}`}
              className="mt-5 flex min-h-16 w-full items-center justify-center gap-2.5 rounded-full bg-crisis px-5 text-lg font-semibold whitespace-nowrap sm:gap-3 sm:px-6 sm:text-xl tracking-[-0.01em] text-crisis-foreground shadow-[0_14px_34px_-14px_color-mix(in_oklab,var(--crisis)_75%,transparent)] transition duration-500 ease-[var(--ease-glass)] hover:brightness-110 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crisis"
            >
              <PhoneCall className="size-6" weight="fill" aria-hidden />
              <span>
                Call <span className="tabular-nums">{emergency.display}</span> — Emergency
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Helplines */}
      <section aria-labelledby="helplines-heading">
        <h2 id="helplines-heading" className="text-4xl leading-[1.05] sm:text-5xl">
          Talk to someone now
        </h2>
        <p className="mt-2 text-[0.9375rem] text-muted-foreground">Free and confidential. Tap a number to call.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5">
          {HELPLINES.map((h) => (
            <div key={h.id} className={`${crisisGlass} flex flex-col rounded-[1.75rem] p-5 sm:p-6`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[1.75rem] leading-tight">{h.name}</h3>
                <span className="shrink-0 rounded-full bg-crisis/10 px-3 py-1 text-xs font-semibold text-crisis">
                  {h.hours}
                </span>
              </div>
              <p className="mt-2 mb-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {h.description}
              </p>
              <div className="mt-auto flex flex-col gap-2.5">
                {h.numbers.map((num) => (
                  <a
                    key={num.tel}
                    href={`tel:${num.tel}`}
                    aria-label={`Call ${h.name} on ${num.display}`}
                    className="group flex min-h-16 items-center gap-3 rounded-full border-2 border-crisis/70 bg-card py-2 pr-4 pl-2 text-crisis transition sm:pr-6 duration-500 ease-[var(--ease-glass)] hover:border-crisis hover:bg-crisis hover:text-crisis-foreground active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crisis"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-crisis text-crisis-foreground transition duration-500 group-hover:bg-crisis-foreground group-hover:text-crisis">
                      <PhoneCall className="size-6" weight="fill" aria-hidden />
                    </span>
                    <span className="flex-1 text-center text-[1.3rem] font-semibold whitespace-nowrap tracking-[-0.01em] tabular-nums min-[400px]:text-2xl">
                      {num.display}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        {anyUnverified && (
          <p className="mt-4 text-xs text-muted-foreground">
            {/* PLACEHOLDER — owner to verify every number in src/lib/safety.ts, then set verified: true */}
            Placeholder: these numbers are pending final verification by the EaseMind team.
          </p>
        )}
      </section>

      {/* Grounding exercise */}
      <section aria-labelledby="grounding-heading" className="band-periwinkle rounded-[2rem] p-6 sm:rounded-[2.5rem] sm:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">While you wait</p>
          <h2 id="grounding-heading" className="mt-2 text-4xl leading-[1.05] sm:text-5xl">
            A 5-4-3-2-1 grounding exercise
          </h2>
          <p className="mt-2 mb-6 max-w-prose text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
            Breathe slowly. In through your nose for 4, out through your mouth for 6. Then, without rushing, notice:
          </p>
          <GroundingStack />
          <p className="mt-6 max-w-prose text-[0.9375rem] leading-relaxed text-muted-foreground">
            This won&apos;t fix everything — it just helps your body come down a notch so you can take the next step.
          </p>
        </div>
      </section>

      {/* Not alone */}
      <Reveal3D tilt={6}>
        <section className="band-blush rounded-[2rem] p-6 sm:rounded-[2.5rem] sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-card text-ember">
              <HandHeart className="size-7" aria-hidden />
            </span>
            <div>
              <h2 className="text-[2rem] leading-[1.05] sm:text-[2.5rem]">
                Reaching out is <span className="italic text-ember">strength</span>, not weakness
              </h2>
              <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
                Many men feel they have to handle everything alone. You don&apos;t. Tell one person you trust how
                you&apos;re really doing — a friend, a brother, a parent, anyone. A short message is enough:
              </p>
              <p className="mt-4 font-display text-2xl italic text-foreground sm:text-3xl">
                &ldquo;I&apos;m not okay. Can we talk?&rdquo;
              </p>
              <Link
                href="/psychologists"
                className="mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-[0.9375rem] font-medium text-primary-foreground transition hover:bg-[color-mix(in_oklab,var(--primary)_88%,var(--ember))]"
              >
                Find a psychologist for ongoing support <ArrowRight className="size-4" weight="bold" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </Reveal3D>

      <p className="text-xs leading-relaxed text-muted-foreground">
        EaseMind is a self-help app and cannot respond to emergencies. If you are outside India, please contact your
        local emergency number.
      </p>
    </div>
  );
}
