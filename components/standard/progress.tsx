"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cn } from "cn"

import { Progress as ProgressBar } from "@/components/ui/progress"

const progressVariants = cva("", {
  variants: {
    size: {
      xs: "h-1",
      sm: "h-1.5",
      default: "h-2",
      lg: "h-3",
      xl: "h-4",
    },
    // Colours the ui indicator from the root, since it takes no className.
    tone: {
      default: "",
      success: "*:data-[slot=progress-indicator]:bg-success",
      warning: "*:data-[slot=progress-indicator]:bg-warning",
      danger: "*:data-[slot=progress-indicator]:bg-destructive",
    },
  },
  defaultVariants: {
    size: "default",
    tone: "default",
  },
})

const segmentToneClassName = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
} as const

// A third-width bar that sweeps across; the animation overrides the
// indicator's inline transform, starting from translateX(-100%).
const indeterminateClassName =
  "*:data-[slot=progress-indicator]:w-1/3 *:data-[slot=progress-indicator]:flex-none *:data-[slot=progress-indicator]:rounded-full *:data-[slot=progress-indicator]:animate-out *:data-[slot=progress-indicator]:repeat-infinite *:data-[slot=progress-indicator]:duration-1000 *:data-[slot=progress-indicator]:ease-in-out *:data-[slot=progress-indicator]:[--tw-exit-translate-x:300%]"

const TICK_DURATION_MS = 700

/**
 * Rolls each number from its last shown value to its target, easing out.
 * Jumps straight to the targets when off or when reduced motion is on.
 */
function useTickedValues(targets: number[], enabled: boolean) {
  const key = targets.join(",")
  const [shown, setShown] = React.useState(() => targets.map(() => 0))
  // Last painted values, so a new target rolls on from where the bar is.
  const shownRef = React.useRef<number[]>([])

  React.useEffect(() => {
    if (!enabled) {
      return
    }

    const to = key.split(",").map(Number)
    const from = to.map((_, index) => shownRef.current[index] ?? 0)
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const duration = reduced ? 0 : TICK_DURATION_MS
    const start = performance.now()
    let frame = 0
    const step = (now: number) => {
      const t = duration ? Math.min(1, (now - start) / duration) : 1
      const eased = 1 - (1 - t) ** 3
      const next = to.map(
        (target, index) => from[index] + (target - from[index]) * eased
      )
      shownRef.current = next
      setShown(next)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [key, enabled])

  return enabled ? shown : targets
}

type ProgressSegment = {
  id?: string
  /** Share of `max`, stacked after the previous segments. */
  value: number
  className?: string
  tone?: keyof typeof segmentToneClassName
}

type ProgressProps = Omit<
  React.ComponentProps<typeof ProgressBar>,
  "value" | "max"
> &
  VariantProps<typeof progressVariants> & {
    value?: number | null
    max?: number
    /** Several coloured parts in one bar. `value` is ignored. */
    segments?: ProgressSegment[]
    /** Unknown duration: a bar sweeps back and forth. */
    indeterminate?: boolean
    /** Text above the bar, left. */
    label?: React.ReactNode
    /** Shows the percentage above the bar, right. */
    showValue?: boolean
    /**
     * Counts the percentage up to `value` (from 0 on mount, then from the last
     * value) and fills the bar in step. Turns `showValue` on.
     */
    ticker?: boolean
    /** Prints each segment's percentage inside its slice. Best at `size="xl"`. */
    showSegmentValues?: boolean
  }

function Progress({
  className,
  value = 0,
  max = 100,
  size = "default",
  tone = "default",
  segments,
  indeterminate = false,
  label,
  showValue = false,
  ticker = false,
  showSegmentValues = false,
  ...props
}: ProgressProps) {
  const toPercent = (part: number) =>
    max > 0 ? Math.min(100, Math.max(0, (part / max) * 100)) : 0
  const targets = segments
    ? segments.map((segment) => toPercent(segment.value))
    : [toPercent(value ?? 0)]
  const ticked = useTickedValues(targets, ticker && !indeterminate)
  const segmentPercents = segments ? ticked : []
  const percent = Math.min(
    100,
    ticked.reduce((sum, part) => sum + part, 0)
  )
  const displayValue = showValue || ticker
  const hasHeader = label !== undefined || displayValue
  const ariaLabel =
    props["aria-label"] ?? (typeof label === "string" ? label : undefined)

  const rootClassName = cn(
    "h-2 rounded-full",
    progressVariants({ size, tone }),
    hasHeader ? undefined : className
  )

  const bar = segments ? (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-size={size}
      value={Math.min(100, targets.reduce((sum, part) => sum + part, 0))}
      max={100}
      aria-label={ariaLabel}
      className={cn(
        "relative flex w-full items-center overflow-hidden bg-muted",
        rootClassName
      )}
      {...props}
    >
      {segments.map((segment, index) => (
        <ProgressPrimitive.Indicator
          key={segment.id ?? index}
          data-slot="progress-segment"
          data-tone={segment.tone ?? "default"}
          className={cn(
            "flex h-full shrink-0 items-center justify-center overflow-hidden",
            !ticker && "transition-[width]",
            segmentToneClassName[segment.tone ?? "default"],
            segment.className
          )}
          style={{ width: `${segmentPercents[index] ?? 0}%` }}
        >
          {showSegmentValues ? (
            <span className="px-1 text-[10px] leading-none font-medium text-primary-foreground tabular-nums">
              {Math.round(segmentPercents[index] ?? 0)}%
            </span>
          ) : null}
        </ProgressPrimitive.Indicator>
      ))}
    </ProgressPrimitive.Root>
  ) : (
    <ProgressBar
      data-size={size}
      data-tone={tone}
      value={indeterminate ? null : percent}
      max={100}
      aria-label={ariaLabel}
      className={cn(
        rootClassName,
        indeterminate && indeterminateClassName,
        // Each frame already moves the bar; a CSS transition would lag it.
        ticker && "*:data-[slot=progress-indicator]:transition-none"
      )}
      {...props}
    />
  )

  if (!hasHeader) {
    return bar
  }

  return (
    <div
      data-slot="progress-field"
      className={cn("flex w-full flex-col gap-1.5", className)}
    >
      <div className="flex items-baseline justify-between gap-2 text-sm">
        {label !== undefined ? <span className="font-medium">{label}</span> : <span />}
        {displayValue && !indeterminate ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {Math.round(percent)}%
          </span>
        ) : null}
      </div>
      {bar}
    </div>
  )
}

export { Progress, progressVariants, type ProgressSegment }
