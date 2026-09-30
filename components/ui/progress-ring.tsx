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
 *
 * Pass `segments` for a ring of ticks that light up whole:
 * <ProgressRing value={80} segments={10}>80</ProgressRing>
 */
function ProgressRing({
  className,
  value,
  max = 100,
  size = 80,
  thickness = 8,
  segments,
  segmentGap = 4,
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
  /** Splits the ring into this many ticks; each lights up whole. */
  segments?: number
  /** Space between ticks in px, measured along the ring. */
  segmentGap?: number
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
  const segmentCount = segments && segments > 1 ? Math.floor(segments) : 0
  const step = segmentCount ? circumference / segmentCount : 0
  const segmentLength = Math.max(step - segmentGap, 0)
  const litSegments = Math.round(ratio * segmentCount)

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
          {segmentCount ? (
            // One dash per tick, offset around the ring. Half a gap leads,
            // so a gap (not a tick) sits at 12 o'clock.
            Array.from({ length: segmentCount }, (_, index) => (
              <circle
                key={index}
                data-slot="progress-ring-segment"
                data-lit={index < litSegments ? "" : undefined}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                strokeDasharray={`${segmentLength} ${circumference}`}
                strokeDashoffset={-(index * step + segmentGap / 2)}
                className={cn(
                  "transition-[stroke] duration-300 ease-out",
                  index < litSegments
                    ? "stroke-(--progress-ring-color,var(--color-primary))"
                    : "stroke-muted"
                )}
                style={{ transitionDelay: `${index * 25}ms` }}
              />
            ))
          ) : (
            <circle
              data-slot="progress-ring-track"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={thickness}
              className="stroke-muted"
            />
          )}
          {segmentCount ? null : (
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
          )}
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
