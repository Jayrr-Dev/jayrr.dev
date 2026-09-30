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
    },
    // Colours the ui indicator from the root, since it takes no className.
    tone: {
      default: "",
      success: "*:data-[slot=progress-indicator]:bg-emerald-500",
      warning: "*:data-[slot=progress-indicator]:bg-amber-500",
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
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-destructive",
} as const

// A third-width bar that sweeps across; the animation overrides the
// indicator's inline transform, starting from translateX(-100%).
const indeterminateClassName =
  "*:data-[slot=progress-indicator]:w-1/3 *:data-[slot=progress-indicator]:flex-none *:data-[slot=progress-indicator]:rounded-full *:data-[slot=progress-indicator]:animate-out *:data-[slot=progress-indicator]:repeat-infinite *:data-[slot=progress-indicator]:duration-1000 *:data-[slot=progress-indicator]:ease-in-out *:data-[slot=progress-indicator]:[--tw-exit-translate-x:300%]"

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
  ...props
}: ProgressProps) {
  const toPercent = (part: number) =>
    max > 0 ? Math.min(100, Math.max(0, (part / max) * 100)) : 0
  const total = segments
    ? segments.reduce((sum, segment) => sum + segment.value, 0)
    : (value ?? 0)
  const percent = toPercent(total)
  const hasHeader = label !== undefined || showValue
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
      value={percent}
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
            "h-full shrink-0 transition-[width]",
            segmentToneClassName[segment.tone ?? "default"],
            segment.className
          )}
          style={{ width: `${toPercent(segment.value)}%` }}
        />
      ))}
    </ProgressPrimitive.Root>
  ) : (
    <ProgressBar
      data-size={size}
      data-tone={tone}
      value={indeterminate ? null : percent}
      max={100}
      aria-label={ariaLabel}
      className={cn(rootClassName, indeterminate && indeterminateClassName)}
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
        {showValue && !indeterminate ? (
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
