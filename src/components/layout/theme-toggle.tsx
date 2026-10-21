"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { MoonStars, Sun } from "@/components/icons";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const iconRef = useRef<HTMLSpanElement>(null);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
    if (iconRef.current && !prefersReducedMotion()) {
      gsap.fromTo(iconRef.current, { rotate: -90, scale: 0.6, autoAlpha: 0 }, { rotate: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: "expo.out" });
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground outline-none transition-[border-color,background-color] duration-500 hover:border-foreground/30 focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <span ref={iconRef} className="grid place-items-center">
        {isDark ? <Sun className="size-5" /> : <MoonStars className="size-5" />}
      </span>
    </button>
  );
}
