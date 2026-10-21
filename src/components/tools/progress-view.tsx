"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowRight,
  Brain,
  CalendarDots,
  Sparkle,
  TrendDown,
  Waveform,
  type AppIcon,
} from "@/components/icons";
import { DeviceNote } from "@/components/tools/device-note";
import { MoodFace, moodLabel } from "@/components/tools/mood-check-in";
import { GlassSurface } from "@/components/motion/glass-surface";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { SplitHeading } from "@/components/motion/split-heading";
import { useStoreValue } from "@/hooks/use-store";
import { CountUp } from "@/components/motion/count-up";
import { store, type MoodEntry } from "@/lib/local-store";
import { cn } from "@/lib/utils";

const getMoods = () => store.getMoods();
const getSessions = () => store.getConfidenceSessions();
const getReframes = () => store.getReframes();
const getDays = () => store.getActiveDays();

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

type Point = { key: string; label: string; mood: number | null };

function buildTrend(moods: MoodEntry[]): Point[] {
  // Latest entry per day (matches the store's UTC day key).
  const byDay = new Map<string, number>();
  [...moods].sort((a, b) => a.date.localeCompare(b.date)).forEach((m) => byDay.set(m.date.slice(0, 10), m.mood));
  const out: Point[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    out.push({
      key,
      label: new Date(key + "T12:00:00Z").toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      mood: byDay.get(key) ?? null,
    });
  }
  return out;
}

type Stat = {
  icon: AppIcon;
  label: string;
  value: number | null;
  decimals?: number;
  signed?: boolean;
  sub: string;
  tone?: "amber";
};

export function ProgressView() {
  const reduce = useReducedMotion();
  const moods = useStoreValue(getMoods, []);
  const sessions = useStoreValue(getSessions, []);
  const reframes = useStoreValue(getReframes, []);
  const days = useStoreValue<string[]>(getDays, []);

  const trend = useMemo(() => buildTrend(moods), [moods]);
  const moodDays = trend.filter((p) => p.mood !== null).length;
  const confidenceChange = avg(sessions.map((s) => s.after - s.before));
  const intensityDrop = avg(reframes.map((r) => r.intensityBefore - r.intensityAfter));

  const stats: Stat[] = [
    {
      icon: Sparkle,
      label: "Avg. confidence change",
      value: sessions.length ? confidenceChange : null,
      decimals: 1,
      signed: true,
      sub: sessions.length ? `across ${sessions.length} session${sessions.length === 1 ? "" : "s"} (0–10)` : "No sessions yet",
      tone: "amber",
    },
    {
      icon: Brain,
      label: "Reframes done",
      value: reframes.length,
      sub: reframes.length ? "thoughts looked at from both sides" : "No reframes yet",
    },
    {
      icon: TrendDown,
      label: "Avg. intensity drop",
      value: reframes.length ? Math.round(intensityDrop) : null,
      sub: reframes.length ? "points on a 0–100 scale" : "Shows after your first reframe",
    },
    {
      icon: CalendarDots,
      label: "Days used",
      value: days.length,
      sub: days.length === 1 ? "day you showed up" : "days you showed up",
    },
  ];

  return (
    <div className="flex flex-col gap-10 pb-6 sm:gap-14">
      <DeviceNote />

      {/* Mood trend */}
      <Reveal3D tilt={8}>
        <GlassSurface interactive={false} className="rounded-[2rem] p-5 sm:p-10">
          <section aria-label="Mood, last 30 days">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-3">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ember">
                  <Waveform className="size-4" aria-hidden /> Mood trend
                </p>
                <SplitHeading as="h2" className="text-4xl leading-[1.05] sm:text-5xl">
                  Mood, last <span className="italic text-ember">30 days</span>
                </SplitHeading>
              </div>
              <span className="rounded-full border border-border bg-blush px-3.5 py-1.5 text-[13px] text-muted-foreground">
                {moodDays} check-in day{moodDays === 1 ? "" : "s"}
              </span>
            </div>
            {moodDays === 0 ? (
              <EmptyState
                face
                text="Check in on the home page and your mood trend will appear here."
                href="/home"
                cta="Check in now"
              />
            ) : (
              <>
                <div className="-mx-1 h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend} margin={{ top: 10, right: 10, bottom: 0, left: -6 }}>
                      <defs>
                        <linearGradient id="mood-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.32} />
                          <stop offset="70%" stopColor="var(--chart-1)" stopOpacity={0.06} />
                          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 6" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                        minTickGap={28}
                        tickMargin={10}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      />
                      <YAxis
                        domain={[1, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        tickLine={false}
                        axisLine={false}
                        width={52}
                        tickFormatter={(v: number) => moodLabel(v)}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ stroke: "var(--chart-1)", strokeOpacity: 0.35, strokeWidth: 1, strokeDasharray: "3 4" }}
                        content={({ active, payload }) => {
                          const p = payload?.[0]?.payload as Point | undefined;
                          if (!active || !p || p.mood === null) return null;
                          return (
                            <div className="liquid-glass flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-[13px]">
                              <MoodFace value={p.mood as 1 | 2 | 3 | 4 | 5} className="size-6 text-ember" />
                              <div>
                                <p className="text-muted-foreground">{p.label}</p>
                                <p className="font-semibold text-foreground">{moodLabel(p.mood)}</p>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="mood"
                        stroke="var(--chart-1)"
                        strokeWidth={2.5}
                        fill="url(#mood-fill)"
                        connectNulls
                        dot={{ r: 3.5, fill: "var(--chart-1)", stroke: "var(--background)", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "var(--chart-1)", stroke: "var(--background)", strokeWidth: 3 }}
                        isAnimationActive={!reduce}
                        animationDuration={1400}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* Text alternative for screen readers */}
                <table className="sr-only">
                  <caption>Mood by day</caption>
                  <tbody>
                    {trend
                      .filter((p) => p.mood !== null)
                      .map((p) => (
                        <tr key={p.key}>
                          <th scope="row">{p.label}</th>
                          <td>{moodLabel(p.mood!)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </>
            )}
          </section>
        </GlassSurface>
      </Reveal3D>

      {/* Stat tiles */}
      <Reveal3D tilt={6} className="band-periwinkle -mx-4 grid grid-cols-1 gap-3 px-4 py-8 min-[400px]:grid-cols-2 sm:mx-0 sm:gap-4 sm:rounded-[2.5rem] sm:p-8 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const amber = s.tone === "amber";
          return (
            <div key={s.label} data-reveal className="h-full">
              <GlassSurface interactive={false} className="flex h-full flex-col gap-3 rounded-[1.75rem] p-5 sm:p-6">
                <span
                  className={cn(
                    "grid size-11 place-items-center rounded-full",
                    amber ? "bg-ember text-white" : "bg-accent text-ember"
                  )}
                >
                  <Icon className="size-6" />
                </span>
                <p className="text-[13px] font-medium text-muted-foreground">{s.label}</p>
                <p
                  className={cn(
                    "font-heading text-5xl leading-none sm:text-6xl",
                    amber && s.value !== null && "text-ember"
                  )}
                >
                  {s.value === null ? (
                    <span className="text-muted-foreground/60">—</span>
                  ) : (
                    <CountUp value={s.value} decimals={s.decimals} signed={s.signed} />
                  )}
                </p>
                <p className="mt-auto text-[13px] leading-snug text-muted-foreground">{s.sub}</p>
              </GlassSurface>
            </div>
          );
        })}
      </Reveal3D>

      {sessions.length === 0 && reframes.length === 0 && (
        <Reveal3D className="grid gap-4 sm:grid-cols-2">
          <div data-reveal>
            <EmptyState icon={Sparkle} tone="amber" text="Try a 60-second confidence session." href="/confidence" cta="Build confidence" card />
          </div>
          <div data-reveal>
            <EmptyState icon={Brain} text="Untangle one harsh thought." href="/reframe" cta="Reframe a thought" card />
          </div>
        </Reveal3D>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  face,
  tone,
  text,
  href,
  cta,
  card,
}: {
  icon?: AppIcon;
  face?: boolean;
  tone?: "amber";
  text: string;
  href: string;
  cta: string;
  card?: boolean;
}) {
  const inner = (
    <>
      <span
        className={cn(
          "grid size-14 place-items-center rounded-full",
          tone === "amber" ? "bg-ember text-white" : "bg-accent text-ember"
        )}
      >
        {face ? <MoodFace value={3} className="size-8" /> : Icon ? <Icon className="size-7" /> : null}
      </span>
      <p className="max-w-xs text-[15px] leading-relaxed text-muted-foreground">{text}</p>
      <span className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground">
        {cta}
        <ArrowRight weight="bold" className="size-4 transition-transform duration-500 ease-[var(--ease-calm)] group-hover:translate-x-1" />
      </span>
    </>
  );

  if (card) {
    return (
      <GlassSurface className="group h-full rounded-[2rem] focus-within:ring-3 focus-within:ring-ring/50">
        <Link href={href} className="flex h-full min-h-44 flex-col items-center justify-center gap-4 p-8 text-center outline-none">
          {inner}
        </Link>
      </GlassSurface>
    );
  }
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-4 rounded-[1.6rem] bg-blush px-6 py-12 text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {inner}
    </Link>
  );
}
