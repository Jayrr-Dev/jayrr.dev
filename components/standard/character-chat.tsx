"use client"

import * as React from "react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

/**
 * A visual-novel dialogue box: a speaker's name, their line typed out a
 * letter at a time, and a portrait standing beside the box. There is no
 * input; the reader clicks the box (or presses Enter or Space) to finish the
 * line, then again to move to the next one.
 *
 * Wrap words in `*asterisks*` for italics, like a sigh or an aside.
 *
 * <CharacterChat lines={[{ speaker: "Clint", text: "Why would I…" }]} />
 * <CharacterChat variant="tab" lines={lines} onComplete={endScene} />
 */

type CharacterChatVariant =
  | "default"
  | "classic"
  | "soft"
  | "tab"
  | "frame"
  | "minimal"

type CharacterChatIndicator = "arrow" | "chevrons" | "dots" | "next" | "none"

type CharacterChatLine = {
  /** Who is talking. Leave it out for narration. */
  speaker?: React.ReactNode
  /** The line. `*words*` are shown in italics. */
  text: string
  /** An image URL, or any element, standing beside the box. */
  portrait?: string | React.ReactNode
  /** Which side of the box the portrait stands on. */
  side?: "left" | "right"
  /** Accent for this speaker: the name, the name tab and the soft header. */
  color?: string
}

type Segment = { text: string; em: boolean }

/** Splits `*emphasis*` out of a line. An unclosed asterisk stays literal. */
function parsesLine(text: string): Segment[] {
  const segments: Segment[] = []
  const pattern = /\*([^*]+)\*/g
  let last = 0
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > last) segments.push({ text: text.slice(last, start), em: false })
    segments.push({ text: match[1], em: true })
    last = start + match[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last), em: false })
  return segments
}

/** How much longer than a letter each character holds before the next one. */
function pauseAfter(char: string) {
  if (char === "." || char === "!" || char === "?" || char === "…") return 7
  if (char === "," || char === ";" || char === ":" || char === "—") return 3
  return 0
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)"

function subscribesReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/**
 * How many characters of `text` are showing. Counts up at `speed` characters
 * a second, holding a little after punctuation, until `skip` is set.
 */
function useTypedCount(text: string, speed: number, skip: boolean) {
  const reduced = React.useSyncExternalStore(
    subscribesReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false
  )
  const instant = skip || speed <= 0 || reduced
  // Tagged with its line, so a new line never flashes the old count.
  const [typed, setTyped] = React.useState({ text: "", count: 0 })

  React.useEffect(() => {
    if (instant) return

    // When each character appears, in ms from the start of the line.
    const step = 1000 / speed
    const times: number[] = []
    let at = 0
    for (const char of text) {
      times.push(at)
      at += step * (1 + pauseAfter(char))
    }

    const start = performance.now()
    let frame = 0
    const ticks = (now: number) => {
      const elapsed = now - start
      let shown = 0
      while (shown < times.length && times[shown] <= elapsed) shown += 1
      setTyped({ text, count: shown })
      if (shown < times.length) frame = requestAnimationFrame(ticks)
    }
    frame = requestAnimationFrame(ticks)
    return () => cancelAnimationFrame(frame)
  }, [text, speed, instant])

  if (instant) return text.length
  return typed.text === text ? typed.count : 0
}

const variantBox: Record<CharacterChatVariant, string> = {
  default:
    "rounded-xl border border-border bg-popover text-popover-foreground shadow-lg",
  classic:
    "rounded-lg bg-black text-white shadow-[0_0_0_2px_#000,0_0_0_4px_#fff,0_0_0_5px_#000]",
  soft: "overflow-hidden rounded-md border-2 border-white/70 bg-[#2a3350]/85 text-white shadow-lg backdrop-blur-sm",
  tab: "rounded-sm border-[3px] border-[#1d1b18] bg-[#efe6cf] text-[#1d1b18] shadow-[4px_4px_0_#1d1b18] [background-image:radial-gradient(rgb(0_0_0/0.09)_1px,transparent_1.2px)] [background-size:8px_8px]",
  frame:
    "rounded-sm border-2 border-[#8d8f93] bg-[linear-gradient(to_bottom,#1c1c1f,#0d0d0f)] text-neutral-100 shadow-[inset_0_0_0_2px_#2a2a2e,inset_0_0_0_3px_#5b5d62,0_0_0_2px_#111,0_10px_30px_-10px_rgb(0_0_0/0.7)]",
  minimal:
    "rounded-none bg-black/70 text-white backdrop-blur-sm after:pointer-events-none after:absolute after:inset-1.5 after:border after:border-white/75",
}

const variantName: Record<CharacterChatVariant, string> = {
  default: "text-sm font-semibold text-(--character-chat-accent)",
  classic: "text-sm font-medium text-neutral-400",
  soft: "text-sm font-medium",
  tab: "font-extrabold tracking-wide",
  frame: "text-base font-extrabold uppercase tracking-wide",
  minimal: "text-sm font-medium",
}

const variantIndicator: Record<CharacterChatVariant, CharacterChatIndicator> = {
  default: "arrow",
  classic: "chevrons",
  soft: "arrow",
  tab: "arrow",
  frame: "dots",
  minimal: "next",
}

const variantAccent: Record<CharacterChatVariant, string> = {
  default: "var(--primary)",
  classic: "#fff",
  soft: "#f08ca0",
  tab: "#1d1b18",
  frame: "#fff",
  minimal: "#fff",
}

const sizes = {
  sm: { text: "text-sm", box: "min-h-24", portrait: "6rem" },
  default: { text: "text-base", box: "min-h-28", portrait: "8rem" },
  lg: { text: "text-lg", box: "min-h-36", portrait: "10rem" },
} as const

function CharacterChatIndicatorMark({
  kind,
  className,
}: {
  kind: CharacterChatIndicator
  className?: string
}) {
  if (kind === "none") return null
  return (
    <span
      aria-hidden
      data-slot="character-chat-indicator"
      className={cn(
        "pointer-events-none flex items-center leading-none select-none",
        className
      )}
    >
      {kind === "arrow" ? (
        <svg
          viewBox="0 0 12 12"
          className="size-3 animate-bounce fill-current motion-reduce:animate-none"
        >
          <path d="M1 2h10L6 10Z" />
        </svg>
      ) : kind === "chevrons" ? (
        <span className="animate-pulse text-xs font-bold tracking-tighter opacity-70 motion-reduce:animate-none">
          &gt;&gt;
        </span>
      ) : kind === "dots" ? (
        <span className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="size-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none"
              style={{ animationDelay: `${dot * 180}ms` }}
            />
          ))}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs opacity-80">
          next
          <svg viewBox="0 0 12 12" className="size-2.5 fill-none stroke-current">
            <path d="M3 1.5 9 6l-6 4.5Z" strokeWidth="1.3" />
          </svg>
        </span>
      )}
    </span>
  )
}

function CharacterChatThinking() {
  return (
    <span
      aria-hidden
      data-slot="character-chat-thinking"
      className="flex h-[1.6em] items-center gap-1.5"
    >
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="size-2 animate-bounce rounded-full bg-current opacity-70 motion-reduce:animate-none"
          style={{ animationDelay: `${dot * 140}ms` }}
        />
      ))}
    </span>
  )
}

function CharacterChatPortrait({
  portrait,
}: {
  portrait: CharacterChatLine["portrait"]
}) {
  if (portrait == null || portrait === false) return null
  return (
    <div
      aria-hidden
      data-slot="character-chat-portrait"
      className="relative z-10 flex w-(--character-chat-portrait) shrink-0 items-end self-end"
    >
      {typeof portrait === "string" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={portrait}
          alt=""
          draggable={false}
          className="block h-auto w-full select-none"
        />
      ) : (
        portrait
      )}
    </div>
  )
}

function CharacterChat({
  lines,
  index,
  defaultIndex = 0,
  onIndexChange,
  onComplete,
  variant = "default",
  size = "default",
  speed = 45,
  autoAdvance,
  thinking = false,
  indicator,
  trailing,
  className,
  style,
  onClick,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  lines: CharacterChatLine[]
  /** The line on show. Pass it to control the box; leave it out otherwise. */
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  /** Fires when the reader advances past the last line. */
  onComplete?: () => void
  variant?: CharacterChatVariant
  size?: keyof typeof sizes
  /** Characters a second. 0 shows each line at once. */
  speed?: number
  /** Move on by itself this many ms after a line finishes. */
  autoAdvance?: number
  /** Show bouncing dots in place of the line, while it's being written. */
  thinking?: boolean
  /** The "continue" mark once a line is done. Each variant has its own default. */
  indicator?: CharacterChatIndicator
  /** Controls beside the box, like save, replay or history buttons. */
  trailing?: React.ReactNode
}) {
  const last = Math.max(0, lines.length - 1)
  const [current, setCurrent] = useControllableState({
    value: index,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  })
  const lineIndex = Math.min(Math.max(0, current), last)
  const line = lines[lineIndex] as CharacterChatLine | undefined

  const segments = React.useMemo(() => parsesLine(line?.text ?? ""), [line])
  const plain = React.useMemo(
    () => segments.map((segment) => segment.text).join(""),
    [segments]
  )

  // Skipping belongs to one line; a new line starts typing again.
  const [skipped, setSkipped] = React.useState<number | null>(null)
  const typed = useTypedCount(
    thinking ? "" : plain,
    speed,
    skipped === lineIndex
  )
  const done = !thinking && typed >= plain.length

  const advances = React.useCallback(() => {
    if (thinking || !line) return
    if (!done) {
      setSkipped(lineIndex)
      return
    }
    if (lineIndex >= last) {
      onComplete?.()
      return
    }
    setSkipped(null)
    setCurrent(lineIndex + 1)
  }, [done, last, line, lineIndex, onComplete, setCurrent, thinking])

  React.useEffect(() => {
    if (!done || autoAdvance == null) return
    const timer = window.setTimeout(advances, autoAdvance)
    return () => window.clearTimeout(timer)
  }, [advances, autoAdvance, done])

  const side = line?.side ?? "left"
  const hasPortrait = line?.portrait != null && line.portrait !== false
  const mark = indicator ?? variantIndicator[variant]
  const sized = sizes[size]

  // The portrait overlaps the box by this much; the words sit clear of it.
  const overlap = "calc(var(--character-chat-portrait) * 0.45)"
  const boxStyle: Record<string, string> = {
    "--character-chat-pad-x": "1.25rem",
    "--character-chat-inset": hasPortrait ? `calc(${overlap} + 1rem)` : "1rem",
  }
  if (hasPortrait) {
    const edge = side === "right" ? "Right" : "Left"
    boxStyle[`margin${edge}`] = `calc(${overlap} * -1)`
    boxStyle[`padding${edge}`] = `calc(${overlap} + var(--character-chat-pad-x))`
  }

  // Reveal the line segment by segment; the unrevealed rest stays in place,
  // invisible, so the box never reflows as it types.
  let remaining = typed
  const rendered = segments.map((segment, position) => {
    const shown = segment.text.slice(0, Math.max(0, remaining))
    const hidden = segment.text.slice(shown.length)
    remaining -= segment.text.length
    const Tag = segment.em ? "em" : React.Fragment
    return (
      <Tag key={position}>
        {shown}
        {hidden ? <span className="opacity-0">{hidden}</span> : null}
      </Tag>
    )
  })

  const name = line?.speaker
  const nameTag =
    name == null ? null : variant === "tab" ? (
      <span
        data-slot="character-chat-name"
        className={cn(
          "absolute -top-4 z-10 -skew-x-6 border-[3px] border-[#1d1b18] bg-[#efe6cf] px-3 py-0.5 shadow-[3px_3px_0_#1d1b18]",
          side === "right" ? "right-(--character-chat-inset)" : "left-(--character-chat-inset)",
          variantName.tab
        )}
      >
        <span className="inline-block skew-x-6">{name}</span>
      </span>
    ) : variant === "soft" ? (
      <div
        data-slot="character-chat-name"
        className={cn(
          "-mx-(--character-chat-pad-x) -mt-3 mb-2 flex items-center bg-(--character-chat-accent) px-(--character-chat-pad-x) py-1 text-[#3a2130]",
          variantName.soft
        )}
      >
        {name}
      </div>
    ) : variant === "minimal" ? (
      <div
        data-slot="character-chat-name"
        className={cn(
          "mb-1 flex justify-end",
          variantName.minimal
        )}
      >
        <span className="border-b border-white/70 px-1 pb-0.5">{name}</span>
      </div>
    ) : (
      <div
        data-slot="character-chat-name"
        className={cn("mb-1", variantName[variant])}
      >
        {name}
        {variant === "frame" ? ":" : null}
      </div>
    )

  return (
    <div
      data-slot="character-chat"
      data-variant={variant}
      data-side={side}
      className={cn(
        "flex w-full items-end gap-2",
        side === "right" && "flex-row-reverse",
        className
      )}
      style={
        {
          "--character-chat-portrait": sized.portrait,
          "--character-chat-accent": line?.color ?? variantAccent[variant],
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 items-end",
          side === "right" && "flex-row-reverse",
          variant === "tab" && "pt-4"
        )}
      >
        {hasPortrait ? <CharacterChatPortrait portrait={line?.portrait} /> : null}

        <div
          role="button"
          tabIndex={0}
          data-slot="character-chat-box"
          data-done={done || undefined}
          aria-label={
            done && lineIndex >= last ? "Dialogue finished" : "Continue dialogue"
          }
          aria-roledescription="dialogue"
          onClick={(event) => {
            onClick?.(event)
            if (!event.defaultPrevented) advances()
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (event.defaultPrevented) return
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              advances()
            }
          }}
          className={cn(
            "relative flex min-w-0 flex-1 cursor-pointer flex-col px-(--character-chat-pad-x) py-3 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            sized.box,
            variantBox[variant]
          )}
          style={boxStyle}
        >
          {nameTag}

          <p
            aria-hidden
            data-slot="character-chat-text"
            className={cn(
              "leading-relaxed text-pretty whitespace-pre-line",
              sized.text,
              variant === "tab" && "mt-3 font-medium",
              variant === "frame" && "text-neutral-200"
            )}
          >
            {thinking ? <CharacterChatThinking /> : rendered}
          </p>

          {/* The whole line, announced once, rather than letter by letter. */}
          <span className="sr-only" aria-live="polite">
            {thinking
              ? "Writing…"
              : `${typeof name === "string" ? `${name}: ` : ""}${plain}`}
          </span>

          <CharacterChatIndicatorMark
            kind={mark}
            className={cn(
              "absolute transition-opacity duration-200",
              done ? "opacity-100" : "opacity-0",
              mark === "chevrons" ? "top-2 right-3" : "right-3 bottom-2",
              variant === "tab" && "right-2 bottom-1.5",
              variant === "minimal" && "right-4 bottom-3"
            )}
          />
        </div>
      </div>

      {trailing ? (
        <div
          data-slot="character-chat-trailing"
          className="flex shrink-0 flex-col gap-1.5 self-center"
        >
          {trailing}
        </div>
      ) : null}
    </div>
  )
}

export { CharacterChat }
export type { CharacterChatLine, CharacterChatVariant, CharacterChatIndicator }
