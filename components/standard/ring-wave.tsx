"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * Concentric rings of arcs, like a sci-fi readout. Each ring is an arc whose
 * sweep rises and falls like a waveform bar bent into a circle, and each
 * turns at its own speed. Rings mix thicknesses and kinds: `solid` arcs,
 * `segments` (dashed blocks) and fine `ticks`, over a faint full-circle track.
 *
 * With `full`, every ring is a whole circle and the pattern drives each
 * ring's brightness and thickness instead, so `ripple` sends waves out from
 * the center like a stone dropped in water. `fit="cover"` grows the rings to
 * the corners, to fill a card edge to edge.
 *
 * On start the arcs grow from a point, inner rings first. The ring styles
 * come from `seed`, so a seed always draws the same rings; pass `layout` to
 * set them yourself. Anything passed as children sits in the middle.
 *
 * Drawn on one canvas, a stroke or two per ring.
 *
 * <RingWave />
 * <RingWave pattern="cascade" palette="ember" glow />
 * <RingWave rings={12} seed={7} pattern="spectrum" />
 * <RingWave value={[0.86, 0.6, 0.4]} layout={[{ kind: "solid", weight: 1 }]} />
 * <RingWave full pattern="ripple" kind="solid" fit="cover" rings={40} />
 */

const ringWavePatterns = [
  "grow",
  "ripple",
  "cascade",
  "spectrum",
  "orbit",
] as const

type RingWavePattern = (typeof ringWavePatterns)[number]

const ringWaveKinds = ["solid", "segments", "ticks"] as const

type RingWaveKind = (typeof ringWaveKinds)[number]

/** `ring` gives each ring its own color along the stops, inner to outer; `sweep` runs the stops around the circle. */
const ringWaveGradients = ["ring", "sweep"] as const

/** `contain` fits the outer ring inside the field; `cover` reaches the corners, cropping the rings at the edges. */
const ringWaveFits = ["contain", "cover"] as const

type RingWaveFit = (typeof ringWaveFits)[number]

type RingWaveGradient = (typeof ringWaveGradients)[number]

/** One ring's look. Anything left out comes from the seed. */
type RingWaveRing = {
  kind?: RingWaveKind
  /** Thickness, as a fraction of the ring's band, from 0 to 1. */
  weight?: number
  /** Blocks around a full circle, for `segments` and `ticks`. */
  segments?: number
  /** Turns per second; negative turns counterclockwise. */
  speed?: number
  /** Resting sweep, from 0 to 1, for the `orbit` pattern. */
  sweep?: number
}

/** Ready-made gradients, inner ring first. */
const ringWavePalettes = {
  hud: ["oklch(0.85 0.12 210)", "oklch(0.8 0.16 65)"],
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
  neon: ["oklch(0.65 0.3 330)", "oklch(0.7 0.25 290)", "oklch(0.88 0.17 190)"],
} satisfies Record<string, string[]>

type RingWavePalette = keyof typeof ringWavePalettes

const ringWavePaletteNames = Object.keys(ringWavePalettes) as RingWavePalette[]

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

function clamps(value: number) {
  return Math.min(1, Math.max(0, value))
}

function easesInOut(progress: number) {
  return progress < 0.5
    ? 4 * progress ** 3
    : 1 - (-2 * progress + 2) ** 3 / 2
}

/** Seconds for one grow-and-retract cycle of `cascade`. */
const CASCADE_PERIOD = 5

/** Rings from one crest of `ripple` to the next. */
const RIPPLE_WAVELENGTH = 5

/**
 * Value of ring `index` of `count` at `t` seconds, from 0 to 1: the arc's
 * sweep, or with `full`, the ring's brightness and thickness.
 */
const WAVES: Record<
  RingWavePattern,
  (index: number, count: number, t: number, ring: Required<RingWaveRing>) => number
> = {
  // Swells roll outward from the middle ring by ring.
  grow: (index, _, t) => 0.55 + 0.4 * Math.sin(t * 1.2 - index * 0.65),
  // Sharp crests that leave the center and travel out ring by ring.
  ripple: (index, _, t) =>
    (0.5 + 0.5 * Math.cos(TAU * (index / RIPPLE_WAVELENGTH - t * 0.6))) ** 3,
  // Arcs grow to full circles inner to outer, then draw back the same way.
  cascade: (index, count, t) => {
    const phase = ((t / CASCADE_PERIOD) % 1) * 2
    const delay = (index / Math.max(1, count - 1)) * 0.45
    return phase < 1
      ? easesInOut(clamps((phase - delay) / 0.55))
      : 1 - easesInOut(clamps((phase - 1 - delay) / 0.55))
  },
  spectrum: (index, _, t) =>
    0.12 + 0.88 * noise(index * 1.3, t * 1.8) ** 1.3,
  orbit: (_, __, ___, ring) => ring.sweep,
}

/** Fills in a ring's look from `seed`, deterministically. */
function seedsRing(seed: number, index: number): Required<RingWaveRing> {
  const pick = (salt: number) => hash(seed * 101.3 + index * 17.7 + salt)
  const kinds: RingWaveKind[] = ["solid", "solid", "segments", "ticks"]
  return {
    // The innermost ring is always solid, so the center reads as a core.
    kind: index === 0 ? "solid" : kinds[Math.floor(pick(1) * kinds.length)],
    weight: [0.3, 0.55, 0.85][Math.floor(pick(2) * 3)],
    segments: [12, 24, 36, 60][Math.floor(pick(3) * 4)],
    speed: (pick(4) - 0.5) * 0.25,
    sweep: 0.3 + 0.65 * pick(5),
  }
}

/** Milliseconds for one ring to grow in, and between rings starting. */
const INTRO_GROW = 700
const INTRO_STAGGER = 90

type RingsConfig = {
  rings: Required<RingWaveRing>[]
  pattern: RingWavePattern
  value: number[] | null
  full: boolean
  fit: RingWaveFit
  radius: number
  gap: number
  track: boolean
  rounded: boolean
  spin: number
  speed: number
  smoothing: number
  /** Resolved colors, inner ring first; one entry is a single color. */
  stops: string[]
  gradient: RingWaveGradient
  glow: boolean
  intro: boolean
  running: boolean
}

/**
 * Animates and draws the rings. Each frame eases every ring's sweep toward
 * its target and turns it by its own speed, then strokes a track and an arc
 * per ring.
 */
class RingWaveRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D | null
  private readonly observer: ResizeObserver | null
  private config: RingsConfig | null = null
  /** Each ring's eased pattern value: its sweep, or its brightness when `full`. */
  private sweeps = new Float32Array(0)
  private turns = new Float32Array(0)
  private width = 0
  private height = 0
  private scale = 1
  private time = 0
  /** Milliseconds since the intro began, or Infinity once it has played. */
  private introAt = Infinity
  private last = 0
  private request = 0
  private colors: string[] = []
  private sweepFill: CanvasGradient | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = canvas.getContext("2d")
    this.observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => this.measures())
    this.observer?.observe(canvas)
  }

  configure(config: RingsConfig) {
    const first = !this.config
    if (first && config.intro && config.running) this.introAt = 0
    if (config.rings.length !== this.sweeps.length) {
      this.sweeps = new Float32Array(config.rings.length)
      this.turns = Float32Array.from(config.rings, (_, index) =>
        hash(index * 9.1)
      )
      this.config = config
      this.steps(0, true)
    }
    this.config = config
    this.paints()
    if (first) this.measures()
    if (config.running) this.starts()
    else {
      this.stops()
      this.introAt = Infinity
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
    const elapsed = Math.min(now - this.last, 100)
    this.last = now
    if (this.introAt !== Infinity) this.introAt += elapsed
    this.steps(elapsed, false)
    this.draws()
    this.request = requestAnimationFrame(this.animates)
  }

  private steps(elapsed: number, snap: boolean) {
    const config = this.config
    if (!config) return
    const { rings, pattern, value, smoothing } = config
    const seconds = elapsed / 1000
    this.time += seconds * config.speed
    const ease =
      snap || smoothing <= 0 ? 1 : 1 - Math.exp(-elapsed / (smoothing * 220))

    for (let index = 0; index < rings.length; index++) {
      const ring = rings[index]
      const target = clamps(
        value
          ? (value[index] ?? 0)
          : WAVES[pattern](index, rings.length, this.time, ring)
      )
      this.sweeps[index] += (target - this.sweeps[index]) * ease
      this.turns[index] = (this.turns[index] + seconds * ring.speed * config.spin) % 1
    }
  }

  private measures() {
    const scale = window.devicePixelRatio || 1
    const width = Math.round(this.canvas.clientWidth * scale)
    const height = Math.round(this.canvas.clientHeight * scale)
    if (!width || !height) return
    this.scale = scale
    this.width = this.canvas.width = width
    this.height = this.canvas.height = height
    this.paints()
    this.draws()
  }

  private paints() {
    const { context, config } = this
    if (!context || !config) return
    const { stops, gradient, rings } = config
    this.sweepFill = null
    if (stops.length < 2) {
      this.colors = rings.map(() => stops[0] ?? "#fff")
    } else if (
      gradient === "sweep" &&
      typeof context.createConicGradient === "function"
    ) {
      // Closes on the first color, so the sweep has no seam.
      const sweep = context.createConicGradient(-Math.PI / 2, 0, 0)
      ;[...stops, stops[0]].forEach((stop, index) =>
        sweep.addColorStop(index / stops.length, stop)
      )
      this.sweepFill = sweep
      this.colors = []
    } else {
      this.colors = samplesStops(stops, rings.length)
    }
  }

  /** How far ring `index` has grown in, from 0 to 1, during the intro. */
  private introOf(index: number) {
    if (this.introAt === Infinity) return 1
    // Many rings share a shorter stagger, so the whole intro stays brief.
    const stagger = Math.min(INTRO_STAGGER, 1400 / this.sweeps.length)
    const grown = clamps((this.introAt - index * stagger) / INTRO_GROW)
    if (grown >= 1 && index === this.sweeps.length - 1) this.introAt = Infinity
    return easesInOut(grown)
  }

  private draws() {
    const { context, config, width, height, scale } = this
    if (!context || !config || !width) return

    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, width, height)

    const { rings, gap } = config
    const margin = (config.glow ? 10 : 2) * scale
    const outer =
      config.fit === "cover"
        ? Math.hypot(width, height) / 2
        : Math.min(width, height) / 2 - margin
    const inner = outer * config.radius
    const pitch = (outer - inner) / rings.length
    const band = pitch * (1 - gap)
    // With no gap, neighbors overlap a hair so no seam shows between them.
    const packed = gap === 0
    const overlap = 0.75 * scale

    if (config.glow) context.shadowBlur = 10 * scale

    for (let index = 0; index < rings.length; index++) {
      const ring = rings[index]
      const grown = this.introOf(index)
      if (grown <= 0) continue

      const radius = inner + pitch * (index + 0.5)
      // A full ring shows its value as brightness and thickness, not sweep.
      // Packed rings keep their thickness, so the field stays solid.
      const level = config.full ? this.sweeps[index] : 1
      const swell = packed ? 1 : 0.3 + 0.7 * level
      const lineWidth =
        Math.max(scale, band * ring.weight * swell) + (packed ? overlap : 0)
      const stroke = this.sweepFill ?? this.colors[index] ?? "#fff"
      const circumference = TAU * radius

      context.setTransform(1, 0, 0, 1, width / 2, height / 2)
      context.rotate(this.turns[index] * TAU - Math.PI / 2)
      context.lineWidth = lineWidth
      context.strokeStyle = stroke
      context.shadowColor = typeof stroke === "string" ? stroke : config.stops[0]

      if (ring.kind === "segments") {
        const slot = circumference / ring.segments
        context.setLineDash([slot * 0.62, slot * 0.38])
      } else if (ring.kind === "ticks") {
        const slot = circumference / (ring.segments * 2)
        context.setLineDash([Math.max(scale, slot * 0.18), slot * 0.82])
      } else {
        context.setLineDash([])
      }
      context.lineCap = config.rounded && ring.kind === "solid" ? "round" : "butt"

      if (config.track) {
        context.globalAlpha = 0.14 * grown
        context.beginPath()
        context.arc(0, 0, radius, 0, TAU)
        context.stroke()
      }

      const sweep = (config.full ? 1 : this.sweeps[index]) * grown
      if (sweep > 0.002) {
        context.globalAlpha =
          Math.min(1, grown * 1.5) * (config.full ? 0.1 + 0.9 * level : 1)
        context.beginPath()
        context.arc(0, 0, radius, 0, sweep * TAU)
        context.stroke()
      }
    }

    context.setLineDash([])
    context.globalAlpha = 1
    context.shadowBlur = 0
  }
}

/** Samples `count` evenly spaced colors along a gradient through `stops`. */
function samplesStops(stops: string[], count: number) {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(2, count)
  canvas.height = 1
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return []
  const gradient = context.createLinearGradient(0.5, 0, canvas.width - 0.5, 0)
  stops.forEach((stop, index) =>
    gradient.addColorStop(index / (stops.length - 1), stop)
  )
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, 1)
  const pixels = context.getImageData(0, 0, canvas.width, 1).data
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

function RingWave({
  rings = 8,
  pattern = "grow",
  value,
  full = false,
  kind,
  weight,
  fit = "contain",
  layout,
  seed = 1,
  radius = 0.22,
  gap = 0.3,
  track = true,
  rounded = false,
  spin = 1,
  speed = 1,
  smoothing = 0.2,
  color,
  colors,
  palette,
  gradient = "ring",
  glow = false,
  intro = true,
  paused = false,
  label,
  className,
  style,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "color"> & {
  /** How many rings. With `value`, there is one ring per entry. */
  rings?: number
  /** What drives the arcs. Ignored with `value`. */
  pattern?: RingWavePattern
  /** Controls each ring's sweep directly, inner ring first, each from 0 to 1. */
  value?: number[]
  /** Draws every ring as a whole circle; the pattern drives brightness and thickness instead of sweep. */
  full?: boolean
  /** Gives every ring this kind, such as `solid` for plain rings; `layout` still wins per ring. */
  kind?: RingWaveKind
  /** Gives every ring this thickness, from 0 to 1 of its band; `1` with `gap={0}` packs rings edge to edge. */
  weight?: number
  fit?: RingWaveFit
  /** Sets rings' looks, inner ring first; missing rings and fields come from `seed`. */
  layout?: RingWaveRing[]
  /** Picks the rings' kinds, weights and speeds; the same seed draws the same rings. */
  seed?: number
  /** Radius of the empty middle, as a fraction of the whole. */
  radius?: number
  /** Space between rings, as a fraction of each ring's band; 0 packs them edge to edge. */
  gap?: number
  /** A faint full circle behind each arc. */
  track?: boolean
  /** Round the ends of solid arcs. */
  rounded?: boolean
  /** Scales how fast the rings turn; 0 holds them still. */
  spin?: number
  /** Scales how fast the arcs grow and shrink. */
  speed?: number
  /** From 0 (arcs jump to each new sweep) to 1 (arcs glide slowly toward it). */
  smoothing?: number
  /** Ring color; any CSS color, including `var(--token)`. Defaults to the text color. */
  color?: string
  /** Gradient stops, inner ring first; any CSS colors. Wins over `palette`. */
  colors?: string[]
  palette?: RingWavePalette
  gradient?: RingWaveGradient
  /** A soft halo around the arcs. */
  glow?: boolean
  /** Arcs grow from a point on start, inner rings first. */
  intro?: boolean
  paused?: boolean
  /** Accessible description; defaults to the pattern name. */
  label?: string
}) {
  const count = Math.max(1, value ? value.length : Math.round(rings))
  // A key, so a new `layout` array with the same rings does not rebuild them.
  const layoutKey = JSON.stringify(layout ?? [])
  const ringList = React.useMemo(() => {
    const given = JSON.parse(layoutKey) as RingWaveRing[]
    return Array.from({ length: count }, (_, index) => ({
      ...seedsRing(seed, index),
      ...(kind ? { kind } : null),
      ...(weight !== undefined ? { weight } : null),
      ...given[index],
    }))
  }, [count, seed, kind, weight, layoutKey])

  const fieldRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const rendererRef = React.useRef<RingWaveRenderer | null>(null)

  React.useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = new RingWaveRenderer(canvas)
    rendererRef.current = renderer
    return () => {
      renderer.destroy()
      rendererRef.current = null
    }
  }, [])

  // Only animate while the rings are on screen.
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

  const stopList = colors ?? (palette ? ringWavePalettes[palette] : null)
  const stopKey = stopList?.join("|") ?? ""

  React.useLayoutEffect(() => {
    const field = fieldRef.current
    if (!field) return
    rendererRef.current?.configure({
      rings: ringList,
      pattern,
      value: value ?? null,
      full,
      fit,
      radius: Math.min(0.9, Math.max(0, radius)),
      gap: Math.min(0.9, Math.max(0, gap)),
      track,
      rounded,
      spin,
      speed,
      smoothing: Math.min(1, Math.max(0, smoothing)),
      // `color` sits on the field, so the default follows the theme's text color.
      stops: stopKey
        ? stopKey.split("|").map((stop) => resolvesColor(field, stop))
        : [getComputedStyle(field).color],
      gradient,
      glow,
      intro: intro && !reduced,
      // A controlled field keeps animating so new values ease in.
      running: visible && !paused && !reduced,
    })
  }, [
    ringList,
    pattern,
    value,
    full,
    fit,
    radius,
    gap,
    track,
    rounded,
    spin,
    speed,
    smoothing,
    color,
    stopKey,
    gradient,
    glow,
    intro,
    visible,
    paused,
    reduced,
  ])

  return (
    <div
      ref={fieldRef}
      role="img"
      aria-label={label ?? (value ? "Ring gauge" : `Ring wave: ${pattern}`)}
      data-slot="ring-wave"
      data-pattern={value ? undefined : pattern}
      data-full={full || undefined}
      data-fit={fit}
      className={cn(
        "relative size-48 select-none",
        !color && "text-foreground",
        className
      )}
      style={color ? { color, ...style } : style}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 block size-full"
      />
      {children !== undefined && (
        <div
          data-slot="ring-wave-center"
          className="absolute inset-0 flex items-center justify-center"
        >
          {children}
        </div>
      )}
    </div>
  )
}

export {
  RingWave,
  ringWaveFits,
  ringWaveGradients,
  ringWaveKinds,
  ringWavePaletteNames,
  ringWavePalettes,
  ringWavePatterns,
  type RingWaveFit,
  type RingWaveGradient,
  type RingWaveKind,
  type RingWavePalette,
  type RingWavePattern,
  type RingWaveRing,
}
