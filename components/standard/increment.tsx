"use client"

import * as React from "react"
import { MinusIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import { useControllableState } from "@/hooks/use-controllable-state"

/** Delay before a held button starts repeating, then the repeat interval. */
const HOLD_DELAY = 400
const HOLD_INTERVAL = 60

type IncrementProps = Omit<
  React.ComponentProps<"div">,
  "children" | "defaultValue" | "onChange"
> & {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Word before the value, e.g. "gap". Also names it for screen readers. */
  label?: string
  /** How the value reads, e.g. (v) => `${v}px`. Defaults to the number. */
  format?: (value: number) => React.ReactNode
  /** Say what the value means for screen readers when `format` adds units. */
  formatText?: (value: number) => string
  size?: "xs" | "sm" | "default"
  tone?: "outline" | "quiet" | "ghost"
  /**
   * `inline` puts − and + either side of the value. `stacked` boxes the value
   * like a field, with + over − on its right edge.
   */
  layout?: "inline" | "stacked"
  disabled?: boolean
}

/** Stacked heights run one step above fields so each half stays clickable. */
const STACKED_SIZE = {
  xs: { box: "h-7 min-w-14 text-xs", button: "w-5 [&_svg]:size-3" },
  sm: { box: "h-8 min-w-16 text-xs", button: "w-6 [&_svg]:size-3" },
  default: { box: "h-9 min-w-20 text-sm", button: "w-7 [&_svg]:size-3.5" },
} as const

const STACKED_TONE = {
  outline: { box: "border border-input", rail: "border-l border-input" },
  quiet: { box: "bg-muted", rail: "border-l border-background" },
  ghost: { box: "", rail: "" },
} as const

/** Keeps floating steps tidy: 0.1 + 0.2 lands on 0.3. */
function roundsToStep(value: number, step: number) {
  const digits = (String(step).split(".")[1] ?? "").length
  return Number(value.toFixed(digits))
}

/**
 * A value you nudge with − and +. Hold a button to repeat. The value itself
 * is a spinbutton: arrow keys step, Page Up/Down step by ten, Home and End
 * jump to `min` and `max`.
 *
 * <Increment label="gap" defaultValue={32} min={8} max={72} step={8} />
 * <Increment layout="stacked" aria-label="Quantity" defaultValue={2} min={0} />
 */
function Increment({
  value: valueProp,
  defaultValue = 0,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  label,
  format,
  formatText,
  size = "sm",
  tone = "outline",
  layout = "inline",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  ...props
}: IncrementProps) {
  // Without a visible label, `aria-label` names the value and its buttons.
  const name = label ?? ariaLabel
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange,
  })

  const clamps = React.useCallback(
    (next: number) => Math.min(max, Math.max(min, roundsToStep(next, step))),
    [min, max, step]
  )

  // The hold timer reads the latest value through a ref, not a stale closure.
  const valueRef = React.useRef(value)
  React.useEffect(() => {
    valueRef.current = value
  }, [value])

  const nudges = React.useCallback(
    (direction: 1 | -1, times = 1) => {
      const next = clamps(valueRef.current + direction * step * times)
      const moved = next !== valueRef.current
      valueRef.current = next
      setValue(next)
      return moved
    },
    [clamps, setValue, step]
  )

  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const stops = React.useCallback(() => clearTimeout(timer.current), [])
  React.useEffect(() => stops, [stops])

  function startsHold(event: React.PointerEvent, direction: 1 | -1) {
    if (event.button !== 0) return
    nudges(direction)
    // A button that hits the limit turns disabled and stops sending pointer
    // events, so the repeat ends itself there.
    const repeats = () => {
      if (nudges(direction)) timer.current = setTimeout(repeats, HOLD_INTERVAL)
    }
    timer.current = setTimeout(repeats, HOLD_DELAY)
  }

  // Keyboard presses arrive as clicks with no pointer; a pointer press was
  // already counted on pointer down.
  function clicks(event: React.MouseEvent, direction: 1 | -1) {
    if (event.detail === 0) nudges(direction)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const keys: Record<string, () => void> = {
      ArrowUp: () => nudges(1),
      ArrowRight: () => nudges(1),
      ArrowDown: () => nudges(-1),
      ArrowLeft: () => nudges(-1),
      PageUp: () => nudges(1, 10),
      PageDown: () => nudges(-1, 10),
      Home: () => Number.isFinite(min) && setValue(min),
      End: () => Number.isFinite(max) && setValue(max),
    }
    const run = keys[event.key]
    if (!run || disabled) return
    event.preventDefault()
    run()
  }

  // Both layouts share the hold-to-repeat wiring and the limits.
  function stepper(direction: 1 | -1) {
    const verb = direction === 1 ? "Increase" : "Decrease"
    return {
      type: "button" as const,
      tabIndex: -1,
      "aria-label": name ? `${verb} ${name}` : verb,
      disabled: disabled || (direction === 1 ? value >= max : value <= min),
      onPointerDown: (event: React.PointerEvent) => startsHold(event, direction),
      onPointerUp: stops,
      onPointerLeave: stops,
      onPointerCancel: stops,
      onClick: (event: React.MouseEvent) => clicks(event, direction),
    }
  }

  const spinbutton = {
    role: "spinbutton",
    tabIndex: disabled ? -1 : 0,
    "aria-label": name,
    "aria-valuenow": value,
    "aria-valuemin": Number.isFinite(min) ? min : undefined,
    "aria-valuemax": Number.isFinite(max) ? max : undefined,
    "aria-valuetext": formatText?.(value),
    "aria-disabled": disabled || undefined,
    onKeyDown,
  }

  const reading = (
    <>
      {label ? `${label} ` : null}
      <span className="text-foreground">{format ? format(value) : value}</span>
    </>
  )

  if (layout === "stacked") {
    const sized = STACKED_SIZE[size]
    const toned = STACKED_TONE[tone]
    const rungs =
      "flex flex-1 items-center justify-center text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground active:bg-muted/70 disabled:pointer-events-none disabled:opacity-50"

    return (
      <div
        data-slot="increment"
        data-size={size}
        data-layout="stacked"
        data-disabled={disabled || undefined}
        className={cn(
          "inline-flex items-stretch overflow-hidden rounded-lg text-muted-foreground has-[[role=spinbutton]:focus-visible]:ring-3 has-[[role=spinbutton]:focus-visible]:ring-ring/50",
          sized.box,
          toned.box,
          disabled && "opacity-50",
          className
        )}
        {...props}
      >
        <span
          {...spinbutton}
          className="flex flex-1 items-center gap-1 px-2.5 tabular-nums outline-none select-none"
        >
          {reading}
        </span>
        <span className={cn("flex flex-col", toned.rail)}>
          <button {...stepper(1)} className={cn(rungs, sized.button)}>
            <PlusIcon />
          </button>
          <span className={cn("h-px", tone === "ghost" ? "" : "bg-input")} />
          <button {...stepper(-1)} className={cn(rungs, sized.button)}>
            <MinusIcon />
          </button>
        </span>
      </div>
    )
  }

  return (
    <div
      data-slot="increment"
      data-size={size}
      data-layout="inline"
      data-disabled={disabled || undefined}
      className={cn(
        "inline-flex items-center gap-2 text-xs text-muted-foreground",
        size === "default" && "text-sm",
        className
      )}
      {...props}
    >
      <Button {...stepper(-1)} tone={tone} size={size} iconOnly>
        <MinusIcon />
      </Button>
      <span
        {...spinbutton}
        className="rounded-sm tabular-nums outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {reading}
      </span>
      <Button {...stepper(1)} tone={tone} size={size} iconOnly>
        <PlusIcon />
      </Button>
    </div>
  )
}

export { Increment, type IncrementProps }
