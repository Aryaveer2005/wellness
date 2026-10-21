"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CaretDown,
  Devices,
  Info,
  MagnifyingGlass,
  MagnifyingGlassMinus,
  MapPin,
  Translate,
  Wallet,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { SplitHeading } from "@/components/motion/split-heading";
import { formatFee, modeLabel, psychologists, type Mode, type Psychologist } from "./data";

const FEE_RANGES = {
  any: { label: "Any fee", min: 0, max: Infinity },
  low: { label: "Under ₹1,000", min: 0, max: 999 },
  mid: { label: "₹1,000 – ₹2,000", min: 1000, max: 2000 },
  high: { label: "Above ₹2,000", min: 2001, max: Infinity },
} as const;
type FeeKey = keyof typeof FEE_RANGES;

const cities = [...new Set(psychologists.map((p) => p.city))].sort();
const languages = [...new Set(psychologists.flatMap((p) => p.languages))].sort();
const ALL_SIG = psychologists.map((p) => p.id).join("|");

const selectClass =
  "h-11 w-full appearance-none rounded-full border border-transparent bg-blush pl-4 pr-9 text-sm text-foreground outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/40 dark:[color-scheme:dark] [&>option]:bg-background";

function matchesFee(p: Psychologist, key: FeeKey) {
  const r = FEE_RANGES[key];
  // Overlap between the professional's fee range and the chosen range.
  return p.feeMin <= r.max && p.feeMax >= r.min;
}

export function Directory() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [language, setLanguage] = useState("all");
  const [mode, setMode] = useState<"all" | Mode>("all");
  const [fee, setFee] = useState<FeeKey>("any");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return psychologists.filter((p) => {
      if (city !== "all" && p.city !== city) return false;
      if (language !== "all" && !p.languages.includes(language)) return false;
      if (mode !== "all" && !p.modes.includes(mode)) return false;
      if (!matchesFee(p, fee)) return false;
      if (!q) return true;
      return [p.name, p.title, p.city, ...p.specialties, ...p.languages].join(" ").toLowerCase().includes(q);
    });
  }, [query, city, language, mode, fee]);

  const hasFilters = query || city !== "all" || language !== "all" || mode !== "all" || fee !== "any";
  const sig = filtered.map((p) => p.id).join("|");

  function reset() {
    setQuery("");
    setCity("all");
    setLanguage("all");
    setMode("all");
    setFee("any");
  }

  return (
    <section aria-labelledby="directory-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ember"><span aria-hidden className="h-px w-8 bg-ember" />Directory</p>
        <SplitHeading as="h2" className="text-4xl leading-[1.05] sm:text-5xl">
          <span id="directory-heading">
            Find a <span className="italic text-ember">psychologist</span>
          </span>
        </SplitHeading>
        <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-[1.0625rem]">
          Talking to a professional is a strong move, not a weak one. Booking happens on their own website.
        </p>
      </div>

      <div role="note" className="band-blush flex items-start gap-3 rounded-2xl px-4 py-3.5 text-sm">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card text-ember">
          <Info className="size-4" aria-hidden />
        </span>
        <p className="self-center leading-relaxed">
          <strong>Sample listings</strong> — owner will add verified professionals. The names and details below are
          placeholders, not real people.
        </p>
      </div>

      {/* Filter bar — sticks under the header on desktop */}
      <div className="liquid-glass z-20 rounded-[1.75rem] p-3 sm:p-4 md:sticky md:top-[calc(5.5rem+env(safe-area-inset-top,0px))]">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <label htmlFor="dir-search" className="sr-only">
              Search psychologists
            </label>
            <MagnifyingGlass
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              weight="bold"
              aria-hidden
            />
            <Input
              id="dir-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city or topic (e.g. anxiety)"
              className="rounded-full pl-11 pr-4"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Filter id="dir-city" label="City">
              <select id="dir-city" className={selectClass} value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="all">All cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Filter>
            <Filter id="dir-language" label="Language">
              <select id="dir-language" className={selectClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="all">Any language</option>
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Filter>
            <Filter id="dir-mode" label="Mode">
              <select
                id="dir-mode"
                className={selectClass}
                value={mode}
                onChange={(e) => setMode(e.target.value as "all" | Mode)}
              >
                <option value="all">Any mode</option>
                <option value="online">Online</option>
                <option value="in-person">In person</option>
              </select>
            </Filter>
            <Filter id="dir-fee" label="Fee per session">
              <select id="dir-fee" className={selectClass} value={fee} onChange={(e) => setFee(e.target.value as FeeKey)}>
                {Object.entries(FEE_RANGES).map(([k, r]) => (
                  <option key={k} value={k}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Filter>
          </div>
          <div className="flex min-h-6 items-center justify-between px-1 text-[13px] text-muted-foreground" aria-live="polite">
            <span>
              {filtered.length} {filtered.length === 1 ? "listing" : "listings"}
            </span>
            {hasFilters && (
              <Button variant="link" size="sm" onClick={reset} className="h-auto p-0">
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="band-blush flex flex-col items-center gap-3 rounded-3xl px-6 py-10 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-card text-ember">
            <MagnifyingGlassMinus className="size-6" aria-hidden />
          </span>
          <p className="font-heading text-2xl">No matches</p>
          <p className="text-sm text-muted-foreground">Try removing a filter or searching a different word.</p>
        </div>
      ) : (
        <Reveal3D key={sig} immediate={sig !== ALL_SIG} stagger={0.07} tilt={6}>
          <ul className="perspective-1200 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <li key={p.id} data-reveal>
                <PsychologistCard p={p} />
              </li>
            ))}
          </ul>
        </Reveal3D>
      )}
    </section>
  );
}

function Filter({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="px-1 text-[12px] font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        {children}
        <CaretDown
          className="pointer-events-none absolute right-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          weight="bold"
          aria-hidden
        />
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .replace(/^(Dr\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function PsychologistCard({ p }: { p: Psychologist }) {
  return (
    <Link
      href={`/psychologists/${p.id}`}
      className="liquid-glass liquid-glass-hover group relative flex h-full flex-col items-center gap-4 rounded-3xl px-5 pb-5 pt-7 text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-6"
    >
      {p.placeholder && (
        <Badge variant="glass" className="absolute right-4 top-4">
          Sample
        </Badge>
      )}
      {/* Circle monogram in the reference's "team portrait" style — initials only, never a photo. */}
      <span
        aria-hidden
        className="grid size-24 shrink-0 place-items-center rounded-full border-[1.5px] border-foreground bg-blush p-1"
      >
        <span className="grid size-full place-items-center rounded-full bg-[color-mix(in_oklab,var(--foreground)_8%,var(--card))] font-display text-[2.25rem] text-foreground">
          {initials(p.name)}
        </span>
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-[1.625rem] leading-tight">{p.name}</h3>
        <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">{p.title}</p>
      </div>
      <div className="flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-ember" aria-hidden /> {p.city}
        </span>
        <span className="inline-flex items-center gap-2">
          <Translate className="size-4 shrink-0 text-ember" aria-hidden /> {p.languages.join(", ")}
        </span>
        <span className="inline-flex flex-wrap items-center justify-center gap-x-2">
          <Wallet className="size-4 shrink-0 text-ember" aria-hidden /> {formatFee(p)}
          {p.placeholder && <span className="text-xs">(placeholder)</span>}
        </span>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {p.modes.map((m) => (
          <span key={m} className="inline-flex items-center gap-1 rounded-full bg-periwinkle px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            <Devices className="size-3.5" aria-hidden />
            {modeLabel[m]}
          </span>
        ))}
      </div>
      <span className="mt-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">
        View profile
        <ArrowRight className="size-4 transition-transform duration-500 ease-[var(--ease-glass)] group-hover:translate-x-1" weight="bold" aria-hidden />
      </span>
    </Link>
  );
}
