"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowCounterClockwise, Smiley, Sparkle } from "@/components/icons";
import { GlassSurface } from "@/components/motion/glass-surface";
import { EXPRESSIONS } from "./confidence-content";
import { cn } from "@/lib/utils";

/**
 * "Suggested expression" for the Confidence boost.
 * - Tips: hand-written coaching from confidence-content.ts (always shown).
 * - Illustration: generated on our server (FLUX.2 klein via NVIDIA) from a fixed,
 *   realistic close-up photo prompt (brows to chin) — clearly labelled as an AI-generated photo.
 *   Displayed in a 16:10 crop anchored low (object-position 50% 85%) so the hairline is never shown.
 *   Never stored; if it fails, the tips still work on their own.
 */

type Status = "idle" | "loading" | "ready" | "error";

export function useExpression() {
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const forId = useRef<string | null>(null);
  const seedRef = useRef<number | undefined>(undefined);
  const ctrl = useRef<AbortController | null>(null);

  const request = useCallback(async (situationId: string, { force = false } = {}) => {
    if (!force && forId.current === situationId) return; // already have / fetching this one
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    forId.current = situationId;
    setStatus("loading");
    setImage(null);
    try {
      const res = await fetch("/api/expression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // "Show another" → ask for a different verified drawing than the one on screen.
        body: JSON.stringify({ situation: situationId, exclude: force ? seedRef.current : undefined }),
        signal: c.signal,
      });
      const data = (await res.json()) as { image?: string; seed?: number };
      if (c.signal.aborted) return;
      if (res.ok && data.image?.startsWith("data:image/")) {
        setImage(data.image);
        seedRef.current = data.seed;
        setStatus("ready");
      } else setStatus("error");
    } catch {
      if (!c.signal.aborted) setStatus("error");
    }
  }, []);

  return { image, status, request };
}

export function ExpressionCard({
  situationId,
  image,
  status,
  onAnother,
  compact = false,
  className,
}: {
  situationId: string;
  image: string | null;
  status: Status;
  onAnother?: () => void;
  compact?: boolean;
  className?: string;
}) {
  const exp = EXPRESSIONS[situationId] ?? EXPRESSIONS.boost;

  const art = (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-blush",
        compact ? "aspect-[16/10] w-32 rounded-2xl sm:w-40" : "aspect-[16/10] w-full rounded-[1.4rem] sm:w-80"
      )}
    >
      {status === "ready" && image ? (
        // eslint-disable-next-line @next/next/no-img-element -- generated data URL, not a static asset
        <img
          src={image}
          alt={`Close-up of a ${exp.title.toLowerCase()} facial expression (AI-generated photo)`}
          className="size-full object-cover object-[50%_85%]"
        />
      ) : status === "loading" ? (
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.65)_50%,transparent_70%)] bg-[length:200%_100%]" aria-label="Creating the example…" />
      ) : (
        <div className="grid size-full place-items-center text-muted-foreground">
          <Smiley className={compact ? "size-10" : "size-16"} />
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <GlassSurface interactive={false} className={cn("flex items-center gap-4 rounded-[1.75rem] p-3 pr-5", className)}>
        <div>{art}</div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ember">Wear this expression</p>
          <p className="mt-1 font-heading text-2xl italic leading-tight">{exp.title}</p>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">{exp.tips[0]}</p>
        </div>
      </GlassSurface>
    );
  }

  return (
    <GlassSurface interactive={false} className={cn("rounded-[2rem] p-3 sm:p-4", className)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
        <div className="flex flex-col items-start gap-2.5 sm:shrink-0">
          {art}
          {status === "ready" && (
            <span className="inline-flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
              <Sparkle className="size-3.5" /> AI-generated photo · not a real person · not saved
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 px-3 pb-3 sm:py-3 sm:pr-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Suggested expression</p>
          <h3 className="mt-2 text-4xl leading-[1.05]">
            <span className="italic">{exp.title}</span>
          </h3>
          <ol className="mt-5 divide-y divide-border border-y border-border">
            {exp.tips.map((t, i) => (
              <li key={t} className="flex gap-4 py-3 text-[0.9375rem] leading-relaxed">
                <span className="font-heading text-xl italic leading-6 text-ember tabular-nums" aria-hidden>
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
          {onAnother && (
            <button
              type="button"
              onClick={onAnother}
              disabled={status === "loading"}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-foreground outline-none transition-colors hover:border-foreground/30 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <ArrowCounterClockwise className="size-4" /> {status === "error" ? "Try again" : "Show another example"}
            </button>
          )}
        </div>
      </div>
    </GlassSurface>
  );
}
