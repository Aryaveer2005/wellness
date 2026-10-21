"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  CircleNotch,
  ClockCounterClockwise,
  Lightbulb,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassSurface } from "@/components/motion/glass-surface";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { SplitHeading } from "@/components/motion/split-heading";
import { scrollToTop } from "@/components/motion/smooth-scroll";
import { RatingSlider } from "@/components/tools/rating-slider";
import { ReframeSummary } from "@/components/tools/reframe-summary";
import { COMMON_EMOTIONS, THINKING_TRAPS } from "@/components/tools/thinking-traps";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { store, type ReframeRecord } from "@/lib/local-store";
import { useProgressSound } from "@/hooks/use-progress-sound";
import { cn } from "@/lib/utils";

export type ReframeDraft = Omit<ReframeRecord, "id" | "date">;

const EMPTY: ReframeDraft = {
  situation: "",
  thought: "",
  emotion: "",
  intensityBefore: 60,
  traps: [],
  evidenceFor: "",
  evidenceAgainst: "",
  balancedThought: "",
  intensityAfter: 40,
};

const STEPS = [
  { short: "Situation", title: "What happened?", text: "Describe the situation in a sentence or two — just the facts, like a camera would see it." },
  { short: "Thought", title: "What went through your mind?", text: "Write the thought exactly as it showed up, even if it sounds harsh." },
  { short: "Feeling", title: "What did you feel?", text: "Name the main emotion and how strong it was." },
  { short: "Traps", title: "Spot the thinking traps", text: "Our minds take shortcuts. Tap any that fit — it's fine if you're not sure." },
  { short: "For", title: "Evidence for the thought", text: "What facts support this thought? Facts only — not feelings or guesses." },
  { short: "Against", title: "Evidence against the thought", text: "What doesn't fit? What would a good friend point out? What's happened before that went okay?" },
  { short: "Balance", title: "A more balanced thought", text: "Taking both sides into account, what's a fairer, more realistic way to see it?" },
];

const HINT_FAIL = "Hints are resting right now — you're doing great on your own.";

/** Wrapper for the shared RatingSlider: a quiet blush panel (the slider itself is ink on blush). */
const sliderSkin = "rounded-[1.6rem] bg-blush px-4 py-5 sm:px-6";

export function Reframer() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  useProgressSound(step, STEPS.length - 1);
  const [dir, setDir] = useState(1);
  const [r, setR] = useState<ReframeDraft>(EMPTY);
  const [saved, setSaved] = useState<ReframeRecord | null>(null);
  const [hint, setHint] = useState<{ step: number; loading: boolean; text?: string; error?: boolean } | null>(null);

  const set = <K extends keyof ReframeDraft>(k: K, v: ReframeDraft[K]) => setR((cur) => ({ ...cur, [k]: v }));

  const canNext = [
    r.situation.trim().length > 0,
    r.thought.trim().length > 0,
    r.emotion.trim().length > 0,
    true,
    true,
    true,
    r.balancedThought.trim().length > 0,
  ][step];

  function go(delta: number) {
    setDir(delta);
    setHint(null);
    setStep((s) => s + delta);
    scrollToTop();
  }

  function finish() {
    const rec = store.addReframe({
      ...r,
      situation: r.situation.trim(),
      thought: r.thought.trim(),
      emotion: r.emotion.trim(),
      evidenceFor: r.evidenceFor.trim(),
      evidenceAgainst: r.evidenceAgainst.trim(),
      balancedThought: r.balancedThought.trim(),
    });
    setSaved(rec);
    scrollToTop();
  }

  function restart() {
    setR(EMPTY);
    setSaved(null);
    setHint(null);
    setDir(1);
    setStep(0);
  }

  async function getHint() {
    const forStep = step + 1;
    setHint({ step: forStep, loading: true });
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch("/api/reframe-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: forStep, record: r }),
        signal: ctrl.signal,
      });
      const data: unknown = res.ok ? await res.json().catch(() => null) : null;
      const text =
        data && typeof data === "object"
          ? ["hint", "text", "message"].map((k) => (data as Record<string, unknown>)[k]).find((v) => typeof v === "string" && v.trim())
          : undefined;
      setHint((h) => (h?.step === forStep ? (text ? { step: forStep, loading: false, text: String(text) } : { step: forStep, loading: false, error: true }) : h));
    } catch {
      setHint((h) => (h?.step === forStep ? { step: forStep, loading: false, error: true } : h));
    } finally {
      window.clearTimeout(timer);
    }
  }

  // Step change: content slides through a little depth and focus-blur.
  const variants = {
    enter: (d: number) =>
      reduce ? { opacity: 0 } : { opacity: 0, x: d * 36, scale: 0.97, rotateY: d * -6, filter: "blur(8px)" },
    center: { opacity: 1, x: 0, scale: 1, rotateY: 0, filter: "blur(0px)" },
    exit: (d: number) =>
      reduce ? { opacity: 0 } : { opacity: 0, x: d * -36, scale: 0.97, rotateY: d * 6, filter: "blur(8px)" },
  };

  if (saved) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-8 pb-32 md:pb-12">
        <div className="space-y-3">
          <Reveal3D immediate tilt={0}>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-ember">
              <CheckCircle className="size-4" weight="fill" /> Saved
            </p>
          </Reveal3D>
          <SplitHeading as="h1" immediate className="text-[2.75rem] leading-[1.02] sm:text-6xl">
            You looked at it from <span className="italic text-ember">both sides.</span>
          </SplitHeading>
          <Reveal3D immediate delay={0.2} tilt={0}>
            <p className="text-[1.0625rem] leading-relaxed text-muted-foreground sm:text-lg">
              {saved.intensityAfter < saved.intensityBefore
                ? `Your ${saved.emotion.toLowerCase()} dropped from ${saved.intensityBefore} to ${saved.intensityAfter}. That's real work.`
                : "Even when the feeling doesn't shift much, practising this makes the next one easier."}
            </p>
          </Reveal3D>
        </div>
        <Reveal3D immediate delay={0.3}>
          <ReframeSummary record={saved} />
        </Reveal3D>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={restart}>
            <ArrowCounterClockwise /> Reframe another thought
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/reframe/history">
              <ClockCounterClockwise /> My reframes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const s = STEPS[step];

  return (
    <div className="mx-auto w-full max-w-2xl pb-32 md:pb-12">
      <Reveal3D immediate tilt={0} className="mb-8 flex items-end justify-between gap-4">
        <div className="space-y-3">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ember">
            <span aria-hidden className="h-px w-8 bg-ember" />
            Thought Reframer
          </p>
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
            A 7-step thought record from CBT. <span className="whitespace-nowrap">Take your time.</span>
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/reframe/history">
            <ClockCounterClockwise className="size-5" />
            History
          </Link>
        </Button>
      </Reveal3D>

      <Reveal3D immediate delay={0.1}>
        <GlassSurface interactive={false} className="rounded-[2rem] p-5 sm:p-10">
          <div className="relative z-[2]">
            <StepRail step={step} />

            <div className="perspective-1200 mt-8">
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h1 className="text-[2.25rem] leading-[1.05] sm:text-5xl">{s.title}</h1>
                    <p className="leading-relaxed text-muted-foreground">{s.text}</p>
                  </div>

                  {step === 0 && (
                    <Field
                      value={r.situation}
                      onChange={(v) => set("situation", v)}
                      placeholder="e.g. Caught my reflection in a shop window before meeting friends."
                      label="Situation"
                    />
                  )}
                  {step === 1 && (
                    <Field
                      value={r.thought}
                      onChange={(v) => set("thought", v)}
                      placeholder="e.g. Everyone's going to notice and think less of me."
                      label="Automatic thought"
                    />
                  )}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Common emotions">
                        {COMMON_EMOTIONS.map((e) => (
                          <Chip key={e} on={r.emotion === e} onClick={() => set("emotion", r.emotion === e ? "" : e)}>
                            {e}
                          </Chip>
                        ))}
                      </div>
                      <Input
                        value={r.emotion}
                        onChange={(e) => set("emotion", e.target.value)}
                        maxLength={40}
                        placeholder="Or type your own"
                        aria-label="Emotion"
                      />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">How strong was it?</p>
                        <div className={sliderSkin}>
                          <RatingSlider
                            value={r.intensityBefore}
                            onChange={(v) => set("intensityBefore", v)}
                            max={100}
                            step={5}
                            label="Emotion intensity"
                            lowLabel="Barely there"
                            highLabel="Overwhelming"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {THINKING_TRAPS.map((t) => {
                        const on = r.traps.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => set("traps", on ? r.traps.filter((x) => x !== t.id) : [...r.traps, t.id])}
                            className={cn(
                              "group flex min-h-11 items-start gap-3 rounded-2xl p-4 text-left outline-none transition-[background,box-shadow,transform] duration-500 ease-[var(--ease-glass)] focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.98]",
                              on
                                ? "border border-ember bg-accent ring-1 ring-ember"
                                : "border border-border bg-card hover:-translate-y-0.5 hover:border-foreground/25"
                            )}
                          >
                            <span
                              className={cn(
                                "relative z-[2] mt-0.5 grid size-6 shrink-0 place-items-center rounded-full transition-all duration-500",
                                on ? "bg-ember text-white" : "border border-border bg-blush"
                              )}
                            >
                              {on && <Check className="size-3.5" weight="bold" />}
                            </span>
                            <span className="relative z-[2]">
                              <span className="block text-[0.9375rem] font-semibold">{t.label}</span>
                              <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">{t.hint}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {step === 4 && (
                    <Field
                      value={r.evidenceFor}
                      onChange={(v) => set("evidenceFor", v)}
                      placeholder="e.g. One friend made a joke about my hair last month."
                      label="Evidence for"
                    />
                  )}
                  {step === 5 && (
                    <Field
                      value={r.evidenceAgainst}
                      onChange={(v) => set("evidenceAgainst", v)}
                      placeholder="e.g. The same friends invited me out again. Nobody mentioned it tonight."
                      label="Evidence against"
                    />
                  )}
                  {step === 6 && (
                    <div className="space-y-6">
                      <Field
                        value={r.balancedThought}
                        onChange={(v) => set("balancedThought", v)}
                        placeholder="e.g. Some people might notice, but my friends invite me because they like being around me."
                        label="Balanced thought"
                      />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          How strong is the {r.emotion ? r.emotion.toLowerCase() : "feeling"} now?
                        </p>
                        <div className={sliderSkin}>
                          <RatingSlider
                            value={r.intensityAfter}
                            onChange={(v) => set("intensityAfter", v)}
                            max={100}
                            step={5}
                            label="Emotion intensity now"
                            lowLabel="Barely there"
                            highLabel="Overwhelming"
                          />
                        </div>
                        <p className="text-center text-[13px] text-muted-foreground">It started at {r.intensityBefore}.</p>
                      </div>
                    </div>
                  )}

                  {step >= 4 && (
                    <div className="space-y-3">
                      <Button variant="outline" onClick={getHint} disabled={hint?.loading}>
                        {hint?.loading ? (
                          <CircleNotch className="relative z-[2] animate-spin" weight="bold" />
                        ) : (
                          <Lightbulb className="relative z-[2] size-5 text-ember" weight="fill" />
                        )}
                        <span className="relative z-[2]">{hint?.loading ? "Thinking…" : "Get an AI hint"}</span>
                      </Button>
                      <AnimatePresence>
                        {hint && !hint.loading && (
                          <motion.div
                            initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            role="status"
                            className="flex gap-3 rounded-[1.4rem] bg-accent p-4"
                          >
                            <span className="relative z-[2] grid size-9 shrink-0 place-items-center rounded-full bg-card text-ember">
                              <Lightbulb className="size-5" />
                            </span>
                            <p className="relative z-[2] self-center text-[0.9375rem] leading-relaxed">
                              {hint.error ? HINT_FAIL : hint.text}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-center justify-between gap-3 border-t border-[var(--glass-stroke-soft)] pt-6">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => go(-1)}>
                  <ArrowLeft weight="bold" /> Back
                </Button>
              ) : (
                <span />
              )}
              {step < STEPS.length - 1 ? (
                <Button size="lg" disabled={!canNext} onClick={() => go(1)}>
                  {step === 3 && r.traps.length === 0 ? "Not sure — skip" : "Next"} <ArrowRight weight="bold" />
                </Button>
              ) : (
                <Button size="lg" disabled={!canNext} onClick={finish}>
                  Finish & save <Check weight="bold" />
                </Button>
              )}
            </div>
          </div>
        </GlassSurface>
      </Reveal3D>
    </div>
  );
}

/** 7-step rail: numbered beads over a liquid progress bar (GSAP). */
function StepRail({ step }: { step: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const progress = step / (STEPS.length - 1);

  useGSAP(
    () => {
      if (!fillRef.current) return;
      gsap.to(fillRef.current, {
        scaleX: progress,
        duration: prefersReducedMotion() ? 0 : 1.1,
        ease: "expo.out",
      });
      const bead = ref.current?.querySelector<HTMLElement>("[data-current='true']");
      if (bead && !prefersReducedMotion()) {
        gsap.fromTo(bead, { scale: 0.7 }, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.55)" });
      }
    },
    { dependencies: [step], scope: ref }
  );

  return (
    <div ref={ref}>
      <div className="mb-4 flex items-baseline justify-between text-[13px] font-medium text-muted-foreground">
        <span>
          Step <span className="tabular-nums text-foreground">{step + 1}</span> of {STEPS.length}
          <span className="text-ember"> · {STEPS[step].short}</span>
        </span>
        <span className="tabular-nums">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
      </div>
      <div
        className="relative px-3"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={step + 1}
        aria-label="Reframer progress"
      >
        {/* track */}
        <div className="absolute inset-x-3 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-border">
          <span
            ref={fillRef}
            className="absolute inset-0 origin-left scale-x-0 rounded-full bg-primary"
          />
        </div>
        {/* beads */}
        <ol className="relative flex justify-between" aria-hidden>
          {STEPS.map((st, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li
                key={st.short}
                data-current={current}
                className={cn(
                  "grid size-7 place-items-center rounded-full text-[11px] font-semibold tabular-nums transition-[background,color,box-shadow] duration-500",
                  done && "bg-primary text-primary-foreground",
                  current && "bg-ember text-white shadow-[0_0_0_5px_color-mix(in_oklab,var(--ember)_18%,transparent)]",
                  !done && !current && "border border-border bg-card text-muted-foreground"
                )}
              >
                <span>{done ? <Check className="size-3.5" weight="bold" /> : i + 1}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Field({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
      maxLength={1000}
      className="min-h-36 rounded-[1.6rem] border-border bg-blush p-5 text-[1.0625rem] shadow-none focus-visible:bg-card"
    />
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full px-5 text-[0.9375rem] font-medium outline-none transition-[background,box-shadow,color,transform] duration-500 ease-[var(--ease-glass)] focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]",
        on
          ? "border border-primary bg-primary text-primary-foreground"
          : "border border-border bg-card hover:-translate-y-0.5 hover:border-foreground/25"
      )}
    >
      <span className="relative z-[2]">{children}</span>
    </button>
  );
}
