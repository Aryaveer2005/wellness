"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  /** Delay between children marked with data-reveal. */
  stagger?: number;
  /** Depth of the 3D tilt-in (degrees). */
  tilt?: number;
  delay?: number;
  /** Animate on mount instead of on scroll (use for above-the-fold content). */
  immediate?: boolean;
};

/**
 * Scroll-driven 3D reveal: content rises out of depth (rotateX + translateZ + blur)
 * as it enters the viewport. Children with `data-reveal` animate in sequence;
 * without any, the whole block animates.
 */
export function Reveal3D({
  children,
  className,
  stagger = 0.08,
  tilt = 14,
  delay = 0,
  immediate = false,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const items = root.querySelectorAll<HTMLElement>("[data-reveal]");
      const targets = items.length ? Array.from(items) : [root];
      gsap.fromTo(
        targets,
        {
          autoAlpha: 0,
          y: 48,
          z: -120,
          rotateX: tilt,
          filter: "blur(10px)",
          transformPerspective: 1200,
          transformOrigin: "50% 100%",
        },
        {
          autoAlpha: 1,
          y: 0,
          z: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "expo.out",
          delay,
          stagger,
          clearProps: "filter,transform",
          scrollTrigger: immediate ? undefined : { trigger: root, start: "top 88%", once: true },
        }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={cn(className)} {...rest}>
      {children}
    </div>
  );
}
