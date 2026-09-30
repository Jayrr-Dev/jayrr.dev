"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"
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

function TextCaret({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="text-caret"
      aria-hidden="true"
      className={cn(
        "ml-[0.08em] inline-block h-[0.9em] w-[0.08em] animate-text-caret bg-current align-[-0.08em] motion-reduce:hidden",
        className
      )}
      {...props}
    />
  )
}

/** Wraps every run of ! or ? so it bounces; everything else stays plain text. */
function wiggleMarks(text: string) {
  return text.split(/([!?]+)/g).map((chunk, index) => {
    if (!chunk || !/^[!?]+$/.test(chunk)) return chunk

    return (
      <span
        key={index}
        data-slot="text-mark"
        className={cn(
          "inline-block origin-[50%_80%] motion-reduce:animate-none",
          chunk.includes("!") ? "animate-text-bang" : "animate-text-ask"
        )}
      >
        {chunk}
      </span>
    )
  })
}

function TextWiggle({
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & { children: string }) {
  return (
    <span data-slot="text-wiggle" className={className} {...props}>
      {wiggleMarks(children)}
    </span>
  )
}

/** Trailing "..." that counts up. The dots always take their full width, so nothing shifts. */
function TextDots({
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & { children?: string }) {
  return (
    <span data-slot="text-dots" className={className} {...props}>
      {children}
      <span
        aria-hidden="true"
        className="inline-block animate-text-dots motion-reduce:animate-none"
      >
        ...
      </span>
    </span>
  )
}

function TextPop({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="text-pop"
      className={cn(
        "inline-block animate-text-pop motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

/**
 * Fades text in slowly, one word after another. `by="text"` fades the
 * whole string at once instead.
 */
function TextFade({
  children,
  by = "word",
  durationMs = 1200,
  staggerMs = 120,
  delayMs = 0,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  children: string
  by?: "word" | "text"
  durationMs?: number
  staggerMs?: number
  delayMs?: number
}) {
  const fade = (order: number): React.CSSProperties => ({
    animationDuration: `${durationMs}ms`,
    animationDelay: `${delayMs + order * staggerMs}ms`,
  })
  const piece = "inline-block animate-text-fade motion-reduce:animate-none"

  if (by === "text") {
    return (
      <span
        data-slot="text-fade"
        className={cn(piece, className)}
        style={fade(0)}
        {...props}
      >
        {children}
      </span>
    )
  }

  let order = 0
  return (
    <span data-slot="text-fade" className={className} {...props}>
      {children.split(/(\s+)/).map((chunk, index) =>
        !chunk || /^\s+$/.test(chunk) ? (
          chunk
        ) : (
          <span key={index} className={piece} style={fade(order++)}>
            {chunk}
          </span>
        )
      )}
    </span>
  )
}

/**
 * Types `text` out. Pass an array to cycle: type, hold, delete, next.
 * A single string types once unless `loop` is set.
 */
function TextTypewriter({
  text,
  loop,
  typeMs = 55,
  deleteMs = 25,
  holdMs = 2500,
  gapMs = 400,
  caret = true,
  wiggle = false,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  text: string | readonly string[]
  loop?: boolean
  typeMs?: number
  deleteMs?: number
  holdMs?: number
  gapMs?: number
  caret?: boolean
  wiggle?: boolean
}) {
  const reduceMotion = usePrefersReducedMotion()
  const lines = React.useMemo(
    () => (typeof text === "string" ? [text] : [...text]),
    // Compare by content so inline arrays don't restart the animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typeof text === "string" ? text : text.join("\u0000")]
  )
  const cycles = loop ?? lines.length > 1
  const [index, setIndex] = React.useState(0)
  const [shown, setShown] = React.useState("")
  const current = lines[index % lines.length] ?? ""

  React.useEffect(() => {
    if (reduceMotion) {
      setShown(current)
      if (!cycles) return
      const timer = window.setTimeout(
        () => setIndex((value) => (value + 1) % lines.length),
        holdMs
      )
      return () => window.clearTimeout(timer)
    }

    const chars = Array.from(current)
    let timer = 0
    let cancelled = false
    const later = (ms: number, fn: () => void) => {
      timer = window.setTimeout(() => {
        if (!cancelled) fn()
      }, ms)
    }

    const type = (count: number) => {
      setShown(chars.slice(0, count).join(""))
      if (count < chars.length) return later(typeMs, () => type(count + 1))
      if (cycles) later(holdMs, () => erase(chars.length))
    }

    const erase = (count: number) => {
      setShown(chars.slice(0, count).join(""))
      if (count > 0) return later(deleteMs, () => erase(count - 1))
      later(gapMs, () => setIndex((value) => (value + 1) % lines.length))
    }

    setShown("")
    later(typeMs, () => type(1))

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [
    current,
    cycles,
    lines.length,
    typeMs,
    deleteMs,
    holdMs,
    gapMs,
    reduceMotion,
  ])

  return (
    <span
      data-slot="text-typewriter"
      aria-label={current}
      className={cn("whitespace-pre-wrap", className)}
      {...props}
    >
      <span aria-hidden="true">{wiggle ? wiggleMarks(shown) : shown}</span>
      {caret ? <TextCaret /> : null}
    </span>
  )
}

/**
 * Reveals `source` at a capped rate while `live`, for streamed text that
 * arrives in bursts. Text that was never live shows in full straight away.
 */
function useTextReveal(
  source: string,
  {
    live = true,
    charsPerSecond = 40,
  }: { live?: boolean; charsPerSecond?: number } = {}
) {
  const reduceMotion = usePrefersReducedMotion()
  const paced = React.useRef(live)
  if (live) paced.current = true

  const [shown, setShown] = React.useState(() => (live ? "" : source))
  const shownRef = React.useRef(shown)
  shownRef.current = shown

  React.useEffect(() => {
    if (reduceMotion || !paced.current) {
      shownRef.current = source
      setShown(source)
      return
    }

    let frame = 0
    let last = performance.now()
    let carry = 0

    const tick = (now: number) => {
      carry += ((now - last) / 1000) * charsPerSecond
      last = now
      const add = Math.floor(carry)
      carry -= add

      const prev = shownRef.current
      const next = source.startsWith(prev)
        ? source.slice(0, Math.min(source.length, prev.length + add))
        : source.slice(0, Math.max(add, 1))

      if (next !== prev) {
        shownRef.current = next
        setShown(next)
      }
      if (next.length < source.length) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [source, charsPerSecond, reduceMotion])

  return shown
}

function TextReveal({
  text,
  live = true,
  charsPerSecond,
  caret = true,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  text: string
  live?: boolean
  charsPerSecond?: number
  caret?: boolean
}) {
  const shown = useTextReveal(text, { live, charsPerSecond })
  const typing = shown.length < text.length

  return (
    <span
      data-slot="text-reveal"
      className={cn("whitespace-pre-wrap", className)}
      {...props}
    >
      {shown}
      {caret && typing ? <TextCaret /> : null}
    </span>
  )
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
  const id = `text-speed-${React.useId().replace(/[^\w-]/g, "")}`
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

/** Words that race past one after another, in place, smearing sideways as they move. */
function TextSpeed({
  words,
  holdMs = 1400,
  swapMs = 520,
  travel = 1.2,
  startOnView = true,
  blurStrength = 1,
  maxBlur = 10,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  words: readonly string[]
  holdMs?: number
  swapMs?: number
  /** How far a swapping word travels, in em. */
  travel?: number
  /** Hold the cycle until the text scrolls into view. */
  startOnView?: boolean
  /** How readily speed turns into blur. */
  blurStrength?: number
  /** Upper bound on the blur radius, in pixels. */
  maxBlur?: number
}) {
  const reduceMotion = usePrefersReducedMotion()
  const rootRef = React.useRef<HTMLSpanElement>(null)
  const slotRefs = [
    React.useRef<HTMLSpanElement>(null),
    React.useRef<HTMLSpanElement>(null),
  ]
  const started = useSeen(rootRef, startOnView)
  const { filter, url, smear } = useSmear(maxBlur)
  // Compare by content so inline arrays don't restart the animation.
  const wordsKey = words.join("\u0000")
  const list = React.useMemo(() => wordsKey.split("\u0000"), [wordsKey])
  // Two slots trade places: one races in while the other races out.
  const [slots, setSlots] = React.useState({
    texts: [list[0] ?? "", ""],
    active: 0,
  })

  React.useEffect(() => {
    if (!started || list.length < 2) return

    let frame = 0
    let timer = 0
    let index = 0
    let active = 0
    const place = (slot: number, x: number, opacity: number) => {
      const element = slotRefs[slot]?.current
      if (!element) return
      element.style.transform = `translateX(${x}em)`
      element.style.opacity = `${opacity}`
    }

    const swap = () => {
      index = (index + 1) % list.length
      const incoming = 1 - active
      const outgoing = active
      active = incoming
      ReactDOM.flushSync(() =>
        setSlots(({ texts }) => {
          const next = [...texts]
          next[incoming] = list[index] ?? ""
          return { texts: next, active: incoming }
        })
      )

      if (reduceMotion) {
        place(incoming, 0, 1)
        place(outgoing, 0, 0)
        timer = window.setTimeout(swap, holdMs)
        return
      }

      const start = performance.now()
      let lastEased = 0
      let lastNow = start
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / swapMs)
        const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
        const speed =
          ((eased - lastEased) / Math.max(1, now - lastNow)) * swapMs
        lastEased = eased
        lastNow = now

        place(incoming, travel * (1 - eased), eased)
        place(outgoing, -travel * eased, 1 - eased)
        smear(speed * 4 * blurStrength)

        if (t < 1) frame = requestAnimationFrame(tick)
        else timer = window.setTimeout(swap, holdMs)
      }
      frame = requestAnimationFrame(tick)
    }

    timer = window.setTimeout(swap, holdMs)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      smear(0)
    }
    // Slot refs are stable; listing them would restart the cycle every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, list, holdMs, swapMs, travel, blurStrength, smear, reduceMotion])

  return (
    <span
      ref={rootRef}
      data-slot="text-speed"
      className={cn("relative inline-grid font-semibold italic", className)}
      {...props}
    >
      {filter}
      <span className="sr-only" aria-live="polite">
        {slots.texts[slots.active]}
      </span>
      {/* Every word sits invisibly in the same cell, so the widest holds the width. */}
      {list.map((word, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="invisible [grid-area:1/1]"
        >
          {word}
        </span>
      ))}
      <span
        aria-hidden="true"
        className="grid [grid-area:1/1]"
        style={{ filter: url }}
      >
        {slots.texts.map((word, slot) => (
          <span
            key={slot}
            ref={slotRefs[slot]}
            className="text-center whitespace-nowrap [grid-area:1/1]"
            style={{ opacity: slot === 0 ? 1 : 0 }}
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  )
}

export {
  TextCaret,
  TextDots,
  TextFade,
  TextPop,
  TextReveal,
  TextSpeed,
  TextTypewriter,
  TextWiggle,
  useTextReveal,
}
