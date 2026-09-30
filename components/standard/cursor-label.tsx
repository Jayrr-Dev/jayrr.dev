"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "cn"

const cursorLabelPlacements = [
  "top",
  "top-right",
  "right",
  "bottom-right",
  "bottom",
  "bottom-left",
  "left",
  "top-left",
] as const

type CursorLabelPlacement = (typeof cursorLabelPlacements)[number]

/** Pointer position in px, relative to the scope (or the viewport when `global`). */
type CursorLabelPoint = { x: number; y: number }

type CursorLabelContent =
  | React.ReactNode
  | ((point: CursorLabelPoint) => React.ReactNode)

// -1, 0 or 1 on each axis: left/center/right and top/middle/bottom.
type Direction = -1 | 0 | 1

function splitsPlacement(placement: CursorLabelPlacement): [Direction, Direction] {
  const x = placement.includes("left") ? -1 : placement.includes("right") ? 1 : 0
  const y = placement.startsWith("top") ? -1 : placement.startsWith("bottom") ? 1 : 0
  return [x, y]
}

function joinsPlacement(x: Direction, y: Direction): CursorLabelPlacement {
  const vertical = y === -1 ? "top" : y === 1 ? "bottom" : ""
  const horizontal = x === -1 ? "left" : x === 1 ? "right" : ""
  return ([vertical, horizontal].filter(Boolean).join("-") ||
    "bottom-right") as CursorLabelPlacement
}

/** Places one axis, flipping to the far side (or clamping when centered) to stay in bounds. */
function placesAxis(
  pointer: number,
  size: number,
  bound: number,
  offset: number,
  direction: Direction,
  flip: boolean
): [number, Direction] {
  let side = direction
  if (flip && side === 1 && pointer + offset + size > bound) {
    side = -1
  } else if (flip && side === -1 && pointer - offset - size < 0) {
    side = 1
  }

  if (side === 1) {
    return [pointer + offset, side]
  }
  if (side === -1) {
    return [pointer - offset - size, side]
  }
  const centered = pointer - size / 2
  return [flip ? Math.min(Math.max(centered, 0), bound - size) : centered, side]
}

function subscribesToMedia(query: string) {
  return (onChange: () => void) => {
    const media = window.matchMedia(query)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }
}

const subscribesToNothing = () => () => {}

function useMediaQuery(query: string) {
  const subscribe = React.useMemo(() => subscribesToMedia(query), [query])
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}

type CursorLabelProps = Omit<React.ComponentProps<"div">, "children" | "content"> & {
  /**
   * What follows the pointer: text, any element, or a function of the pointer
   * position. Text gets the chip style; elements render as they are.
   */
  content: CursorLabelContent
  /** Which side of the pointer the label sits on. */
  placement?: CursorLabelPlacement
  /** Gap between the pointer and the label, in px. */
  offset?: number
  /** Flip to the opposite side near an edge so the label is never cut off. */
  flip?: boolean
  /** Follow the pointer across the whole page instead of only inside `children`. */
  global?: boolean
  disabled?: boolean
  /** Classes for the label. `className` styles the scope wrapper. */
  labelClassName?: string
  children?: React.ReactNode
}

/**
 * A label that follows the pointer at a fixed side and gap. Scoped to its
 * children by default; pass `global` for the whole page. Hidden on touch
 * devices, and `aria-hidden`, so don't put anything only it can say.
 */
function CursorLabel({
  content,
  placement = "bottom-right",
  offset = 12,
  flip = true,
  global = false,
  disabled = false,
  className,
  labelClassName,
  children,
  ...props
}: CursorLabelProps) {
  const scopeRef = React.useRef<HTMLDivElement>(null)
  const labelRef = React.useRef<HTMLDivElement>(null)
  const isCoarse = useMediaQuery("(pointer: coarse)")
  const mounted = React.useSyncExternalStore(
    subscribesToNothing,
    () => true,
    () => false
  )
  const active = mounted && !disabled && !isCoarse

  const tracksPoint = typeof content === "function"
  const [point, setPoint] = React.useState<CursorLabelPoint>({ x: 0, y: 0 })

  React.useEffect(() => {
    if (!active) {
      return
    }

    const label = labelRef.current
    const target = global ? window : scopeRef.current
    if (!label || !target) {
      return
    }

    const pointer = { x: 0, y: 0 }
    const [directionX, directionY] = splitsPlacement(placement)
    let frame = 0

    const paint = () => {
      frame = 0
      const rect = global ? null : scopeRef.current?.getBoundingClientRect()
      const boundX = rect?.width ?? window.innerWidth
      const boundY = rect?.height ?? window.innerHeight
      const [x, sideX] = placesAxis(
        pointer.x,
        label.offsetWidth,
        boundX,
        offset,
        directionX,
        flip
      )
      const [y, sideY] = placesAxis(
        pointer.y,
        label.offsetHeight,
        boundY,
        offset,
        directionY,
        flip
      )
      label.style.transform = `translate3d(${x}px, ${y}px, 0)`
      label.setAttribute("data-placement", joinsPlacement(sideX, sideY))
    }

    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(paint)
      }
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return
      }
      const rect = global ? null : scopeRef.current?.getBoundingClientRect()
      pointer.x = event.clientX - (rect?.left ?? 0)
      pointer.y = event.clientY - (rect?.top ?? 0)
      label.setAttribute("data-visible", "")
      if (tracksPoint) {
        setPoint({ x: Math.round(pointer.x), y: Math.round(pointer.y) })
      }
      schedule()
    }

    const onLeave = () => label.removeAttribute("data-visible")

    // Content that changes size (a live readout) re-places itself.
    const resize = new ResizeObserver(schedule)
    resize.observe(label)

    const leaveTarget = global ? document.documentElement : target
    target.addEventListener("pointermove", onMove as EventListener)
    leaveTarget.addEventListener("pointerleave", onLeave)

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      target.removeEventListener("pointermove", onMove as EventListener)
      leaveTarget.removeEventListener("pointerleave", onLeave)
    }
  }, [active, flip, global, offset, placement, tracksPoint])

  const resolved = tracksPoint ? content(point) : content
  const isText = typeof resolved === "string" || typeof resolved === "number"

  const label = active ? (
    <div
      ref={labelRef}
      aria-hidden
      data-slot="cursor-label"
      data-placement={placement}
      className={cn(
        "pointer-events-none top-0 left-0 z-[9999] w-max opacity-0 transition-opacity duration-150 will-change-transform data-visible:opacity-100",
        global ? "fixed" : "absolute",
        isText &&
          "rounded bg-foreground px-1.5 py-0.5 font-mono text-[10px] leading-none text-background tabular-nums",
        labelClassName
      )}
    >
      {resolved}
    </div>
  ) : null

  if (global) {
    return (
      <>
        {children}
        {label ? createPortal(label, document.body) : null}
      </>
    )
  }

  return (
    <div
      ref={scopeRef}
      data-slot="cursor-label-scope"
      className={cn("relative", className)}
      {...props}
    >
      {children}
      {label}
    </div>
  )
}

export {
  CursorLabel,
  cursorLabelPlacements,
  type CursorLabelContent,
  type CursorLabelPlacement,
  type CursorLabelPoint,
  type CursorLabelProps,
}
