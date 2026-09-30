"use client"

import * as React from "react"
import { cn } from "cn"

import { layerProps, type LayerProps } from "@/components/standard/layer"

const artEnters = [
  "none",
  "fade",
  "rise",
  "drop",
  "slide-start",
  "slide-end",
  "zoom",
  "pop",
  "spin",
  "blur",
] as const

type ArtEnter = (typeof artEnters)[number]

const artIdles = ["none", "float", "sway", "spin", "pulse"] as const

type ArtIdle = (typeof artIdles)[number]

type ArtPieceProps = {
  /** Image URL. Leave out and pass children for inline SVG or any element. */
  src?: string
  alt?: string
  children?: React.ReactNode
  /** Centre of the piece, in % of the Art box from the left. Default 50. */
  x?: number
  /** Centre of the piece, in % of the Art box from the top. Default 50. */
  y?: number
  /** px, or any CSS length such as "30%". Default 120. */
  width?: number | string
  /** Degrees. */
  rotate?: number
  /**
   * Stacking order and parallax strength. Pieces with more depth sit in front
   * and move further with the pointer. Default 1.
   */
  depth?: number
  /** How the piece arrives. Default `rise`. */
  enter?: ArtEnter
  /** ms after the Art enters, on top of its stagger. */
  delay?: number
  /** ms. Default 900. */
  duration?: number
  /** Loop that runs once the piece has arrived. Default `none`. */
  idle?: ArtIdle
  /** Seconds per idle loop. */
  idleDuration?: number
  className?: string
  style?: React.CSSProperties
}

type ArtProps = LayerProps & {
  /** Pieces as data. Children (ArtPiece) are rendered after them. */
  items?: ArtPieceProps[]
  children?: React.ReactNode
  /** Animate in on mount, or when the Art scrolls into view. Default `visible`. */
  trigger?: "mount" | "visible"
  /** ms added per piece, in order, so they arrive one after another. Default 120. */
  stagger?: number
  /** px each piece drifts with the pointer at depth 1. 0 turns it off. */
  parallax?: number
}

const ArtContext = React.createContext<{
  shown: boolean
  stagger: number
  parallax: number
}>({ shown: true, stagger: 0, parallax: 0 })

const ArtIndexContext = React.createContext(0)

// Hidden states per enter; `data-shown` releases them into place.
const artKeyframes = `
[data-slot=art-piece-enter]{transition-property:opacity,transform,filter;transition-timing-function:cubic-bezier(.22,1,.36,1)}
[data-art-enter=pop]{transition-timing-function:cubic-bezier(.34,1.56,.64,1)}
[data-slot=art-piece-enter]:not([data-shown]):not([data-art-enter=none]){opacity:0}
[data-art-enter=rise]:not([data-shown]){transform:translateY(48px)}
[data-art-enter=drop]:not([data-shown]){transform:translateY(-48px)}
[data-art-enter=slide-start]:not([data-shown]){transform:translateX(-72px)}
[data-art-enter=slide-end]:not([data-shown]){transform:translateX(72px)}
[data-art-enter=zoom]:not([data-shown]){transform:scale(.6)}
[data-art-enter=pop]:not([data-shown]){transform:scale(.2)}
[data-art-enter=spin]:not([data-shown]){transform:rotate(-120deg) scale(.5)}
[data-art-enter=blur]:not([data-shown]){filter:blur(18px);transform:scale(1.15)}
[data-slot=art-piece]{transition:translate .5s cubic-bezier(.22,1,.36,1)}
@keyframes art-float{from{transform:translateY(0)}to{transform:translateY(-12px)}}
@keyframes art-sway{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}
@keyframes art-spin{to{transform:rotate(360deg)}}
@keyframes art-pulse{from{transform:scale(1)}to{transform:scale(1.06)}}
@media (prefers-reduced-motion:reduce){[data-slot=art-piece-enter]{transition:none!important;opacity:1!important;transform:none!important;filter:none!important}[data-slot=art-piece-idle]{animation:none!important}[data-slot=art-piece]{translate:none!important}}
`

const idleTiming: Record<Exclude<ArtIdle, "none">, string> = {
  float: "ease-in-out infinite alternate",
  sway: "ease-in-out infinite alternate",
  spin: "linear infinite",
  pulse: "ease-in-out infinite alternate",
}

const idleSeconds: Record<Exclude<ArtIdle, "none">, number> = {
  float: 3,
  sway: 4,
  spin: 24,
  pulse: 2,
}

function cssLength(value: number | string) {
  return typeof value === "number" ? `${value}px` : value
}

/**
 * A layer of positioned art: cut-out images, SVGs or any element, each with
 * its own place, size, depth, entrance and idle loop. Put it in any
 * `relative isolate` parent (Hero Card, Surface, Card) like the other layers.
 */
function Art({
  items = [],
  children,
  trigger = "visible",
  stagger = 120,
  parallax = 0,
  ...layer
}: ArtProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    if (trigger === "mount" || typeof IntersectionObserver === "undefined") {
      // A frame first, so the hidden state paints before the transition.
      const frame = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(frame)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [trigger])

  // The layer ignores the pointer, so parallax listens on its parent.
  React.useEffect(() => {
    const node = ref.current
    const host = node?.parentElement
    if (!node || !host || parallax === 0) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    function moves(event: PointerEvent) {
      const box = host!.getBoundingClientRect()
      const x = ((event.clientX - box.left) / box.width) * 2 - 1
      const y = ((event.clientY - box.top) / box.height) * 2 - 1
      node!.style.setProperty("--art-x", x.toFixed(3))
      node!.style.setProperty("--art-y", y.toFixed(3))
    }

    function leaves() {
      node!.style.setProperty("--art-x", "0")
      node!.style.setProperty("--art-y", "0")
    }

    host.addEventListener("pointermove", moves)
    host.addEventListener("pointerleave", leaves)
    return () => {
      host.removeEventListener("pointermove", moves)
      host.removeEventListener("pointerleave", leaves)
    }
  }, [parallax])

  const props = layerProps(layer, "art")
  const pieces = [
    ...items.map((item, index) => <ArtPiece key={`item-${index}`} {...item} />),
    ...React.Children.toArray(children),
  ]

  return (
    <div
      ref={ref}
      {...props}
      data-shown={shown ? true : undefined}
      className={cn(props.className, "overflow-hidden")}
    >
      <style href="standard-art" precedence="default">
        {artKeyframes}
      </style>
      <ArtContext value={{ shown, stagger, parallax }}>
        {pieces.map((piece, index) => (
          <ArtIndexContext key={index} value={index}>
            {piece}
          </ArtIndexContext>
        ))}
      </ArtContext>
    </div>
  )
}

/** One piece of art inside Art. Also accepted as an item in `items`. */
function ArtPiece({
  src,
  alt = "",
  children,
  x = 50,
  y = 50,
  width = 120,
  rotate = 0,
  depth = 1,
  enter = "rise",
  delay = 0,
  duration = 900,
  idle = "none",
  idleDuration,
  className,
  style,
}: ArtPieceProps) {
  const { shown, stagger, parallax } = React.useContext(ArtContext)
  const index = React.useContext(ArtIndexContext)
  const reach = parallax * depth
  const enterDelay = delay + index * stagger

  return (
    <div
      data-slot="art-piece"
      className={cn("absolute", className)}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: cssLength(width),
        zIndex: Math.round(depth * 10),
        transform: "translate(-50%, -50%)",
        translate: reach
          ? `calc(var(--art-x, 0) * ${reach}px) calc(var(--art-y, 0) * ${reach}px)`
          : undefined,
        ...style,
      }}
    >
      <div
        data-slot="art-piece-enter"
        data-art-enter={enter}
        data-shown={shown ? true : undefined}
        style={{
          transitionDuration: `${duration}ms`,
          transitionDelay: `${enterDelay}ms`,
        }}
      >
        <div
          data-slot="art-piece-idle"
          style={{
            rotate: rotate ? `${rotate}deg` : undefined,
            // Idle starts once the piece has landed.
            animation:
              idle === "none"
                ? undefined
                : `art-${idle} ${idleDuration ?? idleSeconds[idle]}s ${enterDelay + duration}ms ${idleTiming[idle]}`,
          }}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              draggable={false}
              className="block h-auto w-full select-none"
            />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}

export {
  Art,
  ArtPiece,
  artEnters,
  artIdles,
  type ArtEnter,
  type ArtIdle,
  type ArtPieceProps,
  type ArtProps,
}
