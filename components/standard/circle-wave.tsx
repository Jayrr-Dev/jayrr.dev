"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * A waveform wrapped around a ring: bars radiate from a circle, their lengths
 * tracing a wave that runs all the way round with no seam. Draw it as radial
 * `bars`, stacked meter `segments`, layered `lines`, or a solid `fill`.
 *
 * Built-in patterns are periodic around the ring, so the wave meets itself
 * where it starts. Pass your own `wave(angle, t)` (angle in turns, 0 to 1),
 * or control the lengths with `value`. Anything passed as children sits in
 * the middle of the ring, such as a play button or an avatar.
 *
 * Everything is drawn on one canvas in a stroke or fill per color, so
 * hundreds of bars stay cheap. The field is `size-48` by default.
 *
 * <CircleWave />
 * <CircleWave pattern="spectrum" variant="segments" palette="ember" gradient="level" />
 * <CircleWave pattern="blob" variant="lines" lines={12} palette="neon" />
 * <CircleWave direction="both" glow palette="aurora" spin={0.05} />
 */

const circleWavePatterns = [
  "bloom",
  "interference",
  "spectrum",
  "voice",
  "blob",
  "pulse",
] as const

type CircleWavePattern = (typeof circleWavePatterns)[number]

const circleWaveVariants = ["bars", "segments", "lines", "fill"] as const

type CircleWaveVariant = (typeof circleWaveVariants)[number]

/** Which way bars grow from the ring. */
const circleWaveDirections = ["out", "in", "both"] as const

type CircleWaveDirection = (typeof circleWaveDirections)[number]

/**
 * How a gradient runs: `sweep` goes around the ring, `tip` runs from the ring
 * out to the full length, `level` colors each bar (or each meter segment) by
 * how far out it reaches.
 */
const circleWaveGradients = ["sweep", "tip", "level"] as const

type CircleWaveGradient = (typeof circleWaveGradients)[number]

/** Ready-made gradients, base color first. */
const circleWavePalettes = {
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
  spectrum: [
    "oklch(0.65 0.25 25)",
    "oklch(0.85 0.18 90)",
    "oklch(0.8 0.2 150)",
    "oklch(0.75 0.15 230)",
    "oklch(0.6 0.25 300)",
  ],
} satisfies Record<string, string[]>

type CircleWavePalette = keyof typeof circleWavePalettes

const circleWavePaletteNames = Object.keys(
  circleWavePalettes
) as CircleWavePalette[]

/**
 * Length of the bar at `angle` (in turns from the top, clockwise, 0 to 1) at
 * `t` seconds, from 0 to 1. Make it periodic in `angle` so it meets itself.
 */
type CircleWaveFunction = (
  angle: number,
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

/**
 * Noise read around a circle of radius `scale` in the noise field, drifting
 * with `t`. Going round the circle comes back to the same point, so there is
 * no seam where the ring closes.
 */
function ringNoise(angle: number, scale: number, t: number) {
  return noise(
    Math.cos(angle * TAU) * scale + t,
    Math.sin(angle * TAU) * scale - t * 0.7 + 17
  )
}

/** Built-in waves; `frequency` scales how many lobes fit around the ring. */
const WAVES: Record<
  CircleWavePattern,
  (angle: number, t: number, frequency: number, index: number) => number
> = {
  bloom: (a, t, f) => {
    const petals = Math.max(1, Math.round(5 * f))
    return 0.5 + 0.4 * Math.sin(TAU * a * petals - t * 1.5)
  },
  interference: (a, t, f) =>
    0.5 +
    0.25 * Math.sin(TAU * a * Math.max(1, Math.round(3 * f)) - t * 0.8) +
    0.2 * Math.sin(TAU * a * Math.max(1, Math.round(7 * f)) + t * 1.1),
  spectrum: (a, t, f, index) =>
    ringNoise(a, 2.5 * f, t * 1.6) ** 1.6 * 0.85 +
    noise(index * 0.7, t * 9) * 0.15,
  voice: (a, t, f, index) => {
    const phrase = ringNoise(a, 1.4 * f, t * 0.5)
    const envelope = Math.max(0, (phrase - 0.25) / 0.75) ** 1.2
    return 0.04 + 0.96 * envelope * (0.3 + 0.7 * noise(index * 0.9, t * 6))
  },
  blob: (a, t, f) =>
    0.15 +
    0.8 *
      (ringNoise(a, 1.2 * f, t * 0.35) * 0.7 +
        ringNoise(a, 2.6 * f, t * 0.5 + 40) * 0.3),
  pulse: (a, t, f) => {
    const beat = 0.5 + 0.5 * Math.sin(t * 2.4)
    return (
      0.25 +
      0.35 * beat +
      0.12 * Math.sin(TAU * a * Math.max(1, Math.round(12 * f)) - t * 3)
    )
  },
}

/** Width of the bump the pointer raises, in turns. */
const POINTER_REACH = 0.035
/** Buckets a `level` gradient is cut into; one stroke per bucket. */
const LEVELS = 32

type RingConfig = {
  count: number
  wave: CircleWaveFunction | null
  value: number[] | null
  variant: CircleWaveVariant
  direction: CircleWaveDirection
  radius: number
  gap: number
  rounded: boolean
  segments: number
  lines: number
  spread: number
  thickness: number
  amplitude: number
  speed: number
  spin: number
  smoothing: number
  stops: string[]
  gradient: CircleWaveGradient
  glow: boolean
  running: boolean
}

/**
 * Animates and draws the ring. Each frame computes every bar's target length,
 * eases the drawn length toward it, then draws the variant around the center.
 * Drawing happens in a frame centered on the ring and turned by `spin`, so
 * gradients turn with it.
 */
class CircleWaveRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D | null
  private readonly observer: ResizeObserver | null
  private config: RingConfig | null = null
  private heights = new Float32Array(0)
  private width = 0
  private height = 0
  private scale = 1
  private time = 0
  private turn = 0
  private last = 0
  private request = 0
  private pointer = { angle: 0, strength: 0, inside: false }
  private fill: string | CanvasGradient = "#fff"
  private levels: string[] = []
  /** Ring geometry, in device pixels: base radius and room to grow each way. */
  private ring = { inner: 0, outward: 0, inward: 0 }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = canvas.getContext("2d")
    this.observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => this.measures())
    this.observer?.observe(canvas)
  }

  configure(config: RingConfig) {
    const first = !this.config
    if (config.count !== this.heights.length) {
      this.heights = new Float32Array(config.count)
      this.config = config
      this.steps(0, true)
    }
    this.config = config
    if (first) this.measures()
    else {
      this.lays()
      this.paints()
    }
    if (config.running) this.starts()
    else {
      this.stops()
      this.steps(0, true)
      this.draws()
    }
  }

  /** Moves the pointer bump to `angle` (in turns), or lifts it with `null`. */
  points(angle: number | null) {
    this.pointer.inside = angle !== null
    // The bump stays put on screen while the ring spins under it.
    if (angle !== null) this.pointer.angle = angle - this.turn
    if (!this.config?.running) {
      this.pointer.strength = angle === null ? 0 : 1
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
    this.turn = (this.turn + (elapsed / 1000) * (this.config?.spin ?? 0)) % 1
    this.steps(elapsed, false)
    this.draws()
    this.request = requestAnimationFrame(this.animates)
  }

  /** Length of bar `index` at time `t`, before easing. */
  private targetAt(index: number, t: number) {
    const { count, wave, value, amplitude } = this.config!
    const angle = index / count
    let target = value
      ? (value[index] ?? 0)
      : wave
        ? wave(angle, t, index, count)
        : 0
    target *= amplitude
    const pointer = this.pointer
    if (pointer.strength > 0.001) {
      // Distance the short way round the ring.
      const away = Math.abs(((angle - pointer.angle + 1.5) % 1) - 0.5)
      const lift = pointer.strength * Math.exp(-((away / POINTER_REACH) ** 2))
      target += (1 - target) * lift * 0.85
    }
    return Math.min(1, Math.max(0, Number.isFinite(target) ? target : 0))
  }

  private steps(elapsed: number, snap: boolean) {
    const config = this.config
    if (!config) return
    this.time += (elapsed / 1000) * config.speed
    const pointer = this.pointer
    const pull = 1 - Math.exp(-elapsed / 120)
    pointer.strength += ((pointer.inside ? 1 : 0) - pointer.strength) * pull
    const ease =
      snap || config.smoothing <= 0
        ? 1
        : 1 - Math.exp(-elapsed / (config.smoothing * 220))
    for (let index = 0; index < config.count; index++) {
      const target = this.targetAt(index, this.time)
      this.heights[index] += (target - this.heights[index]) * ease
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
    this.lays()
    this.paints()
    this.draws()
  }

  /** Works out the base radius and how far bars can reach each way. */
  private lays() {
    const { config, width, height, scale } = this
    if (!config || !width) return
    const margin =
      (config.glow ? 10 : 2) * scale +
      (config.variant === "lines" ? config.thickness * scale : 0)
    const outer = Math.min(width, height) / 2 - margin
    const inner = outer * config.radius
    this.ring = {
      inner,
      outward: config.direction === "in" ? 0 : outer - inner,
      inward: config.direction === "out" ? 0 : inner * 0.9,
    }
  }

  /** A radial gradient from the ring out to full reach, with stops placed 0 (ring) to 1 (tip). */
  private baseToTip(stops: string[]) {
    const { context } = this
    const { inner, outward, inward } = this.ring
    const near = inner - inward
    const far = inner + outward
    const ramp = context!.createRadialGradient(0, 0, near, 0, 0, far)
    const span = Math.max(1, far - near)
    stops.forEach((stop, index) => {
      const at = index / Math.max(1, stops.length - 1)
      if (outward) ramp.addColorStop((inner + at * outward - near) / span, stop)
      if (inward) ramp.addColorStop((inner - at * inward - near) / span, stop)
    })
    return ramp
  }

  private paints() {
    const { context, config, width } = this
    if (!context || !config) return
    const { stops, gradient, variant } = config
    this.levels = []
    if (stops.length < 2 || !width) {
      this.fill = stops[0] ?? "#fff"
      return
    }

    const banded = variant === "bars" || variant === "segments"
    if (gradient === "level" && banded) {
      this.levels = samplesStops(stops, LEVELS)
    } else if (
      gradient === "sweep" &&
      typeof context.createConicGradient === "function"
    ) {
      // Starts at the top and closes on the first color, so the sweep has no seam.
      const sweep = context.createConicGradient(-Math.PI / 2, 0, 0)
      ;[...stops, stops[0]].forEach((stop, index) =>
        sweep.addColorStop(index / stops.length, stop)
      )
      this.fill = sweep
    } else {
      this.fill = this.baseToTip(stops)
    }
  }

  private draws() {
    const { context, config, width, height, scale } = this
    if (!context || !config || !width) return

    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, width, height)
    context.setTransform(1, 0, 0, 1, width / 2, height / 2)
    context.rotate(this.turn * TAU)
    if (config.glow) {
      context.shadowColor = config.stops[Math.floor(config.stops.length / 2)]
      context.shadowBlur = 12 * scale
    }

    if (config.variant === "lines") this.drawsLines()
    else if (config.variant === "fill") this.drawsFill()
    else this.drawsBars(config.variant === "segments")

    context.shadowBlur = 0
    context.globalAlpha = 1
  }

  private drawsBars(segmented: boolean) {
    const { context, config, heights, levels, scale } = this
    if (!context || !config) return
    const { count, gap, segments } = config
    const { inner, outward, inward } = this.ring
    // Bars are as wide as their slot of the ring, less the gap.
    const barWidth = Math.max(scale, ((TAU * inner) / count) * (1 - gap))
    const buckets = levels.length
    const pitch = 1 / segments

    context.lineWidth = barWidth
    context.lineCap = config.rounded && !segmented ? "round" : "butt"

    for (let bucket = 0; bucket < Math.max(1, buckets); bucket++) {
      context.beginPath()
      for (let index = 0; index < count; index++) {
        const level = heights[index]
        const angle = (index / count) * TAU - Math.PI / 2
        const dx = Math.cos(angle)
        const dy = Math.sin(angle)
        const spoke = (from: number, to: number) => {
          context.moveTo(dx * from, dy * from)
          context.lineTo(dx * to, dy * to)
        }

        if (segmented) {
          // Stack blocks out from the ring, like an LED meter bent round.
          const lit = Math.max(1, Math.ceil(level * segments - 0.001))
          for (let block = 0; block < lit; block++) {
            if (
              buckets &&
              Math.min(buckets - 1, Math.floor(block * pitch * buckets)) !==
                bucket
            )
              continue
            const start = block * pitch
            const end = start + pitch * 0.62
            if (outward)
              spoke(inner + start * outward, inner + end * outward)
            if (inward) spoke(inner - start * inward, inner - end * inward)
          }
        } else {
          if (
            buckets &&
            Math.min(buckets - 1, Math.floor(level * buckets)) !== bucket
          )
            continue
          // A short tick even at zero, so the ring always reads.
          const reach = Math.max(level, 0.03)
          spoke(inner - reach * inward, inner + reach * outward)
        }
      }
      context.strokeStyle = buckets ? levels[bucket] : this.fill
      context.stroke()
    }
  }

  /** Traces a smooth closed loop through one radius per bar. */
  private tracesLoop(radius: (index: number) => number) {
    const { context, config } = this
    if (!context || !config) return
    const { count } = config
    const point = (index: number) => {
      const wrapped = (index + count) % count
      const angle = (wrapped / count) * TAU - Math.PI / 2
      const r = radius(wrapped)
      return [Math.cos(angle) * r, Math.sin(angle) * r] as const
    }
    // Curves pass through the midpoints between samples, bending at each one.
    const [lastX, lastY] = point(count - 1)
    const [firstX, firstY] = point(0)
    context.moveTo((lastX + firstX) / 2, (lastY + firstY) / 2)
    for (let index = 0; index < count; index++) {
      const [x, y] = point(index)
      const [nextX, nextY] = point(index + 1)
      context.quadraticCurveTo(x, y, (x + nextX) / 2, (y + nextY) / 2)
    }
    context.closePath()
  }

  private drawsLines() {
    const { context, config, heights, scale } = this
    if (!context || !config) return
    const { inner, outward, inward } = this.ring
    const { lines, spread } = config

    context.lineWidth = config.thickness * scale
    context.lineJoin = "round"
    context.strokeStyle = this.fill

    // Echo loops trail the wave back in time, fainter each step.
    for (let line = lines - 1; line >= 0; line--) {
      const length = (index: number) =>
        line === 0
          ? heights[index]
          : this.targetAt(index, this.time - line * spread)
      context.globalAlpha = lines > 1 ? 1 - line / (lines + 0.5) : 1
      context.beginPath()
      if (outward) this.tracesLoop((index) => inner + length(index) * outward)
      if (inward) this.tracesLoop((index) => inner - length(index) * inward)
      context.stroke()
    }
  }

  private drawsFill() {
    const { context, config, heights } = this
    if (!context || !config) return
    const { inner, outward, inward } = this.ring

    // The band between the outer edge and the inner edge, filled even-odd.
    context.beginPath()
    this.tracesLoop((index) => inner + heights[index] * outward)
    this.tracesLoop((index) =>
      inward ? inner - heights[index] * inward : inner
    )
    context.fillStyle = this.fill
    context.fill("evenodd")
  }
}

/** Samples `count` evenly spaced colors along a gradient through `stops`. */
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

function CircleWave({
  bars = 120,
  pattern = "bloom",
  wave,
  value,
  variant = "bars",
  direction = "out",
  radius = 0.55,
  gap = 0.35,
  rounded = false,
  segments = 8,
  lines = 1,
  spread = 0.12,
  thickness = 1.5,
  amplitude = 1,
  frequency = 1,
  speed = 1,
  spin = 0,
  smoothing = 0.25,
  paused = false,
  interactive = false,
  color,
  colors,
  palette,
  gradient = "sweep",
  glow = false,
  label,
  className,
  style,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: Omit<React.ComponentProps<"div">, "color"> & {
  /** How many bars go round the ring. Ignored with `value`, which sets one bar per entry. */
  bars?: number
  /** The wave to run. Ignored with `wave` or `value`. */
  pattern?: CircleWavePattern
  /** Your own wave: the length at `angle` (turns from the top, 0 to 1) at `t` seconds, from 0 to 1. */
  wave?: CircleWaveFunction
  /** Controls the lengths directly, one entry per bar going clockwise from the top. */
  value?: number[]
  variant?: CircleWaveVariant
  direction?: CircleWaveDirection
  /** Radius of the base ring, as a fraction of the room available; bars grow from here. */
  radius?: number
  /** Space between bars, as a fraction of each bar's slot of the ring. */
  gap?: number
  /** Round the ends of `bars`. */
  rounded?: boolean
  /** Blocks per bar for the `segments` variant. */
  segments?: number
  /** Loops drawn for the `lines` variant; extra loops trail the wave back in time. */
  lines?: number
  /** Seconds between stacked `lines`. */
  spread?: number
  /** Stroke width of `lines`, in CSS pixels. */
  thickness?: number
  /** Scales every length; 1 lets bars reach the edge. */
  amplitude?: number
  /** Scales how many lobes a built-in pattern fits around the ring. */
  frequency?: number
  /** Scales how fast the wave changes. */
  speed?: number
  /** Turns per second the whole ring rotates; negative turns it counterclockwise. */
  spin?: number
  /** From 0 (bars jump to each new length) to 1 (bars glide slowly toward it). */
  smoothing?: number
  paused?: boolean
  /** Hovering raises a bump in the ring at the pointer's angle. */
  interactive?: boolean
  /** Bar color; any CSS color, including `var(--token)`. Defaults to the text color. */
  color?: string
  /** Gradient stops; any CSS colors. Wins over `palette`. */
  colors?: string[]
  /** A ready-made gradient. */
  palette?: CircleWavePalette
  /** Which way a gradient runs. */
  gradient?: CircleWaveGradient
  /** A soft halo around the ring, like neon. */
  glow?: boolean
  /** Accessible description; defaults to the pattern name. */
  label?: string
}) {
  const controlled = value !== undefined
  const count = controlled ? Math.max(3, value.length) : Math.max(3, bars)

  const fieldRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const rendererRef = React.useRef<CircleWaveRenderer | null>(null)

  React.useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = new CircleWaveRenderer(canvas)
    rendererRef.current = renderer
    return () => {
      renderer.destroy()
      rendererRef.current = null
    }
  }, [])

  // Only animate while the ring is on screen.
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

  const builtIn = WAVES[pattern] ?? WAVES.bloom
  const waveFunction = React.useMemo<CircleWaveFunction>(
    () => wave ?? ((angle, t, index) => builtIn(angle, t, frequency, index)),
    [wave, builtIn, frequency]
  )

  const stopList = colors ?? (palette ? circleWavePalettes[palette] : null)
  // A key, so a new array with the same colors does not rebuild the gradient.
  const stopKey = stopList?.join("|") ?? ""

  React.useLayoutEffect(() => {
    const field = fieldRef.current
    if (!field) return
    rendererRef.current?.configure({
      count,
      wave: controlled ? null : waveFunction,
      value: controlled ? value : null,
      variant,
      direction,
      radius: Math.min(0.95, Math.max(0.05, radius)),
      gap: Math.min(0.9, Math.max(0, gap)),
      rounded,
      segments: Math.max(1, Math.round(segments)),
      lines: Math.max(1, Math.round(lines)),
      spread,
      thickness: Math.max(0.5, thickness),
      amplitude,
      speed,
      spin,
      smoothing: Math.min(1, Math.max(0, smoothing)),
      // `color` sits on the field, so the default follows the theme's text color.
      stops: stopKey
        ? stopKey.split("|").map((stop) => resolvesColor(field, stop))
        : [getComputedStyle(field).color],
      gradient,
      glow,
      // A controlled ring keeps animating so new values ease in.
      running: visible && !paused && !reduced,
    })
  }, [
    count,
    controlled,
    value,
    waveFunction,
    variant,
    direction,
    radius,
    gap,
    rounded,
    segments,
    lines,
    spread,
    thickness,
    amplitude,
    speed,
    spin,
    smoothing,
    color,
    stopKey,
    gradient,
    glow,
    visible,
    paused,
    reduced,
  ])

  return (
    <div
      ref={fieldRef}
      role="img"
      aria-label={
        label ??
        (controlled || wave ? "Circular waveform" : `Circular waveform: ${pattern}`)
      }
      data-slot="circle-wave"
      data-variant={variant}
      data-direction={direction}
      data-interactive={interactive || undefined}
      className={cn(
        "relative size-48 select-none",
        !color && "text-foreground",
        className
      )}
      style={color ? { color, ...style } : style}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (!interactive) return
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left - rect.width / 2
        const y = event.clientY - rect.top - rect.height / 2
        // Turns clockwise from the top, matching the bars.
        const angle = (Math.atan2(y, x) + Math.PI / 2) / TAU
        rendererRef.current?.points(((angle % 1) + 1) % 1)
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
      {children !== undefined && (
        <div
          data-slot="circle-wave-center"
          className="absolute inset-0 flex items-center justify-center"
        >
          {children}
        </div>
      )}
    </div>
  )
}

export {
  CircleWave,
  circleWaveDirections,
  circleWaveGradients,
  circleWavePaletteNames,
  circleWavePalettes,
  circleWavePatterns,
  circleWaveVariants,
  type CircleWaveDirection,
  type CircleWaveFunction,
  type CircleWaveGradient,
  type CircleWavePalette,
  type CircleWavePattern,
  type CircleWaveVariant,
}
