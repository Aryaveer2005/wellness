"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DotsThree } from "@/components/icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { primaryNav, moreNav } from "./nav-items";

/** Clean floating dock for phones. Active tab: ember icon on a soft peach chip. */
export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const moreActive = moreNav.some((i) => isActive(i.href));
  const dockRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const dock = dockRef.current;
      const blob = blobRef.current;
      if (!dock || !blob) return;
      const active = dock.querySelector<HTMLElement>("[data-active='true']");
      if (!active) return void gsap.to(blob, { autoAlpha: 0, duration: 0.3 });
      gsap.to(blob, {
        x: active.offsetLeft,
        width: active.offsetWidth,
        autoAlpha: 1,
        duration: prefersReducedMotion() ? 0 : 0.6,
        ease: "expo.out",
      });
    },
    { dependencies: [pathname], scope: dockRef }
  );

  const itemClass = (active: boolean) =>
    cn(
      "relative z-[2] flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10.5px] font-medium tracking-[-0.005em] outline-none transition-colors duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 rounded-[1.25rem]",
      active ? "text-foreground" : "text-muted-foreground"
    );

  return (
    <nav
      aria-label="Main"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.6rem)" }}
    >
      <div
        ref={dockRef}
        className="glass-bar pointer-events-auto relative mx-auto flex max-w-md items-stretch rounded-[1.6rem] p-1.5 shadow-[0_18px_40px_-20px_rgba(22,21,20,0.45)]"
      >
        <span ref={blobRef} aria-hidden className="absolute left-0 top-1.5 bottom-1.5 z-[1] rounded-[1.25rem] bg-accent opacity-0" />
        {primaryNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} data-active={active} className={itemClass(active)} aria-current={active ? "page" : undefined}>
              <item.icon className={cn("size-6", active && "text-ember")} weight={active ? "fill" : "regular"} />
              {item.label}
            </Link>
          );
        })}
        <Sheet>
          <SheetTrigger data-active={moreActive} className={itemClass(moreActive)}>
            <DotsThree className={cn("size-6", moreActive && "text-ember")} weight="bold" />
            More
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[2rem] border-0 bg-background data-[side=bottom]:pb-[calc(env(safe-area-inset-bottom,0px)+1.75rem)]">
            <SheetHeader>
              <SheetTitle className="font-heading text-3xl font-normal tracking-[-0.01em]">More</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 px-4">
              {moreNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-base font-medium transition-colors",
                      active ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card hover:border-ember/40"
                    )}
                  >
                    <item.icon className={cn("size-6", !active && "text-ember")} weight="duotone" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
