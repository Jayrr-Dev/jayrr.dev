"use client"

import * as React from "react"
import { cn } from "cn"
import { Tooltip as TooltipPrimitive } from "radix-ui"

// Wait before the first tooltip opens, then open neighbors instantly (no
// delay, no animation) while the page is "warm" after one closes.
// https://blog.master.dev/tooltips-need-a-delay-and-then-they-need-to-skip-it/
const TOOLTIP_DELAY_DURATION = 200
const TOOLTIP_SKIP_DELAY_DURATION = 300

const TooltipProviderContext = React.createContext(false)

// Tooltips only share the warm window when they share a provider, so mount
// one near the root. Tooltips rendered without one fall back to their own.
function TooltipProvider({
  delayDuration = TOOLTIP_DELAY_DURATION,
  skipDelayDuration = TOOLTIP_SKIP_DELAY_DURATION,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipProviderContext.Provider value={true}>
      <TooltipPrimitive.Provider
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
        {...props}
      />
    </TooltipProviderContext.Provider>
  )
}

function Tooltip({
  label,
  body,
  tone = "default",
  delayDuration,
  skipDelayDuration,
  children,
}: {
  label: string
  body: string
  tone?: "default" | "danger"
  /** Open delay in ms while the page is cold. Defaults to the provider's (200). */
  delayDuration?: number
  /** Warm window in ms, only used when no TooltipProvider is mounted (300). */
  skipDelayDuration?: number
  children?: React.ReactNode
}) {
  const hasProvider = React.useContext(TooltipProviderContext)

  const tooltip = (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>
        {children ?? (
          <button
            type="button"
            className="rounded-md border border-border px-2 py-1 text-xs"
          >
            {label}
          </button>
        )}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className={cn(
            "z-50 max-w-xs rounded-md px-2 py-1 text-xs shadow-md data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
            tone === "danger"
              ? "bg-destructive text-white"
              : "bg-foreground text-background"
          )}
        >
          {body}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )

  if (hasProvider) {
    return tooltip
  }

  return (
    <TooltipProvider skipDelayDuration={skipDelayDuration}>
      {tooltip}
    </TooltipProvider>
  )
}

export { Tooltip, TooltipProvider }
