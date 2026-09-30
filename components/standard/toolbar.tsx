"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import { Divider } from "@/components/standard/divider"
import { Toggle } from "@/components/standard/toggle"
import { Tooltip } from "@/components/standard/tooltip"

export type ToolbarVariant = "default" | "docked" | "floating"
export type ToolbarTone = "standard" | "vibrant"

/**
 * `docked` follows the Material 3 docked toolbar: a full-width 64px bar with
 * square corners and evenly spaced 40px actions, meant to sit on the bottom
 * edge of a screen or pane (position it with `sticky bottom-0` or `fixed`).
 * `floating` is a rounded bar with a full border, for a toolbar that sits on
 * its own rather than along the edge of a pane.
 * `tone="vibrant"` swaps the surface for the primary color.
 */
function Toolbar({
  className,
  variant = "default",
  tone = "standard",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: ToolbarVariant
  tone?: ToolbarTone
}) {
  return (
    <div
      data-slot="toolbar"
      data-variant={variant}
      data-tone={tone}
      role="toolbar"
      className={cn(
        "group/toolbar flex items-center",
        variant === "docked"
          ? "h-16 w-full justify-evenly gap-2 border-t px-4"
          : variant === "floating"
            ? "flex-wrap gap-1 rounded-lg border p-1"
            : "flex-wrap gap-1 border-b p-1",
        tone === "vibrant"
          ? "border-transparent bg-primary text-primary-foreground"
          : variant === "docked"
            ? "border-border bg-muted"
            : "border-border bg-muted/30",
        className
      )}
      {...props}
    />
  )
}

function ToolbarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-group"
      role="group"
      className={cn(
        "flex items-center gap-0.5 group-data-[variant=docked]/toolbar:gap-2",
        className
      )}
      {...props}
    />
  )
}

function ToolbarSeparator({ className }: { className?: string }) {
  return (
    <Divider
      data-slot="toolbar-separator"
      orientation="vertical"
      className={cn(
        "mx-1 h-5 self-center group-data-[tone=vibrant]/toolbar:bg-primary-foreground/25 group-data-[variant=docked]/toolbar:h-6",
        className
      )}
    />
  )
}

// Docked actions grow to the M3 40px target; vibrant actions invert on press.
const TOOLBAR_ITEM_CLASS =
  "group-data-[variant=docked]/toolbar:size-10 group-data-[variant=docked]/toolbar:rounded-full group-data-[variant=docked]/toolbar:[&_svg]:size-5 group-data-[tone=vibrant]/toolbar:text-primary-foreground group-data-[tone=vibrant]/toolbar:hover:bg-primary-foreground/10 group-data-[tone=vibrant]/toolbar:hover:text-primary-foreground"

function withHint(hint: string | undefined, node: React.ReactElement) {
  if (!hint) {
    return node
  }

  return (
    <Tooltip content={hint}>
      {node}
    </Tooltip>
  )
}

function ToolbarButton({
  className,
  label,
  hint,
  ...props
}: React.ComponentProps<"button"> & { label: string; hint?: string }) {
  return withHint(
    hint,
    <Button
      iconOnly
      data-slot="toolbar-button"
      tone="ghost"
      aria-label={label}
      className={cn("[&_svg]:size-4", TOOLBAR_ITEM_CLASS, className)}
      {...props}
    />
  )
}

function ToolbarToggle({
  className,
  label,
  hint,
  ...props
}: React.ComponentProps<typeof Toggle> & { label: string; hint?: string }) {
  return withHint(
    hint,
    <Toggle
      data-slot="toolbar-toggle"
      tone="ghost"
      iconOnly
      aria-label={label}
      className={cn(
        "[&_svg]:size-4",
        TOOLBAR_ITEM_CLASS,
        "group-data-[variant=docked]/toolbar:data-[pressed=true]:bg-background group-data-[tone=vibrant]/toolbar:data-[pressed=true]:bg-primary-foreground group-data-[tone=vibrant]/toolbar:data-[pressed=true]:text-primary",
        className
      )}
      {...props}
    />
  )
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarToggle,
}
