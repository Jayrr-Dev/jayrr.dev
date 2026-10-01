"use client"

import * as React from "react"
import { RotateCwIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

/**
 * A wheel of slices that spins and eases to a stop under the pointer at the
 * top. The winner is picked before the spin starts (at random, by `weight`,
 * or by `pick`), so the wheel always lands on the slice it reports.
 *
 * <WheelOfFortune
 *   segments={[
 *     { label: "10% off", description: "Use SAVE10 at checkout." },
 *     { label: "Free ship" },
 *     { label: "Try again" },
 *   ]}
 *   onSpinEnd={(segment) => save(segment.label)}
 * />
 *
 * `variant="drag"` also lets people grab the wheel and fling it: a faster
 * fling spins longer, in the direction it was thrown. `spinButton` puts the
 * spin button in the centre (default), under the wheel, or nowhere. When the wheel stops,
 * a prize window opens over it (turn off with `resultWindow={false}`).
 *
 * Slices default to alternating theme fills; pass `color` and `textColor`
 * (any CSS color, e.g. "var(--chart-2)") to set your own. Reduced motion
 * skips the animation and lands straight away.
 */

type WheelSegment = {
  label: string
  /** Shown under the label in the prize window. */
  description?: string
  /** Relative chance of landing here. Slices stay the same size. */
  weight?: number
  /** Slice fill, any CSS color. */
  color?: string
  /** Label color, any CSS color. */
  textColor?: string
}

type WheelOfFortuneProps = Omit<React.ComponentProps<"div">, "children"> & {
  segments: WheelSegment[]
  /** button: spin from the hub. drag: also grab and fling the wheel. */
  variant?: "button" | "drag"
  /** Seconds from spin to stop for a hub spin. Flings set their own. */
  duration?: number
  /** Full turns before the wheel settles on a hub spin. */
  turns?: number
  /** Chooses the winning index instead of a weighted random pick. */
  pick?: (segments: WheelSegment[]) => number
  onSpinStart?: (segment: WheelSegment, index: number) => void
  onSpinEnd?: (segment: WheelSegment, index: number) => void
  /**
   * Where the spin button sits: a knob in the centre, a pill under the
   * wheel, or none (for a drag-only wheel).
   */
  spinButton?: "center" | "below" | "none"
  /** Text on the spin button. */
  spinLabel?: React.ReactNode
  /** Opens a prize window over the wheel when it stops. */
  resultWindow?: boolean
  /** Small line above the prize in the window. */
  resultEyebrow?: React.ReactNode
  /** Marquee bulbs round the rim that chase while spinning. */
  lights?: boolean
  disabled?: boolean
}

// Fills that keep their label legible in light and dark.
const DEFAULT_FILLS = [
  { color: "var(--primary)", textColor: "var(--primary-foreground)" },
  { color: "var(--secondary)", textColor: "var(--secondary-foreground)" },
]
const ODD_FILL = { color: "var(--muted)", textColor: "var(--muted-foreground)" }

const VIEW = 200
const CENTER = VIEW / 2
/** Slices end here; the rim band and its bulbs sit just outside. */
const RADIUS = 88
const RIM = 94

// Bulbs chase while spinning and flash together on landing. The pointer
// ticks back as slices pass. Reduced motion keeps everything still.
const wheelKeyframes = `
@keyframes wheel-of-fortune-chase{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes wheel-of-fortune-flash{0%,100%{opacity:1}50%{opacity:.1}}
@keyframes wheel-of-fortune-tick{0%,100%{transform:rotate(0)}30%{transform:rotate(-18deg)}}
[data-slot=wheel-of-fortune][data-spinning] [data-wheel-bulb]{animation:wheel-of-fortune-chase .5s linear infinite}
[data-slot=wheel-of-fortune][data-spinning] [data-wheel-bulb][data-odd]{animation-delay:-.25s}
[data-slot=wheel-of-fortune][data-landed] [data-wheel-bulb]{animation:wheel-of-fortune-flash .3s linear 4}
[data-slot=wheel-of-fortune][data-spinning] [data-wheel-pointer]{animation:wheel-of-fortune-tick .18s ease-out infinite}
@media (prefers-reduced-motion:reduce){[data-slot=wheel-of-fortune] [data-wheel-bulb],[data-slot=wheel-of-fortune] [data-wheel-pointer]{animation:none!important}}
`

function rounds(value: number) {
  return Math.round(value * 1000) / 1000
}

/** A point on the circle, `degrees` clockwise from the top. */
function pointAt(degrees: number, radius: number) {
  const radians = (degrees * Math.PI) / 180

  // Rounded so the server and the browser print the same path (no hydration
  // mismatch from the last digit of Math.sin).
  return [
    rounds(CENTER + radius * Math.sin(radians)),
    rounds(CENTER - radius * Math.cos(radians)),
  ] as const
}

function slicePath(start: number, end: number) {
  const [x1, y1] = pointAt(start, RADIUS)
  const [x2, y2] = pointAt(end, RADIUS)
  const largeArc = end - start > 180 ? 1 : 0

  return `M${CENTER} ${CENTER}L${x1} ${y1}A${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}Z`
}

/** The slice's fill, so neighbours never match (an odd count ends on muted). */
function fillFor(index: number, count: number) {
  if (count % 2 === 1 && count > 1 && index === count - 1) {
    return ODD_FILL
  }

  return DEFAULT_FILLS[index % 2]
}

/** Label size by slice count: fewer, wider slices take larger text. */
function labelSizeFor(count: number) {
  if (count <= 2) {
    return 12
  }

  return count > 10 ? 7 : 9
}

function picksWeighted(segments: WheelSegment[]) {
  const weights = segments.map((segment) => Math.max(0, segment.weight ?? 1))
  const total = weights.reduce((sum, weight) => sum + weight, 0)

  if (total === 0) {
    return Math.floor(Math.random() * segments.length)
  }

  let roll = Math.random() * total

  for (let index = 0; index < weights.length; index++) {
    roll -= weights[index]
    if (roll < 0) {
      return index
    }
  }

  return segments.length - 1
}

/** Pointer angle round the wheel's centre, clockwise from the top. */
function angleOf(event: React.PointerEvent, element: HTMLElement) {
  const box = element.getBoundingClientRect()
  const x = event.clientX - (box.left + box.width / 2)
  const y = event.clientY - (box.top + box.height / 2)

  return (Math.atan2(x, -y) * 180) / Math.PI
}

type Drag = {
  pointerId: number
  lastAngle: number
  rotation: number
  /** Recent (rotation, time) samples for the release speed. */
  samples: { rotation: number; time: number }[]
}

function WheelOfFortune({
  segments,
  variant = "button",
  duration = 5,
  turns = 6,
  pick,
  onSpinStart,
  onSpinEnd,
  spinButton = "center",
  spinLabel = "Spin",
  resultWindow = true,
  resultEyebrow = "You landed on",
  lights = true,
  disabled = false,
  className,
  ...props
}: WheelOfFortuneProps) {
  const [rotation, setRotation] = React.useState(0)
  const [spinSeconds, setSpinSeconds] = React.useState(duration)
  const [spinning, setSpinning] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [landed, setLanded] = React.useState(false)
  // The fill is kept with the prize, since the slice may leave the wheel.
  const [result, setResult] = React.useState<{
    segment: WheelSegment
    fill: string
  } | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const winnerRef = React.useRef<number | null>(null)
  const dragRef = React.useRef<Drag | null>(null)

  const count = segments.length
  const slice = count > 0 ? 360 / count : 360
  const busy = spinning || dragging || disabled || count === 0
  const bulbCount = Math.max(16, Math.min(32, count * 2))

  const finishes = React.useCallback(() => {
    const index = winnerRef.current
    winnerRef.current = null
    setSpinning(false)

    if (index === null || !segments[index]) {
      return
    }

    setLanded(true)
    setAnnouncement(`Landed on ${segments[index].label}`)
    if (resultWindow) {
      setResult({
        segment: segments[index],
        fill: segments[index].color ?? fillFor(index, segments.length).color,
      })
    }
    onSpinEnd?.(segments[index], index)
  }, [onSpinEnd, resultWindow, segments])

  /**
   * Spins from `from` to land on a picked slice. `direction` is 1 for
   * clockwise, -1 for counter-clockwise.
   */
  function spins({
    from,
    fullTurns,
    seconds,
    direction,
  }: {
    from: number
    fullTurns: number
    seconds: number
    direction: 1 | -1
  }) {
    const chosen = pick ? pick(segments) : picksWeighted(segments)
    const index = Math.min(Math.max(Math.round(chosen), 0), count - 1)
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const time = reduced ? 0 : seconds

    // Land somewhere inside the slice, not always dead centre.
    const middle = index * slice + slice / 2
    const jitter = (Math.random() - 0.5) * slice * 0.6
    // The pointer reads the wheel at -rotation, so bring the winner there.
    const current = ((from % 360) + 360) % 360
    const ahead = (((-(middle + jitter) - current) % 360) + 360) % 360
    const travel =
      direction === 1
        ? (reduced ? 0 : fullTurns * 360) + ahead
        : -(reduced ? 0 : fullTurns * 360) - (360 - ahead)

    winnerRef.current = index
    setResult(null)
    setLanded(false)
    setAnnouncement("")
    setSpinning(true)
    setSpinSeconds(time)
    setRotation(from + travel)
    onSpinStart?.(segments[index], index)

    if (time === 0) {
      // No transition runs, so no transitionend arrives.
      window.setTimeout(finishes, 0)
    }
  }

  function spinsFromHub() {
    if (busy) {
      return
    }

    spins({ from: rotation, fullTurns: turns, seconds: duration, direction: 1 })
  }

  function startsDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (variant !== "drag" || busy || event.button !== 0) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      lastAngle: angleOf(event, event.currentTarget),
      rotation,
      samples: [{ rotation, time: event.timeStamp }],
    }
    setResult(null)
    setLanded(false)
    setDragging(true)
  }

  function movesDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current

    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }

    const angle = angleOf(event, event.currentTarget)
    // Unwrap across the ±180° seam so a full circle keeps adding up.
    const step = ((angle - drag.lastAngle + 540) % 360) - 180
    const next = drag.rotation + step

    drag.lastAngle = angle
    drag.rotation = next
    drag.samples = [
      ...drag.samples.filter((sample) => event.timeStamp - sample.time < 100),
      { rotation: next, time: event.timeStamp },
    ]
    setRotation(next)
  }

  function endsDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current

    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }

    dragRef.current = null
    setDragging(false)

    const first = drag.samples[0]
    const last = drag.samples[drag.samples.length - 1]
    const elapsed = Math.max(event.timeStamp - first.time, 1)
    // Degrees per millisecond over the last tenth of a second.
    const speed =
      event.timeStamp - last.time > 80
        ? 0
        : (last.rotation - first.rotation) / elapsed

    // A slow release just lets go where it is.
    if (Math.abs(speed) < 0.25 || count === 0) {
      return
    }

    const strength = Math.min(Math.abs(speed), 4)

    spins({
      from: drag.rotation,
      fullTurns: Math.round(2 + strength * 2),
      seconds: 2.5 + strength,
      direction: speed > 0 ? 1 : -1,
    })
  }

  return (
    <div
      data-slot="wheel-of-fortune"
      data-variant={variant}
      data-spinning={spinning || undefined}
      data-landed={landed || undefined}
      className={cn(
        "flex w-full max-w-xs flex-col items-center gap-4",
        className
      )}
      {...props}
    >
      <style href="standard-wheel-of-fortune" precedence="default">
        {wheelKeyframes}
      </style>

      <div className="relative aspect-square w-full">
        {/* Clips the turning box, whose corners would otherwise poke past the
          page edge and add a scrollbar mid-spin. */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div
            data-slot="wheel-of-fortune-wheel"
            className={cn(
              "size-full rounded-full",
              variant === "drag" &&
                !busy &&
                "cursor-grab touch-none active:cursor-grabbing",
              variant === "drag" && dragging && "cursor-grabbing touch-none"
            )}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? `transform ${spinSeconds}s cubic-bezier(0.15, 0.75, 0.12, 1)`
                : undefined,
            }}
            onPointerDown={startsDrag}
            onPointerMove={movesDrag}
            onPointerUp={endsDrag}
            onPointerCancel={endsDrag}
            onTransitionEnd={(event) => {
              if (
                event.target === event.currentTarget &&
                event.propertyName === "transform"
              ) {
                finishes()
              }
            }}
          >
            <svg
              viewBox={`0 0 ${VIEW} ${VIEW}`}
              aria-hidden
              className="size-full overflow-visible select-none"
            >
              {count === 1 ? (
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  style={{ fill: segments[0].color ?? DEFAULT_FILLS[0].color }}
                />
              ) : (
                segments.map((segment, index) => (
                  <path
                    key={index}
                    d={slicePath(index * slice, (index + 1) * slice)}
                    strokeWidth={1}
                    className="stroke-background"
                    style={{
                      fill: segment.color ?? fillFor(index, count).color,
                    }}
                  />
                ))
              )}
              {segments.map((segment, index) => {
                const middle = index * slice + slice / 2
                // Labels run along the slice, ending near the rim. On the left
                // half they turn round so they never read upside down.
                const flipped = middle > 180

                return (
                  <text
                    key={index}
                    transform={`rotate(${flipped ? middle + 90 : middle - 90} ${CENTER} ${CENTER})`}
                    x={flipped ? CENTER - RADIUS + 8 : CENTER + RADIUS - 8}
                    y={CENTER}
                    textAnchor={flipped ? "start" : "end"}
                    dominantBaseline="central"
                    fontSize={labelSizeFor(count)}
                    fontWeight={600}
                    style={{
                      fill:
                        segment.textColor ??
                        (segment.color
                          ? undefined
                          : fillFor(index, count).textColor),
                    }}
                    className={
                      segment.color && !segment.textColor
                        ? "fill-foreground"
                        : undefined
                    }
                  >
                    {segment.label}
                  </text>
                )
              })}
            </svg>
          </div>
        </div>

        {/* The rim, its bulbs and the pointer stay put while the wheel turns. */}
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RIM}
            fill="none"
            strokeWidth={10}
            className="stroke-foreground"
          />
          {lights
            ? Array.from({ length: bulbCount }, (_, index) => {
                const [x, y] = pointAt((index / bulbCount) * 360, RIM)

                return (
                  <circle
                    key={index}
                    data-wheel-bulb
                    data-odd={index % 2 === 1 || undefined}
                    cx={x}
                    cy={y}
                    r={2}
                    className="fill-background"
                  />
                )
              })
            : null}
        </svg>

        <svg
          viewBox="0 0 24 30"
          aria-hidden
          data-wheel-pointer
          className="absolute top-0 left-1/2 w-1/12 origin-top -translate-x-1/2 -translate-y-1/3 drop-shadow-md"
        >
          <path
            d="M12 28C6 20 2 15 2 10a10 10 0 0 1 20 0c0 5-4 10-10 18Z"
            strokeWidth={2}
            strokeLinejoin="round"
            className="fill-foreground stroke-background"
          />
          <circle cx={12} cy={10} r={3.5} className="fill-background" />
        </svg>

        {spinButton === "center" ? (
          /* The hub: a knob whose arrow turns on hover and spins with the wheel. */
          <button
            type="button"
            data-slot="wheel-of-fortune-spin"
            onClick={spinsFromHub}
            disabled={busy}
            aria-label={
              typeof spinLabel === "string"
                ? `${spinLabel} the wheel`
                : undefined
            }
            className="group/spin absolute top-1/2 left-1/2 grid size-1/4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-background p-1 shadow-lg ring-1 ring-border transition-transform outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="relative flex size-full flex-col items-center justify-center gap-0.5 rounded-full bg-foreground text-background">
              <RotateCwIcon
                aria-hidden
                className={cn(
                  "size-3.5 transition-transform duration-300 group-hover/spin:rotate-90",
                  spinning && "animate-spin"
                )}
              />
              <span className="text-xs leading-none font-bold tracking-widest uppercase">
                {spinLabel}
              </span>
            </span>
          </button>
        ) : (
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 size-1/12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-md ring-4 ring-background"
          />
        )}

        {result ? (
          <div
            role="dialog"
            aria-label="Result"
            className="absolute inset-0 grid animate-in place-items-center rounded-full bg-background/60 p-6 backdrop-blur-sm fade-in-0"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setResult(null)
              }
            }}
          >
            <div className="relative flex w-full max-w-56 animate-in flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center text-card-foreground shadow-xl fade-in-0 zoom-in-90">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setResult(null)}
                className="absolute top-2 right-2 grid size-6 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <XIcon className="size-3.5" />
              </button>
              <span
                aria-hidden
                className="size-3 rounded-full ring-2 ring-border"
                style={{ background: result.fill }}
              />
              <span className="text-xs text-muted-foreground">
                {resultEyebrow}
              </span>
              <span className="text-xl leading-tight font-bold">
                {result.segment.label}
              </span>
              {result.segment.description ? (
                <span className="text-xs text-muted-foreground">
                  {result.segment.description}
                </span>
              ) : null}
              <Button
                size="sm"
                leading={<RotateCwIcon className="size-3.5" />}
                onClick={() => {
                  setResult(null)
                  spins({
                    from: rotation,
                    fullTurns: turns,
                    seconds: duration,
                    direction: 1,
                  })
                }}
                disabled={disabled}
                autoFocus
              >
                Spin again
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {spinButton === "below" ? (
        <Button
          data-slot="wheel-of-fortune-spin"
          shape="pill"
          size="lg"
          block
          onClick={spinsFromHub}
          disabled={busy}
          leading={
            <RotateCwIcon
              className={cn("size-4", spinning && "animate-spin")}
            />
          }
        >
          {spinning ? "Spinning…" : spinLabel}
        </Button>
      ) : null}

      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  )
}

export { WheelOfFortune, type WheelSegment, type WheelOfFortuneProps }
