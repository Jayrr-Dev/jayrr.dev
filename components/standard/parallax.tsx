"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * A frame whose layers move at different speeds, so any content can sit at
 * its own depth. Compose `ParallaxLayer` children, or pass `layers`.
 *
 * `trigger="scroll"` (the default) moves layers as the frame passes through
 * its scroll container: the nearest scrolling ancestor, or the window.
 * `axis="x"` reads a sideways scroller instead. `trigger="pointer"` moves
 * them with the pointer over the frame. On touch, a tap or a sideways drag
 * moves them while vertical swipes still scroll the page; layers ease back
 * to center when the pointer leaves or the finger lifts.
 *
 * A layer's `speed` is how far it travels, as a share of the frame's `range`
 * (px): `0` stays put, positive values drift against the motion (further
 * away), negative ones with it (closer). `fill` stretches a layer over the
 * frame as a background; it is oversized by the distance it can travel, so
 * no edge shows. `scale` and `fade` add zoom and opacity with the same
 * progress.
 *
 * The frame writes its progress to CSS variables once per frame, with no
 * React renders, so layers can hold anything. Reduced motion holds every
 * layer still.
 *
 * <Parallax className="h-96">
 *   <ParallaxLayer fill speed={0.6}><img src={sky} /></ParallaxLayer>
 *   <ParallaxLayer fill speed={0.3}><img src={hills} /></ParallaxLayer>
 *   <ParallaxLayer className="grid place-items-center">
 *     <h1>Title</h1>
 *   </ParallaxLayer>
 * </Parallax>
 */

type ParallaxTrigger = "scroll" | "pointer"
type ParallaxAxis = "y" | "x"

type ParallaxLayerOptions = {
  /** Share of the frame's `range` this layer travels. */
  speed?: number
  /** Covers the frame as an oversized background. */
  fill?: boolean
  /** Extra scale at full progress, e.g. `0.2` zooms to 1.2×. */
  scale?: number
  /** Fades the layer out as it moves away from center. */
  fade?: boolean
}

type ParallaxLayerEntry = ParallaxLayerOptions & {
  id: string
  content: React.ReactNode
  className?: string
}

type ParallaxContextValue = {
  axis: ParallaxAxis
  trigger: ParallaxTrigger
  range: number
}

const ParallaxContext = React.createContext<ParallaxContextValue>({
  axis: "y",
  trigger: "scroll",
  range: 120,
})

function scrollParentOf(node: HTMLElement, axis: ParallaxAxis) {
  let parent = node.parentElement
  while (parent) {
    const style = getComputedStyle(parent)
    const overflow = axis === "y" ? style.overflowY : style.overflowX
    if (/(auto|scroll|overlay)/.test(overflow)) return parent
    parent = parent.parentElement
  }
  return null
}

const clamp = (value: number) => Math.min(1, Math.max(-1, value))

/**
 * Writes `--parallax-x`, `--parallax-y` (each -1 to 1) and
 * `--parallax-distance` (0 to 1, how far from center) on the element.
 * For scroll, 0 means the element is centered in its scroll container and
 * ±1 means it's just entering or leaving. For pointer, 0 is the center of
 * the element. Use it on anything to drive your own CSS.
 */
function useParallax(
  ref: React.RefObject<HTMLElement | null>,
  { trigger = "scroll", axis = "y" }: { trigger?: ParallaxTrigger; axis?: ParallaxAxis } = {}
) {
  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    const writes = (x: number, y: number) => {
      node.style.setProperty("--parallax-x", x.toFixed(4))
      node.style.setProperty("--parallax-y", y.toFixed(4))
      node.style.setProperty(
        "--parallax-distance",
        Math.min(1, Math.hypot(x, y)).toFixed(4)
      )
    }
    writes(0, 0)

    let frame = 0
    const schedules = (work: () => void) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(work)
    }

    if (trigger === "pointer") {
      const moves = (event: PointerEvent) =>
        schedules(() => {
          const rect = node.getBoundingClientRect()
          writes(
            clamp(((event.clientX - rect.left) / rect.width) * 2 - 1),
            clamp(((event.clientY - rect.top) / rect.height) * 2 - 1)
          )
        })
      const leaves = () => schedules(() => writes(0, 0))
      // A mouse stays over the frame after a click; a finger doesn't.
      const lifts = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") leaves()
      }
      node.addEventListener("pointerdown", moves)
      node.addEventListener("pointermove", moves)
      node.addEventListener("pointerleave", leaves)
      node.addEventListener("pointercancel", leaves)
      node.addEventListener("pointerup", lifts)
      return () => {
        cancelAnimationFrame(frame)
        node.removeEventListener("pointerdown", moves)
        node.removeEventListener("pointermove", moves)
        node.removeEventListener("pointerleave", leaves)
        node.removeEventListener("pointercancel", leaves)
        node.removeEventListener("pointerup", lifts)
      }
    }

    const scroller = scrollParentOf(node, axis)
    const target: HTMLElement | Window = scroller ?? window
    const measures = () => {
      const rect = node.getBoundingClientRect()
      const view = scroller
        ? scroller.getBoundingClientRect()
        : { top: 0, left: 0, height: window.innerHeight, width: window.innerWidth }
      const progress =
        axis === "y"
          ? (rect.top + rect.height / 2 - (view.top + view.height / 2)) /
            ((view.height + rect.height) / 2)
          : (rect.left + rect.width / 2 - (view.left + view.width / 2)) /
            ((view.width + rect.width) / 2)
      const value = clamp(progress)
      if (axis === "y") writes(0, value)
      else writes(value, 0)
    }
    const onScroll = () => schedules(measures)
    measures()
    target.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      target.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [axis, ref, trigger])
}

function Parallax({
  layers,
  trigger = "scroll",
  axis = "y",
  range = 120,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  layers?: ParallaxLayerEntry[]
  trigger?: ParallaxTrigger
  /** Scroll axis to follow; pointer parallax moves on both. */
  axis?: ParallaxAxis
  /** Travel (px) of a layer with `speed={1}`. */
  range?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  useParallax(ref, { trigger, axis })
  const context = React.useMemo(
    () => ({ axis, trigger, range }),
    [axis, trigger, range]
  )

  return (
    <ParallaxContext.Provider value={context}>
      <div
        ref={ref}
        data-slot="parallax"
        data-trigger={trigger}
        className={cn(
          "relative isolate overflow-hidden",
          trigger === "pointer" && "touch-pan-y",
          className
        )}
        {...props}
      >
        {layers?.map(({ id, content, ...layer }) => (
          <ParallaxLayer key={id} {...layer}>
            {content}
          </ParallaxLayer>
        ))}
        {children}
      </div>
    </ParallaxContext.Provider>
  )
}

function ParallaxLayer({
  speed = 0,
  fill = false,
  scale = 0,
  fade = false,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & ParallaxLayerOptions) {
  const { axis, trigger, range } = React.useContext(ParallaxContext)
  const travel = speed * range
  const moveX = trigger === "pointer" || axis === "x"
  const moveY = trigger === "pointer" || axis === "y"
  // Pointer layers follow the pointer toward the viewer's side; scroll
  // layers move against the scroll so distant ones lag behind.
  const sign = trigger === "pointer" ? -1 : 1

  const transform = [
    `translate3d(${moveX ? `calc(var(--parallax-x, 0) * ${sign * travel}px)` : "0"}, ${
      moveY ? `calc(var(--parallax-y, 0) * ${sign * travel}px)` : "0"
    }, 0)`,
    scale ? `scale(calc(1 + var(--parallax-distance, 0) * ${scale}))` : "",
  ]
    .filter(Boolean)
    .join(" ")

  // Oversize fills by their travel so the frame's edge never shows.
  const bleed = Math.abs(travel)

  return (
    <div
      data-slot="parallax-layer"
      data-fill={fill || undefined}
      style={{
        transform,
        opacity: fade ? "calc(1 - var(--parallax-distance, 0))" : undefined,
        ...(fill
          ? {
              inset: `${moveY ? -bleed : 0}px ${moveX ? -bleed : 0}px`,
            }
          : null),
        ...style,
      }}
      className={cn(
        "will-change-transform motion-reduce:transform-none! motion-reduce:opacity-100!",
        trigger === "pointer" && "transition-transform duration-300 ease-out",
        fill ? "pointer-events-none absolute -z-10 *:size-full *:object-cover" : "relative",
        className
      )}
      {...props}
    />
  )
}

export { Parallax, ParallaxLayer, useParallax }
export type { ParallaxAxis, ParallaxLayerEntry, ParallaxLayerOptions, ParallaxTrigger }
