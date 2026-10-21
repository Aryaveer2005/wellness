"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Brain, CaretDown, Trash } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GlassSurface } from "@/components/motion/glass-surface";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { DeviceNote } from "@/components/tools/device-note";
import { ReframeSummary } from "@/components/tools/reframe-summary";
import { useStoreValue } from "@/hooks/use-store";
import { store } from "@/lib/local-store";
import { cn } from "@/lib/utils";

const getReframes = () => store.getReframes();

export function ReframeHistory() {
  const reduce = useReducedMotion();
  const raw = useStoreValue(getReframes, []);
  const list = useMemo(() => [...raw].sort((a, b) => b.date.localeCompare(a.date)), [raw]);
  const [open, setOpen] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-32 md:pb-12">
      <DeviceNote />
      {list.length === 0 ? (
        <Reveal3D immediate delay={0.2}>
          <GlassSurface interactive={false} className="band-blush flex flex-col items-center gap-5 rounded-[2rem] border-transparent px-6 py-14 text-center shadow-none sm:px-10">
            <span className="relative z-[2] grid size-14 place-items-center rounded-full bg-card text-ember">
              <Brain className="size-7" />
            </span>
            <div className="relative z-[2] space-y-2">
              <p className="font-heading text-4xl">No reframes yet</p>
              <p className="max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
                When a harsh thought sticks around, walk through it here. It takes about 5 minutes.
              </p>
            </div>
            <Button asChild size="lg" className="relative z-[2]">
              <Link href="/reframe">
                Reframe a thought <ArrowRight weight="bold" />
              </Link>
            </Button>
          </GlassSurface>
        </Reveal3D>
      ) : (
        <Reveal3D stagger={0.08}>
          <ul className="space-y-3">
            {list.map((r) => {
              const isOpen = open === r.id;
              return (
                <li
                  key={r.id}
                  data-reveal
                  className={cn(
                    "liquid-glass overflow-hidden rounded-[1.75rem]",
                    !isOpen && "liquid-glass-hover"
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => {
                      setOpen(isOpen ? null : r.id);
                      setConfirming(null);
                    }}
                    className="relative z-[2] flex min-h-11 w-full items-start gap-4 p-5 text-left outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50 sm:p-6"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground">
                        <span>
                          {new Date(r.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span aria-hidden>·</span>
                        <span>
                          {r.emotion}{" "}
                          <span className="tabular-nums">{r.intensityBefore}</span> →{" "}
                          <span className="font-semibold tabular-nums text-ember">{r.intensityAfter}</span>
                        </span>
                      </p>
                      <p className={cn("font-heading text-2xl italic leading-snug", !isOpen && "line-clamp-2")}>
                        {r.balancedThought}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full border border-border text-foreground transition-[transform,background-color,color] duration-500 ease-[var(--ease-glass)]",
                        isOpen && "rotate-180 border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      <CaretDown className="size-4" weight="bold" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0, filter: "blur(6px)" }}
                        animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0, filter: "blur(6px)" }}
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                        className="relative z-[2] overflow-hidden"
                      >
                        <div className="space-y-4 px-3 pb-5 sm:px-5">
                          <ReframeSummary record={r} className="bg-background shadow-none" />
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {confirming === r.id ? (
                              <>
                                <span className="text-sm text-muted-foreground">Delete this reframe for good?</span>
                                <Button variant="ghost" onClick={() => setConfirming(null)}>
                                  Keep it
                                </Button>
                                <Button variant="outline" onClick={() => {
                                  store.deleteReframe(r.id);
                                  setConfirming(null);
                                  setOpen(null);
                                }}>
                                  Yes, delete
                                </Button>
                              </>
                            ) : (
                              <Button variant="ghost" className="text-muted-foreground" onClick={() => setConfirming(r.id)}>
                                <Trash /> Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal3D>
      )}
    </div>
  );
}
