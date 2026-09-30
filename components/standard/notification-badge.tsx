import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "cn"

type NotificationBadgeTone = "danger" | "default" | "quiet"
type NotificationBadgeSize = "inline" | "sm" | "default"
type NotificationBadgePlacement =
  "top-end" | "top-start" | "bottom-end" | "bottom-start"

const notificationBadgeVariants = cva(
  "pointer-events-none isolate inline-grid shrink-0 place-items-center rounded-full leading-none font-semibold tabular-nums",
  {
    variants: {
      tone: {
        danger: "bg-destructive text-white",
        default: "bg-primary text-primary-foreground",
        quiet: "bg-foreground text-background",
      },
      shape: {
        dot: "",
        count: "",
      },
      // `inline` sizes in em so it sits inside a button or a line of text.
      size: {
        inline: "",
        sm: "",
        default: "",
      },
    },
    compoundVariants: [
      { shape: "dot", size: "inline", className: "size-[0.5em]" },
      { shape: "dot", size: "sm", className: "size-1.5" },
      { shape: "dot", size: "default", className: "size-2" },
      {
        shape: "count",
        size: "inline",
        className: "h-[1.5em] min-w-[1.5em] px-[0.25em] text-[0.75em]",
      },
      {
        shape: "count",
        size: "sm",
        className: "h-3.5 min-w-3.5 px-0.5 text-[10px]",
      },
      {
        shape: "count",
        size: "default",
        className: "h-4 min-w-4 px-1 text-[11px]",
      },
    ],
    defaultVariants: {
      tone: "danger",
      shape: "count",
      size: "default",
    },
  }
)

// Dots sit inside the corner; counts start near the corner and grow outward.
const PLACEMENT_CLASSES: Record<
  NotificationBadgePlacement,
  { dot: string; count: string }
> = {
  "top-end": {
    dot: "top-0 end-0",
    count: "-top-1.5 start-[calc(100%-0.625rem)]",
  },
  "top-start": {
    dot: "top-0 start-0",
    count: "-top-1.5 end-[calc(100%-0.625rem)]",
  },
  "bottom-end": {
    dot: "bottom-0 end-0",
    count: "-bottom-1.5 start-[calc(100%-0.625rem)]",
  },
  "bottom-start": {
    dot: "bottom-0 start-0",
    count: "-bottom-1.5 end-[calc(100%-0.625rem)]",
  },
}

function formatsCount(count: number, max: number) {
  return count > max ? `${max.toLocaleString()}+` : count.toLocaleString()
}

/**
 * Unread marker. With `count` it shows the number (capped at `max`); without
 * one, or with `dot`, it shows a small dot. Wrap an icon to pin it to a
 * corner (`placement`), or render it alone to sit inline. Hidden at zero
 * unless `showZero`. `pulse` adds a soft ping, off under reduced motion.
 *
 * The visual badge is hidden from screen readers and `label` is read instead.
 * When wrapping a control that has its own aria-label, put the count there.
 */
function NotificationBadge({
  className,
  count,
  max = 99,
  dot,
  tone = "danger",
  size = "default",
  placement = "top-end",
  pulse = false,
  ring,
  showZero = false,
  label,
  children,
}: {
  className?: string
  count?: number
  max?: number
  dot?: boolean
  tone?: NotificationBadgeTone | null
  size?: NotificationBadgeSize | null
  /** Corner to pin to when wrapping a child. */
  placement?: NotificationBadgePlacement
  /** Soft ping behind the badge; skipped when the user prefers reduced motion. */
  pulse?: boolean
  /** Background-coloured ring that cuts it out of the child. On when wrapping. */
  ring?: boolean
  showZero?: boolean
  label?: string
  children?: React.ReactNode
}) {
  const isDot = dot ?? count === undefined
  const visible = isDot || (count ?? 0) > 0 || showZero
  const spoken =
    label ?? (isDot || count === undefined ? "New" : `${count} unread`)
  const resolvedTone: NotificationBadgeTone = tone ?? "danger"
  const shape = isDot ? "dot" : "count"
  const anchored = Boolean(children)
  const hasRing = ring ?? anchored

  const badge = visible ? (
    <>
      <span
        aria-hidden="true"
        data-slot="notification-badge"
        data-tone={resolvedTone}
        data-shape={shape}
        data-size={size ?? "default"}
        data-placement={anchored ? placement : undefined}
        className={cn(
          notificationBadgeVariants({ tone: resolvedTone, shape, size }),
          anchored
            ? cn("absolute", PLACEMENT_CLASSES[placement][shape])
            : "relative",
          hasRing ? "ring-2 ring-background" : undefined,
          className
        )}
      >
        {pulse ? (
          <span
            data-slot="notification-badge-pulse"
            className="absolute inset-0 -z-10 rounded-full bg-inherit opacity-60 motion-safe:animate-ping"
          />
        ) : null}
        {isDot ? null : formatsCount(count ?? 0, max)}
      </span>
      <span className="sr-only">{spoken}</span>
    </>
  ) : null

  if (!anchored) {
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
