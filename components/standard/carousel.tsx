"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"

import { cn } from "cn"
import { Button } from "@/components/standard/button"

type CarouselSlide = string | { label: string; image?: string }

type CarouselVariant = "single" | "multi-browse"

function slideLabel(slide: CarouselSlide) {
  return typeof slide === "string" ? slide : slide.label
}

function slideImage(slide: CarouselSlide) {
  return typeof slide === "string" ? undefined : slide.image
}

function Carousel({
  slides,
  variant = "single",
  className,
}: {
  slides: CarouselSlide[]
  variant?: CarouselVariant
  className?: string
}) {
  if (variant === "multi-browse") {
    return <MultiBrowseCarousel slides={slides} className={className} />
  }
  return <SingleCarousel slides={slides} className={className} />
}

function SingleCarousel({
  slides,
  className,
}: {
  slides: CarouselSlide[]
  className?: string
}) {
  const [ref, api] = useEmblaCarousel()
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }
    function sync() {
      setIndex(api?.selectedScrollSnap() ?? 0)
    }
    api.on("select", sync)
    return () => {
      api.off("select", sync)
    }
  }, [api])

  return (
    <div data-slot="carousel" className={cn("flex w-full flex-col gap-2", className)}>
      <div ref={ref} className="overflow-hidden rounded-lg border border-border">
        <div className="flex">
          {slides.map((slide) => (
            <div
              key={slideLabel(slide)}
              className="min-w-0 flex-[0_0_100%] px-3 py-6 text-center text-sm"
            >
              {slideLabel(slide)}
            </div>
          ))}
        </div>
      </div>
      <CarouselControls
        index={index}
        count={slides.length}
        onPrev={() => api?.scrollPrev()}
        onNext={() => api?.scrollNext()}
      />
    </div>
  )
}

function CarouselControls({
  index,
  count,
  onPrev,
  onNext,
}: {
  index: number
  count: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <Button tone="outline" size="sm" onClick={onPrev} disabled={index <= 0}>
        Prev
      </Button>
      <span className="text-xs text-muted-foreground">
        {index + 1} / {count}
      </span>
      <Button tone="outline" size="sm" onClick={onNext} disabled={index >= count - 1}>
        Next
      </Button>
    </div>
  )
}

// Multi-browse: a large item leads, followed by a medium and a small one.
// Every item sits on a keyline and morphs (position + width) as it moves
// between keylines, so scrolling grows the next item and shrinks the last.
const GAP = 8
const SMALL = 40
const FALLBACK_TONES = [
  "from-violet-500 to-fuchsia-400",
  "from-amber-500 to-rose-400",
  "from-emerald-500 to-teal-300",
  "from-sky-500 to-indigo-400",
  "from-rose-500 to-orange-300",
  "from-lime-500 to-emerald-300",
]

type Keyline = { x: number; w: number }

function buildKeylines(width: number) {
  const large = Math.max(SMALL * 2, (width - SMALL - GAP * 2) / 1.5)
  const medium = Math.max(SMALL, large / 2)
  // Keylines for distance -1 (leaving), 0 (large), 1 (medium), 2 (small), 3 (entering).
  const lines: Keyline[] = [
    { x: -SMALL - GAP, w: SMALL },
    { x: 0, w: large },
    { x: large + GAP, w: medium },
    { x: large + medium + GAP * 2, w: SMALL },
    { x: width + GAP, w: SMALL },
  ]
  return { lines, large, medium }
}

function keylineAt(lines: Keyline[], distance: number): Keyline {
  const first = lines[0]
  const last = lines[lines.length - 1]
  const step = SMALL + GAP
  if (distance <= -1) {
    return { x: first.x + (distance + 1) * step, w: SMALL }
  }
  if (distance >= lines.length - 2) {
    return { x: last.x + (distance - (lines.length - 2)) * step, w: SMALL }
  }
  const at = distance + 1
  const lower = Math.floor(at)
  const t = at - lower
  const a = lines[lower]
  const b = lines[lower + 1]
  return { x: a.x + (b.x - a.x) * t, w: a.w + (b.w - a.w) * t }
}

function MultiBrowseCarousel({
  slides,
  className,
}: {
  slides: CarouselSlide[]
  className?: string
}) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)
  const [offset, setOffset] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const drag = React.useRef<{ x: number; offset: number; moved: boolean } | null>(null)
  const wheelTimer = React.useRef<number | undefined>(undefined)

  const max = Math.max(0, slides.length - 1)
  const clamp = React.useCallback((value: number) => Math.min(max, Math.max(0, value)), [max])
  const { lines, large } = buildKeylines(width)
  const unit = (large + SMALL) / 2 + GAP
  const index = Math.round(offset)

  React.useEffect(() => {
    const node = trackRef.current
    if (!node) {
      return
    }
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const node = trackRef.current
    if (!node || !unit) {
      return
    }
    function onWheel(event: WheelEvent) {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return
      }
      event.preventDefault()
      setDragging(true)
      setOffset((current) => clamp(current + event.deltaX / unit))
      window.clearTimeout(wheelTimer.current)
      wheelTimer.current = window.setTimeout(() => {
        setDragging(false)
        setOffset((current) => Math.round(current))
      }, 120)
    }
    node.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      node.removeEventListener("wheel", onWheel)
      window.clearTimeout(wheelTimer.current)
    }
  }, [clamp, unit])

  function goTo(next: number) {
    setOffset(clamp(Math.round(next)))
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return
    }
    drag.current = { x: event.clientX, offset, moved: false }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current
    if (!state) {
      return
    }
    const dx = event.clientX - state.x
    if (!state.moved && Math.abs(dx) > 4) {
      state.moved = true
      setDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    if (state.moved) {
      setOffset(clamp(state.offset - dx / unit))
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current
    drag.current = null
    if (!state) {
      return
    }
    if (state.moved) {
      setDragging(false)
      const dx = event.clientX - state.x
      // Favor the drag direction so a short flick still advances one item.
      const bias = Math.abs(dx) > unit * 0.15 ? -Math.sign(dx) * 0.35 : 0
      goTo(state.offset - dx / unit + bias)
      return
    }
    const item = (event.target as HTMLElement).closest<HTMLElement>("[data-index]")
    if (item) {
      goTo(Number(item.dataset.index))
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: max,
    }
    if (event.key in moves) {
      event.preventDefault()
      goTo(moves[event.key])
    }
  }

  return (
    <div
      data-slot="carousel"
      data-variant="multi-browse"
      className={cn("flex w-full flex-col gap-2", className)}
    >
      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Item ${index + 1} of ${slides.length}`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={cn(
          "relative h-52 touch-pan-y overflow-hidden rounded-lg outline-none select-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        {width > 0 &&
          slides.map((slide, i) => {
            const distance = i - offset
            if (distance < -2 || distance > lines.length) {
              return null
            }
            const { x, w } = keylineAt(lines, distance)
            const image = slideImage(slide)
            const labelOpacity = Math.min(1, Math.max(0, (w - large * 0.55) / (large * 0.4)))
            return (
              <div
                key={`${slideLabel(slide)}-${i}`}
                data-index={i}
                aria-hidden={distance < -0.5 || distance > 2.5}
                className={cn(
                  "absolute top-0 h-full overflow-hidden rounded-3xl bg-muted",
                  !dragging && "transition-[left,width] duration-300 ease-out"
                )}
                style={{ left: x, width: w }}
              >
                {/* Content keeps the large width and stays centered, so shrinking masks it. */}
                <div
                  className={cn(
                    "absolute inset-y-0",
                    !dragging && "transition-[left] duration-300 ease-out"
                  )}
                  style={{ width: large, left: (w - large) / 2 }}
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt=""
                      draggable={false}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "size-full bg-gradient-to-br",
                        FALLBACK_TONES[i % FALLBACK_TONES.length]
                      )}
                    />
                  )}
                </div>
                <div
                  className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/50 to-transparent px-4 pt-8 pb-3 text-sm font-medium text-white"
                  style={{ opacity: labelOpacity }}
                >
                  {slideLabel(slide)}
                </div>
              </div>
            )
          })}
      </div>
      <CarouselControls
        index={index}
        count={slides.length}
        onPrev={() => goTo(index - 1)}
        onNext={() => goTo(index + 1)}
      />
    </div>
  )
}

export { Carousel }
export type { CarouselSlide, CarouselVariant }
