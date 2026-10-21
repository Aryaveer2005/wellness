"use client";

import { useRef, useState } from "react";
import {
  ArrowSquareOut,
  CircleNotch,
  CloudSlash,
  Globe,
  MagnifyingGlass,
  MagnifyingGlassMinus,
  MapPin,
  NavigationArrow,
  SealCheck,
  Phone,
  ShieldCheck,
  Star,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import type { NearbyPlace, NearbyResponse } from "@/lib/places";

type State =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: Extract<NearbyResponse, { ok: true }> };

export function NearbyPsychiatrists({ header }: { header?: React.ReactNode }) {
  const [state, setState] = useState<State>({ status: "idle" });
  const [city, setCity] = useState("");
  const [locationNote, setLocationNote] = useState<string | null>(null);

  async function runSearch(query: string) {
    setState({ status: "loading" });
    try {
      const res = await fetch(`/api/psychiatrists/nearby?${query}`, { cache: "no-store" });
      const data = (await res.json()) as NearbyResponse;
      if (!data.ok) setState({ status: "error", message: data.error });
      else setState({ status: "done", data });
    } catch {
      setState({ status: "error", message: "We couldn't connect. Check your internet and try again." });
    }
  }

  function handleUseLocation() {
    setLocationNote(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationNote("Your browser can't share location. Type your city below instead.");
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams({
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4),
        });
        void runSearch(params.toString());
      },
      (err) => {
        setState({ status: "idle" });
        setLocationNote(
          err.code === err.PERMISSION_DENIED
            ? "No problem — location is off. Type your city below instead."
            : "We couldn't get your location. Type your city below instead.",
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }

  function onCitySubmit(e: React.FormEvent) {
    e.preventDefault();
    const c = city.trim();
    if (c.length < 2) {
      setState({ status: "error", message: "Please type a city name." });
      return;
    }
    void runSearch(new URLSearchParams({ city: c }).toString());
  }

  const busy = state.status === "locating" || state.status === "loading";

  return (
    <section aria-labelledby="nearby-heading" className="flex flex-col">
      {/* Hero search band — full-bleed periwinkle, like the reference's "How it works" band */}
      <div className="band-periwinkle mx-[calc(50%-50vw)] -mt-8 sm:-mt-12">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
          <div className="flex min-w-0 flex-col">{header}</div>

          <Reveal3D immediate delay={0.35} tilt={0}>
            <div className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card p-5 shadow-[var(--glass-shadow)] sm:p-7">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Near you</p>
                <h2 id="nearby-heading" className="text-[2rem] leading-[1.05] sm:text-[2.5rem]">
                  Top 5 <span className="italic text-ember">psychiatrists</span> near me
                </h2>
                <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                  Ranked by rating <em>and</em> number of reviews, so a handful of 5-star reviews doesn&apos;t beat hundreds
                  of good ones.
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                <Button size="lg" className="h-14 w-full text-base" onClick={handleUseLocation} disabled={busy}>
                  {state.status === "locating" ? (
                    <CircleNotch className="size-5 animate-spin" weight="bold" aria-hidden />
                  ) : (
                    <span className="relative grid size-6 place-items-center" aria-hidden>
                      <span className="absolute inset-0 animate-ping rounded-full bg-primary-foreground/35 motion-reduce:hidden" />
                      <NavigationArrow className="relative size-5" weight="fill" />
                    </span>
                  )}
                  {state.status === "locating" ? "Getting your location…" : "Use my location"}
                </Button>
                <p className="flex items-start gap-1.5 text-[13px] text-muted-foreground">
                  <ShieldCheck className="mt-px size-4 shrink-0 text-ember" aria-hidden />
                  Your location is used only for this search and is never stored.
                </p>
                {locationNote && (
                  <p role="status" className="text-sm text-foreground">
                    {locationNote}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.16em] text-muted-foreground" aria-hidden>
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={onCitySubmit} className="flex items-center gap-1.5 rounded-full bg-blush p-1.5 focus-within:ring-4 focus-within:ring-ring/15" role="search" aria-label="Search psychiatrists by city">
                <label htmlFor="nearby-city" className="sr-only">
                  City
                </label>
                <MapPin className="ml-2.5 size-5 shrink-0 text-ember" aria-hidden />
                <Input
                  id="nearby-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Search by city, e.g. Pune"
                  autoComplete="address-level2"
                  maxLength={80}
                  className="h-11 min-w-0 flex-1 rounded-full border-0 bg-transparent px-1.5 shadow-none focus-visible:bg-transparent focus-visible:ring-0"
                />
                <Button type="submit" variant="outline" className="h-11 shrink-0 bg-card px-4" disabled={busy}>
                  <MagnifyingGlass className="size-5" weight="bold" aria-hidden />
                  <span className="sr-only sm:not-sr-only">Search</span>
                </Button>
              </form>
            </div>
          </Reveal3D>
        </div>
      </div>

      <div className="[&:not(:empty)]:mt-10 sm:[&:not(:empty)]:mt-14" aria-live="polite" aria-busy={busy}>
        <Results state={state} />
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            {state.status === "done" && state.data.source === "google"
              ? "Ratings come from Google reviews and aren’t an endorsement by EaseMind."
              : state.status === "done"
                ? "Listings come from OpenStreetMap and aren’t an endorsement by EaseMind."
                : "Results come from public map listings and aren’t an endorsement by EaseMind."}{" "}
        Always check credentials (e.g. RCI / NMC registration) before booking.
      </p>
    </section>
  );
}

/** Shimmering card placeholders while results load. */
function SkeletonList() {
  const ref = useRef<HTMLUListElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-shimmer]",
        { xPercent: -100 },
        { xPercent: 100, duration: 1.6, ease: "sine.inOut", repeat: -1, stagger: 0.12 }
      );
    },
    { scope: ref }
  );
  const bar = "rounded-full bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]";
  return (
    <ul ref={ref} className="flex flex-col gap-3" aria-label="Loading results">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="relative flex gap-4 overflow-hidden rounded-3xl border border-border bg-card p-5">
          <span
            data-shimmer
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(100deg,transparent_20%,var(--sheen)_50%,transparent_80%)]"
          />
          <span className={`h-12 w-10 shrink-0 ${bar}`} />
          <div className="flex flex-1 flex-col gap-2.5 pt-1">
            <span className={`h-4 w-2/3 ${bar}`} />
            <span className={`h-3 w-1/3 ${bar}`} />
            <span className={`h-3 w-5/6 ${bar}`} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Notice({ icon: Icon, title, children }: { icon: typeof CloudSlash; title: string; children: React.ReactNode }) {
  return (
    <div className="band-blush flex flex-col items-center gap-3 rounded-3xl px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-card text-ember">
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="font-heading text-2xl">{title}</p>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function Results({ state }: { state: State }) {
  if (state.status === "idle" || state.status === "locating") return null;

  if (state.status === "loading") return <SkeletonList />;

  if (state.status === "error") {
    return (
      <Notice icon={CloudSlash} title="Couldn't load results">
        {state.message}
      </Notice>
    );
  }

  const { data } = state;
  if (data.results.length === 0) {
    return (
      <Notice icon={MagnifyingGlassMinus} title="No psychiatrists found nearby">
        Try a nearby bigger city, or browse the online professionals in the directory below.
      </Notice>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!data.ratingsAvailable && (
        <p className="band-blush rounded-2xl px-4 py-3 text-sm">Ratings unavailable — showing nearest instead.</p>
      )}
      <Reveal3D key={data.results.map((r) => r.id).join("|")} immediate stagger={0.09} tilt={6}>
        <ol className="perspective-1200 flex flex-col gap-3">
          {data.results.map((place, i) => (
            <li key={place.id} data-reveal>
              <PlaceCard place={place} rank={i + 1} showRating={data.ratingsAvailable} />
            </li>
          ))}
        </ol>
      </Reveal3D>
      <p className="text-right text-[11px] text-muted-foreground">
        {data.source === "google"
          ? `Within ${data.radiusKm ?? 15} km · ranked by rating, number of reviews and distance · Results from Google`
          : "© OpenStreetMap contributors"}
      </p>
    </div>
  );
}

function PlaceCard({ place, rank, showRating }: { place: NearbyPlace; rank: number; showRating: boolean }) {
  return (
    <div className="liquid-glass liquid-glass-hover flex gap-4 rounded-3xl p-5 sm:gap-7 sm:p-7">
      <div
        aria-label={`Rank ${rank}`}
        className="w-12 shrink-0 border-r border-border pr-3 text-center font-display text-[3.25rem] leading-[0.9] text-foreground sm:w-20 sm:pr-5 sm:text-[4.5rem]"
      >
        <span className={rank === 1 ? "italic text-ember" : undefined}>{rank}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3
          className="text-[1.5rem] leading-tight sm:text-[1.75rem]"
          title={place.fullName && place.fullName !== place.name ? place.fullName : undefined}
        >
          {place.name}
        </h3>
        {place.psychiatryConfirmed && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            <SealCheck className="size-4" weight="fill" aria-hidden /> Psychiatry listed on Google
          </span>
        )}

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {showRating && place.rating !== null && (
            <span className="inline-flex items-center gap-1.5">
              <Stars rating={place.rating} />
              <span className="font-semibold tabular-nums">{place.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({(place.userRatingCount ?? 0).toLocaleString("en-IN")} review{place.userRatingCount === 1 ? "" : "s"})
              </span>
              <span className="sr-only">
                Rated {place.rating.toFixed(1)} out of 5 from {place.userRatingCount ?? 0} reviews
              </span>
            </span>
          )}
          {place.distanceKm !== null && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium">
              <NavigationArrow className="size-3.5 text-ember" weight="fill" aria-hidden />
              {place.distanceKm} km away
            </span>
          )}
          {place.openNow !== null && (
            <span
              className={
                place.openNow
                  ? "rounded-full bg-periwinkle px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  : "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              }
            >
              {place.openNow ? "Open now" : "Closed now"}
            </span>
          )}
        </div>

        {place.address && (
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="break-words">{place.address}</span>
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="h-10 px-4">
            <a href={place.mapsUrl} target="_blank" rel="noopener noreferrer">
              <ArrowSquareOut aria-hidden /> <span>Open in Maps</span>
            </a>
          </Button>
          {place.websiteUrl && (
            <Button asChild variant="outline" size="sm" className="h-10 px-4">
              <a href={place.websiteUrl} target="_blank" rel="noopener noreferrer">
                <Globe aria-hidden /> <span>Website</span>
              </a>
            </Button>
          )}
          {place.phone && (
            <Button asChild variant="outline" size="sm" className="h-10 px-4">
              <a href={`tel:${place.phone.replace(/[^\d+]/g, "")}`} aria-label={`Call ${place.name}`}>
                <Phone aria-hidden /> <span>Call</span>
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Five ember stars, filled to the nearest half. Decorative — the number is read out separately. */
function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="inline-flex items-center gap-px text-ember" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="size-4"
          weight={rounded >= i + 1 ? "fill" : rounded >= i + 0.5 ? "duotone" : "regular"}
        />
      ))}
    </span>
  );
}
