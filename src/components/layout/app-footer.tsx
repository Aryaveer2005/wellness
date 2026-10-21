import Link from "next/link";
import { Lifebuoy } from "@/components/icons";
import { Logo } from "./logo";

const LINKS = [
  { href: "/home", label: "Home" },
  { href: "/confidence", label: "Confidence" },
  { href: "/reframe", label: "Reframe" },
  { href: "/chat", label: "Chat" },
  { href: "/psychologists", label: "Find a professional" },
  { href: "/progress", label: "My progress" },
];
const ABOUT = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/settings", label: "Settings" },
];

// Ink footer band (Warm Editorial). SAFETY: keep the disclaimer + crisis link visible on app pages.
export function AppFooter() {
  return (
    <footer className="band-ink dark mt-8 w-full">
      <div className="mx-auto max-w-6xl px-4 pb-32 pt-14 sm:px-6 sm:pt-20 md:pb-14">
        <div className="flex items-center gap-4" aria-hidden>
          <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,var(--ember))]" />
          <span className="text-[#F5EFEA]">
            <Logo />
          </span>
          <span className="h-px flex-1 bg-[linear-gradient(90deg,var(--ember),transparent)]" />
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-5">
            <p className="font-heading text-3xl leading-tight text-[#F5EFEA] sm:text-4xl">
              Confidence, <span className="italic text-ember">one breath</span> at a time.
            </p>
            <p className="max-w-md text-[0.9375rem] leading-relaxed text-[#ADA49D]">
              EaseMind is a self-help tool. It is not therapy, not a medical service, and not for emergencies. If you are in
              crisis, please get help now.
            </p>
            <Link
              href="/help"
              className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-crisis px-5 text-sm font-semibold text-crisis-foreground transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crisis"
            >
              <Lifebuoy className="size-[1.1rem]" aria-hidden /> Get help now
            </Link>
          </div>
          <FooterCol title="Tools" links={LINKS} />
          <FooterCol title="EaseMind" links={ABOUT} />
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-[13px] text-[#ADA49D] sm:flex-row sm:justify-between">
          <p>© EaseMind</p>
          <p>A self-help tool — not a substitute for professional care.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="mb-4 text-[15px] font-semibold text-[#F5EFEA]">{title}</p>
      <ul className="space-y-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex min-h-9 items-center text-[0.9375rem] text-[#D9D0C9] transition-colors hover:text-ember"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
