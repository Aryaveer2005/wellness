import Link from "next/link";
import { Lifebuoy, Phone, PhoneCall } from "@/components/icons";
import { EMERGENCY, HELPLINES } from "@/lib/safety";
import { cn } from "@/lib/utils";

// SAFETY: shown whenever crisis language is detected in chat. Never hide or weaken.
export function CrisisCard({ className }: { className?: string }) {
  return (
    <section
      role="alert"
      aria-labelledby="crisis-card-title"
      className={cn(
        "rounded-[1.75rem] border-2 border-crisis/50 bg-[color-mix(in_oklab,var(--crisis)_5%,var(--card))] p-4 shadow-[0_18px_44px_-24px_color-mix(in_oklab,var(--crisis)_55%,transparent)] sm:p-6",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-crisis text-crisis-foreground">
          <Lifebuoy className="size-6" weight="fill" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id="crisis-card-title" className="text-2xl leading-tight sm:text-[1.75rem]">
            You deserve support right now
          </h2>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            Free, confidential helplines — trained people, 24×7. You don&apos;t have to go through this alone.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {HELPLINES.map((h) => (
          <a
            key={h.id}
            href={`tel:${h.numbers[0].tel}`}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-crisis/70 bg-card px-3 text-center text-sm font-bold text-crisis transition-colors duration-300 hover:bg-crisis hover:text-crisis-foreground"
          >
            <Phone className="size-4 shrink-0" weight="fill" aria-hidden />
            {h.name} · {h.numbers[0].display}
          </a>
        ))}
        <a
          href={`tel:${EMERGENCY.numbers[0].tel}`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-crisis px-3 text-center text-sm font-bold text-crisis-foreground shadow-[0_10px_24px_-10px_var(--crisis)] transition hover:brightness-110 sm:col-span-2"
        >
          <PhoneCall className="size-4 shrink-0" weight="fill" aria-hidden />
          In immediate danger? Call {EMERGENCY.numbers[0].display}
        </a>
      </div>
      <Link
        href="/help"
        className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-crisis underline underline-offset-2"
      >
        See all helplines and a grounding exercise
      </Link>
    </section>
  );
}
