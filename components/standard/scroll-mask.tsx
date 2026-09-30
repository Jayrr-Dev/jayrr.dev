"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * A pinned frame that scrolling opens: the section sticks for a runway of
 * `scrollLength` view heights while a mask opens over its media, then lets
 * the page move on.
 *
 * `variant` picks the mask: `iris` (a circle from the origin), `wipe` (a
 * straight edge at `angle`), `curtain` (a slit that parts sideways), `slats`
 * (strips that open in turn), `grid` (cells that open in turn) and `type`
 * (a `word` cut out of a cover that grows until the media fills the frame).
 * `stagger` spreads slats and cells out from the origin; `0` opens them
 * together.
 *
 * Pass `src` for an image, or `media` for any other node. Children sit over
 * the frame and fade in as the reveal completes.
 *
 * The runway follows the nearest scrolling ancestor, or the window, so it
 * works inside a scrolling panel too. Progress is written straight to the
 * DOM once per frame, with no React renders. Reduced motion drops the
 * damping and the zoom.
 *
 * <ScrollMask variant="iris" src={photo} alt="Harbour at dusk">
 *   <h2>Open water</h2>
 * </ScrollMask>
 */

const scrollMaskVariants = ["iris", "wipe", "curtain", "slats", "grid", "type"] as const

type ScrollMaskVariant = (typeof scrollMaskVariants)[number]

type ScrollMaskRadius = "none" | "sm" | "md" | "lg" | "xl"

const radii: Record<ScrollMaskRadius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
}

type ScrollMaskProps = Omit<React.ComponentProps<"section">, "children"> & {
  variant?: ScrollMaskVariant
  src?: string
  alt?: string
  /** Any node to reveal instead of an image. */
  media?: React.ReactNode
  /** Word cut out of the cover, for `type`. */
  word?: string
  /** Runway past the pinned frame, in view heights. */
  scrollLength?: number
  /** Share of the runway after which the mask is fully open. */
  settle?: number
  /** Seconds the reveal takes to catch up with the scroll. `0` follows it exactly. */
  smooth?: number
  /** Edge softness, as a percentage of the frame. */
  feather?: number
  /** 0–1. Delay spread across slats and cells. */
  stagger?: number
  /** Strips for `slats`, columns for `grid`. */
  columns?: number
  /** Where the reveal starts, in percent of the frame. */
  originX?: number
  originY?: number
  /** Sweep direction of `wipe`, in degrees. */
  angle?: number
  /** Scale the media starts at, settling to 1 as it opens. */
  zoom?: number
  /** 0–1. Dark scrim over the media, for legible children. */
  overlay?: number
  /** Fade children in as the reveal completes. */
  revealContent?: boolean
  /** Corner rounding of the frame. */
  radius?: ScrollMaskRadius
  /** Holds the frame in from the edges of the view. */
  inset?: boolean
  children?: React.ReactNode
}

type Geometry = {
  variant: ScrollMaskVariant
  feather: number
  stagger: number
  columns: number
  originX: number
  originY: number
  angle: number
  zoom: number
  revealContent: boolean
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const pct = (value: number) => `${value.toFixed(3)}%`
const hidden = "linear-gradient(transparent, transparent)"

function scrollParentOf(node: HTMLElement) {
  let parent = node.parentElement
  while (parent) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(parent).overflowY)) return parent
    parent = parent.parentElement
  }
  return null
}

/** A band `half` wide either side of `at`, soft over `feather`. */
function band(direction: string, at: number, half: number, feather: number) {
  return `linear-gradient(${direction}, transparent ${pct(at - half - feather)}, #000 ${pct(
    at - half
  )}, #000 ${pct(at + half)}, transparent ${pct(at + half + feather)})`
}

/** How far a piece at (x, y), 0–1, sits from the origin, 0–1. */
function distanceFrom(x: number, y: number, g: Geometry) {
  const ox = g.originX / 100
  const oy = g.originY / 100
  const far = Math.hypot(Math.max(ox, 1 - ox), Math.max(oy, 1 - oy)) || 1
  return Math.hypot(x - ox, y - oy) / far
}

/** A piece's own progress once its stagger delay has passed. */
function pieceProgress(reveal: number, distance: number, stagger: number) {
  const delay = stagger * distance
  return clamp01((reveal - delay) / Math.max(0.001, 1 - stagger))
}

type MaskLayers = { image: string; size?: string; position?: string }

function maskLayers(reveal: number, g: Geometry, rows: number): MaskLayers {
  const f = g.feather
  const open = (reach: number) => reveal * (reach + f)

  switch (g.variant) {
    case "iris": {
      if (reveal <= 0) return { image: hidden }
      const edge = open(100)
      return {
        image: `radial-gradient(circle farthest-corner at ${g.originX}% ${g.originY}%, #000 ${pct(
          edge - f
        )}, transparent ${pct(edge)})`,
      }
    }
    case "wipe": {
      if (reveal <= 0) return { image: hidden }
      const edge = open(100)
      return {
        image: `linear-gradient(${g.angle}deg, #000 ${pct(edge - f)}, transparent ${pct(edge)})`,
      }
    }
    case "curtain": {
      if (reveal <= 0) return { image: hidden }
      const reach = Math.max(g.originX, 100 - g.originX)
      return { image: band("to right", g.originX, open(reach) - f / 2, f / 2) }
    }
    case "slats": {
      const count = Math.max(1, Math.round(g.columns))
      const reach = Math.max(g.originY, 100 - g.originY)
      const soft = f / 4
      const images: string[] = []
      const positions: string[] = []
      for (let i = 0; i < count; i++) {
        const x = count === 1 ? 0.5 : i / (count - 1)
        const local = pieceProgress(reveal, distanceFrom(x, g.originY / 100, g), g.stagger)
        images.push(local <= 0 ? hidden : band("to bottom", g.originY, local * (reach + soft), soft))
        positions.push(`${pct(x * 100)} 0`)
      }
      return {
        image: images.join(","),
        // A pixel of overlap keeps hairline seams out between strips.
        size: `calc(100% / ${count} + 1px) 100%`,
        position: positions.join(","),
      }
    }
    case "grid": {
      const cols = Math.max(1, Math.round(g.columns))
      const soft = Math.min(f, 40)
      const images: string[] = []
      const positions: string[] = []
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = cols === 1 ? 0.5 : col / (cols - 1)
          const y = rows === 1 ? 0.5 : row / (rows - 1)
          const local = pieceProgress(reveal, distanceFrom(x, y, g), g.stagger)
          const edge = local * (100 + soft)
          images.push(
            local <= 0
              ? hidden
              : `radial-gradient(circle farthest-corner, #000 ${pct(edge - soft)}, transparent ${pct(edge)})`
          )
          positions.push(`${pct(x * 100)} ${pct(y * 100)}`)
        }
      }
      return {
        image: images.join(","),
        size: `calc(100% / ${cols} + 1px) calc(100% / ${rows} + 1px)`,
        position: positions.join(","),
      }
    }
    case "type":
      return { image: "none" }
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updates = () => setReduced(query.matches)
    updates()
    query.addEventListener("change", updates)
    return () => query.removeEventListener("change", updates)
  }, [])
  return reduced
}

function ScrollMask({
  variant = "iris",
  src,
  alt = "",
  media,
  word = "SCROLL",
  scrollLength = 1.7,
  settle = 0.84,
  smooth = 0.14,
  feather = 14,
  stagger = 0.55,
  columns = 9,
  originX = 50,
  originY = 50,
  angle = 108,
  zoom = 1.14,
  overlay = 0,
  revealContent = true,
  radius = "lg",
  inset = false,
  className,
  style,
  children,
  ...props
}: ScrollMaskProps) {
  const sectionRef = React.useRef<HTMLElement>(null)
  const frameRef = React.useRef<HTMLDivElement>(null)
  const mediaRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const coverRef = React.useRef<SVGGElement>(null)
  const wordRef = React.useRef<SVGTextElement>(null)
  // useId returns colons, which break `url(#id)`.
  const maskId = `scroll-mask-${React.useId().replace(/[^\w-]/g, "")}`
  const reduced = usePrefersReducedMotion()

  const geometry: Geometry = React.useMemo(
    () => ({
      variant,
      feather: Math.max(0, feather),
      stagger: clamp01(stagger),
      columns,
      originX,
      originY,
      angle,
      zoom: reduced ? 1 : zoom,
      revealContent,
    }),
    [variant, feather, stagger, columns, originX, originY, angle, zoom, reduced, revealContent]
  )

  React.useEffect(() => {
    const section = sectionRef.current
    const frame = frameRef.current
    const mediaLayer = mediaRef.current
    if (!section || !frame || !mediaLayer) return

    const scroller = scrollParentOf(section)
    const target: HTMLElement | Window = scroller ?? window
    const damping = reduced ? 0 : Math.max(0, smooth)
    let rows = 1
    let wanted = 0
    let shown = -1
    let last = 0
    let frameId = 0

    const viewOf = () =>
      scroller
        ? { top: scroller.getBoundingClientRect().top + scroller.clientTop, height: scroller.clientHeight }
        : { top: 0, height: window.innerHeight }

    const draws = (reveal: number) => {
      const layers = maskLayers(reveal, geometry, rows)
      mediaLayer.style.maskImage = layers.image
      mediaLayer.style.setProperty("-webkit-mask-image", layers.image)
      mediaLayer.style.maskSize = layers.size ?? ""
      mediaLayer.style.setProperty("-webkit-mask-size", layers.size ?? "")
      mediaLayer.style.maskPosition = layers.position ?? ""
      mediaLayer.style.setProperty("-webkit-mask-position", layers.position ?? "")
      mediaLayer.style.setProperty(
        "--scroll-mask-zoom",
        (geometry.zoom - (geometry.zoom - 1) * reveal).toFixed(4)
      )

      if (geometry.variant === "type" && coverRef.current && wordRef.current) {
        // Cubic growth: the word reads first, then rushes open.
        const scale = 1 + reveal ** 3 * 60
        wordRef.current.style.transform = `scale(${scale.toFixed(3)})`
        coverRef.current.style.opacity = (1 - clamp01((reveal - 0.7) / 0.3)).toFixed(3)
      }

      if (contentRef.current) {
        contentRef.current.style.opacity = geometry.revealContent
          ? clamp01((reveal - 0.7) / 0.3).toFixed(3)
          : ""
      }
      if (reveal >= 1) section.dataset.revealed = ""
      else delete section.dataset.revealed
    }

    const measures = () => {
      const view = viewOf()
      section.style.setProperty("--scroll-mask-view", `${view.height}px`)
      const box = frame.getBoundingClientRect()
      rows = Math.max(1, Math.round((Math.round(columns) * box.height) / Math.max(1, box.width)))
      if (wordRef.current) {
        wordRef.current.style.fontSize = `${(box.width / Math.max(3, word.length * 0.62)).toFixed(1)}px`
      }
      const rect = section.getBoundingClientRect()
      const runway = rect.height - view.height
      const progress = runway > 0 ? clamp01((view.top - rect.top) / runway) : 1
      wanted = clamp01(progress / Math.max(0.01, settle))
    }

    const ticks = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60
      last = now
      const next =
        damping === 0 || shown < 0 ? wanted : shown + (wanted - shown) * (1 - Math.exp(-dt / damping))
      const settled = Math.abs(wanted - next) < 0.0005
      shown = settled ? wanted : next
      draws(shown)
      frameId = settled ? 0 : requestAnimationFrame(ticks)
      if (settled) last = 0
    }

    const schedules = () => {
      measures()
      if (!frameId) frameId = requestAnimationFrame(ticks)
    }

    // A zero-damping first paint, so the frame never flashes open.
    measures()
    shown = wanted
    draws(shown)

    const resizes = new ResizeObserver(schedules)
    resizes.observe(frame)
    if (scroller) resizes.observe(scroller)
    target.addEventListener("scroll", schedules, { passive: true })
    window.addEventListener("resize", schedules)
    return () => {
      cancelAnimationFrame(frameId)
      resizes.disconnect()
      target.removeEventListener("scroll", schedules)
      window.removeEventListener("resize", schedules)
    }
  }, [geometry, columns, settle, smooth, reduced, word])

  return (
    <section
      ref={sectionRef}
      data-slot="scroll-mask"
      data-variant={variant}
      className={cn("relative", className)}
      style={
        {
          "--scroll-mask-view": "100svh",
          height: `calc(var(--scroll-mask-view) * ${1 + Math.max(0, scrollLength)})`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <div className={cn("sticky top-0 grid h-(--scroll-mask-view) overflow-hidden", inset && "p-3")}>
        <div
          ref={frameRef}
          data-slot="scroll-mask-frame"
          className={cn("relative isolate overflow-hidden", radii[radius])}
        >
          <div
            ref={mediaRef}
            data-slot="scroll-mask-media"
            className="absolute inset-0"
            style={
              {
                "--scroll-mask-zoom": geometry.zoom,
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
              } as React.CSSProperties
            }
          >
            <div
              className="size-full scale-(--scroll-mask-zoom) *:size-full *:object-cover"
              style={{ transformOrigin: `${originX}% ${originY}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- registry piece, framework-agnostic */}
              {media ?? (src ? <img src={src} alt={alt} draggable={false} /> : null)}
            </div>
            {overlay > 0 ? (
              <div
                aria-hidden
                className="absolute inset-0 bg-foreground dark:bg-background"
                style={{ opacity: clamp01(overlay) }}
              />
            ) : null}
          </div>

          {variant === "type" ? (
            <svg aria-hidden className="pointer-events-none absolute inset-0 size-full">
              <mask id={maskId}>
                {/* eslint-disable-next-line shadcn/no-raw-colors -- mask luminance: white shows the cover */}
                <rect width="100%" height="100%" fill="white" />
                <text
                  ref={wordRef}
                  x={`${originX}%`}
                  y={`${originY}%`}
                  textAnchor="middle"
                  dominantBaseline="central"
                  // eslint-disable-next-line shadcn/no-raw-colors -- mask luminance: black cuts the word out
                  fill="black"
                  className="font-black tracking-tight"
                  style={{ transformBox: "view-box", transformOrigin: `${originX}% ${originY}%` }}
                >
                  {word}
                </text>
              </mask>
              <g ref={coverRef}>
                <rect
                  width="100%"
                  height="100%"
                  mask={`url(#${maskId})`}
                  className="fill-background"
                />
              </g>
            </svg>
          ) : null}

          {children ? (
            <div
              ref={contentRef}
              data-slot="scroll-mask-content"
              className="relative grid size-full place-items-center"
            >
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export { ScrollMask, scrollMaskVariants }
export type { ScrollMaskProps, ScrollMaskRadius, ScrollMaskVariant }
