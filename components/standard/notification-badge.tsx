import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const notificationBadgeVariants = cva(
  "pointer-events-none inline-grid shrink-0 place-items-center rounded-full leading-none font-semibold tabular-nums",
  {
    variants: {
      tone: {
        alert: "bg-destructive text-white",
        brand: "bg-primary text-primary-foreground",
        neutral: "bg-foreground text-background",
      },
      shape: {
        dot: "size-2",
        count: "h-4 min-w-4 px-1 text-[11px]",
      },
    },
    defaultVariants: {
      tone: "alert",
      shape: "count",
    },
  }
)

function formatsCount(count: number, max: number) {
  return count > max ? `${max}+` : `${count}`
}

/**
 * Unread marker. With `count` it shows the number (capped at `max`); without
 * one, or with `dot`, it shows a small dot. Wrap an icon to pin it to the
 * corner, or render it alone to sit inline. Hidden at zero unless `showZero`.
 *
 * The visual badge is hidden from screen readers and `label` is read instead.
 * When wrapping a control that has its own aria-label, put the count there.
 */
function NotificationBadge({
  className,
  count,
  max = 99,
  dot,
  tone = "alert",
  showZero = false,
  label,
  children,
}: VariantProps<typeof notificationBadgeVariants> & {
  className?: string
  count?: number
  max?: number
  dot?: boolean
  showZero?: boolean
  label?: string
  children?: React.ReactNode
}) {
  const isDot = dot ?? count === undefined
  const visible = isDot || (count ?? 0) > 0 || showZero
  const spoken =
    label ?? (isDot || count === undefined ? "New" : `${count} unread`)

  const badge = visible ? (
    <>
      <span
        aria-hidden="true"
        data-slot="notification-badge"
        data-tone={tone}
        data-shape={isDot ? "dot" : "count"}
        className={cn(
          notificationBadgeVariants({ tone, shape: isDot ? "dot" : "count" }),
          children
            ? cn(
                "absolute ring-2 ring-background",
                // Dots sit inside the corner; counts start near the corner and grow outward.
                isDot ? "top-0 right-0" : "-top-1.5 left-[calc(100%-0.625rem)]"
              )
            : undefined,
          className
        )}
      >
        {isDot ? null : formatsCount(count ?? 0, max)}
      </span>
      <span className="sr-only">{spoken}</span>
    </>
  ) : null

  if (!children) {
    return badge
  }

  return (
    <span
      data-slot="notification-badge-anchor"
      className="relative inline-flex"
    >
      {children}
      {badge}
    </span>
  )
}

export { NotificationBadge, notificationBadgeVariants }
