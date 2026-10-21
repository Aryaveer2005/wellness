"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";

/**
 * Number that counts up (GSAP, expo ease) when scrolled into view — or right
 * away with `immediate`. Shows the final value instantly when motion is reduced.
 */
export function CountUp({
  value,
  decimals = 0,
  signed = false,
  immediate = false,
  delay = 0,
  duration = 1.6,
  className,
  sounds = true,
}: {
  /** Play soft ticks while counting and a chime at the end (user can mute in Settings). */
  sounds?: boolean;
  value: number;
  decimals?: number;
  signed?: boolean;
  immediate?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion() || value === 0) {
        setShown(value);
        return;
      }
      const counter = { v: 0 };
      const step = Math.pow(10, -decimals);
      let lastShown = 0;
      setShown(0);
      gsap.to(counter, {
        v: value,
        duration,
        delay,
        ease: "expo.out",
        onUpdate: () => {
          setShown(counter.v);
          // soft tick each time the visible number changes
          const rounded = Math.round(counter.v / step);
          if (sounds && rounded !== lastShown) {
            lastShown = rounded;
            sound.tick(rounded);
          }
        },
        onComplete: () => {
          setShown(value);
          if (sounds) sound.complete();
        },
        scrollTrigger: immediate ? undefined : { trigger: ref.current, start: "top 92%", once: true },
      });
    },
    { dependencies: [value], revertOnUpdate: true }
  );

  const text = `${signed && shown > 0 ? "+" : ""}${shown.toFixed(decimals)}`;
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {text}
    </span>
  );
}
