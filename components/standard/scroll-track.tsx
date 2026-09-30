"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * A line that fills as the reader scrolls, like the reading bar under an
 * article header.
 *
 * By default it is a straight horizontal line. `orientation="vertical"`
 * stands it on end, and `d` swaps in any SVG path (drawn in `viewBox`
 * units), so the fill can follow a wave, a spiral or a route. `marker` rides
 * the tip of the fill: a dot, an icon, or any node that moves along the
 * line as the page scrolls. `rotateMarker` turns it to face the way the
 * line runs.
 *
 * The range, from y1 to y2:
 * - `start` and `end` are scroll offsets in pixels. Without them the track
 *   runs from the top of the scroller to the end.
 * - `target` tracks reading through one element instead: empty when its top
 *   reaches the top of the view, full when its bottom reaches the bottom.
 * - `progress` (0–1) skips scrolling and draws a fixed value.
 *
 * The scroller is `container`, else the nearest scrolling ancestor, else the
 * window. `pin` keeps the track stuck to the top or bottom of the scroller.
 * Progress is written straight to the DOM once per frame, with no React
 * renders, and is exposed as `--scroll-track-progress` on the root for your
 * own styles; `onProgressChange` reports it. Reduced motion drops the
 * smoothing.
 *
 * <ScrollTrack pin="top" rail />
 * <ScrollTrack target={articleRef} d="M0 10 Q 25 0 50 10 T 100 10" viewBox="0 0 100 20" marker={<Dot />} />
 */

type ScrollTrackTone = "default" | "success" | "warning" | "info" | "danger"

const fills: Record<ScrollTrackTone, { bar: string; stroke: string }> = {
  default: { bar: "bg-primary", stroke: "stroke-primary" },
  success: { bar: "bg-success", stroke: "stroke-success" },
  warning: { bar: "bg-warning", stroke: "stroke-warning" },
  info: { bar: "bg-info", stroke: "stroke-info" },
  danger: { bar: "bg-destructive", stroke: "stroke-destructive" },
}

type ScrollTrackProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Scroll offset, in pixels, where the track starts filling. */
  start?: number
  /** Scroll offset, in pixels, where the track is full. Defaults to the end of the scroller. */
  end?: number
  /** Track reading through this element instead of the whole scroller. */
  target?: React.RefObject<HTMLElement | null>
  /** Scroller to follow. Defaults to the nearest scrolling ancestor, or the window. */
  container?: React.RefObject<HTMLElement | null>
  /** 0–1. A fixed value instead of scroll progress. */
  progress?: number
  /** Direction of the default straight line. Ignored when `d` is set. */
  orientation?: "horizontal" | "vertical"
  /** Any SVG path, in `viewBox` units, for the fill to follow. */
  d?: string
  viewBox?: string
  preserveAspectRatio?: string
  /** Line width in pixels, or in `viewBox` units for a path. */
  thickness?: number
  /** Round the line ends. */
  rounded?: boolean
  tone?: ScrollTrackTone
  /** Show the unfilled rest of the line. */
  rail?: boolean
  /** Node that rides the tip of the fill. */
  marker?: React.ReactNode
  /** Turn the marker to face along the line. */
  rotateMarker?: boolean
  /** Keep the track stuck to an edge of the scroller. */
  pin?: "top" | "bottom"
  /** Seconds the fill takes to catch up with the scroll. `0` follows it exactly. */
  smooth?: number
  onProgressChange?: (progress: number) => void
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

function scrollParentOf(node: HTMLElement) {
  let parent = node.parentElement
  while (parent) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(parent).overflowY)) return parent
    parent = parent.parentElement
  }
  return null
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

function ScrollTrack({
  start,
  end,
  target,
  container,
  progress,
  orientation = "horizontal",
  d,
  viewBox = "0 0 100 100",
  preserveAspectRatio = "none",
  thickness = 3,
  rounded = false,
  tone = "default",
  rail = false,
  marker,
  rotateMarker = false,
  pin,
  smooth = 0.08,
  onProgressChange,
  className,
  style,
  ...props
}: ScrollTrackProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const fillRef = React.useRef<HTMLDivElement>(null)
  const pathRef = React.useRef<SVGPathElement>(null)
  const markerRef = React.useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const vertical = !d && orientation === "vertical"
  // Read through a ref so a new callback each render doesn't rewire scrolling.
  const reports = React.useRef(onProgressChange)
  React.useEffect(() => {
    reports.current = onProgressChange
  })

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const scroller = container?.current ?? scrollParentOf(root)
    const source: HTMLElement | Window = scroller ?? window
    const damping = reduced ? 0 : Math.max(0, smooth)
    const path = pathRef.current
    let length = path?.getTotalLength() ?? 0
    let wanted = 0
    let shown = -1
    let last = 0
    let frameId = 0

    const measures = () => {
      if (progress !== undefined) {
        wanted = clamp01(progress)
        return
      }
      const view = scroller
        ? { top: scroller.getBoundingClientRect().top + scroller.clientTop, height: scroller.clientHeight }
        : { top: 0, height: window.innerHeight }
      const element = target?.current
      if (element && start === undefined && end === undefined) {
        const rect = element.getBoundingClientRect()
        const runway = rect.height - view.height
        wanted =
          runway > 0
            ? clamp01((view.top - rect.top) / runway)
            : rect.bottom <= view.top + view.height
              ? 1
              : 0
        return
      }
      const offset = scroller ? scroller.scrollTop : window.scrollY
      const max = scroller
        ? scroller.scrollHeight - scroller.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight
      const from = start ?? 0
      const to = end ?? max
      wanted = to > from ? clamp01((offset - from) / (to - from)) : offset >= from ? 1 : 0
    }

    const placesMarker = (value: number) => {
      const node = markerRef.current
      if (!node) return
      if (!path) {
        const along = `${(value * 100).toFixed(3)}%`
        node.style.left = vertical ? "50%" : along
        node.style.top = vertical ? along : "50%"
        node.style.rotate = rotateMarker && vertical ? "90deg" : ""
        return
      }
      const matrix = path.getScreenCTM()
      if (!matrix) return
      const box = root.getBoundingClientRect()
      const at = value * length
      const point = path.getPointAtLength(at).matrixTransform(matrix)
      node.style.left = `${(point.x - box.left).toFixed(2)}px`
      node.style.top = `${(point.y - box.top).toFixed(2)}px`
      if (rotateMarker) {
        const a = path.getPointAtLength(Math.max(0, at - 0.5)).matrixTransform(matrix)
        const b = path.getPointAtLength(Math.min(length, at + 0.5)).matrixTransform(matrix)
        node.style.rotate = `${Math.atan2(b.y - a.y, b.x - a.x).toFixed(4)}rad`
      } else node.style.rotate = ""
    }

    const draws = (value: number) => {
      root.style.setProperty("--scroll-track-progress", value.toFixed(4))
      root.setAttribute("aria-valuenow", String(Math.round(value * 100)))
      if (path) {
        path.style.strokeDasharray = `${length} ${length}`
        path.style.strokeDashoffset = `${((1 - value) * length).toFixed(3)}`
        // A zero-length dash still paints a round cap as a dot.
        path.style.opacity = value > 0 ? "" : "0"
      } else if (fillRef.current) {
        fillRef.current.style.transform = vertical ? `scaleY(${value})` : `scaleX(${value})`
      }
      placesMarker(value)
      if (value >= 1) root.dataset.complete = ""
      else delete root.dataset.complete
      reports.current?.(value)
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

    const resizes = () => {
      length = path?.getTotalLength() ?? 0
      // The marker's pixel position moves with the layout even when progress doesn't.
      if (shown >= 0) placesMarker(shown)
      schedules()
    }

    measures()
    shown = wanted
    draws(shown)

    const observer = new ResizeObserver(resizes)
    observer.observe(root)
    observer.observe(scroller ?? document.documentElement)
    if (scroller?.firstElementChild) observer.observe(scroller.firstElementChild)
    if (target?.current) observer.observe(target.current)
    source.addEventListener("scroll", schedules, { passive: true })
    window.addEventListener("resize", resizes)
    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      source.removeEventListener("scroll", schedules)
      window.removeEventListener("resize", resizes)
    }
  }, [container, target, start, end, progress, smooth, reduced, d, vertical, rotateMarker])

  const fill = fills[tone]

  return (
    <div
      ref={rootRef}
      role="progressbar"
      aria-label={props["aria-label"] ?? "Scroll progress"}
      aria-valuemin={0}
      aria-valuemax={100}
      data-slot="scroll-track"
      data-orientation={d ? "path" : orientation}
      className={cn(
        "relative",
        pin && "sticky z-10",
        pin === "top" && "top-0",
        pin === "bottom" && "bottom-0",
        !d && (vertical ? "h-full" : "w-full"),
        className
      )}
      style={
        {
          "--scroll-track-progress": 0,
          width: !d && vertical ? thickness : undefined,
          height: !d && !vertical ? thickness : undefined,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {d ? (
        <svg
          aria-hidden
          viewBox={viewBox}
          preserveAspectRatio={preserveAspectRatio}
          className="block size-full overflow-visible"
        >
          {rail ? (
            <path
              d={d}
              fill="none"
              strokeWidth={thickness}
              strokeLinecap={rounded ? "round" : "butt"}
              strokeLinejoin="round"
              className="stroke-border"
            />
          ) : null}
          <path
            ref={pathRef}
            data-slot="scroll-track-fill"
            d={d}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap={rounded ? "round" : "butt"}
            strokeLinejoin="round"
            className={fill.stroke}
          />
        </svg>
      ) : (
        <div
          aria-hidden
          className={cn("absolute inset-0 overflow-hidden", rail && "bg-border", rounded && "rounded-full")}
        >
          <div
            ref={fillRef}
            data-slot="scroll-track-fill"
            className={cn(
              "size-full will-change-transform",
              vertical ? "origin-top" : "origin-left",
              rounded && "rounded-full",
              fill.bar
            )}
            style={{ transform: vertical ? "scaleY(0)" : "scaleX(0)" }}
          />
        </div>
      )}
      {marker ? (
        <div
          ref={markerRef}
          aria-hidden
          data-slot="scroll-track-marker"
          className="pointer-events-none absolute top-0 left-0 -translate-1/2"
        >
          {marker}
        </div>
      ) : null}
    </div>
  )
}

export { ScrollTrack }
export type { ScrollTrackProps, ScrollTrackTone }
