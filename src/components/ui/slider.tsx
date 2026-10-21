"use client"

import * as React from "react"
import { cn } from "cn"
import { Slider as SliderPrimitive } from "radix-ui"

/** Flat blush track, ember range, white round thumb with ember ring. */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center py-3 select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col data-vertical:px-3 data-vertical:py-0",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow bg-muted overflow-hidden rounded-full data-horizontal:h-2.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-2.5"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute rounded-full bg-ember select-none data-horizontal:h-full data-vertical:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative block size-7 shrink-0 cursor-grab rounded-full border-2 border-ember bg-white shadow-[0_3px_10px_-2px_rgba(0,0,0,0.22)] transition-[box-shadow,transform] duration-500 ease-[var(--ease-glass)] select-none after:absolute after:-inset-2.5 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.22),0_0_0_7px_color-mix(in_oklab,var(--ember)_16%,transparent)] focus-visible:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.22),0_0_0_7px_color-mix(in_oklab,var(--ember)_26%,transparent)] focus-visible:outline-hidden active:scale-110 active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
