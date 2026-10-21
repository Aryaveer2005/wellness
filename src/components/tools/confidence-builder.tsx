"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  Check,
  Pause,
  Play,
  SkipForward,
  Sparkle,
  SpeakerHigh,
} from "@/components/icons";
import { Switch } from "@/components/ui/switch";
import { ExpressionCard, useExpression } from "@/components/tools/expression-coach";
import { playVoice, preloadVoice, stopVoice } from "@/lib/voice-client";
import { Button } from "@/components/ui/button";
import { RatingSlider } from "@/components/tools/rating-slider";
import { controlClass, EASE_EXPO } from "@/components/tools/mood-check-in";
import { CountUp } from "@/components/motion/count-up";
import { GlassSurface } from "@/components/motion/glass-surface";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { SplitHeading } from "@/components/motion/split-heading";
import { Magnetic } from "@/components/motion/magnetic";
import { scrollToTop } from "@/components/motion/smooth-scroll";
import {
  PHASES,
  POSTURE_CUE,
  SITUATIONS,
  TOTAL_SECONDS,
  type Situation,
} from "@/components/tools/confidence-content";
import { gsap, useGSAP } from "@/lib/gsap";
import { AmbientVideo } from "@/components/media/ambient-video";
import { store } from "@/lib/local-store";
import { sound } from "@/lib/sound";
import { useProgressSound } from "@/hooks/use-progress-sound";
import { cn } from "@/lib/utils";

type Stage = "pick" | "before" | "session" | "after" | "done";

const TOTAL_MS = TOTAL_SECONDS * 1000;
const PHASE_STARTS = PHASES.reduce<number[]>((acc, p, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + PHASES[i - 1].seconds * 1000);
  return acc;
}, []);

function phaseAt(ms: number) {
  let i = PHASES.length - 1;
  while (i > 0 && ms < PHASE_STARTS[i]) i--;
  return { index: i, phase: PHASES[i], inPhase: ms - PHASE_STARTS[i] };
}

// 4s in / 4s hold / 6s out
const BREATH_CYCLE_MS = 14000;
function breathAt(ms: number): { label: string; left: number } {
  const t = (ms % BREATH_CYCLE_MS) / 1000;
  if (t < 4) return { label: "Breathe in", left: Math.ceil(4 - t) };
  if (t < 8) return { label: "Hold", left: Math.ceil(8 - t) };
  return { label: "Breathe out", left: Math.ceil(14 - t) };
}

export function ConfidenceBuilder() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("pick");
  const [situation, setSituation] = useState<Situation | null>(null);
  const [before, setBefore] = useState(4);
  const [after, setAfter] = useState(5);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const last = useRef<number | null>(null);
  const expression = useExpression();

  // Voice guide (Chatterbox via our server). On by default; remembered on this device.
  const [voiceOn, setVoiceOn] = useState(true);
  useEffect(() => {
    try {
      setVoiceOn(window.localStorage.getItem("showup.voiceGuide") !== "off");
    } catch {
      /* storage blocked — keep default */
    }
  }, []);
  function toggleVoice(on: boolean) {
    setVoiceOn(on);
    if (!on) stopVoice();
    try {
      window.localStorage.setItem("showup.voiceGuide", on ? "on" : "off");
    } catch {
      /* ignore */
    }
  }

  // While the user rates themselves: draw their suggested expression and warm up the voice cues.
  const requestExpression = expression.request; // stable (useCallback)
  useEffect(() => {
    if (stage !== "before" || !situation) return;
    void requestExpression(situation.id);
    if (voiceOn) PHASES.forEach((p) => preloadVoice({ kind: "cue", situation: situation.id, phase: p.id }));
  }, [stage, situation, voiceOn, requestExpression]);

  // Speak each phase as it begins. Pausing stops the voice; leaving the session stops it too.
  const phaseIndex = phaseAt(elapsed).index;
  const spoken = useRef(-1);
  useEffect(() => {
    if (stage !== "session" || !situation) {
      spoken.current = -1;
      stopVoice();
      return;
    }
    if (!running || !voiceOn) {
      stopVoice();
      return;
    }
    if (spoken.current !== phaseIndex) {
      spoken.current = phaseIndex;
      void playVoice({ kind: "cue", situation: situation.id, phase: PHASES[phaseIndex].id });
    }
  }, [stage, situation, running, voiceOn, phaseIndex]);
  useEffect(() => () => stopVoice(), []);

  // Each stage starts at the top, so the timer / heading is never hidden under the header.
  useEffect(() => {
    scrollToTop();
  }, [stage]);

  // Session clock
  useEffect(() => {
    if (stage !== "session" || !running) {
      last.current = null;
      return;
    }
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = last.current === null ? 0 : now - last.current;
      last.current = now;
      setElapsed((e) => Math.min(TOTAL_MS, e + delta));
    }, 100);
    return () => window.clearInterval(id);
  }, [stage, running]);

  useEffect(() => {
    if (stage === "session" && elapsed >= TOTAL_MS) {
      sound.complete();
      setRunning(false);
      setAfter(before);
      setStage("after");
    }
  }, [elapsed, stage, before]);

  function startSession() {
    setElapsed(0);
    setRunning(true);
    setStage("session");
  }

  function skip() {
    const { index } = phaseAt(elapsed);
    setElapsed(index < PHASES.length - 1 ? PHASE_STARTS[index + 1] : TOTAL_MS);
  }

  function saveAfter() {
    if (!situation) return;
    store.addConfidenceSession({ situation: situation.label, before, after });
    setStage("done");
  }

  function restart() {
    setSituation(null);
    setBefore(4);
    setElapsed(0);
    setStage("pick");
  }

  // Calm step change: content sinks back into blur, the next rises forward.
  const fade = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.985, filter: "blur(8px)" },
    transition: { duration: reduce ? 0.2 : 0.8, ease: EASE_EXPO },
  };

  return (
    <div className="mx-auto w-full max-w-2xl pb-6">
      <AnimatePresence mode="wait" initial={false}>
        {stage === "pick" && (
          <motion.div key="pick" {...fade} className="space-y-10">
            <Intro
              title={
                <>
                  60-Second <span className="italic text-ember">Confidence</span> Builder
                </>
              }
              text="Use it right before the moment. Breathe, stand tall, remind yourself who you are."
            />
            <div className="space-y-5">
              <h2 className="text-3xl leading-[1.1] sm:text-4xl">What are you heading into?</h2>
              <Reveal3D immediate delay={0.2} stagger={0.06} tilt={10} className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {SITUATIONS.map((s) => {
                  const Icon = s.icon;
                  const on = situation?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      data-reveal
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setSituation(s);
                        void requestExpression(s.id);
                      }}
                      className={cn(
                        "group flex min-h-[7.5rem] flex-col items-start justify-between gap-4 rounded-[1.6rem] p-4 text-left sm:p-5",
                        controlClass(on, "amber")
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-11 place-items-center rounded-full transition-[background-color,color,transform] duration-500 ease-[var(--ease-calm)]",
                          on
                            ? "scale-105 bg-ember text-white"
                            : "bg-accent text-ember group-hover:scale-105"
                        )}
                      >
                        <Icon className="size-6" weight={on ? "fill" : "duotone"} />
                      </span>
                      <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">{s.label}</span>
                    </button>
                  );
                })}
              </Reveal3D>
            </div>
            {situation && expression.status !== "idle" && (
              <ExpressionCard
                situationId={situation.id}
                image={expression.image}
                status={expression.status}
                onAnother={() => expression.request(situation.id, { force: true })}
              />
            )}
            <div className="flex justify-end">
              <Magnetic>
                <Button size="lg" className="px-7" disabled={!situation} onClick={() => setStage("before")}>
                  Continue <ArrowRight weight="bold" />
                </Button>
              </Magnetic>
            </div>
          </motion.div>
        )}

        {stage === "before" && (
          <motion.div key="before" {...fade} className="space-y-8">
            <Intro
              title={
                <>
                  Where are you <span className="italic text-ember">right now</span>?
                </>
              }
              text="Be honest — there's no right number. We'll check again after."
            />
            <GlassSurface strong interactive={false} className="rounded-[2rem] p-6 sm:p-10">
              <div className="relative z-[2]">
                <p className="mb-4 text-center text-[15px] font-medium text-muted-foreground">
                  How confident do you feel about {situation?.label.toLowerCase()}?
                </p>
                <RatingSlider
                  value={before}
                  onChange={setBefore}
                  label="Confidence before"
                  lowLabel="Not at all"
                  highLabel="Very confident"
                  accent="amber"
                  suffix="/10"
                />
              </div>
            </GlassSurface>
            <label className="flex cursor-pointer items-center gap-3 rounded-full border border-border bg-card py-2.5 pl-2.5 pr-4 transition-colors hover:border-foreground/25">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-ember">
                <SpeakerHigh className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.9375rem] font-semibold">Voice guide</span>
                <span className="block text-sm text-muted-foreground">A calm voice talks you through each step.</span>
              </span>
              <Switch checked={voiceOn} onCheckedChange={toggleVoice} aria-label="Voice guide" />
            </label>
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" className="px-4" onClick={() => setStage("pick")}>
                <ArrowLeft weight="bold" /> Back
              </Button>
              <Magnetic>
                <Button variant="amber" size="lg" className="px-7" onClick={startSession}>
                  <Play weight="fill" /> Start 60 seconds
                </Button>
              </Magnetic>
            </div>
          </motion.div>
        )}

        {stage === "session" && situation && (
          <motion.div key="session" {...fade}>
            <AmbientVideo name="water" overlay="strong" fullscreen />
            <Session
              situation={situation}
              elapsed={elapsed}
              running={running}
              reduce={!!reduce}
              onToggle={() => setRunning((r) => !r)}
              onSkip={skip}
            />
            {phaseIndex >= 1 && expression.status !== "idle" && (
              <div className="mx-auto mt-8 max-w-md">
                <ExpressionCard compact situationId={situation.id} image={expression.image} status={expression.status} />
              </div>
            )}
          </motion.div>
        )}

        {stage === "after" && (
          <motion.div key="after" {...fade} className="space-y-8">
            <Intro
              title={
                <>
                  How do you feel <span className="italic text-ember">now</span>?
                </>
              }
              text="Same question as before. Notice what's shifted, even a little."
            />
            <GlassSurface strong interactive={false} className="rounded-[2rem] p-6 sm:p-10">
              <div className="relative z-[2]">
                <RatingSlider
                  value={after}
                  onChange={setAfter}
                  label="Confidence after"
                  lowLabel="Not at all"
                  highLabel="Very confident"
                  accent="amber"
                  suffix="/10"
                />
              </div>
            </GlassSurface>
            <div className="flex justify-end">
              <Magnetic>
                <Button variant="amber" size="lg" className="px-7" onClick={saveAfter}>
                  See my result <ArrowRight weight="bold" />
                </Button>
              </Magnetic>
            </div>
          </motion.div>
        )}

        {stage === "done" && situation && (
          <motion.div key="done" {...fade}>
            <Result before={before} after={after} situation={situation} onRestart={restart} />
            <ExpressionCard
              className="mt-8"
              situationId={situation.id}
              image={expression.image}
              status={expression.status}
              onAnother={() => expression.request(situation.id, { force: true })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Intro({ title, text }: { title: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ember">
        <span aria-hidden className="h-px w-8 bg-ember" />
        Confidence
      </p>
      <SplitHeading
        as="h1"
        immediate
        className="text-[2.75rem] leading-[1.02] sm:text-6xl"
      >
        {title}
      </SplitHeading>
      <p className="text-[1.0625rem] leading-relaxed text-muted-foreground sm:text-xl">{text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------
   Session — layered glass countdown ring with an amber progress arc,
   and a GSAP breathing orb synced to the 4s in / 4s hold / 6s out clock.
------------------------------------------------------------------- */

function Session({
  situation,
  elapsed,
  running,
  reduce,
  onToggle,
  onSkip,
}: {
  situation: Situation;
  elapsed: number;
  running: boolean;
  reduce: boolean;
  onToggle: () => void;
  onSkip: () => void;
}) {
  const { index, phase, inPhase } = phaseAt(elapsed);
  // rising tone as each phase of the session begins (breathe → posture → affirm → visualise)
  useProgressSound(index, PHASES.length, { chimeAtEnd: false });
  const remaining = Math.max(0, Math.ceil((TOTAL_MS - elapsed) / 1000));
  const progress = elapsed / TOTAL_MS;

  let content: React.ReactNode = null;
  let headline = "";
  if (phase.id === "breathe") {
    const b = breathAt(inPhase);
    headline = b.label;
    content = <BreathOrb inPhase={inPhase} running={running} reduce={reduce} label={b.label} left={b.left} />;
  } else {
    const affirmIdx = Math.min(2, Math.floor(inPhase / ((phase.seconds * 1000) / 3)));
    const text =
      phase.id === "posture"
        ? POSTURE_CUE
        : phase.id === "affirm"
          ? situation.affirmations[affirmIdx]
          : situation.visualise;
    headline =
      phase.id === "posture" ? "Stand tall" : phase.id === "affirm" ? "Say it to yourself" : "See it happen";
    content = (
      <div className="flex size-full items-center justify-center px-7 sm:px-12">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${phase.id}-${phase.id === "affirm" ? affirmIdx : 0}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(6px)" }}
            transition={{ duration: 0.9, ease: EASE_EXPO }}
            className={cn(
              "text-center text-balance",
              phase.id === "affirm"
                ? "font-display text-lg italic leading-snug sm:text-2xl"
                : "text-[14px] leading-relaxed text-foreground/85 sm:text-base"
            )}
          >
            {text}
          </motion.p>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">{situation.label}</p>
          <h1 className="text-[2.25rem] leading-[1.02] sm:text-5xl" aria-live="polite">
            {headline}
          </h1>
        </div>
        <p className="shrink-0 font-heading text-5xl leading-none tabular-nums sm:text-6xl" aria-label={`${remaining} seconds left`}>
          {remaining}
          <span className="font-display text-xl italic tracking-normal text-muted-foreground sm:text-2xl">s</span>
        </p>
      </div>

      {/* Phase segments */}
      <ol className="grid grid-cols-4 gap-1 rounded-full border border-border bg-card/90 p-1 backdrop-blur" aria-label="Session phases">
        {PHASES.map((p, i) => {
          const current = i === index;
          const done = i < index;
          return (
            <li
              key={p.id}
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex min-h-9 items-center justify-center gap-1 rounded-full px-1 text-center text-[12px] font-medium transition-[background-color,color,box-shadow] duration-700 ease-[var(--ease-calm)] sm:text-[13px]",
                current
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              {done && <Check weight="bold" className="hidden size-3 text-ember min-[400px]:block" aria-hidden />}
              {p.label}
            </li>
          );
        })}
      </ol>

      <CountdownRing progress={progress}>{content}</CountdownRing>

      <div className="flex items-center justify-center gap-3">
        <Magnetic>
          <Button size="lg" className="min-w-36 px-6" onClick={onToggle}>
            <span className="inline-flex items-center gap-2">
              {running ? (
                <>
                  <Pause weight="fill" /> Pause
                </>
              ) : (
                <>
                  <Play weight="fill" /> Resume
                </>
              )}
            </span>
          </Button>
        </Magnetic>
        <Button variant="outline" size="lg" className="bg-card px-5" onClick={onSkip}>
          <SkipForward /> {index < PHASES.length - 1 ? "Skip" : "Finish"}
        </Button>
      </div>
    </div>
  );
}

function CountdownRing({ progress, children }: { progress: number; children: React.ReactNode }) {
  const R = 46;
  const C = 2 * Math.PI * R;
  const angle = progress * 2 * Math.PI;
  const head = { x: 50 + R * Math.cos(angle), y: 50 + R * Math.sin(angle) };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[20rem] min-[400px]:max-w-[22rem] sm:max-w-[26rem]">
      {/* soft glow behind the dial */}
      <div
        aria-hidden
        className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--amber)_22%,transparent),transparent_70%)] blur-2xl"
        style={{ opacity: 0.5 + progress * 0.5 }}
      />
      {/* outer dial: clean white disc with a hairline */}
      <div className="absolute inset-0 rounded-full border border-border bg-card shadow-[var(--glass-shadow)]" aria-hidden />

      <svg viewBox="0 0 100 100" className="absolute inset-0 z-[2] size-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="ring-amber" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--amber)" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--border)" strokeWidth="2.6" />
        {/* phase markers */}
        {PHASE_STARTS.slice(1).map((ms) => {
          const a = (ms / TOTAL_MS) * 2 * Math.PI;
          return (
            <circle
              key={ms}
              cx={50 + R * Math.cos(a)}
              cy={50 + R * Math.sin(a)}
              r="0.9"
              fill={ms / TOTAL_MS <= progress ? "var(--amber-foreground)" : "var(--muted-foreground)"}
              opacity="0.55"
            />
          );
        })}
        {/* amber progress */}
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="url(#ring-amber)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          style={{
            transition: "stroke-dashoffset 120ms linear",
            filter: "drop-shadow(0 0 1.6px color-mix(in oklab, var(--amber) 80%, transparent))",
          }}
        />
        {/* glowing head */}
        {progress > 0.002 && (
          <circle
            cx={head.x}
            cy={head.y}
            r="2.1"
            fill="var(--amber)"
            stroke="var(--glass-highlight)"
            strokeWidth="0.6"
            style={{ filter: "drop-shadow(0 0 2.4px var(--amber))", transition: "cx 120ms linear, cy 120ms linear" }}
          />
        )}
      </svg>

      {/* inner well */}
      <div className="absolute inset-[11%] z-[3] overflow-hidden rounded-full bg-blush">{children}</div>
    </div>
  );
}

function BreathOrb({
  inPhase,
  running,
  reduce,
  label,
  left,
}: {
  inPhase: number;
  running: boolean;
  reduce: boolean;
  label: string;
  left: number;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // One 14s breath cycle, looped: 4s in (sine) → 4s hold (tiny shimmer) → 6s out (sine).
  useGSAP(
    () => {
      if (reduce) return;
      const t = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "sine.inOut" } });
      t.fromTo("[data-orb]", { scale: 0.6 }, { scale: 1, duration: 4 }, 0)
        .fromTo("[data-halo]", { scale: 0.65, opacity: 0.35 }, { scale: 1.12, opacity: 0.95, duration: 4 }, 0)
        .fromTo("[data-ripple]", { scale: 0.7, opacity: 0 }, { scale: 1.04, opacity: 0.7, duration: 4, ease: "expo.out" }, 0)
        .to("[data-orb]", { scale: 1.025, duration: 2, yoyo: true, repeat: 1 }, 4)
        .to("[data-ripple]", { opacity: 0.25, duration: 4 }, 4)
        .to("[data-orb]", { scale: 0.6, duration: 6 }, 8)
        .to("[data-halo]", { scale: 0.65, opacity: 0.35, duration: 6 }, 8)
        .to("[data-ripple]", { scale: 0.7, opacity: 0, duration: 6 }, 8);
      tl.current = t;
      return () => {
        tl.current = null;
      };
    },
    { scope, dependencies: [reduce], revertOnUpdate: true }
  );

  // Keep the timeline locked to the session clock (handles pause/resume and drift).
  useEffect(() => {
    const t = tl.current;
    if (!t) return;
    const target = (inPhase % BREATH_CYCLE_MS) / 1000;
    if (Math.abs(t.time() - target) > 0.35) t.time(target);
    if (running) t.play();
    else t.pause();
  }, [inPhase, running]);

  return (
    <div ref={scope} className="relative flex size-full items-center justify-center">
      <div
        data-halo
        aria-hidden
        className="absolute size-[86%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--peach-deep)_45%,transparent)_0%,color-mix(in_oklab,var(--amber)_18%,transparent)_55%,transparent_72%)] blur-xl"
        style={reduce ? { transform: "scale(0.85)", opacity: 0.7 } : undefined}
      />
      <div
        data-ripple
        aria-hidden
        className="absolute size-[80%] rounded-full border border-ember/30"
        style={reduce ? { opacity: 0.4, transform: "scale(0.9)" } : undefined}
      />
      <div
        data-orb
        aria-hidden
        className="absolute size-[64%] rounded-full shadow-[inset_0_2px_6px_rgba(255,255,255,0.4),0_18px_40px_-16px_color-mix(in_oklab,var(--amber)_80%,transparent)]"
        style={{
          background:
            "radial-gradient(circle at 34% 28%, rgba(255,255,255,0.45), transparent 40%), linear-gradient(160deg, #FFB58E 0%, #FF8F63 55%, #E8673E 100%)",
          transform: reduce ? "scale(0.85)" : undefined,
        }}
      />
      <span className="relative z-[2] flex flex-col items-center text-[#1A0E08]">
        <span className="font-heading text-2xl sm:text-3xl">{label}</span>
        <span className="font-heading text-4xl italic leading-none tabular-nums opacity-75 sm:text-5xl" aria-hidden>
          {left}
        </span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------
   Result — before → after as a calm celebration (GSAP count-up).
------------------------------------------------------------------- */

function Result({
  before,
  after,
  situation,
  onRestart,
}: {
  before: number;
  after: number;
  situation: Situation;
  onRestart: () => void;
}) {
  const diff = after - before;
  const message =
    diff > 0
      ? `Up ${diff} ${diff === 1 ? "point" : "points"} in a minute. That's you, not luck. Take this feeling with you.`
      : diff === 0
        ? "Holding steady is still showing up. You've given yourself a calmer starting point."
        : "Some days are heavier, and that's okay. You still took a minute for yourself — that counts.";

  return (
    <div className="space-y-8">
      <div className="band-peach relative overflow-hidden rounded-[2rem] p-6 text-center sm:rounded-[2.5rem] sm:p-12">
        <Reveal3D immediate stagger={0.1} tilt={12} className="relative z-[2] flex flex-col items-center">
          <span
            data-reveal
            className="mb-5 grid size-16 place-items-center rounded-full bg-card text-ember shadow-[var(--glass-shadow)]"
          >
            <Sparkle weight="fill" className="size-8" />
          </span>
          <p data-reveal className="text-xs font-semibold uppercase tracking-[0.18em] opacity-75">
            {situation.label}
          </p>
          <div data-reveal className="my-8 flex items-center justify-center gap-5 sm:gap-10">
            <Score label="Before" value={before} delay={0.35} muted />
            <span className="grid size-10 place-items-center rounded-full bg-card text-foreground">
              <ArrowRight weight="bold" className="size-4" aria-hidden />
            </span>
            <Score label="After" value={after} delay={0.6} />
          </div>
          {diff !== 0 && (
            <p
              data-reveal
              className={cn(
                "mb-6 inline-flex items-baseline gap-1 rounded-full px-4 py-1.5 text-[15px] font-semibold",
                diff > 0 ? "bg-card text-foreground" : "bg-card/70 text-muted-foreground"
              )}
            >
              <CountUp immediate delay={0.9} value={diff} signed />
              <span className="font-normal text-muted-foreground">{Math.abs(diff) === 1 ? "point" : "points"}</span>
            </p>
          )}
          <p data-reveal className="mx-auto max-w-md text-[1.0625rem] leading-relaxed sm:text-xl sm:leading-relaxed">
            {message}
          </p>
        </Reveal3D>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Magnetic className="w-full sm:w-auto">
          <Button asChild size="lg" className="w-full px-7">
            <Link href="/home">Back to home</Link>
          </Button>
        </Magnetic>
        <Button variant="outline" size="lg" className="px-7" onClick={onRestart}>
          <span className="inline-flex items-center gap-2">
            <ArrowCounterClockwise /> Do another
          </span>
        </Button>
      </div>
    </div>
  );
}

function Score({ label, value, muted, delay }: { label: string; value: number; muted?: boolean; delay: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <CountUp
        immediate
        delay={delay}
        duration={1.4}
        value={value}
        className={cn(
          "font-heading text-7xl leading-none sm:text-8xl",
          muted ? "opacity-55" : "text-ember dark:text-[#FFD9C2]"
        )}
      />
      <span className="text-[13px] font-medium opacity-70">{label}</span>
    </div>
  );
}
