"use client"

import * as React from "react"
import { MinusIcon, PlusIcon, ScanIcon } from "lucide-react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

/** Where the camera sits: the screen position of world (0, 0), and the scale. */
type InfiniteCanvasView = { x: number; y: number; zoom: number }

type InfiniteCanvasItem = {
  id: string
  /** World position of the item's top-left corner. */
  x: number
  y: number
  /** Fixed size. Left out, the item is measured. */
  width?: number
  height?: number
  /** Drawn when there is no `renderItem`. */
  content?: React.ReactNode
}

type InfiniteCanvasItemState = {
  selected: boolean
  /** The item is being moved by pointer. */
  dragging: boolean
  zoom: number
}

const infiniteCanvasBackgrounds = ["dots", "grid", "lines", "none"] as const
type InfiniteCanvasBackground = (typeof infiniteCanvasBackgrounds)[number]

type InfiniteCanvasProps<T extends InfiniteCanvasItem> = Omit<
  React.ComponentProps<"div">,
  "children" | "defaultValue"
> & {
  items?: T[]
  defaultItems?: T[]
  /** Called with the updated list when an item is moved. */
  onItemsChange?: (items: T[]) => void
  renderItem?: (item: T, state: InfiniteCanvasItemState) => React.ReactNode
  /** Screen reader name for an item. Defaults to "item n". */
  getItemLabel?: (item: T) => string
  view?: InfiniteCanvasView
  /** `"fit"` frames every item once they have been measured. */
  defaultView?: InfiniteCanvasView | "fit"
  onViewChange?: (view: InfiniteCanvasView) => void
  /** Id of the selected item, or null for none. */
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelectedIdChange?: (id: string | null) => void
  minZoom?: number
  maxZoom?: number
  background?: InfiniteCanvasBackground
  /** Background spacing in world units. Also the snap step. */
  gap?: number
  /** Moved items land on the background grid. */
  snap?: boolean
  /** What a plain mouse wheel does. Pinch and ctrl + wheel always zoom. */
  wheel?: "pan" | "zoom"
  /** Zoom buttons and a fit button in the bottom-left corner. */
  controls?: boolean
  /** An overview in the bottom-right corner. Click or drag it to move. */
  minimap?: boolean
  /** Items can be selected but not moved. */
  readOnly?: boolean
  /** World-space content drawn under the items, positioned by you. */
  children?: React.ReactNode
}

type Point = { x: number; y: number }
type Size = { width: number; height: number }
type Rect = Point & Size

type Gesture =
  | { kind: "pan"; start: Point; view: InfiniteCanvasView; moved: boolean }
  | {
      kind: "item"
      id: string
      start: Point
      origin: Point
      zoom: number
      moved: boolean
    }
  | { kind: "pinch"; distance: number; mid: Point; view: InfiniteCanvasView }

const DEFAULT_VIEW: InfiniteCanvasView = { x: 0, y: 0, zoom: 1 }
/** Pointer travel, in pixels, before a press becomes a drag. */
const DRAG_THRESHOLD = 3
const FIT_PADDING = 48
const ZOOM_STEP = 1.25
const MINIMAP = { width: 176, height: 112 }
/** Never draw background marks closer together than this, in pixels. */
const MIN_BACKGROUND_STEP = 10

/** Selectors a press passes through untouched, so fields and buttons inside items keep working. */
const INTERACTIVE =
  "input, textarea, select, button, a[href], [contenteditable=''], [contenteditable='true'], [data-canvas-no-drag]"

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function zoomAround(
  view: InfiniteCanvasView,
  point: Point,
  zoom: number
): InfiniteCanvasView {
  const ratio = zoom / view.zoom
  return {
    x: point.x - (point.x - view.x) * ratio,
    y: point.y - (point.y - view.y) * ratio,
    zoom,
  }
}

function unionRects(rects: Rect[]): Rect | null {
  if (rects.length === 0) {
    return null
  }
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const rect of rects) {
    left = Math.min(left, rect.x)
    top = Math.min(top, rect.y)
    right = Math.max(right, rect.x + rect.width)
    bottom = Math.max(bottom, rect.y + rect.height)
  }
  return { x: left, y: top, width: right - left, height: bottom - top }
}

/** CSS background for the pattern, scaled and offset to follow the view. */
function backgroundStyle(
  background: InfiniteCanvasBackground,
  gap: number,
  view: InfiniteCanvasView
): React.CSSProperties {
  if (background === "none") {
    return {}
  }
  // Zoomed far out, skip marks in whole multiples so they stay on the grid.
  let step = gap * view.zoom
  while (step < MIN_BACKGROUND_STEP) {
    step *= 4
  }
  const dot = "color-mix(in oklab, var(--color-foreground) 30%, transparent)"
  const line = "color-mix(in oklab, var(--color-foreground) 8%, transparent)"
  const major = "color-mix(in oklab, var(--color-foreground) 14%, transparent)"

  if (background === "dots") {
    const radius = clamp(view.zoom * 1.2, 0.9, 1.5)
    return {
      backgroundImage: `radial-gradient(circle, ${dot} ${radius}px, transparent ${radius + 0.5}px)`,
      backgroundSize: `${step}px ${step}px`,
      backgroundPosition: `${view.x - step / 2}px ${view.y - step / 2}px`,
    }
  }
  if (background === "lines") {
    return {
      backgroundImage: `linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
      backgroundSize: `100% ${step}px`,
      backgroundPosition: `0 ${view.y}px`,
    }
  }
  const majorStep = step * 5
  return {
    backgroundImage: [
      `linear-gradient(to right, ${major} 1px, transparent 1px)`,
      `linear-gradient(to bottom, ${major} 1px, transparent 1px)`,
      `linear-gradient(to right, ${line} 1px, transparent 1px)`,
      `linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
    ].join(", "),
    backgroundSize: [majorStep, majorStep, step, step]
      .map((size) => `${size}px ${size}px`)
      .join(", "),
    backgroundPosition: `${view.x}px ${view.y}px`,
  }
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

/**
 * A pannable, zoomable surface that goes on forever in every direction.
 * Drag the background (or hold space, or use the middle button) to pan,
 * scroll to pan, pinch or ctrl + scroll to zoom at the pointer, and drag
 * items to move them. Arrow keys pan the canvas, or move the focused item.
 */
function InfiniteCanvas<T extends InfiniteCanvasItem>({
  items: itemsProp,
  defaultItems = [],
  onItemsChange,
  renderItem,
  getItemLabel,
  view: viewProp,
  defaultView = DEFAULT_VIEW,
  onViewChange,
  selectedId: selectedIdProp,
  defaultSelectedId = null,
  onSelectedIdChange,
  minZoom = 0.1,
  maxZoom = 4,
  background = "dots",
  gap = 24,
  snap = false,
  wheel = "pan",
  controls = true,
  minimap = false,
  readOnly = false,
  className,
  style,
  children,
  "aria-label": ariaLabel = "Canvas",
  ...rest
}: InfiniteCanvasProps<T>) {
  const fitsOnMount = defaultView === "fit"
  const [items, setItems] = useControllableState<T[]>({
    value: itemsProp,
    defaultValue: defaultItems,
    onChange: onItemsChange,
  })
  const [view, setView] = useControllableState<InfiniteCanvasView>({
    value: viewProp,
    defaultValue: fitsOnMount
      ? DEFAULT_VIEW
      : (defaultView as InfiniteCanvasView),
    onChange: onViewChange,
  })
  const [selectedId, setSelectedId] = useControllableState<string | null>({
    value: selectedIdProp,
    defaultValue: defaultSelectedId,
    onChange: onSelectedIdChange,
  })

  const containerRef = React.useRef<HTMLDivElement>(null)
  const [size, setSize] = React.useState<Size | null>(null)
  const [measured, setMeasured] = React.useState<Record<string, Size>>({})
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [panning, setPanning] = React.useState(false)
  const [spaceHeld, setSpaceHeld] = React.useState(false)
  const [fitted, setFitted] = React.useState(!fitsOnMount)

  // Pointer and wheel events can land faster than React renders, so they
  // read and write the latest values through refs.
  const viewRef = React.useRef(view)
  const itemsRef = React.useRef(items)
  React.useLayoutEffect(() => {
    viewRef.current = view
    itemsRef.current = items
  })

  const pointers = React.useRef(new Map<number, Point>())
  const gesture = React.useRef<Gesture | null>(null)
  const animation = React.useRef<number | null>(null)

  const stopAnimation = React.useCallback(() => {
    if (animation.current !== null) {
      cancelAnimationFrame(animation.current)
      animation.current = null
    }
  }, [])

  const commitView = React.useCallback(
    (next: InfiniteCanvasView) => {
      viewRef.current = next
      setView(next)
    },
    [setView]
  )

  const commitItems = React.useCallback(
    (next: T[]) => {
      itemsRef.current = next
      setItems(next)
    },
    [setItems]
  )

  /** Eases the camera to `target`, or jumps there when motion is reduced. */
  const animateTo = React.useCallback(
    (target: InfiniteCanvasView) => {
      stopAnimation()
      if (prefersReducedMotion()) {
        commitView(target)
        return
      }
      const from = viewRef.current
      const started = performance.now()
      const duration = 220
      const tick = (now: number) => {
        const t = Math.min(1, (now - started) / duration)
        const eased = 1 - (1 - t) ** 3
        // Interpolate zoom in log space so it feels even in both directions.
        const zoom = from.zoom * (target.zoom / from.zoom) ** eased
        commitView({
          x: from.x + (target.x - from.x) * eased,
          y: from.y + (target.y - from.y) * eased,
          zoom,
        })
        animation.current = t < 1 ? requestAnimationFrame(tick) : null
      }
      animation.current = requestAnimationFrame(tick)
    },
    [commitView, stopAnimation]
  )

  React.useEffect(() => stopAnimation, [stopAnimation])

  const clampZoom = React.useCallback(
    (zoom: number) => clamp(zoom, minZoom, maxZoom),
    [minZoom, maxZoom]
  )

  const rectOf = React.useCallback(
    (item: T): Rect => ({
      x: item.x,
      y: item.y,
      width: item.width ?? measured[item.id]?.width ?? 0,
      height: item.height ?? measured[item.id]?.height ?? 0,
    }),
    [measured]
  )

  const fitView = React.useCallback((): InfiniteCanvasView => {
    const bounds = unionRects(items.map(rectOf))
    if (!size || !bounds || size.width === 0 || size.height === 0) {
      return DEFAULT_VIEW
    }
    const zoom = clamp(
      Math.min(
        (size.width - FIT_PADDING * 2) / Math.max(bounds.width, 1),
        (size.height - FIT_PADDING * 2) / Math.max(bounds.height, 1)
      ),
      minZoom,
      Math.min(maxZoom, 1)
    )
    return {
      x: (size.width - bounds.width * zoom) / 2 - bounds.x * zoom,
      y: (size.height - bounds.height * zoom) / 2 - bounds.y * zoom,
      zoom,
    }
  }, [items, rectOf, size, minZoom, maxZoom])

  const center = React.useCallback(
    (): Point => ({ x: (size?.width ?? 0) / 2, y: (size?.height ?? 0) / 2 }),
    [size]
  )

  const zoomBy = React.useCallback(
    (factor: number) => {
      const current = viewRef.current
      animateTo(zoomAround(current, center(), clampZoom(current.zoom * factor)))
    },
    [animateTo, center, clampZoom]
  )

  // Container size, for fitting and the minimap.
  React.useLayoutEffect(() => {
    const node = containerRef.current
    if (!node) {
      return
    }
    const observer = new ResizeObserver(() => {
      setSize({ width: node.clientWidth, height: node.clientHeight })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Item sizes. offsetWidth ignores the world transform, so these are world units.
  // One shared observer; each item's ref callback observes itself and cleans up.
  const itemObserver = React.useRef<ResizeObserver | null>(null)
  const observeItem = React.useCallback((node: HTMLElement | null) => {
    if (!node) {
      return
    }
    itemObserver.current ??= new ResizeObserver((entries) => {
      setMeasured((was) => {
        let next = was
        for (const entry of entries) {
          const target = entry.target as HTMLElement
          const id = target.dataset.canvasItem
          if (!id) {
            continue
          }
          const width = target.offsetWidth
          const height = target.offsetHeight
          if (was[id]?.width === width && was[id]?.height === height) {
            continue
          }
          if (next === was) {
            next = { ...was }
          }
          next[id] = { width, height }
        }
        return next
      })
    })
    const observer = itemObserver.current
    observer.observe(node)
    return () => observer.unobserve(node)
  }, [])

  // `defaultView="fit"` frames the items once every one of them has a size.
  const everyItemSized = items.every(
    (item) =>
      (item.width !== undefined && item.height !== undefined) ||
      measured[item.id] !== undefined
  )
  const fitOnce = React.useEffectEvent(() => {
    commitView(fitView())
    setFitted(true)
  })
  React.useLayoutEffect(() => {
    if (
      !fitted &&
      size &&
      size.width > 0 &&
      size.height > 0 &&
      everyItemSized
    ) {
      // Framing needs measured layout, so it runs before paint, once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fitOnce()
    }
  }, [fitted, size, everyItemSized])

  // A plain wheel pans; ctrl + wheel (and trackpad pinch) zooms at the pointer.
  // React listens to wheel passively, so this attaches its own listener.
  const wheelOptions = React.useRef({ wheel, clampZoom, stopAnimation })
  React.useLayoutEffect(() => {
    wheelOptions.current = { wheel, clampZoom, stopAnimation }
  })
  React.useEffect(() => {
    const node = containerRef.current
    if (!node) {
      return
    }
    const onWheel = (event: WheelEvent) => {
      const options = wheelOptions.current
      event.preventDefault()
      options.stopAnimation()
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1
      const deltaX = event.deltaX * scale
      const deltaY = event.deltaY * scale
      const current = viewRef.current
      const zooms = event.ctrlKey || event.metaKey || options.wheel === "zoom"

      if (zooms) {
        const rect = node.getBoundingClientRect()
        const point = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }
        // Trackpad pinches send small deltas with ctrlKey; mouse wheels send large ones.
        const speed = event.ctrlKey ? 0.01 : 0.002
        const zoom = options.clampZoom(current.zoom * Math.exp(-deltaY * speed))
        commitView(zoomAround(current, point, zoom))
        return
      }
      // Shift + wheel scrolls sideways on a plain mouse.
      const horizontal = event.shiftKey && deltaX === 0
      commitView({
        ...current,
        x: current.x - (horizontal ? deltaY : deltaX),
        y: current.y - (horizontal ? 0 : deltaY),
      })
    }
    node.addEventListener("wheel", onWheel, { passive: false })
    return () => node.removeEventListener("wheel", onWheel)
  }, [commitView])

  // Space held anywhere pans, the way design tools do.
  React.useEffect(() => {
    const typing = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.closest(INTERACTIVE) !== null
    const onDown = (event: KeyboardEvent) => {
      if (event.key === " " && !event.repeat && !typing(event.target)) {
        const node = containerRef.current
        if (
          node &&
          (node.matches(":hover") || node.contains(document.activeElement))
        ) {
          event.preventDefault()
          setSpaceHeld(true)
        }
      }
    }
    const onUp = (event: KeyboardEvent) => {
      if (event.key === " ") {
        setSpaceHeld(false)
      }
    }
    const onBlur = () => setSpaceHeld(false)
    window.addEventListener("keydown", onDown)
    window.addEventListener("keyup", onUp)
    window.addEventListener("blur", onBlur)
    return () => {
      window.removeEventListener("keydown", onDown)
      window.removeEventListener("keyup", onUp)
      window.removeEventListener("blur", onBlur)
    }
  }, [])

  const localPoint = (event: { clientX: number; clientY: number }): Point => {
    const rect = containerRef.current!.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const startPinch = () => {
    const [a, b] = [...pointers.current.values()]
    gesture.current = {
      kind: "pinch",
      distance: Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      view: viewRef.current,
    }
    setDraggingId(null)
    setPanning(false)
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest("[data-canvas-ui]")) {
      return
    }
    const forcePan = event.button === 1 || spaceHeld
    if (!forcePan && (event.button !== 0 || target.closest(INTERACTIVE))) {
      return
    }
    stopAnimation()
    const point = localPoint(event)
    pointers.current.set(event.pointerId, point)
    event.currentTarget.setPointerCapture(event.pointerId)

    if (pointers.current.size === 2) {
      startPinch()
      return
    }
    if (pointers.current.size > 2) {
      return
    }

    const itemNode = forcePan
      ? null
      : target.closest<HTMLElement>("[data-canvas-item]")
    const item = itemNode
      ? itemsRef.current.find(
          (entry) => entry.id === itemNode.dataset.canvasItem
        )
      : undefined

    if (item) {
      event.preventDefault()
      itemNode!.focus({ preventScroll: true })
      setSelectedId(item.id)
      gesture.current = {
        kind: "item",
        id: item.id,
        start: point,
        origin: { x: item.x, y: item.y },
        zoom: viewRef.current.zoom,
        moved: false,
      }
      return
    }
    event.preventDefault()
    containerRef.current?.focus({ preventScroll: true })
    gesture.current = {
      kind: "pan",
      start: point,
      view: viewRef.current,
      moved: false,
    }
    setPanning(true)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) {
      return
    }
    const point = localPoint(event)
    pointers.current.set(event.pointerId, point)
    const active = gesture.current
    if (!active) {
      return
    }

    if (active.kind === "pinch") {
      const [a, b] = [...pointers.current.values()]
      const distance = Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1)
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      const zoom = clampZoom((active.view.zoom * distance) / active.distance)
      // Keep the world point that started under the fingers under them.
      const worldX = (active.mid.x - active.view.x) / active.view.zoom
      const worldY = (active.mid.y - active.view.y) / active.view.zoom
      commitView({ x: mid.x - worldX * zoom, y: mid.y - worldY * zoom, zoom })
      return
    }

    const dx = point.x - active.start.x
    const dy = point.y - active.start.y
    if (!active.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) {
      return
    }

    if (active.kind === "pan") {
      active.moved = true
      commitView({
        ...active.view,
        x: active.view.x + dx,
        y: active.view.y + dy,
      })
      return
    }

    if (readOnly) {
      return
    }
    if (!active.moved) {
      active.moved = true
      setDraggingId(active.id)
    }
    let x = active.origin.x + dx / active.zoom
    let y = active.origin.y + dy / active.zoom
    if (snap) {
      x = Math.round(x / gap) * gap
      y = Math.round(y / gap) * gap
    }
    const current = itemsRef.current
    const index = current.findIndex((entry) => entry.id === active.id)
    if (index === -1 || (current[index].x === x && current[index].y === y)) {
      return
    }
    const next = current.slice()
    next[index] = { ...current[index], x, y }
    commitItems(next)
  }

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(event.pointerId)) {
      return
    }
    const active = gesture.current
    if (active?.kind === "pan" && !active.moved && event.type === "pointerup") {
      // A click on empty canvas clears the selection.
      setSelectedId(null)
    }
    if (pointers.current.size === 1 && active?.kind === "pinch") {
      // One finger lifted: carry on panning with the other.
      const [point] = [...pointers.current.values()]
      gesture.current = {
        kind: "pan",
        start: point,
        view: viewRef.current,
        moved: true,
      }
      return
    }
    if (pointers.current.size === 0) {
      gesture.current = null
      setDraggingId(null)
      setPanning(false)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest("[data-canvas-ui]") || target.closest(INTERACTIVE)) {
      return
    }
    const arrows: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    }
    const arrow = arrows[event.key]
    const itemNode = target.closest<HTMLElement>("[data-canvas-item]")

    if (arrow && itemNode && !readOnly) {
      event.preventDefault()
      const step = (snap ? gap : 8) * (event.shiftKey ? 5 : 1)
      const id = itemNode.dataset.canvasItem
      commitItems(
        itemsRef.current.map((entry) => {
          if (entry.id !== id) {
            return entry
          }
          let x = entry.x + arrow.x * step
          let y = entry.y + arrow.y * step
          if (snap) {
            x = Math.round(x / gap) * gap
            y = Math.round(y / gap) * gap
          }
          return { ...entry, x, y }
        })
      )
      return
    }
    if (arrow) {
      event.preventDefault()
      const step = event.shiftKey ? 240 : 48
      const current = viewRef.current
      animateTo({
        ...current,
        x: current.x - arrow.x * step,
        y: current.y - arrow.y * step,
      })
      return
    }
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault()
      zoomBy(ZOOM_STEP)
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault()
      zoomBy(1 / ZOOM_STEP)
    } else if (event.key === "0") {
      event.preventDefault()
      animateTo(zoomAround(viewRef.current, center(), clampZoom(1)))
    } else if (event.key === "1") {
      event.preventDefault()
      animateTo(fitView())
    } else if (event.key === "Escape" && selectedId !== null) {
      event.preventDefault()
      setSelectedId(null)
      containerRef.current?.focus({ preventScroll: true })
    }
  }

  const cursor = panning
    ? "cursor-grabbing"
    : spaceHeld
      ? "cursor-grab"
      : "cursor-default"

  return (
    <div
      ref={containerRef}
      data-slot="infinite-canvas"
      role="application"
      aria-roledescription="canvas"
      aria-label={ariaLabel}
      tabIndex={0}
      className={cn(
        "relative isolate h-96 w-full touch-none overflow-hidden rounded-xl border border-border bg-background outline-none select-none focus-visible:ring-2 focus-visible:ring-ring",
        cursor,
        className
      )}
      style={{ ...backgroundStyle(background, gap, view), ...style }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
      {...rest}
    >
      <div
        data-slot="infinite-canvas-world"
        className="absolute top-0 left-0 origin-top-left"
        style={
          {
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
            visibility: fitted ? undefined : "hidden",
            "--canvas-zoom": view.zoom,
          } as React.CSSProperties
        }
      >
        {children}
        {items.map((item, index) => {
          const selected = item.id === selectedId
          const dragging = item.id === draggingId
          return (
            <div
              key={item.id}
              ref={observeItem}
              data-canvas-item={item.id}
              data-selected={selected || undefined}
              data-dragging={dragging || undefined}
              role="group"
              aria-roledescription="canvas item"
              aria-label={getItemLabel?.(item) ?? `item ${index + 1}`}
              tabIndex={0}
              onFocus={() => setSelectedId(item.id)}
              className={cn(
                "absolute rounded-lg outline-none",
                "data-selected:outline-[length:calc(2px/var(--canvas-zoom))] data-selected:outline-offset-[calc(3px/var(--canvas-zoom))] data-selected:outline-ring data-selected:outline-solid",
                !readOnly && "cursor-grab data-dragging:cursor-grabbing",
                spaceHeld && "cursor-grab"
              )}
              style={{
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
                zIndex: dragging ? 2 : selected ? 1 : undefined,
              }}
            >
              {renderItem
                ? renderItem(item, { selected, dragging, zoom: view.zoom })
                : item.content}
            </div>
          )
        })}
      </div>

      {controls && (
        <div
          data-canvas-ui
          className="absolute bottom-3 left-3 flex items-center gap-0.5 rounded-lg border border-border bg-background/90 p-0.5 shadow-sm backdrop-blur"
        >
          <CanvasButton
            aria-label="Zoom out"
            onClick={() => zoomBy(1 / ZOOM_STEP)}
          >
            <MinusIcon />
          </CanvasButton>
          <button
            type="button"
            aria-label="Reset zoom to 100%"
            onClick={() => animateTo(zoomAround(view, center(), clampZoom(1)))}
            className="h-7 min-w-12 rounded-md px-1 font-mono text-xs text-muted-foreground tabular-nums transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {Math.round(view.zoom * 100)}%
          </button>
          <CanvasButton aria-label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)}>
            <PlusIcon />
          </CanvasButton>
          <CanvasButton
            aria-label="Zoom to fit"
            onClick={() => animateTo(fitView())}
          >
            <ScanIcon />
          </CanvasButton>
        </div>
      )}

      {minimap && size && (
        <CanvasMinimap
          rects={items.map((item) => ({ ...rectOf(item), id: item.id }))}
          selectedId={selectedId}
          view={view}
          size={size}
          onMove={(world) => {
            stopAnimation()
            const current = viewRef.current
            commitView({
              ...current,
              x: size.width / 2 - world.x * current.zoom,
              y: size.height / 2 - world.y * current.zoom,
            })
          }}
        />
      )}
    </div>
  )
}

function CanvasButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&_svg]:size-3.5",
        className
      )}
      {...props}
    />
  )
}

/** An overview of the items and the visible area. Press or drag to recentre. */
function CanvasMinimap({
  rects,
  selectedId,
  view,
  size,
  onMove,
}: {
  rects: (Rect & { id: string })[]
  selectedId: string | null
  view: InfiniteCanvasView
  size: Size
  onMove: (world: Point) => void
}) {
  const visible: Rect = {
    x: -view.x / view.zoom,
    y: -view.y / view.zoom,
    width: size.width / view.zoom,
    height: size.height / view.zoom,
  }
  const bounds = unionRects([...rects, visible])!
  const pad = Math.max(bounds.width, bounds.height) * 0.05
  const world = {
    x: bounds.x - pad,
    y: bounds.y - pad,
    width: bounds.width + pad * 2,
    height: bounds.height + pad * 2,
  }
  const scale = Math.min(
    MINIMAP.width / world.width,
    MINIMAP.height / world.height
  )
  const offsetX = (MINIMAP.width - world.width * scale) / 2
  const offsetY = (MINIMAP.height - world.height * scale) / 2
  const toMap = (rect: Rect) => ({
    x: offsetX + (rect.x - world.x) * scale,
    y: offsetY + (rect.y - world.y) * scale,
    width: Math.max(rect.width * scale, 1.5),
    height: Math.max(rect.height * scale, 1.5),
  })

  // The frame of reference stays fixed during a drag, so the map doesn't slide under the pointer.
  const frame = React.useRef<{
    world: typeof world
    scale: number
    offsetX: number
    offsetY: number
  } | null>(null)

  const move = (event: React.PointerEvent<SVGSVGElement>) => {
    const reference = frame.current ?? { world, scale, offsetX, offsetY }
    const rect = event.currentTarget.getBoundingClientRect()
    onMove({
      x:
        reference.world.x +
        (event.clientX - rect.left - reference.offsetX) / reference.scale,
      y:
        reference.world.y +
        (event.clientY - rect.top - reference.offsetY) / reference.scale,
    })
  }

  const port = toMap(visible)

  return (
    <div
      data-canvas-ui
      className="absolute right-3 bottom-3 overflow-hidden rounded-lg border border-border bg-background/90 shadow-sm backdrop-blur"
    >
      <svg
        width={MINIMAP.width}
        height={MINIMAP.height}
        aria-hidden
        className="block cursor-pointer touch-none"
        onPointerDown={(event) => {
          if (event.button !== 0) {
            return
          }
          event.currentTarget.setPointerCapture(event.pointerId)
          frame.current = { world, scale, offsetX, offsetY }
          move(event)
        }}
        onPointerMove={(event) => {
          if (frame.current) {
            move(event)
          }
        }}
        onPointerUp={() => {
          frame.current = null
        }}
        onPointerCancel={() => {
          frame.current = null
        }}
      >
        {rects.map((rect) => {
          const mapped = toMap(rect)
          return (
            <rect
              key={rect.id}
              {...mapped}
              rx={1.5}
              className={
                rect.id === selectedId
                  ? "fill-ring"
                  : "fill-muted-foreground/40"
              }
            />
          )
        })}
        <rect
          {...port}
          rx={2}
          className="fill-foreground/5 stroke-foreground/60"
          strokeWidth={1}
        />
      </svg>
    </div>
  )
}

export { InfiniteCanvas, infiniteCanvasBackgrounds }
export type {
  InfiniteCanvasBackground,
  InfiniteCanvasItem,
  InfiniteCanvasItemState,
  InfiniteCanvasProps,
  InfiniteCanvasView,
}
