"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Animate on mount (hero) instead of when scrolled into view. */
  immediate?: boolean;
  delay?: number;
};

/**
 * Apple-style headline reveal: words rise out of a soft mask with depth,
 * one after another (GSAP SplitText). Plain static text when motion is reduced.
 */
export function SplitHeading({ children, as: Tag = "h2", className, immediate = false, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      let split: SplitText | null = null;
      // Wait for fonts so line/word measurements are correct.
      document.fonts.ready.then(() => {
        if (!ref.current) return;
        split = SplitText.create(el, { type: "words", mask: "words" });
        gsap.from(split.words, {
          yPercent: 110,
          rotateX: -45,
          autoAlpha: 0,
          transformPerspective: 800,
          transformOrigin: "50% 100%",
          duration: 1.25,
          ease: "expo.out",
          stagger: 0.06,
          delay,
          scrollTrigger: immediate ? undefined : { trigger: el, start: "top 90%", once: true },
        });
      });
      return () => split?.revert();
    },
    { scope: ref }
  );

  return (
    // @ts-expect-error — polymorphic ref on an intrinsic tag
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
