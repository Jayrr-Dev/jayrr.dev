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
  }, [current, cycles, lines.length, typeMs, deleteMs, holdMs, gapMs, reduceMotion])

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
  { live = true, charsPerSecond = 40 }: { live?: boolean; charsPerSecond?: number } = {}
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

export {
  TextCaret,
  TextDots,
  TextPop,
  TextReveal,
  TextTypewriter,
  TextWiggle,
  useTextReveal,
}
