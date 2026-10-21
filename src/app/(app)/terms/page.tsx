import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { Scales, Warning } from "@/components/icons";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms for using EaseMind. Placeholder — final text to be supplied.",
};

// PLACEHOLDER — owner will supply final text. Headings below are a suggested structure only.
const sections = [
  { h: "1. About these terms", p: "Agreeing to these terms by using EaseMind." },
  { h: "2. Who can use EaseMind", p: "Adults aged 18 and over." },
  {
    h: "3. Not therapy, not medical advice",
    p: "EaseMind is a self-help tool. It is not therapy, not a medical service, and does not treat hair loss or recommend hair products.",
  },
  { h: "4. Not for emergencies", p: "If you are in crisis, contact a helpline or emergency services (see Need help now)." },
  { h: "5. The AI Companion", p: "AI replies can be wrong or incomplete and are not professional advice." },
  { h: "6. Psychologist directory", p: "Listings are for information only; bookings happen on the professional's own site." },
  { h: "7. Your account and content", p: "Your responsibilities when using the app." },
  { h: "8. Acceptable use", p: "What you agree not to do." },
  { h: "9. Limitation of liability", p: "To be supplied by the owner." },
  { h: "10. Changes and contact", p: "How these terms may change and how to reach us." },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Legal" title="Terms of use" />

      <div
        role="note"
        className="band-peach mb-10 flex items-start gap-3 rounded-3xl p-4 sm:p-5"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-ember">
          <Warning className="size-5" weight="fill" aria-hidden />
        </span>
        <p className="self-center text-sm font-semibold leading-relaxed">
          PLACEHOLDER — owner will supply final text. These are not yet the final terms.
        </p>
      </div>

      <article className="liquid-glass rounded-[2rem] p-6 sm:p-10">
        <Reveal3D className="flex max-w-prose flex-col" stagger={0.06} tilt={4}>
          <span data-reveal className="mb-8 grid size-12 place-items-center rounded-full bg-accent text-ember">
            <Scales className="size-6" aria-hidden />
          </span>
          {sections.map((s, i) => (
            <section
              key={s.h}
              data-reveal
              className={i > 0 ? "mt-7 border-t border-border pt-7" : undefined}
            >
              <h2 className="text-[1.75rem] leading-tight sm:text-[2rem]">{s.h}</h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">{s.p}</p>
            </section>
          ))}
        </Reveal3D>
      </article>
    </div>
  );
}
