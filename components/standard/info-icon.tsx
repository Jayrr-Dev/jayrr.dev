"use client"

import * as React from "react"
import { CircleAlertIcon, CircleHelpIcon, InfoIcon as LucideInfo } from "lucide-react"
import { cn } from "cn"

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/standard/popover"
import { Tooltip } from "@/components/standard/tooltip"

type InfoIconTone = "info" | "help" | "alert"

type InfoIconProps = {
  className?: string
  /** Accessible name of the icon button, and the popover's title. */
  label: string
  body: string
  /** Picks the glyph: info (i), help (?), alert (!). Alert tooltips turn red. */
  tone?: InfoIconTone
  /** `popover` opens a titled note on click; `tooltip` shows the body on hover. */
  type?: "popover" | "tooltip"
}

function readingInfoGlyph(tone: InfoIconTone) {
  if (tone === "help") {
    return <CircleHelpIcon className="size-4" />
  }
  if (tone === "alert") {
    return <CircleAlertIcon className="size-4" />
  }
  return <LucideInfo className="size-4" />
}

function InfoIcon({
  className,
  label,
  body,
  tone = "info",
  type = "popover",
}: InfoIconProps) {
  const glyph = (
    <button
      type="button"
      data-slot="info-icon"
      data-tone={tone}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 rounded-full p-1 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      {readingInfoGlyph(tone)}
    </button>
  )

  if (type === "tooltip") {
    const tooltipTone = tone === "alert" ? "danger" : "default"
    return (
      <Tooltip content={body} tone={tooltipTone}>
        {glyph}
      </Tooltip>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{glyph}</PopoverTrigger>
      <PopoverContent align="end" side="bottom" className="w-56">
        <PopoverHeader>
          <PopoverTitle>{label}</PopoverTitle>
          <PopoverDescription>{body}</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Preset of InfoIcon with the help (?) glyph, for "what is this?" notes next
 * to a field or title. Same as `<InfoIcon tone="help">`; takes every other
 * InfoIcon prop, including `type`.
 */
function QuestionIcon(props: Omit<InfoIconProps, "tone">) {
  return <InfoIcon {...props} tone="help" />
}

export { InfoIcon, QuestionIcon }
export type { InfoIconProps, InfoIconTone }
