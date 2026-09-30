"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * A tiny dot-matrix loader: a square of dots where some light up in a moving
 * pattern (a comet running the rim, a ripple from the center, a snake, rain).
 *
 * Every dot is a plain element on one CSS animation; a pattern only decides
 * which dots take part and how far into the cycle each one starts, so the grid
 * costs nothing to run and needs no JavaScript once it has rendered.
 *
 * Dots take the text color, so `className="text-primary"` or `color` tints it.
 *
 * <AtomGrid />
 * <AtomGrid pattern="snake" cols={7} dotSize={3} />
 * <AtomGrid pattern="ripple" cols={9} glow className="text-primary" />
 *
 * With `fill` the grid ignores `cols` and `rows`, measures its box and lays
 * out as many dots as fit, so a pattern can cover a whole card. The box needs
 * a size of its own, such as `absolute inset-0` inside a sized parent.
 *
 * <AtomGrid fill pattern="ripple" className="absolute inset-0" />
 */

const atomGridPatterns = [
  "orbit",
  "orbit-duo",
  "diamond",
  "vortex",
  "spiral",
  "ripple",
  "pulse",
  "snake",
  "scan",
  "wave",
  "diagonal",
  "rain",
  "cross",
  "saltire",
  "corners",
  "checker",
  "sparkle",
  "heart",
] as const

type AtomGridPattern = (typeof atomGridPatterns)[number]

const atomGridShapes = ["circle", "rounded", "square", "diamond"] as const

type AtomGridShape = (typeof atomGridShapes)[number]

/** How a lit dot moves through one cycle. */
type Motion = "comet" | "breathe" | "lift" | "blink" | "flip"

/** Where a dot sits, measured every way a pattern might want. */
type Point = {
  x: number
  y: number
  cols: number
  rows: number
  /** Offset from the center, in dots. */
  dx: number
  dy: number
  /** Clockwise turn from twelve o'clock, 0 to 1. */
  angle: number
  /** Distance from the center, 0 at the middle to 1 at the far corner. */
  dist: number
  /** Dots in from the nearest edge; 0 is the rim. */
  ring: number
}

type PatternSpec = {
  motion: Motion
  /** Seconds for one cycle. */
  speed: number
  /** How far into the cycle a dot peaks (0 to 1), or `null` to leave it dim. */
  phase: (point: Point) => number | null
}

const fract = (value: number) => value - Math.floor(value)

/** A steady pseudo-random 0 to 1 per dot, so sparkle and rain never reshuffle. */
const hash = (x: number, y = 0) =>
  fract(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453)

const HEART = [
  ".XX.XX.",
  "XXXXXXX",
  "XXXXXXX",
  "XXXXXXX",
  ".XXXXX.",
  "..XXX..",
  "...X...",
]

const PATTERNS: Record<AtomGridPattern, PatternSpec> = {
  orbit: {
    motion: "comet",
    speed: 1.2,
    phase: ({ ring, angle }) => (ring === 0 ? angle : null),
  },
  "orbit-duo": {
    motion: "comet",
    speed: 1.4,
    phase: ({ ring, angle }) => (ring === 0 ? fract(angle * 2) : null),
  },
  diamond: {
    motion: "comet",
    speed: 1.2,
    phase: ({ dx, dy, cols, rows, angle }) => {
      const radius = Math.floor((Math.min(cols, rows) - 1) / 2)
      return Math.abs(Math.abs(dx) + Math.abs(dy) - radius) < 0.6 ? angle : null
    },
  },
  vortex: {
    motion: "comet",
    speed: 1.6,
    phase: ({ ring, angle }) => fract(angle + ring * 0.18),
  },
  spiral: {
    motion: "comet",
    speed: 1.8,
    phase: ({ angle, dist }) => fract(angle + dist),
  },
  ripple: {
    motion: "comet",
    speed: 1.4,
    phase: ({ dist }) => dist * 0.7,
  },
  pulse: {
    motion: "breathe",
    speed: 1.6,
    phase: ({ dist }) => dist * 0.3,
  },
  snake: {
    motion: "comet",
    speed: 2.4,
    phase: ({ x, y, cols, rows }) =>
      (y * cols + (y % 2 ? cols - 1 - x : x)) / (cols * rows),
  },
  scan: {
    motion: "comet",
    speed: 1.2,
    phase: ({ y, rows }) => (y / rows) * 0.6,
  },
  wave: {
    motion: "lift",
    speed: 1.2,
    phase: ({ x, cols }) => (x / cols) * 0.6,
  },
  diagonal: {
    motion: "comet",
    speed: 1.4,
    phase: ({ x, y, cols, rows }) => ((x + y) / (cols + rows - 1)) * 0.7,
  },
  rain: {
    motion: "comet",
    speed: 1.6,
    phase: ({ x, y, rows }) => fract(hash(x) + (y / rows) * 0.45),
  },
  cross: {
    motion: "breathe",
    speed: 1.4,
    phase: ({ dx, dy, dist }) =>
      Math.abs(dx) < 0.6 || Math.abs(dy) < 0.6 ? dist * 0.4 : null,
  },
  saltire: {
    motion: "breathe",
    speed: 1.4,
    phase: ({ dx, dy, dist }) =>
      Math.abs(Math.abs(dx) - Math.abs(dy)) < 0.6 ? dist * 0.4 : null,
  },
  corners: {
    motion: "comet",
    speed: 1.2,
    phase: ({ x, y, cols, rows }) => {
      const right = x === cols - 1
      const bottom = y === rows - 1
      if ((x !== 0 && !right) || (y !== 0 && !bottom)) return null
      // Clockwise from the top left.
      return bottom ? (right ? 0.5 : 0.75) : right ? 0.25 : 0
    },
  },
  checker: {
    motion: "flip",
    speed: 1.2,
    phase: ({ x, y }) => ((x + y) % 2 ? 0.5 : 0),
  },
  sparkle: {
    motion: "blink",
    speed: 2.2,
    phase: ({ x, y }) => hash(x, y),
  },
  heart: {
    motion: "breathe",
    speed: 1.2,
    phase: ({ dx, dy, cols, rows, dist }) => {
      // A square in the middle, so a wide grid doesn't stretch the heart.
      const side = Math.min(cols, rows)
      const row = Math.floor(((dy + (side - 1) / 2) * 7) / side)
      const col = Math.floor(((dx + (side - 1) / 2) * 7) / side)
      return HEART[row]?.[col] === "X" ? dist * 0.2 : null
    },
  },
}

function pointAt(x: number, y: number, cols: number, rows: number): Point {
  const dx = x - (cols - 1) / 2
  const dy = y - (rows - 1) / 2
  const reach = Math.hypot((cols - 1) / 2, (rows - 1) / 2) || 1
  return {
    x,
    y,
    cols,
    rows,
    dx,
    dy,
    angle: fract(Math.atan2(dx, -dy) / (2 * Math.PI) + 1),
    dist: Math.hypot(dx, dy) / reach,
    ring: Math.min(x, y, cols - 1 - x, rows - 1 - y),
  }
}

// Keyframes peak at 0%, so a dot's delay puts its peak at `phase` of the cycle.
const atomGridStyles = `
[data-slot="atom-grid-dot"] {
  width: var(--atom-dot);
  height: var(--atom-dot);
  background: currentColor;
  opacity: var(--atom-idle);
  transform: scale(0.8);
}
[data-slot="atom-grid"][data-shape="circle"] > [data-slot="atom-grid-dot"] { border-radius: 9999px; }
[data-slot="atom-grid"][data-shape="rounded"] > [data-slot="atom-grid-dot"] { border-radius: 30%; }
[data-slot="atom-grid"][data-shape="diamond"] > [data-slot="atom-grid-dot"] { border-radius: 15%; rotate: 45deg; scale: 0.78; }
[data-slot="atom-grid-dot"][data-on] {
  animation: var(--atom-speed) linear infinite both atom-grid-comet;
}
[data-slot="atom-grid"][data-motion="breathe"] > [data-on] { animation-name: atom-grid-breathe; animation-timing-function: ease-in-out; }
[data-slot="atom-grid"][data-motion="lift"] > [data-on] { animation-name: atom-grid-lift; animation-timing-function: ease-in-out; }
[data-slot="atom-grid"][data-motion="blink"] > [data-on] { animation-name: atom-grid-blink; }
[data-slot="atom-grid"][data-motion="flip"] > [data-on] { animation-name: atom-grid-flip; animation-timing-function: ease-in-out; }
[data-slot="atom-grid"][data-glow] > [data-on] {
  filter: drop-shadow(0 0 calc(var(--atom-dot) * 0.6) currentColor);
}
[data-slot="atom-grid"][data-paused] > [data-slot="atom-grid-dot"] { animation-play-state: paused; }
@keyframes atom-grid-comet {
  0% { opacity: 1; transform: scale(1.1); }
  30% { opacity: calc(var(--atom-idle) + 0.25); transform: scale(0.9); }
  100% { opacity: var(--atom-idle); transform: scale(0.8); }
}
@keyframes atom-grid-breathe {
  0% { opacity: 1; transform: scale(1.05); }
  50% { opacity: calc(var(--atom-idle) + 0.1); transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.05); }
}
@keyframes atom-grid-lift {
  0% { opacity: 1; transform: translateY(-40%) scale(1.05); }
  25%, 75% { opacity: calc(var(--atom-idle) + 0.15); transform: translateY(0) scale(0.85); }
  100% { opacity: 1; transform: translateY(-40%) scale(1.05); }
}
@keyframes atom-grid-blink {
  0% { opacity: 1; transform: scale(1.15); }
  12%, 100% { opacity: var(--atom-idle); transform: scale(0.8); }
}
@keyframes atom-grid-flip {
  0%, 35% { opacity: 1; transform: scale(1); }
  50%, 85% { opacity: var(--atom-idle); transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  [data-slot="atom-grid-dot"][data-on] { animation: none; opacity: 1; transform: none; }
}
`

function AtomGrid({
  pattern = "orbit",
  cols = 5,
  rows = cols,
  dotSize = 4,
  gap = 2,
  speed,
  shape = "circle",
  glow = false,
  idleOpacity = 0.12,
  paused = false,
  color,
  label = "Loading",
  fill = false,
  className,
  style,
  ref,
  ...props
}: Omit<React.ComponentProps<"span">, "children" | "color"> & {
  pattern?: AtomGridPattern
  /** Dots across; 3 to 9 reads best. */
  cols?: number
  /** Dots down; defaults to `cols` for a square grid. */
  rows?: number
  /** Width of one dot, in pixels. */
  dotSize?: number
  /** Space between dots, in pixels. */
  gap?: number
  /** Seconds for one cycle; each pattern has its own default. */
  speed?: number
  shape?: AtomGridShape
  /** A soft bloom around lit dots. */
  glow?: boolean
  /** Opacity of the dots that are resting, 0 to 1. */
  idleOpacity?: number
  paused?: boolean
  /** Dot color; any CSS color. Defaults to the text color. */
  color?: string
  /** Accessible name for the status. */
  label?: string
  /** Fit as many dots as the box holds, instead of `cols` by `rows`. */
  fill?: boolean
}) {
  const spec = PATTERNS[pattern]
  const seconds = speed ?? spec.speed

  const node = React.useRef<HTMLSpanElement | null>(null)
  const [fitted, setFitted] = React.useState<{ cols: number; rows: number }>()

  React.useEffect(() => {
    const element = node.current
    if (!fill || !element) return
    const pitch = dotSize + gap
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const next = {
        cols: Math.max(1, Math.floor((width + gap) / pitch)),
        rows: Math.max(1, Math.floor((height + gap) / pitch)),
      }
      setFitted((was) =>
        was?.cols === next.cols && was.rows === next.rows ? was : next
      )
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [fill, dotSize, gap])

  // A filled grid draws nothing until it has measured its box.
  const across = fill ? (fitted?.cols ?? 0) : cols
  const down = fill ? (fitted?.rows ?? 0) : rows

  const atoms = React.useMemo(
    () =>
      Array.from({ length: across * down }, (_, index) =>
        spec.phase(
          pointAt(index % across, Math.floor(index / across), across, down)
        )
      ),
    [spec, across, down]
  )

  const setRef = (element: HTMLSpanElement | null) => {
    node.current = element
    if (typeof ref === "function") ref(element)
    else if (ref) ref.current = element
  }

  // A span, so the loader can sit inside a paragraph or a button.
  return (
    <span
      ref={setRef}
      role="status"
      aria-label={label}
      data-slot="atom-grid"
      data-pattern={pattern}
      data-motion={spec.motion}
      data-shape={shape}
      data-glow={glow || undefined}
      data-paused={paused || undefined}
      data-fill={fill || undefined}
      className={cn(
        fill
          ? "grid size-full content-center justify-center overflow-hidden"
          : "inline-grid shrink-0 align-middle",
        className
      )}
      style={
        {
          gridTemplateColumns: `repeat(${across}, ${dotSize}px)`,
          gap,
          color,
          "--atom-dot": `${dotSize}px`,
          "--atom-idle": idleOpacity,
          "--atom-speed": `${seconds}s`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <style href="standard-atom-grid" precedence="default">
        {atomGridStyles}
      </style>
      {atoms.map((phase, index) => (
        <span
          key={index}
          aria-hidden
          data-slot="atom-grid-dot"
          data-on={phase === null ? undefined : true}
          style={
            phase === null
              ? undefined
              : // A negative delay starts the dot mid-cycle, peaking at `phase`.
                // Rounded so the server and browser write the same string.
                {
                  animationDelay: `${Number((-(1 - phase) * seconds).toFixed(3))}s`,
                }
          }
        />
      ))}
    </span>
  )
}

export {
  AtomGrid,
  atomGridPatterns,
  atomGridShapes,
  type AtomGridPattern,
  type AtomGridShape,
}
