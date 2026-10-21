"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  CalendarDots,
  ChatsCircle,
  HandWaving,
  LockSimple,
  Smiley,
  Sparkle,
  Stethoscope,
  type AppIcon,
} from "@/components/icons";
import { MoodCheckIn, moodLabel } from "@/components/tools/mood-check-in";
import { Button } from "@/components/ui/button";
import { DeviceNote } from "@/components/tools/device-note";
import { CountUp } from "@/components/motion/count-up";
import { GlassSurface } from "@/components/motion/glass-surface";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { SplitHeading } from "@/components/motion/split-heading";
import { useStoreValue } from "@/hooks/use-store";
import { store, type Profile } from "@/lib/local-store";
import { cn } from "@/lib/utils";

type Tool = {
  href: string;
  title: string;
  blurb: string;
  icon: AppIcon;
  tone: "amber" | "primary";
  /** Bento placement: asymmetric on desktop, stacked on phones. */
  span: string;
  feature?: boolean;
};

const TOOLS: Tool[] = [
  {
    href: "/confidence",
    title: "Confidence Builder",
    blurb: "60 seconds to steady yourself before a date, interview or meeting.",
    icon: Sparkle,
    tone: "amber",
    span: "sm:col-span-2 lg:col-span-5 lg:row-span-2",
    feature: true,
  },
  {
    href: "/reframe",
    title: "Thought Reframer",
    blurb: "Untangle a harsh thought, step by step.",
    icon: Brain,
    tone: "primary",
    span: "lg:col-span-7",
  },
  {
    href: "/chat",
    title: "AI Companion",
    blurb: "Talk it through, any time. No judgement.",
    icon: ChatsCircle,
    tone: "primary",
    span: "lg:col-span-4",
  },
  {
    href: "/psychologists",
    title: "Find a Psychologist",
    blurb: "When you want a real person in your corner.",
    icon: Stethoscope,
    tone: "primary",
    span: "sm:col-span-2 lg:col-span-3",
  },
];

type Activity = { id: string; date: string; icon: AppIcon; tone: "amber" | "primary"; text: string };

const getProfile = () => store.getProfile();
const getMoods = () => store.getMoods();
const getSessions = () => store.getConfidenceSessions();
const getReframes = () => store.getReframes();
const getDays = () => store.getActiveDays();

function greetingFor(hour: number) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function relativeDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const days = Math.round(
    (new Date(today.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86_400_000
  );
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function HomeDashboard() {
  const profile = useStoreValue<Profile>(getProfile, {});
  const moods = useStoreValue(getMoods, []);
  const sessions = useStoreValue(getSessions, []);
  const reframes = useStoreValue(getReframes, []);
  const days = useStoreValue<string[]>(getDays, []);
  const [greeting, setGreeting] = useState("Hello");
  const [mounted, setMounted] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours()));
    setMounted(true);
  }, []);

  const activity = useMemo<Activity[]>(() => {
    const all: Activity[] = [
      ...moods.map((m) => ({
        id: m.id,
        date: m.date,
        icon: Smiley,
        tone: "primary" as const,
        text: `Checked in feeling ${moodLabel(m.mood).toLowerCase()}`,
      })),
      ...sessions.map((s) => ({
        id: s.id,
        date: s.date,
        icon: Sparkle,
        tone: "amber" as const,
        text: `Confidence session (${s.situation}) · ${s.before} → ${s.after}`,
      })),
      ...reframes.map((r) => ({
        id: r.id,
        date: r.date,
        icon: Brain,
        tone: "primary" as const,
        text: `Reframed a thought · ${r.emotion} ${r.intensityBefore} → ${r.intensityAfter}`,
      })),
    ];
    return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [moods, sessions, reframes]);

  const headline = `${greeting}${profile.name ? `, ${profile.name}` : ""}.`;

  return (
    <div className="flex flex-col gap-16 sm:gap-24">
      {/* Greeting — warm peach band with a real photo card (public/images/home.jpg) */}
      <header className="band-peach relative isolate grid overflow-hidden rounded-[2rem] grid-cols-1 sm:rounded-[2.5rem] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex min-w-0 flex-col justify-center gap-6 px-6 py-10 sm:px-12 sm:py-16 lg:py-20">
          <Reveal3D immediate tilt={0}>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] opacity-75">
              <span aria-hidden className="h-px w-8 bg-current" />
              Home
            </p>
          </Reveal3D>
          {/* Keyed so the word reveal re-runs cleanly once the local greeting/name is known. */}
          <SplitHeading key={headline} as="h1" immediate className="text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl">
            {headline}
          </SplitHeading>
          <Reveal3D immediate delay={0.3} tilt={0}>
            <p className="max-w-md text-lg leading-relaxed opacity-80 sm:text-xl">
              One small step today is <span className="font-heading text-[1.35em] italic leading-none">enough</span>.
            </p>
          </Reveal3D>
          <Reveal3D immediate delay={0.45} tilt={0} className="flex flex-wrap items-center gap-3 pt-2">
            {mounted && !profile.confirmedAdult && (
              <Button asChild size="lg" className="group px-6">
                <Link href="/start">
                  <HandWaving className="size-5" /> <span className="sm:hidden">1-minute quick start</span><span className="hidden sm:inline">Take the 1-minute quick start</span>
                  <ArrowRight weight="bold" className="transition-transform duration-500 ease-[var(--ease-calm)] group-hover:translate-x-1" />
                </Link>
              </Button>
            )}
            <div className="inline-flex h-13 items-center gap-3 rounded-full bg-card/85 py-2 pl-2 pr-5 text-card-foreground shadow-[var(--glass-shadow)]">
              <span className="grid size-9 place-items-center rounded-full bg-accent text-ember">
                <CalendarDots className="size-5" aria-hidden />
              </span>
              <p className="flex items-baseline gap-2">
                <CountUp immediate delay={0.5} value={days.length} className="font-heading text-3xl leading-none" />
                <span className="text-[13px] text-muted-foreground">{days.length === 1 ? "day" : "days"} you showed up</span>
              </p>
            </div>
          </Reveal3D>
        </div>
        <div className="relative px-4 pb-4 sm:px-6 sm:pb-6 lg:py-6 lg:pl-0">
          <div className="relative aspect-[4/3] h-full min-h-56 overflow-hidden rounded-[1.6rem] bg-blush sm:aspect-[2/1] lg:aspect-auto">
            {!photoFailed && (
              <Image
                src="/images/home.jpg"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
                onError={() => setPhotoFailed(true)}
              />
            )}
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[12px] font-medium text-foreground backdrop-blur">
              <LockSimple className="size-3.5 text-ember" aria-hidden /> Private · just for you
            </span>
          </div>
        </div>
      </header>

      <Reveal3D immediate delay={0.25} tilt={6}>
        <MoodCheckIn />
      </Reveal3D>

      {/* Tools — editorial bento */}
      <section aria-labelledby="tools-title" className="flex flex-col gap-8">
        <SectionTitle id="tools-title" eyebrow="Your toolkit">
          Small tools, <span className="italic text-ember">real</span> moments
        </SectionTitle>
        <Reveal3D tilt={6} className="grid gap-4 sm:grid-cols-2 lg:auto-rows-[minmax(13rem,auto)] lg:grid-cols-12 lg:gap-5">
          {TOOLS.map((t) => (
            <div key={t.href} data-reveal className={cn("h-full", t.span)}>
              <ToolCard tool={t} />
            </div>
          ))}
        </Reveal3D>
      </section>

      {/* Recent activity — periwinkle band */}
      <section
        aria-labelledby="activity-title"
        className="band-periwinkle -mx-4 flex flex-col gap-8 px-4 py-12 sm:mx-0 sm:rounded-[2.5rem] sm:px-10 sm:py-14"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionTitle id="activity-title" eyebrow="Lately">
            Recent activity
          </SectionTitle>
          <Button asChild variant="outline" className="group bg-card">
            <Link href="/progress">
              See progress
              <ArrowUpRight
                weight="bold"
                className="size-4 transition-transform duration-500 ease-[var(--ease-calm)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
        </div>
        <Reveal3D tilt={6}>
          <GlassSurface interactive={false} className="rounded-[1.75rem] p-2 sm:p-3">
            {activity.length === 0 ? (
              <p className="m-1 rounded-[1.4rem] bg-blush px-5 py-10 text-center text-[15px] text-muted-foreground">
                Nothing yet — your check-ins and sessions will show up here.
              </p>
            ) : (
              <ul className="flex flex-col">
                {activity.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <li
                      key={a.id}
                      className={cn("flex min-h-14 items-center gap-3.5 px-3 py-3 sm:px-4", i > 0 && "border-t border-border")}
                    >
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-full",
                          a.tone === "amber" ? "bg-accent text-ember" : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[15px]">{a.text}</span>
                      <span className="shrink-0 text-[13px] text-muted-foreground">{relativeDay(a.date)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </GlassSurface>
        </Reveal3D>
        <DeviceNote />
      </section>
    </div>
  );
}

function SectionTitle({ id, eyebrow, children }: { id: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">{eyebrow}</p>
      <SplitHeading as="h2" className="text-4xl leading-[1.05] sm:text-5xl">
        <span id={id}>{children}</span>
      </SplitHeading>
    </div>
  );
}

function ToolCard({ tool: t }: { tool: Tool }) {
  const Icon = t.icon;
  return (
    <GlassSurface
      className={cn(
        "group h-full focus-within:ring-3 focus-within:ring-ring/50",
        t.feature ? "rounded-[2rem] border-transparent bg-accent" : "rounded-[1.75rem]"
      )}
    >
      <Link
        href={t.href}
        className={cn("flex h-full flex-col gap-5 outline-none", t.feature ? "min-h-72 p-7 sm:p-9" : "p-6 sm:p-7")}
      >
        <span className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-full transition-transform duration-700 ease-[var(--ease-calm)] group-hover:scale-105",
              t.feature ? "size-14 bg-ember text-white" : "size-12 bg-accent text-ember"
            )}
          >
            <Icon className={t.feature ? "size-7" : "size-6"} weight={t.feature ? "fill" : "duotone"} />
          </span>
          <span className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition-[background-color,color,transform,border-color] duration-500 ease-[var(--ease-calm)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpRight weight="bold" className="size-4" />
          </span>
        </span>
        {t.feature && (
          <span aria-hidden className="mt-auto flex items-baseline gap-2 pt-4 text-ember">
            <span className="font-heading text-7xl italic leading-none sm:text-8xl">60</span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">seconds</span>
          </span>
        )}
        <span className={cn("flex flex-col gap-2", !t.feature && "mt-auto")}>
          <span className={cn("font-heading leading-[1.05]", t.feature ? "text-4xl sm:text-[2.75rem]" : "text-3xl")}>
            {t.title}
          </span>
          <span
            className={cn("block leading-relaxed text-muted-foreground", t.feature ? "text-base sm:text-[1.0625rem]" : "text-[15px]")}
          >
            {t.blurb}
          </span>
        </span>
      </Link>
    </GlassSurface>
  );
}
