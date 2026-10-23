"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

type TutorialPoint = { x: number; y: number }

/**
 * Something on screen to point at: a ref, an element, a point in viewport
 * pixels, or a function returning one. It is read again each time the guide
 * is placed (see `track`), so the
 * guide follows targets that move, scroll or resize.
 */
type TutorialTarget =
  | React.RefObject<Element | null>
  | Element
  | TutorialPoint
  | (() => Element | DOMRect | TutorialPoint | null | undefined)
  | null
  | undefined

/**
 * Every gesture the guide can show. Pointer gestures draw a mouse pointer or
 * a finger by device: tap is a click, double-tap a double-click, long-press a
 * click-and-hold, and context a right-click (a long-press on touch).
 */
const tutorialGestures = [
  "tap",
  "double-tap",
  "long-press",
  "context",
  "hover",
  "drag",
  "swipe",
  "scroll",
  "pinch",
  "spread",
  "rotate",
  "pull",
  "marquee",
  "keys",
] as const

type TutorialGesture = (typeof tutorialGestures)[number]

const tutorialDevices = ["auto", "mouse", "touch"] as const

type TutorialDevice = (typeof tutorialDevices)[number]

const tutorialDirections = ["up", "down", "left", "right"] as const

type TutorialDirection = (typeof tutorialDirections)[number]

/** Gestures that only exist on one kind of device draw that device's hand. */
const GESTURE_DEVICE: Partial<Record<TutorialGesture, TutorialDevice>> = {
  swipe: "touch",
  pinch: "touch",
  spread: "touch",
  rotate: "touch",
  pull: "touch",
  hover: "mouse",
  marquee: "mouse",
}

/** One loop of each gesture, in ms: long enough to read press, hold and release. */
const GESTURE_CYCLE: Record<TutorialGesture, number> = {
  tap: 2600,
  "double-tap": 2600,
  "long-press": 3000,
  context: 3000,
  hover: 3200,
  drag: 1800,
  swipe: 1600,
  scroll: 1900,
  pinch: 2200,
  spread: 2200,
  rotate: 2400,
  pull: 2400,
  marquee: 2800,
  keys: 2600,
}

/** Unit vector for each direction, in screen coordinates (y grows down). */
const DIRECTION_VECTOR: Record<TutorialDirection, TutorialPoint> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

/** Drag paths shorter than this, in px, aren't worth drawing. */
const MIN_PATH = 24
/** Room the marquee and hover outline keep around the target, in px. */
const OUTLINE_PAD = 6

/** Ancestors that clip their content (scroll areas, dialogs), found once per element. */
const clippingAncestors = new WeakMap<Element, Element[]>()

function findsClippingAncestors(element: Element) {
  let found = clippingAncestors.get(element)
  if (found) return found
  found = []
  for (
    let node = element.parentElement;
    node && node !== document.body && node !== document.documentElement;
    node = node.parentElement
  ) {
    const style = getComputedStyle(node)
    if (style.overflowX !== "visible" || style.overflowY !== "visible")
      found.push(node)
  }
  clippingAncestors.set(element, found)
  return found
}

/**
 * The part of the viewport the element can be seen through: the overlap of
 * every ancestor that clips it, or null when nothing does.
 */
function measuresClip(element: Element): DOMRect | null {
  let left = -Infinity
  let top = -Infinity
  let right = Infinity
  let bottom = Infinity
  for (const ancestor of findsClippingAncestors(element)) {
    const box = ancestor.getBoundingClientRect()
    left = Math.max(left, box.left)
    top = Math.max(top, box.top)
    right = Math.min(right, box.right)
    bottom = Math.min(bottom, box.bottom)
  }
  if (left === -Infinity && top === -Infinity) return null
  return new DOMRect(
    left,
    top,
    Math.max(0, right - left),
    Math.max(0, bottom - top)
  )
}

type ResolvedTarget = { rect: DOMRect; clip: DOMRect | null }

/**
 * The target's box on screen and the area it's visible through, or null when
 * it isn't there or isn't rendered.
 */
function resolvesTarget(target: TutorialTarget): ResolvedTarget | null {
  if (!target) return null
  const value =
    typeof target === "function"
      ? target()
      : "current" in target
        ? target.current
        : target
  if (!value) return null
  if (value instanceof DOMRect) return { rect: value, clip: null }
  if (value instanceof Element) {
    const rect = value.getBoundingClientRect()
    // Hidden elements report an empty box at the top-left corner
    if (rect.width === 0 && rect.height === 0) return null
    return { rect, clip: measuresClip(value) }
  }
  return { rect: new DOMRect(value.x, value.y, 0, 0), clip: null }
}

/** Both clips together; null (unclipped) wins, since one end of a drag is fully visible. */
function joinsClips(a: DOMRect | null, b: DOMRect | null) {
  if (!a || !b) return null
  const left = Math.min(a.left, b.left)
  const top = Math.min(a.top, b.top)
  return new DOMRect(
    left,
    top,
    Math.max(a.right, b.right) - left,
    Math.max(a.bottom, b.bottom) - top
  )
}

/** A clip-path keeping the guide inside `clip`, so it stays in the scroll area or dialog its target is in. */
function buildsClipPath(clip: DOMRect | null) {
  return clip
    ? `inset(${clip.top.toFixed(1)}px ${(window.innerWidth - clip.right).toFixed(1)}px ${(window.innerHeight - clip.bottom).toFixed(1)}px ${clip.left.toFixed(1)}px)`
    : ""
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

/** Open arrowhead wings at `tip`, pointing along the unit vector (ux, uy). */
function buildsHead(tip: TutorialPoint, ux: number, uy: number, size = 8) {
  const wing = (sign: number) => ({
    x: tip.x - ux * size - uy * size * 0.6 * sign,
    y: tip.y - uy * size + ux * size * 0.6 * sign,
  })
  const [w1, w2] = [wing(1), wing(-1)]
  return `M${w1.x} ${w1.y}L${tip.x} ${tip.y}L${w2.x} ${w2.y}`
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
  return {
    line: `M${a.x} ${a.y}Q${q.x} ${q.y} ${b.x} ${b.y}`,
    head: buildsHead(b, (b.x - q.x) / tl, (b.y - q.y) / tl),
    a,
    q,
    b,
  }
}

/** A straight arrow from a to b, line and head in one path. */
function buildsStraightArrow(a: TutorialPoint, b: TutorialPoint, size = 7) {
  const length = Math.hypot(b.x - a.x, b.y - a.y) || 1
  const ux = (b.x - a.x) / length
  const uy = (b.y - a.y) / length
  return `M${a.x} ${a.y}L${b.x} ${b.y}${buildsHead(b, ux, uy, size)}`
}

/** An arc of radius r from angle `from` to `to` (degrees, clockwise), with a head at the end. */
function buildsArcArrow(r: number, from: number, to: number) {
  const point = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180
    return { x: r * Math.cos(radians), y: r * Math.sin(radians) }
  }
  const a = point(from)
  const b = point(to)
  const sweep = to > from ? 1 : 0
  const large = Math.abs(to - from) > 180 ? 1 : 0
  // A head sized for a straight line overhangs a small circle, so it shrinks
  // with the radius
  const size = Math.min(6, r * 0.5)
  // Aimed along the chord from half a head back, not the tangent at the tip,
  // so the wings follow the curve instead of one flaring off it
  const direction = sweep ? 1 : -1
  const radians = (to * Math.PI) / 180 - (direction * size) / (2 * r)
  const ux = -Math.sin(radians) * direction
  const uy = Math.cos(radians) * direction
  return `M${a.x} ${a.y}A${r} ${r} 0 ${large} ${sweep} ${b.x} ${b.y}${buildsHead(b, ux, uy, size)}`
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

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function subscribesToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

/**
 * Where a drag is `loop` of the way through its cycle: it fades in at the
 * start, presses, carries the item along the path, lets go, and fades out.
 * Only the carry moves, so the trail only shows while carrying.
 */
function dragPose(loop: number) {
  const span = (from: number, to: number) => (loop - from) / (to - from)
  if (loop < 0.08)
    return { t: 0, scale: 1, opacity: span(0, 0.08), carrying: false }
  if (loop < 0.14)
    return {
      t: 0,
      scale: 1 - 0.1 * span(0.08, 0.14),
      opacity: 1,
      carrying: false,
    }
  if (loop < 0.7) {
    const k = span(0.14, 0.7)
    return {
      t: 0.5 - Math.cos(k * Math.PI) / 2,
      scale: 0.9,
      opacity: 1,
      carrying: true,
    }
  }
  if (loop < 0.76)
    return {
      t: 1,
      scale: 0.9 + 0.1 * span(0.7, 0.76),
      opacity: 1,
      carrying: false,
    }
  if (loop < 0.88)
    return { t: 1, scale: 1, opacity: 1 - span(0.76, 0.88), carrying: false }
  return { t: 1, scale: 1, opacity: 0, carrying: false }
}

/** Mouse pointer, tip at the origin. */
function RendersMouse() {
  return (
    <g data-slot="tutorial-actions-hand" data-hand="mouse">
      <path
        d="M0 0V17.5L4.3 13.6L7.2 20.2L10 19L7.2 12.6H13Z"
        transform="scale(1.2)"
      />
    </g>
  )
}

/** Pointing hand, fingertip at the origin, tilted a little. */
function RendersFinger() {
  return (
    <g data-slot="tutorial-actions-hand" data-hand="touch">
      <g transform="rotate(-15) scale(1.3)">
        <path d="M-2.5 15V2.5a2.5 2.5 0 0 1 5 0V10a2 2 0 0 1 4 0v0.8a2 2 0 0 1 4 0v1a1.75 1.75 0 0 1 3.5 0V19a8 8 0 0 1-8 8H3.5a6 6 0 0 1-4.8-2.4L-6.4 18a2.2 2.2 0 0 1 3.3-2.9Z" />
        <path d="M2.5 10v3.2M6.5 10.8v3M10.5 11.8v2.8" />
      </g>
    </g>
  )
}

/** The pointer for the device: a mouse pointer, a finger, or whichever fits. */
function RendersHand() {
  return (
    <>
      <RendersMouse />
      <RendersFinger />
    </>
  )
}

/** Where a finger touches the glass: a ring with a soft tinted middle. */
function RendersTouchPoint() {
  return <circle data-slot="tutorial-actions-touch" r={9} />
}

/** Fills once around the press while it's held. */
function RendersHoldRing() {
  return (
    <g transform="rotate(-90)">
      <circle data-slot="tutorial-actions-hold-track" r={17} />
      <circle data-slot="tutorial-actions-hold" r={17} pathLength={100} />
    </g>
  )
}

/** A small context menu that opens where the pointer pressed. */
function RendersMenu() {
  return (
    <g data-slot="tutorial-actions-menu" transform="translate(12 10)">
      <rect width={66} height={48} rx={5} />
      <rect
        data-slot="tutorial-actions-menu-row"
        x={4}
        y={5}
        width={58}
        height={12}
        rx={3}
      />
      <path d="M10 11H46M10 25H52M10 37H40" />
    </g>
  )
}

/** Mouse body with one button lit, beside the pointer: left for a hold, right for a right-click. */
function RendersMouseButton({ side }: { side: "left" | "right" }) {
  return (
    <g data-slot="tutorial-actions-badge" transform="translate(24 -20)">
      <rect x={-8} y={-11} width={16} height={22} rx={8} />
      <path
        data-slot="tutorial-actions-button"
        d={
          side === "right"
            ? "M0 -11A8 8 0 0 1 8 -3V-2H0Z"
            : "M0 -11A8 8 0 0 0 -8 -3V-2H0Z"
        }
      />
      <path d="M0 -11V-2M-8 -2H8" />
    </g>
  )
}

/** Width of one keycap for its label, in px. */
const keycapWidth = (label: string) => Math.max(26, label.length * 7 + 14)
/** Space between keycaps, which holds the "+" between them. */
const KEY_GAP = 16

/** Keycaps for a shortcut or held modifier, centered on the origin, pressed in order. */
function RendersKeys({ keys }: { keys: string[] }) {
  const widths = keys.map(keycapWidth)
  const total =
    widths.reduce((sum, w) => sum + w, 0) + KEY_GAP * (keys.length - 1)
  // Left edge of each keycap, the row centered on the origin
  const lefts = widths.map(
    (_, i) =>
      -total / 2 +
      widths.slice(0, i).reduce((sum, w) => sum + w, 0) +
      KEY_GAP * i
  )
  return (
    <g data-slot="tutorial-actions-keys">
      {keys.map((label, i) => {
        const left = lefts[i]
        return (
          <React.Fragment key={`${label}-${i}`}>
            {i > 0 ? (
              <path
                data-slot="tutorial-actions-plus"
                d={`M${left - KEY_GAP / 2 - 3.5} 0h7M${left - KEY_GAP / 2} -3.5v7`}
              />
            ) : null}
            <g
              data-slot="tutorial-actions-key"
              // A chord: every key is held down, and the last one is tapped while they are
              data-last={i === keys.length - 1 || undefined}
              transform={`translate(${left} -13)`}
            >
              <rect
                data-slot="tutorial-actions-key-base"
                y={3}
                width={widths[i]}
                height={26}
                rx={5}
              />
              <g data-slot="tutorial-actions-key-cap">
                <rect width={widths[i]} height={26} rx={5} />
                <text x={widths[i] / 2} y={13}>
                  {label}
                </text>
              </g>
            </g>
          </React.Fragment>
        )
      })}
    </g>
  )
}

/**
 * The finger (and its touch point) sliding along a straight track. The
 * track's arrowhead runs `lead` px past where the finger stops, or the track
 * sits `beside` px to one side, so the touch point never hides it.
 */
function RendersSlide({
  from,
  to,
  finger = true,
  lead = 14,
  beside = 0,
  upright = 0,
  flick = false,
  children,
}: {
  from: TutorialPoint
  to: TutorialPoint
  finger?: boolean
  lead?: number
  beside?: number
  /** The rotation of the group this sits in, undone for the finger so it stays upright. */
  upright?: number
  /** Accelerate and lift off early, as a swipe or scroll flick does, instead of easing to a stop. */
  flick?: boolean
  /** Drawn with the finger as it moves, like the spinner a pull drags down. */
  children?: React.ReactNode
}) {
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1
  const ux = (to.x - from.x) / length
  const uy = (to.y - from.y) / length
  // Perpendicular to the travel, for a track drawn alongside it
  const side = { x: -uy * beside, y: ux * beside }
  return (
    <>
      <path
        data-slot="tutorial-actions-track"
        data-flick={flick || undefined}
        d={buildsStraightArrow(
          { x: from.x + side.x, y: from.y + side.y },
          {
            x: to.x + ux * lead + side.x,
            y: to.y + uy * lead + side.y,
          }
        )}
      />
      <g
        data-slot="tutorial-actions-mover"
        data-flick={flick || undefined}
        style={
          {
            "--from-x": `${from.x}px`,
            "--from-y": `${from.y}px`,
            "--to-x": `${to.x}px`,
            "--to-y": `${to.y}px`,
          } as React.CSSProperties
        }
      >
        {children}
        <RendersTouchPoint />
        {finger ? (
          <g transform={upright ? `rotate(${-upright})` : undefined}>
            <RendersFinger />
          </g>
        ) : null}
      </g>
    </>
  )
}

/**
 * The scroll wheel of a mouse, turning, with chevrons for the way the view
 * scrolls. A wheel only turns up and down, so sideways scrolling holds Shift:
 * Shift with the wheel turned down scrolls right.
 */
function RendersWheel({
  direction,
  shift = true,
}: {
  direction: TutorialDirection
  /** Draw the Shift keycap sideways scrolling needs. Off when the caller already shows it. */
  shift?: boolean
}) {
  const turn = { down: 0, up: 180, left: 90, right: -90 }[direction]
  const sideways = direction === "left" || direction === "right"
  const backward = direction === "up" || direction === "left"
  return (
    <g data-slot="tutorial-actions-wheel-mouse" data-hand="mouse">
      {sideways && shift ? (
        <g data-slot="tutorial-actions-held" transform="translate(0 -36)">
          <RendersKeys keys={["Shift"]} />
        </g>
      ) : null}
      <rect x={-10} y={-15} width={20} height={30} rx={10} />
      <path d="M-10 -3H10" opacity={0.5} />
      <g data-backward={backward || undefined}>
        <path data-slot="tutorial-actions-wheel" d="M0 -11V-5" />
      </g>
      <g transform={`rotate(${turn})`}>
        <path data-slot="tutorial-actions-chevron" d="M-5 21l5 5 5-5" />
        <path data-slot="tutorial-actions-chevron" d="M-5 28l5 5 5-5" />
      </g>
    </g>
  )
}

/** A scrollbar beside the finger; its thumb moves the way the page scrolls. */
function RendersScrollbar({
  direction,
  length,
}: {
  direction: TutorialDirection
  length: number
}) {
  const vertical = direction === "up" || direction === "down"
  const forward = direction === "down" || direction === "right"
  const half = length / 2
  const thumb = Math.round(length * 0.35)
  const start = forward ? -half : half - thumb
  const end = forward ? half - thumb : -half
  // Where the thumb is when the finger lifts; it coasts the rest of the way
  const lift = start + (end - start) * 0.6
  // Beside the finger's track, on the side away from the hand
  const offset = vertical ? -30 : 34
  const along = (value: number) =>
    vertical ? `0px ${value}px` : `${value}px 0px`
  return (
    <g data-slot="tutorial-actions-scrollbar">
      <rect
        x={vertical ? offset - 3 : -half}
        y={vertical ? -half : offset - 3}
        width={vertical ? 6 : length}
        height={vertical ? length : 6}
        rx={3}
      />
      <rect
        data-slot="tutorial-actions-thumb"
        x={vertical ? offset - 2 : 0}
        y={vertical ? 0 : offset - 2}
        width={vertical ? 4 : thumb}
        height={vertical ? thumb : 4}
        rx={2}
        style={
          {
            "--thumb-from": along(start),
            "--thumb-lift": along(lift),
            "--thumb-to": along(end),
          } as React.CSSProperties
        }
      />
    </g>
  )
}

type TutorialActionsProps = {
  /**
   * The action to show. Point gestures (tap, double-tap, long-press, context,
   * hover, swipe, scroll, pinch, spread, rotate, pull, keys) sit on `target`;
   * marquee outlines it; drag runs from `from` to `to`.
   */
  gesture?: TutorialGesture
  /** What the gesture is about. */
  target?: TutorialTarget
  /** Where the drag starts. The path leaves from the edge facing `to`. */
  from?: TutorialTarget
  /** Where the drag ends. */
  to?: TutorialTarget
  /** Where on `target` the gesture sits, as fractions of its box. Default the middle. */
  at?: [number, number]
  /** Mouse pointer or finger. auto picks by the device's pointer. Touch-only and mouse-only gestures ignore it. */
  device?: TutorialDevice
  /**
   * Read by swipe and scroll only.
   * swipe: which way the finger moves. Default left.
   * scroll: which way you scroll through the page. The view moves that way,
   * so the finger and the content move the other way. Default down.
   */
  direction?: TutorialDirection
  /** Which way rotate turns. Default true. */
  clockwise?: boolean
  /**
   * layout re-places the guide when the page scrolls or resizes, when the
   * target resizes, and on a slow check (400ms). frame follows the target
   * every frame, for targets that move on their own. Drags always run every
   * frame, since the drag itself is animated there.
   */
  track?: "layout" | "frame"
  /** How far swipes, scrolls, pulls and two-finger gestures travel, in px. */
  distance?: number
  /**
   * Keycaps. For keys, the shortcut: every key held, the last one tapped.
   * For any other gesture, modifiers held down while it plays (Shift-click,
   * Alt-drag).
   */
  keys?: string[]
  /** How far the drag path bends to one side, -1 to 1. 0 is straight. */
  curl?: number
  /** Draw the drag path as marching dashes under the gliding arrow. */
  path?: boolean
  /** Copies trailing the gliding arrowhead. 0 shows the head alone. */
  trail?: number
  /** The device's hand carries the drag at the head of the trail, instead of a lone arrowhead. */
  hand?: boolean
  /** One loop of the gesture, in ms. Each gesture has its own default. */
  duration?: number
  /** Where the drag lands: the middle of `to`, or its edge facing `from`. */
  land?: "center" | "edge"
  /** Hides the guide without unmounting it. */
  hidden?: boolean
  className?: string
}

/**
 * Coach-mark gestures drawn over the page, in one thin-line style: taps,
 * double-taps, long-presses, right-clicks, hovers, swipes, scrolls, pinches,
 * spreads, rotations, pulls, drags, marquee selections and keyboard
 * shortcuts. Targets are followed as the page scrolls and resizes (or every
 * frame with `track="frame"`), and the overlay never takes
 * pointer input. Reduced motion holds each gesture in a still pose.
 */
function TutorialActions({
  gesture = "tap",
  target,
  from,
  to,
  at = [0.5, 0.5],
  device = "auto",
  direction,
  clockwise = true,
  track = "layout",
  distance = 72,
  keys,
  curl = -0.7,
  path = false,
  trail = 12,
  hand = true,
  duration,
  land = "center",
  hidden = false,
  className,
}: TutorialActionsProps) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const pointRef = React.useRef<SVGGElement>(null)
  const outlineRef = React.useRef<SVGRectElement>(null)
  const tooltipRef = React.useRef<SVGGElement>(null)
  const dragRef = React.useRef<SVGGElement>(null)
  const lineRef = React.useRef<SVGPathElement>(null)
  const headRef = React.useRef<SVGPathElement>(null)
  const gliderRef = React.useRef<SVGGElement>(null)
  const carrierRef = React.useRef<SVGGElement>(null)
  const mounted = React.useSyncExternalStore(
    subscribesToNothing,
    () => true,
    () => false
  )
  const reduced = React.useSyncExternalStore(
    subscribesToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  )
  const cycle = duration ?? GESTURE_CYCLE[gesture]
  // Targets and options change without restarting the loop
  const latest = React.useRef({
    gesture,
    target,
    from,
    to,
    at,
    curl,
    cycle,
    land,
    hand,
  })
  React.useLayoutEffect(() => {
    latest.current = {
      gesture,
      target,
      from,
      to,
      at,
      curl,
      cycle,
      land,
      hand,
    }
  })

  React.useEffect(() => {
    if (!mounted || hidden) return
    // Writes only what changed: a guide on a still target touches nothing, so
    // many guides on one page don't force a layout each per frame
    const sets = (
      node: Element | null | undefined,
      name: string,
      value: string
    ) => {
      if (node && node.getAttribute(name) !== value)
        node.setAttribute(name, value)
    }
    const shows = (node: SVGElement, on: boolean) => {
      const display = on ? "" : "none"
      if (node.style.display !== display) node.style.display = display
    }
    let clipPath = ""
    const clips = (svg: SVGSVGElement, clip: DOMRect | null) => {
      const value = buildsClipPath(clip)
      if (value !== clipPath) {
        clipPath = value
        svg.style.clipPath = value
      }
    }
    const draw = (now: number) => {
      const { gesture, target, from, to, at, curl, cycle, land, hand } =
        latest.current
      const svg = svgRef.current
      const point = pointRef.current
      const drag = dragRef.current
      const glider = gliderRef.current
      const carrier = carrierRef.current
      if (!svg || !point || !drag || !glider || !carrier) return

      const resolved = gesture === "drag" ? null : resolvesTarget(target)
      const rect = resolved?.rect
      shows(point, Boolean(rect))
      if (resolved) clips(svg, resolved.clip)
      if (rect) {
        const outline = outlineRef.current
        const w = (rect.width + OUTLINE_PAD * 2).toFixed(1)
        const h = (rect.height + OUTLINE_PAD * 2).toFixed(1)
        sets(outline, "width", w)
        sets(outline, "height", h)
        if (gesture === "marquee") {
          // From the top-left corner, so the selection grows toward the pointer
          sets(
            point,
            "transform",
            `translate(${(rect.left - OUTLINE_PAD).toFixed(1)} ${(rect.top - OUTLINE_PAD).toFixed(1)})`
          )
          for (const [name, value] of [
            ["--span-x", `${w}px`],
            ["--span-y", `${h}px`],
          ]) {
            if (point.style.getPropertyValue(name) !== value)
              point.style.setProperty(name, value)
          }
          sets(outline, "x", "0")
          sets(outline, "y", "0")
        } else {
          const x = rect.left + rect.width * at[0]
          const y = rect.top + rect.height * at[1]
          sets(point, "transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`)
          // Hover outlines the whole target around the pointer, and its
          // tooltip appears centered above it
          const top = rect.top - OUTLINE_PAD - y
          sets(outline, "x", (rect.left - OUTLINE_PAD - x).toFixed(1))
          sets(outline, "y", top.toFixed(1))
          sets(
            tooltipRef.current,
            "transform",
            `translate(${(rect.left + rect.width / 2 - x).toFixed(1)} ${(top - 6).toFixed(1)})`
          )
        }
      }

      const fromResolved = gesture === "drag" ? resolvesTarget(from) : null
      const toResolved = gesture === "drag" ? resolvesTarget(to) : null
      const fromRect = fromResolved?.rect
      const toRect = toResolved?.rect
      let arrow: ReturnType<typeof buildsCurlyArrow> | null = null
      if (fromResolved && toResolved)
        clips(svg, joinsClips(fromResolved.clip, toResolved.clip))
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
      shows(drag, Boolean(arrow))
      if (!arrow) {
        shows(glider, false)
        shows(carrier, false)
        return
      }
      sets(lineRef.current, "d", arrow.line)
      sets(headRef.current, "d", arrow.head)

      shows(carrier, hand)
      if (reduced) {
        // Held still at the start, pressing, with the path showing where to go
        shows(glider, false)
        sets(carrier, "transform", `translate(${arrow.a.x} ${arrow.a.y})`)
        sets(carrier, "opacity", "1")
        return
      }
      shows(glider, true)
      const ghosts = glider.children
      for (let i = 0; i < ghosts.length; i++) {
        // Each copy lags the one ahead by 30ms, close enough to blur into a smear
        const phase = (now - i * 30) / cycle
        const pose = dragPose(phase - Math.floor(phase))
        const at = alongCurve(arrow.a, arrow.q, arrow.b, pose.t)
        // The head follows the whole timeline; the trail behind it only
        // while carrying, dimming away quickly. The hand takes the head's place.
        const opacity =
          i === 0
            ? hand
              ? 0
              : pose.opacity
            : pose.carrying
              ? 0.45 * (1 - i / ghosts.length) ** 2
              : 0
        ghosts[i].setAttribute("opacity", opacity.toFixed(3))
        ghosts[i].setAttribute(
          "transform",
          `translate(${at.x} ${at.y}) rotate(${at.angle})`
        )
        if (i === 0) {
          carrier.setAttribute("opacity", pose.opacity.toFixed(3))
          carrier.setAttribute(
            "transform",
            `translate(${at.x} ${at.y}) scale(${pose.scale.toFixed(3)})`
          )
        }
      }
    }

    // Drags are animated here; other gestures are CSS and only need placing
    if ((gesture === "drag" && !reduced) || track === "frame") {
      let frame = 0
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop)
        draw(now)
      }
      frame = requestAnimationFrame(loop)
      return () => cancelAnimationFrame(frame)
    }
    let queued = 0
    const queue = () => {
      if (!queued)
        queued = requestAnimationFrame((now) => {
          queued = 0
          draw(now)
        })
    }
    queue()
    window.addEventListener("scroll", queue, { capture: true, passive: true })
    window.addEventListener("resize", queue)
    const resizes = new ResizeObserver(queue)
    for (const each of [
      latest.current.target,
      latest.current.from,
      latest.current.to,
    ]) {
      const value = typeof each === "function" ? each() : each
      const node =
        value instanceof Element
          ? value
          : value && typeof value === "object" && "current" in value
            ? value.current
            : null
      if (node) resizes.observe(node)
    }
    // Layout elsewhere (content loading above the target) moves it without resizing it
    const check = window.setInterval(queue, 400)
    return () => {
      cancelAnimationFrame(queued)
      window.removeEventListener("scroll", queue, { capture: true })
      window.removeEventListener("resize", queue)
      resizes.disconnect()
      window.clearInterval(check)
    }
  }, [mounted, hidden, gesture, track, reduced])

  if (!mounted || hidden) return null

  const shown = GESTURE_DEVICE[gesture] ?? device
  const half = distance / 2
  // Pull to refresh only ever pulls down
  const heading =
    gesture === "pull"
      ? "down"
      : (direction ?? (gesture === "scroll" ? "down" : "left"))
  const vector = DIRECTION_VECTOR[heading]
  // Scrolling moves the page one way and the finger the other
  const travel = gesture === "scroll" ? { x: -vector.x, y: -vector.y } : vector

  let body: React.ReactNode = null
  switch (gesture) {
    case "tap":
    case "double-tap":
      body = (
        <>
          <circle data-slot="tutorial-actions-ripple" r={10} />
          {gesture === "double-tap" ? (
            <circle data-slot="tutorial-actions-ripple" data-second="" r={10} />
          ) : null}
          <RendersHand />
        </>
      )
      break
    case "long-press":
      body = (
        <>
          {/* What a completed hold does: the target is picked up */}
          <rect ref={outlineRef} data-slot="tutorial-actions-outline" rx={6} />
          <RendersHoldRing />
          <g data-hand="mouse">
            <RendersMouseButton side="left" />
          </g>
          <RendersHand />
        </>
      )
      break
    case "context":
      body = (
        <>
          <g data-hand="mouse">
            <circle data-slot="tutorial-actions-ripple" r={10} />
            <RendersMouseButton side="right" />
            <RendersMenu />
          </g>
          <g data-hand="touch">
            <RendersHoldRing />
            <RendersMenu />
          </g>
          <RendersHand />
        </>
      )
      break
    case "hover":
      body = (
        <>
          <rect ref={outlineRef} data-slot="tutorial-actions-outline" rx={6} />
          {/* Resting on it shows what it is: what hover does that a click doesn't */}
          <g ref={tooltipRef}>
            <g data-slot="tutorial-actions-tooltip">
              <path d="M-26 -26H26A3 3 0 0 1 29 -23V-9A3 3 0 0 1 26 -6H5L0 0L-5 -6H-26A3 3 0 0 1 -29 -9V-23A3 3 0 0 1 -26 -26Z" />
              <path d="M-19 -16H13" />
            </g>
          </g>
          <RendersMouse />
        </>
      )
      break
    case "swipe":
    case "pull":
      body = (
        <>
          <RendersSlide
            from={{ x: -travel.x * half, y: -travel.y * half }}
            to={{ x: travel.x * half, y: travel.y * half }}
            flick={gesture === "swipe"}
          />
          {/* The refresh spinner comes down with the pull, just ahead of the
              finger, then stays and spins once the finger lets go. It sits on
              its own disc after the track, so the track runs under it rather
              than through the arrow. */}
          {gesture === "pull" ? (
            <g transform="translate(0 -26)">
              <g
                data-slot="tutorial-actions-spinner-ride"
                style={
                  {
                    "--from-y": `${-half}px`,
                    "--to-y": `${half}px`,
                  } as React.CSSProperties
                }
              >
                <g data-slot="tutorial-actions-spinner">
                  <circle data-slot="tutorial-actions-spinner-disc" r={14} />
                  <path d={buildsArcArrow(8, -50, 230)} />
                </g>
              </g>
            </g>
          ) : null}
        </>
      )
      break
    case "scroll":
      body = (
        <>
          <g data-hand="touch">
            <RendersScrollbar direction={heading} length={distance} />
            <RendersSlide
              from={{ x: -travel.x * half, y: -travel.y * half }}
              to={{ x: travel.x * half, y: travel.y * half }}
              flick
            />
          </g>
          <RendersWheel
            direction={heading}
            shift={!keys?.some((key) => key.toLowerCase() === "shift")}
          />
        </>
      )
      break
    case "pinch":
    case "spread": {
      const far = Math.max(half + 6, 28)
      const near = 9
      const [start, end] = gesture === "pinch" ? [far, near] : [near, far]
      // Index finger on the upper contact, the thumb's touch point below
      body = (
        <>
          {[-45, 135].map((angle) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <RendersSlide
                from={{ x: start, y: 0 }}
                to={{ x: end, y: 0 }}
                finger={angle === -45}
                upright={angle}
                lead={0}
                beside={14}
              />
            </g>
          ))}
        </>
      )
      break
    }
    case "rotate": {
      const r = Math.max(half, 22)
      body = (
        // Counter-clockwise is the clockwise turn mirrored
        <g transform={clockwise ? undefined : "scale(-1 1)"}>
          <path
            data-slot="tutorial-actions-track"
            d={buildsArcArrow(r + 14, 0, 70)}
          />
          <path
            data-slot="tutorial-actions-track"
            d={buildsArcArrow(r + 14, 180, 250)}
          />
          <g data-slot="tutorial-actions-turner">
            <g transform={`translate(${r} 0)`}>
              <RendersTouchPoint />
              {/* Undoes the turn so the hand stays upright while its fingertip circles */}
              <g data-slot="tutorial-actions-upright">
                <g transform={clockwise ? undefined : "scale(-1 1)"}>
                  <RendersFinger />
                </g>
              </g>
            </g>
            <g transform={`translate(${-r} 0)`}>
              <RendersTouchPoint />
            </g>
          </g>
        </g>
      )
      break
    }
    case "marquee":
      body = (
        <>
          <rect
            ref={outlineRef}
            data-slot="tutorial-actions-selection"
            rx={3}
          />
          <g data-slot="tutorial-actions-sweeper">
            <RendersMouse />
          </g>
        </>
      )
      break
    case "keys":
      body = <RendersKeys keys={keys?.length ? keys : ["Ctrl", "K"]} />
      break
  }
  // Modifiers held while pressing sit above the pointer (on a drag, above the hand carrying it)
  const heldKeys =
    keys?.length && gesture !== "keys" ? (
      <g data-slot="tutorial-actions-held" transform="translate(0 -46)">
        <RendersKeys keys={keys} />
      </g>
    ) : null

  return createPortal(
    <>
      <style href="standard-tutorial-actions" precedence="default">
        {guideStyles}
      </style>
      <svg
        ref={svgRef}
        aria-hidden="true"
        data-slot="tutorial-actions"
        data-gesture={gesture}
        data-device={shown}
        data-path={path || undefined}
        style={{ "--cycle": `${cycle}ms` } as React.CSSProperties}
        className={cn(
          "pointer-events-none fixed inset-0 z-50 size-full overflow-visible",
          className
        )}
      >
        <g
          ref={dragRef}
          data-slot="tutorial-actions-path"
          style={{ display: "none" }}
        >
          <path ref={lineRef} data-slot="tutorial-actions-line" />
          <path ref={headRef} data-slot="tutorial-actions-head" />
        </g>
        <g
          ref={gliderRef}
          data-slot="tutorial-actions-glider"
          style={{ display: "none" }}
        >
          {Array.from({ length: trail + 1 }, (_, i) => (
            <path key={i} d="M-11 -7L0 0L-11 7" />
          ))}
        </g>
        <g
          ref={carrierRef}
          data-slot="tutorial-actions-carrier"
          style={{ display: "none" }}
        >
          <RendersHand />
          {gesture === "drag" ? heldKeys : null}
        </g>
        <g
          ref={pointRef}
          data-slot="tutorial-actions-point"
          style={{ display: "none" }}
        >
          {body}
          {gesture === "drag" ? null : heldKeys}
        </g>
      </svg>
    </>,
    document.body
  )
}

/*
 * Timing: every gesture loops over --cycle. Presses land at 30% (tap) or
 * 14% (holds); travel runs 12% to 60%, then everything fades by 78% so the
 * loop restarts from nothing instead of jumping.
 */
const guideStyles = `
[data-slot=tutorial-actions]{--actions-ink:var(--foreground);--actions-paper:var(--background);--actions-accent:var(--info)}
[data-slot=tutorial-actions] *{animation-duration:var(--cycle);animation-iteration-count:infinite;animation-timing-function:ease-in-out}
[data-slot=tutorial-actions-path]{visibility:hidden}
[data-slot=tutorial-actions][data-path] [data-slot=tutorial-actions-path]{visibility:visible}
[data-slot=tutorial-actions-line],[data-slot=tutorial-actions-head],[data-slot=tutorial-actions-track],[data-slot=tutorial-actions-plus],[data-slot=tutorial-actions-spinner] path,[data-slot=tutorial-actions-chevron]{fill:none;stroke:var(--actions-ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
[data-slot=tutorial-actions-line]{stroke-dasharray:2 2.5;animation:tutorial-actions-march 1.1s linear infinite}
[data-slot=tutorial-actions-glider] path{fill:none;stroke:var(--actions-ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
[data-slot=tutorial-actions-hand] path{fill:var(--actions-paper);stroke:var(--actions-ink);stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}
[data-slot=tutorial-actions-ripple]{fill:color-mix(in oklab,var(--actions-accent) 45%,transparent);stroke:color-mix(in oklab,var(--actions-accent) 90%,transparent);stroke-width:1;opacity:0;transform-box:fill-box;transform-origin:center;animation-name:tutorial-actions-ripple;animation-timing-function:ease-out}
[data-slot=tutorial-actions-touch]{fill:color-mix(in oklab,var(--actions-accent) 30%,var(--actions-paper));stroke:var(--actions-ink);stroke-width:1.4}
[data-slot=tutorial-actions-track]{opacity:.75}

[data-slot=tutorial-actions][data-device=mouse] [data-hand=touch],[data-slot=tutorial-actions][data-device=touch] [data-hand=mouse],[data-slot=tutorial-actions][data-device=auto] [data-hand=mouse]{display:none}
@media (hover:hover) and (pointer:fine){
[data-slot=tutorial-actions][data-device=auto] [data-hand=mouse]{display:inline}
[data-slot=tutorial-actions][data-device=auto] [data-hand=touch]{display:none}
}

[data-gesture=tap] [data-slot=tutorial-actions-hand],[data-gesture=context] [data-hand=mouse][data-slot=tutorial-actions-hand]{animation-name:tutorial-actions-tap}
[data-gesture=double-tap] [data-slot=tutorial-actions-hand]{animation-name:tutorial-actions-double}
[data-gesture=double-tap] [data-slot=tutorial-actions-ripple]{animation-name:tutorial-actions-ripple-quick;animation-delay:calc(var(--cycle) * -.12)}
[data-gesture=double-tap] [data-slot=tutorial-actions-ripple][data-second]{animation-delay:calc(var(--cycle) * .02)}

[data-gesture=long-press] [data-slot=tutorial-actions-hand],[data-gesture=context] [data-hand=touch][data-slot=tutorial-actions-hand]{animation-name:tutorial-actions-hold}
[data-slot=tutorial-actions-hold-track],[data-slot=tutorial-actions-hold]{fill:none;stroke-width:1.6;stroke-linecap:round}
[data-slot=tutorial-actions-hold-track]{stroke:color-mix(in oklab,var(--actions-ink) 40%,transparent);animation-name:tutorial-actions-hold-track}
[data-slot=tutorial-actions-hold]{stroke:var(--actions-accent);stroke-dasharray:100;animation-name:tutorial-actions-hold-fill;animation-timing-function:linear}

[data-slot=tutorial-actions-menu] rect{fill:var(--actions-paper);stroke:var(--actions-ink);stroke-width:1.2}
[data-slot=tutorial-actions-menu] rect[data-slot=tutorial-actions-menu-row]{fill:color-mix(in oklab,var(--actions-accent) 25%,transparent);stroke:none}
[data-slot=tutorial-actions-menu] path{fill:none;stroke:var(--actions-ink);stroke-width:1.6;stroke-linecap:round;opacity:.7}
[data-slot=tutorial-actions-menu]{transform-box:fill-box;transform-origin:0 0;animation-name:tutorial-actions-menu-click}
[data-hand=touch] > [data-slot=tutorial-actions-menu]{animation-name:tutorial-actions-menu-hold}
[data-slot=tutorial-actions-badge] rect,[data-slot=tutorial-actions-badge] path{fill:var(--actions-paper);stroke:var(--actions-ink);stroke-width:1.2;stroke-linejoin:round}
[data-slot=tutorial-actions-badge] path[data-slot=tutorial-actions-button]{fill:color-mix(in oklab,var(--actions-accent) 45%,transparent);stroke:var(--actions-accent);stroke-width:1.2;animation-name:tutorial-actions-button}
[data-gesture=long-press] [data-slot=tutorial-actions-badge]{animation-name:tutorial-actions-badge-hold}
[data-gesture=long-press] [data-slot=tutorial-actions-badge] path[data-slot=tutorial-actions-button]{animation-name:tutorial-actions-button-hold}
[data-slot=tutorial-actions-badge]{animation-name:tutorial-actions-badge}

[data-gesture=hover] [data-slot=tutorial-actions-hand]{animation-name:tutorial-actions-hover}
[data-slot=tutorial-actions-tooltip]{transform-box:fill-box;transform-origin:50% 100%;animation-name:tutorial-actions-tip}
[data-slot=tutorial-actions-tooltip] path{fill:var(--actions-paper);stroke:var(--actions-ink);stroke-width:1.2;stroke-linejoin:round}
[data-slot=tutorial-actions-tooltip] path + path{fill:none;stroke-width:1.6;stroke-linecap:round;opacity:.7}
[data-slot=tutorial-actions-outline]{fill:color-mix(in oklab,var(--actions-accent) 10%,transparent);stroke:color-mix(in oklab,var(--actions-accent) 85%,transparent);stroke-width:1.5;animation-name:tutorial-actions-outline}

[data-slot=tutorial-actions-mover]{translate:var(--from-x) var(--from-y);animation-name:tutorial-actions-slide}
[data-slot=tutorial-actions-mover][data-flick]{animation-name:tutorial-actions-flick}
[data-slot=tutorial-actions-track]{animation-name:tutorial-actions-track}
[data-slot=tutorial-actions-track][data-flick]{animation-name:tutorial-actions-track-flick}
[data-slot=tutorial-actions-spinner]{animation-name:tutorial-actions-spin}
[data-slot=tutorial-actions-spinner-disc]{fill:var(--actions-paper);stroke:color-mix(in oklab,var(--actions-ink) 45%,transparent);stroke-width:1.2}
[data-slot=tutorial-actions-spinner-ride]{translate:0 var(--from-y);animation-name:tutorial-actions-ride}

[data-slot=tutorial-actions-wheel-mouse] > rect{fill:var(--actions-paper);stroke:var(--actions-ink);stroke-width:1.4}
[data-slot=tutorial-actions-wheel-mouse] > path{fill:none;stroke:var(--actions-ink);stroke-width:1.2}
[data-slot=tutorial-actions-wheel]{fill:none;stroke:var(--actions-accent);stroke-width:1.6;stroke-linecap:round;animation:tutorial-actions-wheel var(--cycle) ease-in infinite}
[data-backward] > [data-slot=tutorial-actions-wheel]{animation-name:tutorial-actions-wheel-back}
[data-slot=tutorial-actions-chevron]{opacity:.25;animation:tutorial-actions-chevron calc(var(--cycle) / 2) ease-in-out infinite}
[data-slot=tutorial-actions-chevron] + [data-slot=tutorial-actions-chevron]{animation-delay:calc(var(--cycle) / 8)}

[data-slot=tutorial-actions-turner]{animation-name:tutorial-actions-turn}
[data-slot=tutorial-actions-upright]{animation-name:tutorial-actions-upright}
[data-gesture=long-press] [data-slot=tutorial-actions-outline]{animation-name:tutorial-actions-outline-hold}
[data-slot=tutorial-actions-carrier] [data-slot=tutorial-actions-hand]{scale:.92}
[data-slot=tutorial-actions-scrollbar] > rect:first-child{fill:none;stroke:color-mix(in oklab,var(--actions-ink) 55%,transparent);stroke-width:1.2}
[data-slot=tutorial-actions-thumb]{fill:color-mix(in oklab,var(--actions-accent) 45%,transparent);stroke:var(--actions-accent);stroke-width:1.2;translate:var(--thumb-from);animation-name:tutorial-actions-thumb}

[data-slot=tutorial-actions-selection]{fill:color-mix(in oklab,var(--actions-accent) 12%,transparent);stroke:var(--actions-accent);stroke-width:1.2;stroke-dasharray:4 3;vector-effect:non-scaling-stroke;transform-box:fill-box;transform-origin:0 0;animation-name:tutorial-actions-select}
[data-slot=tutorial-actions-sweeper]{translate:var(--span-x) var(--span-y);animation-name:tutorial-actions-sweep}

[data-slot=tutorial-actions-key-base]{fill:var(--actions-paper);stroke:var(--actions-ink);stroke-width:1.2}
[data-slot=tutorial-actions-key-cap] rect{fill:var(--actions-paper);stroke:var(--actions-ink);stroke-width:1.2}
[data-slot=tutorial-actions-key-cap] text{fill:var(--actions-ink);font:600 11px/1 var(--font-sans,system-ui),sans-serif;text-anchor:middle;dominant-baseline:central}
[data-slot=tutorial-actions-key-cap]{animation-name:tutorial-actions-key-hold}
[data-slot=tutorial-actions-key-cap] rect{animation:inherit;animation-name:tutorial-actions-key-hold-face}
[data-last] > [data-slot=tutorial-actions-key-cap]{animation-name:tutorial-actions-key}
[data-last] > [data-slot=tutorial-actions-key-cap] rect{animation-name:tutorial-actions-key-face}
[data-slot=tutorial-actions-held] [data-slot=tutorial-actions-key-cap]{animation-name:tutorial-actions-key-hold}
[data-slot=tutorial-actions-held] [data-slot=tutorial-actions-key-cap] rect{animation-name:tutorial-actions-key-hold-face}
[data-slot=tutorial-actions-plus]{opacity:.6}
[data-slot=tutorial-actions-carrier] [data-slot=tutorial-actions-key-cap]{animation:none;translate:0 3px}
[data-slot=tutorial-actions-carrier] [data-slot=tutorial-actions-key-cap] rect{animation:none;fill:color-mix(in oklab,var(--actions-accent) 30%,var(--actions-paper))}

@keyframes tutorial-actions-march{to{stroke-dashoffset:-8}}
@keyframes tutorial-actions-tap{0%,100%{translate:6px 12px;scale:1}30%,42%{translate:0 0;scale:.9}65%{translate:6px 12px;scale:1}}
@keyframes tutorial-actions-ripple-quick{0%,30%{opacity:0;scale:.3}32%{opacity:.85;scale:.4}43%,100%{opacity:0;scale:1.9}}
@keyframes tutorial-actions-ripple{0%,30%{opacity:0;scale:.3}33%{opacity:.8;scale:.4}75%,100%{opacity:0;scale:2.4}}
@keyframes tutorial-actions-double{0%,100%{translate:6px 12px;scale:1}18%{translate:0 0;scale:.9}25%{translate:3px 6px;scale:1}32%{translate:0 0;scale:.9}40%{translate:3px 6px;scale:1}65%{translate:6px 12px;scale:1}}
@keyframes tutorial-actions-hold{0%,100%{translate:6px 12px;scale:1}14%,72%{translate:0 0;scale:.9}86%{translate:6px 12px;scale:1}}
@keyframes tutorial-actions-hold-track{0%,13%{opacity:0}16%,72%{opacity:1}80%,100%{opacity:0}}
@keyframes tutorial-actions-hold-fill{0%,14%{stroke-dashoffset:100;opacity:0}16%{opacity:1}64%{stroke-dashoffset:0;opacity:1}76%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes tutorial-actions-menu-click{0%,33%{opacity:0;scale:.85}39%,78%{opacity:1;scale:1}88%,100%{opacity:0;scale:1}}
@keyframes tutorial-actions-menu-hold{0%,63%{opacity:0;scale:.85}68%,92%{opacity:1;scale:1}98%,100%{opacity:0;scale:1}}
@keyframes tutorial-actions-badge{0%,12%{opacity:0}20%,70%{opacity:1}82%,100%{opacity:0}}
@keyframes tutorial-actions-button{0%,28%{opacity:0}31%,44%{opacity:1}50%,100%{opacity:0}}
@keyframes tutorial-actions-hover{0%{translate:34px 30px;opacity:0}12%{opacity:1}38%,80%{translate:0 0;opacity:1}92%,100%{translate:0 0;opacity:0}}
@keyframes tutorial-actions-tip{0%,50%{opacity:0;scale:.9}58%,82%{opacity:1;scale:1}92%,100%{opacity:0;scale:1}}
@keyframes tutorial-actions-outline{0%,36%{opacity:0}46%,80%{opacity:1}92%,100%{opacity:0}}
@keyframes tutorial-actions-slide{0%{translate:var(--from-x) var(--from-y);opacity:0;scale:1}12%{translate:var(--from-x) var(--from-y);opacity:1;scale:.92}60%{translate:var(--to-x) var(--to-y);opacity:1;scale:.92}66%{translate:var(--to-x) var(--to-y);opacity:1;scale:1}78%,100%{translate:var(--to-x) var(--to-y);opacity:0;scale:1}}
@keyframes tutorial-actions-flick{0%{translate:var(--from-x) var(--from-y);opacity:0;scale:1}10%{translate:var(--from-x) var(--from-y);opacity:1;scale:.92;animation-timing-function:cubic-bezier(.55,0,.85,.45)}42%{translate:var(--to-x) var(--to-y);opacity:1;scale:.92;animation-timing-function:ease-out}52%,100%{translate:var(--to-x) var(--to-y);opacity:0;scale:1.12}}
@keyframes tutorial-actions-track-flick{0%{opacity:0}10%,52%{opacity:.75}68%,100%{opacity:0}}
@keyframes tutorial-actions-badge-hold{0%,8%{opacity:0}14%,76%{opacity:1}86%,100%{opacity:0}}
@keyframes tutorial-actions-button-hold{0%,12%{opacity:0}15%,72%{opacity:1}76%,100%{opacity:0}}
@keyframes tutorial-actions-track{0%{opacity:0}10%,66%{opacity:.75}80%,100%{opacity:0}}
@keyframes tutorial-actions-ride{0%,12%{translate:0 var(--from-y)}60%,100%{translate:0 var(--to-y)}}
@keyframes tutorial-actions-spin{0%,10%{opacity:0;rotate:-180deg;scale:.4}60%{opacity:1;rotate:0deg;scale:1;animation-timing-function:linear}86%{opacity:1;rotate:360deg;scale:1}94%,100%{opacity:0;rotate:420deg;scale:1}}
@keyframes tutorial-actions-wheel{0%,16%{translate:0 0;opacity:0}20%{translate:0 0;opacity:1}38%{translate:0 5px;opacity:0}40%{translate:0 0;opacity:0}44%{translate:0 0;opacity:1}62%,100%{translate:0 5px;opacity:0}}
@keyframes tutorial-actions-wheel-back{0%,16%{translate:0 5px;opacity:0}20%{translate:0 5px;opacity:1}38%{translate:0 0;opacity:0}40%{translate:0 5px;opacity:0}44%{translate:0 5px;opacity:1}62%,100%{translate:0 0;opacity:0}}
@keyframes tutorial-actions-chevron{0%,100%{opacity:.25}40%{opacity:1}}
@keyframes tutorial-actions-thumb{0%{translate:var(--thumb-from);opacity:0}10%{translate:var(--thumb-from);opacity:1;animation-timing-function:cubic-bezier(.55,0,.85,.45)}42%{translate:var(--thumb-lift);opacity:1;animation-timing-function:cubic-bezier(.2,.6,.35,1)}78%{translate:var(--thumb-to);opacity:1}90%,100%{translate:var(--thumb-to);opacity:0}}
@keyframes tutorial-actions-upright{0%,12%{rotate:0deg}60%,100%{rotate:-70deg}}
@keyframes tutorial-actions-outline-hold{0%,62%{opacity:0}68%,88%{opacity:1}96%,100%{opacity:0}}
@keyframes tutorial-actions-turn{0%{rotate:0deg;opacity:0}12%{rotate:0deg;opacity:1}60%{rotate:70deg;opacity:1}78%,100%{rotate:70deg;opacity:0}}
@keyframes tutorial-actions-select{0%,14%{scale:0;opacity:0}16%{opacity:1}60%,74%{scale:1;opacity:1}86%,100%{scale:1;opacity:0}}
@keyframes tutorial-actions-sweep{0%{translate:0 0;opacity:0;scale:1}10%{translate:0 0;opacity:1;scale:1}14%{translate:0 0;scale:.9}60%{translate:var(--span-x) var(--span-y);scale:.9}68%,74%{translate:var(--span-x) var(--span-y);scale:1;opacity:1}86%,100%{translate:var(--span-x) var(--span-y);opacity:0;scale:1}}
@keyframes tutorial-actions-key{0%,28%{translate:0 0}32%,46%{translate:0 3px}52%,100%{translate:0 0}}
@keyframes tutorial-actions-key-face{0%,28%{fill:var(--actions-paper)}32%,46%{fill:color-mix(in oklab,var(--actions-accent) 30%,var(--actions-paper))}52%,100%{fill:var(--actions-paper)}}
@keyframes tutorial-actions-key-hold{0%,8%{translate:0 0}14%,72%{translate:0 3px}80%,100%{translate:0 0}}
@keyframes tutorial-actions-key-hold-face{0%,8%{fill:var(--actions-paper)}14%,72%{fill:color-mix(in oklab,var(--actions-accent) 30%,var(--actions-paper))}80%,100%{fill:var(--actions-paper)}}

@media (prefers-reduced-motion:reduce){
[data-slot=tutorial-actions] *{animation:none !important}
[data-slot=tutorial-actions-path]{visibility:visible}
[data-slot=tutorial-actions-ripple]{opacity:.6;scale:1.4}
[data-gesture=double-tap] [data-slot=tutorial-actions-ripple][data-second]{scale:2.2;opacity:.35}
[data-slot=tutorial-actions-hold]{stroke-dashoffset:30}
[data-slot=tutorial-actions-badge] path[data-slot=tutorial-actions-button]{opacity:1}
[data-hand=touch] > [data-slot=tutorial-actions-menu]{opacity:1}
[data-slot=tutorial-actions-chevron]{opacity:1}
[data-slot=tutorial-actions-key-cap]{translate:0 3px}
[data-slot=tutorial-actions-key-cap] rect{fill:color-mix(in oklab,var(--actions-accent) 30%,var(--actions-paper))}
}
`

export {
  TutorialActions,
  tutorialDevices,
  tutorialDirections,
  tutorialGestures,
  type TutorialDevice,
  type TutorialDirection,
  type TutorialGesture,
  type TutorialActionsProps,
  type TutorialPoint,
  type TutorialTarget,
}
