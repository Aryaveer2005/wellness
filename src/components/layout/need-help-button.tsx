import Link from "next/link";
import { Lifebuoy } from "@/components/icons";
import { cn } from "@/lib/utils";

// SAFETY: this button must stay visible on every app page. Never remove or hide it.
// Flat crisis-red pill (red is reserved for crisis/help only). Never wraps.
export function NeedHelpButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/help"
      aria-label="Need help now? Crisis helplines"
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-crisis px-3.5 text-[13px] font-semibold tracking-[-0.01em] text-crisis-foreground sm:h-11 sm:px-5 sm:text-sm",
        "transition duration-500 ease-[var(--ease-glass)] hover:brightness-110 active:scale-[0.97]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crisis",
        className
      )}
    >
      <Lifebuoy className="size-[1.15rem] shrink-0" aria-hidden />
      <span className={cn(compact && "sr-only sm:not-sr-only")}>Need help now?</span>
    </Link>
  );
}
