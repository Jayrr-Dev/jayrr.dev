"use client"

import * as React from "react"
import { cn } from "cn"

function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduce(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  return reduce
}

/** Holds `false` until the element scrolls into view, then stays `true`. */
function useSeen(ref: React.RefObject<Element | null>, enabled: boolean) {
  const [seen, setSeen] = React.useState(!enabled)

  React.useEffect(() => {
    const element = ref.current
    if (seen || !element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setSeen(true)
        observer.disconnect()
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, seen])

  return seen
}

/**
 * A sideways-only blur, set per frame, so fast motion smears along the
 * direction of travel instead of fogging over.
 */
function useSmear(maxBlur: number) {
  const id = `number-speed-${React.useId().replace(/[^\w-]/g, "")}`
  const blurRef = React.useRef<SVGFEGaussianBlurElement>(null)
  const smear = React.useCallback(
    (amount: number) => {
      const blur = Math.min(maxBlur, Math.max(0, amount))
      blurRef.current?.setAttribute("stdDeviation", `${blur.toFixed(2)} 0`)
    },
    [maxBlur]
  )
  const filter = (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id={id} x="-25%" y="0" width="150%" height="100%">
        <feGaussianBlur ref={blurRef} stdDeviation="0 0" />
      </filter>
    </svg>
  )

  return { filter, url: `url(#${id})`, smear }
}

const decimalsOf = (n: number) => (String(n).split(".")[1] ?? "").length

/** Formats with `locale`, swapping the grouping mark for `separator` when set. */
function useFormat({
  decimals,
  locale,
  separator,
}: {
  decimals: number
  locale?: string
  separator?: string
}) {
  const format = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [locale, decimals]
  )

  return React.useCallback(
    (n: number) =>
      separator === undefined
        ? format.format(n)
        : format
            .formatToParts(n)
            .map((part) => (part.type === "group" ? separator : part.value))
            .join(""),
    [format, separator]
  )
}

type NumberBaseProps = Omit<React.ComponentProps<"span">, "children"> & {
  from?: number
  durationMs?: number
  /** Decimal places kept. Defaults to the most in `from` or the target. */
  decimals?: number
  locale?: string
  /** Replaces the locale's grouping mark. Pass "" to drop it. */
  separator?: string
  prefix?: string
  suffix?: string
  /** Hold the run until the number scrolls into view. */
  startOnView?: boolean
}

/**
 * Counts from `from` to `to`, easing out as it lands. `direction="down"`
 * runs it the other way. Width is held for the longest value, so the
 * text around it never shifts.
 */
function NumberCountUp({
  to,
  from = 0,
  direction = "up",
  durationMs = 2000,
  delayMs = 0,
  decimals,
  locale,
  separator,
  prefix = "",
  suffix = "",
  startOnView = true,
  onStart,
  onEnd,
  className,
  ...props
}: NumberBaseProps & {
  to: number
  direction?: "up" | "down"
  delayMs?: number
  onStart?: () => void
  onEnd?: () => void
}) {
  const reduceMotion = usePrefersReducedMotion()
  const rootRef = React.useRef<HTMLSpanElement>(null)
  const started = useSeen(rootRef, startOnView)
  const [start, end] = direction === "down" ? [to, from] : [from, to]
  const [shown, setShown] = React.useState(start)
  const format = useFormat({
    decimals: decimals ?? Math.max(decimalsOf(from), decimalsOf(to)),
    locale,
    separator,
  })
  const began = React.useEffectEvent(() => onStart?.())
  const ended = React.useEffectEvent(() => onEnd?.())

  React.useEffect(() => {
    if (!started) return
    if (reduceMotion) {
      began()
      ended()
      return
    }

    let frame = 0
    const timer = window.setTimeout(() => {
      began()
      const t0 = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / durationMs)
        // Exponential ease-out: quick off the mark, a long soft landing.
        const eased = t === 1 ? 1 : 1 - 2 ** (-10 * t)
        setShown(start + (end - start) * eased)
        if (t < 1) frame = requestAnimationFrame(tick)
        else ended()
      }
      frame = requestAnimationFrame(tick)
    }, delayMs)

    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [started, start, end, durationMs, delayMs, reduceMotion])

  const text = (n: number) => `${prefix}${format(n)}${suffix}`

  return (
    <span
      ref={rootRef}
      data-slot="number-count-up"
      className={cn("inline-grid tabular-nums", className)}
      {...props}
    >
      <span className="sr-only">{text(end)}</span>
      {/* Both ends sit invisibly in the cell, so the wider one holds the width. */}
      <span aria-hidden="true" className="invisible [grid-area:1/1]">
        {text(start)}
      </span>
      <span aria-hidden="true" className="invisible [grid-area:1/1]">
        {text(end)}
      </span>
      <span aria-hidden="true" className="text-end [grid-area:1/1]">
        {text(reduceMotion ? end : shown)}
      </span>
    </span>
  )
}

/**
 * Races a number up to `value`, smearing sideways and stretching while it
 * moves fast, then snapping sharp as it lands.
 */
function NumberSpeed({
  value,
  from = 0,
  durationMs = 2200,
  decimals,
  locale,
  separator,
  prefix = "",
  suffix = "",
  loop = false,
  loopDelayMs = 900,
  startOnView = true,
  blurStrength = 1,
  maxBlur = 10,
  className,
  ...props
}: NumberBaseProps & {
  value: number
  loop?: boolean
  loopDelayMs?: number
  /** How readily speed turns into blur. */
  blurStrength?: number
  /** Upper bound on the blur radius, in pixels. */
  maxBlur?: number
}) {
  const reduceMotion = usePrefersReducedMotion()
  const rootRef = React.useRef<HTMLSpanElement>(null)
  const layerRef = React.useRef<HTMLSpanElement>(null)
  const started = useSeen(rootRef, startOnView)
  const { filter, url, smear } = useSmear(maxBlur)
  const [shown, setShown] = React.useState(from)
  const format = useFormat({
    decimals: decimals ?? Math.max(decimalsOf(from), decimalsOf(value)),
    locale,
    separator,
  })

  React.useEffect(() => {
    if (!started || reduceMotion) return

    let frame = 0
    let timer = 0
    const run = () => {
      const start = performance.now()
      let lastEased = 0
      let lastNow = start

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs)
        const eased = 1 - (1 - t) ** 4
        // 1 = the average pace of the whole run; the start is ~4x that.
        const speed =
          ((eased - lastEased) / Math.max(1, now - lastNow)) * durationMs
        lastEased = eased
        lastNow = now

        setShown(from + (value - from) * eased)
        smear(speed * 3 * blurStrength)
        if (layerRef.current) {
          layerRef.current.style.transform = `scaleX(${1 + Math.min(speed, 4) * 0.03})`
        }

        if (t < 1) frame = requestAnimationFrame(tick)
        else if (loop) timer = window.setTimeout(run, loopDelayMs)
      }

      frame = requestAnimationFrame(tick)
    }

    run()
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      smear(0)
    }
  }, [
    started,
    value,
    from,
    durationMs,
    loop,
    loopDelayMs,
    blurStrength,
    smear,
    reduceMotion,
  ])

  const text = (n: number) => `${prefix}${format(n)}${suffix}`

  return (
    <span
      ref={rootRef}
      data-slot="number-speed"
      className={cn(
        "relative inline-grid font-semibold italic tabular-nums",
        className
      )}
      {...props}
    >
      {filter}
      <span className="sr-only">{text(value)}</span>
      {/* The final value holds the width, so nothing shifts as digits arrive. */}
      <span aria-hidden="true" className="invisible [grid-area:1/1]">
        {text(value)}
      </span>
      <span
        ref={layerRef}
        aria-hidden="true"
        className="text-center [grid-area:1/1]"
        style={{ filter: url }}
      >
        {text(reduceMotion ? value : shown)}
      </span>
    </span>
  )
}

const isDigit = (char: string) => char >= "0" && char <= "9"

/** One click of a split-flap wheel: digits roll forward, anything else jumps. */
function stepToward(face: string, target: string) {
  if (!isDigit(target)) return target
  if (!isDigit(face)) return "0"
  return String((Number(face) + 1) % 10)
}

function FlipHalf({
  char,
  side,
  ref,
  className,
}: {
  char: string
  side: "top" | "bottom"
  ref?: React.Ref<HTMLSpanElement>
  className?: string
}) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "absolute inset-x-0 h-1/2 overflow-hidden bg-muted [backface-visibility:hidden]",
        side === "top"
          ? "top-0 origin-bottom rounded-t-[inherit] border-b border-background/60"
          : "bottom-0 origin-top rounded-b-[inherit]",
        className
      )}
    >
      {/* Twice the half's height, so the glyph sits centred on the whole card. */}
      <span
        className={cn(
          "absolute inset-x-0 flex h-[200%] items-center justify-center",
          side === "bottom" && "bottom-0"
        )}
      >
        {char}
      </span>
    </span>
  )
}

/** A single card that rolls to `char`, flipping once per step. */
function FlipCard({
  char,
  stepMs,
  reduceMotion,
}: {
  char: string
  stepMs: number
  reduceMotion: boolean
}) {
  const [face, setFace] = React.useState(char)
  const [prev, setPrev] = React.useState(char)
  const topLeafRef = React.useRef<HTMLSpanElement>(null)
  const bottomLeafRef = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    if (reduceMotion || face === char) return
    const timer = window.setTimeout(() => {
      setPrev(face)
      setFace(stepToward(face, char))
    }, stepMs)
    return () => window.clearTimeout(timer)
  }, [face, char, stepMs, reduceMotion])

  React.useLayoutEffect(() => {
    if (prev === face) return
    const half = stepMs / 2
    // The old top folds down, then the new bottom falls into place.
    const top = topLeafRef.current?.animate(
      [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }],
      { duration: half, easing: "ease-in", fill: "both" }
    )
    const bottom = bottomLeafRef.current?.animate(
      [{ transform: "rotateX(90deg)" }, { transform: "rotateX(0deg)" }],
      { duration: half, delay: half, easing: "ease-out", fill: "both" }
    )
    return () => {
      top?.cancel()
      bottom?.cancel()
    }
  }, [prev, face, stepMs])

  const shown = reduceMotion ? char : face
  const under = reduceMotion ? char : prev

  return (
    <span className="relative inline-block rounded-[0.18em] px-[0.14em] py-[0.08em] [perspective:6em]">
      {/* Blank cards still hold a digit's width. */}
      <span className="invisible">0</span>
      <FlipHalf char={shown} side="top" />
      <FlipHalf char={under} side="bottom" />
      <FlipHalf ref={topLeafRef} char={under} side="top" />
      <FlipHalf ref={bottomLeafRef} char={shown} side="bottom" />
    </span>
  )
}

/**
 * A split-flap board: each digit sits on its own card and rolls forward,
 * flipping once per number, until it reaches `value`. Changing `value`
 * rolls only the digits that differ.
 */
function NumberFlip({
  value,
  from = 0,
  stepMs = 140,
  decimals,
  locale,
  separator,
  prefix = "",
  suffix = "",
  startOnView = true,
  className,
  ...props
}: Omit<NumberBaseProps, "durationMs"> & {
  value: number
  /** How long each single flip takes. */
  stepMs?: number
}) {
  const reduceMotion = usePrefersReducedMotion()
  const rootRef = React.useRef<HTMLSpanElement>(null)
  const started = useSeen(rootRef, startOnView)
  const format = useFormat({
    decimals: decimals ?? Math.max(decimalsOf(from), decimalsOf(value)),
    locale,
    separator,
  })
  const text = (n: number) => `${prefix}${format(n)}${suffix}`
  const target = text(value)
  // Right-aligned, so units stay over units while the length changes.
  const width = Math.max(target.length, text(from).length)
  const board = (started ? target : text(from)).padStart(width, " ")

  return (
    <span
      ref={rootRef}
      data-slot="number-flip"
      className={cn(
        "inline-flex items-center gap-[0.08em] tabular-nums",
        className
      )}
      {...props}
    >
      <span className="sr-only">{target}</span>
      {Array.from(board, (char, index) =>
        isDigit(char) || char === " " ? (
          <FlipCard
            key={width - index}
            char={char}
            stepMs={stepMs}
            reduceMotion={reduceMotion}
          />
        ) : (
          <span key={width - index} aria-hidden="true">
            {char}
          </span>
        )
      )}
    </span>
  )
}

export { NumberCountUp, NumberFlip, NumberSpeed }
