"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * A card holding a tight grid of small tiles, after the Windows tray
 * overflow flyout: one icon per cell, the label on hover. Pass `items`, or
 * compose `CardGridItem` children for anything else in a cell: an avatar,
 * an icon under a NotificationBadge, a color swatch or an emoji. Icons and
 * images are sized to the grid; other elements keep their own size.
 *
 * Arrow keys, Home and End move focus between tiles.
 *
 * <CardGrid columns={5} items={apps} onItemSelect={(item) => open(item)} />
 */

export type CardGridEntry = {
  id: string
  /** Tooltip and accessible name. */
  label: string
  icon: React.ReactNode
  /** Renders the tile as a link instead of a button. */
  href?: string
  onSelect?: () => void
  disabled?: boolean
}

const cardGridVariants = cva(
  "inline-grid w-max grid-cols-[repeat(var(--card-grid-columns),auto)] rounded-xl border",
  {
    variants: {
      appearance: {
        default: "border-border bg-card text-card-foreground",
        outline: "border-border bg-transparent",
        muted: "border-transparent bg-muted",
        elevated: "border-border/50 bg-popover text-popover-foreground shadow-lg",
      },
      size: {
        sm: "gap-0.5 p-1.5 [--card-grid-cell:--spacing(8)] [--card-grid-icon:--spacing(4)]",
        default:
          "gap-1 p-2 [--card-grid-cell:--spacing(10)] [--card-grid-icon:--spacing(5)]",
        lg: "gap-1.5 p-3 [--card-grid-cell:--spacing(12)] [--card-grid-icon:--spacing(7)]",
      },
    },
    defaultVariants: {
      appearance: "default",
      size: "default",
    },
  }
)

function focusesSibling(event: React.KeyboardEvent<HTMLDivElement>) {
  const tiles = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      "[data-slot=card-grid-item]:not(:disabled)"
    )
  )
  const index = tiles.indexOf(document.activeElement as HTMLElement)
  if (index === -1) return

  const columns = Number(
    getComputedStyle(event.currentTarget).getPropertyValue("--card-grid-columns")
  )
  const step: Record<string, number> = {
    ArrowRight: 1,
    ArrowLeft: -1,
    ArrowDown: columns,
    ArrowUp: -columns,
  }

  let next: number | undefined
  if (event.key in step) next = index + step[event.key]
  else if (event.key === "Home") next = 0
  else if (event.key === "End") next = tiles.length - 1
  if (next === undefined) return

  event.preventDefault()
  tiles[Math.min(Math.max(next, 0), tiles.length - 1)]?.focus()
}

function CardGrid({
  items,
  columns = 5,
  appearance,
  size,
  onItemSelect,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardGridVariants> & {
    items?: CardGridEntry[]
    columns?: number
    /** Called for every tile selected, after the item's own `onSelect`. */
    onItemSelect?: (item: CardGridEntry) => void
  }) {
  return (
    <div
      role="group"
      data-slot="card-grid"
      onKeyDown={focusesSibling}
      style={
        { "--card-grid-columns": columns, ...style } as React.CSSProperties
      }
      className={cn(cardGridVariants({ appearance, size }), className)}
      {...props}
    >
      {items?.map((item) => (
        <CardGridItem
          key={item.id}
          label={item.label}
          href={item.href}
          disabled={item.disabled}
          onSelect={() => {
            item.onSelect?.()
            onItemSelect?.(item)
          }}
        >
          {item.icon}
        </CardGridItem>
      ))}
      {children}
    </div>
  )
}

function CardGridItem({
  label,
  href,
  disabled,
  selected,
  onSelect,
  className,
  children,
}: {
  /** Tooltip and accessible name. */
  label: string
  /** Renders the tile as a link instead of a button. */
  href?: string
  disabled?: boolean
  /** Marks the tile as the current choice, for pickers. */
  selected?: boolean
  onSelect?: () => void
  className?: string
  children: React.ReactNode
}) {
  const props = {
    "data-slot": "card-grid-item",
    title: label,
    "aria-label": label,
    onClick: onSelect,
    "data-selected": selected || undefined,
    className: cn(
      "flex size-(--card-grid-cell) items-center justify-center rounded-md outline-none transition-colors hover:bg-foreground/8 focus-visible:ring-2 focus-visible:ring-ring active:bg-foreground/12 disabled:pointer-events-none disabled:opacity-40 data-selected:bg-foreground/10 data-selected:ring-2 data-selected:ring-foreground/40",
      className
    ),
  }
  const icon = (
    <span
      aria-hidden
      // Emoji and other text scale with the icon size.
      className="flex min-h-(--card-grid-icon) min-w-(--card-grid-icon) items-center justify-center text-(length:--card-grid-icon) leading-none [&>img]:size-(--card-grid-icon) [&>img]:object-contain [&>svg]:size-(--card-grid-icon)"
    >
      {children}
    </span>
  )

  return href && !disabled ? (
    <a href={href} {...props}>
      {icon}
    </a>
  ) : (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      {...props}
    >
      {icon}
    </button>
  )
}

export { CardGrid, CardGridItem }
