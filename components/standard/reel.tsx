"use client"

import * as React from "react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

/**
 * A reel of items that keeps moving. Straight, it loops its items left,
 * right, up or down like a logo ticker, repeating them to fill the space.
 * Given an SVG `path`, the items ride along it instead: round a closed loop,
 * or in at one end and out the other. With `drawable`, press and drag on the
 * reel to draw a new path for them to follow.
 *
 * `flow` sets how items are sent down the course: a steady `stream`, a number
 * at a time (`1` sends one item, and the next once it has left), or `random`
 * gaps. `cycles` caps the passes through the items; after them the reel
 * waits `rest` ms and goes again, or stops if `loop` is false.
 *
 * Speed is in pixels per second and eases on change, so `hoverSpeed={0}`
 * glides to a stop under the pointer. It stops off screen and holds still
 * for people who prefer reduced motion. `playOnView` holds it at the start
 * until it scrolls into view, and plays it from the start each time it does.
 *
 * <Reel items={logos} fade />
 * <Reel direction="up" className="h-72">{cards}</Reel>
 * <Reel path="M20 150 C 120 0, 280 300, 380 150" viewBox="0 0 400 300" orient="auto" />
 * <Reel items={[bullet]} direction="right" flow={3} rest={800} />
 * <Reel drawable showPath onPathChange={save}>{stickers}</Reel>
 */

type ReelDirection = "left" | "right" | "up" | "down"
type ReelOrient = "auto" | "none"
/** `stream` sends items back to back; a number sends that many, then waits for them to leave. */
type ReelFlow = "stream" | "random" | number

type ReelProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The items on the reel. Composed `children` work too. */
  items?: React.ReactNode[]
  children?: React.ReactNode
  /** Which way a straight reel moves. Ignored when there is a path. */
  direction?: ReelDirection
  /** Pixels per second. */
  speed?: number
  /** Speed while the pointer is over the reel; `0` pauses it. */
  hoverSpeed?: number
  paused?: boolean
  /** Hold at the start until the reel scrolls into view, and replay each time it does. */
  playOnView?: boolean
  /** Space between items, in pixels. */
  gap?: number
  /** How items are sent down the course. */
  flow?: ReelFlow
  /** Passes through the items before resting. Unset runs forever. */
  cycles?: number
  /** Milliseconds to wait once the course clears, between groups and after `cycles`. */
  rest?: number
  /** Go again after `cycles`. `false` stops for good. */
  loop?: boolean
  /**
   * Fade items out at the edges: the ends of a straight reel, or the ends of
   * an open path. `true` fades over 48px; a number sets the width.
   */
  fade?: boolean | number
  /** An SVG path `d` for the items to follow. Closed with `Z`, it loops. */
  path?: string
  defaultPath?: string
  onPathChange?: (path: string) => void
  /**
   * The coordinate space of `path`, scaled to fit the reel. Without one the
   * path is in the reel's own pixels.
   */
  viewBox?: string
  /** Travel a path from its end to its start. */
  reverse?: boolean
  /** `auto` turns items to face along the path; `none` keeps them upright. */
  orient?: ReelOrient
  /** Draw the path as a faint dashed line under the items. */
  showPath?: boolean
  /** Press and drag to draw a new path. */
  drawable?: boolean
  itemClassName?: string
}

type Point = [number, number]

type Mapping = { scale: number; x: number; y: number }

/** The track items travel, measured in pixels from its start. */
type Course = {
  length: number
  closed: boolean
  /** Container pixels at a distance; past either end of an open course it runs on straight. */
  pointAt: (distance: number) => Point
}

type Geometry = {
  course: Course
  /** Along-course size of each item, in pixels. */
  sizes: number[]
  /** Center of each item from the start of a set, in pixels. */
  centers: number[]
  /** One set of items with their gaps, in pixels. */
  setLength: number
  largest: number
}

type Flight = { item: number; copy: number; distance: number }

type Launcher = {
  flights: Flight[]
  /** Pixels of travel before the next item may go. */
  countdown: number
  next: number
  launched: number
  groupLeft: number
  phase: "launching" | "clearing" | "resting" | "done"
  restLeft: number
  /** Whether the course has been filled in advance, or should start empty. */
  warmed: boolean
}

const DEFAULT_FADE = 48
const MAX_COPIES = 40
/** Most item elements a launched reel keeps in its pool. */
const MAX_NODES = 60
/** Seconds for speed changes to mostly settle. */
const EASE = 0.25
/** Freehand points closer than this, in pixels, are dropped. */
const DRAW_STEP = 6
/** A drawing that ends this close to its start, in pixels, closes into a loop. */
const CLOSE_DISTANCE = 28
/** How much of a reel must show before `playOnView` starts it. */
const VIEW_THRESHOLD = 0.35

function wrap(value: number, length: number) {
  return ((value % length) + length) % length
}

/** Fits a viewBox into the reel the way `preserveAspectRatio="xMidYMid meet"` does. */
function fitViewBox(
  viewBox: string | undefined,
  width: number,
  height: number
): Mapping {
  const box = viewBox?.split(/[\s,]+/).map(Number)
  if (!box || box.length !== 4 || box.some(Number.isNaN) || !box[2] || !box[3])
    return { scale: 1, x: 0, y: 0 }
  const [minX, minY, boxWidth, boxHeight] = box
  const scale = Math.min(width / boxWidth, height / boxHeight)
  return {
    scale,
    x: (width - boxWidth * scale) / 2 - minX * scale,
    y: (height - boxHeight * scale) / 2 - minY * scale,
  }
}

function formatPoint([x, y]: Point) {
  return `${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`
}

/** A smooth path through freehand points: quadratic curves between midpoints. */
function toSmoothPath(points: Point[], closed: boolean) {
  if (points.length < 3)
    return `M${points.map(formatPoint).join(" L")}${closed ? " Z" : ""}`
  let d = `M${formatPoint(points[0])}`
  for (let index = 1; index < points.length - 1; index++) {
    const [x, y] = points[index]
    const [nextX, nextY] = points[index + 1]
    d += ` Q${formatPoint([x, y])} ${formatPoint([(x + nextX) / 2, (y + nextY) / 2])}`
  }
  d += ` L${formatPoint(points[points.length - 1])}`
  return closed ? `${d} Z` : d
}

function pathCourse(
  element: SVGPathElement,
  mapping: Mapping,
  closed: boolean,
  reverse: boolean
): Course {
  const length = element.getTotalLength()
  const { scale } = mapping
  return {
    length: length * scale,
    closed,
    pointAt(distance) {
      let units = distance / scale
      if (closed) units = wrap(units, length)
      if (reverse) units = length - units
      const clamped = Math.min(Math.max(units, 0), length)
      const point = element.getPointAtLength(clamped)
      let [x, y] = [point.x, point.y]
      if (units !== clamped) {
        const step = Math.min(1, length)
        const other = element.getPointAtLength(units < 0 ? step : length - step)
        const sign = units < 0 ? 1 : -1
        const over = Math.abs(units - clamped)
        x -= ((other.x - point.x) / step) * over * sign
        y -= ((other.y - point.y) / step) * over * sign
      }
      return [mapping.x + x * scale, mapping.y + y * scale]
    },
  }
}

/** A straight course across the middle of the reel, entering on the far side. */
function straightCourse(
  direction: ReelDirection,
  width: number,
  height: number
): Course {
  const vertical = direction === "up" || direction === "down"
  const length = vertical ? height : width
  return {
    length,
    closed: false,
    pointAt(distance) {
      if (direction === "left") return [width - distance, height / 2]
      if (direction === "right") return [distance, height / 2]
      if (direction === "up") return [width / 2, height - distance]
      return [width / 2, distance]
    },
  }
}

function groupSize(flow: ReelFlow) {
  return typeof flow === "number" ? Math.max(1, Math.floor(flow)) : Infinity
}

function createLauncher(flow: ReelFlow, count: number, warmed: boolean) {
  return {
    flights: [],
    countdown: 0,
    next: flow === "random" ? Math.floor(Math.random() * count) : 0,
    launched: 0,
    groupLeft: groupSize(flow),
    phase: "launching",
    restLeft: 0,
    warmed,
  } satisfies Launcher as Launcher
}

function Reel({
  items,
  children,
  direction = "left",
  speed = 60,
  hoverSpeed,
  paused = false,
  playOnView = false,
  gap = 32,
  flow = "stream",
  cycles,
  rest = 0,
  loop = true,
  fade = false,
  path,
  defaultPath,
  onPathChange,
  viewBox,
  reverse = false,
  orient = "none",
  showPath = false,
  drawable = false,
  itemClassName,
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: ReelProps) {
  const list = React.useMemo(
    () => items ?? React.Children.toArray(children),
    [items, children]
  )
  const [route, setRoute] = useControllableState({
    value: path,
    defaultValue: defaultPath ?? "",
    onChange: onPathChange,
  })
  const onPath = Boolean(route)
  const closed = onPath && /z\s*$/i.test(route.trim())
  const vertical = direction === "up" || direction === "down"
  const fadeWidth = fade === true ? DEFAULT_FADE : fade || 0
  const limited = cycles !== undefined && Number.isFinite(cycles)
  // A plain stream with no end loops seamlessly as a conveyor; anything
  // else launches items onto the course one by one.
  const engine =
    flow === "stream" && !limited && (!onPath || closed)
      ? onPath
        ? "loop"
        : "track"
      : "launcher"

  const containerRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const firstCopyRef = React.useRef<HTMLDivElement>(null)
  const pathRef = React.useRef<SVGPathElement>(null)
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])

  const [copies, setCopies] = React.useState(2)
  const [crossSize, setCrossSize] = React.useState(0)
  const [draft, setDraft] = React.useState<string | null>(null)

  const offsetRef = React.useRef(0)
  const velocityRef = React.useRef(0)
  const hoveredRef = React.useRef(false)
  const visibleRef = React.useRef(!playOnView)
  const restartRef = React.useRef(false)
  const setLengthRef = React.useRef(0)
  const geometryRef = React.useRef<Geometry | null>(null)
  const launcherRef = React.useRef<Launcher>(
    createLauncher(flow, list.length || 1, playOnView)
  )
  const pointsRef = React.useRef<Point[] | null>(null)

  const motion = {
    speed,
    hoverSpeed,
    paused,
    playOnView,
    gap,
    fadeWidth,
    orient,
    flow,
    cycles: limited ? cycles : undefined,
    rest,
    loop,
  }
  const motionRef = React.useRef(motion)
  React.useEffect(() => {
    motionRef.current = motion
  })

  // A new course or a new flow starts the launcher over.
  React.useEffect(() => {
    launcherRef.current = createLauncher(
      flow,
      list.length || 1,
      motionRef.current.playOnView
    )
  }, [list, route, flow, cycles, loop, engine, direction, reverse])

  // Measure the items and the course, and how many copies of each to keep.
  React.useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || !list.length) return

    const measure = () => {
      const width = container.clientWidth
      const height = container.clientHeight

      if (engine === "track") {
        const copy = firstCopyRef.current
        if (!copy) return
        const setLength = vertical ? copy.offsetHeight : copy.offsetWidth
        if (!setLength) return
        setLengthRef.current = setLength
        const span = vertical ? height : width
        setCopies(
          Math.min(MAX_COPIES, Math.max(2, Math.ceil(span / setLength) + 1))
        )
        return
      }

      const nodes = list.map((_, index) => itemRefs.current[index * copies])
      const sizes = nodes.map((node) => {
        if (!node) return 0
        if (!onPath) return vertical ? node.offsetHeight : node.offsetWidth
        return orient === "auto"
          ? node.offsetWidth
          : Math.max(node.offsetWidth, node.offsetHeight)
      })
      if (!onPath)
        setCrossSize(
          Math.max(
            ...nodes.map((node) =>
              node ? (vertical ? node.offsetWidth : node.offsetHeight) : 0
            )
          )
        )

      let course: Course
      if (onPath) {
        const element = pathRef.current
        if (!element) return
        course = pathCourse(
          element,
          fitViewBox(viewBox, width, height),
          closed,
          reverse
        )
      } else {
        course = straightCourse(direction, width, height)
      }

      const centers: number[] = []
      let cursor = 0
      for (const size of sizes) {
        centers.push(cursor + size / 2)
        cursor += size + gap
      }
      const setLength = Math.max(cursor, 1)
      const largest = Math.max(...sizes)
      const smallest = Math.max(1, Math.min(...sizes) + gap)
      geometryRef.current = { course, sizes, centers, setLength, largest }

      if (engine === "loop") {
        setCopies(
          Math.min(
            MAX_COPIES,
            Math.max(1, Math.floor(course.length / setLength))
          )
        )
        return
      }

      // Launcher: enough copies of each item for as many as fit in flight.
      const inFlight = Math.ceil((course.length + largest) / smallest) + 1
      const perItem =
        flow === "random"
          ? inFlight
          : typeof flow === "number"
            ? Math.ceil(groupSize(flow) / list.length)
            : Math.ceil(inFlight / list.length) + 1
      setCopies(
        Math.max(
          1,
          Math.min(perItem, inFlight, Math.floor(MAX_NODES / list.length))
        )
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    if (firstCopyRef.current) observer.observe(firstCopyRef.current)
    for (let index = 0; index < list.length; index++) {
      const node = itemRefs.current[index * copies]
      if (node) observer.observe(node)
    }
    return () => observer.disconnect()
  }, [
    list,
    engine,
    onPath,
    closed,
    route,
    direction,
    vertical,
    viewBox,
    orient,
    gap,
    reverse,
    flow,
    copies,
  ])

  // Stop the clock while the reel is off screen, and replay on the way back in.
  React.useEffect(() => {
    const container = containerRef.current
    if (!container || typeof IntersectionObserver === "undefined") return
    const threshold = playOnView ? VIEW_THRESHOLD : 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = playOnView
          ? entry.intersectionRatio >= threshold
          : entry.isIntersecting
        if (visible && !visibleRef.current && playOnView)
          restartRef.current = true
        visibleRef.current = visible
      },
      { threshold }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [playOnView])

  React.useEffect(() => {
    if (!list.length) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const count = list.length
    let frame = 0
    let last = performance.now()

    const place = (node: HTMLDivElement, distance: number, opacity = 1) => {
      const geometry = geometryRef.current
      if (!geometry) return
      const { course } = geometry
      const [x, y] = course.pointAt(distance)
      let angle = 0
      if (motionRef.current.orient === "auto") {
        const [ax, ay] = course.pointAt(distance - 1)
        const [bx, by] = course.pointAt(distance + 1)
        angle = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI
      }
      node.style.transform = `translate3d(${x - node.offsetWidth / 2}px, ${y - node.offsetHeight / 2}px, 0) rotate(${angle}deg)`
      node.style.opacity = String(opacity)
    }

    const placeTrack = () => {
      const track = trackRef.current
      const setLength = setLengthRef.current
      if (!track || !setLength) return
      const shift = wrap(offsetRef.current, setLength)
      const along =
        direction === "left" || direction === "up" ? -shift : shift - setLength
      track.style.transform = vertical
        ? `translate3d(0, ${along}px, 0)`
        : `translate3d(${along}px, 0, 0)`
    }

    const placeLoop = () => {
      const geometry = geometryRef.current
      if (!geometry || !geometry.course.length) return
      const { course, centers, setLength } = geometry
      const stretch = course.length / (copies * setLength)
      for (let index = 0; index < count; index++) {
        for (let set = 0; set < copies; set++) {
          const node = itemRefs.current[index * copies + set]
          if (!node) continue
          const base = (set * setLength + centers[index]) * stretch
          place(node, wrap(base + offsetRef.current, course.length))
        }
      }
    }

    const stepLauncher = (move: number, elapsedMs: number) => {
      const geometry = geometryRef.current
      if (!geometry) return
      const { course, sizes } = geometry
      const state = launcherRef.current
      const settings = motionRef.current
      const exitAt = (flight: Flight) =>
        course.closed ? course.length : course.length + sizes[flight.item] / 2

      for (const flight of state.flights) flight.distance += move
      state.flights = state.flights.filter(
        (flight) => flight.distance < exitAt(flight) && flight.copy < copies
      )

      if (state.phase === "resting") {
        state.restLeft -= elapsedMs
        if (state.restLeft <= 0) {
          state.phase = "launching"
          state.countdown = 0
        }
      }

      if (state.phase === "clearing" && !state.flights.length) {
        if (settings.cycles && state.launched >= settings.cycles * count) {
          if (!settings.loop) {
            state.phase = "done"
            return
          }
          state.launched = 0
        }
        state.restLeft = settings.rest
        state.countdown = 0
        state.phase = settings.rest > 0 ? "resting" : "launching"
      }

      if (state.phase !== "launching") return
      state.countdown -= move
      for (let guard = 0; state.countdown <= 0 && guard < 50; guard++) {
        const item = state.next
        const busy = new Set(
          state.flights
            .filter((flight) => flight.item === item)
            .map((flight) => flight.copy)
        )
        let copy = 0
        while (copy < copies && busy.has(copy)) copy++
        if (copy >= copies) {
          // Every copy of this item is in flight; send it when one lands.
          state.countdown = 0
          break
        }
        const start = course.closed ? 0 : -sizes[item] / 2
        state.flights.push({ item, copy, distance: start - state.countdown })
        state.launched++
        state.next =
          settings.flow === "random"
            ? Math.floor(Math.random() * count)
            : (item + 1) % count
        let spacing = sizes[item] / 2 + settings.gap + sizes[state.next] / 2
        if (settings.flow === "random")
          spacing += Math.random() * Math.max(course.length * 0.35, 80)
        state.countdown += spacing

        if (typeof settings.flow === "number" && --state.groupLeft <= 0) {
          state.groupLeft = groupSize(settings.flow)
          state.phase = "clearing"
        }
        if (settings.cycles && state.launched >= settings.cycles * count)
          state.phase = "clearing"
        if (state.phase !== "launching") break
      }
    }

    const renderLauncher = () => {
      const geometry = geometryRef.current
      if (!geometry) return
      const { course } = geometry
      const edge = onPath && !course.closed ? motionRef.current.fadeWidth : 0
      const flying = new Set<number>()
      for (const flight of launcherRef.current.flights) {
        const index = flight.item * copies + flight.copy
        const node = itemRefs.current[index]
        if (!node) continue
        flying.add(index)
        const opacity = edge
          ? Math.min(
              1,
              Math.max(
                0,
                Math.min(flight.distance, course.length - flight.distance) /
                  edge
              )
            )
          : 1
        place(node, flight.distance, opacity)
      }
      for (let index = 0; index < count * copies; index++) {
        const node = itemRefs.current[index]
        if (node && !flying.has(index)) node.style.opacity = "0"
      }
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const elapsed = Math.min((now - last) / 1000, 0.1)
      last = now
      const settings = motionRef.current

      if (restartRef.current) {
        restartRef.current = false
        offsetRef.current = 0
        velocityRef.current = 0
        launcherRef.current = createLauncher(settings.flow, count, true)
      }

      const target =
        settings.paused || reduced.matches || !visibleRef.current
          ? 0
          : hoveredRef.current && settings.hoverSpeed !== undefined
            ? settings.hoverSpeed
            : settings.speed
      // Off screen there is nothing to see, so stop dead instead of easing.
      velocityRef.current = visibleRef.current
        ? velocityRef.current +
          (target - velocityRef.current) * (1 - Math.exp(-elapsed / EASE))
        : 0
      const move = Math.max(0, velocityRef.current * elapsed)

      if (engine === "track") {
        offsetRef.current += move
        placeTrack()
        return
      }
      if (engine === "loop") {
        offsetRef.current += move
        placeLoop()
        return
      }

      const state = launcherRef.current
      const geometry = geometryRef.current
      if (!state.warmed && geometry) {
        // Start with the course already full, as if it had always been running.
        state.warmed = true
        const endless =
          (settings.flow === "stream" || settings.flow === "random") &&
          !settings.cycles
        if (endless || reduced.matches) {
          const step = 8
          const steps = Math.min(
            2000,
            (geometry.course.length + geometry.largest) / step
          )
          for (let index = 0; index < steps; index++) stepLauncher(step, 0)
        }
      }
      stepLauncher(move, target > 0 ? elapsed * 1000 : 0)
      renderLauncher()
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [list, engine, onPath, direction, vertical, copies, route])

  // Freehand drawing, recorded in path units.
  const toPathPoint = (event: React.PointerEvent<HTMLDivElement>): Point => {
    const container = event.currentTarget
    const rect = container.getBoundingClientRect()
    const mapping = fitViewBox(
      viewBox,
      container.clientWidth,
      container.clientHeight
    )
    return [
      (event.clientX - rect.left - mapping.x) / mapping.scale,
      (event.clientY - rect.top - mapping.y) / mapping.scale,
    ]
  }

  const scaleOf = (container: HTMLDivElement) =>
    fitViewBox(viewBox, container.clientWidth, container.clientHeight).scale

  const finishDrawing = (event: React.PointerEvent<HTMLDivElement>) => {
    const points = pointsRef.current
    pointsRef.current = null
    setDraft(null)
    if (!points || points.length < 2) return
    const scale = scaleOf(event.currentTarget)
    const [startX, startY] = points[0]
    const [endX, endY] = points[points.length - 1]
    const gapToStart = Math.hypot(endX - startX, endY - startY) * scale
    const loops = points.length > 8 && gapToStart < CLOSE_DISTANCE
    if (loops) points.pop()
    setRoute(toSmoothPath(points, loops))
  }

  const drawing = draft !== null
  const mask = fadeWidth
    ? `linear-gradient(${vertical ? "to bottom" : "to right"}, transparent, #000 ${fadeWidth}px, #000 calc(100% - ${fadeWidth}px), transparent)`
    : undefined

  return (
    <div
      ref={containerRef}
      data-slot="reel"
      data-direction={onPath ? undefined : direction}
      data-drawable={drawable || undefined}
      className={cn(
        "relative w-full overflow-hidden",
        (onPath || vertical) && "h-64",
        engine === "track" && !vertical && "flex items-center",
        drawable && "cursor-crosshair touch-none select-none",
        className
      )}
      style={{
        ...(!onPath && { maskImage: mask, WebkitMaskImage: mask }),
        ...(engine === "launcher" &&
          !onPath &&
          !vertical && { minHeight: crossSize }),
        ...style,
      }}
      onPointerEnter={(event) => {
        hoveredRef.current = true
        onPointerEnter?.(event)
      }}
      onPointerLeave={(event) => {
        hoveredRef.current = false
        onPointerLeave?.(event)
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (!drawable || event.defaultPrevented || event.button !== 0) return
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          // Synthetic pointers can't be captured; drawing still works.
        }
        pointsRef.current = [toPathPoint(event)]
        setDraft(toSmoothPath(pointsRef.current, false))
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        const points = pointsRef.current
        if (!points) return
        const next = toPathPoint(event)
        const [lastX, lastY] = points[points.length - 1]
        const step =
          Math.hypot(next[0] - lastX, next[1] - lastY) *
          scaleOf(event.currentTarget)
        if (step < DRAW_STEP) return
        points.push(next)
        setDraft(toSmoothPath(points, false))
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event)
        if (pointsRef.current) finishDrawing(event)
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        pointsRef.current = null
        setDraft(null)
      }}
      {...props}
    >
      {(onPath || drawable) && (
        <svg
          aria-hidden
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {onPath && (
            <path
              ref={pathRef}
              d={route}
              strokeWidth={showPath ? 1.5 : 0}
              strokeDasharray="4 6"
              vectorEffect="non-scaling-stroke"
              opacity={drawing ? 0.15 : 0.35}
            />
          )}
          {drawing && (
            <path
              d={draft}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              opacity={0.7}
            />
          )}
        </svg>
      )}

      {engine === "track" ? (
        <div
          ref={trackRef}
          className={cn(
            "flex will-change-transform",
            vertical ? "w-full flex-col" : "w-max"
          )}
        >
          {Array.from({ length: copies }, (_, set) => (
            <div
              key={set}
              ref={set === 0 ? firstCopyRef : undefined}
              aria-hidden={set > 0 || undefined}
              className={cn(
                "flex shrink-0 items-center",
                vertical && "flex-col"
              )}
              style={{
                gap,
                [vertical ? "paddingBottom" : "paddingRight"]: gap,
              }}
            >
              {list.map((item, index) => (
                <div key={index} className={cn("shrink-0", itemClassName)}>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        list.map((item, index) =>
          Array.from({ length: copies }, (_, copy) => (
            <div
              key={`${index}-${copy}`}
              ref={(element) => {
                itemRefs.current[index * copies + copy] = element
              }}
              aria-hidden={copy > 0 || undefined}
              className={cn(
                "pointer-events-auto absolute top-0 left-0 w-max will-change-transform",
                itemClassName
              )}
              style={{ opacity: 0 }}
            >
              {item}
            </div>
          ))
        )
      )}
    </div>
  )
}

export {
  Reel,
  type ReelDirection,
  type ReelFlow,
  type ReelOrient,
  type ReelProps,
}
