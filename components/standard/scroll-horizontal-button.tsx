"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "cn"

import { Tooltip } from "@/components/standard/tooltip"

const DEFAULT_SINGLE_STEP_PX = 400
const DEFAULT_SPEED_PX_PER_FRAME = 12
const DEFAULT_HOLD_DELAY_MS = 250
const SINGLE_CLICK_CONCERN_JUMP_DELAY_MS = 200

const BASE_CLASS =
  "pointer-events-auto cursor-pointer rounded-full bg-primary p-1 text-primary-foreground opacity-75 shadow-md ring-1 ring-inset ring-black/40 transition-opacity hover:opacity-90 focus-visible:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 active:!opacity-100 data-[pressed]:!opacity-100 dark:ring-white/40"

export type ScrollHorizontalButtonJumpMode =
  | "edge"
  | "nearestConcern"
  | "firstLastConcern"

function ScrollHorizontalButton({
  className,
  direction,
  scrollContainerRef,
  singleClickJumpMode,
  doubleClickJumpMode = "edge",
  onJumpToEdge,
  onJumpToNearestConcern,
  onJumpToFirstLastConcern,
  singleStepPx = DEFAULT_SINGLE_STEP_PX,
  speedPxPerFrame = DEFAULT_SPEED_PX_PER_FRAME,
  holdDelayMs = DEFAULT_HOLD_DELAY_MS,
  size = "default",
  showsInstructions = false,
}: {
  className?: string
  direction: "left" | "right"
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  singleClickJumpMode?: ScrollHorizontalButtonJumpMode
  doubleClickJumpMode?: ScrollHorizontalButtonJumpMode
  onJumpToEdge?: () => void
  onJumpToNearestConcern?: (direction: "left" | "right") => void
  onJumpToFirstLastConcern?: (direction: "left" | "right") => void
  singleStepPx?: number
  speedPxPerFrame?: number
  holdDelayMs?: number
  size?: "default" | "strip"
  showsInstructions?: boolean
}) {
  const rafRef = React.useRef<number | null>(null)
  const delayRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSingleConcernJumpRef = React.useRef<
    ReturnType<typeof setTimeout> | null
  >(null)
  const didScrollRef = React.useRef(false)
  const [pressed, setPressed] = React.useState(false)

  const usesSingleClickConcernJump = singleClickJumpMode === "nearestConcern"
  const directionMultiplier = direction === "left" ? -1 : 1
  const usesStripSize = size === "strip"
  const label =
    direction === "left"
      ? "Scroll left. Click steps, hold keeps going, double-click jumps to the start."
      : "Scroll right. Click steps, hold keeps going, double-click jumps to the end."

  function clearsPendingSingleConcernJump() {
    if (pendingSingleConcernJumpRef.current === null) {
      return
    }
    clearTimeout(pendingSingleConcernJumpRef.current)
    pendingSingleConcernJumpRef.current = null
  }

  function stopContinuousScroll() {
    if (delayRef.current !== null) {
      clearTimeout(delayRef.current)
      delayRef.current = null
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setPressed(false)
  }

  function startContinuousScroll() {
    setPressed(true)
    didScrollRef.current = false
    const el = scrollContainerRef.current
    if (!el) {
      return
    }
    const step = directionMultiplier * speedPxPerFrame

    const tick = () => {
      const container = scrollContainerRef.current
      if (!container) {
        rafRef.current = null
        return
      }
      const maxLeft = container.scrollWidth - container.clientWidth
      const atStart = container.scrollLeft <= 0 && directionMultiplier < 0
      const atEnd = container.scrollLeft >= maxLeft && directionMultiplier > 0
      if (atStart || atEnd) {
        rafRef.current = null
        return
      }
      container.scrollBy({ left: step, behavior: "auto" })
      didScrollRef.current = true
      rafRef.current = requestAnimationFrame(tick)
    }

    delayRef.current = setTimeout(() => {
      delayRef.current = null
      if (rafRef.current !== null) {
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }, holdDelayMs)
  }

  function handleClick() {
    if (didScrollRef.current) {
      didScrollRef.current = false
      return
    }

    if (usesSingleClickConcernJump) {
      clearsPendingSingleConcernJump()
      pendingSingleConcernJumpRef.current = setTimeout(() => {
        pendingSingleConcernJumpRef.current = null
        onJumpToNearestConcern?.(direction)
      }, SINGLE_CLICK_CONCERN_JUMP_DELAY_MS)
      return
    }

    const delta = directionMultiplier * singleStepPx
    scrollContainerRef.current?.scrollBy({ left: delta, behavior: "smooth" })
  }

  function handleDoubleClick() {
    clearsPendingSingleConcernJump()

    if (doubleClickJumpMode === "firstLastConcern") {
      onJumpToFirstLastConcern?.(direction)
      return
    }

    if (doubleClickJumpMode === "nearestConcern") {
      onJumpToNearestConcern?.(direction)
      return
    }

    onJumpToEdge?.()
  }

  React.useEffect(() => {
    return () => {
      stopContinuousScroll()
      clearsPendingSingleConcernJump()
    }
  }, [])

  const button = (
    <button
      type="button"
      data-slot="scroll-horizontal-button"
      data-pressed={pressed ? "" : undefined}
      className={cn(
        BASE_CLASS,
        usesStripSize ? "p-2" : "p-1",
        className
      )}
      onClick={handleClick}
      onPointerDown={startContinuousScroll}
      onPointerUp={stopContinuousScroll}
      onPointerLeave={stopContinuousScroll}
      onPointerCancel={stopContinuousScroll}
      onDoubleClick={handleDoubleClick}
      aria-label={label}
    >
      {direction === "left" ? (
        <ChevronLeftIcon
          className={usesStripSize ? "size-5" : "size-4"}
        />
      ) : (
        <ChevronRightIcon
          className={usesStripSize ? "size-5" : "size-4"}
        />
      )}
    </button>
  )

  if (!showsInstructions) {
    return button
  }

  return (
    <Tooltip label={label} body={label}>
      {button}
    </Tooltip>
  )
}

export { ScrollHorizontalButton }
