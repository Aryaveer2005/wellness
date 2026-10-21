import Link from "next/link";

/**
 * EaseMind wordmark: a small ink seal with a serif-italic "e" and an ember dot,
 * then "Ease" in confident grotesk + "Mind" in editorial serif.
 * `compactAtTablet` shows only the seal between md and lg, where the nav is tight.
 */
export function Logo({ href = "/home", compactAtTablet = false }: { href?: string; compactAtTablet?: boolean }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-11 items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      aria-label="EaseMind home"
    >
      <span
        aria-hidden
        className="relative grid size-8 shrink-0 place-items-center rounded-full bg-ink text-background transition-transform duration-700 ease-[var(--ease-calm)] group-hover:rotate-[-8deg]"
      >
        <span className="font-heading text-[1.35rem] italic leading-none -translate-y-[1px]">e</span>
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background bg-ember" />
      </span>
      <span
        className={`whitespace-nowrap text-[1.3rem] leading-none tracking-[-0.02em]${compactAtTablet ? " md:max-lg:sr-only" : ""}`}
      >
        <span className="font-sans font-semibold tracking-[-0.04em]">Ease</span>
        <span className="font-heading italic">Mind</span>
      </span>
    </Link>
  );
}
