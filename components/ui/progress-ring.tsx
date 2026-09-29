"use client"

import * as React from "react"
import { cn } from "cn"
import { Progress as ProgressPrimitive } from "radix-ui"

/**
 * A circular Progress. `children` sit in the center of the ring; `above` and
 * `below` stack outside it. Leave `value` undefined for a spinning,
 * indeterminate ring.
 *
 * Recolor the arc with `--progress-ring-color`:
 * <ProgressRing value={70} className="[--progress-ring-color:var(--color-emerald-500)]" />
 *
 * <ProgressRing value={64} above="Storage" below="64 of 100 GB">64%</ProgressRing>
 */
function ProgressRing({
  className,
  value,
  max = 100,
  size = 80,
  thickness = 8,
  above,
  below,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  value?: number | null
  max?: number
  /** Ring diameter in px. */
  size?: number
  /** Stroke width in px. */
  thickness?: number
  above?: React.ReactNode
  below?: React.ReactNode
  children?: React.ReactNode
}) {
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const indeterminate = value == null
  const ratio = indeterminate
    ? 0.25
    : Math.min(Math.max(value / max, 0), 1)

  return (
    <div
      data-slot="progress-ring"
      className={cn("inline-flex flex-col items-center gap-2", className)}
      {...props}
    >
      {above ? (
        <div
          data-slot="progress-ring-above"
          className="text-center text-sm font-medium"
        >
          {above}
        </div>
      ) : null}
      <ProgressPrimitive.Root
        value={indeterminate ? null : value}
        max={max}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className="relative grid shrink-0 place-items-center"
        style={{ width: size, height: size }}
      >
        <svg
          aria-hidden
          viewBox={`0 0 ${size} ${size}`}
          className={cn(
            "absolute inset-0 size-full -rotate-90",
            indeterminate && "animate-spin"
          )}
        >
          <circle
            data-slot="progress-ring-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            className="stroke-muted"
          />
          <ProgressPrimitive.Indicator asChild>
            <circle
              data-slot="progress-ring-indicator"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - ratio)}
              // A round cap would still draw a dot at 0%.
              opacity={ratio === 0 ? 0 : 1}
              className="stroke-(--progress-ring-color,var(--color-primary)) transition-[stroke-dashoffset] duration-500 ease-out"
            />
          </ProgressPrimitive.Indicator>
        </svg>
        {children ? (
          <div
            data-slot="progress-ring-content"
            className="relative flex flex-col items-center justify-center text-center text-sm font-medium tabular-nums"
          >
            {children}
          </div>
        ) : null}
      </ProgressPrimitive.Root>
      {below ? (
        <div
          data-slot="progress-ring-below"
          className="text-center text-xs text-muted-foreground"
        >
          {below}
        </div>
      ) : null}
    </div>
  )
}

export { ProgressRing }
