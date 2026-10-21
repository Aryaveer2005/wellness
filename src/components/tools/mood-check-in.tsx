"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SealCheck } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GlassSurface } from "@/components/motion/glass-surface";
import { useStoreValue } from "@/hooks/use-store";
import { store, type MoodEntry } from "@/lib/local-store";
import { cn } from "@/lib/utils";

export type MoodValue = MoodEntry["mood"];

export const MOODS: { value: MoodValue; label: string }[] = [
  { value: 1, label: "Rough" },
  { value: 2, label: "Low" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Great" },
];

export const moodLabel = (m: number) => MOODS.find((x) => x.value === m)?.label ?? "";

/** Calm expo-out curve for framer-motion step transitions. */
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * Shared look for tappable controls (mood faces, chips, segmented choices):
 * clean bordered pill at rest; selected = solid ink fill ("primary") or an ember ring on peach ("amber").
 */
export function controlClass(active: boolean, tone: "primary" | "amber" = "primary") {
  return cn(
    "outline-none transition-[transform,background-color,border-color,box-shadow,color] duration-500 ease-[var(--ease-glass)] focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
    active
      ? tone === "amber"
        ? "border border-ember bg-accent text-foreground ring-1 ring-ember"
        : "border border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_-14px_rgba(22,21,20,0.6)]"
      : "border border-border bg-card text-muted-foreground hover:-translate-y-0.5 hover:border-foreground/25 hover:text-foreground active:translate-y-0"
  );
}

/** Hand-drawn duotone mood face (1 = rough … 5 = great). Ours, not a stock icon. */
export function MoodFace({ value, className }: { value: MoodValue; className?: string }) {
  // Mouth: control-point y for a quadratic curve from (11,21) to (21,21).
  const mouth: Record<MoodValue, string> = {
    1: "M11 22.5 Q16 17.5 21 22.5",
    2: "M11.5 21.5 Q16 19.4 20.5 21.5",
    3: "M11.5 20.5 L20.5 20.5",
    4: "M11 19.5 Q16 23.5 21 19.5",
    5: "M10.5 18.8 Q16 25.5 21.5 18.8 Z",
  };
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("size-8", className)} aria-hidden>
      <circle cx="16" cy="16" r="13" fill="currentColor" opacity="0.14" />
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.6" />
      {value === 5 ? (
        <>
          <path d="M10.6 13.4 Q12 11.6 13.4 13.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M18.6 13.4 Q20 11.6 21.4 13.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="12" cy="13" r="1.35" fill="currentColor" />
          <circle cx="20" cy="13" r="1.35" fill="currentColor" />
        </>
      )}
      {value === 1 && (
        <>
          <path d="M9.8 10.4 L13.2 11.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M22.2 10.4 L18.8 11.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      <path
        d={mouth[value]}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={value === 5 ? "currentColor" : "none"}
        fillOpacity={value === 5 ? 0.35 : undefined}
      />
    </svg>
  );
}

const todayKey = () => new Date().toISOString().slice(0, 10);

/** Latest mood logged today (an "update" adds a newer entry for the same day). */
export function getLatestTodayMood(): MoodEntry | undefined {
  const today = store.getMoods().filter((m) => m.date.slice(0, 10) === todayKey());
  return today[today.length - 1];
}

/** Row of 1–5 face buttons. Used by the check-in and by /start. */
export function MoodPicker({
  value,
  onChange,
  size = "md",
}: {
  value: MoodValue | null;
  onChange: (v: MoodValue) => void;
  size?: "md" | "lg";
}) {
  return (
    <div role="radiogroup" aria-label="How are you feeling?" className="grid grid-cols-5 gap-2 sm:gap-3.5">
      {MOODS.map(({ value: v, label }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={cn(
              "group flex min-h-[4.75rem] flex-col items-center justify-center gap-1.5 rounded-[1.4rem] px-1 py-3 sm:rounded-full sm:py-4",
              size === "lg" && "min-h-[5.5rem] sm:py-5",
              controlClass(active)
            )}
          >
            <MoodFace
              value={v}
              className={cn(
                "transition-transform duration-700 ease-[var(--ease-calm)]",
                size === "lg" ? "size-9 sm:size-11" : "size-8 sm:size-10",
                active ? "scale-110" : "group-hover:scale-105"
              )}
            />
            <span className="text-[12px] font-medium tracking-[-0.005em] sm:text-[13px]">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Daily mood check-in card: one tap, 1–5 faces, optional note (PROJECT_SPEC §4.5). */
export function MoodCheckIn({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const today = useStoreValue(getLatestTodayMood, undefined);
  const [editing, setEditing] = useState(false);
  const [mood, setMood] = useState<MoodValue | null>(null);
  const [note, setNote] = useState("");

  const showForm = !today || editing;

  function startEdit() {
    setMood(today?.mood ?? null);
    setNote(today?.note ?? "");
    setEditing(true);
  }

  function save() {
    if (!mood) return;
    store.addMood({ mood, note: note.trim() || undefined });
    setEditing(false);
    setMood(null);
    setNote("");
  }

  const fade = reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 14, scale: 0.985, filter: "blur(8px)" },
        animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, y: -10, scale: 0.99, filter: "blur(6px)" },
      };

  return (
    <GlassSurface
      strong
      interactive={false}
      className={cn("rounded-[2rem] p-6 sm:p-10 lg:p-12", className)}
    >
      <section aria-labelledby="mood-checkin-title" className="relative z-[2]">
        <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Daily check-in</p>
            <h2
              id="mood-checkin-title"
              className="text-[2.25rem] leading-[1.05] sm:text-5xl"
            >
              {showForm ? (
                <>
                  How are you <span className="italic text-ember">feeling</span> today?
                </>
              ) : (
                "Today's check-in"
              )}
            </h2>
          </div>
          {!showForm && (
            <Button variant="outline" size="sm" className="min-h-11 shrink-0 px-5" onClick={startEdit}>
              Update
            </Button>
          )}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {showForm ? (
            <motion.div
              key="form"
              {...fade}
              transition={{ duration: 0.7, ease: EASE_EXPO }}
              className="space-y-5"
            >
              <MoodPicker value={mood} onChange={setMood} />
              <AnimatePresence initial={false}>
                {mood && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0, filter: "blur(6px)" }}
                    animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                    exit={{ opacity: 0, height: 0, filter: "blur(6px)" }}
                    transition={{ duration: 0.7, ease: EASE_EXPO }}
                    className="space-y-4 overflow-hidden px-0.5 pb-1"
                  >
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={280}
                      placeholder="Anything on your mind? (optional, stays on this device)"
                      aria-label="Optional note"
                      className="mt-1"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={save} className="px-6">
                        Save check-in
                      </Button>
                      {editing && (
                        <Button variant="ghost" onClick={() => setEditing(false)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            today && (
              <motion.div
                key="done"
                {...fade}
                transition={{ duration: 0.7, ease: EASE_EXPO }}
                className="flex items-center gap-4 sm:gap-5"
              >
                <span className="grid size-16 shrink-0 place-items-center rounded-full bg-accent text-ember sm:size-20">
                  <MoodFace value={today.mood} className="size-10 sm:size-12" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-heading text-2xl sm:text-3xl">
                    Feeling {moodLabel(today.mood).toLowerCase()}
                    <SealCheck weight="fill" className="size-5 text-ember" aria-label="saved" />
                  </p>
                  <p className="line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
                    {today.note ? `“${today.note}”` : "Checked in. Noticing how you feel is a skill — nice work."}
                  </p>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </section>
    </GlassSurface>
  );
}
