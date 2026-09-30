"use client"

import * as React from "react"
import { cn } from "cn"

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/standard/popover"
import { Tooltip, type TooltipTone } from "@/components/standard/tooltip"

type ResponsiveTooltipMode = "auto" | "tooltip" | "popover"

// A touch screen can't hover, so a hover tooltip never opens there. Devices
// whose primary input can't hover (or is a finger) get a popover instead.
const TOUCH_QUERY = "(hover: none), (pointer: coarse)"

function subscribesToTouch(onChange: () => void) {
  const media = window.matchMedia(TOUCH_QUERY)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

// The server can't know the device, so it renders the tooltip and a touch
// device swaps to the popover once hydrated.
function useIsTouch() {
  return React.useSyncExternalStore(
    subscribesToTouch,
    () => window.matchMedia(TOUCH_QUERY).matches,
    () => false
  )
}

type ResponsiveTooltipProps = {
  /** Visible text of the default trigger button. */
  label?: string
  /** What the hint says: the tooltip's text and the popover's body. */
  content?: React.ReactNode
  /** Heading above the content, shown in the popover only. */
  title?: React.ReactNode
  /** Keyboard shortcut after the tooltip text. Hidden in the popover. */
  shortcut?: React.ReactNode
  tone?: TooltipTone
  /**
   * `auto` shows a hover tooltip on devices that can hover and a tap popover
   * on touch devices. `tooltip` and `popover` force one.
   */
  mode?: ResponsiveTooltipMode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  /** Tooltip open delay in ms. Defaults to the provider's (200). */
  delayDuration?: number
  /** Classes for the popover panel. */
  popoverClassName?: string
  /** The trigger. Must accept a ref and props, e.g. a button. */
  children?: React.ReactNode
}

/**
 * One hint, two forms: a tooltip on hover for mouse and trackpad, and a popover
 * on tap for touch, where a hover tooltip can't open.
 */
function ResponsiveTooltip({
  label,
  content,
  title,
  shortcut,
  tone = "default",
  mode = "auto",
  side = "top",
  align = "center",
  delayDuration,
  popoverClassName,
  children,
}: ResponsiveTooltipProps) {
  const isTouch = useIsTouch()
  const showsPopover = mode === "popover" || (mode === "auto" && isTouch)

  const triggerNode = children ?? (
    <button
      type="button"
      className="rounded-md border border-border px-2 py-1 text-xs"
    >
      {label}
    </button>
  )

  if (!showsPopover) {
    return (
      <Tooltip
        content={content}
        shortcut={shortcut}
        tone={tone}
        side={side}
        align={align}
        delayDuration={delayDuration}
      >
        {triggerNode}
      </Tooltip>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{triggerNode}</PopoverTrigger>
      <PopoverContent
        data-slot="responsive-tooltip-popover"
        data-tone={tone}
        variant="arrow"
        side={side}
        align={align}
        // Phones are narrow: keep the panel off the screen edge.
        collisionPadding={8}
        // A hint, not a dialog: focus stays on the trigger.
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn("w-auto max-w-64", popoverClassName)}
      >
        <PopoverHeader>
          {title == null ? null : (
            <PopoverTitle
              className={cn(tone === "danger" && "text-destructive")}
            >
              {title}
            </PopoverTitle>
          )}
          {content == null ? null : (
            <PopoverDescription
              className={cn(
                title == null && "text-popover-foreground",
                title == null && tone === "danger" && "text-destructive"
              )}
            >
              {content}
            </PopoverDescription>
          )}
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

export { ResponsiveTooltip }
export type { ResponsiveTooltipMode, ResponsiveTooltipProps }
