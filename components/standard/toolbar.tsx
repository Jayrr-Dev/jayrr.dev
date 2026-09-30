"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import { ButtonIcon } from "@/components/standard/button-icon"
import { Divider } from "@/components/standard/divider"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"
import { Toggle } from "@/components/standard/toggle"
import { Tooltip } from "@/components/standard/tooltip"

export type ToolbarVariant = "default" | "docked"
export type ToolbarTone = "standard" | "vibrant"

/**
 * `docked` follows the Material 3 docked toolbar: a full-width 64px bar with
 * square corners and evenly spaced 40px actions, meant to sit on the bottom
 * edge of a screen or pane (position it with `sticky bottom-0` or `fixed`).
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

function withHint(
  hint: string | undefined,
  label: string,
  node: React.ReactElement
) {
  if (!hint) {
    return node
  }

  return (
    <Tooltip label={label} body={hint}>
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
    label,
    <ButtonIcon
      data-slot="toolbar-button"
      tone="ghost"
      label={label}
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
    label,
    <Toggle
      data-slot="toolbar-toggle"
      aria-label={label}
      className={cn(
        "size-8 border-transparent px-0 text-muted-foreground hover:text-foreground data-[pressed=true]:bg-muted data-[pressed=true]:text-foreground [&_svg]:size-4",
        TOOLBAR_ITEM_CLASS,
        "group-data-[variant=docked]/toolbar:data-[pressed=true]:bg-background group-data-[tone=vibrant]/toolbar:data-[pressed=true]:bg-primary-foreground group-data-[tone=vibrant]/toolbar:data-[pressed=true]:text-primary",
        className
      )}
      {...props}
    />
  )
}

export type ToolbarSelectOption = {
  value: string
  label: string
  icon?: React.ReactNode
}

function ToolbarSelect({
  className,
  label,
  options,
  value,
  onValueChange,
  disabled = false,
}: {
  className?: string
  label: string
  options: ToolbarSelectOption[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const current = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-slot="toolbar-select"
          tone="ghost"
          size="sm"
          aria-label={label}
          disabled={disabled}
          className={cn(
            "h-8 min-w-32 justify-between text-foreground group-data-[variant=docked]/toolbar:h-10 group-data-[variant=docked]/toolbar:rounded-full group-data-[tone=vibrant]/toolbar:text-primary-foreground group-data-[tone=vibrant]/toolbar:hover:bg-primary-foreground/10 [&_svg]:size-3.5",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {current?.icon}
            {current?.label ?? label}
          </span>
          <ChevronDownIcon className="text-muted-foreground group-data-[tone=vibrant]/toolbar:text-primary-foreground/70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 gap-0 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted [&_svg]:size-4 [&_svg]:text-muted-foreground",
              option.value === value ? "bg-muted" : undefined
            )}
            onClick={() => {
              onValueChange(option.value)
              setOpen(false)
            }}
          >
            {option.icon}
            <span className="flex-1">{option.label}</span>
            {option.value === value ? <CheckIcon /> : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSelect,
  ToolbarSeparator,
  ToolbarToggle,
}
