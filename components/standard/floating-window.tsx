"use client"

import * as React from "react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

/**
 * Floats any element at one of nine spots on the viewport, or on its nearest
 * positioned parent with `strategy="absolute"`. With `draggable`, the user can
 * pick it up and drop it anywhere; it snaps to the nearest of the nine spots,
 * with a dashed outline showing where it will land.
 *
 * Clicks on buttons inside still work: a drag only starts after the pointer
 * moves a few pixels, and never from a text field. When the window itself has
 * focus, the arrow keys move it one spot at a time.
 *
 * <FloatingWindow position="bottom-right">
 *   <MiniPlayer />
 * </FloatingWindow>
 * <FloatingWindow draggable defaultPosition="top-left" strategy="absolute" />
 */

const floatingWindowPositions = [
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
] as const

type FloatingWindowPosition = (typeof floatingWindowPositions)[number]

type FloatingWindowProps = Omit<React.ComponentProps<"div">, "draggable"> & {
  position?: FloatingWindowPosition
  defaultPosition?: FloatingWindowPosition
  onPositionChange?: (position: FloatingWindowPosition) => void
  /** Gap in pixels between the window and the edges it sits against. */
  offset?: number
  /** `fixed` floats over the viewport; `absolute` over the nearest positioned parent. */
  strategy?: "fixed" | "absolute"
  /** Lets the user drag the window and snap it to another spot. */
  draggable?: boolean
  /** Outline the spot the window will snap to while dragging. */
  snapPreview?: boolean
  previewClassName?: string
  /**
   * Corner rounding. Match the window's content so the focus ring follows
   * its corners.
   */
  radius?: FloatingWindowRadius
}

type FloatingWindowRadius = "none" | "md" | "lg" | "xl"

const FLOATING_WINDOW_RADIUS: Record<FloatingWindowRadius, string> = {
  none: "",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
}

/** Pointer travel before a press becomes a drag, so clicks inside still land. */
const DRAG_THRESHOLD = 4
const SNAP_TRANSITION = "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)"
const NO_DRAG_SELECTOR =
  "input, textarea, select, [contenteditable=''], [contenteditable='true'], [data-no-drag]"

type Box = { left: number; top: number; width: number; height: number }

function cellOf(position: FloatingWindowPosition) {
  const index = floatingWindowPositions.indexOf(position)
  return { row: Math.floor(index / 3), col: index % 3 }
}

function positionAt(row: number, col: number) {
  return floatingWindowPositions[row * 3 + col]
}

/** Top/left/right/bottom and a centring translate for one of the nine spots. */
function placementStyle(
  position: FloatingWindowPosition,
  offset: number
): React.CSSProperties {
  const { row, col } = cellOf(position)
  const style: React.CSSProperties = {}
  let x = "0"
  let y = "0"

  if (col === 0) style.left = offset
  else if (col === 1) {
    style.left = "50%"
    x = "-50%"
  } else style.right = offset

  if (row === 0) style.top = offset
  else if (row === 1) {
    style.top = "50%"
    y = "-50%"
  } else style.bottom = offset

  style.translate = `${x} ${y}`
  return style
}

/** The box the window floats in, in viewport coordinates. */
function containerBox(
  element: HTMLElement,
  strategy: "fixed" | "absolute"
): Box {
  if (strategy === "fixed") {
    const root = document.documentElement
    return {
      left: 0,
      top: 0,
      width: root.clientWidth,
      height: root.clientHeight,
    }
  }
  const parent = (element.offsetParent as HTMLElement | null) ?? document.body
  const rect = parent.getBoundingClientRect()
  return {
    left: rect.left + parent.clientLeft,
    top: rect.top + parent.clientTop,
    width: parent.clientWidth,
    height: parent.clientHeight,
  }
}

/** The spot whose resting place is closest to where the window is now. */
function nearestPosition(
  rect: Box,
  container: Box,
  offset: number
): FloatingWindowPosition {
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const xs = [
    container.left + offset + rect.width / 2,
    container.left + container.width / 2,
    container.left + container.width - offset - rect.width / 2,
  ]
  const ys = [
    container.top + offset + rect.height / 2,
    container.top + container.height / 2,
    container.top + container.height - offset - rect.height / 2,
  ]

  let best: FloatingWindowPosition = "center"
  let bestDistance = Infinity
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const distance = Math.hypot(xs[col] - centerX, ys[row] - centerY)
      if (distance < bestDistance) {
        bestDistance = distance
        best = positionAt(row, col)
      }
    }
  }
  return best
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

type DragSession = {
  pointerId: number
  startX: number
  startY: number
  /** Where the window sits with no transform. */
  base: DOMRect
  /** The transform it already had (mid-snap) when the press began. */
  fromX: number
  fromY: number
  container: Box
  active: boolean
  target: FloatingWindowPosition
}

function FloatingWindow({
  position: positionProp,
  defaultPosition = "bottom-right",
  onPositionChange,
  offset = 16,
  strategy = "fixed",
  draggable = false,
  snapPreview = true,
  previewClassName,
  radius = "none",
  className,
  style,
  ref,
  onPointerDown,
  onKeyDown,
  children,
  ...props
}: FloatingWindowProps) {
  const [position, setPosition] = useControllableState({
    value: positionProp,
    defaultValue: defaultPosition,
    onChange: onPositionChange,
  })
  const elementRef = React.useRef<HTMLDivElement | null>(null)
  const sessionRef = React.useRef<DragSession | null>(null)
  const settleFromRef = React.useRef<DOMRect | null>(null)
  const [settleCount, setSettleCount] = React.useState(0)
  const [preview, setPreview] = React.useState<{
    position: FloatingWindowPosition
    width: number
    height: number
  } | null>(null)

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      elementRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  /** Glide from where the window was to its (possibly new) spot. */
  const settle = React.useCallback(
    (next: FloatingWindowPosition) => {
      const element = elementRef.current
      if (!element) return
      settleFromRef.current = element.getBoundingClientRect()
      setPosition(next)
      setSettleCount((count) => count + 1)
    },
    [setPosition]
  )

  React.useLayoutEffect(() => {
    const element = elementRef.current
    const from = settleFromRef.current
    settleFromRef.current = null
    if (!element || !from) return

    element.style.transition = "none"
    element.style.transform = ""
    const to = element.getBoundingClientRect()
    const dx = from.left - to.left
    const dy = from.top - to.top
    if ((!dx && !dy) || prefersReducedMotion()) return

    element.style.transform = `translate(${dx}px, ${dy}px)`
    // Commit the start frame before turning the transition on.
    void element.offsetWidth
    element.style.transition = SNAP_TRANSITION
    element.style.transform = ""

    const clear = () => {
      element.style.transition = ""
    }
    element.addEventListener("transitionend", clear, { once: true })
    return () => element.removeEventListener("transitionend", clear)
  }, [settleCount])

  // Window listeners live for one press; these stable wrappers reach the
  // latest handlers so the listener added at pointerdown is the one removed.
  const handlersRef = React.useRef<{
    move: (event: PointerEvent) => void
    end: (event: PointerEvent) => void
  }>({ move: () => {}, end: () => {} })
  const listeners = React.useMemo(
    () => ({
      move: (event: PointerEvent) => handlersRef.current.move(event),
      end: (event: PointerEvent) => handlersRef.current.end(event),
    }),
    []
  )

  const startListening = React.useCallback(() => {
    window.addEventListener("pointermove", listeners.move)
    window.addEventListener("pointerup", listeners.end)
    window.addEventListener("pointercancel", listeners.end)
  }, [listeners])

  const stopListening = React.useCallback(() => {
    window.removeEventListener("pointermove", listeners.move)
    window.removeEventListener("pointerup", listeners.end)
    window.removeEventListener("pointercancel", listeners.end)
  }, [listeners])

  function handlePointerMove(event: PointerEvent) {
    const session = sessionRef.current
    const element = elementRef.current
    if (!session || !element || event.pointerId !== session.pointerId) return

    const dx = event.clientX - session.startX
    const dy = event.clientY - session.startY
    const { base, container } = session
    if (!session.active) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      session.active = true
      document.body.style.userSelect = "none"
      element.dataset.dragging = ""
      setPreview({
        position: session.target,
        width: base.width,
        height: base.height,
      })
    }

    const left = clamp(
      base.left + session.fromX + dx,
      container.left,
      container.left + container.width - base.width
    )
    const top = clamp(
      base.top + session.fromY + dy,
      container.top,
      container.top + container.height - base.height
    )
    element.style.transform = `translate(${left - base.left}px, ${top - base.top}px)`

    const target = nearestPosition(
      { left, top, width: base.width, height: base.height },
      container,
      offset
    )
    if (target !== session.target) {
      session.target = target
      setPreview({ position: target, width: base.width, height: base.height })
    }
  }

  function handlePointerEnd(event: PointerEvent) {
    const session = sessionRef.current
    if (!session || event.pointerId !== session.pointerId) return
    sessionRef.current = null
    stopListening()

    const element = elementRef.current
    if (!element) return
    if (!session.active) {
      // A press that interrupted a snap without dragging: finish the glide.
      if (session.fromX || session.fromY) settle(position)
      return
    }

    document.body.style.userSelect = ""
    delete element.dataset.dragging
    setPreview(null)

    // The press ended a drag, not a click on whatever is underneath.
    const swallowClick = (click: MouseEvent) => {
      click.stopPropagation()
      click.preventDefault()
    }
    window.addEventListener("click", swallowClick, {
      capture: true,
      once: true,
    })
    setTimeout(() => window.removeEventListener("click", swallowClick, true))

    settle(event.type === "pointercancel" ? position : session.target)
  }

  React.useLayoutEffect(() => {
    handlersRef.current = { move: handlePointerMove, end: handlePointerEnd }
  })

  React.useEffect(
    () => () => {
      if (sessionRef.current?.active) document.body.style.userSelect = ""
      stopListening()
    },
    [stopListening]
  )

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    onPointerDown?.(event)
    const element = elementRef.current
    if (
      !draggable ||
      event.defaultPrevented ||
      event.button !== 0 ||
      !element
    ) {
      return
    }
    if ((event.target as Element).closest(NO_DRAG_SELECTOR)) return

    // Pick up from wherever it is, including partway through a snap.
    const visual = element.getBoundingClientRect()
    element.style.transition = "none"
    element.style.transform = ""
    const base = element.getBoundingClientRect()
    const fromX = visual.left - base.left
    const fromY = visual.top - base.top
    if (fromX || fromY)
      element.style.transform = `translate(${fromX}px, ${fromY}px)`

    sessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      base,
      fromX,
      fromY,
      container: containerBox(element, strategy),
      active: false,
      target: position,
    }
    startListening()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (!draggable || event.defaultPrevented) return
    if (event.target !== event.currentTarget) return

    const { row, col } = cellOf(position)
    const moves: Record<string, [number, number]> = {
      ArrowUp: [row - 1, col],
      ArrowDown: [row + 1, col],
      ArrowLeft: [row, col - 1],
      ArrowRight: [row, col + 1],
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    const next = positionAt(clamp(move[0], 0, 2), clamp(move[1], 0, 2))
    if (next !== position) settle(next)
  }

  return (
    <>
      {preview && snapPreview ? (
        <div
          aria-hidden
          data-slot="floating-window-preview"
          className={cn(
            "pointer-events-none z-40 rounded-xl border-2 border-dashed border-foreground/25 bg-foreground/5 transition-[left,right,top,bottom,translate] duration-200 ease-out",
            previewClassName
          )}
          style={{
            position: strategy,
            width: preview.width,
            height: preview.height,
            ...placementStyle(preview.position, offset),
          }}
        />
      ) : null}
      <div
        ref={setRefs}
        data-slot="floating-window"
        data-position={position}
        data-draggable={draggable || undefined}
        tabIndex={draggable ? 0 : undefined}
        aria-roledescription={draggable ? "floating window" : undefined}
        aria-keyshortcuts={
          draggable ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : undefined
        }
        className={cn(
          "z-50 w-max max-w-[calc(100%-2rem)] outline-none",
          FLOATING_WINDOW_RADIUS[radius],
          draggable &&
            "cursor-grab touch-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[dragging]:cursor-grabbing",
          className
        )}
        style={{
          position: strategy,
          ...placementStyle(position, offset),
          ...style,
        }}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

export { FloatingWindow, floatingWindowPositions }
export type {
  FloatingWindowPosition,
  FloatingWindowProps,
  FloatingWindowRadius,
}
