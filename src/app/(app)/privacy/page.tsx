import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { ShieldCheck, Warning } from "@/components/icons";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How EaseMind handles your data. Placeholder — final text to be supplied.",
};

// PLACEHOLDER — owner will supply final text. Headings below are a suggested structure only.
const sections = [
  { h: "1. Who we are", p: "Who runs EaseMind and how to contact us about privacy." },
  { h: "2. What we collect", p: "What information the app stores, and what it never collects." },
  {
    h: "3. Data stored on your device",
    p: "Moods, confidence sessions, reframes and (optional) chat history are kept in your browser unless you create an account.",
  },
  { h: "4. Accounts (optional)", p: "What is stored if you sign in, and where." },
  {
    h: "5. AI Companion and AI hints",
    p: "How chat messages are sent to the AI provider to generate replies, and how long they are kept.",
  },
  { h: "6. Location (nearby psychiatrists)", p: "Location is used only for the search you request and is not stored." },
  { h: "7. Cookies and tracking", p: "EaseMind does not use analytics, ad trackers or third-party pixels." },
  { h: "8. Your rights", p: "Downloading and deleting your data (see Settings), and how to contact us." },
  { h: "9. Age", p: "EaseMind is for adults aged 18 and over." },
  { h: "10. Changes to this policy", p: "How we will tell you about updates." },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Legal" title="Privacy policy" />

      <div
        role="note"
        className="band-peach mb-10 flex items-start gap-3 rounded-3xl p-4 sm:p-5"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-ember">
          <Warning className="size-5" weight="fill" aria-hidden />
        </span>
        <p className="self-center text-sm font-semibold leading-relaxed">
          PLACEHOLDER — owner will supply final text. This page is not yet a legal policy.
        </p>
      </div>

      <article className="liquid-glass rounded-[2rem] p-6 sm:p-10">
        <Reveal3D className="flex max-w-prose flex-col" stagger={0.06} tilt={4}>
          <span data-reveal className="mb-8 grid size-12 place-items-center rounded-full bg-accent text-ember">
            <ShieldCheck className="size-6" aria-hidden />
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
