"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { cn } from "cn"

import { BadgePill, CircleBadge } from "@/components/standard/badge-pill"
import { ButtonIcon } from "@/components/standard/button-icon"

function formatsCount(count: number, max?: number) {
  if (max !== undefined && count > max) {
    return `${max.toLocaleString()}+`
  }
  return count.toLocaleString()
}

function pluralizes(count: number, noun: string, plural?: string) {
  return count === 1 ? noun : (plural ?? `${noun}s`)
}

/** Result count for a toolbar: "24 jobs", "3 of 120 jobs", or "No jobs". */
function ToolbarCount({
  className,
  count,
  total,
  noun = "item",
  plural,
  variant = "text",
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  count: number
  total?: number
  noun?: string
  plural?: string
  variant?: "text" | "pill"
}) {
  const word = pluralizes(total ?? count, noun, plural)
  const label =
    count === 0 && total === undefined
      ? `No ${pluralizes(0, noun, plural)}`
      : total === undefined
        ? `${formatsCount(count)} ${word}`
        : `${formatsCount(count)} of ${formatsCount(total)} ${word}`

  if (variant === "pill") {
    return (
      <BadgePill
        data-slot="toolbar-count"
        data-variant="pill"
        tone="quiet"
        aria-live="polite"
        className={cn("tabular-nums", className)}
        {...props}
      >
        {label}
      </BadgePill>
    )
  }

  return (
    <span
      data-slot="toolbar-count"
      data-variant="text"
      aria-live="polite"
      className={cn(
        "px-1 text-xs whitespace-nowrap text-muted-foreground tabular-nums",
        className
      )}
      {...props}
    >
      {label}
    </span>
  )
}

/**
 * Count bubble pinned to the corner of a button. Wrap the button so the
 * bubble has a positioned parent. Hidden at zero unless `showZero`.
 */
function ToolbarCountBadge({
  className,
  count,
  max = 99,
  tone = "default",
  showZero = false,
  children,
}: {
  className?: string
  count: number
  max?: number
  tone?: "default" | "danger"
  showZero?: boolean
  children: React.ReactNode
}) {
  const visible = count > 0 || showZero

  return (
    <span data-slot="toolbar-count-badge" className="relative inline-flex">
      {children}
      {visible ? (
        <CircleBadge
          aria-label={`${count} new`}
          className={cn(
            "pointer-events-none absolute -top-1.5 -right-1.5 text-[11px] ring-2 ring-background",
            tone === "danger" ? "bg-destructive text-white" : undefined,
            className
          )}
        >
          {formatsCount(count, max)}
        </CircleBadge>
      ) : null}
    </span>
  )
}

/** "3 selected" chip with a clear button, shown while rows are selected. */
function ToolbarSelectionCount({
  className,
  count,
  onClear,
}: {
  className?: string
  count: number
  onClear?: () => void
}) {
  if (count === 0) {
    return null
  }

  return (
    <span
      data-slot="toolbar-selection-count"
      aria-live="polite"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 pr-1 pl-2.5 text-xs font-medium text-foreground tabular-nums",
        className
      )}
    >
      <CircleBadge>{formatsCount(count, 999)}</CircleBadge>
      selected
      {onClear ? (
        <ButtonIcon
          label="Clear selection"
          tone="ghost"
          className="size-6 [&_svg]:size-3.5"
          onClick={onClear}
        >
          <XIcon />
        </ButtonIcon>
      ) : null}
    </span>
  )
}

export { ToolbarCount, ToolbarCountBadge, ToolbarSelectionCount }
