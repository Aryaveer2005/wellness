"use client";

import { useRef } from "react";
import { Coffee, Ear, Eye, Flower, Hand, type AppIcon } from "@/components/icons";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const grounding: { n: number; sense: string; icon: AppIcon }[] = [
  { n: 5, sense: "things you can see", icon: Eye },
  { n: 4, sense: "things you can touch", icon: Hand },
  { n: 3, sense: "things you can hear", icon: Ear },
  { n: 2, sense: "things you can smell", icon: Flower },
  { n: 1, sense: "thing you can taste", icon: Coffee },
];

/**
 * 5-4-3-2-1 grounding as a gentle editorial card stack. Cards settle in slowly,
 * one after another, and a soft dot breathes in 4 / out 6. Static when the
 * user prefers reduced motion.
 */
export function GroundingStack() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const cards = root.querySelectorAll<HTMLElement>("[data-ground-card]");
      const nums = root.querySelectorAll<HTMLElement>("[data-ground-num]");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
        defaults: { ease: "expo.out" },
      });
      tl.fromTo(
        cards,
        { autoAlpha: 0, y: 56, z: -160, rotateX: -18, scale: 0.94, transformPerspective: 1100, transformOrigin: "50% 0%" },
        { autoAlpha: 1, y: 0, z: 0, rotateX: 0, scale: 1, duration: 1.3, stagger: 0.32, clearProps: "transform" }
      ).fromTo(
        nums,
        { scale: 0.6, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.9, stagger: 0.32, ease: "elastic.out(1, 0.7)" },
        0.15
      );

      // Breathing cue: in for 4, out for 6.
      const dot = root.querySelector<HTMLElement>("[data-breath]");
      if (dot) {
        gsap
          .timeline({ repeat: -1 })
          .to(dot, { scale: 1.9, opacity: 0.35, duration: 4, ease: "sine.inOut" })
          .to(dot, { scale: 1, opacity: 1, duration: 6, ease: "sine.inOut" });
      }
    },
    { scope: ref }
  );

  return (
    <div ref={ref}>
      <p className="inline-flex items-center gap-3 rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground">
        <span aria-hidden className="relative grid size-3 place-items-center">
          <span data-breath className="absolute inset-0 rounded-full bg-ember/50" />
          <span className="relative size-2 rounded-full bg-ember" />
        </span>
        Breathe in for 4 · out for 6
      </p>

      <ol className="perspective-1200 mt-6 grid gap-3 sm:gap-4">
        {grounding.map(({ n, sense, icon: Icon }, i) => (
          <li
            key={n}
            data-ground-card
            className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 sm:gap-5 sm:p-5"
            style={{ marginInline: `${i * 0.35}rem` }}
          >
            <span
              data-ground-num
              className="grid size-14 shrink-0 place-items-center rounded-full border-[1.5px] border-ember font-display text-4xl leading-none text-ember"
            >
              {n}
            </span>
            <span className="flex-1 text-[1.0625rem] font-medium leading-snug sm:text-lg">
              {n} {sense}
            </span>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush text-ember">
              <Icon className="size-6" aria-hidden />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
