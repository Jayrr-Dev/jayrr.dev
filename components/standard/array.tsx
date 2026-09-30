"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * Lays any elements out along a line, an arc, a circle or any SVG path,
 * including one drawn by hand. Each child is one item; or pass `count` and
 * `renderItem` to repeat one.
 *
 * Coordinates live in a `width` x `height` box that scales with the element,
 * so paths and points are written in those units.
 *
 * <ArrayLayout shape="circle">{avatars}</ArrayLayout>
 * <ArrayLayout shape="arc" startAngle={-150} endAngle={-30} count={7} renderItem={(i) => <Dot />} />
 * <ArrayLayout shape="path" path="M 10 120 C 80 0, 160 240, 230 120" orient>{chips}</ArrayLayout>
 * <ArrayLayout shape="points" points={[[10, 10], [60, 80], [120, 40]]}>{pins}</ArrayLayout>
 * <ArrayLayout justify="center" gap={32} count={4} renderItem={(i) => <Dot />} />
 */

type ArrayShape = "line" | "arc" | "circle" | "path" | "points"

/**
 * How items share the path, like `justify-content`. `between`, `around` and
 * `evenly` spread items over the whole path; `start`, `center` and `end` pack
 * them `gap` apart.
 */
type ArrayJustify = "between" | "around" | "evenly" | "start" | "center" | "end"

type ArrayPoint = [number, number]

type ArrayLayoutProps = Omit<React.ComponentProps<"div">, "children"> & {
  shape?: ArrayShape
  children?: React.ReactNode
  /** Items to make with `renderItem`, when not passing children. */
  count?: number
  renderItem?: (index: number) => React.ReactNode
  /** Coordinate box the path is written in; the element keeps its ratio. */
  width?: number
  height?: number
  /** Circle and arc radius. Defaults to fit the box, less `inset`. */
  radius?: number
  /** Room kept between a circle or arc and the box edge. */
  inset?: number
  /** Arc angles in degrees; 0 points right, -90 up. */
  startAngle?: number
  endAngle?: number
  /** `shape="line"` direction in degrees; 0 runs left to right. */
  angle?: number
  /** An SVG path `d`, for `shape="path"`. */
  path?: string
  /** A polyline, for `shape="points"`; `smooth` rounds its corners. */
  points?: ArrayPoint[]
  smooth?: boolean
  /** Defaults to `between`, or `start` once a `gap` is set. */
  justify?: ArrayJustify
  /** Distance between items along the path, in box units, when packed. */
  gap?: number
  /** Shifts every item along the path, as a share of its length (0 to 1). */
  offset?: number
  /** Turns each item to follow the path's direction. */
  orient?: boolean
  /** Draws the guide path under the items. */
  showPath?: boolean
  itemClassName?: string
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

/** A Catmull-Rom curve through the points, as cubic Béziers. */
function smoothsPoints(points: ArrayPoint[]) {
  if (points.length < 3) return linesPoints(points)
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`
  }
  return d
}

function linesPoints(points: ArrayPoint[]) {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ")
}

/** Builds the guide path, and whether it closes on itself. */
function buildsPath({
  shape,
  width,
  height,
  radius,
  inset,
  startAngle,
  endAngle,
  angle,
  path,
  points,
  smooth,
}: Required<
  Pick<
    ArrayLayoutProps,
    "shape" | "width" | "height" | "inset" | "startAngle" | "endAngle" | "angle" | "smooth"
  >
> &
  Pick<ArrayLayoutProps, "radius" | "path" | "points">) {
  const cx = width / 2
  const cy = height / 2
  const r = radius ?? Math.min(width, height) / 2 - inset

  if (shape === "circle") {
    return {
      d: `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`,
      closed: true,
    }
  }

  if (shape === "arc") {
    const a0 = toRadians(startAngle)
    const a1 = toRadians(endAngle)
    const sweep = endAngle - startAngle
    const large = Math.abs(sweep) > 180 ? 1 : 0
    const direction = sweep > 0 ? 1 : 0
    return {
      d: `M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${large} ${direction} ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`,
      closed: false,
    }
  }

  if (shape === "path" && path) {
    return { d: path, closed: /z\s*$/i.test(path.trim()) }
  }

  if (shape === "points" && points && points.length > 1) {
    return { d: smooth ? smoothsPoints(points) : linesPoints(points), closed: false }
  }

  // A line through the centre of the box, at `angle`.
  const a = toRadians(angle)
  const half =
    Math.min(
      Math.abs(Math.cos(a)) > 1e-6 ? width / 2 / Math.abs(Math.cos(a)) : Infinity,
      Math.abs(Math.sin(a)) > 1e-6 ? height / 2 / Math.abs(Math.sin(a)) : Infinity
    ) - inset
  return {
    d: `M ${cx - half * Math.cos(a)} ${cy - half * Math.sin(a)} L ${cx + half * Math.cos(a)} ${cy + half * Math.sin(a)}`,
    closed: false,
  }
}

type Placement = { x: number; y: number; rotate: number }

const DEFAULT_GAP = 24

/** Where each item sits along the path, as a distance from its start. */
function distributes({
  total,
  length,
  closed,
  justify,
  gap,
}: {
  total: number
  length: number
  closed: boolean
  justify: ArrayJustify
  gap: number
}) {
  const each = (place: (index: number) => number) =>
    Array.from({ length: total }, (_, index) => place(index))

  if (justify === "start" || justify === "center" || justify === "end") {
    const span = gap * (total - 1)
    const first =
      justify === "start" ? 0 : justify === "end" ? length - span : (length - span) / 2
    // A closed path has no ends; `end` packs back from its start point.
    return each((index) => (closed && justify === "end" ? -span : first) + index * gap)
  }

  if (justify === "around") return each((index) => ((index + 0.5) * length) / total)
  // Around a closed path, spreading over the whole length already spaces evenly.
  if (closed) return each((index) => (index * length) / total)
  if (justify === "evenly") return each((index) => ((index + 1) * length) / (total + 1))
  if (total === 1) return [length / 2]
  return each((index) => (index * length) / (total - 1))
}

function ArrayLayout({
  shape = "line",
  children,
  count,
  renderItem,
  width = 240,
  height = 240,
  radius,
  inset = 20,
  startAngle = -180,
  endAngle = 0,
  angle = 0,
  path,
  points,
  smooth = true,
  justify,
  gap,
  offset = 0,
  orient = false,
  showPath = false,
  itemClassName,
  className,
  style,
  ...props
}: ArrayLayoutProps) {
  const items = renderItem
    ? Array.from({ length: count ?? 0 }, (_, index) => renderItem(index))
    : React.Children.toArray(children)

  const { d, closed } = buildsPath({
    shape,
    width,
    height,
    radius,
    inset,
    startAngle,
    endAngle,
    angle,
    path,
    points,
    smooth,
  })

  const pathRef = React.useRef<SVGPathElement>(null)
  const [placements, setPlacements] = React.useState<Placement[]>([])
  const total = items.length

  // Measures the path in the browser; positions follow its length evenly.
  React.useLayoutEffect(() => {
    const element = pathRef.current
    if (!element || total === 0) {
      setPlacements([])
      return
    }
    const length = element.getTotalLength()
    const distances = distributes({
      total,
      length,
      closed,
      justify: justify ?? (gap === undefined ? "between" : "start"),
      gap: gap ?? DEFAULT_GAP,
    })
    const next = distances.map((distance) => {
      const shifted = distance + offset * length
      const at = closed
        ? ((shifted % length) + length) % length
        : Math.min(length, Math.max(0, shifted))
      const point = element.getPointAtLength(at)
      const ahead = element.getPointAtLength(Math.min(length, at + 0.5))
      const behind = element.getPointAtLength(Math.max(0, at - 0.5))
      const rotate = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI
      return { x: point.x, y: point.y, rotate }
    })
    setPlacements(next)
  }, [d, closed, total, offset, justify, gap])

  return (
    <div
      data-slot="array"
      data-shape={shape}
      data-justify={justify ?? (gap === undefined ? "between" : "start")}
      className={cn("relative w-full", className)}
      style={{ aspectRatio: `${width} / ${height}`, ...style }}
      {...props}
    >
      <svg
        aria-hidden
        viewBox={`0 0 ${width} ${height}`}
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <path
          ref={pathRef}
          d={d}
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke"
          className={showPath ? "stroke-border" : "stroke-transparent"}
        />
      </svg>
      {items.map((item, index) => {
        const placement = placements[index]
        if (!placement) return null
        return (
          <div
            key={index}
            data-slot="array-item"
            className={cn("absolute", itemClassName)}
            style={{
              left: `${(placement.x / width) * 100}%`,
              top: `${(placement.y / height) * 100}%`,
              transform: `translate(-50%, -50%)${orient ? ` rotate(${placement.rotate}deg)` : ""}`,
            }}
          >
            {item}
          </div>
        )
      })}
    </div>
  )
}

export { ArrayLayout, type ArrayJustify, type ArrayPoint, type ArrayShape }
