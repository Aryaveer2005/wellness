"use client"

import * as React from "react"
import { cn } from "cn"
import { Separator as SeparatorPrimitive } from "radix-ui"

/** Hairline that fades out at both ends — reads as light on glass, not a hard rule. */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 data-horizontal:h-px data-horizontal:w-full data-horizontal:bg-[linear-gradient(90deg,transparent,var(--border)_12%,var(--border)_88%,transparent)] data-vertical:w-px data-vertical:self-stretch data-vertical:bg-[linear-gradient(180deg,transparent,var(--border)_12%,var(--border)_88%,transparent)]",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
