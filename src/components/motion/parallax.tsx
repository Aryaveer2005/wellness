"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Scroll-linked depth: drifts (and optionally tilts / scales in 3D) while the
 * element passes through the viewport. speed > 0 moves slower than the page.
 */
export function Parallax({
  children,
  speed = 0.2,
  rotate = 0,
  scale = 0,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  rotate?: number;
  scale?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el,
        { yPercent: speed * 40, rotateX: rotate, scale: 1 - scale, transformPerspective: 1200 },
        {
          yPercent: -speed * 40,
          rotateX: -rotate,
          scale: 1 + scale,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
        }
      );
    },
    { scope: ref }
  );
  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
