"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/** Big, thumb-friendly 0–N slider with the value shown large above it. */
export function RatingSlider({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  label,
  lowLabel,
  highLabel,
  accent = "primary",
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  lowLabel: string;
  highLabel: string;
  accent?: "primary" | "amber";
  suffix?: string;
}) {
  const amber = accent === "amber";
  return (
    <div className="space-y-6">
      <p
        className={cn(
          "text-center font-heading text-8xl leading-none tabular-nums sm:text-9xl",
          amber ? "text-ember" : "text-foreground"
        )}
        aria-live="polite"
      >
        {value}
        {suffix && (
          <span className="ml-1 align-top font-heading text-3xl italic text-muted-foreground sm:text-4xl">
            {suffix}
          </span>
        )}
      </p>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? value)}
        className={cn(
          "py-4",
          // flat blush track with a hairline
          "[&_[data-slot=slider-track]]:h-2.5! [&_[data-slot=slider-track]]:bg-blush [&_[data-slot=slider-track]]:ring-1 [&_[data-slot=slider-track]]:ring-border",
          "[&_[data-slot=slider-range]]:rounded-full",
          // white thumb with a coloured rim — large enough to grab with a thumb
          "[&_[data-slot=slider-thumb]]:size-8 [&_[data-slot=slider-thumb]]:border-[3px] [&_[data-slot=slider-thumb]]:bg-card",
          "[&_[data-slot=slider-thumb]]:shadow-[0_6px_16px_-6px_rgba(22,21,20,0.45)] [&_[data-slot=slider-thumb]]:transition-transform [&_[data-slot=slider-thumb]]:duration-300 [&_[data-slot=slider-thumb]:active]:scale-110",
          amber
            ? "[&_[data-slot=slider-range]]:bg-ember [&_[data-slot=slider-thumb]]:border-ember [&_[data-slot=slider-thumb]]:ring-ember/30"
            : "[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:border-primary"
        )}
      />
      <div className="flex justify-between text-[13px] text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
