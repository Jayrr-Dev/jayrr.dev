"use client"

import * as React from "react"
import {
  EraserIcon,
  HighlighterIcon,
  ImageDownIcon,
  PenLineIcon,
  PencilIcon,
  Redo2Icon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react"
import { cn } from "cn"

import {
  DisplayAction,
  DisplayCopyAction,
  DisplayDownloadAction,
  DisplayFrame,
} from "@/components/standard/display-frame"

/**
 * A sketch pad in a display frame: pen, highlighter and eraser, colors and
 * sizes, undo and redo, and copy or download as SVG or PNG. Strokes are kept
 * as vectors, so the drawing stays sharp at any size.
 *
 * Built for touch: the canvas never scrolls the page, a second finger cancels
 * the stroke in progress, a quick two-finger tap undoes, and once a stylus
 * is seen, resting palms are ignored.
 *
 * <DrawDisplay title="Sketch" onStrokesChange={save} />
 * <DrawDisplay strokes={saved} readOnly background="grid" />
 */

type DrawTool = "pen" | "highlighter" | "eraser"
type DrawBackground = "paper" | "grid" | "dots" | "none"

type DrawStroke = {
  /** [x, y] in canvas pixels. */
  points: [number, number][]
  color: string
  size: number
  /** Drawn at partial opacity, like a highlighter. */
  highlight?: boolean
}

const DEFAULT_COLORS = [
  "currentColor",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
]
const DEFAULT_SIZES = [2, 5, 10]
// What currentColor becomes in a file, where there is no theme to inherit.
const EXPORT_INK = "#171717"
// A two-finger tap: both fingers down and up within this, barely moving.
const TAP_MS = 300
const TAP_SLOP = 12

const backgrounds: Record<DrawBackground, string> = {
  paper: "bg-white dark:bg-neutral-950",
  grid: "bg-white bg-[length:24px_24px] [background-image:linear-gradient(#0000000d_1px,transparent_1px),linear-gradient(90deg,#0000000d_1px,transparent_1px)] dark:bg-neutral-950 dark:[background-image:linear-gradient(#ffffff12_1px,transparent_1px),linear-gradient(90deg,#ffffff12_1px,transparent_1px)]",
  dots: "bg-white bg-[length:20px_20px] [background-image:radial-gradient(#00000026_1px,transparent_1.2px)] dark:bg-neutral-950 dark:[background-image:radial-gradient(#ffffff26_1px,transparent_1.2px)]",
  none: "",
}

const round = (value: number) => Math.round(value * 10) / 10

/** A smooth path through the points: quadratic curves between midpoints. */
function pathFor(points: [number, number][]) {
  if (points.length === 0) return ""
  const [first, ...rest] = points
  if (rest.length === 0) return `M${round(first[0])} ${round(first[1])}l0.01 0`
  let d = `M${round(first[0])} ${round(first[1])}`
  for (let index = 0; index < rest.length - 1; index++) {
    const [x, y] = rest[index]
    const [nx, ny] = rest[index + 1]
    d += `Q${round(x)} ${round(y)} ${round((x + nx) / 2)} ${round((y + ny) / 2)}`
  }
  const last = rest[rest.length - 1]
  return `${d}L${round(last[0])} ${round(last[1])}`
}

function strokeProps(stroke: DrawStroke) {
  return {
    d: pathFor(stroke.points),
    fill: "none",
    stroke: stroke.color,
    strokeWidth: stroke.highlight ? stroke.size * 3 : stroke.size,
    strokeOpacity: stroke.highlight ? 0.35 : undefined,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
}

/** Distance from p to the segment a–b. */
function distanceToSegment(
  p: [number, number],
  a: [number, number],
  b: [number, number]
) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const length = dx * dx + dy * dy
  const t = length
    ? Math.max(
        0,
        Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length)
      )
    : 0
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

function touches(stroke: DrawStroke, point: [number, number], radius: number) {
  const reach = radius + (stroke.highlight ? stroke.size * 3 : stroke.size) / 2
  const { points } = stroke
  if (points.length === 1)
    return Math.hypot(point[0] - points[0][0], point[1] - points[0][1]) <= reach
  for (let index = 1; index < points.length; index++) {
    if (distanceToSegment(point, points[index - 1], points[index]) <= reach)
      return true
  }
  return false
}

/** The drawing as a standalone SVG file. */
function toSvg(
  strokes: DrawStroke[],
  width: number,
  height: number,
  background?: string
) {
  const paths = strokes
    .map((stroke) => {
      const props = strokeProps(stroke)
      return `<path d="${props.d}" fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}"${
        props.strokeOpacity ? ` stroke-opacity="${props.strokeOpacity}"` : ""
      } stroke-linecap="round" stroke-linejoin="round"/>`
    })
    .join("")
  const fill = background
    ? `<rect width="100%" height="100%" fill="${background}"/>`
    : ""
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" color="${EXPORT_INK}">${fill}${paths}</svg>`
}

function downloadPng(
  svg: string,
  width: number,
  height: number,
  filename: string
) {
  const image = new Image()
  image.onload = () => {
    const scale = window.devicePixelRatio > 1 ? 2 : 1
    const canvas = document.createElement("canvas")
    canvas.width = width * scale
    canvas.height = height * scale
    const context = canvas.getContext("2d")
    if (!context) return
    context.scale(scale, scale)
    context.drawImage(image, 0, 0, width, height)
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, "image/png")
  }
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** A toolbar button that grows to a thumb-sized target on touch screens. */
function ToolButton({
  className,
  selected,
  ...props
}: React.ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "relative grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors outline-none select-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 pointer-coarse:size-9 [&_svg]:size-4",
        selected &&
          "bg-background text-foreground shadow-xs hover:bg-background",
        className
      )}
      {...props}
    />
  )
}

function DrawDisplay({
  className,
  strokes: strokesProp,
  defaultStrokes = [],
  onStrokesChange,
  title = "Drawing",
  height = 320,
  colors = DEFAULT_COLORS,
  sizes = DEFAULT_SIZES,
  background = "paper",
  readOnly = false,
  bare = false,
  ...props
}: Omit<React.ComponentProps<"figure">, "title" | "children"> & {
  /** Controlled strokes. */
  strokes?: DrawStroke[]
  defaultStrokes?: DrawStroke[]
  onStrokesChange?: (strokes: DrawStroke[]) => void
  title?: string
  /** CSS height of the canvas. */
  height?: number | string
  /** Swatches. "currentColor" follows the text color and exports as near-black. */
  colors?: string[]
  /** Stroke widths in pixels. */
  sizes?: number[]
  background?: DrawBackground
  /** Show the drawing without the tools. */
  readOnly?: boolean
  bare?: boolean
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultStrokes)
  const strokes = strokesProp ?? uncontrolled
  const [past, setPast] = React.useState<DrawStroke[][]>([])
  const [future, setFuture] = React.useState<DrawStroke[][]>([])

  const [tool, setTool] = React.useState<DrawTool>("pen")
  const [color, setColor] = React.useState(colors[0] ?? "currentColor")
  const [size, setSize] = React.useState(
    sizes[Math.min(1, sizes.length - 1)] ?? 4
  )
  const [draft, setDraft] = React.useState<DrawStroke | null>(null)
  const [box, setBox] = React.useState({ width: 0, height: 0 })

  const surfaceRef = React.useRef<HTMLDivElement>(null)
  // The pointer drawing right now, and the strokes before its gesture began.
  const activeRef = React.useRef<{
    id: number
    before: DrawStroke[]
    erased: DrawStroke[] | null
  } | null>(null)
  const draftRef = React.useRef<DrawStroke | null>(null)
  const penSeenRef = React.useRef(false)
  const touchesRef = React.useRef(
    new Map<number, { x: number; y: number; moved: boolean }>()
  )
  const twoFingerRef = React.useRef<{ at: number; cancelled: boolean } | null>(
    null
  )

  React.useEffect(() => {
    const node = surfaceRef.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBox({ width: Math.round(width), height: Math.round(height) })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const commit = React.useCallback(
    (next: DrawStroke[], before: DrawStroke[] = strokes) => {
      setPast((stack) => [...stack, before].slice(-100))
      setFuture([])
      if (strokesProp === undefined) setUncontrolled(next)
      onStrokesChange?.(next)
    },
    [strokes, strokesProp, onStrokesChange]
  )

  const replace = (next: DrawStroke[]) => {
    if (strokesProp === undefined) setUncontrolled(next)
    onStrokesChange?.(next)
  }

  const undo = () => {
    if (past.length === 0) return
    setPast(past.slice(0, -1))
    setFuture([strokes, ...future])
    replace(past[past.length - 1])
  }

  const redo = () => {
    if (future.length === 0) return
    setFuture(future.slice(1))
    setPast([...past, strokes])
    replace(future[0])
  }

  const clear = () => {
    if (strokes.length) commit([])
  }

  const pointFrom = (event: {
    clientX: number
    clientY: number
  }): [number, number] => {
    const rect = surfaceRef.current!.getBoundingClientRect()
    return [event.clientX - rect.left, event.clientY - rect.top]
  }

  const cancelStroke = () => {
    const active = activeRef.current
    if (active?.erased) replace(active.before)
    activeRef.current = null
    draftRef.current = null
    setDraft(null)
  }

  const erase = (point: [number, number]) => {
    const active = activeRef.current
    if (!active?.erased) return
    const radius = Math.max(size, 6)
    const remaining = active.erased.filter(
      (stroke) => !touches(stroke, point, radius)
    )
    if (remaining.length !== active.erased.length) {
      active.erased = remaining
      replace(remaining)
    }
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (readOnly) return
    if (event.pointerType === "pen") penSeenRef.current = true

    if (event.pointerType === "touch") {
      // Palms rest on the glass while a stylus writes; ignore them.
      if (penSeenRef.current) return
      touchesRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
        moved: false,
      })
      if (touchesRef.current.size === 2) {
        // A second finger means a gesture, not a stroke.
        cancelStroke()
        // Measure movement from here, not from where the first finger landed.
        touchesRef.current.forEach((tracked) => {
          tracked.moved = false
        })
        twoFingerRef.current = { at: event.timeStamp, cancelled: false }
        return
      }
      if (touchesRef.current.size > 2) {
        if (twoFingerRef.current) twoFingerRef.current.cancelled = true
        return
      }
    }

    // Holding the right button erases, whatever tool is picked.
    const rightErase = event.pointerType === "mouse" && event.button === 2
    if (event.pointerType === "mouse" && event.button !== 0 && !rightErase)
      return
    if (activeRef.current) return

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // The pointer is already gone; draw without capture.
    }
    const point = pointFrom(event)
    if (tool === "eraser" || rightErase) {
      activeRef.current = {
        id: event.pointerId,
        before: strokes,
        erased: strokes,
      }
      erase(point)
      return
    }
    activeRef.current = { id: event.pointerId, before: strokes, erased: null }
    const stroke: DrawStroke = {
      points: [point],
      color,
      size,
      highlight: tool === "highlighter" || undefined,
    }
    draftRef.current = stroke
    setDraft(stroke)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const tracked = touchesRef.current.get(event.pointerId)
    if (
      tracked &&
      Math.hypot(event.clientX - tracked.x, event.clientY - tracked.y) >
        TAP_SLOP
    ) {
      tracked.moved = true
    }

    const active = activeRef.current
    if (!active || active.id !== event.pointerId) return
    // Coalesced events keep fast strokes smooth on high-rate pens and screens.
    const samples = event.nativeEvent.getCoalescedEvents?.() ?? []
    const points = (samples.length ? samples : [event.nativeEvent]).map(
      pointFrom
    )

    if (active.erased) {
      points.forEach(erase)
      return
    }
    const current = draftRef.current
    if (!current) return
    const last = current.points[current.points.length - 1]
    const fresh = points.filter(
      (point) => Math.hypot(point[0] - last[0], point[1] - last[1]) > 0.75
    )
    if (fresh.length === 0) return
    const next = { ...current, points: [...current.points, ...fresh] }
    draftRef.current = next
    setDraft(next)
  }

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (touchesRef.current.has(event.pointerId)) {
      const tracked = touchesRef.current.get(event.pointerId)!
      touchesRef.current.delete(event.pointerId)
      const gesture = twoFingerRef.current
      if (gesture && tracked.moved) gesture.cancelled = true
      if (gesture && touchesRef.current.size === 0) {
        twoFingerRef.current = null
        if (
          !gesture.cancelled &&
          event.timeStamp - gesture.at < TAP_MS &&
          event.type === "pointerup"
        )
          undo()
        return
      }
    }

    const active = activeRef.current
    if (!active || active.id !== event.pointerId) return
    if (event.type === "pointercancel") {
      cancelStroke()
      return
    }
    activeRef.current = null
    if (active.erased) {
      if (active.erased.length !== active.before.length)
        commit(active.erased, active.before)
      return
    }
    const stroke = draftRef.current
    draftRef.current = null
    setDraft(null)
    if (stroke) commit([...active.before, stroke], active.before)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (readOnly || !(event.metaKey || event.ctrlKey)) return
    const key = event.key.toLowerCase()
    if (key === "z" && !event.shiftKey) {
      event.preventDefault()
      undo()
    } else if (key === "y" || (key === "z" && event.shiftKey)) {
      event.preventDefault()
      redo()
    }
  }

  const exportSize = { width: box.width || 800, height: box.height || 320 }
  const svg = React.useMemo(
    () =>
      toSvg(
        strokes,
        exportSize.width,
        exportSize.height,
        background === "none" ? undefined : "#ffffff"
      ),
    [strokes, exportSize.width, exportSize.height, background]
  )
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  const fileBase = title.replace(/\.[a-z0-9]+$/i, "").trim() || "drawing"
  const count = strokes.length

  const cursor = tool === "eraser" ? "cursor-cell" : "cursor-crosshair"

  return (
    <DisplayFrame
      data-kind="draw"
      bare={bare}
      icon={<PencilIcon />}
      title={title}
      meta={`${count} ${count === 1 ? "stroke" : "strokes"}`}
      onKeyDown={onKeyDown}
      actions={
        <>
          <DisplayCopyAction text={() => svg} label="Copy SVG" />
          <DisplayDownloadAction
            href={svgUrl}
            filename={`${fileBase}.svg`}
            label="Download SVG"
          />
          <DisplayAction
            label="Download PNG"
            onClick={() =>
              downloadPng(
                svg,
                exportSize.width,
                exportSize.height,
                `${fileBase}.png`
              )
            }
          >
            <ImageDownIcon />
          </DisplayAction>
        </>
      }
      toolbar={
        readOnly ? undefined : (
          <>
            <div
              role="group"
              aria-label="Tool"
              className="flex items-center gap-0.5 rounded-md bg-muted p-0.5"
            >
              <ToolButton
                selected={tool === "pen"}
                onClick={() => setTool("pen")}
                aria-label="Pen"
                title="Pen"
              >
                <PenLineIcon />
              </ToolButton>
              <ToolButton
                selected={tool === "highlighter"}
                onClick={() => setTool("highlighter")}
                aria-label="Highlighter"
                title="Highlighter"
              >
                <HighlighterIcon />
              </ToolButton>
              <ToolButton
                selected={tool === "eraser"}
                onClick={() => setTool("eraser")}
                aria-label="Eraser"
                title="Eraser"
              >
                <EraserIcon />
              </ToolButton>
            </div>

            <div
              role="radiogroup"
              aria-label="Color"
              className="flex items-center"
            >
              {colors.map((swatch) => (
                <ToolButton
                  key={swatch}
                  role="radio"
                  aria-checked={swatch === color}
                  aria-pressed={undefined}
                  aria-label={swatch === "currentColor" ? "Ink" : swatch}
                  title={swatch === "currentColor" ? "Ink" : swatch}
                  onClick={() => {
                    setColor(swatch)
                    if (tool === "eraser") setTool("pen")
                  }}
                >
                  <span
                    className={cn(
                      "size-4 rounded-full ring-offset-2 ring-offset-background pointer-coarse:size-5",
                      swatch === color && tool !== "eraser"
                        ? "ring-2 ring-foreground/70"
                        : "ring-1 ring-foreground/15"
                    )}
                    style={{
                      background:
                        swatch === "currentColor"
                          ? "var(--foreground)"
                          : swatch,
                    }}
                  />
                </ToolButton>
              ))}
            </div>

            <div
              role="radiogroup"
              aria-label="Size"
              className="flex items-center"
            >
              {sizes.map((width) => (
                <ToolButton
                  key={width}
                  role="radio"
                  aria-checked={width === size}
                  aria-pressed={undefined}
                  aria-label={`${width}px`}
                  title={`${width}px`}
                  selected={width === size}
                  onClick={() => setSize(width)}
                >
                  <span
                    className="rounded-full bg-current"
                    style={{
                      width: Math.min(width + 2, 14),
                      height: Math.min(width + 2, 14),
                    }}
                  />
                </ToolButton>
              ))}
            </div>

            <div className="ml-auto flex items-center">
              <ToolButton
                onClick={undo}
                disabled={past.length === 0}
                aria-label="Undo"
                title="Undo (two-finger tap)"
              >
                <Undo2Icon />
              </ToolButton>
              <ToolButton
                onClick={redo}
                disabled={future.length === 0}
                aria-label="Redo"
                title="Redo"
              >
                <Redo2Icon />
              </ToolButton>
              <ToolButton
                onClick={clear}
                disabled={count === 0}
                aria-label="Clear"
                title="Clear"
              >
                <Trash2Icon />
              </ToolButton>
            </div>
          </>
        )
      }
      className={className}
      {...props}
    >
      <div
        ref={surfaceRef}
        role="img"
        aria-label={`${title}, ${count} ${count === 1 ? "stroke" : "strokes"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onContextMenu={(event) => {
          if (!readOnly) event.preventDefault()
        }}
        className={cn(
          "relative overflow-hidden text-foreground",
          backgrounds[background],
          !readOnly &&
            cn(
              // Keep the page still under a finger or stylus, and skip the long-press callout.
              "touch-none overscroll-contain select-none [-webkit-touch-callout:none] [-webkit-user-select:none]",
              cursor
            )
        )}
        style={{ height }}
      >
        <svg className="absolute inset-0 size-full" aria-hidden>
          {strokes.map((stroke, index) => (
            <path key={index} {...strokeProps(stroke)} />
          ))}
          {draft ? <path {...strokeProps(draft)} /> : null}
        </svg>
        {count === 0 && !draft && !readOnly ? (
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground/70">
            Draw here
          </span>
        ) : null}
      </div>
    </DisplayFrame>
  )
}

export { DrawDisplay }
export type { DrawStroke, DrawTool, DrawBackground }
