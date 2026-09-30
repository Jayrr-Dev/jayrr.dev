"use client"

import * as React from "react"

/**
 * Animates its content in when it scrolls into view: the fade-up (and
 * friends) that landing pages run on each section.
 *
 * `enter` picks the entrance, with the same names as Art's pieces. `stagger`
 * reveals each direct child in turn instead of the whole block, so a list or
 * grid cascades in without wrapping its items. `once={false}` hides the
 * content again when it leaves the view, so it replays on the way back.
 *
 * Plain CSS transitions released by a `data-shown` attribute; the observer
 * sets it once and there are no per-frame renders. Reduced motion shows the
 * content straight away.
 *
 * <Reveal>
 *   <h2>Fades up on scroll</h2>
 * </Reveal>
 *
 * <Reveal enter="zoom" stagger={80} className="grid grid-cols-3 gap-4">
 *   {cards}
 * </Reveal>
 */

const revealEnters = [
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

type RevealEnter = (typeof revealEnters)[number]

// Hidden state per enter. `--reveal-distance` sets how far the moving ones travel.
const hiddenStates: Record<RevealEnter, string> = {
  fade: "",
  rise: "transform:translateY(var(--reveal-distance))",
  drop: "transform:translateY(calc(var(--reveal-distance) * -1))",
  "slide-start": "transform:translateX(calc(var(--reveal-distance) * -1))",
  "slide-end": "transform:translateX(var(--reveal-distance))",
  zoom: "transform:scale(.9)",
  pop: "transform:scale(.4)",
  spin: "transform:rotate(-90deg) scale(.6)",
  blur: "filter:blur(12px);transform:scale(1.04)",
}

// The animated element is the Reveal itself, or each direct child when it staggers.
const target = (state: string) =>
  `[data-slot=reveal]:not([data-stagger])${state},[data-slot=reveal][data-stagger]${state}>*`

const revealStyles = [
  `${target("")}{transition-property:opacity,transform,filter;transition-duration:var(--reveal-duration);transition-timing-function:cubic-bezier(.22,1,.36,1)}`,
  `${target("[data-reveal=pop]")}{transition-timing-function:cubic-bezier(.34,1.56,.64,1)}`,
  `${target("[data-shown]")}{transition-delay:calc(var(--reveal-delay) + var(--reveal-index, 0) * var(--reveal-stagger))}`,
  `${target(":not([data-shown])")}{opacity:0}`,
  ...revealEnters
    .filter((enter) => hiddenStates[enter])
    .map((enter) => `${target(`[data-reveal=${enter}]:not([data-shown])`)}{${hiddenStates[enter]}}`),
  `@media (prefers-reduced-motion:reduce){${target("")}{transition:none!important;opacity:1!important;transform:none!important;filter:none!important}}`,
].join("\n")

type RevealOptions = {
  /** Keep the content shown after its first reveal. Default true. */
  once?: boolean
  /** Share of the element that must be visible, 0 to 1. Default 0.2. */
  threshold?: number
  /** Grows or shrinks the view, e.g. `"0px 0px -10% 0px"` to wait a little longer. */
  rootMargin?: string
}

/**
 * Whether the element has scrolled into view. With `once` (the default) it
 * stays true after the first time. Use it to drive your own animation.
 */
function useReveal(
  ref: React.RefObject<HTMLElement | null>,
  { once = true, threshold = 0.2, rootMargin }: RevealOptions = {}
) {
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(frame)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          setShown(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setShown(false)
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [once, ref, rootMargin, threshold])

  return shown
}

function Reveal({
  enter = "rise",
  delay = 0,
  duration = 700,
  distance = 24,
  stagger,
  once,
  threshold,
  rootMargin,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> &
  RevealOptions & {
    /** How the content arrives. Default `rise`. */
    enter?: RevealEnter
    /** ms before it starts. */
    delay?: number
    /** ms. Default 700. */
    duration?: number
    /** px that `rise`, `drop` and the slides travel. Default 24. */
    distance?: number
    /** ms between direct children; each child animates on its own. */
    stagger?: number
  }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const shown = useReveal(ref, { once, threshold, rootMargin })

  // Index the children in the DOM so staggering needs no wrappers.
  React.useEffect(() => {
    const node = ref.current
    if (!node || stagger === undefined) return
    Array.from(node.children).forEach((child, index) => {
      if (child instanceof HTMLElement) child.style.setProperty("--reveal-index", String(index))
    })
  }, [children, stagger])

  return (
    <div
      ref={ref}
      data-slot="reveal"
      data-reveal={enter}
      data-stagger={stagger === undefined ? undefined : true}
      data-shown={shown ? true : undefined}
      style={
        {
          "--reveal-delay": `${delay}ms`,
          "--reveal-duration": `${duration}ms`,
          "--reveal-distance": `${distance}px`,
          "--reveal-stagger": `${stagger ?? 0}ms`,
          ...style,
        } as React.CSSProperties
      }
      className={className}
      {...props}
    >
      <style href="standard-reveal" precedence="default">
        {revealStyles}
      </style>
      {children}
    </div>
  )
}

export { Reveal, revealEnters, useReveal }
export type { RevealEnter, RevealOptions }
