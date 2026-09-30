"use client"

import * as React from "react"
import { cn } from "cn"

import { Kbd } from "@/components/ui/kbd"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipProvider as UiTooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type TooltipTone = "default" | "danger"

const TooltipProviderContext = React.createContext(false)

// Tooltips only share the warm window (see the ui TooltipProvider) when they
// share a provider, so mount one near the root. Tooltips rendered without one
// fall back to their own.
function TooltipProvider(
  props: React.ComponentProps<typeof UiTooltipProvider>
) {
  return (
    <TooltipProviderContext.Provider value={true}>
      <UiTooltipProvider {...props} />
    </TooltipProviderContext.Provider>
  )
}

// Recolors the bubble and its arrow (the svg inside the arrow's wrapper).
const TOOLTIP_TONE_CLASS: Record<TooltipTone, string> = {
  default: "",
  danger:
    "bg-destructive text-white [&>span>svg]:bg-destructive [&>span>svg]:fill-destructive",
}

function Tooltip({
  label,
  content,
  body,
  shortcut,
  tone = "default",
  trigger = "hover",
  side = "top",
  align = "center",
  delayDuration,
  skipDelayDuration,
  children,
}: {
  /**
   * Visible text of the default trigger button. Older callers also pass it
   * next to `children`; there it is ignored, as it always was.
   */
  label?: string
  /** What the tooltip says. */
  content?: React.ReactNode
  /** @deprecated Use content */
  body?: React.ReactNode
  /** Keyboard shortcut after the text. A string renders in a Kbd. */
  shortcut?: React.ReactNode
  tone?: TooltipTone
  /**
   * `hover` opens on hover and focus after a delay. `click` toggles on press
   * and stays until Escape, an outside click or a second press.
   */
  trigger?: "hover" | "click"
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  /** Open delay in ms while the page is cold. Defaults to the provider's (200). */
  delayDuration?: number
  /** Warm window in ms, only used when no TooltipProvider is mounted (300). */
  skipDelayDuration?: number
  /** The trigger. Must accept a ref and props, e.g. a button. */
  children?: React.ReactNode
}) {
  const hasProvider = React.useContext(TooltipProviderContext)
  const text = content ?? body

  const triggerNode = children ?? (
    <button
      type="button"
      className="rounded-md border border-border px-2 py-1 text-xs"
    >
      {label}
    </button>
  )

  const inner = (
    <>
      {text}
      {shortcut == null ? null : typeof shortcut === "string" ? (
        <Kbd>{shortcut}</Kbd>
      ) : (
        shortcut
      )}
    </>
  )

  if (trigger === "click") {
    // A toggletip: a non-modal popover drawn like a tooltip. Focus stays on
    // the trigger so it still reads as a hint, not a dialog.
    return (
      <Popover>
        <PopoverTrigger asChild>{triggerNode}</PopoverTrigger>
        <PopoverContent
          // Tooltip slot so a Kbd inside picks up the tooltip colors.
          data-slot="tooltip-content"
          data-tone={tone}
          variant="tooltip"
          side={side}
          align={align}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className={cn(
            "flex-row items-center gap-1.5 has-data-[slot=kbd]:pr-1.5",
            TOOLTIP_TONE_CLASS[tone]
          )}
        >
          {inner}
        </PopoverContent>
      </Popover>
    )
  }

  const tooltip = (
    <TooltipRoot delayDuration={delayDuration}>
      <TooltipTrigger asChild>{triggerNode}</TooltipTrigger>
      <TooltipContent
        data-tone={tone}
        side={side}
        align={align}
        sideOffset={4}
        className={TOOLTIP_TONE_CLASS[tone]}
      >
        {inner}
      </TooltipContent>
    </TooltipRoot>
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
export type { TooltipTone }
