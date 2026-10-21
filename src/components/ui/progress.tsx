"use client"

import * as React from "react"
import { cn } from "cn"
import { Progress as ProgressPrimitive } from "radix-ui"
import { useProgressSound } from "@/hooks/use-progress-sound"

function Progress({
  className,
  value,
  sounds = true,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { sounds?: boolean }) {
  useProgressSound(sounds ? value || 0 : 0, 100)
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-2 bg-muted w-full items-center overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 rounded-full bg-ember transition-transform duration-700 ease-[var(--ease-glass)]"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
