import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Brain, ChatCircleDots, Check, Quotes, Sparkle, Stethoscope, X } from "@/components/icons";
import { PageHeader } from "@/components/layout/page-header";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { Parallax } from "@/components/motion/parallax";

export const metadata: Metadata = {
  title: "About",
  description: "What EaseMind is — and what it isn't. A private self-help tool for men dealing with hair loss.",
};

const is = [
  "A private, judgement-free self-help tool",
  "Short, practical exercises you can use in the moment",
  "Built on ideas from CBT (Cognitive Behavioural Therapy)",
  "Usable without an account — your data stays on your device",
];

const isNot = [
  "Not therapy, and not a replacement for a psychologist",
  "Not a medical service — no diagnosis or medication advice",
  "Not a hair-loss treatment — we don't recommend or sell any hair products",
  "Not for emergencies — if you're in crisis, use the Need help now page",
];

const tools = [
  { href: "/confidence", label: "60-Second Confidence Builder", icon: Sparkle, text: "Breathing, posture and focus before a date, interview or meeting." },
  { href: "/reframe", label: "Thought Reframer", icon: Brain, text: "A step-by-step CBT thought record to untangle a negative thought." },
  { href: "/chat", label: "AI Companion", icon: ChatCircleDots, text: "Talk things through, any time. Not a therapist — a steady listener." },
  { href: "/psychologists", label: "Find a psychologist", icon: Stethoscope, text: "When you want real, ongoing support from a professional." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 sm:gap-24">
      <PageHeader
        className="mb-0 sm:mb-0"
        eyebrow="About"
        title={
          <>
            Confidence isn&apos;t about your hair.{" "}
            <span className="italic text-ember">It&apos;s about showing up.</span>
          </>
        }
        description="EaseMind helps men dealing with hair loss rebuild self-confidence and manage the stress and anxiety that can come with it — quietly, privately, on your phone."
      />

      {/* Editorial photo — blush frame; if the image is missing, the blush block simply shows. */}
      <Reveal3D tilt={0}>
        <figure className="band-blush relative -mt-4 overflow-hidden rounded-[2rem] p-2.5 sm:-mt-8 sm:rounded-[2.5rem] sm:p-3">
          <div
            role="img"
            aria-label="Two friends sitting on the grass in a park, laughing together"
            className="aspect-[4/3] w-full rounded-[1.6rem] bg-blush bg-cover bg-center sm:aspect-[16/9] sm:rounded-[2rem]"
            style={{ backgroundImage: "url(/images/about.jpg)" }}
          />
        </figure>
      </Reveal3D>

      {/* Pull-quote */}
      <Parallax speed={0.12} rotate={6}>
        <figure className="relative mx-auto max-w-2xl text-center">
          <Quotes className="mx-auto size-10 text-ember" weight="duotone" aria-hidden />
          <blockquote className="mt-4 font-display text-[2.25rem] leading-[1.1] text-balance sm:text-6xl">
            Quietly. Privately. <span className="italic text-ember">On your phone.</span>
          </blockquote>
        </figure>
      </Parallax>

      {/* Is / isn't */}
      <section aria-labelledby="is-heading">
        <SplitHeading as="h2" className="text-4xl leading-[1.05] sm:text-5xl">
          <span id="is-heading">What it is — and what it isn&apos;t</span>
        </SplitHeading>
        <Reveal3D className="perspective-1200 mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5" stagger={0.12} tilt={6}>
          <div data-reveal className="band-periwinkle rounded-[2rem] p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">EaseMind is</p>
              <ul className="mt-5 flex flex-col gap-4">
                {is.map((t) => (
                  <li key={t} className="flex gap-3 text-[0.9375rem] leading-relaxed sm:text-base">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ember text-amber-foreground">
                      <Check className="size-3.5" weight="bold" aria-hidden />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div data-reveal className="rounded-[2rem] border border-border bg-card p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">It isn&apos;t</p>
              <ul className="mt-5 flex flex-col gap-4">
                {isNot.map((t) => (
                  <li key={t} className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
                      <X className="size-3.5" weight="bold" aria-hidden />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal3D>
      </section>

      {/* Tools */}
      <section aria-labelledby="tools-heading">
        <SplitHeading as="h2" className="text-4xl leading-[1.05] sm:text-5xl">
          <span id="tools-heading">The tools</span>
        </SplitHeading>
        <Reveal3D className="perspective-1200 mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4" tilt={6}>
          {tools.map(({ href, label, icon: Icon, text }) => (
            <Link
              key={href}
              href={href}
              data-reveal
              className="liquid-glass liquid-glass-hover group flex gap-4 rounded-3xl p-5 sm:p-6"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-ember">
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="flex items-center justify-between gap-2 font-heading text-[1.5rem] leading-tight">
                  {label}
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ember"
                    weight="bold"
                    aria-hidden
                  />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{text}</span>
              </span>
            </Link>
          ))}
        </Reveal3D>
      </section>

      {/* Who it's for */}
      <Reveal3D tilt={6}>
        <section className="band-blush rounded-[2rem] p-6 sm:rounded-[2.5rem] sm:p-10">
          <div className="max-w-prose">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Who it&apos;s for</p>
            <p className="mt-4 text-[1.0625rem] leading-relaxed sm:text-lg">
              Adults (18+) who are experiencing hair loss — thinning, a receding hairline, bald patches or baldness —
              and feel it&apos;s affecting their confidence, mood, dating or work life. If you&apos;re struggling a
              lot, EaseMind can help you take the first step towards talking to a professional.
            </p>
            <p className="mt-5 text-[0.9375rem]">
              In crisis?{" "}
              <Link href="/help" className="font-semibold text-crisis underline underline-offset-4">
                Get help now
              </Link>
              .
            </p>
          </div>
        </section>
      </Reveal3D>
    </div>
  );
}
