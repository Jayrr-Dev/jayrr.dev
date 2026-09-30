"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

/**
 * Before / after comparison: two layers stacked, the `before` one clipped at
 * the divider. Drag the handle (or anywhere on the image), hover to scrub,
 * or focus the handle and use the arrow keys.
 *
 * @example
 * <ComparisonSlider before="/light.png" after="/dark.png" />
 * <ComparisonSlider before={<Chart />} after={<Chart next />} mode="hover" />
 * <ComparisonSlider before={a} after={b} orientation="vertical" defaultValue={30} />
 */

type ComparisonSliderMode = "drag" | "hover"
type ComparisonSliderOrientation = "horizontal" | "vertical"

const clamp = (value: number) => Math.min(100, Math.max(0, value))

function ComparisonSliderLayer({
  content,
  alt,
}: {
  content: React.ReactNode
  alt: string
}) {
  if (typeof content === "string") {
    return (
      // A plain img keeps the slider usable for any source without next/image config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={content}
        alt={alt}
        draggable={false}
        className="pointer-events-none size-full object-cover select-none"
      />
    )
  }

  return content
}

function ComparisonSliderLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-10 rounded-md bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm",
        className
      )}
    >
      {children}
    </span>
  )
}

function ComparisonSlider({
  before,
  after,
  beforeLabel,
  afterLabel,
  mode = "drag",
  orientation = "horizontal",
  value: valueProp,
  defaultValue = 50,
  onValueChange,
  step = 1,
  rounded = true,
  handle = true,
  className,
  "aria-label": ariaLabel = "Comparison position",
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  /** Shown on the start side (left or top). A string is used as an image src. */
  before: React.ReactNode
  /** Shown on the end side (right or bottom). A string is used as an image src. */
  after: React.ReactNode
  beforeLabel?: React.ReactNode
  afterLabel?: React.ReactNode
  /** `drag` follows a press and drag; `hover` follows the pointer. */
  mode?: ComparisonSliderMode
  orientation?: ComparisonSliderOrientation
  /** Divider position, 0 to 100. */
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Arrow-key step; Shift multiplies it by 10. */
  step?: number
  rounded?: boolean
  /** Show the round grip on the divider. */
  handle?: boolean
}) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue: clamp(defaultValue),
    onChange: onValueChange,
  })
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)
  // Read in pointer handlers, so a move right after the press is not missed.
  const draggingRef = React.useRef(false)
  const vertical = orientation === "vertical"

  const setFromPointer = (event: React.PointerEvent) => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect || !rect.width || !rect.height) return
    const ratio = vertical
      ? (event.clientY - rect.top) / rect.height
      : (event.clientX - rect.left) / rect.width
    setValue(clamp(ratio * 100))
  }

  const endDrag = () => {
    draggingRef.current = false
    setDragging(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const amount = event.shiftKey ? step * 10 : step
    const keys: Record<string, number> = {
      ArrowLeft: value - amount,
      ArrowDown: value - amount,
      ArrowRight: value + amount,
      ArrowUp: value + amount,
      PageDown: value - step * 10,
      PageUp: value + step * 10,
      Home: 0,
      End: 100,
    }
    if (vertical) {
      // Down moves the divider down, which grows `before`.
      keys.ArrowDown = value + amount
      keys.ArrowUp = value - amount
    }
    if (!(event.key in keys)) return
    event.preventDefault()
    setValue(clamp(keys[event.key]))
  }

  const clip = vertical
    ? `inset(0 0 ${100 - value}% 0)`
    : `inset(0 ${100 - value}% 0 0)`

  return (
    <div
      ref={rootRef}
      data-slot="comparison-slider"
      data-mode={mode}
      data-orientation={orientation}
      data-dragging={dragging || undefined}
      className={cn(
        "group/comparison relative isolate aspect-video w-full overflow-hidden bg-muted select-none",
        rounded && "rounded-lg",
        vertical ? "touch-pan-x" : "touch-pan-y",
        mode === "drag" && (vertical ? "cursor-row-resize" : "cursor-col-resize"),
        className
      )}
      onPointerDown={(event) => {
        if (mode !== "drag" || event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        draggingRef.current = true
        setDragging(true)
        setFromPointer(event)
      }}
      onPointerMove={(event) => {
        if (mode === "hover" || draggingRef.current) setFromPointer(event)
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      {...props}
    >
      <div data-slot="comparison-slider-after" className="absolute inset-0">
        <ComparisonSliderLayer content={after} alt="After" />
      </div>
      <div
        data-slot="comparison-slider-before"
        className="absolute inset-0"
        style={{ clipPath: clip }}
      >
        <ComparisonSliderLayer content={before} alt="Before" />
      </div>

      {beforeLabel ? (
        <ComparisonSliderLabel className="top-2 left-2">
          {beforeLabel}
        </ComparisonSliderLabel>
      ) : null}
      {afterLabel ? (
        <ComparisonSliderLabel
          className={vertical ? "bottom-2 left-2" : "top-2 right-2"}
        >
          {afterLabel}
        </ComparisonSliderLabel>
      ) : null}

      <div
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-orientation={orientation}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        aria-valuetext={`${Math.round(value)}%`}
        data-slot="comparison-slider-handle"
        onKeyDown={handleKeyDown}
        className={cn(
          "group/handle absolute z-20 flex items-center justify-center outline-none",
          vertical
            ? "inset-x-0 h-0 -translate-y-1/2"
            : "inset-y-0 w-0 -translate-x-1/2"
        )}
        style={vertical ? { top: `${value}%` } : { left: `${value}%` }}
      >
        <span
          aria-hidden
          className={cn(
            "absolute bg-background shadow-sm",
            vertical ? "inset-x-0 h-0.5" : "inset-y-0 w-0.5"
          )}
        />
        {handle ? (
          <span
            aria-hidden
            className="relative flex size-9 items-center justify-center rounded-full bg-background text-foreground shadow-md ring-1 ring-border transition-transform group-focus-visible/handle:ring-3 group-focus-visible/handle:ring-ring/50 group-data-dragging/comparison:scale-95"
          >
            <GripVertical className={cn("size-4", vertical && "rotate-90")} />
          </span>
        ) : null}
      </div>
    </div>
  )
}

export { ComparisonSlider }
export type { ComparisonSliderMode, ComparisonSliderOrientation }
