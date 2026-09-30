"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon, XIcon } from "lucide-react"
import { cn } from "cn"

// Chips are the interactive tag: they always look pressable (border, hover),
// so they never read as a static Badge. On touch screens the hit area grows
// to 48px tall; keep ChipGroup's 8px gap between them.
const chipVariants = cva(
  "relative inline-flex shrink-0 items-center gap-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:-inset-y-2 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-7 px-2.5",
        default: "h-8 px-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/**
 * Pressable tag. Pass `selected`, `defaultSelected` or `onSelectedChange` to
 * make it a filter/selection chip (aria-pressed, check icon when on);
 * otherwise it is a plain action chip.
 */
function Chip({
  className,
  size = "default",
  selected,
  defaultSelected,
  onSelectedChange,
  icon,
  onClick,
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "type"> &
  VariantProps<typeof chipVariants> & {
    selected?: boolean
    defaultSelected?: boolean
    onSelectedChange?: (selected: boolean) => void
    icon?: React.ReactNode
  }) {
  const [uncontrolled, setUncontrolled] = React.useState(
    defaultSelected ?? false
  )
  const toggles =
    selected !== undefined ||
    defaultSelected !== undefined ||
    onSelectedChange !== undefined
  const isOn = toggles && (selected ?? uncontrolled)

  function handlesClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented || !toggles) {
      return
    }
    if (selected === undefined) {
      setUncontrolled(!isOn)
    }
    onSelectedChange?.(!isOn)
  }

  return (
    <button
      type="button"
      data-slot="chip"
      data-size={size}
      data-selected={isOn || undefined}
      aria-pressed={toggles ? isOn : undefined}
      onClick={handlesClick}
      className={cn(
        chipVariants({ size }),
        isOn
          ? "border-primary/25 bg-primary/10 text-foreground hover:bg-primary/15"
          : "border-border bg-background text-foreground hover:bg-muted",
        className
      )}
      {...props}
    >
      {isOn ? <CheckIcon /> : icon}
      {children}
    </button>
  )
}

/** Active filter with a remove button. The chip itself is not clickable. */
function FilterChip({
  className,
  size = "default",
  icon,
  onRemove,
  removeLabel,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof chipVariants> & {
    icon?: React.ReactNode
    onRemove: () => void
    removeLabel?: string
  }) {
  const fallbackLabel =
    typeof children === "string" ? `Remove ${children}` : "Remove filter"

  return (
    <span
      data-slot="filter-chip"
      data-size={size}
      className={cn(
        chipVariants({ size }),
        "border-primary/25 bg-primary/10 pr-1 text-foreground pointer-coarse:after:hidden",
        className
      )}
      {...props}
    >
      {icon}
      {children}
      <button
        type="button"
        data-slot="filter-chip-remove"
        aria-label={removeLabel ?? fallbackLabel}
        onClick={onRemove}
        className="relative grid size-5 place-items-center rounded-full text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 pointer-coarse:after:absolute pointer-coarse:after:-inset-3 [&_svg]:size-3"
      >
        <XIcon />
      </button>
    </span>
  )
}

/** Wraps chips with the 8px gap that keeps taps from landing on a neighbour. */
function ChipGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="chip-group"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

export { Chip, ChipGroup, FilterChip, chipVariants }
