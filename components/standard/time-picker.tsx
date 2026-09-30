"use client"

import * as React from "react"
import { ClockIcon, KeyboardIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"

type HourCycle = 12 | 24
type TimePickerMode = "dial" | "input"
type TimePickerView = "hour" | "minute"

type Time = { hour: number; minute: number }

const DIAL_SIZE = 256
const DIAL_CENTER = DIAL_SIZE / 2
const OUTER_RADIUS = 104
const INNER_RADIUS = 68
const FALLBACK_TIME: Time = { hour: 12, minute: 0 }

/** Reads "HH:mm" (the same shape as input type="time"). */
function parseTime(value: string | null | undefined): Time | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? "")
  if (!match) {
    return null
  }
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) {
    return null
  }
  return { hour, minute }
}

function formatTime({ hour, minute }: Time) {
  return `${pad(hour)}:${pad(minute)}`
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function toHour12(hour: number) {
  return hour % 12 === 0 ? 12 : hour % 12
}

/** Human label for a time: "9:30 AM" or "09:30". */
function formatTimeLabel(time: Time, hourCycle: HourCycle) {
  if (hourCycle === 24) {
    return formatTime(time)
  }
  return `${toHour12(time.hour)}:${pad(time.minute)} ${time.hour < 12 ? "AM" : "PM"}`
}

function wrap(value: number, size: number) {
  return ((value % size) + size) % size
}

/** Clockwise angle from 12 o'clock, 0–360. */
function angleFrom(dx: number, dy: number) {
  return wrap((Math.atan2(dx, -dy) * 180) / Math.PI, 360)
}

function pointOn(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180
  // Rounded so server and client trig agree during hydration.
  return {
    x: Math.round((DIAL_CENTER + radius * Math.sin(radians)) * 100) / 100,
    y: Math.round((DIAL_CENTER - radius * Math.cos(radians)) * 100) / 100,
  }
}

function useControllableTime(
  value: string | null | undefined,
  defaultValue: string | null | undefined,
  onValueChange: ((value: string) => void) | undefined
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? null)
  const isControlled = value !== undefined
  const current = isControlled ? value : uncontrolled

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolled(next)
      }
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  return [current, setValue] as const
}

type TimePickerPanelProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> & {
  /** "HH:mm", 24-hour. Leave undefined to let the panel hold its own value. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
  /** 12 shows an AM/PM toggle; 24 adds an inner ring for 12–23. */
  hourCycle?: HourCycle
  /** Minutes the dial snaps to. Typed minutes are not snapped. */
  minuteStep?: number
  mode?: TimePickerMode
  defaultMode?: TimePickerMode
  onModeChange?: (mode: TimePickerMode) => void
  /** Vertical stacks the dial under the time; horizontal puts it beside. */
  orientation?: "vertical" | "horizontal"
  /** Overrides "Select time" / "Enter time". */
  headline?: React.ReactNode
  /** Sits right of the keyboard/clock toggle, e.g. Cancel and OK. */
  actions?: React.ReactNode
}

/**
 * Material 3 style time picker, laid out inline: time fields, AM/PM,
 * a dial you can click or drag, and a keyboard entry mode.
 */
function TimePickerPanel({
  value,
  defaultValue,
  onValueChange,
  hourCycle = 12,
  minuteStep = 1,
  mode: modeProp,
  defaultMode = "dial",
  onModeChange,
  orientation = "vertical",
  headline,
  actions,
  className,
  ...props
}: TimePickerPanelProps) {
  const [raw, setRaw] = useControllableTime(value, defaultValue, onValueChange)
  const time = parseTime(raw) ?? FALLBACK_TIME
  const [view, setView] = React.useState<TimePickerView>("hour")
  const [uncontrolledMode, setUncontrolledMode] = React.useState(defaultMode)
  const mode = modeProp ?? uncontrolledMode
  const headlineId = React.useId()

  function setTime(next: Time) {
    setRaw(formatTime(next))
  }

  function setMode(next: TimePickerMode) {
    if (modeProp === undefined) {
      setUncontrolledMode(next)
    }
    onModeChange?.(next)
  }

  const horizontal = orientation === "horizontal" && mode === "dial"

  return (
    <div
      data-slot="time-picker-panel"
      data-mode={mode}
      data-orientation={orientation}
      role="group"
      aria-labelledby={headlineId}
      className={cn("flex w-max flex-col gap-5 p-6", className)}
      {...props}
    >
      <div
        id={headlineId}
        className="text-xs font-medium tracking-wide text-muted-foreground"
      >
        {headline ?? (mode === "dial" ? "Select time" : "Enter time")}
      </div>

      <div
        className={cn(
          "flex gap-9",
          horizontal ? "flex-row items-center" : "flex-col items-center"
        )}
      >
        <div
          className={cn(
            "flex gap-3",
            horizontal ? "flex-col items-center" : "flex-row items-start"
          )}
        >
          <TimeFields
            time={time}
            hourCycle={hourCycle}
            mode={mode}
            view={view}
            onViewChange={setView}
            onTimeChange={setTime}
          />
          {hourCycle === 12 ? (
            <PeriodToggle
              time={time}
              onTimeChange={setTime}
              direction={horizontal ? "row" : "column"}
            />
          ) : null}
        </div>

        {mode === "dial" ? (
          <TimeDial
            time={time}
            hourCycle={hourCycle}
            minuteStep={minuteStep}
            view={view}
            onViewChange={setView}
            onTimeChange={setTime}
          />
        ) : null}
      </div>

      <div className="-mx-2 -mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          data-slot="time-picker-mode"
          aria-label={
            mode === "dial" ? "Switch to text input" : "Switch to clock"
          }
          onClick={() => setMode(mode === "dial" ? "input" : "dial")}
          className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {mode === "dial" ? (
            <KeyboardIcon className="size-5" />
          ) : (
            <ClockIcon className="size-5" />
          )}
        </button>
        {actions ? (
          <div className="flex items-center gap-1">{actions}</div>
        ) : null}
      </div>
    </div>
  )
}

const FIELD_BOX =
  "flex h-20 w-24 items-center justify-center rounded-lg text-5xl leading-none tabular-nums outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50"

function TimeFields({
  time,
  hourCycle,
  mode,
  view,
  onViewChange,
  onTimeChange,
}: {
  time: Time
  hourCycle: HourCycle
  mode: TimePickerMode
  view: TimePickerView
  onViewChange: (view: TimePickerView) => void
  onTimeChange: (time: Time) => void
}) {
  const hourText =
    hourCycle === 12 ? String(toHour12(time.hour)) : pad(time.hour)
  const minuteText = pad(time.minute)

  function commitHour(typed: number) {
    if (hourCycle === 24) {
      onTimeChange({ ...time, hour: typed })
      return
    }
    const isPm = time.hour >= 12
    onTimeChange({ ...time, hour: (typed % 12) + (isPm ? 12 : 0) })
  }

  const separator = (
    <span
      aria-hidden
      className="flex h-20 w-6 items-center justify-center text-5xl"
    >
      :
    </span>
  )

  if (mode === "dial") {
    return (
      <div className="flex items-start">
        {(["hour", "minute"] as const).map((field, index) => (
          <React.Fragment key={field}>
            {index === 1 ? separator : null}
            <button
              type="button"
              data-slot={`time-picker-${field}`}
              aria-label={
                field === "hour" ? `Hour ${hourText}` : `Minute ${minuteText}`
              }
              aria-pressed={view === field}
              onClick={() => onViewChange(field)}
              className={cn(
                FIELD_BOX,
                view === field
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-foreground hover:bg-muted/70"
              )}
            >
              {field === "hour" ? hourText : minuteText}
            </button>
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-start">
      <TypedTimeField
        label="Hour"
        text={hourText}
        min={hourCycle === 12 ? 1 : 0}
        max={hourCycle === 12 ? 12 : 23}
        onCommit={commitHour}
        autoFocus
      />
      {separator}
      <TypedTimeField
        label="Minute"
        text={minuteText}
        min={0}
        max={59}
        onCommit={(minute) => onTimeChange({ ...time, minute })}
      />
    </div>
  )
}

function TypedTimeField({
  label,
  text,
  min,
  max,
  autoFocus,
  onCommit,
}: {
  label: string
  text: string
  min: number
  max: number
  autoFocus?: boolean
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = React.useState<string | null>(null)
  const id = React.useId()
  const shown = draft ?? text
  const typed = Number(shown)
  const invalid = shown === "" || typed < min || typed > max

  return (
    <div className="flex flex-col gap-1.5">
      <input
        id={id}
        data-slot="time-picker-input"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        maxLength={2}
        value={shown}
        aria-invalid={invalid || undefined}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, 2)
          setDraft(digits)
          const next = Number(digits)
          if (digits !== "" && next >= min && next <= max) {
            onCommit(next)
          }
        }}
        onBlur={() => setDraft(null)}
        className={cn(
          FIELD_BOX,
          "border-2 border-transparent bg-muted text-center focus:border-primary focus:bg-primary/10 focus-visible:ring-0 aria-invalid:border-destructive"
        )}
      />
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
    </div>
  )
}

function PeriodToggle({
  time,
  onTimeChange,
  direction,
}: {
  time: Time
  onTimeChange: (time: Time) => void
  direction: "row" | "column"
}) {
  const isPm = time.hour >= 12

  function pick(pm: boolean) {
    if (pm === isPm) {
      return
    }
    onTimeChange({ ...time, hour: time.hour + (pm ? 12 : -12) })
  }

  return (
    <div
      data-slot="time-picker-period"
      role="radiogroup"
      aria-label="AM or PM"
      className={cn(
        "flex overflow-hidden rounded-lg border border-input",
        direction === "column" ? "h-20 w-13 flex-col" : "h-10 w-full flex-row"
      )}
    >
      {[false, true].map((pm) => {
        const selected = pm === isPm
        return (
          <button
            key={pm ? "pm" : "am"}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => pick(pm)}
            className={cn(
              "flex flex-1 items-center justify-center text-sm font-medium transition-colors outline-none focus-visible:bg-muted",
              direction === "column"
                ? "not-first:border-t not-first:border-input"
                : "not-first:border-l not-first:border-input",
              selected
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {pm ? "PM" : "AM"}
          </button>
        )
      })}
    </div>
  )
}

type DialMark = { value: number; label: string; angle: number; inner: boolean }

function dialMarks(view: TimePickerView, hourCycle: HourCycle): DialMark[] {
  if (view === "minute") {
    return Array.from({ length: 12 }, (_, index) => ({
      value: index * 5,
      label: pad(index * 5),
      angle: index * 30,
      inner: false,
    }))
  }
  const outer = Array.from({ length: 12 }, (_, index) => ({
    value: hourCycle === 12 ? (index === 0 ? 12 : index) : index,
    label:
      hourCycle === 12
        ? String(index === 0 ? 12 : index)
        : index === 0
          ? "00"
          : String(index),
    angle: index * 30,
    inner: false,
  }))
  if (hourCycle === 12) {
    return outer
  }
  const inner = Array.from({ length: 12 }, (_, index) => ({
    value: index + 12,
    label: String(index + 12),
    angle: index * 30,
    inner: true,
  }))
  return [...outer, ...inner]
}

function TimeDial({
  time,
  hourCycle,
  minuteStep,
  view,
  onViewChange,
  onTimeChange,
}: {
  time: Time
  hourCycle: HourCycle
  minuteStep: number
  view: TimePickerView
  onViewChange: (view: TimePickerView) => void
  onTimeChange: (time: Time) => void
}) {
  const dialRef = React.useRef<HTMLDivElement>(null)
  const draggingRef = React.useRef(false)
  const step = Math.max(1, Math.round(minuteStep))

  // The value the hand points at, in the dial's own terms.
  const selected =
    view === "minute"
      ? time.minute
      : hourCycle === 12
        ? toHour12(time.hour)
        : time.hour
  const inner = view === "hour" && hourCycle === 24 && time.hour >= 12
  const angle = view === "minute" ? time.minute * 6 : (time.hour % 12) * 30
  const radius = inner ? INNER_RADIUS : OUTER_RADIUS
  const knob = pointOn(angle, radius)
  const onMark = view === "hour" || time.minute % 5 === 0

  function pickFromPointer(clientX: number, clientY: number) {
    const rect = dialRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }
    const scale = rect.width / DIAL_SIZE
    const dx = (clientX - rect.left) / scale - DIAL_CENTER
    const dy = (clientY - rect.top) / scale - DIAL_CENTER
    const pointerAngle = angleFrom(dx, dy)

    if (view === "minute") {
      const minute = wrap(Math.round(pointerAngle / 6 / step) * step, 60)
      if (minute !== time.minute) {
        onTimeChange({ ...time, minute })
      }
      return
    }

    const slot = wrap(Math.round(pointerAngle / 30), 12)
    let hour: number
    if (hourCycle === 24) {
      const distance = Math.hypot(dx, dy)
      const pickInner = distance < (INNER_RADIUS + OUTER_RADIUS) / 2
      hour = slot + (pickInner ? 12 : 0)
    } else {
      hour = slot + (time.hour >= 12 ? 12 : 0)
    }
    if (hour !== time.hour) {
      onTimeChange({ ...time, hour })
    }
  }

  function nudge(direction: 1 | -1) {
    if (view === "minute") {
      const base = Math.round(time.minute / step) * step
      const minute = wrap(
        time.minute % step === 0 ? time.minute + direction * step : base,
        60
      )
      onTimeChange({ ...time, minute })
      return
    }
    if (hourCycle === 24) {
      onTimeChange({ ...time, hour: wrap(time.hour + direction, 24) })
      return
    }
    // Stay inside the current half of the day, like the dial does.
    const half = time.hour >= 12 ? 12 : 0
    onTimeChange({
      ...time,
      hour: half + wrap(time.hour - half + direction, 12),
    })
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      event.preventDefault()
      nudge(1)
    } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      event.preventDefault()
      nudge(-1)
    } else if (event.key === "Enter" && view === "hour") {
      event.preventDefault()
      onViewChange("minute")
    }
  }

  const valueText =
    view === "minute"
      ? `${time.minute} minutes`
      : hourCycle === 12
        ? `${toHour12(time.hour)} o'clock`
        : `${time.hour} hours`

  return (
    <div
      ref={dialRef}
      data-slot="time-picker-dial"
      data-view={view}
      role="slider"
      tabIndex={0}
      aria-label={view === "hour" ? "Hour" : "Minute"}
      aria-valuemin={view === "minute" ? 0 : hourCycle === 12 ? 1 : 0}
      aria-valuemax={view === "minute" ? 59 : hourCycle === 12 ? 12 : 23}
      aria-valuenow={selected}
      aria-valuetext={valueText}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return
        }
        event.preventDefault()
        event.currentTarget.focus()
        event.currentTarget.setPointerCapture(event.pointerId)
        draggingRef.current = true
        pickFromPointer(event.clientX, event.clientY)
      }}
      onPointerMove={(event) => {
        if (draggingRef.current) {
          pickFromPointer(event.clientX, event.clientY)
        }
      }}
      onPointerUp={() => {
        if (!draggingRef.current) {
          return
        }
        draggingRef.current = false
        if (view === "hour") {
          onViewChange("minute")
        }
      }}
      onPointerCancel={() => {
        draggingRef.current = false
      }}
      className="relative shrink-0 touch-none rounded-full bg-muted outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50"
      style={{ width: DIAL_SIZE, height: DIAL_SIZE }}
    >
      {/* Hand, drawn from the center out to the knob. */}
      <div
        aria-hidden
        className="absolute w-0.5 origin-bottom bg-primary"
        style={{
          left: DIAL_CENTER - 1,
          top: DIAL_CENTER - radius,
          height: radius,
          transform: `rotate(${angle}deg)`,
        }}
      />
      <div
        aria-hidden
        className="absolute size-2 -translate-1/2 rounded-full bg-primary"
        style={{ left: DIAL_CENTER, top: DIAL_CENTER }}
      />
      <div
        aria-hidden
        className={cn(
          "absolute -translate-1/2 rounded-full bg-primary",
          inner ? "size-10" : "size-12"
        )}
        style={{ left: knob.x, top: knob.y }}
      >
        {onMark ? null : (
          <span className="absolute top-1/2 left-1/2 size-1.5 -translate-1/2 rounded-full bg-primary-foreground" />
        )}
      </div>

      {dialMarks(view, hourCycle).map((mark) => {
        const point = pointOn(
          mark.angle,
          mark.inner ? INNER_RADIUS : OUTER_RADIUS
        )
        const isSelected =
          mark.value === selected && (view === "minute" ? onMark : true)
        return (
          <span
            key={`${view}-${mark.value}`}
            aria-hidden
            className={cn(
              "pointer-events-none absolute flex size-12 -translate-1/2 items-center justify-center tabular-nums",
              mark.inner ? "text-xs" : "text-base",
              isSelected
                ? "text-primary-foreground"
                : mark.inner
                  ? "text-muted-foreground"
                  : "text-foreground"
            )}
            style={{ left: point.x, top: point.y }}
          >
            {mark.label}
          </span>
        )
      })}
    </div>
  )
}

type TimePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange"
> & {
  /** "HH:mm", 24-hour. null or "" shows the placeholder. */
  value?: string | null
  defaultValue?: string | null
  /** Fires with "HH:mm" when OK is pressed. */
  onValueChange?: (value: string) => void
  hourCycle?: HourCycle
  minuteStep?: number
  defaultMode?: TimePickerMode
  orientation?: "vertical" | "horizontal"
  placeholder?: string
  /** Shows the error style. Same as passing aria-invalid. */
  invalid?: boolean
  align?: React.ComponentProps<typeof PopoverContent>["align"]
}

/**
 * Field that opens a Material 3 style time picker. Changes stay a draft
 * until OK; Cancel or Escape throws them away.
 */
function TimePicker({
  value,
  defaultValue,
  onValueChange,
  hourCycle = 12,
  minuteStep = 1,
  defaultMode = "dial",
  orientation = "vertical",
  placeholder = "Select time",
  invalid,
  align = "start",
  className,
  disabled,
  ...props
}: TimePickerProps) {
  const [raw, setRaw] = useControllableTime(value, defaultValue, onValueChange)
  const committed = parseTime(raw)
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState(
    formatTime(committed ?? FALLBACK_TIME)
  )
  const [mode, setMode] = React.useState(defaultMode)

  function onOpenChange(next: boolean) {
    if (next) {
      setDraft(formatTime(committed ?? FALLBACK_TIME))
      setMode(defaultMode)
    }
    setOpen(next)
  }

  function confirm() {
    setRaw(draft)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="time-picker"
          disabled={disabled}
          aria-invalid={invalid || props["aria-invalid"] || undefined}
          className={cn(
            "inline-flex h-8 items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2 text-base tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
            className
          )}
          {...props}
        >
          <span className={cn(!committed && "text-muted-foreground")}>
            {committed ? formatTimeLabel(committed, hourCycle) : placeholder}
          </span>
          <ClockIcon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        collisionPadding={8}
        className="max-h-(--radix-popover-content-available-height) w-auto overflow-y-auto rounded-2xl p-0"
        onKeyDown={(event) => {
          if (event.key === "Enter" && mode === "input") {
            event.preventDefault()
            confirm()
          }
        }}
      >
        <TimePickerPanel
          value={draft}
          onValueChange={setDraft}
          hourCycle={hourCycle}
          minuteStep={minuteStep}
          mode={mode}
          onModeChange={setMode}
          orientation={orientation}
          actions={
            <>
              <Button
                tone="ghost"
                className="text-primary hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                tone="ghost"
                className="text-primary hover:text-primary"
                onClick={confirm}
              >
                OK
              </Button>
            </>
          }
        />
      </PopoverContent>
    </Popover>
  )
}

export { TimePicker, TimePickerPanel, formatTimeLabel, parseTime }
export type { HourCycle, TimePickerMode, TimePickerPanelProps, TimePickerProps }
