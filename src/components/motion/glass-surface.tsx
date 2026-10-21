"use client";

import { forwardRef, useCallback, useRef } from "react";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  /** 3D tilt toward the pointer (desktop only). */
  tilt?: boolean;
  /** Hover makes the glass more transparent, lifts it and adds the sheen. */
  interactive?: boolean;
  /** Denser glass for text-heavy panels. */
  strong?: boolean;
};

/**
 * Liquid-glass panel. Tracks the pointer to move the specular sheen
 * (CSS vars --mx/--my) and, with `tilt`, leans gently in 3D.
 */
export const GlassSurface = forwardRef<HTMLDivElement, Props>(function GlassSurface(
  { className, tilt = false, interactive = true, strong = false, onPointerMove, onPointerLeave, children, ...rest },
  forwardedRef
) {
  const localRef = useRef<HTMLDivElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    const el = localRef.current;
    if (!el || !interactive) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    if (tilt && isFinePointer() && !prefersReducedMotion()) {
      gsap.to(el, {
        rotateY: (x - 0.5) * 7,
        rotateX: (0.5 - y) * 7,
        y: -4,
        transformPerspective: 900,
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  };

  const handleLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(e);
    const el = localRef.current;
    if (el && tilt) gsap.to(el, { rotateX: 0, rotateY: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.6)" });
  };

  return (
    <div
      ref={setRefs}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        "liquid-glass rounded-3xl",
        interactive && "liquid-glass-hover",
        strong && "liquid-glass-strong",
        tilt && "will-change-transform",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
