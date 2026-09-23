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

function readingInfoGlyph(tone: "info" | "help" | "alert") {
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
}: {
  className?: string
  label: string
  body: string
  tone?: "info" | "help" | "alert"
  type?: "popover" | "tooltip"
}) {
  const glyph = (
    <button
      type="button"
      data-slot="info-icon"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {readingInfoGlyph(tone)}
    </button>
  )

  if (type === "tooltip") {
    const tooltipTone = tone === "alert" ? "danger" : "default"
    return (
      <Tooltip label={label} body={body} tone={tooltipTone}>
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

function QuestionIcon({
  className,
  label,
  body,
}: {
  className?: string
  label: string
  body: string
}) {
  return (
    <InfoIcon className={className} label={label} body={body} tone="help" />
  )
}

export { InfoIcon, QuestionIcon }
