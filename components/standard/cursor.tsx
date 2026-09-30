"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "cn"

const cursorVariants = [
  "dot",
  "ring",
  "dot-ring",
  "crosshair",
  "spotlight",
  "blend",
  "arrow",
  "trail",
] as const

type CursorVariant = (typeof cursorVariants)[number]

/** Elements that make the cursor grow. Add `data-cursor="hover"` to opt in anything else. */
const cursorHoverSelector =
  'a, button, [role="button"], [role="tab"], [role="option"], label, select, summary, [data-cursor="hover"]'

/** Elements that turn the cursor into a caret. */
const cursorTextSelector =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"], [data-cursor="text"]'

type CursorLayer = {
  /** 1 follows instantly; lower values lag behind. Defaults to `smoothing`. */
  ease?: number
  /** Follow the previous layer instead of the pointer (trails). */
  chain?: boolean
  /** Which axes track the pointer. Crosshair lines use one each. */
  axis?: "both" | "x" | "y"
  /** Center the layer on the point. Off for the arrow, whose tip is the point. */
  centered?: boolean
  className?: string
  children?: React.ReactNode
}

const TRAIL_LENGTH = 8

/** Hover, text and pressed states read these from the overlay via `group-data-*`. */
function buildsCursorLayers(variant: CursorVariant): CursorLayer[] {
  switch (variant) {
    case "dot":
      return [
        {
          ease: 1,
          children: (
            <span className="block size-2 rounded-full bg-foreground transition-[width,height,opacity,border-radius] duration-200 group-data-hover/cursor:size-6 group-data-hover/cursor:opacity-40 group-data-pressed/cursor:scale-75 group-data-text/cursor:h-5 group-data-text/cursor:w-0.5 group-data-text/cursor:rounded-none" />
          ),
        },
      ]
    case "ring":
      return [
        {
          children: (
            <span className="block size-8 rounded-full border-2 border-foreground transition-[width,height,background-color,border-radius,scale] duration-200 group-data-hover/cursor:size-12 group-data-hover/cursor:bg-foreground/10 group-data-pressed/cursor:scale-90 group-data-text/cursor:h-6 group-data-text/cursor:w-0.5 group-data-text/cursor:rounded-none" />
          ),
        },
      ]
    case "dot-ring":
      return [
        {
          children: (
            <span className="block size-9 rounded-full border border-foreground/50 transition-[width,height,background-color,border-color,opacity,scale] duration-300 group-data-hover/cursor:size-14 group-data-hover/cursor:border-transparent group-data-hover/cursor:bg-foreground/10 group-data-pressed/cursor:scale-90 group-data-text/cursor:opacity-0" />
          ),
        },
        {
          ease: 1,
          children: (
            <span className="block size-1.5 rounded-full bg-foreground transition-[width,height,border-radius] duration-200 group-data-hover/cursor:size-1 group-data-text/cursor:h-5 group-data-text/cursor:w-0.5 group-data-text/cursor:rounded-none" />
          ),
        },
      ]
    case "crosshair":
      return [
        {
          ease: 1,
          axis: "y",
          centered: false,
          className: "w-full",
          children: <span className="block h-px w-full -translate-y-1/2 bg-foreground/40" />,
        },
        {
          ease: 1,
          axis: "x",
          centered: false,
          className: "h-full",
          children: <span className="block h-full w-px -translate-x-1/2 bg-foreground/40" />,
        },
        {
          ease: 1,
          children: (
            <span className="block size-3 rounded-full border border-foreground transition-[width,height] duration-200 group-data-hover/cursor:size-5 group-data-pressed/cursor:size-2" />
          ),
        },
        {
          ease: 1,
          centered: false,
          children: (
            <span
              data-cursor-label=""
              className="ml-3 mt-3 block rounded bg-foreground px-1.5 py-0.5 font-mono text-[10px] leading-none text-background tabular-nums"
            />
          ),
        },
      ]
    case "spotlight":
      return [
        {
          ease: 0.12,
          children: (
            <span className="block size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--foreground)_14%,transparent),transparent_65%)] transition-[width,height] duration-500 group-data-hover/cursor:size-96" />
          ),
        },
        {
          ease: 1,
          children: <span className="block size-1.5 rounded-full bg-foreground" />,
        },
      ]
    case "blend":
      return [
        {
          children: (
            <span className="block size-10 rounded-full bg-white transition-[width,height,scale] duration-300 group-data-hover/cursor:size-20 group-data-pressed/cursor:scale-90 group-data-text/cursor:h-7 group-data-text/cursor:w-1 group-data-text/cursor:rounded-sm" />
          ),
          className: "mix-blend-difference",
        },
      ]
    case "arrow":
      return [
        {
          ease: 1,
          centered: false,
          children: (
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="size-6 -translate-x-[3px] -translate-y-[2px] fill-foreground stroke-background drop-shadow-sm transition-[fill,scale] duration-150 [stroke-linejoin:round] [stroke-width:1.5] group-data-hover/cursor:scale-110 group-data-hover/cursor:fill-primary group-data-pressed/cursor:scale-95"
            >
              <path d="M4 2.5 20 11l-7 1.8L9.6 20z" />
            </svg>
          ),
        },
      ]
    case "trail":
      return Array.from({ length: TRAIL_LENGTH }, (_, index) => {
        const size = 12 - index
        return {
          ease: index === 0 ? 1 : 0.45,
          chain: index > 0,
          children: (
            <span
              className="block rounded-full bg-foreground transition-transform duration-200 group-data-hover/cursor:scale-150"
              style={{
                width: size,
                height: size,
                opacity: 1 - index / TRAIL_LENGTH,
              }}
            />
          ),
        }
      })
  }
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

type CursorProps = Omit<React.ComponentProps<"div">, "children"> & {
  variant?: CursorVariant
  /** Replace the cursor on the whole page instead of only inside `children`. */
  global?: boolean
  /** How fast lagging layers catch up, 0–1. 1 is instant. */
  smoothing?: number
  hoverSelector?: string
  disabled?: boolean
  /** Classes for the cursor overlay. `className` styles the scope wrapper. */
  cursorClassName?: string
  children?: React.ReactNode
}

/**
 * Replaces the native cursor with a custom one. Scoped to its children by
 * default; pass `global` to take over the page. Touch devices and reduced
 * motion are respected: no cursor on coarse pointers, no lag with reduced motion.
 */
function Cursor({
  variant = "dot-ring",
  global = false,
  smoothing = 0.2,
  hoverSelector = cursorHoverSelector,
  disabled = false,
  className,
  cursorClassName,
  children,
  ...props
}: CursorProps) {
  const scopeRef = React.useRef<HTMLDivElement>(null)
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const layerRefs = React.useRef<(HTMLSpanElement | null)[]>([])
  const isCoarse = useMediaQuery("(pointer: coarse)")
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const mounted = React.useSyncExternalStore(
    subscribesToNothing,
    () => true,
    () => false
  )
  const active = mounted && !disabled && !isCoarse

  const layers = React.useMemo(() => buildsCursorLayers(variant), [variant])

  React.useEffect(() => {
    if (!active) {
      return
    }

    const overlay = overlayRef.current
    const target = global ? window : scopeRef.current
    if (!overlay || !target) {
      return
    }

    const root = document.documentElement
    if (global) {
      root.setAttribute("data-cursor-hidden", "")
    }

    const pointer = { x: 0, y: 0 }
    const positions = layers.map(() => ({ x: 0, y: 0 }))
    const label = overlay.querySelector<HTMLElement>("[data-cursor-label]")
    let frame = 0
    let placed = false

    const paint = () => {
      frame = 0
      let settled = true

      layers.forEach((layer, index) => {
        const goal = layer.chain ? positions[index - 1] : pointer
        const ease = reducedMotion ? 1 : (layer.ease ?? smoothing)
        const position = positions[index]
        position.x += (goal.x - position.x) * ease
        position.y += (goal.y - position.y) * ease

        if (
          Math.abs(goal.x - position.x) > 0.1 ||
          Math.abs(goal.y - position.y) > 0.1
        ) {
          settled = false
        }

        const element = layerRefs.current[index]
        if (!element) {
          return
        }
        const x = layer.axis === "y" ? 0 : position.x
        const y = layer.axis === "x" ? 0 : position.y
        const center = layer.centered === false ? "" : " translate(-50%, -50%)"
        element.style.transform = `translate3d(${x}px, ${y}px, 0)${center}`
      })

      if (label) {
        label.textContent = `${Math.round(pointer.x)}, ${Math.round(pointer.y)}`
      }

      if (!settled) {
        frame = requestAnimationFrame(paint)
      }
    }

    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(paint)
      }
    }

    const setsState = (name: string, on: boolean) => {
      if (on) {
        overlay.setAttribute(name, "")
      } else {
        overlay.removeAttribute(name)
      }
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return
      }
      const rect = global ? null : scopeRef.current?.getBoundingClientRect()
      pointer.x = event.clientX - (rect?.left ?? 0)
      pointer.y = event.clientY - (rect?.top ?? 0)

      // Jump into place on entry instead of sliding in from the corner.
      if (!placed) {
        positions.forEach((position) => {
          position.x = pointer.x
          position.y = pointer.y
        })
        placed = true
      }

      const element = event.target instanceof Element ? event.target : null
      const isText = Boolean(element?.closest(cursorTextSelector))
      setsState("data-text", isText)
      setsState("data-hover", !isText && Boolean(element?.closest(hoverSelector)))
      setsState("data-visible", true)
      schedule()
    }

    const onLeave = () => {
      setsState("data-visible", false)
      setsState("data-pressed", false)
      placed = false
    }
    const onDown = () => setsState("data-pressed", true)
    const onUp = () => setsState("data-pressed", false)

    const leaveTarget = global ? root : target
    target.addEventListener("pointermove", onMove as EventListener)
    target.addEventListener("pointerdown", onDown)
    window.addEventListener("pointerup", onUp)
    leaveTarget.addEventListener("pointerleave", onLeave)

    return () => {
      cancelAnimationFrame(frame)
      target.removeEventListener("pointermove", onMove as EventListener)
      target.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
      leaveTarget.removeEventListener("pointerleave", onLeave)
      if (global) {
        root.removeAttribute("data-cursor-hidden")
      }
    }
  }, [active, global, hoverSelector, layers, reducedMotion, smoothing])

  const overlay = active ? (
    <div
      ref={overlayRef}
      aria-hidden
      data-slot="cursor"
      data-variant={variant}
      className={cn(
        "group/cursor pointer-events-none inset-0 z-[9999] overflow-hidden opacity-0 transition-opacity duration-150 data-visible:opacity-100",
        global ? "fixed" : "absolute",
        cursorClassName
      )}
    >
      {global ? (
        <style>{`html[data-cursor-hidden], html[data-cursor-hidden] * { cursor: none !important; }`}</style>
      ) : null}
      {layers.map((layer, index) => (
        <span
          key={index}
          ref={(element) => {
            layerRefs.current[index] = element
          }}
          className={cn(
            "absolute top-0 left-0 block will-change-transform",
            layer.className
          )}
        >
          {layer.children}
        </span>
      ))}
    </div>
  ) : null

  if (global) {
    return (
      <>
        {children}
        {overlay ? createPortal(overlay, document.body) : null}
      </>
    )
  }

  return (
    <div
      ref={scopeRef}
      data-slot="cursor-scope"
      className={cn(
        "relative",
        active && "cursor-none [&_*]:cursor-none!",
        className
      )}
      {...props}
    >
      {children}
      {overlay}
    </div>
  )
}

export {
  Cursor,
  cursorHoverSelector,
  cursorTextSelector,
  cursorVariants,
  type CursorProps,
  type CursorVariant,
}
