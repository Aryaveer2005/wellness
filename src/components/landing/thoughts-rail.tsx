"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

// NOT testimonials: these are common thoughts written by the EaseMind team so a
// visitor can recognise himself. Keep the label + note that says so.
const THOUGHTS = [
  "I check the angle of every photo before anyone is allowed to post it.",
  "Before a meeting, I'm thinking about my hairline instead of my points.",
  "My friends joke about it. I laugh along — but it stays with me for days.",
  "I've started skipping plans and telling myself I'm just busy.",
  "It's not a big deal, I tell myself. So why do I think about it so much?",
];

const arrowBtn =
  "hidden size-11 shrink-0 place-items-center rounded-full border border-foreground/20 transition-colors hover:bg-white/30 sm:grid dark:hover:bg-white/5";

export function ThoughtsRail() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setActive(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const go = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = (i + THOUGHTS.length) % THOUGHTS.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 sm:pb-20">
      <div className="flex items-center gap-5">
        <h2 className="text-[1.75rem] sm:text-3xl">Thoughts you might recognise</h2>
        <span aria-hidden className="hidden h-px flex-1 bg-foreground/25 sm:block" />
      </div>
      <p className="mt-2 text-[13px] text-foreground/70">
        Common thoughts, written by us from what many men describe — not reviews or quotes from real users.
      </p>

      <div className="mt-8 flex items-center gap-3 sm:gap-6">
        <button type="button" onClick={() => go(active - 1)} aria-label="Previous thought" className={arrowBtn}>
          <ArrowLeft className="size-5" />
        </button>
        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Thoughts you might recognise"
          data-lenis-prevent-wheel
          className="no-scrollbar flex min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {THOUGHTS.map((t, i) => (
            <figure
              key={t}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${THOUGHTS.length}`}
              className="w-full shrink-0 snap-center px-1"
            >
              <blockquote className="mx-auto flex max-w-3xl gap-3 sm:gap-5">
                <span aria-hidden className="font-heading text-6xl leading-[0.8] text-ember sm:text-7xl">
                  &ldquo;
                </span>
                <p className="font-heading text-[1.6rem] leading-[1.2] sm:text-[2.1rem]">{t}</p>
              </blockquote>
            </figure>
          ))}
        </div>
        <button type="button" onClick={() => go(active + 1)} aria-label="Next thought" className={arrowBtn}>
          <ArrowRight className="size-5" />
        </button>
      </div>

      <div className="mt-8 flex justify-center gap-1">
        {THOUGHTS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show thought ${i + 1}`}
            aria-current={i === active}
            className="grid size-7 place-items-center"
          >
            <span
              className={cn(
                "block h-2 rounded-full transition-all duration-500",
                i === active ? "w-6 bg-foreground" : "w-2 bg-foreground/30"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
