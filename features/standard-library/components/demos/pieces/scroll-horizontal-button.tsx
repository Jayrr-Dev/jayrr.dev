"use client"

import { useRef } from "react"

import { ScrollHorizontalButton } from "@/components/standard/scroll-horizontal-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const SCROLL_STRIP_ITEMS = Array.from(
  { length: 18 },
  (_, index) => `Chip ${index + 1}`
)

const SCROLL_STRIP_STEP_PX = 140

function RendersScrollStrip() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  function jumpToStart() {
    scrollContainerRef.current?.scrollTo({ left: 0, behavior: "smooth" })
  }

  function jumpToEnd() {
    const element = scrollContainerRef.current
    if (!element) {
      return
    }
    element.scrollTo({ left: element.scrollWidth, behavior: "smooth" })
  }

  return (
    <RendersDemoCard
      className="w-full max-w-xl"
      label="click · hold · double-click"
    >
      <div className="relative w-full overflow-hidden rounded-md border border-border py-3">
        <div className="absolute top-1/2 left-1 z-20 -translate-y-1/2">
          <ScrollHorizontalButton
            direction="left"
            scrollContainerRef={scrollContainerRef}
            onJumpToEdge={jumpToStart}
            singleStepPx={SCROLL_STRIP_STEP_PX}
          />
        </div>
        <div className="absolute top-1/2 right-1 z-20 -translate-y-1/2">
          <ScrollHorizontalButton
            direction="right"
            scrollContainerRef={scrollContainerRef}
            onJumpToEdge={jumpToEnd}
            singleStepPx={SCROLL_STRIP_STEP_PX}
          />
        </div>
        <div
          ref={scrollContainerRef}
          className="flex mask-x-from-85% mask-x-to-100% scrollbar-none gap-2 overflow-x-auto overflow-y-hidden px-3 py-1"
        >
          {SCROLL_STRIP_ITEMS.map((label) => (
            <div
              key={label}
              className="shrink-0 rounded-sm border border-border/60 bg-muted/30 px-3 py-2 text-xs text-foreground"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </RendersDemoCard>
  )
}

export function RendersScrollHorizontalButtonDemo() {
  return <RendersScrollStrip />
}
