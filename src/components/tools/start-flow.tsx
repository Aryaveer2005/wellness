"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MoodPicker, controlClass, EASE_EXPO, type MoodValue } from "@/components/tools/mood-check-in";
import { GlassSurface } from "@/components/motion/glass-surface";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { Magnetic } from "@/components/motion/magnetic";
import { scrollToTop } from "@/components/motion/smooth-scroll";
import { store } from "@/lib/local-store";
import { useProgressSound } from "@/hooks/use-progress-sound";
import { cn } from "@/lib/utils";

const REASONS = [
  "Dating nerves",
  "Work & interviews",
  "Social situations",
  "Mirror anxiety",
  "Stress about the future",
  "Feeling alone with it",
];

const STEPS = ["Before we begin", "What brings you here?", "Quick check-in"];

const stepTitle = "text-[2.5rem] leading-[1.02] sm:text-6xl";

export function StartFlow() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  useProgressSound(step, STEPS.length - 1);
  const [dir, setDir] = useState(1);
  const [adult, setAdult] = useState(false);
  const [disclaimer, setDisclaimer] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [mood, setMood] = useState<MoodValue | null>(null);

  const canNext = step === 0 ? adult && disclaimer : step === 1 ? reasons.length >= 1 : mood !== null;

  function go(delta: number) {
    setDir(delta);
    setStep((s) => s + delta);
    scrollToTop();
  }

  function toggleReason(r: string) {
    setReasons((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : cur.length >= 3 ? cur : [...cur, r]));
  }

  function finish() {
    if (!mood) return;
    store.setProfile({ confirmedAdult: true, acceptedDisclaimerAt: new Date().toISOString(), reasons });
    store.addMood({ mood });
    router.push("/home");
  }

  // Calm depth transition: the old step sinks back and blurs, the new one rises forward.
  const variants = {
    enter: (d: number) =>
      reduce ? { opacity: 0 } : { opacity: 0, x: d * 40, scale: 0.97, filter: "blur(10px)" },
    center: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
    exit: (d: number) =>
      reduce ? { opacity: 0 } : { opacity: 0, x: d * -28, scale: 0.98, filter: "blur(8px)" },
  };

  return (
    <div className="band-peach -mx-4 -mt-8 px-4 py-10 sm:mx-0 sm:mt-0 sm:rounded-[2.5rem] sm:px-8 sm:py-16">
    <div className="mx-auto w-full max-w-2xl">
      <Reveal3D immediate tilt={0} className="mb-8 flex flex-col items-center gap-5 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-75">Quick start</p>
        <StepIndicator step={step} reduce={!!reduce} />
      </Reveal3D>

      <Reveal3D immediate delay={0.1} tilt={10}>
        <GlassSurface interactive={false} className="overflow-hidden rounded-[2rem] border-transparent p-6 shadow-[0_30px_60px_-30px_rgba(74,36,20,0.45)] sm:p-10">
          <div className="relative z-[2]">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={step}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduce ? 0.2 : 0.75, ease: EASE_EXPO }}
              >
                {step === 0 && (
                  <div className="space-y-7">
                    <div className="space-y-3">
                      <span className="mb-2 grid size-12 place-items-center rounded-full bg-accent text-ember">
                        <ShieldCheck className="size-7" />
                      </span>
                      <h1 className={stepTitle}>
                        Welcome. This is <span className="italic text-ember">your</span> space.
                      </h1>
                      <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
                        Private, judgement-free, and quick. Two things before we start.
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] bg-blush p-4 text-[15px] leading-relaxed sm:p-5">
                      <p>
                        EaseMind is a <strong>self-help tool</strong>. It is not therapy, not a medical service, and not
                        for emergencies. If you&apos;re in crisis or thinking about harming yourself, please{" "}
                        <Link href="/help" className="font-semibold text-crisis underline underline-offset-4">
                          get help now
                        </Link>
                        .
                      </p>
                    </div>
                    <div className="space-y-3">
                      <CheckRow id="adult" checked={adult} onChange={setAdult}>
                        I&apos;m 18 or older
                      </CheckRow>
                      <CheckRow id="disclaimer" checked={disclaimer} onChange={setDisclaimer}>
                        I understand EaseMind is a self-help tool, not therapy or medical care
                      </CheckRow>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-7">
                    <div className="space-y-3">
                      <h1 className={stepTitle}>
                        What <span className="italic text-ember">brings</span> you here?
                      </h1>
                      <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
                        Pick up to 3. There are no wrong answers.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5 sm:gap-3" role="group" aria-label="Reasons">
                      {REASONS.map((r) => {
                        const on = reasons.includes(r);
                        const disabled = !on && reasons.length >= 3;
                        return (
                          <button
                            key={r}
                            type="button"
                            aria-pressed={on}
                            disabled={disabled}
                            onClick={() => toggleReason(r)}
                            className={cn(
                              "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2.5 text-[15px] font-medium sm:px-5",
                              controlClass(on)
                            )}
                          >
                            <Check
                              weight="bold"
                              className={cn(
                                "h-4 shrink-0 transition-[width,opacity,margin] duration-500 ease-[var(--ease-calm)]",
                                on ? "w-4 opacity-100" : "-mr-1.5 w-0 opacity-0"
                              )}
                            />
                            {r}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[13px] tabular-nums text-muted-foreground">{reasons.length}/3 selected</p>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-7">
                    <div className="space-y-3">
                      <h1 className={stepTitle}>
                        How are you feeling <span className="italic text-ember">right now</span>?
                      </h1>
                      <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
                        One tap. This helps you see your trend over time.
                      </p>
                    </div>
                    <MoodPicker value={mood} onChange={setMood} size="lg" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between gap-3">
              {step > 0 ? (
                <Button variant="ghost" className="px-4" onClick={() => go(-1)}>
                  <ArrowLeft weight="bold" /> Back
                </Button>
              ) : (
                <span />
              )}
              <Magnetic>
                {step < STEPS.length - 1 ? (
                  <Button size="lg" className="px-7" disabled={!canNext} onClick={() => go(1)}>
                    Continue <ArrowRight weight="bold" />
                  </Button>
                ) : (
                  <Button size="lg" className="px-7" disabled={!canNext} onClick={finish}>
                    Let&apos;s go <ArrowRight weight="bold" />
                  </Button>
                )}
              </Magnetic>
            </div>
          </div>
        </GlassSurface>
      </Reveal3D>
    </div>
    </div>
  );
}

/** Three glass beads joined by a filling hairline; current step label below. */
function StepIndicator({ step, reduce }: { step: number; reduce: boolean }) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <ol className="flex w-full items-center" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} className={cn("flex items-center", i > 0 && "flex-1")} aria-current={current ? "step" : undefined}>
              {i > 0 && (
                <span className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,currentColor_18%,transparent)]" aria-hidden>
                  <motion.span
                    className="block h-full rounded-full bg-primary"
                    initial={false}
                    animate={{ width: i <= step ? "100%" : "0%" }}
                    transition={{ duration: reduce ? 0 : 0.9, ease: EASE_EXPO }}
                  />
                </span>
              )}
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold tabular-nums transition-[background-color,color,box-shadow,transform] duration-700 ease-[var(--ease-calm)]",
                  current &&
                    "scale-110 bg-card text-foreground ring-2 ring-primary",
                  done && "bg-primary text-primary-foreground",
                  !current && !done && "bg-card/60 text-muted-foreground"
                )}
              >
                <span className="sr-only">{label}</span>
                {done ? <Check weight="bold" className="size-4" aria-hidden /> : <span aria-hidden>{i + 1}</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-[13px] font-medium opacity-75">
        Step {step + 1} of {STEPS.length} · <span className="font-semibold">{STEPS[step]}</span>
      </p>
    </div>
  );
}

function CheckRow({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex min-h-14 cursor-pointer items-start gap-3.5 rounded-[1.4rem] border p-4 text-[15px] font-normal leading-snug text-foreground outline-none transition-[border-color,background-color,box-shadow] duration-500 sm:p-5",
        checked ? "border-ember bg-accent ring-1 ring-ember" : "border-border bg-card hover:border-foreground/25"
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        required
        className="mt-0.5 size-5"
      />
      <span>{children}</span>
    </Label>
  );
}
