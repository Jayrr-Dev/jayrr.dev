"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

import { Button } from "@/components/standard/button"

type TutorialFloatPoint = { x: number; y: number }

/** A ref, an element, a viewport point, or a function returning one; read every frame. */
type TutorialFloatTarget =
  | React.RefObject<Element | null>
  | Element
  | TutorialFloatPoint
  | (() => Element | DOMRect | TutorialFloatPoint | null | undefined)
  | null
  | undefined

const tutorialFloatSides = [
  "auto",
  "left",
  "right",
  "top",
  "bottom",
  "over",
] as const

type TutorialFloatSide = (typeof tutorialFloatSides)[number]

/** Space kept between the card and the edge of its boundary, in px. */
const EDGE = 12
/** How far the card stays clear of the `avoid` point, in px. */
const AVOID_PAD = 20
/** How long the done card takes to fade out before `onDone`, in ms. */
const LEAVE_MS = 400

/** The middle of the target on screen, or null when it isn't there. */
function resolvesTargetPoint(target: TutorialFloatTarget) {
  if (!target) return null
  const value =
    typeof target === "function"
      ? target()
      : "current" in target
        ? target.current
        : target
  if (!value) return null
  const rect =
    value instanceof DOMRect
      ? value
      : value instanceof Element
        ? value.getBoundingClientRect()
        : null
  if (!rect) return value as TutorialFloatPoint
  if (rect.width === 0 && rect.height === 0) return null
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

const clamps = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(value, high))

const subscribesToNothing = () => () => {}

type TutorialFloatProps = Omit<
  React.ComponentProps<"aside">,
  "title" | "children"
> & {
  /** What the card floats beside. */
  anchor: React.RefObject<Element | null>
  /**
   * auto sits beside the anchor when there's room on either side, otherwise
   * over the top of `cover`. The others always use that side; over sits
   * inside the top of `cover`.
   */
  side?: TutorialFloatSide
  /** What the card covers when it sits over. Default the anchor. */
  cover?: React.RefObject<Element | null>
  /** Keeps the card inside this element instead of the window. */
  boundary?: React.RefObject<Element | null>
  /** A point the card slides aside to keep clear, e.g. what a Tutorial Icon Guide presses. */
  avoid?: TutorialFloatTarget
  title: React.ReactNode
  /** The instruction under the title. */
  children?: React.ReactNode
  /** Small line above the title. Default "Try it · 2 of 5" when `step` and `steps` are set. */
  eyebrow?: React.ReactNode
  /** The current step, from 1. */
  step?: number
  /** How many steps, one dot each. */
  steps?: number
  /**
   * The last card: every dot fills, Skip gives way to the done button, and it
   * fades out and calls `onDone` after `autoClose` ms.
   */
  done?: boolean
  onSkip?: () => void
  onDone?: () => void
  skipLabel?: string
  doneLabel?: string
  /** How long the done card stays, in ms. false keeps it until the button. */
  autoClose?: number | false
  /** A slow bob while it waits. */
  float?: boolean
  /** Card width in px. Beside the anchor it narrows to fit, down to `minWidth`. */
  width?: number
  /** The narrowest the card gets beside the anchor before auto moves it over. */
  minWidth?: number
  /** Space between the card and the anchor, in px. */
  gap?: number
  open?: boolean
}

/**
 * A small floating card that says what to do next in a hands-on tutorial.
 * It follows its anchor every frame: beside it when there's room, otherwise
 * over the top of what it covers, always inside its boundary, and slid aside
 * from the point it should not hide. Pair it with Tutorial Icon Guide to
 * point at the thing to press or drag.
 */
function TutorialFloat({
  anchor,
  side = "auto",
  cover,
  boundary,
  avoid,
  title,
  children,
  eyebrow,
  step,
  steps,
  done = false,
  onSkip,
  onDone,
  skipLabel = "Skip",
  doneLabel = "Got it",
  autoClose = 5000,
  float = true,
  width = 300,
  minWidth = 200,
  gap = 24,
  open = true,
  className,
  ...props
}: TutorialFloatProps) {
  const cardRef = React.useRef<HTMLElement>(null)
  const mounted = React.useSyncExternalStore(
    subscribesToNothing,
    () => true,
    () => false
  )
  const [leaving, setLeaving] = React.useState(false)
  const latest = React.useRef({ side, avoid, width, minWidth, gap, onDone })
  React.useLayoutEffect(() => {
    latest.current = { side, avoid, width, minWidth, gap, onDone }
  })

  // The done card fades out after autoClose, then closes as if its button was pressed
  React.useEffect(() => {
    if (!done || autoClose === false) return
    let close = 0
    const fade = window.setTimeout(() => {
      setLeaving(true)
      close = window.setTimeout(() => latest.current.onDone?.(), LEAVE_MS)
    }, autoClose)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(close)
      setLeaving(false)
    }
  }, [done, autoClose])

  React.useEffect(() => {
    if (!mounted || !open) return
    let frame = 0
    const place = () => {
      frame = requestAnimationFrame(place)
      const card = cardRef.current
      const target = anchor.current
      if (!card || !target) return
      const { side, avoid, width, minWidth, gap } = latest.current
      const a = target.getBoundingClientRect()
      const viewWidth = window.innerWidth
      const viewHeight = window.innerHeight
      // Off screen with its anchor, instead of pinned to the window's edge
      const visible =
        a.bottom > 0 && a.top < viewHeight && a.right > 0 && a.left < viewWidth
      card.dataset.hidden = visible ? "" : "true"
      if (!visible) delete card.dataset.placed
      if (!visible) return

      const frameRect = boundary?.current?.getBoundingClientRect()
      const b = {
        left: Math.max(0, frameRect?.left ?? 0),
        top: Math.max(0, frameRect?.top ?? 0),
        right: Math.min(viewWidth, frameRect?.right ?? viewWidth),
        bottom: Math.min(viewHeight, frameRect?.bottom ?? viewHeight),
      }
      const leftRoom = a.left - b.left - gap - EDGE
      const rightRoom = b.right - a.right - gap - EDGE
      const placement =
        side !== "auto"
          ? side
          : Math.max(leftRoom, rightRoom) >= minWidth
            ? leftRoom >= rightRoom
              ? "left"
              : "right"
            : "over"
      const room =
        placement === "left"
          ? leftRoom
          : placement === "right"
            ? rightRoom
            : b.right - b.left - EDGE * 2
      card.style.width = `${Math.round(Math.max(Math.min(width, room), Math.min(minWidth, b.right - b.left - EDGE * 2)))}px`
      const w = card.offsetWidth
      const h = card.offsetHeight

      let x: number
      let y: number
      if (placement === "left" || placement === "right") {
        x = placement === "left" ? a.left - w - gap : a.right + gap
        y = a.top + a.height / 2 - h / 2
      } else if (placement === "top" || placement === "bottom") {
        x = a.left + a.width / 2 - w / 2
        y = placement === "top" ? a.top - h - gap : a.bottom + gap
      } else {
        const c = (cover?.current ?? target).getBoundingClientRect()
        x = c.left + c.width / 2 - w / 2
        y = c.top + EDGE
      }
      const clampX = (value: number) =>
        clamps(value, b.left + EDGE, b.right - w - EDGE)
      x = clampX(x)
      y = clamps(y, b.top + EDGE, b.bottom - h - EDGE)

      // Slide aside rather than cover what the tutorial points at
      const point = resolvesTargetPoint(avoid)
      if (
        point &&
        point.x > x - AVOID_PAD &&
        point.x < x + w + AVOID_PAD &&
        point.y > y - AVOID_PAD &&
        point.y < y + h + AVOID_PAD
      ) {
        x = clampX(
          point.x < x + w / 2
            ? point.x + AVOID_PAD * 2
            : point.x - AVOID_PAD * 2 - w
        )
        // Too narrow to clear it sideways: go below the point, or above it
        if (point.x > x - AVOID_PAD && point.x < x + w + AVOID_PAD) {
          const below = point.y + AVOID_PAD * 2
          y =
            below + h <= b.bottom - EDGE
              ? below
              : clamps(
                  point.y - AVOID_PAD * 2 - h,
                  b.top + EDGE,
                  b.bottom - h - EDGE
                )
        }
      }
      card.style.left = `${Math.round(x)}px`
      card.style.top = `${Math.round(y)}px`
      card.dataset.side = placement
      card.dataset.placed = "true"
    }
    frame = requestAnimationFrame(place)
    return () => cancelAnimationFrame(frame)
  }, [mounted, open, anchor, boundary, cover])

  if (!mounted || !open) return null

  const counted = step !== undefined && steps !== undefined
  const label =
    eyebrow ?? (done ? "Done" : counted ? `Try it · ${step} of ${steps}` : null)
  // Replays the enter animation whenever the instruction changes
  const contentKey = `${step ?? ""}-${done}-${typeof title === "string" ? title : ""}`

  return createPortal(
    <>
      <style href="standard-tutorial-float" precedence="default">
        {floatStyles}
      </style>
      <aside
        ref={cardRef}
        aria-label="Tutorial"
        aria-live="polite"
        data-slot="tutorial-float"
        data-float={float || undefined}
        data-leaving={leaving || undefined}
        className={cn(
          "fixed top-0 left-0 z-50 rounded-md border border-background/20 bg-foreground text-background shadow-lg",
          className
        )}
        {...props}
      >
        <div
          key={contentKey}
          data-slot="tutorial-float-content"
          className="flex flex-col px-3.5 py-3"
        >
          {label || (onSkip && !done) ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold tracking-wide text-background/70">
                {label}
              </span>
              {onSkip && !done ? (
                <button
                  type="button"
                  onClick={onSkip}
                  className="rounded-sm py-0.5 text-sm text-background/80 underline underline-offset-3 hover:text-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {skipLabel}
                </button>
              ) : null}
            </div>
          ) : null}
          <p className="mt-1.5 text-base leading-snug font-semibold">{title}</p>
          {children ? (
            <div className="mt-1 text-sm leading-normal text-background/85">
              {children}
            </div>
          ) : null}
          {steps || (done && onDone) ? (
            <div className="mt-2.5 flex min-h-7 items-center justify-between">
              {steps ? (
                <span aria-hidden="true" className="flex gap-1.25">
                  {Array.from({ length: steps }, (_, i) => (
                    <span
                      key={i}
                      data-on={done || i < (step ?? 0) || undefined}
                      className="size-1.5 rounded-full bg-background/30 transition-colors duration-300 data-on:bg-background"
                    />
                  ))}
                </span>
              ) : (
                <span />
              )}
              {done && onDone ? (
                <Button size="sm" tone="inverse" onClick={onDone}>
                  {doneLabel}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </>,
    document.body
  )
}

const floatStyles = `
[data-slot=tutorial-float]:not([data-placed]),[data-slot=tutorial-float][data-hidden=true]{visibility:hidden}
[data-slot=tutorial-float]{transition:opacity .4s ease-in,translate .4s ease-in}
[data-slot=tutorial-float][data-leaving]{opacity:0;translate:0 -4px;pointer-events:none}
@media (prefers-reduced-motion:no-preference){
[data-slot=tutorial-float][data-float]:not([data-leaving]){animation:tutorial-float-bob 3.6s ease-in-out infinite}
[data-slot=tutorial-float-content]{animation:tutorial-float-in .32s ease-out}
}
@keyframes tutorial-float-bob{50%{translate:0 -3px}}
@keyframes tutorial-float-in{from{opacity:0;translate:0 6px}}
`

export {
  TutorialFloat,
  tutorialFloatSides,
  type TutorialFloatProps,
  type TutorialFloatSide,
  type TutorialFloatTarget,
}
