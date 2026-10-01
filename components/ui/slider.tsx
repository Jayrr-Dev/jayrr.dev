"use client"

import * as React from "react"
import { cn } from "cn"
import { Slider as SliderPrimitive } from "radix-ui"

const MAX_AUTO_DIVISIONS = 20

type SliderVariant = "default" | "ticks" | "segments"
type SliderThumb = "circle" | "square" | "diamond" | "bar" | "pill" | "ring"

// Half each thumb's size along the track. Radix keeps the thumb inside the
// track, so thumb centres run from half to 100% - half; marks follow the same span.
const THUMB_HALF: Record<SliderThumb, string> = {
  circle: "0.375rem",
  square: "0.375rem",
  diamond: "0.375rem",
  ring: "0.5rem",
  bar: "0.125rem",
  pill: "0.625rem",
}

const THUMB_SHAPE: Record<
  SliderThumb,
  { horizontal: string; vertical: string }
> = {
  circle: {
    horizontal: "size-3 rounded-full",
    vertical: "size-3 rounded-full",
  },
  square: {
    horizontal: "size-3 rounded-[3px]",
    vertical: "size-3 rounded-[3px]",
  },
  diamond: {
    horizontal: "size-3 rotate-45 rounded-[2px]",
    vertical: "size-3 rotate-45 rounded-[2px]",
  },
  ring: {
    horizontal: "size-4 rounded-full border-4 border-primary bg-background",
    vertical: "size-4 rounded-full border-4 border-primary bg-background",
  },
  bar: { horizontal: "h-4 w-1 rounded-full", vertical: "h-1 w-4 rounded-full" },
  pill: {
    horizontal: "h-3 w-5 rounded-full",
    vertical: "h-5 w-3 rounded-full",
  },
}

type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** `ticks` draws a mark at each division; `segments` splits the track. */
  variant?: SliderVariant
  /** Shape of the knob. */
  thumb?: SliderThumb
  /** Intervals to divide the track into. Defaults to one per step, up to 20. */
  divisions?: number
}

function Slider({
  className,
  defaultValue,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  orientation = "horizontal",
  inverted = false,
  variant = "default",
  thumb = "circle",
  divisions,
  ...props
}: SliderProps) {
  const [uncontrolled, setUncontrolled] = React.useState(
    () => defaultValue ?? [min]
  )
  const current = value ?? uncontrolled

  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  const count = React.useMemo(() => {
    if (divisions && divisions > 0) return Math.round(divisions)
    const steps = Math.round((max - min) / step)
    return steps > 0 && steps <= MAX_AUTO_DIVISIONS ? steps : 10
  }, [divisions, max, min, step])

  const low = current.length > 1 ? Math.min(...current) : min
  const high = Math.max(...current)
  const isVertical = orientation === "vertical"
  const fromEdge = isVertical
    ? inverted
      ? "top"
      : "bottom"
    : inverted
      ? "right"
      : "left"
  const toEdge = { left: "right", right: "left", top: "bottom", bottom: "top" }[
    fromEdge
  ]
  // Position along the thumb-centre span, as a CSS length from `fromEdge`.
  const half = THUMB_HALF[thumb]
  const at = (fraction: number) =>
    `calc(${half} + (100% - 2 * ${half}) * ${fraction})`
  const valueAt = (index: number) => min + ((max - min) * index) / count
  const epsilon = (max - min) / count / 1000

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      data-variant={variant}
      data-thumb={thumb}
      defaultValue={defaultValue}
      value={value}
      onValueChange={(next) => {
        if (value === undefined) setUncontrolled(next)
        onValueChange?.(next)
      }}
      min={min}
      max={max}
      step={step}
      orientation={orientation}
      inverted={inverted}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        variant === "ticks" && "data-horizontal:pb-3 data-vertical:pr-3",
        variant === "segments" && "data-horizontal:py-1 data-vertical:px-1",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow rounded-full data-horizontal:w-full data-vertical:h-full",
          variant === "segments"
            ? "data-horizontal:h-1.5 data-vertical:w-1.5"
            : "overflow-hidden bg-muted data-horizontal:h-1 data-vertical:w-1"
        )}
      >
        {variant === "segments" ? (
          Array.from({ length: count }, (_, index) => {
            const start = valueAt(index)
            const end = valueAt(index + 1)
            const filled = start >= low - epsilon && end <= high + epsilon
            return (
              <span
                key={index}
                data-slot="slider-segment"
                data-filled={filled || undefined}
                className="absolute rounded-full bg-muted transition-colors data-filled:bg-primary"
                style={{
                  [fromEdge]:
                    index === 0 ? 0 : `calc(${at(index / count)} + 1px)`,
                  [toEdge]:
                    index === count - 1
                      ? 0
                      : `calc(100% - ${at((index + 1) / count)} + 1px)`,
                  ...(isVertical
                    ? { left: 0, right: 0 }
                    : { top: 0, bottom: 0 }),
                }}
              />
            )
          })
        ) : (
          <SliderPrimitive.Range
            data-slot="slider-range"
            className="absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        )}
      </SliderPrimitive.Track>
      {variant === "ticks" && (
        <span
          aria-hidden
          data-slot="slider-ticks"
          className="pointer-events-none absolute inset-0"
        >
          {Array.from({ length: count + 1 }, (_, index) => {
            const mark = valueAt(index)
            const active = mark >= low - epsilon && mark <= high + epsilon
            return (
              <span
                key={index}
                data-slot="slider-tick"
                data-active={active || undefined}
                className={cn(
                  "absolute rounded-full bg-muted-foreground/40 transition-colors data-active:bg-primary",
                  isVertical
                    ? "right-0 h-px w-1.5 translate-y-1/2"
                    : "bottom-0 h-1.5 w-px -translate-x-1/2",
                  isVertical && inverted && "-translate-y-1/2",
                  !isVertical && inverted && "translate-x-1/2"
                )}
                style={{ [fromEdge]: at(index / count) }}
              />
            )
          })}
        </span>
      )}
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          data-thumb={thumb}
          className={cn(
            "relative block shrink-0 border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50",
            THUMB_SHAPE[thumb][isVertical ? "vertical" : "horizontal"]
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
export type { SliderProps, SliderThumb, SliderVariant }
