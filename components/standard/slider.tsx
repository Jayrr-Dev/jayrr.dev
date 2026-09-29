"use client"

import * as React from "react"
import { cn } from "cn"

import { ScrollHorizontalButton } from "@/components/standard/scroll-horizontal-button"

/** Sub-pixel tolerance when reading scroll edges. */
const EDGE_TOLERANCE_PX = 2

/** Pointer travel before a press turns into a drag (and swallows the click). */
const DRAG_THRESHOLD_PX = 5

const DEFAULT_STEP_PX = 320

/** Targets that keep their own pointer behavior instead of starting a drag. */
const NO_DRAG_SELECTOR =
  'input, textarea, select, [contenteditable="true"], [data-no-drag-scroll]'

type SliderOverflow = { canScrollLeft: boolean; canScrollRight: boolean }

const NO_OVERFLOW: SliderOverflow = {
  canScrollLeft: false,
  canScrollRight: false,
}

/**
 * Tracks whether a horizontal scroller can move left or right. Re-checks on
 * scroll, resize and child changes, batched to one read per frame.
 */
function useSliderOverflow(
  viewportRef: React.RefObject<HTMLElement | null>
): SliderOverflow {
  const [overflow, setOverflow] = React.useState(NO_OVERFLOW)

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    let frame: number | null = null

    function evaluate() {
      if (frame !== null) {
        return
      }
      frame = requestAnimationFrame(() => {
        frame = null
        const el = viewportRef.current
        if (!el) {
          return
        }
        const maxLeft = el.scrollWidth - el.clientWidth
        const canScrollLeft = el.scrollLeft > EDGE_TOLERANCE_PX
        const canScrollRight = el.scrollLeft < maxLeft - EDGE_TOLERANCE_PX
        setOverflow((previous) =>
          previous.canScrollLeft === canScrollLeft &&
          previous.canScrollRight === canScrollRight
            ? previous
            : { canScrollLeft, canScrollRight }
        )
      })
    }

    evaluate()
    viewport.addEventListener("scroll", evaluate, { passive: true })
    const resizeObserver = new ResizeObserver(evaluate)
    resizeObserver.observe(viewport)
    const mutationObserver = new MutationObserver(evaluate)
    mutationObserver.observe(viewport, { childList: true })

    return () => {
      viewport.removeEventListener("scroll", evaluate)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      if (frame !== null) {
        cancelAnimationFrame(frame)
      }
    }
  }, [viewportRef])

  return overflow
}

/**
 * Click-and-drag scrolling for mouse and pen. Touch keeps native panning.
 * A drag past the threshold swallows the click that ends it, so dragging
 * across a row of buttons never selects one.
 */
function useSliderDrag(
  viewportRef: React.RefObject<HTMLElement | null>,
  enabled: boolean
) {
  const sessionRef = React.useRef<{
    pointerId: number
    originX: number
    startScrollLeft: number
  } | null>(null)
  const didDragRef = React.useRef(false)
  const [dragging, setDragging] = React.useState(false)

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !enabled) {
      return
    }

    function swallowClickAfterDrag(event: MouseEvent) {
      if (!didDragRef.current) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      didDragRef.current = false
    }

    viewport.addEventListener("click", swallowClickAfterDrag, true)
    return () => {
      viewport.removeEventListener("click", swallowClickAfterDrag, true)
    }
  }, [viewportRef, enabled])

  function endSession(event: React.PointerEvent<HTMLElement>) {
    const session = sessionRef.current
    if (!session || session.pointerId !== event.pointerId) {
      return
    }
    sessionRef.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handlers = {
    onPointerDown(event: React.PointerEvent<HTMLElement>) {
      const viewport = viewportRef.current
      if (
        !enabled ||
        !viewport ||
        event.button !== 0 ||
        event.pointerType === "touch" ||
        viewport.scrollWidth - viewport.clientWidth <= EDGE_TOLERANCE_PX
      ) {
        return
      }
      if ((event.target as HTMLElement).closest(NO_DRAG_SELECTOR)) {
        return
      }
      didDragRef.current = false
      sessionRef.current = {
        pointerId: event.pointerId,
        originX: event.clientX,
        startScrollLeft: viewport.scrollLeft,
      }
    },
    onPointerMove(event: React.PointerEvent<HTMLElement>) {
      const session = sessionRef.current
      const viewport = viewportRef.current
      if (!session || !viewport || session.pointerId !== event.pointerId) {
        return
      }
      const deltaX = event.clientX - session.originX
      if (!didDragRef.current && Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
        // Capture only once it is a real drag, so plain clicks still land.
        didDragRef.current = true
        setDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)
      }
      if (didDragRef.current) {
        viewport.scrollLeft = session.startScrollLeft - deltaX
      }
    },
    onPointerUp: endSession,
    onPointerCancel: endSession,
  }

  return { dragging, handlers }
}

/** Centers `item` inside the horizontal `viewport`. */
function scrollsSliderToItem(
  viewport: HTMLElement,
  item: HTMLElement,
  behavior: ScrollBehavior = "smooth"
) {
  const left = item.offsetLeft - viewport.clientWidth / 2 + item.offsetWidth / 2
  viewport.scrollTo({ left: Math.max(0, left), behavior })
}

type SliderProps = {
  children: React.ReactNode
  className?: string
  /** Classes for the scrolling row (gap, padding, snap). */
  viewportClassName?: string
  /** Ref to the scrolling row, for callers that scroll it themselves. */
  viewportRef?: React.Ref<HTMLDivElement>
  "aria-label"?: string
  /** Pixels per arrow click and per arrow key. */
  stepPx?: number
  /** Show the overflow-aware scroll buttons. */
  arrows?: boolean
  /** Enable click-and-drag scrolling. */
  drag?: boolean
  /** Fade the edges that have more content past them. */
  fade?: boolean
  /** Snap items to the start edge (give items `snap-start`). */
  snap?: boolean
  /** Centered layer above the row, e.g. the month label on a calendar. */
  overlay?: React.ReactNode
  /** Single click on an arrow jumps to the nearest landmark instead of stepping. */
  onJumpToNearest?: (direction: "left" | "right") => void
  /** Double click on an arrow jumps to the first or last landmark instead of the edge. */
  onJumpToFirstLast?: (direction: "left" | "right") => void
  onScroll?: React.UIEventHandler<HTMLDivElement>
}

/**
 * Horizontal slider for any row of items: scroll buttons that step on click,
 * glide while held and jump on double-click; click-and-drag; arrow keys,
 * Home and End; and edge fades that show where more content is.
 */
function Slider({
  children,
  className,
  viewportClassName,
  viewportRef: forwardedViewportRef,
  "aria-label": ariaLabel,
  stepPx = DEFAULT_STEP_PX,
  arrows = true,
  drag = true,
  fade = true,
  snap = false,
  overlay,
  onJumpToNearest,
  onJumpToFirstLast,
  onScroll,
}: SliderProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const { canScrollLeft, canScrollRight } = useSliderOverflow(viewportRef)
  const { dragging, handlers } = useSliderDrag(viewportRef, drag)
  const canScroll = canScrollLeft || canScrollRight

  const setViewportRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node
      if (typeof forwardedViewportRef === "function") {
        forwardedViewportRef(node)
      } else if (forwardedViewportRef) {
        forwardedViewportRef.current = node
      }
    },
    [forwardedViewportRef]
  )

  function jumpToEdge(direction: "left" | "right") {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }
    viewport.scrollTo({
      left: direction === "left" ? 0 : viewport.scrollWidth,
      behavior: "smooth",
    })
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const viewport = viewportRef.current
    if (!viewport || event.target !== viewport) {
      return
    }
    const moves: Record<string, () => void> = {
      ArrowLeft: () =>
        onJumpToNearest
          ? onJumpToNearest("left")
          : viewport.scrollBy({ left: -stepPx, behavior: "smooth" }),
      ArrowRight: () =>
        onJumpToNearest
          ? onJumpToNearest("right")
          : viewport.scrollBy({ left: stepPx, behavior: "smooth" }),
      Home: () =>
        onJumpToFirstLast ? onJumpToFirstLast("left") : jumpToEdge("left"),
      End: () =>
        onJumpToFirstLast ? onJumpToFirstLast("right") : jumpToEdge("right"),
    }
    const move = moves[event.key]
    if (move) {
      event.preventDefault()
      move()
    }
  }

  const fadeMask = fade
    ? `linear-gradient(to right, ${canScrollLeft ? "transparent" : "#000"}, #000 2.5rem, #000 calc(100% - 2.5rem), ${canScrollRight ? "transparent" : "#000"})`
    : undefined

  function rendersArrow(direction: "left" | "right") {
    const visible = direction === "left" ? canScrollLeft : canScrollRight
    return (
      <div
        className={cn(
          "absolute top-1/2 z-10 -translate-y-1/2 transition-opacity duration-200",
          direction === "left" ? "left-1" : "right-1",
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!visible}
      >
        <ScrollHorizontalButton
          direction={direction}
          scrollContainerRef={viewportRef}
          singleStepPx={stepPx}
          singleClickJumpMode={onJumpToNearest ? "nearestConcern" : undefined}
          doubleClickJumpMode={onJumpToFirstLast ? "firstLastConcern" : "edge"}
          onJumpToEdge={() => jumpToEdge(direction)}
          onJumpToNearestConcern={onJumpToNearest}
          onJumpToFirstLastConcern={onJumpToFirstLast}
        />
      </div>
    )
  }

  return (
    <div
      data-slot="slider"
      className={cn("relative flex w-full min-w-0 flex-col", className)}
    >
      {overlay ? (
        <div
          data-slot="slider-overlay"
          className="pointer-events-none flex h-6 items-center justify-center text-sm font-semibold tracking-tight"
          aria-live="polite"
        >
          {overlay}
        </div>
      ) : null}
      <div className="relative min-w-0">
        {arrows ? rendersArrow("left") : null}
        <div
          ref={setViewportRef}
          role="region"
          aria-label={ariaLabel}
          aria-keyshortcuts="ArrowLeft ArrowRight Home End"
          tabIndex={canScroll ? 0 : -1}
          data-slot="slider-viewport"
          data-dragging={dragging || undefined}
          className={cn(
            // relative: items measure offsetLeft in scroll-content coordinates.
            "relative flex touch-pan-x gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain py-2 [scrollbar-width:none] focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-scrollbar]:hidden",
            arrows && "px-10",
            snap && !dragging && "snap-x snap-mandatory",
            drag && canScroll && (dragging ? "cursor-grabbing select-none" : "cursor-grab"),
            viewportClassName
          )}
          style={{
            maskImage: fadeMask,
            WebkitMaskImage: fadeMask,
            scrollPaddingInline: arrows ? "2.5rem" : undefined,
          }}
          onKeyDown={handleKeyDown}
          onScroll={onScroll}
          {...handlers}
        >
          {children}
        </div>
        {arrows ? rendersArrow("right") : null}
      </div>
    </div>
  )
}

export { Slider, scrollsSliderToItem, useSliderDrag, useSliderOverflow }
export type { SliderProps }
