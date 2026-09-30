"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * A paragraph with marker-pen highlights on chosen phrases.
 *
 * Static, the highlights are simply drawn. Animated, the text blurs in when
 * it scrolls into view and each highlight then sweeps across its phrase, one
 * after another.
 *
 * <TextHighlight highlights={["real-time insights"]}>…</TextHighlight>
 * <TextHighlight animate direction="right" highlights={["growth", { text: "data", occurrence: 2 }]}>…</TextHighlight>
 */

type TextHighlightBit = string | { text: string; occurrence: number }

type TextHighlightDirection = "left" | "right" | "top" | "bottom"

const sizes = {
  sm: "text-sm leading-relaxed",
  default: "text-base leading-relaxed",
  lg: "text-lg leading-relaxed",
  xl: "text-2xl leading-snug font-medium tracking-tight",
}

type Segment = { text: string; highlighted: boolean }

// Where the sweep starts, and the collapsed size it grows from.
const sweeps: Record<
  TextHighlightDirection,
  { position: string; from: string }
> = {
  left: { position: "left center", from: "0% 100%" },
  right: { position: "right center", from: "0% 100%" },
  top: { position: "center top", from: "100% 0%" },
  bottom: { position: "center bottom", from: "100% 0%" },
}

/** Character ranges to highlight: every match of a string, or the nth (1-based) match of an object. */
function findsRanges(text: string, highlights: TextHighlightBit[]) {
  const ranges: [number, number][] = []

  for (const bit of highlights) {
    const needle = typeof bit === "string" ? bit : bit.text
    if (!needle) continue

    let found = 0
    let from = text.indexOf(needle)
    while (from !== -1) {
      found += 1
      if (typeof bit === "string" || bit.occurrence === found) {
        ranges.push([from, from + needle.length])
      }
      from = text.indexOf(needle, from + needle.length)
    }
  }

  // Merge overlaps so a phrase is marked once.
  ranges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const range of ranges) {
    const last = merged[merged.length - 1]
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1])
    else merged.push([...range])
  }
  return merged
}

function splitsText(text: string, highlights: TextHighlightBit[]) {
  const segments: Segment[] = []
  let cursor = 0
  for (const [start, end] of findsRanges(text, highlights)) {
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), highlighted: false })
    }
    segments.push({ text: text.slice(start, end), highlighted: true })
    cursor = end
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false })
  }
  return segments
}

/** True while the element is in view; stays true after the first entry when `once`. */
function useInView(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  once: boolean
) {
  const [inView, setInView] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!enabled || !element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin: "-20% 0px", threshold: 0.3 }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, enabled, once])

  return inView
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)"

function subscribesReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

const readsReducedMotion = () => window.matchMedia(reducedMotionQuery).matches
const readsNoReducedMotion = () => false

function TextHighlight({
  children,
  highlights = [],
  animate: animateProp = false,
  direction = "left",
  color = "color-mix(in oklab, var(--warning, oklch(0.85 0.17 90)) 45%, transparent)",
  delay = 0.4,
  duration = 0.8,
  stagger = 0.15,
  blur = 8,
  inactiveOpacity = 0.3,
  once = true,
  size = "default",
  highlightClassName,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"p">, "children"> & {
  children: string
  /** Phrases to mark. A string marks every match; `{ text, occurrence }` marks only the nth. */
  highlights?: TextHighlightBit[]
  /** Blur the text in and sweep the highlights when it scrolls into view. */
  animate?: boolean
  /** The side the sweep starts from. */
  direction?: TextHighlightDirection
  /** Highlight color; any CSS color. */
  color?: string
  /** Seconds from entering view to the first sweep. */
  delay?: number
  /** Seconds each sweep takes; the blur-in takes the same. */
  duration?: number
  /** Seconds between one highlight's sweep and the next. */
  stagger?: number
  /** Starting blur in pixels, before the text is in view. */
  blur?: number
  /** Starting opacity, before the text is in view. */
  inactiveOpacity?: number
  /** Play once, or reset each time the text leaves view. */
  once?: boolean
  size?: keyof typeof sizes
  highlightClassName?: string
}) {
  const ref = React.useRef<HTMLParagraphElement>(null)
  // Reduced motion gets the finished, static highlights.
  const reducedMotion = React.useSyncExternalStore(
    subscribesReducedMotion,
    readsReducedMotion,
    readsNoReducedMotion
  )
  const animate = animateProp && !reducedMotion
  const inView = useInView(ref, animate, once)
  const shown = !animate || inView
  const sweep = sweeps[direction]

  let highlightIndex = 0
  const segments = splitsText(children, highlights).map((segment, index) => {
    if (!segment.highlighted) {
      return <React.Fragment key={index}>{segment.text}</React.Fragment>
    }

    const order = highlightIndex++
    return (
      <mark
        key={index}
        data-slot="text-highlight-mark"
        className={cn(
          "rounded-xs bg-transparent bg-no-repeat px-0.5 text-inherit",
          highlightClassName
        )}
        style={{
          backgroundImage: `linear-gradient(${color}, ${color})`,
          // Each wrapped line gets its own rounded ends.
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
          backgroundPosition: sweep.position,
          backgroundSize: shown ? "100% 100%" : sweep.from,
          transition: animate
            ? `background-size ${duration}s cubic-bezier(0.65, 0, 0.35, 1) ${shown ? delay + order * stagger : 0}s`
            : undefined,
        }}
      >
        {segment.text}
      </mark>
    )
  })

  return (
    <p
      ref={ref}
      data-slot="text-highlight"
      data-state={animate ? (inView ? "in" : "out") : undefined}
      className={cn(sizes[size], className)}
      style={{
        ...(animate
          ? {
              filter: inView ? "blur(0px)" : `blur(${blur}px)`,
              opacity: inView ? 1 : inactiveOpacity,
              transition: `filter ${duration}s ease-out, opacity ${duration}s ease-out`,
            }
          : null),
        ...style,
      }}
      {...props}
    >
      {segments}
    </p>
  )
}

export { TextHighlight }
export type { TextHighlightBit, TextHighlightDirection }
