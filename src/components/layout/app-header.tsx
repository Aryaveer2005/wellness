"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretDown } from "@/components/icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { NeedHelpButton } from "./need-help-button";
import { ThemeToggle } from "./theme-toggle";
import { primaryNav, moreNav } from "./nav-items";

/**
 * Editorial top bar (full width, like the reference): wordmark left, plain text
 * links centre, theme + red "Need help now?" right. The current page sits in a
 * black ink pill that glides between links (GSAP).
 */
export function AppHeader() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const moreActive = moreNav.some((i) => isActive(i.href));
  const navRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Glide the ink pill to the current link.
  useGSAP(
    () => {
      const nav = navRef.current;
      const pill = pillRef.current;
      if (!nav || !pill) return;
      const active = nav.querySelector<HTMLElement>("[data-active='true']");
      if (!active) {
        gsap.to(pill, { autoAlpha: 0, duration: 0.3 });
        return;
      }
      gsap.to(pill, {
        x: active.offsetLeft,
        width: active.offsetWidth,
        autoAlpha: 1,
        duration: prefersReducedMotion() ? 0 : 0.7,
        ease: "expo.out",
      });
    },
    { dependencies: [pathname], scope: navRef }
  );

  const linkClass = (active: boolean) =>
    cn(
      "relative z-[1] inline-flex h-10 items-center rounded-full px-3.5 text-[0.9375rem] font-medium tracking-[-0.01em] outline-none transition-colors duration-500 focus-visible:ring-3 focus-visible:ring-ring/50 lg:px-4",
      active ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"
    );

  return (
    <header
      className={cn(
        "glass-bar sticky z-40 border-x-0 border-t-0 transition-shadow duration-700",
        scrolled ? "shadow-[0_10px_30px_-24px_rgba(22,21,20,0.5)]" : "border-b-transparent"
      )}
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:h-[4.5rem] sm:gap-3 sm:px-6">
        <Logo compactAtTablet />
        <nav ref={navRef} className="relative hidden items-center md:flex" aria-label="Main">
          <span ref={pillRef} aria-hidden className="absolute left-0 top-0 h-full rounded-full bg-primary opacity-0" />
          {primaryNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                aria-current={active ? "page" : undefined}
                className={linkClass(active)}
              >
                {item.label}
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger data-active={moreActive} className={cn(linkClass(moreActive), "gap-1")}>
              More <CaretDown className="size-3.5" weight="bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={14} className="liquid-glass w-60 rounded-2xl border-0 p-1.5">
              {moreNav.map((item) => (
                <DropdownMenuItem key={item.href} asChild className="rounded-xl px-3 py-2.5">
                  <Link href={item.href} className="gap-3 text-[0.9375rem]">
                    <item.icon className="size-5 text-ember" /> {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <NeedHelpButton />
        </div>
      </div>
    </header>
  );
}
