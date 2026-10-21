"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircle, Info, Warning, WarningOctagon, CircleNotch } from "@/components/icons"

/** Toasts: small white editorial cards (Phosphor icons, calm colours). */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CheckCircle weight="fill" className="size-5 text-ember" />,
        info: <Info weight="fill" className="size-5 text-primary" />,
        warning: <Warning weight="fill" className="size-5 text-amber" />,
        error: <WarningOctagon weight="fill" className="size-5 text-foreground" />,
        loading: <CircleNotch weight="bold" className="size-5 animate-spin text-primary" />,
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--glass-stroke-soft)",
          "--border-radius": "1.25rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast font-sans gap-3! px-4! py-3.5! text-[0.9375rem]! tracking-[-0.01em] shadow-[var(--glass-shadow)]!",
          title: "font-medium!",
          description: "text-muted-foreground!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
