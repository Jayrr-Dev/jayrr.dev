"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

type TutorialPoint = { x: number; y: number }

/**
 * Something on screen to point at: a ref, an element, a point in viewport
 * pixels, or a function returning one. It is read again every frame, so the
 * guide follows targets that move, scroll or resize.
 */
type TutorialTarget =
  | React.RefObject<Element | null>
  | Element
  | TutorialPoint
  | (() => Element | DOMRect | TutorialPoint | null | undefined)
  | null
  | undefined

const tutorialGestures = ["tap", "drag"] as const

type TutorialGesture = (typeof tutorialGestures)[number]

const tutorialDevices = ["auto", "mouse", "touch"] as const

type TutorialDevice = (typeof tutorialDevices)[number]

/** Drag paths shorter than this, in px, aren't worth drawing. */
const MIN_PATH = 24

/** The target's box on screen, or null when it isn't there or isn't rendered. */
function resolvesTargetRect(target: TutorialTarget): DOMRect | null {
  if (!target) return null
  const value =
    typeof target === "function"
      ? target()
      : "current" in target
        ? target.current
        : target
  if (!value) return null
  if (value instanceof DOMRect) return value
  if (value instanceof Element) {
    const rect = value.getBoundingClientRect()
    // Hidden elements report an empty box at the top-left corner
    return rect.width === 0 && rect.height === 0 ? null : rect
  }
  return new DOMRect(value.x, value.y, 0, 0)
}

const middleOf = (rect: DOMRect): TutorialPoint => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
})

/** Where the line from `from` toward the middle of `rect` (grown by `pad`) crosses its edge. */
function edgePoint(rect: DOMRect, from: TutorialPoint, pad: number) {
  const c = middleOf(rect)
  const dx = from.x - c.x
  const dy = from.y - c.y
  const hw = rect.width / 2 + pad
  const hh = rect.height / 2 + pad
  const scale = Math.min(
    dx ? hw / Math.abs(dx) : Infinity,
    dy ? hh / Math.abs(dy) : Infinity,
    1
  )
  return { x: c.x + dx * scale, y: c.y + dy * scale }
}

/** A gently curled line from a to b with an open arrowhead; `curl` bends it to one side. */
function buildsCurlyArrow(a: TutorialPoint, b: TutorialPoint, curl: number) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy) || 1
  const bend = Math.min(60, length * 0.28) * curl
  const q = {
    x: (a.x + b.x) / 2 - (dy / length) * bend,
    y: (a.y + b.y) / 2 + (dx / length) * bend,
  }
  // The head follows the curve's last tangent (control point to tip)
  const tl = Math.hypot(b.x - q.x, b.y - q.y) || 1
  const ux = (b.x - q.x) / tl
  const uy = (b.y - q.y) / tl
  const head = 8
  const wing = (sign: number) => ({
    x: b.x - ux * head - uy * head * 0.6 * sign,
    y: b.y - uy * head + ux * head * 0.6 * sign,
  })
  const [w1, w2] = [wing(1), wing(-1)]
  return {
    line: `M${a.x} ${a.y}Q${q.x} ${q.y} ${b.x} ${b.y}`,
    head: `M${w1.x} ${w1.y}L${b.x} ${b.y}L${w2.x} ${w2.y}`,
    a,
    q,
    b,
  }
}

/** Point and direction (degrees) `t` of the way along the curve a -> q -> b. */
function alongCurve(
  a: TutorialPoint,
  q: TutorialPoint,
  b: TutorialPoint,
  t: number
) {
  const u = 1 - t
  const x = u * u * a.x + 2 * u * t * q.x + t * t * b.x
  const y = u * u * a.y + 2 * u * t * q.y + t * t * b.y
  const dx = 2 * u * (q.x - a.x) + 2 * t * (b.x - q.x)
  const dy = 2 * u * (q.y - a.y) + 2 * t * (b.y - q.y)
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI }
}

const subscribesToNothing = () => () => {}

type TutorialIconGuideProps = {
  /**
   * tap: a pointer presses `target` on repeat, with a ripple where it lands.
   * drag: an arrowhead glides from `from` to `to`, trailing a smear.
   */
  gesture?: TutorialGesture
  /** What the tap presses. */
  target?: TutorialTarget
  /** Where the drag starts. The path leaves from the edge facing `to`. */
  from?: TutorialTarget
  /** Where the drag ends. */
  to?: TutorialTarget
  /** Where on `target` to press, as fractions of its box. Default the middle. */
  at?: [number, number]
  /** Mouse pointer or pointing finger. auto picks by the device's pointer. */
  device?: TutorialDevice
  /** How far the drag path bends to one side, -1 to 1. 0 is straight. */
  curl?: number
  /** Draw the drag path as marching dashes under the gliding arrow. */
  path?: boolean
  /** Copies trailing the gliding arrowhead. 0 shows the head alone. */
  trail?: number
  /** One trip along the drag path, in ms. */
  duration?: number
  /** Where the drag lands: the middle of `to`, or its edge facing `from`. */
  land?: "center" | "edge"
  /** Hides the guide without unmounting it. */
  hidden?: boolean
  className?: string
}

/**
 * Coach-mark gestures drawn over the page: a mouse pointer or finger tapping
 * a target with a press ripple, or a curved drag path with an arrowhead
 * gliding along it. Targets are tracked every frame, and the overlay never
 * takes pointer input. Reduced motion holds the tap still and draws the drag
 * as a plain arrow.
 */
function TutorialIconGuide({
  gesture = "tap",
  target,
  from,
  to,
  at = [0.5, 0.5],
  device = "auto",
  curl = -0.7,
  path = false,
  trail = 12,
  duration = 1800,
  land = "center",
  hidden = false,
  className,
}: TutorialIconGuideProps) {
  const tapRef = React.useRef<SVGGElement>(null)
  const dragRef = React.useRef<SVGGElement>(null)
  const lineRef = React.useRef<SVGPathElement>(null)
  const headRef = React.useRef<SVGPathElement>(null)
  const gliderRef = React.useRef<SVGGElement>(null)
  const mounted = React.useSyncExternalStore(
    subscribesToNothing,
    () => true,
    () => false
  )
  // Targets and options change without restarting the loop
  const latest = React.useRef({
    gesture,
    target,
    from,
    to,
    at,
    curl,
    duration,
    land,
  })
  React.useLayoutEffect(() => {
    latest.current = { gesture, target, from, to, at, curl, duration, land }
  })

  React.useEffect(() => {
    if (!mounted || hidden) return
    let frame = 0
    const still = window.matchMedia("(prefers-reduced-motion: reduce)")
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw)
      const { gesture, target, from, to, at, curl, duration, land } =
        latest.current
      const tap = tapRef.current
      const drag = dragRef.current
      const glider = gliderRef.current
      if (!tap || !drag || !glider) return

      const press = gesture === "tap" ? resolvesTargetRect(target) : null
      if (press) {
        const x = press.left + press.width * at[0]
        const y = press.top + press.height * at[1]
        tap.style.display = ""
        tap.setAttribute(
          "transform",
          `translate(${x.toFixed(1)} ${y.toFixed(1)})`
        )
      } else {
        tap.style.display = "none"
      }

      const fromRect = gesture === "drag" ? resolvesTargetRect(from) : null
      const toRect = gesture === "drag" ? resolvesTargetRect(to) : null
      let arrow: ReturnType<typeof buildsCurlyArrow> | null = null
      if (fromRect && toRect) {
        const end =
          land === "edge"
            ? edgePoint(toRect, middleOf(fromRect), 3)
            : middleOf(toRect)
        const start = edgePoint(fromRect, end, 4)
        if (Math.hypot(end.x - start.x, end.y - start.y) >= MIN_PATH) {
          arrow = buildsCurlyArrow(start, end, curl)
        }
      }
      if (!arrow) {
        drag.style.display = "none"
        glider.style.display = "none"
        return
      }
      drag.style.display = ""
      lineRef.current?.setAttribute("d", arrow.line)
      headRef.current?.setAttribute("d", arrow.head)

      if (still.matches) {
        glider.style.display = "none"
        return
      }
      glider.style.display = ""
      const ghosts = glider.children
      for (let i = 0; i < ghosts.length; i++) {
        // Each copy lags the one ahead by 30ms, close enough to blur into a smear
        const phase = (now - i * 30) / duration
        const cycle = phase - Math.floor(phase)
        // Ease in and out, so it starts gently and settles into the target
        const t = 0.5 - Math.cos(cycle * Math.PI) / 2
        const point = alongCurve(arrow.a, arrow.q, arrow.b, t)
        // The copies behind the head dim away quickly
        const linger = i === 0 ? 1 : 0.45 * (1 - i / ghosts.length) ** 2
        const fade = Math.sin(cycle * Math.PI) * linger
        ghosts[i].setAttribute("opacity", fade.toFixed(3))
        ghosts[i].setAttribute(
          "transform",
          `translate(${point.x} ${point.y}) rotate(${point.angle})`
        )
      }
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [mounted, hidden])

  if (!mounted || hidden) return null

  return createPortal(
    <>
      <style href="standard-tutorial-icon-guide" precedence="default">
        {guideStyles}
      </style>
      <svg
        aria-hidden="true"
        data-slot="tutorial-icon-guide"
        data-device={device}
        data-path={path || undefined}
        className={cn(
          "pointer-events-none fixed inset-0 z-50 size-full overflow-visible",
          className
        )}
      >
        <g
          ref={dragRef}
          data-slot="tutorial-icon-guide-path"
          style={{ display: "none" }}
        >
          <path ref={lineRef} data-slot="tutorial-icon-guide-line" />
          <path ref={headRef} data-slot="tutorial-icon-guide-head" />
        </g>
        <g
          ref={gliderRef}
          data-slot="tutorial-icon-guide-glider"
          style={{ display: "none" }}
        >
          {Array.from({ length: trail + 1 }, (_, i) => (
            <path key={i} d="M-15 -9L0 0L-15 9L-10 0Z" />
          ))}
        </g>
        <g
          ref={tapRef}
          data-slot="tutorial-icon-guide-tap"
          style={{ display: "none" }}
        >
          {/* Pressed ring, spreading from the tip once it lands */}
          <circle data-slot="tutorial-icon-guide-ripple" r={10} />
          {/* Mouse pointer, tip at the origin */}
          <g data-slot="tutorial-icon-guide-hand" data-hand="mouse">
            <path
              d="M0 0V17.5L4.3 13.6L7.2 20.2L10 19L7.2 12.6H13Z"
              transform="scale(1.2)"
            />
          </g>
          {/* Pointing hand, fingertip at the origin, tilted a little */}
          <g data-slot="tutorial-icon-guide-hand" data-hand="touch">
            <g transform="rotate(-15) scale(1.3)">
              <path d="M-2.5 15V2.5a2.5 2.5 0 0 1 5 0V10a2 2 0 0 1 4 0v0.8a2 2 0 0 1 4 0v1a1.75 1.75 0 0 1 3.5 0V19a8 8 0 0 1-8 8H3.5a6 6 0 0 1-4.8-2.4L-6.4 18a2.2 2.2 0 0 1 3.3-2.9Z" />
              <path d="M2.5 10v3.2M6.5 10.8v3M10.5 11.8v2.8" />
            </g>
          </g>
        </g>
      </svg>
    </>,
    document.body
  )
}

const guideStyles = `
[data-slot=tutorial-icon-guide]{filter:drop-shadow(0 0 1px color-mix(in oklab,var(--background) 70%,transparent))}
[data-slot=tutorial-icon-guide-path]{visibility:hidden}
[data-slot=tutorial-icon-guide][data-path] [data-slot=tutorial-icon-guide-path]{visibility:visible}
[data-slot=tutorial-icon-guide-line],[data-slot=tutorial-icon-guide-head]{fill:none;stroke:var(--foreground);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
[data-slot=tutorial-icon-guide-line]{stroke-dasharray:2 2.5;animation:tutorial-guide-march 1.1s linear infinite}
[data-slot=tutorial-icon-guide-glider] path{fill:var(--foreground);stroke:var(--foreground);stroke-width:1.5;stroke-linejoin:round}
[data-slot=tutorial-icon-guide-hand]{animation:tutorial-guide-tap 2.6s ease-in-out infinite}
[data-slot=tutorial-icon-guide-hand] path{fill:var(--background);stroke:var(--foreground);stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}
[data-slot=tutorial-icon-guide-ripple]{fill:color-mix(in oklab,var(--info) 45%,transparent);stroke:color-mix(in oklab,var(--info) 90%,transparent);stroke-width:1;opacity:0;transform-box:fill-box;transform-origin:center;animation:tutorial-guide-ripple 2.6s ease-out infinite}
[data-slot=tutorial-icon-guide][data-device=mouse] [data-hand=touch],[data-slot=tutorial-icon-guide][data-device=touch] [data-hand=mouse],[data-slot=tutorial-icon-guide][data-device=auto] [data-hand=mouse]{display:none}
@media (hover:hover) and (pointer:fine){
[data-slot=tutorial-icon-guide][data-device=auto] [data-hand=mouse]{display:inline}
[data-slot=tutorial-icon-guide][data-device=auto] [data-hand=touch]{display:none}
}
@keyframes tutorial-guide-march{to{stroke-dashoffset:-8}}
@keyframes tutorial-guide-tap{0%,100%{translate:6px 12px;scale:1}30%,42%{translate:0 0;scale:.9}65%{translate:6px 12px;scale:1}}
@keyframes tutorial-guide-ripple{0%,30%{opacity:0;scale:.3}33%{opacity:.8;scale:.4}75%,100%{opacity:0;scale:2.4}}
@media (prefers-reduced-motion:reduce){
[data-slot=tutorial-icon-guide-path]{visibility:visible}
[data-slot=tutorial-icon-guide-line],[data-slot=tutorial-icon-guide-hand]{animation:none}
[data-slot=tutorial-icon-guide-ripple]{animation:none;opacity:.6;scale:1.4}
}
`

export {
  TutorialIconGuide,
  tutorialDevices,
  tutorialGestures,
  type TutorialDevice,
  type TutorialGesture,
  type TutorialIconGuideProps,
  type TutorialPoint,
  type TutorialTarget,
}
