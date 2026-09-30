"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/standard/badge"
import { ButtonIcon } from "@/components/standard/button-icon"
import { NotificationBadge } from "@/components/standard/notification-badge"

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
      <Badge
        data-slot="toolbar-count"
        data-variant="pill"
        tone="quiet"
        size="lg"
        aria-live="polite"
        className={cn("tabular-nums", className)}
        {...props}
      >
        {label}
      </Badge>
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
 * Count bubble pinned to the corner of a button. A NotificationBadge with
 * toolbar defaults: brand tone and a "N new" label. Hidden at zero unless
 * `showZero`.
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
  return (
    <span data-slot="toolbar-count-badge" className="inline-flex">
      <NotificationBadge
        className={className}
        count={count}
        max={max}
        dot={false}
        tone={tone}
        showZero={showZero}
        label={`${count} new`}
      >
        {children}
      </NotificationBadge>
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
      <Badge shape="circle">{formatsCount(count, 999)}</Badge>
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
