"use client"

import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

/** iOS-style switch: flat track, white thumb, ember when on. */
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full p-[2px] outline-none transition-[background,box-shadow] duration-500 ease-[var(--ease-glass)] group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-2 after:-inset-y-2 focus-visible:ring-4 focus-visible:ring-ring/25 aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "data-[size=default]:h-[31px] data-[size=default]:w-[51px] data-[size=sm]:h-6 data-[size=sm]:w-10",
        "data-unchecked:bg-[color-mix(in_oklab,var(--foreground)_14%,transparent)]",
        "data-checked:bg-ember",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.16),0_1px_1px_rgba(0,0,0,0.10)] ring-0 transition-transform duration-500 ease-[cubic-bezier(0.34,1.36,0.64,1)]",
          "group-data-[size=default]/switch:size-[27px] group-data-[size=sm]/switch:size-5",
          "data-unchecked:translate-x-0 group-data-[size=default]/switch:data-checked:translate-x-[20px] group-data-[size=sm]/switch:data-checked:translate-x-4"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
