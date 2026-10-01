"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * A field of bars, packed edge to edge, whose lengths trace a moving wave.
 * Many thin bars read as one continuous shape, so sines, interference,
 * terrain and audio-like traces come out smooth even with no gap between bars.
 *
 * Bars stand upright by default. `orientation="vertical"` turns the field a
 * quarter turn clockwise: bars lie flat, stacked top to bottom, and `bottom`
 * anchors them to the left edge. The field is `h-24` by default (`h-64` when
 * vertical); size it with `className`.
 *
 * The bars are drawn on one canvas as a single path and filled in one call, so
 * a thousand bars cost about the same as a hundred.
 *
 * Run a built-in pattern, pass your own `wave(x, t)` for any shape you can
 * write as a function, or control the lengths yourself with `value`. Color it
 * with `color`, a two-color `tipColor`, a `palette`, or your own `colors`.
 *
 * <Waveform pattern="interference" />
 * <Waveform pattern="voice" anchor="center" bars={240} />
 * <Waveform wave={(x, t) => 0.5 + 0.4 * Math.sin(x * 20 - t * 3)} />
 * <Waveform value={levels} smoothing={0.6} />
 * <Waveform palette="sunset" gradient="span" fade="edges" />
 * <Waveform orientation="vertical" palette="aurora" gradient="level" />
 */

const waveformPatterns = [
  "sine",
  "interference",
  "ripple",
  "packet",
  "terrain",
  "spectrum",
  "voice",
  "heartbeat",
  "breathe",
] as const

type WaveformPattern = (typeof waveformPatterns)[number]

/**
 * Where bars grow from: the bottom edge, the top edge, or mirrored about the
 * middle. In a vertical field, `bottom` is the left edge and `top` the right.
 */
const waveformAnchors = ["bottom", "center", "top"] as const

type WaveformAnchor = (typeof waveformAnchors)[number]

const waveformOrientations = ["horizontal", "vertical"] as const

type WaveformOrientation = (typeof waveformOrientations)[number]

/**
 * How a gradient runs, relative to the bars, so it reads the same in either
 * orientation: `tip` blends from the base out to the full length, so long
 * bars reach the last color; `span` runs from the first bar to the last;
 * `level` colors each bar whole by its own length, like a meter.
 */
const waveformGradients = ["tip", "span", "level"] as const

type WaveformGradient = (typeof waveformGradients)[number]

/** Fades bars out toward their tips, toward the first and last bars, or both. */
const waveformFades = ["none", "tip", "edges", "both"] as const

type WaveformFade = (typeof waveformFades)[number]

/** Ready-made gradients, base color first. */
const waveformPalettes = {
  sunset: ["oklch(0.5 0.22 300)", "oklch(0.68 0.24 15)", "oklch(0.88 0.17 85)"],
  aurora: [
    "oklch(0.45 0.15 265)",
    "oklch(0.75 0.17 165)",
    "oklch(0.93 0.2 125)",
  ],
  ocean: [
    "oklch(0.35 0.1 255)",
    "oklch(0.65 0.14 230)",
    "oklch(0.95 0.05 200)",
  ],
  ember: ["oklch(0.4 0.15 25)", "oklch(0.65 0.23 35)", "oklch(0.9 0.16 90)"],
  candy: [
    "oklch(0.7 0.2 350)",
    "oklch(0.72 0.16 290)",
    "oklch(0.85 0.12 200)",
  ],
  neon: ["oklch(0.65 0.3 330)", "oklch(0.7 0.25 290)", "oklch(0.88 0.17 190)"],
} satisfies Record<string, string[]>

type WaveformPalette = keyof typeof waveformPalettes

const waveformPaletteNames = Object.keys(waveformPalettes) as WaveformPalette[]

/**
 * Length of the bar at `x` (0 at the first bar, 1 at the last) at `t`
 * seconds, from 0 to 1. `index` and `count` locate the bar itself, for waves
 * that want per-bar detail.
 */
type WaveformFunction = (
  x: number,
  t: number,
  index: number,
  count: number
) => number

const TAU = Math.PI * 2

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** Smooth value noise on a 2D lattice, from 0 to 1. */
function noise(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash(xi + yi * 57)
  const b = hash(xi + 1 + yi * 57)
  const c = hash(xi + (yi + 1) * 57)
  const d = hash(xi + 1 + (yi + 1) * 57)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

/** Three octaves of noise, from 0 to 1. */
function fbm(x: number, y: number) {
  return (
    (noise(x, y) * 4 + noise(x * 2.1, y * 1.7) * 2 + noise(x * 4.3, y * 3.1)) /
    7
  )
}

function bell(x: number, center: number, width: number) {
  const d = (x - center) / width
  return Math.exp(-d * d)
}

/** Built-in waves, with `frequency` scaling how many crests fit across. */
const WAVES: Record<
  WaveformPattern,
  (x: number, t: number, frequency: number, index: number) => number
> = {
  sine: (x, t, f) => 0.5 + 0.42 * Math.sin(TAU * (x * 2 * f - t * 0.5)),
  interference: (x, t, f) =>
    0.5 +
    0.24 * Math.sin(TAU * (x * 3 * f - t * 0.4)) +
    0.2 * Math.sin(TAU * (x * 5.3 * f + t * 0.27)),
  ripple: (x, t, f) => {
    const d = Math.abs(x - 0.5) * 2
    return 0.5 + 0.45 * Math.cos(TAU * (d * 4 * f - t * 0.6)) * (1 - d * 0.6)
  },
  packet: (x, t, f) => {
    const center = ((t * 0.22) % 1.5) - 0.25
    const carrier = 0.5 + 0.5 * Math.cos(TAU * (x * 14 * f - t * 1.5))
    return 0.05 + 0.9 * bell(x, center, 0.13) * carrier
  },
  terrain: (x, t, f) => 0.08 + 0.92 * fbm(x * 6 * f + t * 0.5, t * 0.12),
  spectrum: (x, t, f, index) => {
    // Lows run tall, highs short, and each bar jitters a little on its own.
    const level = noise(x * 10 * f, t * 2.4) ** 1.6
    const tilt = 1 - x * 0.55
    return (level * 0.85 + noise(index * 0.7, t * 9) * 0.15) * tilt
  },
  voice: (x, t, f, index) => {
    // Phrases come and go along the clip; each bar is a loud or quiet sample.
    const phrase = noise(x * 3 * f + t * 0.7, 0.5)
    const envelope = Math.max(0, (phrase - 0.3) / 0.7) ** 1.3
    const sample = 0.25 + 0.75 * noise(index * 0.9, t * 6)
    return 0.03 + 0.97 * envelope * sample
  },
  heartbeat: (x, t, f) => {
    const p = (((x * 1.5 * f + t * 0.45) % 1) + 1) % 1
    return (
      0.32 +
      0.06 * bell(p, 0.25, 0.03) -
      0.08 * bell(p, 0.37, 0.008) +
      0.6 * bell(p, 0.4, 0.01) -
      0.14 * bell(p, 0.43, 0.01) +
      0.12 * bell(p, 0.6, 0.04)
    )
  },
  breathe: (x, t) => {
    const breath = 0.5 + 0.5 * Math.sin(t * 1.3)
    return 0.04 + 0.9 * bell(x, 0.5, 0.12 + 0.16 * breath) * (0.5 + 0.5 * breath)
  },
}

/** Width of the bump the pointer raises, as a fraction of the field. */
const POINTER_REACH = 0.05
/** Buckets a `level` gradient is cut into; bars draw as one path per bucket. */
const LEVELS = 32

type FieldConfig = {
  count: number
  wave: WaveformFunction | null
  value: number[] | null
  orientation: WaveformOrientation
  anchor: WaveformAnchor
  gap: number
  amplitude: number
  speed: number
  smoothing: number
  /** Resolved gradient stops, base first; one stop is a solid fill. */
  stops: string[]
  gradient: WaveformGradient
  fade: WaveformFade
  running: boolean
}

/**
 * Animates and draws the bars. Each frame computes every bar's target
 * length, eases the drawn length toward it, then fills all bars as one path.
 * The loop stops while paused or off screen, and draws once on any change.
 *
 * Drawing works in field space, where bars run along `span` and grow across
 * `depth`; a vertical field swaps the axes when it hands rectangles to the
 * canvas.
 */
class WaveformRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D | null
  private readonly observer: ResizeObserver | null
  private config: FieldConfig | null = null
  private heights = new Float32Array(0)
  private width = 0
  private height = 0
  private time = 0
  private last = 0
  private request = 0
  private pointer = { x: 0, strength: 0, inside: false }
  private fill: string | CanvasGradient = "#fff"
  private levels: string[] = []

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = canvas.getContext("2d")
    this.observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => this.measures())
    this.observer?.observe(canvas)
  }

  configure(config: FieldConfig) {
    const first = !this.config
    if (config.count !== this.heights.length) {
      this.heights = new Float32Array(config.count)
      // A new field starts on its first frame instead of growing from nothing.
      this.config = config
      this.steps(0, true)
    }
    this.config = config
    this.paints()
    if (first) this.measures()
    if (config.running) this.starts()
    else {
      this.stops()
      this.steps(0, true)
      this.draws()
    }
  }

  /** Moves the pointer bump to `x`, from 0 to 1 along the field, or lifts it with `null`. */
  points(x: number | null) {
    this.pointer.inside = x !== null
    if (x !== null) this.pointer.x = x
    if (!this.config?.running) {
      this.pointer.strength = x === null ? 0 : 1
      this.steps(0, true)
      this.draws()
    }
  }

  destroy() {
    this.stops()
    this.observer?.disconnect()
  }

  private starts() {
    if (this.request) return
    this.last = performance.now()
    this.request = requestAnimationFrame(this.animates)
  }

  private stops() {
    cancelAnimationFrame(this.request)
    this.request = 0
  }

  private readonly animates = (now: number) => {
    // A long gap (a hidden tab) resumes the wave instead of jumping ahead.
    const elapsed = Math.min(now - this.last, 100)
    this.last = now
    this.steps(elapsed, false)
    this.draws()
    this.request = requestAnimationFrame(this.animates)
  }

  /** Advances time by `elapsed` milliseconds and eases bars toward their targets. */
  private steps(elapsed: number, snap: boolean) {
    const config = this.config
    if (!config) return
    const { count, wave, value, amplitude, smoothing } = config
    const heights = this.heights

    this.time += (elapsed / 1000) * config.speed
    const pointer = this.pointer
    const pull = 1 - Math.exp(-elapsed / 120)
    pointer.strength += ((pointer.inside ? 1 : 0) - pointer.strength) * pull
    const ease =
      snap || smoothing <= 0 ? 1 : 1 - Math.exp(-elapsed / (smoothing * 220))

    for (let index = 0; index < count; index++) {
      const x = count > 1 ? index / (count - 1) : 0.5
      let target = value
        ? (value[index] ?? 0)
        : wave
          ? wave(x, this.time, index, count)
          : 0
      target *= amplitude
      if (pointer.strength > 0.001) {
        const lift = pointer.strength * bell(x, pointer.x, POINTER_REACH)
        target += (1 - target) * lift * 0.85
      }
      target = Math.min(1, Math.max(0, Number.isFinite(target) ? target : 0))
      heights[index] += (target - heights[index]) * ease
    }
  }

  private measures() {
    const scale = window.devicePixelRatio || 1
    const width = Math.round(this.canvas.clientWidth * scale)
    const height = Math.round(this.canvas.clientHeight * scale)
    if (!width || !height) return
    this.width = this.canvas.width = width
    this.height = this.canvas.height = height
    this.paints()
    this.draws()
  }

  private get vertical() {
    return this.config?.orientation === "vertical"
  }

  /** The field's length along the bars' row, and how far a bar can grow. */
  private get extent() {
    return this.vertical
      ? { span: this.height, depth: this.width }
      : { span: this.width, depth: this.height }
  }

  /**
   * A linear gradient between two field-space points, in canvas space. Turned
   * clockwise, depth runs right to left, so it is flipped on the way out.
   */
  private ramp(
    spanFrom: number,
    depthFrom: number,
    spanTo: number,
    depthTo: number
  ) {
    const context = this.context!
    const { depth } = this.extent
    return this.vertical
      ? context.createLinearGradient(
          depth - depthFrom,
          spanFrom,
          depth - depthTo,
          spanTo
        )
      : context.createLinearGradient(spanFrom, depthFrom, spanTo, depthTo)
  }

  /**
   * A gradient from a bar's base out to its full length, with `stops` placed
   * from 0 (base) to 1 (tip). A centered field mirrors them about the middle.
   */
  private baseToTip(stops: [number, string][]) {
    const { depth } = this.extent
    const anchor = this.config!.anchor
    // In field space `bottom` grows from the far depth edge toward 0.
    const ramp =
      anchor === "top" ? this.ramp(0, 0, 0, depth) : this.ramp(0, depth, 0, 0)
    for (const [at, color] of stops) {
      if (anchor === "center") {
        ramp.addColorStop(0.5 + at / 2, color)
        ramp.addColorStop(0.5 - at / 2, color)
      } else {
        ramp.addColorStop(at, color)
      }
    }
    return ramp
  }

  /** The fill for the bars: a solid color, a gradient, or a color per length bucket. */
  private paints() {
    const { context, config, width, height } = this
    if (!context || !config) return
    const { stops, gradient } = config
    this.levels = []
    if (stops.length < 2 || !width || !height) {
      this.fill = stops[0] ?? "#fff"
      return
    }

    const placed = stops.map(
      (stop, index): [number, string] => [index / (stops.length - 1), stop]
    )
    if (gradient === "level") {
      this.levels = samplesStops(stops, LEVELS)
    } else if (gradient === "span") {
      const ramp = this.ramp(0, 0, this.extent.span, 0)
      for (const [at, color] of placed) ramp.addColorStop(at, color)
      this.fill = ramp
    } else {
      this.fill = this.baseToTip(placed)
    }
  }

  private draws() {
    const { context, config, width, height, heights, levels } = this
    if (!context || !config || !width) return

    context.clearRect(0, 0, width, height)
    const { count, anchor, gap } = config
    const { span, depth } = this.extent
    const vertical = this.vertical
    const slot = span / count
    const inset = (slot * gap) / 2
    const buckets = levels.length

    // `level` draws one path per bucket; everything else draws a single path.
    for (let bucket = 0; bucket < Math.max(1, buckets); bucket++) {
      context.beginPath()
      for (let index = 0; index < count; index++) {
        const level = heights[index]
        if (
          buckets &&
          Math.min(buckets - 1, Math.floor(level * buckets)) !== bucket
        )
          continue

        // Edges are snapped to whole pixels, so packed bars meet with no seams.
        const start = Math.round(index * slot + inset)
        const end = Math.round((index + 1) * slot - inset)
        const thickness = Math.max(1, end - start)
        const length = level * depth
        if (length < 0.5) continue

        const base =
          anchor === "bottom"
            ? depth - length
            : anchor === "top"
              ? 0
              : (depth - length) / 2
        // Turned clockwise, the bottom edge lands on the left.
        if (vertical) context.rect(depth - base - length, start, length, thickness)
        else context.rect(start, base, thickness, length)
      }
      context.fillStyle = buckets ? levels[bucket] : this.fill
      context.fill()
    }

    if (config.fade !== "none") this.fades(config.fade)
  }

  /** Masks the drawn bars with an alpha ramp, keeping only what the ramp covers. */
  private fades(fade: WaveformFade) {
    const { context, width, height } = this
    if (!context) return
    context.globalCompositeOperation = "destination-in"

    if (fade === "tip" || fade === "both") {
      context.fillStyle = this.baseToTip([
        [0, "rgb(0 0 0 / 1)"],
        [1, "rgb(0 0 0 / 0.1)"],
      ])
      context.fillRect(0, 0, width, height)
    }

    if (fade === "edges" || fade === "both") {
      const mask = this.ramp(0, 0, this.extent.span, 0)
      mask.addColorStop(0, "rgb(0 0 0 / 0)")
      mask.addColorStop(0.18, "rgb(0 0 0 / 1)")
      mask.addColorStop(0.82, "rgb(0 0 0 / 1)")
      mask.addColorStop(1, "rgb(0 0 0 / 0)")
      context.fillStyle = mask
      context.fillRect(0, 0, width, height)
    }

    context.globalCompositeOperation = "source-over"
  }
}

/**
 * Samples `count` evenly spaced colors along a gradient through `stops`, by
 * painting it once on a small canvas and reading the pixels back.
 */
function samplesStops(stops: string[], count: number) {
  const canvas = document.createElement("canvas")
  canvas.width = count
  canvas.height = 1
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return []
  const gradient = context.createLinearGradient(0.5, 0, count - 0.5, 0)
  stops.forEach((stop, index) =>
    gradient.addColorStop(index / (stops.length - 1), stop)
  )
  context.fillStyle = gradient
  context.fillRect(0, 0, count, 1)
  const pixels = context.getImageData(0, 0, count, 1).data
  return Array.from(
    { length: count },
    (_, index) =>
      `rgb(${pixels[index * 4]} ${pixels[index * 4 + 1]} ${pixels[index * 4 + 2]})`
  )
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function subscribesReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/** Resolves any CSS color, including `var(--token)`, to one the canvas understands. */
function resolvesColor(host: HTMLElement, color: string) {
  const probe = document.createElement("span")
  probe.style.color = color
  probe.hidden = true
  host.appendChild(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()
  return resolved
}

function Waveform({
  bars = 128,
  pattern = "interference",
  wave,
  value,
  orientation = "horizontal",
  anchor = "bottom",
  gap = 0,
  amplitude = 1,
  frequency = 1,
  speed = 1,
  smoothing = 0.25,
  paused = false,
  interactive = false,
  color,
  tipColor,
  colors,
  palette,
  gradient = "tip",
  fade = "none",
  label,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}: Omit<React.ComponentProps<"div">, "children" | "color"> & {
  /** How many bars span the field. Ignored with `value`, which sets one bar per entry. */
  bars?: number
  /** The wave to run. Ignored with `wave` or `value`. */
  pattern?: WaveformPattern
  /** Your own wave: the length of the bar at `x` (0 to 1) at `t` seconds, from 0 to 1. */
  wave?: WaveformFunction
  /** Controls the lengths directly, one entry per bar, each from 0 to 1. */
  value?: number[]
  /** `vertical` turns the field a quarter turn clockwise, so bars lie flat and stack top to bottom. */
  orientation?: WaveformOrientation
  anchor?: WaveformAnchor
  /** Space between bars, as a fraction of each bar's slot; 0 packs them edge to edge. */
  gap?: number
  /** Scales every length; 1 lets bars fill the field. */
  amplitude?: number
  /** Scales how many crests a built-in pattern fits across the field. */
  frequency?: number
  /** Scales how fast time runs. */
  speed?: number
  /** From 0 (bars jump to each new length) to 1 (bars glide slowly toward it). */
  smoothing?: number
  paused?: boolean
  /** Hovering raises a bump in the wave under the pointer. */
  interactive?: boolean
  /** Bar color; any CSS color, including `var(--token)`. Defaults to the text color. */
  color?: string
  /** A second color to blend to, for a two-color gradient from `color`. */
  tipColor?: string
  /** Gradient stops, base first; any CSS colors. Wins over `palette` and `tipColor`. */
  colors?: string[]
  /** A ready-made gradient. Wins over `tipColor`. */
  palette?: WaveformPalette
  /** Which way a gradient runs. */
  gradient?: WaveformGradient
  fade?: WaveformFade
  /** Accessible description; defaults to the pattern name. */
  label?: string
}) {
  const controlled = value !== undefined
  const count = controlled ? Math.max(1, value.length) : Math.max(1, bars)
  const vertical = orientation === "vertical"

  const fieldRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const rendererRef = React.useRef<WaveformRenderer | null>(null)

  React.useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = new WaveformRenderer(canvas)
    rendererRef.current = renderer
    return () => {
      renderer.destroy()
      rendererRef.current = null
    }
  }, [])

  // Only animate while the field is on screen.
  const [visible, setVisible] = React.useState(true)
  React.useEffect(() => {
    const field = fieldRef.current
    if (!field || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting)
    )
    observer.observe(field)
    return () => observer.disconnect()
  }, [])

  const reduced = React.useSyncExternalStore(
    subscribesReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  )

  const builtIn = WAVES[pattern] ?? WAVES.interference
  const waveFunction = React.useMemo<WaveformFunction>(
    () => wave ?? ((x, t, index) => builtIn(x, t, frequency, index)),
    [wave, builtIn, frequency]
  )

  const stopList = colors ?? (palette ? waveformPalettes[palette] : null)
  // A key, so a new array with the same colors does not rebuild the gradient.
  const stopKey = stopList?.join("|") ?? ""

  React.useLayoutEffect(() => {
    const field = fieldRef.current
    if (!field) return
    // `color` sits on the field, so the default follows the theme's text color.
    const base = getComputedStyle(field).color
    rendererRef.current?.configure({
      count,
      wave: controlled ? null : waveFunction,
      value: controlled ? value : null,
      orientation,
      anchor,
      gap: Math.min(0.9, Math.max(0, gap)),
      amplitude,
      speed,
      smoothing: Math.min(1, Math.max(0, smoothing)),
      stops: stopKey
        ? stopKey.split("|").map((stop) => resolvesColor(field, stop))
        : tipColor
          ? [base, resolvesColor(field, tipColor)]
          : [base],
      gradient,
      fade,
      // A controlled field keeps animating so new values ease in.
      running: visible && !paused && !reduced,
    })
  }, [
    count,
    controlled,
    value,
    waveFunction,
    orientation,
    anchor,
    gap,
    amplitude,
    speed,
    smoothing,
    color,
    tipColor,
    stopKey,
    gradient,
    fade,
    visible,
    paused,
    reduced,
  ])

  return (
    <div
      ref={fieldRef}
      role="img"
      aria-label={
        label ?? (controlled || wave ? "Waveform" : `Waveform: ${pattern}`)
      }
      data-slot="waveform"
      data-orientation={orientation}
      data-anchor={anchor}
      data-gradient={stopKey || tipColor ? gradient : undefined}
      data-interactive={interactive || undefined}
      className={cn(
        "relative w-full select-none",
        vertical ? "h-64" : "h-24",
        !color && "text-foreground",
        className
      )}
      style={color ? { color, ...style } : style}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (!interactive) return
        const rect = event.currentTarget.getBoundingClientRect()
        const along = vertical
          ? (event.clientY - rect.top) / rect.height
          : (event.clientX - rect.left) / rect.width
        if (Number.isFinite(along)) rendererRef.current?.points(along)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        if (interactive) rendererRef.current?.points(null)
      }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 block size-full"
      />
    </div>
  )
}

export {
  Waveform,
  waveformAnchors,
  waveformFades,
  waveformGradients,
  waveformOrientations,
  waveformPaletteNames,
  waveformPalettes,
  waveformPatterns,
  type WaveformAnchor,
  type WaveformFade,
  type WaveformFunction,
  type WaveformGradient,
  type WaveformOrientation,
  type WaveformPalette,
  type WaveformPattern,
}
