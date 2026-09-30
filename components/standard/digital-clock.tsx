"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * A seven-segment LED clock: slanted digits with bevelled segments, a
 * blinking colon, faint unlit segments behind the lit ones, in an optional
 * plastic housing with a glass face.
 *
 * It ticks on the second and renders dashes on the server, so it hydrates
 * without a mismatch. Pass `time` to show a fixed time instead.
 *
 * <DigitalClock />
 * <DigitalClock hour12={false} showSeconds color="oklch(0.85 0.2 145)" />
 * <DigitalClock timeZone="Asia/Tokyo" framed />
 */

// One digit cell in SVG units; segments are hexagons that meet at bevelled corners.
const DIGIT_WIDTH = 60
const DIGIT_HEIGHT = 100
const STROKE = 11
const HALF = STROKE / 2
const JOINT = 1.4
const COLON_WIDTH = 18
const SPACING = 14
/** Room on each side for the slant. */
const SLANT_PAD = 14
const SLANT_DEGREES = -7

type Point = [number, number]

function toPoints(points: Point[]) {
  return points.map(([x, y]) => `${x},${y}`).join(" ")
}

function horizontal(y: number) {
  const x1 = HALF + JOINT
  const x2 = DIGIT_WIDTH - HALF - JOINT
  return toPoints([
    [x1, y],
    [x1 + HALF, y - HALF],
    [x2 - HALF, y - HALF],
    [x2, y],
    [x2 - HALF, y + HALF],
    [x1 + HALF, y + HALF],
  ])
}

function vertical(x: number, y1: number, y2: number) {
  return toPoints([
    [x, y1],
    [x + HALF, y1 + HALF],
    [x + HALF, y2 - HALF],
    [x, y2],
    [x - HALF, y2 - HALF],
    [x - HALF, y1 + HALF],
  ])
}

const MIDDLE = DIGIT_HEIGHT / 2
const RIGHT = DIGIT_WIDTH - HALF

// The standard segment names: a top, b/c right, d bottom, e/f left, g middle.
const SEGMENTS = {
  a: horizontal(HALF),
  b: vertical(RIGHT, HALF + JOINT, MIDDLE - JOINT),
  c: vertical(RIGHT, MIDDLE + JOINT, DIGIT_HEIGHT - HALF - JOINT),
  d: horizontal(DIGIT_HEIGHT - HALF),
  e: vertical(HALF, MIDDLE + JOINT, DIGIT_HEIGHT - HALF - JOINT),
  f: vertical(HALF, HALF + JOINT, MIDDLE - JOINT),
  g: horizontal(MIDDLE),
}

type Segment = keyof typeof SEGMENTS

const SEGMENT_NAMES = Object.keys(SEGMENTS) as Segment[]

const LIT_SEGMENTS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgedc",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
  "-": "g",
  " ": "",
}

const formatters = new Map<string, Intl.DateTimeFormat>()

/** Hours, minutes and seconds of `date` in `timeZone` (local time when unset). */
function readsTime(date: Date, timeZone?: string) {
  const key = timeZone ?? ""
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
      timeZone,
    })
    formatters.set(key, formatter)
  }

  const parts = formatter.formatToParts(date)
  const part = (type: string) =>
    Number(parts.find((entry) => entry.type === type)?.value ?? 0)
  return {
    hours: part("hour"),
    minutes: part("minute"),
    seconds: part("second"),
  }
}

// A clock store that changes once a second, on the second.
function subscribesSeconds(onChange: () => void) {
  let timer = 0
  const schedules = () => {
    timer = window.setTimeout(
      () => {
        onChange()
        schedules()
      },
      1000 - (Date.now() % 1000) + 5
    )
  }
  schedules()
  return () => window.clearTimeout(timer)
}

const readsSecond = () => Math.floor(Date.now() / 1000)
const readsNoSecond = () => null

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function DigitalClockDigit({ char, x }: { char: string; x: number }) {
  const lit = LIT_SEGMENTS[char] ?? ""

  return (
    <g transform={`translate(${x} 0)`}>
      {SEGMENT_NAMES.map((name) => (
        <polygon
          key={name}
          points={SEGMENTS[name]}
          data-lit={lit.includes(name) || undefined}
          fill="currentColor"
          style={{
            opacity: lit.includes(name) ? 1 : "var(--digital-clock-ghost)",
          }}
        />
      ))}
    </g>
  )
}

function DigitalClock({
  time,
  timeZone,
  hour12 = true,
  leadingZero = !hour12,
  showSeconds = false,
  showPeriod = false,
  blink = true,
  ghost = true,
  glow = true,
  framed = false,
  color = "oklch(0.63 0.25 27)",
  label,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  /** A fixed time to show instead of the running clock. */
  time?: Date
  /** IANA time zone, like "Europe/London"; the viewer's own when unset. */
  timeZone?: string
  hour12?: boolean
  /** "09:05" instead of " 9:05". Defaults on for 24-hour time. */
  leadingZero?: boolean
  showSeconds?: boolean
  /** A small AM/PM indicator, for 12-hour time. */
  showPeriod?: boolean
  /** Blink the colon with the seconds. */
  blink?: boolean
  /** Show unlit segments faintly, like a real LED face. */
  ghost?: boolean
  glow?: boolean
  /** Put the digits in a plastic housing with a glass face. Off by default: just the display. */
  framed?: boolean
  /** Color of the lit segments; any CSS color. */
  color?: string
  /** Accessible name; defaults to the time shown. */
  label?: string
}) {
  const second = React.useSyncExternalStore(
    subscribesSeconds,
    readsSecond,
    readsNoSecond
  )
  const date = time ?? (second === null ? null : new Date(second * 1000))
  const parts = date ? readsTime(date, timeZone) : null

  const hourValue = parts ? (hour12 ? parts.hours % 12 || 12 : parts.hours) : 0
  const hours = parts
    ? leadingZero
      ? pad(hourValue)
      : String(hourValue).padStart(2, " ")
    : "--"
  const minutes = parts ? pad(parts.minutes) : "--"
  const seconds = parts ? pad(parts.seconds) : "--"
  const text = showSeconds
    ? `${hours}:${minutes}:${seconds}`
    : `${hours}:${minutes}`
  const colonLit = !blink || !parts || parts.seconds % 2 === 0
  const period = parts && parts.hours >= 12 ? "PM" : "AM"
  const periodShown = hour12 && showPeriod

  // Lay the characters out left to right.
  let cursor = SLANT_PAD
  const glyphs = Array.from(text).map((char) => {
    const x = cursor
    cursor += (char === ":" ? COLON_WIDTH : DIGIT_WIDTH) + SPACING
    return { char, x }
  })
  const periodX = cursor
  const width = cursor - SPACING + SLANT_PAD + (periodShown ? 34 : 0)

  const spoken = parts
    ? `${hours.trim()}:${minutes}${showSeconds ? `:${seconds}` : ""}${hour12 ? ` ${period}` : ""}`
    : "Loading time"

  const face = (
    <svg
      viewBox={`0 0 ${width} ${DIGIT_HEIGHT}`}
      className="block h-auto w-full overflow-visible"
      aria-hidden
    >
      <g
        transform={`skewX(${SLANT_DEGREES}) translate(${DIGIT_HEIGHT * 0.12} 0)`}
        style={
          glow
            ? {
                filter:
                  "drop-shadow(0 0 4px color-mix(in oklab, currentColor 55%, transparent))",
              }
            : undefined
        }
      >
        {glyphs.map(({ char, x }, index) =>
          char === ":" ? (
            <g
              key={index}
              fill="currentColor"
              style={{ opacity: colonLit ? 1 : "var(--digital-clock-ghost)" }}
            >
              <circle cx={x + COLON_WIDTH / 2} cy={DIGIT_HEIGHT * 0.33} r={6} />
              <circle cx={x + COLON_WIDTH / 2} cy={DIGIT_HEIGHT * 0.67} r={6} />
            </g>
          ) : (
            <DigitalClockDigit key={index} char={char} x={x} />
          )
        )}
        {periodShown && parts ? (
          <text
            x={periodX}
            y={22}
            fill="currentColor"
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {period}
          </text>
        ) : null}
      </g>
    </svg>
  )

  return (
    <div
      role="img"
      aria-label={label ?? spoken}
      data-slot="digital-clock"
      data-framed={framed || undefined}
      className={cn("w-full", className)}
      style={
        {
          color,
          "--digital-clock-ghost": ghost ? 0.08 : 0,
          ...(framed
            ? {
                padding: "3%",
                borderRadius: "0.9rem",
                background:
                  "linear-gradient(to bottom, #2e2e2e, #121212 55%, #0b0b0b)",
                boxShadow:
                  "inset 0 1px 0 rgb(255 255 255 / 0.12), 0 12px 30px -12px rgb(0 0 0 / 0.6), 0 0 0 1px rgb(0 0 0 / 0.8)",
              }
            : null),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {framed ? (
        <div
          className="relative overflow-hidden"
          style={{
            padding: "5% 6%",
            borderRadius: "0.4rem",
            background: "#050505",
            boxShadow:
              "inset 0 2px 10px rgb(0 0 0 / 0.9), 0 0 0 1px rgb(255 255 255 / 0.04)",
          }}
        >
          {face}
          {/* The glass: a faint sheen across the top of the face. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(170deg, rgb(255 255 255 / 0.07) 0%, rgb(255 255 255 / 0.02) 38%, transparent 40%)",
            }}
          />
        </div>
      ) : (
        face
      )}
    </div>
  )
}

export { DigitalClock }
