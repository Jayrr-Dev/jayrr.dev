"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * Text that carries a mood. Every word becomes its own span with a stack of
 * effects: one token per slot (motion, pose, size, tracking, case, font,
 * weight, draw, ink, glow, fade). Letter effects (waves, ramps, zalgo) split
 * words further into per-letter spans.
 *
 * A mood sets the baseline stack for the whole line. Highlights pick out
 * phrases and replace the mood on just those words with a preset or tokens.
 */

const slotTokens = {
  motion: [
    "bounce", "spark", "tremble", "wobble", "pop", "jitter", "flick", "wave",
    "ripple", "frenzy", "crazy", "droop", "squirm", "shrink", "hush", "jagged",
    "peak", "blurIn", "breathe", "clench", "hacker", "float", "sway", "pulse",
    "flicker", "heartbeat", "drift", "shiver", "slam", "cascade", "scatter",
    "lift", "tilt", "murmur", "nudge", "sigh", "hum", "scaleBreath",
    "scaleWave", "scaleRipple", "hueShift", "blush", "aurora", "colorWave",
    "twirl", "twistWave", "stretch", "squash", "stretchWave", "fadeOsc",
    "fadeBreath", "fadeWave", "blinking",
  ],
  pose: [
    "crooked", "upsideDown", "confuse", "hurt", "zalgo", "lean", "mirror",
    "raised",
  ],
  size: [
    "tiny", "small", "big", "huge", "grow", "wane", "swell", "dip",
    "subscript", "superscript", "stretched", "condensed", "tall", "flat",
  ],
  tracking: ["tight", "tighter", "spaced", "wide"],
  case: ["caps", "lower", "smallCaps", "random"],
  font: [
    "italic", "script", "mono", "blackletter", "comic", "sans", "serif",
    "impact", "slab", "rounded", "copperplate", "handwritten",
  ],
  weight: ["light", "medium", "semibold", "bold", "heavy"],
  draw: ["underline", "strikethrough", "dotted", "wavy"],
  ink: [
    "gold", "honey", "amber", "crimson", "rose", "wine", "violet", "dusk",
    "sea", "moss", "midnight", "ash", "red", "orange", "yellow", "green",
    "blue", "indigo", "copper", "ivory", "blood", "fog", "pewter",
  ],
  glow: [
    "goldGlow", "ember", "moon", "frost", "violetGlow", "roseGlow", "mossGlow",
    "ghostGlow", "outline", "paleOutline", "thickOutline", "dropShadow",
  ],
  fade: ["mist", "soft", "dim", "washed", "ghost", "sheer"],
} as const

type MoodTextSlot = keyof typeof slotTokens
type SlotToken<S extends MoodTextSlot> = (typeof slotTokens)[S][number]

const slots = Object.keys(slotTokens) as MoodTextSlot[]

type MoodTextToken = { [S in MoodTextSlot]: SlotToken<S> }[MoodTextSlot]

/** One token per slot; "none" leaves the slot alone. */
type MoodTextStack = { [S in MoodTextSlot]: SlotToken<S> | "none" }

const emptyStack: MoodTextStack = {
  motion: "none",
  pose: "none",
  size: "none",
  tracking: "none",
  case: "none",
  font: "none",
  weight: "none",
  draw: "none",
  ink: "none",
  glow: "none",
  fade: "none",
}

const tokenSlot = new Map<string, MoodTextSlot>(
  slots.flatMap((slot) =>
    slotTokens[slot].map((token) => [token, slot] as [string, MoodTextSlot])
  )
)

// Named recipes, grouped by the feeling they read as.
const moodTextPresets = {
  goldWave: ["wave", "gold", "goldGlow"],
  goldGlow: ["gold", "goldGlow"],
  radiant: ["bounce", "gold", "goldGlow"],
  gleam: ["breathe", "honey", "goldGlow"],
  voltRush: ["frenzy", "gold", "caps"],
  sunveil: ["swell", "gold", "goldGlow"],
  shimmer: ["ripple", "honey", "goldGlow"],
  cheer: ["pop", "amber", "big"],
  snarl: ["flick", "crimson", "ember"],
  wrath: ["jagged", "crimson", "ember", "caps"],
  bristle: ["flick", "crimson", "clench"],
  seethe: ["clench", "crimson", "heavy"],
  boil: ["wobble", "red", "ember"],
  venom: ["strikethrough", "crimson", "bold"],
  veilDread: ["blurIn", "violet", "hush"],
  nerveHum: ["jitter", "gold", "hush", "tight"],
  faint: ["shrink", "ash", "dim", "small"],
  phantom: ["peak", "violet", "ghost"],
  chill: ["tremble", "sea", "frost"],
  smother: ["hush", "midnight", "ghost", "small"],
  omen: ["tremble", "violet", "crooked"],
  hollow: ["droop", "dusk", "dim", "italic"],
  ache: ["jitter", "hurt", "crimson", "dim"],
  mourn: ["wane", "midnight", "dim"],
  weep: ["droop", "sea", "soft"],
  bile: ["squirm", "moss", "strikethrough"],
  curdle: ["droop", "moss", "ghost"],
  retch: ["dip", "moss", "dim"],
  sneer: ["flick", "green", "lower"],
  jolt: ["pop", "gold", "wide"],
  gasp: ["grow", "gold"],
  stun: ["swell", "frost", "wide"],
  blink: ["blurIn", "amber", "goldGlow"],
  befog: ["confuse", "dusk", "italic"],
  unravel: ["zalgo", "dusk"],
  scramble: ["hacker", "dusk"],
  dizzy: ["upsideDown", "dusk", "soft"],
  secretHush: ["hush", "dusk", "dim"],
  inkline: ["underline", "medium"],
  fontShift: ["italic"],
  quill: ["script", "underline"],
  steady: ["mono", "medium"],
  aside: ["lower", "italic", "soft"],
} satisfies Record<string, readonly MoodTextToken[]>

type MoodTextPreset = keyof typeof moodTextPresets

/** A slot token or a preset name. */
type MoodTextEffect = MoodTextToken | MoodTextPreset

// Each mood: a quiet baseline for the whole line and a signature preset for
// highlighted words.
const moodTextMoods = {
  joy: { base: ["gold", "goldGlow"], signature: "radiant" },
  happy: { base: ["gold", "goldGlow"], signature: "gleam" },
  excited: { base: ["gold", "goldGlow"], signature: "voltRush" },
  surprise: { base: ["gold"], signature: "jolt" },
  fear: { base: ["blue"], signature: "veilDread" },
  anxious: { base: ["gold"], signature: "nerveHum" },
  timid: { base: ["blue", "dim", "small"], signature: "faint" },
  sadness: { base: ["blue", "dim"], signature: "hollow" },
  hurt: { base: ["midnight", "dim"], signature: "ache" },
  anger: { base: ["midnight", "caps"], signature: "wrath" },
  annoyed: { base: ["midnight"], signature: "bristle" },
  disgust: { base: ["midnight"], signature: "bile" },
  confusion: { base: ["blue"], signature: "befog" },
  normal: { base: [], signature: "inkline" },
} satisfies Record<
  string,
  { base: readonly MoodTextToken[]; signature: MoodTextPreset }
>

type MoodTextMood = keyof typeof moodTextMoods

function isPreset(effect: string): effect is MoodTextPreset {
  return effect in moodTextPresets
}

/** Resolves tokens and presets into a stack. The first token per slot wins. */
function moodTextStack(
  effects: readonly MoodTextEffect[] | MoodTextEffect
): MoodTextStack {
  const stack: MoodTextStack = { ...emptyStack }
  const filled = new Set<MoodTextSlot>()
  const list = typeof effects === "string" ? [effects] : effects

  for (const effect of list) {
    const tokens: readonly string[] = isPreset(effect)
      ? moodTextPresets[effect]
      : [effect]
    for (const token of tokens) {
      const slot = tokenSlot.get(token)
      if (!slot || filled.has(slot)) continue
      ;(stack[slot] as string) = token
      filled.add(slot)
    }
  }

  return stack
}

function mergeStacks(base: MoodTextStack, overlay: MoodTextStack) {
  const merged = { ...base }
  for (const slot of slots) {
    if (overlay[slot] !== "none") (merged[slot] as string) = overlay[slot]
  }
  return merged
}

function stackIsActive(stack: MoodTextStack) {
  return slots.some((slot) => stack[slot] !== "none")
}

function stacksMatch(a: MoodTextStack, b: MoodTextStack) {
  return slots.every((slot) => a[slot] === b[slot])
}

const letterMotions = new Set<string>([
  "wave", "ripple", "frenzy", "crazy", "hacker", "cascade", "scatter",
  "scaleWave", "scaleRipple", "colorWave", "twistWave", "stretchWave",
  "fadeWave",
])
const letterPoses = new Set<string>(["confuse", "hurt", "zalgo"])
const rampSizes = new Set<string>(["grow", "wane", "swell", "dip"])

function splitsLetters(stack: MoodTextStack) {
  return (
    letterMotions.has(stack.motion) ||
    letterPoses.has(stack.pose) ||
    rampSizes.has(stack.size) ||
    stack.case === "random"
  )
}

// Motion and pose transform the word, which needs a box to transform.
function needsBox(stack: MoodTextStack) {
  return stack.pose !== "none" || (stack.motion !== "none" && !splitsLetters(stack))
}

// ── Segments ──────────────────────────────────────────────────────────────

type Range = { start: number; end: number; stack: MoodTextStack }

type Segment = {
  text: string
  stack: MoodTextStack
  start: number
  wordIndex: number
}

function findRanges(text: string, phrase: string, stack: MoodTextStack) {
  const ranges: Range[] = []
  const haystack = text.toLowerCase()
  const needle = phrase.toLowerCase()
  let from = 0
  while (from < text.length) {
    const index = haystack.indexOf(needle, from)
    if (index === -1) break
    ranges.push({ start: index, end: index + needle.length, stack })
    from = index + needle.length
  }
  return ranges
}

// A range nested inside an earlier one layers onto it instead of splitting it.
function mergeNested(ranges: Range[]) {
  const merged: Range[] = []
  for (const range of [...ranges].sort((a, b) => a.start - b.start)) {
    const prev = merged[merged.length - 1]
    if (prev && range.start >= prev.start && range.end <= prev.end) {
      prev.stack = mergeStacks(prev.stack, range.stack)
      continue
    }
    merged.push({ ...range })
  }
  return merged
}

function buildSegments(
  text: string,
  ranges: Range[],
  base: MoodTextStack
): Segment[] {
  const effectRanges = mergeNested(ranges)
  const points = new Set([0, text.length])
  for (const range of effectRanges) {
    points.add(range.start)
    points.add(range.end)
  }
  for (const match of text.matchAll(/\S+/g)) {
    points.add(match.index)
    points.add(match.index + match[0].length)
  }
  const breaks = [...points].sort((a, b) => a - b)

  // A highlight replaces the mood on its span rather than layering on it.
  const stackAt = (index: number) =>
    effectRanges.find((range) => index >= range.start && index < range.end)
      ?.stack ?? base

  const segments: Segment[] = []
  let wordIndex = -1

  for (let i = 0; i < breaks.length - 1; i++) {
    const start = breaks[i]
    const slice = text.slice(start, breaks[i + 1])
    if (!slice) continue

    const isWord = /\S/.test(slice)
    if (isWord) wordIndex += 1
    const stack = stackAt(start)

    // Punctuation after a highlight rides along with the word it follows.
    const prev = segments[segments.length - 1]
    if (
      /^[.,;:!?…]+$/.test(slice) &&
      prev &&
      /\S/.test(prev.text) &&
      stacksMatch(prev.stack, stack)
    ) {
      prev.text += slice
      continue
    }

    segments.push({
      text: slice,
      stack,
      start,
      wordIndex: isWord ? wordIndex : Math.max(0, wordIndex),
    })
  }

  return segments
}

// ── Letters ───────────────────────────────────────────────────────────────

// Seeded so a word looks the same on every render.
function seeded(seed: number, multiplier: number) {
  return ((seed * multiplier * 9301 + 49297) % 233280) / 233280
}

function randomCase(char: string, letter: number, word: number) {
  if (!/[a-z]/i.test(char)) return char
  const seed = letter * 19 + word * 37 + char.charCodeAt(0)
  return (seed * 9301 + 49297) % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
}

function rampSize(mode: string, index: number, total: number) {
  if (mode === "grow") return `${(0.8 + index * 0.1).toFixed(2)}em`
  if (mode === "wane") return `${Math.max(1.1 - index * 0.1, 0.55).toFixed(2)}em`
  if (total <= 1) return "1em"

  const center = (total - 1) / 2
  const factor = 1 - Math.abs(index - center) / (center || 1)
  const lift = mode === "swell" ? factor : 1 - factor
  return `${(1 + lift * 0.35).toFixed(2)}em`
}

const zalgoUp =
  "̍̎̄̅̿̑̆̐͒͗͑̇̈̊͂̓̈́͊͋͌̃̂̌͐̀́̋"
const zalgoMid =
  "̴̵̶̡̢̧̨̛̀́̕͘͏͜͝͞͠͡"
const zalgoDown =
  "̖̗̘̙̜̝̞̟̠̤̥̦̩̪̫̬̭̮̯̰̱̲̳̹̺̻̼͇͈͉ͅ"

function zalgo(char: string, letter: number, word: number) {
  const seed = letter * 19 + word * 37 + char.charCodeAt(0)
  const pick = (n: number, max: number) =>
    Math.abs((seed * (n + 5) * 9301 + 49297) % max)

  let result = char
  for (let i = 0; i < 3 + pick(0, 4); i++) {
    result += zalgoUp[pick(i + 3, zalgoUp.length)]
  }
  for (let i = 0; i < 1 + pick(1, 3); i++) {
    result += zalgoMid[pick(i + 11, zalgoMid.length)]
  }
  for (let i = 0; i < 4 + pick(2, 5); i++) {
    result += zalgoDown[pick(i + 23, zalgoDown.length)]
  }
  return result
}

function crazyStyle(letter: number, word: number): React.CSSProperties {
  const seed = letter * 17 + word * 31 + 1
  return {
    ["--mood-crazy-delay" as string]: `${(seeded(seed, 3) * 0.28).toFixed(3)}s`,
    ["--mood-crazy-duration" as string]: `${(0.2 + seeded(seed, 5) * 0.42).toFixed(3)}s`,
    ["--mood-crazy-up" as string]: `${(-4 - seeded(seed, 7) * 6).toFixed(1)}px`,
    ["--mood-crazy-down" as string]: `${(4 + seeded(seed, 11) * 6).toFixed(1)}px`,
    ["--mood-crazy-rot" as string]: `${(-16 + seeded(seed, 13) * 32).toFixed(1)}deg`,
    ["--mood-crazy-scale" as string]: `${(1 + seeded(seed, 17) * 0.14).toFixed(3)}`,
  }
}

function scatterStyle(letter: number, word: number): React.CSSProperties {
  const seed = letter * 23 + word * 41 + 7
  return {
    ["--mood-scatter-x" as string]: `${(-2.4 + seeded(seed, 3) * 4.8).toFixed(1)}px`,
    ["--mood-scatter-y" as string]: `${(-2.4 + seeded(seed, 5) * 4.8).toFixed(1)}px`,
    ["--mood-scatter-rot" as string]: `${(-9 + seeded(seed, 7) * 18).toFixed(1)}deg`,
  }
}

function renderLetters(text: string, stack: MoodTextStack, word: number) {
  const total = text.replace(/ /g, "").length
  let letter = 0

  return [...text].map((char, index) => {
    if (char === " ") return <span key={index}> </span>

    const shown = stack.case === "random" ? randomCase(char, index, word) : char
    const at = letter++

    if (stack.pose === "zalgo") {
      return (
        <span
          key={index}
          className="mood-letter mood-zalgo"
          style={{ ["--mood-letter" as string]: index }}
        >
          {zalgo(shown, index, word)}
        </span>
      )
    }

    return (
      <span
        key={index}
        className={cn(
          "mood-letter",
          stack.pose === "confuse" && (at % 2 === 0 ? "mood-confuse-up" : "mood-confuse-down"),
          stack.pose === "hurt" && `mood-hurt-${at % 4}`
        )}
        style={{
          ["--mood-letter" as string]: index,
          ...(stack.motion === "crazy" ? crazyStyle(index, word) : {}),
          ...(stack.motion === "scatter" ? scatterStyle(index, word) : {}),
          ...(rampSizes.has(stack.size)
            ? { fontSize: rampSize(stack.size, at, total) }
            : {}),
        }}
      >
        {shown}
      </span>
    )
  })
}

const outerSlots: MoodTextSlot[] = [
  "size", "tracking", "case", "font", "weight", "draw", "ink", "glow", "fade",
]

function slotClass(slot: MoodTextSlot, stack: MoodTextStack) {
  return stack[slot] === "none" ? "" : `mood-${slot}-${stack[slot]}`
}

function MoodWord({ segment, stagger }: { segment: Segment; stagger: boolean }) {
  const { text, stack } = segment
  const [peekedAt, setPeekedAt] = React.useState(false)

  // Gaps stay plain text: a space inside an inline-block collapses.
  if (!/\S/.test(text)) return <span className="mood-gap">{text}</span>
  if (!stackIsActive(stack)) return <span className="mood-word">{text}</span>

  const word = stagger ? segment.wordIndex : 0
  const split = splitsLetters(stack)
  const peak = stack.motion === "peak"
  const content = split ? renderLetters(text, stack, word) : text

  const moved =
    stack.motion === "none" ? (
      content
    ) : (
      <span
        className={cn(
          "mood-motion",
          `mood-motion-${stack.motion}`,
          peak && peekedAt && "mood-peeked",
          !split && needsBox(stack) && "mood-box"
        )}
      >
        {content}
      </span>
    )

  const posed =
    stack.pose === "none" ? (
      moved
    ) : (
      <span className={cn("mood-box", `mood-pose-${stack.pose}`)}>{moved}</span>
    )

  return (
    <span
      className={cn("mood-word", ...outerSlots.map((slot) => slotClass(slot, stack)))}
      onMouseEnter={peak ? () => setPeekedAt(true) : undefined}
      style={{ ["--mood-word" as string]: word }}
    >
      {posed}
    </span>
  )
}

type MoodTextHighlight =
  | string
  | { phrase: string; effect?: MoodTextEffect | readonly MoodTextEffect[] }

type MoodTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  children: string
  /** Baseline stack for the whole line. */
  mood?: MoodTextMood
  /** Extra tokens or presets layered over the mood on every word. */
  effects?: MoodTextEffect | readonly MoodTextEffect[]
  /**
   * Phrases to pick out. A bare string uses the mood's signature preset;
   * an object names its own effect.
   */
  highlights?: readonly MoodTextHighlight[]
  /** Offset each word's animation so motion travels along the line. */
  stagger?: boolean
}

/** Text whose words move, colour and reshape to match a mood. */
function MoodText({
  children,
  mood = "normal",
  effects,
  highlights,
  stagger = true,
  className,
  ...props
}: MoodTextProps) {
  const text = children

  const segments = React.useMemo(() => {
    const base = mergeStacks(
      moodTextStack(moodTextMoods[mood].base),
      moodTextStack(effects ?? [])
    )
    const ranges = (highlights ?? []).flatMap((highlight) => {
      const { phrase, effect } =
        typeof highlight === "string" ? { phrase: highlight } : highlight
      const trimmed = phrase.trim()
      const stack = moodTextStack(effect ?? moodTextMoods[mood].signature)
      return trimmed && stackIsActive(stack) ? findRanges(text, trimmed, stack) : []
    })
    return buildSegments(text, ranges, base)
  }, [text, mood, effects, highlights])

  const nodes: React.ReactNode[] = []
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const word = <MoodWord key={segment.start} segment={segment} stagger={stagger} />
    if (!/\S/.test(segment.text)) {
      nodes.push(word)
      continue
    }

    // Glue a word to the space after it so lines wrap between tokens.
    const glued = [word]
    while (i + 1 < segments.length && !/\S|\n/.test(segments[i + 1].text)) {
      i += 1
      const gap = segments[i]
      glued.push(<MoodWord key={gap.start} segment={gap} stagger={stagger} />)
    }
    nodes.push(
      <span key={`${segment.start}-token`} className="mood-token">
        {glued}
      </span>
    )
  }

  // Split or rewritten letters read badly aloud, so give readers the plain line.
  const rewritten = segments.some((segment) => splitsLetters(segment.stack))

  return (
    <>
      <style href="standard-mood-text" precedence="default">
        {moodTextCss}
      </style>
      <span
        {...props}
        data-slot="mood-text"
        data-mood={mood}
        className={cn("mood-text", className)}
      >
        {rewritten ? (
          <>
            <span className="sr-only">{text}</span>
            <span aria-hidden>{nodes}</span>
          </>
        ) : (
          nodes
        )}
      </span>
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────

// [token, duration + easing, stagger per word in ms, transform-origin]
const wordMotions: [string, string, number, string?][] = [
  ["bounce", "1.3s ease-in-out", 45],
  ["spark", "1.1s ease-in-out", 40],
  ["tremble", ".55s ease-in-out", 25],
  ["wobble", "1.8s ease-in-out", 45],
  ["pop", "1.6s cubic-bezier(.2,1.6,.4,1)", 40],
  ["jitter", ".35s linear", 15],
  ["flick", "1.9s ease-in-out", 35],
  ["droop", "3.2s ease-in-out", 60],
  ["squirm", "1.7s ease-in-out", 40],
  ["shrink", "2.8s ease-in-out", 55],
  ["hush", "3s ease-in-out", 50],
  ["jagged", ".55s steps(3,end)", 35],
  ["float", "2.6s ease-in-out", 55],
  ["sway", "2.4s ease-in-out", 50, "50% 100%"],
  ["pulse", "1.8s ease-in-out", 45],
  ["flicker", ".9s steps(2,end)", 20],
  ["fadeOsc", "1.4s ease-in-out", 40],
  ["fadeBreath", "3.6s ease-in-out", 70],
  ["blinking", ".85s step-end", 30],
  ["heartbeat", "1.5s ease-in-out", 40],
  ["drift", "3.4s ease-in-out", 60],
  ["shiver", ".18s linear", 12],
  ["slam", "1.7s cubic-bezier(.2,.9,.3,1)", 55],
  ["lift", "4s ease-in-out", 70],
  ["tilt", "4.4s ease-in-out", 70, "50% 80%"],
  ["murmur", "4.6s ease-in-out", 80],
  ["nudge", "4.2s ease-in-out", 70],
  ["sigh", "4.8s ease-in-out", 75],
  ["hum", "4s ease-in-out", 70],
  ["scaleBreath", "3.4s ease-in-out", 55],
  ["hueShift", "4.2s ease-in-out", 70],
  ["blush", "3.8s ease-in-out", 65],
  ["aurora", "6.5s ease-in-out", 80],
  ["twirl", "2.8s ease-in-out", 50, "50% 60%"],
  ["stretch", "2.4s ease-in-out", 50, "50% 50%"],
  ["squash", "2.4s ease-in-out", 50, "50% 100%"],
  ["breathe", "2.2s ease-in-out", 45],
  ["clench", "2.2s ease-in-out", 45],
]

// Same shape, staggered per letter instead of per word.
const letterMotionRules: [string, string, number, string?][] = [
  ["wave", "1.35s ease-in-out", 70],
  ["ripple", "2.4s ease-in-out", 90],
  ["frenzy", ".42s linear", 32],
  ["cascade", "1.55s ease-in-out", 75],
  ["scatter", ".7s ease-in-out", 28],
  ["scaleWave", "1.5s ease-in-out", 75, "50% 70%"],
  ["scaleRipple", "2.6s ease-in-out", 95, "50% 70%"],
  ["colorWave", "2.2s ease-in-out", 80],
  ["twistWave", "1.6s ease-in-out", 70, "50% 70%"],
  ["stretchWave", "1.7s ease-in-out", 75, "50% 70%"],
  ["fadeWave", "1.8s ease-in-out", 85],
]

// Parchment inks, then lighter twins for dark surfaces.
const inks: Record<SlotToken<"ink">, [string, string]> = {
  gold: ["#8b6914", "#e0b94a"],
  honey: ["#a67c00", "#f0c53a"],
  amber: ["#b45309", "#f59e0b"],
  crimson: ["#6b1a12", "#e0685a"],
  rose: ["#8b3a4a", "#e88a9c"],
  wine: ["#5c1a33", "#d0668e"],
  violet: ["#3d2060", "#b08ae0"],
  dusk: ["#2e3f66", "#8fa6d8"],
  sea: ["#1f4f5f", "#6fb6c8"],
  moss: ["#3f5a1e", "#9cc46a"],
  midnight: ["#1a1a2e", "#c4c4e0"],
  ash: ["#5a5a5a", "#a8a8a8"],
  red: ["#7a1f1f", "#ef6b6b"],
  orange: ["#9c4221", "#f28a55"],
  yellow: ["#9a7b0a", "#f2d24a"],
  green: ["#2d5a27", "#7fcf6f"],
  blue: ["#1e4a7a", "#74a8e8"],
  indigo: ["#3b2f6b", "#a597e8"],
  copper: ["#8a4b2a", "#e0946a"],
  ivory: ["#9a8f78", "#e8dfc8"],
  blood: ["#5a1018", "#d04a5a"],
  fog: ["#6a7380", "#aab3c0"],
  pewter: ["#4d555c", "#9aa3aa"],
}

const staticCss = `
.mood-word,.mood-token{display:inline-block;max-width:100%;white-space:nowrap;vertical-align:baseline}
.mood-gap{white-space:pre}
.mood-box,.mood-motion{display:inline-block;vertical-align:baseline}
.mood-size-tiny{font-size:.62em}
.mood-size-small{font-size:.72em}
.mood-size-big{font-size:1.38em;line-height:1.05}
.mood-size-huge{font-size:1.55em;line-height:1.02}
.mood-size-subscript{font-size:.72em;vertical-align:sub;line-height:0}
.mood-size-superscript{font-size:.72em;vertical-align:super;line-height:0}
.mood-size-stretched{transform:scaleX(1.22)}
.mood-size-condensed{transform:scaleX(.82)}
.mood-size-tall{transform:scaleY(1.32);transform-origin:50% 100%}
.mood-size-flat{transform:scaleY(.78);transform-origin:50% 100%}
.mood-size-grow .mood-letter,.mood-size-wane .mood-letter,.mood-size-swell .mood-letter,.mood-size-dip .mood-letter{display:inline-block;line-height:1}
.mood-tracking-tight{letter-spacing:-.03em}
.mood-tracking-tighter{letter-spacing:-.07em}
.mood-tracking-spaced{letter-spacing:.22em}
.mood-tracking-wide{letter-spacing:.34em}
.mood-case-caps{text-transform:uppercase}
.mood-case-lower{text-transform:lowercase}
.mood-case-smallCaps{font-variant:small-caps}
.mood-font-italic{font-family:Georgia,"Times New Roman",serif;font-style:italic}
.mood-font-script{font-family:"Segoe Script","Brush Script MT",cursive;font-style:italic}
.mood-font-mono{font-family:ui-monospace,"Cascadia Mono","Courier New",monospace;letter-spacing:.04em}
.mood-font-blackletter{font-family:"Old English Text MT",UnifrakturCook,"Cinzel Decorative","Times New Roman",serif;letter-spacing:.02em}
.mood-font-comic{font-family:"Comic Sans MS","Comic Sans","Chalkboard SE","Comic Neue",cursive;font-weight:600}
.mood-font-sans{font-family:"Segoe UI",Calibri,system-ui,sans-serif;letter-spacing:.01em}
.mood-font-serif{font-family:Palatino,"Palatino Linotype","Book Antiqua","Times New Roman",serif}
.mood-font-impact{font-family:Impact,Haettenschweiler,"Arial Narrow Bold",sans-serif;letter-spacing:.02em}
.mood-font-slab{font-family:Rockwell,"Courier New","Times New Roman",serif;letter-spacing:.01em}
.mood-font-rounded{font-family:"Trebuchet MS","Segoe UI","Century Gothic",sans-serif}
.mood-font-copperplate{font-family:"Copperplate Gothic Light",Copperplate,Papyrus,fantasy;letter-spacing:.08em}
.mood-font-handwritten{font-family:"Segoe Print","Bradley Hand","Lucida Handwriting",cursive}
.mood-weight-light{font-weight:300}
.mood-weight-medium{font-weight:500}
.mood-weight-semibold{font-weight:600}
.mood-weight-bold{font-weight:700}
.mood-weight-heavy{font-weight:800}
.mood-draw-underline{text-decoration:underline .07em;text-underline-offset:.14em}
.mood-draw-strikethrough{text-decoration:line-through .07em}
.mood-draw-dotted{text-decoration:underline dotted .07em;text-underline-offset:.16em}
.mood-draw-wavy{text-decoration:underline wavy .08em;text-underline-offset:.16em}
.mood-glow-goldGlow{text-shadow:0 0 4px rgba(255,215,0,.45),0 0 10px rgba(255,200,80,.25)}
.mood-glow-ember{text-shadow:0 0 6px rgba(180,40,20,.35)}
.mood-glow-moon{text-shadow:0 0 5px rgba(200,220,255,.45),0 0 12px rgba(160,190,255,.2)}
.mood-glow-frost{text-shadow:0 0 6px rgba(220,235,255,.5)}
.mood-glow-violetGlow{text-shadow:0 0 5px rgba(140,90,220,.4),0 0 12px rgba(100,60,180,.22)}
.mood-glow-roseGlow{text-shadow:0 0 5px rgba(200,90,120,.42),0 0 12px rgba(160,50,80,.2)}
.mood-glow-mossGlow{text-shadow:0 0 5px rgba(90,140,50,.4),0 0 12px rgba(50,90,20,.2)}
.mood-glow-ghostGlow{text-shadow:0 0 6px rgba(210,225,230,.45),0 0 14px rgba(180,200,210,.18)}
.mood-glow-outline,.mood-glow-paleOutline,.mood-glow-thickOutline{paint-order:stroke fill}
.mood-glow-outline{-webkit-text-stroke:.055em #2a1810}
.mood-glow-paleOutline{-webkit-text-stroke:.055em #f4ead4}
.mood-glow-thickOutline{-webkit-text-stroke:.11em #1a100c}
.dark .mood-glow-outline{-webkit-text-stroke-color:#f4ead4}
.dark .mood-glow-thickOutline{-webkit-text-stroke-color:#f4ead4}
.mood-glow-dropShadow{text-shadow:1.1px 1.2px 1.2px rgba(0,0,0,.5)}
.mood-fade-mist{opacity:.94}
.mood-fade-soft{opacity:.88}
.mood-fade-dim{opacity:.72}
.mood-fade-washed{opacity:.6}
.mood-fade-ghost{opacity:.5}
.mood-fade-sheer{opacity:.32}
.mood-pose-crooked{transform:rotate(-11deg) skewX(-6deg);padding:0 .18em}
.mood-pose-upsideDown{transform:rotate(180deg);padding:0 .12em}
.mood-pose-lean{transform:rotate(-7deg);padding:0 .1em}
.mood-pose-mirror{transform:scaleX(-1);padding:0 .08em}
.mood-pose-raised{transform:translateY(-.16em)}
.mood-pose-confuse .mood-letter,.mood-pose-hurt .mood-letter{display:inline-block}
.mood-confuse-up{transform:translateY(-.06em)}
.mood-confuse-down{transform:translateY(.06em)}
.mood-pose-hurt{filter:saturate(.78) contrast(1.12)}
.mood-hurt-0{transform:rotate(-11deg) translateY(-.05em) scaleY(1.1);text-shadow:0 0 6px rgba(72,0,96,.55),1px 1px 0 rgba(20,50,20,.35)}
.mood-hurt-1{transform:rotate(8deg) translateY(.07em) skewX(-8deg);text-shadow:0 0 5px rgba(40,80,40,.5)}
.mood-hurt-2{transform:rotate(-5deg) scaleX(.92) translateY(.04em);text-shadow:0 0 7px rgba(90,0,110,.4)}
.mood-hurt-3{transform:rotate(10deg) skewX(6deg) scaleY(.94);text-shadow:0 0 4px rgba(30,30,60,.55)}
.mood-pose-zalgo{line-height:1.15;letter-spacing:.01em}
.mood-zalgo{display:inline-block;padding:.2em .05em .35em;margin:0 -.04em;line-height:.75;text-shadow:0 0 1px rgba(180,40,40,.25)}
.mood-motion-peak{filter:blur(5px);transition:filter .4s ease}
.mood-word:hover .mood-motion-peak,.mood-peeked{filter:blur(0)}
.mood-motion-blurIn{filter:blur(5px);animation:mood-blurIn .65s ease forwards;animation-delay:calc(3s + var(--mood-word,0) * .5s)}
.mood-motion-crazy .mood-letter{animation:mood-crazy var(--mood-crazy-duration,.38s) ease-in-out infinite;animation-delay:var(--mood-crazy-delay,0s)}
.mood-motion-hacker .mood-letter{animation:mood-hacker .14s steps(3,end) infinite;animation-delay:calc(var(--mood-word,0) * 35ms + var(--mood-letter,0) * 42ms)}
@keyframes mood-blurIn{from{filter:blur(5px)}to{filter:blur(0)}}
@keyframes mood-breathe{0%,100%{letter-spacing:0}50%{letter-spacing:.2em}}
@keyframes mood-clench{0%,100%{letter-spacing:0}50%{letter-spacing:-.1em}}
@keyframes mood-hum{0%,100%{letter-spacing:0}50%{letter-spacing:.04em}}
@keyframes mood-jagged{0%{transform:rotate(-7deg) skewX(-10deg)}33%{transform:rotate(5deg) skewX(8deg)}66%{transform:rotate(-4deg) skewX(-6deg) scaleY(1.04)}100%{transform:rotate(6deg) skewX(9deg)}}
@keyframes mood-hacker{0%,100%{transform:translate(0);text-shadow:none;opacity:1}33%{transform:translate(-1px,0) skewX(5deg);text-shadow:-2px 0 rgba(57,255,136,.8),2px 0 rgba(255,45,85,.55);opacity:.72}66%{transform:translate(1px,-1px) skewX(-4deg);text-shadow:1px 0 rgba(57,255,136,.9);opacity:.88}}
@keyframes mood-crazy{0%,100%{transform:translateY(0) rotate(0) scale(1)}25%{transform:translateY(var(--mood-crazy-up,-5px)) rotate(var(--mood-crazy-rot,9deg)) scale(var(--mood-crazy-scale,1.08))}50%{transform:translateY(var(--mood-crazy-down,5px)) rotate(calc(var(--mood-crazy-rot,9deg) * -1)) scale(1)}75%{transform:translateY(calc(var(--mood-crazy-up,-5px) * .65)) rotate(var(--mood-crazy-rot,9deg)) scale(var(--mood-crazy-scale,1.08))}}
@keyframes mood-frenzy{0%,100%{transform:translateY(0) rotate(0)}20%{transform:translateY(-4px) rotate(-5deg)}40%{transform:translateY(3px) rotate(4deg)}60%{transform:translateY(-3px) rotate(6deg)}80%{transform:translateY(4px) rotate(-4deg)}}
@keyframes mood-bounce{0%,100%{transform:translateY(0)}30%{transform:translateY(-3px)}55%{transform:translateY(.5px)}70%{transform:translateY(-1px)}}
@keyframes mood-spark{0%,100%{transform:scale(1);filter:brightness(1)}40%{transform:scale(1.12);filter:brightness(1.25)}70%{transform:scale(.98);filter:brightness(1.05)}}
@keyframes mood-tremble{0%,100%{transform:translateX(0)}25%{transform:translateX(-1px)}75%{transform:translateX(1px)}}
@keyframes mood-wobble{0%,100%{transform:rotate(0)}25%{transform:rotate(-2deg)}75%{transform:rotate(2deg)}}
@keyframes mood-pop{0%,100%{transform:scale(1)}12%{transform:scale(1.28)}28%{transform:scale(.96)}40%{transform:scale(1)}}
@keyframes mood-jitter{0%,100%{transform:translate(0,0)}25%{transform:translate(-.6px,.4px)}50%{transform:translate(.5px,-.4px)}75%{transform:translate(-.4px,-.5px)}}
@keyframes mood-flick{0%,86%,100%{transform:translateX(0) rotate(0)}90%{transform:translateX(1.5px) rotate(1.5deg)}94%{transform:translateX(-1px) rotate(-1deg)}}
@keyframes mood-droop{0%,100%{transform:translateY(0);opacity:.85}50%{transform:translateY(2px);opacity:.65}}
@keyframes mood-squirm{0%,100%{transform:skewX(0) translateY(0)}25%{transform:skewX(-6deg) translateY(.5px)}60%{transform:skewX(5deg) translateY(-.5px)}}
@keyframes mood-shrink{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(.92);opacity:.6}}
@keyframes mood-hush{0%,100%{opacity:.65}50%{opacity:.85}}
@keyframes mood-wave{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes mood-ripple{0%,100%{transform:translateY(0) rotate(0);opacity:.88}35%{transform:translateY(-2px) rotate(-2deg);opacity:1}70%{transform:translateY(2px) rotate(2deg);opacity:.78}}
@keyframes mood-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes mood-sway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes mood-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes mood-flicker{0%,100%{opacity:1}20%{opacity:.55}40%{opacity:.92}55%{opacity:.4}70%{opacity:1}}
@keyframes mood-heartbeat{0%,28%,100%{transform:scale(1)}8%{transform:scale(1.12)}16%{transform:scale(1)}22%{transform:scale(1.08)}}
@keyframes mood-drift{0%,100%{transform:translateX(0)}50%{transform:translateX(4px)}}
@keyframes mood-shiver{0%,100%{transform:translate(0,0)}25%{transform:translate(-.4px,.3px)}50%{transform:translate(.4px,-.2px)}75%{transform:translate(-.3px,-.3px)}}
@keyframes mood-slam{0%{transform:translateY(-.45em);opacity:.35}18%{transform:translateY(0);opacity:1}28%{transform:translateY(-.04em)}38%,100%{transform:translateY(0);opacity:1}}
@keyframes mood-cascade{0%,100%{transform:translateY(0)}40%{transform:translateY(.22em)}}
@keyframes mood-scatter{0%,100%{transform:translate(0,0) rotate(0)}35%{transform:translate(var(--mood-scatter-x,1px),var(--mood-scatter-y,-1px)) rotate(var(--mood-scatter-rot,4deg))}70%{transform:translate(calc(var(--mood-scatter-x,1px) * -1),calc(var(--mood-scatter-y,-1px) * -1)) rotate(calc(var(--mood-scatter-rot,4deg) * -1))}}
@keyframes mood-lift{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.2px)}}
@keyframes mood-tilt{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.4deg)}}
@keyframes mood-murmur{0%,100%{opacity:1}50%{opacity:.94}}
@keyframes mood-nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(.7px)}}
@keyframes mood-sigh{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(.6px) scale(1.018)}}
@keyframes mood-scaleBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes mood-scaleWave{0%,100%{transform:scale(1)}40%{transform:scale(1.16)}}
@keyframes mood-scaleRipple{0%,100%{transform:scale(1)}35%{transform:scale(1.1)}60%{transform:scale(.97)}}
@keyframes mood-hueShift{0%,100%{filter:hue-rotate(-22deg)}50%{filter:hue-rotate(22deg)}}
@keyframes mood-blush{0%,100%{filter:hue-rotate(0) saturate(1)}50%{filter:hue-rotate(-18deg) saturate(1.45)}}
@keyframes mood-aurora{0%,100%{filter:hue-rotate(0) saturate(1.05)}33%{filter:hue-rotate(48deg) saturate(1.2)}66%{filter:hue-rotate(-28deg) saturate(1.12)}}
@keyframes mood-colorWave{0%,100%{filter:hue-rotate(0) saturate(1)}50%{filter:hue-rotate(42deg) saturate(1.25)}}
@keyframes mood-twirl{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}}
@keyframes mood-twistWave{0%,100%{transform:rotate(0)}40%{transform:rotate(-14deg)}70%{transform:rotate(10deg)}}
@keyframes mood-stretch{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.18)}}
@keyframes mood-squash{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.16)}}
@keyframes mood-stretchWave{0%,100%{transform:scaleX(1) scaleY(1)}40%{transform:scaleX(1.22) scaleY(.92)}}
@keyframes mood-fadeOsc{0%,100%{opacity:1}50%{opacity:0}}
@keyframes mood-fadeBreath{0%,100%{opacity:1}50%{opacity:0}}
@keyframes mood-fadeWave{0%,100%{opacity:1}50%{opacity:0}}
@keyframes mood-blinking{0%,62%{opacity:1}63%,100%{opacity:0}}
@media (prefers-reduced-motion:reduce){[data-slot=mood-text] *{animation:none!important}[data-slot=mood-text] .mood-motion-blurIn{filter:none}}
`

function motionRule(
  [token, timing, step, origin]: [string, string, number, string?],
  target: string,
  index: string
) {
  return `${target}{animation:mood-${token} ${timing} infinite;animation-delay:calc(var(${index},0) * ${step}ms)${origin ? `;transform-origin:${origin}` : ""}}`
}

const moodTextCss = [
  staticCss,
  ...wordMotions.map((rule) =>
    motionRule(rule, `.mood-motion-${rule[0]}`, "--mood-word")
  ),
  // Letter motions keep the word inline so its letters are the moving boxes.
  `${[...letterMotions].map((token) => `.mood-motion-${token}`).join(",")}{display:inline}`,
  `${[...letterMotions].map((token) => `.mood-motion-${token} .mood-letter`).join(",")}{display:inline-block}`,
  ...letterMotionRules.map((rule) =>
    motionRule(rule, `.mood-motion-${rule[0]} .mood-letter`, "--mood-letter")
  ),
  ...Object.entries(inks).map(
    ([ink, [light, dark]]) =>
      `.mood-ink-${ink}{color:${light}}.dark .mood-ink-${ink}{color:${dark}}`
  ),
].join("\n")

export {
  MoodText,
  moodTextMoods,
  moodTextPresets,
  moodTextStack,
  slotTokens as moodTextSlots,
  type MoodTextEffect,
  type MoodTextHighlight,
  type MoodTextMood,
  type MoodTextPreset,
  type MoodTextProps,
  type MoodTextSlot,
  type MoodTextStack,
  type MoodTextToken,
}
