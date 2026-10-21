import Link from "next/link";
import { Lifebuoy } from "@/components/icons";

const COLUMNS = [
  {
    title: "Tools",
    links: [
      { href: "/confidence", label: "Confidence boost" },
      { href: "/reframe", label: "Thought reframer" },
      { href: "/chat", label: "AI companion" },
      { href: "/psychologists", label: "Find a professional" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/about", label: "About" },
      { href: "/#how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/help", label: "Need help now?" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

// SAFETY: disclaimer + crisis link must stay on the landing page (docs/SAFETY.md).
export function LandingFooter() {
  return (
    <>
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-5 rounded-3xl border border-border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-foreground">EaseMind is a self-help tool.</strong> It is not therapy,
              not a medical service, and not for emergencies. If you are in crisis or thinking of harming yourself,
              please contact a helpline right away.
            </p>
            <Link
              href="/help"
              className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full border border-crisis/40 px-5 text-[15px] font-semibold text-crisis transition-colors hover:bg-crisis/10 sm:self-auto"
            >
              <Lifebuoy className="size-5" aria-hidden /> Get help now
            </Link>
          </div>
        </div>
      </section>

      <footer className="band-ink pb-12 pt-16 sm:pt-20 dark:border-t dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <span aria-hidden className="h-px flex-1 bg-[linear-gradient(90deg,transparent,#E8673E)]" />
            <span className="font-heading text-3xl">
              Ease<span className="italic">Mind</span>
            </span>
            <span aria-hidden className="h-px flex-1 bg-[linear-gradient(90deg,#E8673E,transparent)]" />
          </div>
          <div className="mt-14 grid grid-cols-2 gap-10 min-[520px]:grid-cols-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <p className="col-span-full max-w-xs font-heading text-[2rem] leading-[1.1] md:col-span-1">
              A calmer mind, <span className="italic text-[#FF8F63]">one minute</span> at a time.
            </p>
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white">{col.title}</h4>
                <ul className="mt-4 space-y-3 text-[15px]">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={
                          l.href === "/help"
                            ? "font-semibold text-[#FF8A80] underline-offset-4 hover:underline"
                            : "text-white/70 transition-colors hover:text-white"
                        }
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 flex flex-col gap-2 border-t border-white/15 pt-6 text-[13px] text-white/60 sm:flex-row sm:justify-between">
            <p>Self-help tool — not therapy, not medical, not for emergencies.</p>
            <p>© {new Date().getFullYear()} EaseMind</p>
          </div>
        </div>
      </footer>
    </>
  );
}
