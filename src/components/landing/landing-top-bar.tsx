import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NeedHelpButton } from "@/components/layout/need-help-button";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/landing/wordmark";

const NAV = [
  { href: "/#tools", label: "Tools" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/psychologists", label: "Find a professional" },
  { href: "/about", label: "About" },
];

// Sticky editorial top bar for the landing page and 404 (they sit outside the app shell).
// SAFETY: the "Need help now?" button must stay visible here at every screen size.
export function LandingTopBar() {
  return (
    <header className="glass-bar sticky z-40 border-x-0 border-t-0" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        {/* Below 340px the wordmark shrinks so the crisis button always fits. */}
        <Wordmark className="max-[339px]:[&>span:first-child]:text-[1.3rem]" />
        <nav aria-label="Main" className="hidden items-center gap-7 text-[0.9375rem] font-medium lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-foreground/80 transition-colors hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <NeedHelpButton />
          <Button asChild size="sm" className="hidden h-10 px-5 sm:inline-flex">
            <Link href="/start">Start now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
