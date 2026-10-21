import Link from "next/link";
import { cn } from "@/lib/utils";

/** Editorial serif wordmark for the landing / 404 bars (the app shell keeps <Logo />). */
export function Wordmark({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} aria-label="EaseMind home" className={cn("inline-flex items-baseline gap-0.5 whitespace-nowrap", className)}>
      <span className="font-heading text-[1.6rem] leading-none tracking-[-0.02em]">
        Ease<span className="italic">Mind</span>
      </span>
      <span aria-hidden className="size-1.5 translate-y-[-0.1rem] rounded-full bg-ember" />
    </Link>
  );
}
