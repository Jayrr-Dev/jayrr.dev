"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * An oscilloscope trace: a stroked wave that drifts across the field, over
 * an optional grid and center axis. It starts as one flat line and swells to
 * its amplitude, and can stack more lines, each shifted a little in phase,
 * for a ribbon of echoes.
 *
 * Drawn on one canvas, sampled every couple of device pixels, so the curve
 * stays smooth at any size and costs one stroke per line.
 *
 * <SineWave />
 * <SineWave frequency={5} grid axis />
 * <SineWave shape="square" color="var(--primary)" />
 * <SineWave lines={6} spread={0.08} glow />
 */

const sineWaveShapes = ["sine", "triangle", "square", "sawtooth"] as const

type SineWaveShape = (typeof sineWaveShapes)[number]

const TAU = Math.PI * 2

/** One cycle of each shape, for a phase in cycles, from -1 to 1. */
const SHAPES: Record<SineWaveShape, (phase: number) => number> = {
  sine: (phase) => Math.sin(phase * TAU),
  triangle: (phase) => {
    const p = phase - Math.floor(phase)
    return p < 0.25 ? p * 4 : p < 0.75 ? 2 - p * 4 : p * 4 - 4
  },
  square: (phase) => (phase - Math.floor(phase) < 0.5 ? 1 : -1),
  sawtooth: (phase) => {
    const p = phase - Math.floor(phase + 0.5)
    return p * 2
  },
}

/** Device pixels between samples along the curve. */
const SAMPLE_STEP = 2
/** Milliseconds for the trace to swell from a flat line to full amplitude. */
const INTRO_DURATION = 900

type TraceConfig = {
  shape: SineWaveShape
  amplitude: number
  frequency: number
  speed: number
  phase: number
  lines: number
  spread: number
  thickness: number
  color: string
  glow: boolean
  grid: { columns: number; rows: number; color: string } | null
  axis: string | null
  intro: boolean
  running: boolean
}

/**
 * Animates and draws the trace. Time advances only while running; a paused
 * or off-screen trace keeps its place and redraws once on any change.
 */
class SineWaveRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D | null
  private readonly observer: ResizeObserver | null
  private config: TraceConfig | null = null
  private width = 0
  private height = 0
  private scale = 1
  private time = 0
  /** Fraction of the amplitude shown, from 0 (flat) to 1, for the intro. */
  private swell = 1
  private last = 0
  private request = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = canvas.getContext("2d")
    this.observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => this.measures())
    this.observer?.observe(canvas)
  }

  configure(config: TraceConfig) {
    const first = !this.config
    if (first) this.swell = config.intro && config.running ? 0 : 1
    this.config = config
    if (first) this.measures()
    if (config.running) this.starts()
    else {
      this.stops()
      if (!config.intro || !this.swell) this.swell = 1
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
    // A long gap (a hidden tab) resumes the trace instead of jumping ahead.
    const elapsed = Math.min(now - this.last, 100)
    this.last = now
    this.time += (elapsed / 1000) * (this.config?.speed ?? 0)
    if (this.swell < 1)
      this.swell = Math.min(1, this.swell + elapsed / INTRO_DURATION)
    this.draws()
    this.request = requestAnimationFrame(this.animates)
  }

  private measures() {
    const scale = window.devicePixelRatio || 1
    const width = Math.round(this.canvas.clientWidth * scale)
    const height = Math.round(this.canvas.clientHeight * scale)
    if (!width || !height) return
    this.scale = scale
    this.width = this.canvas.width = width
    this.height = this.canvas.height = height
    this.draws()
  }

  private draws() {
    const { context, config, width, height, scale } = this
    if (!context || !config || !width) return
    context.clearRect(0, 0, width, height)

    const middle = height / 2
    if (config.grid) this.drawsGrid(config.grid)
    if (config.axis) {
      context.beginPath()
      context.moveTo(0, Math.round(middle) + 0.5)
      context.lineTo(width, Math.round(middle) + 0.5)
      context.setLineDash([4 * scale, 4 * scale])
      context.lineWidth = scale
      context.strokeStyle = config.axis
      context.stroke()
      context.setLineDash([])
    }

    const lineWidth = config.thickness * scale
    // Room for the stroke and its glow, so the crests are never clipped.
    const reach =
      Math.max(0, middle - lineWidth - (config.glow ? 6 * scale : 0)) *
      config.amplitude *
      easesSwell(this.swell)
    const wave = SHAPES[config.shape]

    context.lineWidth = lineWidth
    context.lineJoin = "round"
    context.lineCap = "round"
    context.strokeStyle = config.color
    if (config.glow) {
      context.shadowColor = config.color
      context.shadowBlur = 10 * scale
    }

    // Echo lines draw first and fainter, so the main trace sits on top.
    for (let line = config.lines - 1; line >= 0; line--) {
      const offset = config.phase - line * config.spread
      context.globalAlpha = config.lines > 1 ? 1 - line / (config.lines + 1) : 1
      context.beginPath()
      for (let x = 0; x <= width + SAMPLE_STEP; x += SAMPLE_STEP) {
        const across = Math.min(x, width) / width
        const y =
          middle -
          wave(across * config.frequency - this.time + offset) * reach
        if (x === 0) context.moveTo(x, y)
        else context.lineTo(Math.min(x, width), y)
      }
      context.stroke()
    }

    context.globalAlpha = 1
    context.shadowBlur = 0
  }

  private drawsGrid(grid: NonNullable<TraceConfig["grid"]>) {
    const { context, width, height, scale } = this
    if (!context) return
    context.beginPath()
    for (let column = 0; column <= grid.columns; column++) {
      const x = Math.round((column / grid.columns) * width)
      const at = Math.min(width - 0.5, Math.max(0.5, x + 0.5))
      context.moveTo(at, 0)
      context.lineTo(at, height)
    }
    for (let row = 0; row <= grid.rows; row++) {
      const y = Math.round((row / grid.rows) * height)
      const at = Math.min(height - 0.5, Math.max(0.5, y + 0.5))
      context.moveTo(0, at)
      context.lineTo(width, at)
    }
    context.lineWidth = scale
    context.strokeStyle = grid.color
    context.stroke()
  }
}

/** Overshoots a touch past full amplitude and settles, like a string plucked. */
function easesSwell(progress: number) {
  if (progress >= 1) return 1
  const c = 1.4
  const p = progress - 1
  return 1 + (c + 1) * p * p * p + c * p * p
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

function SineWave({
  shape = "sine",
  amplitude = 0.6,
  frequency = 3,
  speed = 0.5,
  phase = 0,
  lines = 1,
  spread = 0.06,
  thickness = 2.5,
  color,
  glow = false,
  grid = false,
  gridColumns = 20,
  gridRows = 10,
  axis = false,
  intro = true,
  paused = false,
  label,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "children" | "color"> & {
  shape?: SineWaveShape
  /** Height of the crests, from 0 (a flat line) to 1 (touching the edges). */
  amplitude?: number
  /** Full cycles across the width. */
  frequency?: number
  /** Cycles the wave drifts per second; negative drifts right, 0 holds still. */
  speed?: number
  /** Shifts the wave, in cycles. */
  phase?: number
  /** How many traces to draw; extra lines trail the first, fainter each time. */
  lines?: number
  /** Phase between stacked lines, in cycles. */
  spread?: number
  /** Stroke width in CSS pixels. */
  thickness?: number
  /** Trace color; any CSS color, including `var(--token)`. Defaults to the text color. */
  color?: string
  /** A soft halo around the trace, like phosphor. */
  glow?: boolean
  /** Graph-paper lines behind the trace. */
  grid?: boolean
  gridColumns?: number
  gridRows?: number
  /** A dashed line through the middle, where the wave crosses zero. */
  axis?: boolean
  /** Starts as a flat line and swells to its amplitude. */
  intro?: boolean
  paused?: boolean
  /** Accessible description; defaults to the shape. */
  label?: string
}) {
  const fieldRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const rendererRef = React.useRef<SineWaveRenderer | null>(null)

  React.useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = new SineWaveRenderer(canvas)
    rendererRef.current = renderer
    return () => {
      renderer.destroy()
      rendererRef.current = null
    }
  }, [])

  // Only animate while the trace is on screen.
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

  React.useLayoutEffect(() => {
    const field = fieldRef.current
    if (!field) return
    rendererRef.current?.configure({
      shape,
      amplitude: Math.min(1, Math.max(0, amplitude)),
      frequency,
      speed,
      phase,
      lines: Math.max(1, Math.round(lines)),
      spread,
      thickness: Math.max(0.5, thickness),
      // `color` sits on the field, so the default follows the theme's text color.
      color: getComputedStyle(field).color,
      glow,
      grid: grid
        ? {
            columns: Math.max(1, gridColumns),
            rows: Math.max(1, gridRows),
            color: resolvesColor(field, "var(--border)"),
          }
        : null,
      axis: axis ? resolvesColor(field, "var(--muted-foreground)") : null,
      intro: intro && !reduced,
      running: visible && !paused && !reduced,
    })
  }, [
    shape,
    amplitude,
    frequency,
    speed,
    phase,
    lines,
    spread,
    thickness,
    color,
    glow,
    grid,
    gridColumns,
    gridRows,
    axis,
    intro,
    visible,
    paused,
    reduced,
  ])

  return (
    <div
      ref={fieldRef}
      role="img"
      aria-label={label ?? `${shape} wave`}
      data-slot="sine-wave"
      data-shape={shape}
      className={cn(
        "relative h-32 w-full select-none",
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
    </div>
  )
}

export { SineWave, sineWaveShapes, type SineWaveShape }
