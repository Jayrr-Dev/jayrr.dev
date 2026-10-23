/**
 * Orbit ring
 *
 * Self-contained, shadcn-style: one file, no dependencies beyond React.
 * Styles, icons, the rolling counter, and sounds all live below.
 *
 * Words, phrases, and images float in a circle. Drag one onto a score on the rim.
 * The middle score is the neutral one (3 of 5, 4 of 7) and always sits at the bottom.
 * An outer ring holds actions (skip, confusing, typo); they only take a direct drop, never an aim.
 * The circle refills from the queue while it is under the limit.
 * Items repel and settle in a short spring, the same pace as an action wheel.
 *
 * Keywords: orbit, score-ring, drag, force-layout
 */

"use client"

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"

/** Spring-like settle for the countdown digits */
const COUNTER_EASE =
  "linear(0, 0.0033 0.8%, 0.0263 2.39%, 0.0896 4.77%, 0.4676 15.12%, 0.5688, 0.6553, 0.7274, 0.7862, 0.8336 31.04%, 0.8793, 0.9132 38.99%, 0.9421 43.77%, 0.9642 49.34%, 0.9796 55.71%, 0.9893 62.87%, 0.9952 71.62%, 0.9983 82.76%, 0.9996 99.47%)"

/** Class names for the styles below. Everything is prefixed `orbit-` so it can't clash. */
const styles = {
  actionLabel: "orbit-action-label",
  actionRing: "orbit-action-ring",
  closeOpen: "orbit-close-open",
  coloredSlice: "orbit-colored-slice",
  counter: "orbit-counter",
  centerX: "orbit-center-x",
  swirl: "orbit-swirl",
  deadZone: "orbit-dead-zone",
  deadZoneHot: "orbit-dead-zone orbit-dead-zone-hot",
  deadZoneOpen: "orbit-dead-zone orbit-dead-zone-open",
  deadZoneShown: "orbit-dead-zone orbit-dead-zone-shown",
  done: "orbit-done",
  greyRest: "orbit-grey-rest",
  inkLabel: "orbit-ink-label",
  live: "orbit-live",
  node: "orbit-node",
  nodeDragging: "orbit-node-dragging",
  nodeSelected: "orbit-node-selected",
  releaseTip: "orbit-release-tip",
  prompt: "orbit-prompt",
  results: "orbit-results",
  ring: "orbit-ring",
  scoreCount: "orbit-score-count",
  scoreCountInline: "orbit-score-count-inline",
  countBadge: "orbit-count-badge",
  scoreLabel: "orbit-score-label",
  segment: "orbit-segment",
  segmentHot: "orbit-segment-hot",
  segmentOpen: "orbit-segment-open",
  stage: "orbit-stage",
  thumb: "orbit-thumb",
  well: "orbit-well",
  wellHatch: "orbit-well-hatch",
  wellLayer: "orbit-well-layer",
  wrap: "orbit-wrap",
  settings: "orbit-settings",
  muteButton: "orbit-mute-button",
  more: "orbit-more",
  nodeWrap: "orbit-node-wrap",
  nodeLeaving: "orbit-node-leaving",
  nodeOverCenter: "orbit-node-over-center",
  nodeHoldCancel: "orbit-node-hold-cancel",
  confetti: "orbit-confetti",
  settingsRow: "orbit-settings-row",
  settingsValue: "orbit-settings-value",
  settingsToggles: "orbit-settings-toggles",
  settingsToggle: "orbit-settings-toggle",
  settingsSizes: "orbit-settings-sizes",
  sizeButtons: "orbit-size-buttons",
  sizeButton: "orbit-size-button",
  settingsTutorial: "orbit-settings-tutorial",
  check: "orbit-check",
  slider: "orbit-slider",
  roll: "orbit-roll",
  rollDigit: "orbit-roll-digit",
  rollStrip: "orbit-roll-strip",
}

export interface OrbitItem {
  id: string
  label: string
  imageUrl?: string
}

/** A slice on either ring: a score on the inner ring, or a flag on the outer ring. */
export interface OrbitScore {
  /** Unique across scores and actions; it's what placements report */
  id: string
  /** Text on the slice. Long two-word labels wrap. */
  label: string
  /** Slice color. Colored slices get grain and dark label text. */
  color?: string
  /**
   * Fill on hover, focus, drag-over, and while open.
   * Scores default to `color`; flags default to a pale tint of `color`.
   */
  hoverColor?: string
  /** Second line of the hover tooltip. Scores default to how to answer with them. */
  hint?: string
}

/** Text size the taker picks in the settings popover */
export type OrbitTextSize = "xs" | "sm" | "md" | "lg"

/** Each text size as a share of the normal (md) size of the words and prompt */
const TEXT_SCALES: Record<OrbitTextSize, number> = {
  xs: 0.7,
  sm: 0.85,
  md: 1,
  lg: 1.15,
}
const TEXT_SIZES = Object.keys(TEXT_SCALES) as OrbitTextSize[]

/** Faint ring ink, for a `wellLayer` texture that should stay behind the words */
export const ORBIT_WELL_TONE =
  "color-mix(in oklch, var(--orbit-ink) 22%, transparent)"

/** For reading a saved text size back from storage */
export const isOrbitTextSize = (value: unknown): value is OrbitTextSize =>
  typeof value === "string" && value in TEXT_SCALES

export interface OrbitPlacement {
  itemId: string
  /** A score id, or an action id from the outer ring */
  scoreId: string
}

export const DEFAULT_ORBIT_ACTIONS: OrbitScore[] = [
  {
    id: "skip",
    label: "Skip",
    color: "#f4c430",
    hint: "Drop a statement here to leave it unanswered.",
  },
  {
    id: "confusing",
    label: "Confusing",
    color: "#e5484d",
    hint: "Drop a statement here if it's unclear. It's skipped and flagged for review.",
  },
  {
    id: "typo",
    label: "Typo",
    color: "#3e7bdc",
    hint: "Drop a statement here if it has a mistake. It's skipped and flagged for a fix.",
  },
]

/** Every color the ring draws with. Each one is optional; leave it out to keep the default. */
export interface OrbitColors {
  /** Center circle in light mode. Default #f2efe9 */
  center?: string
  /** Center circle in dark mode. Default #c9c2b6 */
  centerDark?: string
  /** Small drop zone in the middle. Default #3a3835 */
  deadZone?: string
  /** Drop zone while a slice is open. Default #212122 */
  deadZoneOpen?: string
  /** Label text on colored slices, the close button, and the drop zone border. Default #161616 */
  ink?: string
  /** Word text and border in light mode. Default #2b2d31 */
  wordText?: string
  /** Word background in light mode. Default: the theme's card color */
  wordBackground?: string
  /** Word text and border in dark mode. Default #f2efe9 */
  wordTextDark?: string
  /** Word background in dark mode. Default #060606 */
  wordBackgroundDark?: string
}

/** Every piece of text the ring shows or announces. */
export interface OrbitLabels {
  /** Tooltip on the center when letting go cancels the drag. Default "Cancel Selection" */
  cancel?: string
  /** Tooltip on the center when letting go returns the word to the pool. Default "Return" */
  return?: string
  /** Name of the settings popover opened from the center. Default "Settings" */
  settings?: string
  /** Label for the sound volume slider. Default "Sound" */
  volume?: string
  /** Speaker button while sound is on. Default "Mute" */
  mute?: string
  /** Speaker button while muted. Default "Unmute" */
  unmute?: string
  /** Switch in the settings popover that selects the next word after each placement. Default "Auto-select next" */
  autoSelectNext?: string
  /** Checkbox in the settings popover that shows how many words sit on each slice. Default "Show counts" */
  showCounts?: string
  /** Checkbox in the settings popover that bends score labels along the ring. Default "Word wrap" */
  curveLabels?: string
  /** Row of size buttons in the settings popover. Default "Text size" */
  textSize?: string
  /** Button at the foot of the settings popover that replays the tutorial. Default "Tutorial" */
  tutorial?: string
  /** Screen reader text for the checkmark when every word is placed. Default "That's the set." */
  done?: string
  /** Screen reader text for the counter. Default "{n} left" */
  remaining?: (count: number) => string
}

/** Fine-tuning for the sound effects. Pass `sound={false}` to mute everything. */
export interface OrbitSound {
  /** Overall volume, 0 to 1. Default 0.35 */
  volume?: number
  /** Volume on the neutral score, as a share of the ends of the scale. Default 0.65 */
  neutralVolume?: number
  /** Pitch on the neutral score, as a share of the ends of the scale. Default 0.985 */
  neutralPitch?: number
  /** Chime when a word lands on a score. Default true */
  place?: boolean
  /** Falling chime when a word lands on a flag. Default true */
  flag?: boolean
  /** Shuffle when a word goes back to the pool. Default true */
  return?: boolean
}

/**
 * What the taker is doing with the ring, for guides such as a tutorial. `aim` fires as a dragged
 * word lights a slice (null when it lights none), `open` as a slice opens or closes (null),
 * `cancel` when a drag ends without placing anything, and `settings` as the center's popover
 * opens or closes.
 */
export type OrbitInteraction =
  | { type: "aim"; scoreId: string | null }
  | { type: "open"; scoreId: string | null }
  | { type: "cancel"; itemId: string }
  | { type: "settings"; open: boolean }

export interface OrbitRingProps {
  /* What to sort */

  /** Words or images to place */
  items: OrbitItem[]
  /** Items already placed when the ring starts (e.g. answers restored after a reload). Read on reset. */
  initialPlacements?: OrbitPlacement[]
  /**
   * Inner ring, low to high. Use any number of slices and any text.
   * The middle one is neutral and sits at the bottom; low is on the left, high on the right.
   */
  scores: OrbitScore[]
  /** Outer ring of flags, any number. Ids must not repeat score ids. Pass [] to hide the ring. */
  actions?: OrbitScore[]

  /* Layout */

  /**
   * How many words float in the circle at once. Default 6.
   * "auto" measures instead: each item's real rendered size (from its text) is checked against
   * the open space in the circle at its current size, and added only if it fits clear of the
   * other words, the center, and the rim. At least one always shows.
   */
  maxVisible?: number | "auto"
  /** Ceiling for auto mode. Default 12. The fit check still decides whether each word fits. */
  autoCap?: number
  /** Where floating words rest, as a share of the way from the dead zone to the rim. Default 0.62 */
  settleRing?: number
  /** How many words show at once inside an opened slice. Default 3 × maxVisible (auto: the auto cap) */
  maxVisibleOpen?: number
  /** Largest width of the ring, in px. Default 680 */
  maxWidth?: number
  /** Size of the center drop zone, as a share of the ring width. Default 0.06 */
  deadZoneSize?: number

  /* What to show */

  /** Countdown of words left in the center dead zone. Default true */
  showCounter?: boolean
  /** How many words sit on each slice. Default true */
  showCounts?: boolean
  /** Lists of placed words under the ring. Default false */
  showResults?: boolean
  /** Colored scores stay grey until hovered. Default true */
  greyUntilHover?: boolean
  /** Grain on colored slices, 0 to 1. Default 0.28; 0 turns it off */
  grain?: number
  /** Let long items (whole sentences) wrap onto a few lines in sentence case. Default false */
  wrapLabels?: boolean
  /** Select a card, then press 1–9 to place it on a score in low-to-high order. Default false. */
  keyboardShortcuts?: boolean
  /** After each placement, select the next floating word so it can be answered at once. Default false */
  autoSelectNext?: boolean
  /** The taker flipped the auto-select switch in the settings popover */
  onAutoSelectNextChange?: (on: boolean) => void
  /** The taker flipped "Show counts" in the settings popover */
  onShowCountsChange?: (show: boolean) => void
  /** Score labels follow the ring, like the action labels, instead of standing upright. Default false */
  curveLabels?: boolean
  /** The taker flipped "Word wrap" in the settings popover */
  onCurveLabelsChange?: (on: boolean) => void
  /** Size of the floating words and the prompt; slice labels stay fixed. Default "md" */
  textSize?: OrbitTextSize
  /** The taker picked a text size in the settings popover */
  onTextSizeChange?: (size: OrbitTextSize) => void
  /** Shows a "Tutorial" button in the settings popover; it closes the popover and calls this */
  onShowTutorial?: () => void
  /** A small confetti burst from the center when every word is placed. Default true */
  confetti?: boolean
  /** Delay before the center tooltip shows, in ms. Default 200 */
  tooltipDelay?: number

  /* Look, words, sound */

  colors?: OrbitColors
  labels?: OrbitLabels
  /** `false` mutes every sound. An object fine-tunes them. Default true */
  sound?: boolean | OrbitSound

  /* Events */

  /** A word landed on a score or flag, or moved between them */
  onPlace?: (placement: OrbitPlacement) => void
  /** A word went back to the pool from an open slice */
  onReturn?: (itemId: string) => void
  /** Every word has a place */
  onComplete?: (placements: OrbitPlacement[]) => void
  /** Drags, opened slices, cancels and the settings popover (see OrbitInteraction) */
  onInteraction?: (interaction: OrbitInteraction) => void
  /** Question shown near the top of the well; words steer around it. Hidden while a slice is open */
  prompt?: ReactNode
  /**
   * Decoration for the well (a texture or tone), clipped to the circle and drawn over its fill,
   * under the words and prompt. It takes no pointer input. Fill the box, e.g. `absolute inset-0`
   */
  wellLayer?: ReactNode
  className?: string
}

const DEFAULT_LABELS: Required<OrbitLabels> = {
  cancel: "Cancel Selection",
  return: "Return",
  settings: "Settings",
  volume: "Sound",
  mute: "Mute",
  unmute: "Unmute",
  autoSelectNext: "Auto-select next",
  showCounts: "Show counts",
  curveLabels: "Word wrap",
  textSize: "Text size",
  tutorial: "Tutorial",
  done: "That's the set.",
  remaining: (count) => `${count} left`,
}

const DEFAULT_SOUND: Required<OrbitSound> = {
  volume: 0.35,
  neutralVolume: 0.65,
  neutralPitch: 0.985,
  place: true,
  flag: true,
  return: true,
}

/** `colors` prop keys to the CSS variables in ORBIT_CSS at the bottom of this file */
const COLOR_VARS: Record<keyof OrbitColors, string> = {
  center: "--orbit-center",
  centerDark: "--orbit-center-dark",
  deadZone: "--orbit-dead-zone",
  deadZoneOpen: "--orbit-dead-zone-open",
  ink: "--orbit-ink",
  wordText: "--orbit-word-text",
  wordBackground: "--orbit-word-bg",
  wordTextDark: "--orbit-word-text-dark",
  wordBackgroundDark: "--orbit-word-bg-dark",
}

/** Inner well, as a fraction of the stage. The score band (WELL to RIM) is kept slim so words get room. */
const WELL = 0.337
/** Inner well when score labels follow the ring ("Word wrap"): one curved line needs a thinner band. */
const CURVED_WELL = 0.395
/** Outer edge of the score ring, as a fraction of the stage. */
const RIM = 0.4525
/** Outer edge of the action ring, as a fraction of the stage. */
const OUTER = 0.495
/** Drops a little past the action ring still count, so overshooting is forgiving. */
const OUTER_REACH = 0.56
/** Upright score labels longer than this wrap onto two lines */
const WRAP_AT = 10
/** Line spacing for wrapped score labels, in ring units */
const LINE_GAP = 2.4
/** Drop target id for the dead zone while a score is open: the word goes back to the pool. */
const POOL_TARGET = "\u0000pool"

const REPULSION = 320
const CENTER = 0.045
/** Words drift toward this share of the way from the dead zone to the rim */
const SETTLE_RING = 0.62
/** Open slice's close button: just inside the well facing the slice, in ring units (% of stage) */
const CLOSE_INSET = 3.8
/** Room words keep around the close button: its 30px plus a margin */
const CLOSE_CLEARANCE = 40
/** Room words keep around the prompt label, in px on each side */
const PROMPT_CLEARANCE = 10
/** Clear space kept between any word and the dead zone, in px */
const DEAD_ZONE_GAP = 18
/** Share of the center's full zone used for spawn clearance */
const CENTER_COLLISION = 0.25
const DAMPING = 0.45
const MAX_SPEED = 22
const SETTLE_PASSES = 4
/** Below this speed, in px per frame, a box comes to rest instead of jittering. */
const REST_SPEED = 0.15
/** Share of the well that floating words may cover before new ones wait */
const FILL_LIMIT = 0.55
/** Size guess for a word at full ring size, before it renders and can be measured */
const TYPICAL_W = 120
const TYPICAL_H = 34
/** Ring width where words reach their largest text size */
const FULL_SIZE = 680
/** Words that may float even when the well is crowded */
const MIN_VISIBLE = 3
/** Auto mode: most words floating at once, as a ceiling on what fits */
const AUTO_CAP = 12
/** Auto mode: free space a new word needs around it, in px */
const AUTO_GAP = 14
/** Auto mode: how long words may overlap before the newest one is taken back out, in ms */
const CROWD_GRACE_MS = 150
/** Auto mode: fade-out of a word taken back out of a crowded ring, in ms */
const CROWD_FADE_MS = 180
/** A selected word deselects itself after this long with no slice picked and no pointer movement, in ms */
const SELECT_TIMEOUT_MS = 2000
/** Pressing a word this long without moving it selects it, in ms */
const SELECT_HOLD_MS = 350
/** A word held down without moving is let go after this long, in ms */
const HOLD_TIMEOUT_MS = 3000
/** Pointer movement under this, in px, counts as holding still */
const HOLD_STILL_PX = 3
/** How often the loop checks that shown words and the physics agree, in ms */
const RECONCILE_MS = 250
/** Auto mode: after a word is dropped, overlap removal stays off this long, in ms */
const CROWD_RESUME_MS = 1000 /** Auto mode: overlap smaller than this, in px, doesn't count as crowding */
const CROWD_SLACK = 2
/** Auto mode, for words too big for the ring: text sizes to try, as shares of the normal size */
const FIT_FONT_STEPS = [1, 0.9, 0.8, 0.7]
/** ...and box widths to try at each text size, as shares of the well's radius */
const FIT_WIDTH_STEPS = [0.6, 0.8, 1, 1.2]
/** Smallest text auto mode will shrink a word to, in px */
const MIN_FONT = 10

/** Inline styles for a word auto mode resized; undefined when it fits as styled */
function fitStyle(fit: ItemFit | undefined): CSSProperties | undefined {
  if (!fit || (!fit.fontSize && !fit.maxWidth && !fit.maxHeight))
    return undefined
  return {
    fontSize: fit.fontSize,
    maxWidth: fit.maxWidth,
    maxHeight: fit.maxHeight,
  }
}

/** How auto mode sized one word to fit the ring; empty when it fits as styled */
interface ItemFit {
  fontSize?: number
  maxWidth?: number
  /** Set only when the word is still too tall: it scrolls inside this height */
  maxHeight?: number
}
const GAP = 12
const SPAWN_GAP_MS = 140
/** By default an open slice shows this many times `maxVisible` at once. */
const OPEN_FACTOR = 3
/** A drag shorter than this, in px, is a click and keeps the item in the well. */
const DROP_DISTANCE = 6
/** The latest pull must cover this many px before it sets the aim; shorter pulls use the whole drag. */
const AIM_MIN_STROKE = 3
/** A dropped word shrinks and fades as it flies, vanishing as it reaches its slice */
const FLIGHT_MS = 320
/** Delay between words popping out of a slice that opens */
const OPEN_STAGGER_MS = 45
/** The aim follows the pull over this recent stretch, so it tracks turns at once. */
const AIM_WINDOW_MS = 80

interface Body {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  pin: boolean
  w: number
  h: number
}

interface Drag {
  id: string
  /** Pointer position, relative to the stage center */
  x: number
  y: number
  /** Pointer position at grab */
  startX: number
  startY: number
  /** Item center minus pointer, so the item does not jump to the cursor */
  offsetX: number
  offsetY: number
  time: number
  /** Pull direction over the last AIM_WINDOW_MS, in px */
  ax: number
  ay: number
  samples: Array<{ x: number; y: number; t: number }>
  moved: boolean
  rect: DOMRect
  pointerId: number
  /** Where the pointer last really moved; holding still past HOLD_TIMEOUT_MS from here lets go */
  holdX: number
  holdY: number
  /** Held still past HOLD_TIMEOUT_MS: letting go now cancels instead of placing */
  held: boolean
  /** Pressed without moving long enough to select; letting go keeps it selected */
  holdSelected: boolean
}

interface Flight {
  fromX: number
  fromY: number
  toX: number
  toY: number
  start: number
  scoreId: string
}

/**
 * Rounds ring coordinates to 3 decimals. Server and browser trig can differ in the last
 * digit, which breaks hydration; 0.001 of a 100-unit ring is far below a pixel.
 */
const fix = (value: number) => Math.round(value * 1000) / 1000

function wedge(inner: number, outer: number, start: number, end: number) {
  const large = end - start > Math.PI ? 1 : 0
  const at = (radius: number, angle: number) => ({
    x: fix(50 + radius * Math.cos(angle)),
    y: fix(50 + radius * Math.sin(angle)),
  })
  const outerStart = at(outer, start)
  const outerEnd = at(outer, end)
  const innerEnd = at(inner, end)
  const innerStart = at(inner, start)
  return `M ${outerStart.x} ${outerStart.y} A ${outer} ${outer} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${inner} ${inner} 0 ${large} 0 ${innerStart.x} ${innerStart.y} Z`
}

/** Arc for curved labels. Runs backwards on the bottom half so text stays upright. */
function labelArc(radius: number, start: number, end: number) {
  const large = end - start > Math.PI ? 1 : 0
  const at = (angle: number) =>
    `${fix(50 + radius * Math.cos(angle))} ${fix(50 + radius * Math.sin(angle))}`
  if (Math.sin((start + end) / 2) > 0) {
    return `M ${at(end)} A ${radius} ${radius} 0 ${large} 0 ${at(start)}`
  }
  return `M ${at(start)} A ${radius} ${radius} 0 ${large} 1 ${at(end)}`
}

/** "Strongly agree" â†’ "Strongly Agree" */
function titleCase(text: string) {
  return text.replace(
    /(^|\s)(\p{Ll})/gu,
    (_, space: string, letter: string) => space + letter.toUpperCase()
  )
}

/** Middle of a scale: 3 of 1–5, 4 of 1–7. Even counts have none. */
function neutralIndex(count: number) {
  return count % 2 === 1 ? (count - 1) / 2 : -1
}

/** Turns the score ring so its middle sits at 6 o'clock. Even counts center a seam there. */
function scoreOffset(count: number) {
  return Math.PI - ((count - 1) / 2) * ((Math.PI * 2) / Math.max(1, count))
}

/**
 * Slice that holds this angle. With no offset, slice 0 is centered on 12 o'clock;
 * `offset` turns the ring clockwise by that many radians.
 */
function segmentAt(x: number, y: number, count: number, offset = 0) {
  const sweep = (Math.PI * 2) / count
  let angle = Math.atan2(y, x) + Math.PI / 2 + sweep / 2 - offset
  angle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  const index = Math.floor(angle / sweep) % count
  // A point with no usable angle (NaN from a bad position) is over no slice
  return Number.isInteger(index) && index >= 0 ? index : null
}

/** Slice under the point, when the point is inside the band between two radii (fractions of the stage). */
function bandIndex(
  x: number,
  y: number,
  size: number,
  count: number,
  inner: number,
  outer: number,
  offset = 0
) {
  if (count === 0) return null
  const distance = Math.hypot(x, y)
  if (distance < size * inner || distance > size * outer) return null
  return segmentAt(x, y, count, offset)
}

/** Score the pull points at: cast a ray from the item along the pull and see where it meets the rim. */
function aimIndex(
  x: number,
  y: number,
  ax: number,
  ay: number,
  size: number,
  count: number,
  well = WELL
) {
  if (count === 0) return null
  const length = Math.hypot(ax, ay)
  if (length === 0) return null
  const dx = ax / length
  const dy = ay / length
  const distance = Math.hypot(x, y)
  const along = x * dx + y * dy
  const radius = (size * (well + RIM)) / 2
  const disc = along * along - (distance * distance - radius * radius)
  if (disc < 0) return null
  const t = -along + Math.sqrt(disc)
  return segmentAt(x + t * dx, y + t * dy, count, scoreOffset(count))
}

function segmentCenter(
  index: number,
  count: number,
  radius: number,
  offset = 0
) {
  const angle = -Math.PI / 2 + offset + index * ((Math.PI * 2) / count)
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
}

const easeOut = (t: number) => 1 - (1 - t) ** 5

let audio: AudioContext | null = null

/**
 * Low, soft shuffle for a word going back to the pool: two quick bursts of
 * low-passed noise, like a card slid back into a deck.
 */
function playShuffle(loudness = 1) {
  try {
    audio ??= new AudioContext()
    const context = audio
    const shuffle = () => {
      const start = context.currentTime
      const length = Math.floor(context.sampleRate * 0.2)
      const buffer = context.createBuffer(1, length, context.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
      const noise = context.createBufferSource()
      noise.buffer = buffer
      const filter = context.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(700, start)
      filter.frequency.exponentialRampToValueAtTime(300, start + 0.18)
      const volume = context.createGain()
      volume.gain.setValueAtTime(0, start)
      for (const offset of [0, 0.07]) {
        volume.gain.linearRampToValueAtTime(
          0.05 * loudness,
          start + offset + 0.015
        )
        volume.gain.linearRampToValueAtTime(
          0.008 * loudness,
          start + offset + 0.06
        )
      }
      volume.gain.exponentialRampToValueAtTime(0.0001, start + 0.2)
      noise.connect(filter).connect(volume).connect(context.destination)
      noise.start(start)
      noise.stop(start + 0.2)
      noise.onended = () => {
        noise.disconnect()
        filter.disconnect()
        volume.disconnect()
      }
    }
    if (context.state === "suspended")
      void context
        .resume()
        .then(shuffle)
        .catch(() => {})
    else shuffle()
  } catch {
    // Audio support must never interrupt returning a word.
  }
}

/**
 * The test page's answer chime (E5 then B5, 70ms apart) for a word landing on a slice.
 * `falling` plays it in reverse (B5 then E5) for the flag ring, so a flag sounds like setting aside.
 * `loudness` scales the volume, from 0 to 1; `pitch` scales both notes.
 */
function playChime(falling = false, loudness = 1, pitch = 1) {
  try {
    audio ??= new AudioContext()
    const context = audio
    const chime = () => {
      const start = context.currentTime
      ;(falling ? [987.77, 659.25] : [659.25, 987.77]).forEach(
        (frequency, index) => {
          const tone = context.createOscillator()
          const volume = context.createGain()
          const time = start + index * 0.07
          tone.type = "sine"
          tone.frequency.value = frequency * pitch
          volume.gain.setValueAtTime(0, time)
          volume.gain.linearRampToValueAtTime(0.045 * loudness, time + 0.012)
          volume.gain.exponentialRampToValueAtTime(0.001, time + 0.22)
          tone.connect(volume)
          volume.connect(context.destination)
          tone.start(time)
          tone.stop(time + 0.24)
          tone.onended = () => {
            tone.disconnect()
            volume.disconnect()
          }
        }
      )
    }
    if (context.state === "suspended")
      void context
        .resume()
        .then(chime)
        .catch(() => {})
    else chime()
  } catch {
    // Audio support must never interrupt placing.
  }
}

/** Pushes two boxes apart until they no longer overlap. Pinned boxes don't move. */
function separate(left: Body, right: Body) {
  const dx = right.x - left.x || 0.01
  const dy = right.y - left.y
  const overlapX = (left.w + right.w) / 2 + GAP - Math.abs(dx)
  const overlapY = (left.h + right.h) / 2 + GAP - Math.abs(dy)
  if (overlapX <= 0 || overlapY <= 0) return
  const alongX = overlapX < overlapY
  const shift = alongX ? overlapX : overlapY
  const sx = alongX ? Math.sign(dx) * shift : 0
  const sy = alongX ? 0 : Math.sign(dy || 1) * shift
  const leftShare = left.pin ? 0 : right.pin ? 1 : 0.5
  const rightShare = right.pin ? 0 : left.pin ? 1 : 0.5
  left.x -= sx * leftShare
  left.y -= sy * leftShare
  right.x += sx * rightShare
  right.y += sy * rightShare
  // Drop the closing speed so separated boxes don't bounce back into each other.
  const ux = alongX ? Math.sign(dx) : 0
  const uy = alongX ? 0 : Math.sign(dy || 1)
  const closing = (left.vx - right.vx) * ux + (left.vy - right.vy) * uy
  if (closing > 0) {
    left.vx -= ux * closing * leftShare
    left.vy -= uy * closing * leftShare
    right.vx += ux * closing * rightShare
    right.vy += uy * closing * rightShare
  }
}

function stepBodies(
  bodies: Body[],
  radius: number,
  deadRadius: number,
  dt: number,
  settleShare = SETTLE_RING
) {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const left = bodies[i]
      const right = bodies[j]
      let dx = right.x - left.x
      let dy = right.y - left.y
      let distance = Math.hypot(dx, dy)
      if (distance < 1) {
        dx = 1
        dy = 0
        distance = 1
      }
      const push = Math.min(9, (REPULSION / distance) * dt)
      const ux = dx / distance
      const uy = dy / distance
      if (!left.pin) {
        left.vx -= ux * push
        left.vy -= uy * push
      }
      if (!right.pin) {
        right.vx += ux * push
        right.vy += uy * push
      }
    }
  }

  const start = bodies.map((body) => ({ x: body.x, y: body.y }))
  for (const body of bodies) {
    if (body.pin) continue
    // Pull toward a ring partway out, not the center, so words spread around the dead zone
    const distance = Math.hypot(body.x, body.y)
    // A soft outward force replaces the center wall. Include the card's edges so
    // large cards steer away too, and give a card at the exact center a direction.
    const nx = distance > 0 ? body.x / distance : 1
    const ny = distance > 0 ? body.y / distance : 0
    const clearance = nearPoint(body.x, body.y, body.w, body.h)
    const repelReach = deadRadius + DEAD_ZONE_GAP
    const repel = Math.min(9, Math.max(0, repelReach - clearance) * 0.12) * dt
    // Rest far enough out that the card's nearest edge clears the center, so big text (or a
    // low settleShare) doesn't park cards over the counter. Moving out raises clearance ~1:1
    const settle = Math.max(
      deadRadius + (radius - deadRadius) * settleShare,
      distance - clearance + repelReach
    )
    const pull = (distance - settle) * CENTER * dt
    body.vx += nx * (repel - pull)
    body.vy += ny * (repel - pull)
    const damp = Math.pow(DAMPING, dt)
    body.vx *= damp
    body.vy *= damp
    const speed = Math.hypot(body.vx, body.vy)
    if (speed > MAX_SPEED) {
      body.vx = (body.vx / speed) * MAX_SPEED
      body.vy = (body.vy / speed) * MAX_SPEED
    }
    body.x += body.vx * dt
    body.y += body.vy * dt
  }

  // Overlap fixes and the walls fight each other, so settle them together a few times.
  for (let pass = 0; pass < SETTLE_PASSES; pass++) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) separate(bodies[i], bodies[j])
    }
    for (const body of bodies) {
      if (!body.pin) confine(body, radius)
    }
  }

  // Keep only the speed the box actually moved. When forces and walls cancel out in a tight
  // well, this drains the stored push instead of letting it bounce the box in place.
  bodies.forEach((body, index) => {
    if (body.pin) return
    body.vx = (body.x - start[index].x) / dt
    body.vy = (body.y - start[index].y) / dt
    if (Math.hypot(body.vx, body.vy) < REST_SPEED) {
      body.vx = 0
      body.vy = 0
      body.x = start[index].x
      body.y = start[index].y
    }
  })
}

/**
 * Preferred center clearance for spawning and fitting cards. Moving cards use
 * soft repulsion instead of a hard center boundary.
 */
const centerClearance = (deadRadius: number) =>
  (deadRadius + DEAD_ZONE_GAP) * CENTER_COLLISION

/** Farthest corner of a w×h box centered at (x, y), measured from the ring's center */
const farCorner = (x: number, y: number, w: number, h: number) =>
  Math.hypot(Math.abs(x) + w / 2, Math.abs(y) + h / 2)

/** Nearest point of a w×h box centered at (x, y), measured from the ring's center */
const nearPoint = (x: number, y: number, w: number, h: number) =>
  Math.hypot(
    Math.max(x - w / 2, Math.min(0, x + w / 2)),
    Math.max(y - h / 2, Math.min(0, y + h / 2))
  )

/**
 * How far out along the direction (ux, uy) a box may sit: past `min` it clears the dead zone,
 * up to `max` its corners stay inside the rim. Both grow steadily along the ray, so a short
 * binary search finds them. `min > max` means the box can't fit in that direction.
 */
function radialLimits(
  ux: number,
  uy: number,
  w: number,
  h: number,
  radius: number,
  deadRadius: number
) {
  const reachLimit = radius - 4
  const clear = centerClearance(deadRadius)
  const search = (ok: (t: number) => boolean, findLast: boolean) => {
    let low = 0
    let high = radius
    for (let step = 0; step < 18; step++) {
      const mid = (low + high) / 2
      if (ok(mid) === findLast) low = mid
      else high = mid
    }
    return findLast ? low : high
  }
  const max = search((t) => farCorner(ux * t, uy * t, w, h) <= reachLimit, true)
  const min = search((t) => nearPoint(ux * t, uy * t, w, h) >= clear, false)
  return { min, max }
}

/**
 * Keeps a box's corners inside the outer rim. The center only repels cards;
 * passing over it never clamps their position.
 */
function confine(body: Body, radius: number) {
  let distance = Math.hypot(body.x, body.y)
  if (distance < 1) {
    const angle = Math.random() * Math.PI * 2
    body.x = Math.cos(angle)
    body.y = Math.sin(angle)
    distance = 1
  }
  const nx = body.x / distance
  const ny = body.y / distance
  const { max } = radialLimits(nx, ny, body.w, body.h, radius, 0)
  const target = Math.min(distance, max)
  if (target === distance) return
  body.x = nx * target
  body.y = ny * target
  // Drop the speed that pushed it into the wall, so it doesn't bounce back
  const along = body.vx * nx + body.vy * ny
  if ((target < distance && along > 0) || (target > distance && along < 0)) {
    body.vx -= along * 1.5 * nx
    body.vy -= along * 1.5 * ny
  }
}

function paintNode(node: HTMLElement, body: Body, bounds?: DOMRect) {
  // `translate` applies after `scale`, so pop, hover, and fade scale around the word itself.
  // Placed from the stage's top-left in whole pixels, centering included:
  // text drawn at half-pixel offsets looks blurry.
  // The stage itself can sit on a half pixel (centered in an odd-width page), so cancel that too.
  const stage = node.parentElement
  const box = bounds ?? stage?.getBoundingClientRect()
  const offsetX = box ? box.left - Math.round(box.left) : 0
  const offsetY = box ? box.top - Math.round(box.top) : 0
  const x = Math.round((box?.width ?? 0) / 2 + body.x - body.w / 2) - offsetX
  const y = Math.round((box?.height ?? 0) / 2 + body.y - body.h / 2) - offsetY
  const translate = `${x}px ${y}px`
  if (node.style.translate !== translate) node.style.translate = translate
}

/** Black or white, whichever reads better on a #rrggbb fill */
function readableOn(hex: string) {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex)
  if (!match) return "#000"
  const [r, g, b] = match.slice(1).map((part) => {
    const c = parseInt(part, 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  // Contrast against black beats contrast against white above ~0.18 luminance
  return luminance > 0.179 ? "#000" : "#fff"
}

/** Centers each curved count's circle on its digits, which only the browser can measure. */
function placeCountBadges(stage: HTMLElement) {
  stage
    .querySelectorAll<SVGCircleElement>("[data-orbit-count-badge]")
    .forEach((badge) => {
      const text = badge.parentElement?.querySelector("text")
      const digits = Number(badge.dataset.orbitCountBadge)
      if (!text || !digits) return
      const total = text.getNumberOfChars()
      if (total < digits) return
      const first = text.getExtentOfChar(total - digits)
      const last = text.getExtentOfChar(total - 1)
      badge.setAttribute("cx", String((first.x + last.x + last.width) / 2))
      badge.setAttribute(
        "cy",
        String((first.y + first.height / 2 + last.y + last.height / 2) / 2)
      )
      // Sized by digit count: a tilted digit's box overstates its width
      badge.setAttribute("r", String(1.25 + (digits - 1) * 0.45))
      badge.removeAttribute("visibility")
    })
}

/** Keep upright score labels within the curved boundaries as the ring resizes. */
function fitScoreLabels(stage: HTMLElement) {
  placeCountBadges(stage)
  stage
    .querySelectorAll<SVGGElement>("[data-orbit-score-label]")
    .forEach((label) => {
      const segment = label.parentElement?.querySelector("path")
      if (!(segment instanceof SVGGeometryElement)) return
      const box = label.getBBox()
      const cx = box.x + box.width / 2
      const cy = box.y + box.height / 2
      // Check corners and edge midpoints against the curved segment boundary.
      const points = [
        [box.x, box.y],
        [cx, box.y],
        [box.x + box.width, box.y],
        [box.x, cy],
        [box.x + box.width, cy],
        [box.x, box.y + box.height],
        [cx, box.y + box.height],
        [box.x + box.width, box.y + box.height],
      ]
      // Some browsers only accept an SVGPoint here, not a DOMPoint
      const point = segment.ownerSVGElement?.createSVGPoint()
      if (!point) return
      const inside = (x: number, y: number) => {
        point.x = x
        point.y = y
        return segment.isPointInFill(point)
      }
      let scale = 1
      while (
        scale > 0.45 &&
        !points.every(([x, y]) =>
          inside(cx + (x - cx) * scale, cy + (y - cy) * scale)
        )
      )
        scale -= 0.025
      label.setAttribute(
        "transform",
        `translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`
      )
    })
}

/** Floating items in a score ring. Place every item to finish the round. */
export function OrbitRing({
  items,
  initialPlacements,
  scores,
  actions = DEFAULT_ORBIT_ACTIONS,
  maxVisible = 6,
  autoCap = AUTO_CAP,
  settleRing = SETTLE_RING,
  maxVisibleOpen,
  maxWidth = 680,
  deadZoneSize = 0.06,
  showCounter = true,
  showCounts = true,
  showResults = false,
  greyUntilHover = true,
  grain = 0.28,
  confetti = true,
  wrapLabels = false,
  keyboardShortcuts = false,
  tooltipDelay = 200,
  colors,
  labels: labelsProp,
  sound = true,
  autoSelectNext = false,
  onAutoSelectNextChange,
  onShowCountsChange,
  curveLabels = false,
  onCurveLabelsChange,
  textSize = "md",
  onTextSizeChange,
  onShowTutorial,
  onPlace,
  onReturn,
  onComplete,
  onInteraction,
  prompt,
  wellLayer,
  className,
}: OrbitRingProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const soundOptions: Required<OrbitSound> | null =
    sound === false
      ? null
      : { ...DEFAULT_SOUND, ...(sound === true ? {} : sound) }
  const wrapStyle = { "--orbit-max-width": `${maxWidth}px` } as Record<
    string,
    string
  >
  for (const [key, value] of Object.entries(colors ?? {})) {
    if (value) wrapStyle[COLOR_VARS[key as keyof OrbitColors]] = value
  }
  const auto = maxVisible === "auto"
  /** Most words floating at once; auto relies on the fit check and only uses this as a ceiling */
  const visibleCap = auto ? autoCap : maxVisible
  const openLimit =
    maxVisibleOpen ?? (auto ? autoCap : maxVisible * OPEN_FACTOR)
  /** Hidden copy of a word, for measuring items before they're shown (auto mode) */
  const measureRef = useRef<HTMLSpanElement>(null)
  /** Auto mode's per-word text size, width, and scroll height */
  const fitsRef = useRef(new Map<string, ItemFit>())
  const [fits, setFits] = useState(() => new Map<string, ItemFit>())
  /** Auto mode: words fading out after being taken back out of a crowded ring */
  const [leaving, setLeaving] = useState(() => new Set<string>())
  /** Latest shown and fading words, for the animation loop's reconcile check */
  const presentRef = useRef<string[]>([])
  const leavingRef = useRef(leaving)
  /** Confetti uses the ring's own slice colors */
  const confettiColors = useMemo(() => {
    const own = [...scores, ...actions].flatMap((slice) =>
      [slice.hoverColor, slice.color].filter((color): color is string =>
        Boolean(color)
      )
    )
    return own.length > 0 ? own : CONFETTI_FALLBACK
  }, [scores, actions])
  const labelId = useId()
  /** useId can return characters that break `url(#…)` references */
  const grainId = `${labelId.replace(/[^\w-]/g, "")}-grain`
  const hatchId = `${labelId.replace(/[^\w-]/g, "")}-hatch`
  const centerClipId = `${labelId.replace(/[^\w-]/g, "")}-center-clip`
  /**
   * Scores in ring order. Slices run clockwise from the top, so reversing puts the
   * low end on the left and the high end on the right, with neutral at the bottom.
   */
  const ring = useMemo(() => [...scores].reverse(), [scores])
  /** What the round is made of; a new round starts only when one of these changes */
  const itemsKey = items.map((item) => item.id).join("\u0001")
  const scoresKey = scores.map((score) => score.id).join("\u0001")
  const actionsKey = actions.map((action) => action.id).join("\u0001")
  const stageRef = useRef<HTMLDivElement>(null)
  /** The prompt label, which words steer around like the close button */
  const promptRef = useRef<HTMLDivElement>(null)
  const keyboardHelpRef = useRef<HTMLParagraphElement>(null)
  const nodesRef = useRef(new Map<string, HTMLButtonElement>())
  const nodeObserverRef = useRef<ResizeObserver | null>(null)
  const bodiesRef = useRef(new Map<string, Body>())
  const queueRef = useRef<string[]>([])
  const dragRef = useRef<Drag | null>(null)
  const flightsRef = useRef(new Map<string, Flight>())
  const selectedRef = useRef<string | null>(null)
  const sizeRef = useRef(640)
  /** Inner well in use: thinner score band while labels are curved */
  const wellRef = useRef(WELL)
  /** Re-fits the floating words to the well; set by the physics effect */
  const remeasureRef = useRef<() => void>(() => {})
  /** Text size in use, so the physics effect re-fits words when it changes */
  const textScaleRef = useRef(1)
  const reduceMotionRef = useRef(false)
  const finishedRef = useRef(false)
  const placementsRef = useRef<OrbitPlacement[]>([])
  const sendRef = useRef<(itemId: string, scoreId: string) => void>(() => {})
  const toggleOpenRef = useRef<(scoreId: string) => void>(() => {})
  const closeRef = useRef<() => void>(() => {})
  /** Lets go of a word held still too long; set by the main effect */
  const releaseHoldRef = useRef<() => void>(() => {})
  const holdTimerRef = useRef(0)
  /** Countdown from a press to selecting the pressed word (SELECT_HOLD_MS) */
  const selectHoldTimerRef = useRef(0)
  /** Floating items set aside while a score is open */
  const poolRef = useRef<Map<string, Body> | null>(null)
  const openRef = useRef<string | null>(null)
  /** Words in the open score that wait for room in the well */
  const openQueueRef = useRef<string[]>([])
  const hotRef = useRef<string | null>(null)
  /** Pop-in delay per word, so an opened slice's words appear in turn */
  const popDelayRef = useRef(new Map<string, number>())
  const onPlaceRef = useRef(onPlace)
  const onCompleteRef = useRef(onComplete)
  const itemsRef = useRef(items)
  const initialPlacementsRef = useRef(initialPlacements)
  const scoresRef = useRef(ring)
  const actionsRef = useRef(actions)
  const soundRef = useRef(soundOptions)
  const onReturnRef = useRef(onReturn)
  const onInteractionRef = useRef(onInteraction)
  const deadZoneRef = useRef(deadZoneSize)
  const settleRef = useRef(settleRing)
  const tooltipDelayRef = useRef(tooltipDelay)

  const [present, setPresent] = useState<string[]>([])
  useEffect(() => {
    presentRef.current = present
    leavingRef.current = leaving
  }, [present, leaving])
  const [placements, setPlacements] = useState<OrbitPlacement[]>([])
  /** "Word wrap" in settings: score labels follow the ring */
  const [ownCurveLabels, setOwnCurveLabels] = useState(curveLabels)
  const labelsCurved = onCurveLabelsChange ? curveLabels : ownCurveLabels
  // Curved labels need less band, so the well grows and the words get the room
  const well = labelsCurved ? CURVED_WELL : WELL
  useEffect(() => {
    if (wellRef.current === well) return
    wellRef.current = well
    remeasureRef.current()
  }, [well])
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const fit = () => fitScoreLabels(stage)
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(stage)
    document.fonts.addEventListener("loadingdone", fit)
    return () => {
      observer.disconnect()
      document.fonts.removeEventListener("loadingdone", fit)
    }
  }, [placements, scoresKey, actionsKey, keyboardShortcuts, labelsCurved])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hotScoreId, setHotScoreId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [openScoreId, setOpenScoreId] = useState<string | null>(null)
  /** A dragged word is over the dead zone; hover can't fire while the pointer is captured */
  const [overCenter, setOverCenter] = useState(false)
  /** "Release" hint, shown once a dragged word has rested over the dead zone for a moment */
  const [releaseTip, setReleaseTip] = useState(false)
  /** The held word was kept still long enough that letting go cancels it */
  const [holdCancel, setHoldCancel] = useState(false)
  const [note, setNote] = useState("")
  /** Settings popover from the center, and the volume it controls (starts at `sound.volume`) */
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [volume, setVolume] = useState(soundOptions?.volume ?? 0)
  const volumeRef = useRef(volume)
  /** Volume before muting, so unmuting puts it back */
  const lastVolumeRef = useRef(volume)
  const settingsRef = useRef<HTMLDivElement>(null)
  /** Select a floating word as soon as one lands; the taker can turn it off in settings */
  // Follows the prop when the parent handles changes; otherwise the ring keeps its own
  const [ownAutoSelect, setOwnAutoSelect] = useState(autoSelectNext)
  const autoSelect = onAutoSelectNextChange ? autoSelectNext : ownAutoSelect
  /** Slice counts, likewise from the prop when the parent handles changes */
  const [ownShowCounts, setOwnShowCounts] = useState(showCounts)
  const countsShown = onShowCountsChange ? showCounts : ownShowCounts
  /** Text size, likewise from the prop when the parent handles changes */
  const [ownTextSize, setOwnTextSize] = useState(textSize)
  const textScale = TEXT_SCALES[onTextSizeChange ? textSize : ownTextSize] ?? 1
  wrapStyle["--orbit-text-scale"] = String(textScale)
  // A new text size re-fits the floating words
  useEffect(() => {
    if (textScaleRef.current === textScale) return
    textScaleRef.current = textScale
    remeasureRef.current()
  }, [textScale])
  /** A word just landed (or the ring just opened) and the next one should be selected once one is free */
  const autoSelectPendingRef = useRef(true)

  useEffect(() => {
    volumeRef.current = volume
  }, [volume])

  // Mounting reports the resting state too, which a listener can ignore
  useEffect(() => {
    onInteractionRef.current?.({ type: "aim", scoreId: hotScoreId })
  }, [hotScoreId])
  useEffect(() => {
    onInteractionRef.current?.({ type: "open", scoreId: openScoreId })
  }, [openScoreId])
  useEffect(() => {
    onInteractionRef.current?.({ type: "settings", open: settingsOpen })
  }, [settingsOpen])

  // Close the popover on Escape or a click anywhere else.
  useEffect(() => {
    if (!settingsOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false)
    }
    const onDown = (event: PointerEvent) => {
      const target = event.target as Element
      // The center toggles it itself, so let that click through
      if (
        settingsRef.current?.contains(target) ||
        target.closest?.("[data-orbit-center]")
      )
        return
      setSettingsOpen(false)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onDown)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onDown)
    }
  }, [settingsOpen])

  useEffect(() => {
    onPlaceRef.current = onPlace
    onCompleteRef.current = onComplete
    itemsRef.current = items
    initialPlacementsRef.current = initialPlacements
    scoresRef.current = ring
    actionsRef.current = actions
    soundRef.current = soundOptions
    onReturnRef.current = onReturn
    onInteractionRef.current = onInteraction
    deadZoneRef.current = deadZoneSize
    settleRef.current = settleRing
    tooltipDelayRef.current = tooltipDelay
  })

  useEffect(() => {
    selectedRef.current = selectedId
    if (!selectedId || keyboardShortcuts) return
    // A picked-up word lets go on its own after a moment with no slice picked and no pointer
    // movement; moving over the ring restarts the countdown
    let timer = 0
    const arm = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        if (dragRef.current?.id === selectedId) return arm()
        setSelectedId((current) => (current === selectedId ? null : current))
      }, SELECT_TIMEOUT_MS)
    }
    arm()
    const stage = stageRef.current
    stage?.addEventListener("pointermove", arm)
    return () => {
      window.clearTimeout(timer)
      stage?.removeEventListener("pointermove", arm)
    }
  }, [selectedId, keyboardShortcuts])

  // Auto-select: once a word lands, select the longest-floating free word. Waits for one to
  // float in, and gives way to anything the taker picked or is dragging meanwhile.
  useEffect(() => {
    if (!autoSelectPendingRef.current) return
    if (!autoSelect || selectedId || openScoreId) {
      autoSelectPendingRef.current = false
      return
    }
    if (dragRef.current) return
    const next = present.find(
      (id) =>
        bodiesRef.current.has(id) &&
        !flightsRef.current.has(id) &&
        !leaving.has(id)
    )
    if (!next) return
    autoSelectPendingRef.current = false
    selectedRef.current = next
    setSelectedId(next)
    // Keep keyboard takers on the selected card; pointer takers keep their focus where it was
    const stage = stageRef.current
    if (
      stage &&
      document.activeElement instanceof Node &&
      stage.contains(document.activeElement)
    ) {
      nodesRef.current.get(next)?.focus({ preventScroll: true })
    }
  }, [present, placements, leaving, autoSelect, selectedId, openScoreId])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    // Restored placements start on their slices; only the rest queue up to float in
    const known = new Set(
      [...scoresRef.current, ...actionsRef.current].map((score) => score.id)
    )
    const itemIds = new Set(itemsRef.current.map((item) => item.id))
    const restored = (initialPlacementsRef.current ?? []).filter(
      (placement) =>
        itemIds.has(placement.itemId) && known.has(placement.scoreId)
    )
    const placedIds = new Set(restored.map((placement) => placement.itemId))
    queueRef.current = itemsRef.current
      .map((item) => item.id)
      .filter((id) => !placedIds.has(id))
    bodiesRef.current = new Map()
    flightsRef.current.clear()
    poolRef.current = null
    openRef.current = null
    openQueueRef.current = []
    finishedRef.current =
      restored.length > 0 && restored.length === itemsRef.current.length
    placementsRef.current = restored
    fitsRef.current = new Map()
    setFits(new Map())
    setLeaving(new Set())
    setPresent([])
    setPlacements(restored)
    setSelectedId(null)
    setHotScoreId(null)
    setOpenScoreId(null)
    setNote("")

    const measure = () => {
      // A stage that isn't laid out yet (hidden, mid-load) reads 0; spawning and fitting with
      // that poisons every position, so keep the last real size and let the observer re-measure
      if (stage.clientWidth === 0) return
      const resized =
        sizeRef.current !== stage.clientWidth ||
        measuredWell !== wellRef.current ||
        measuredScale !== textScaleRef.current
      sizeRef.current = stage.clientWidth
      measuredWell = wellRef.current
      measuredScale = textScaleRef.current
      if (resized) measuredItems.clear()
      // Auto: a ring that changed size (rotation, window resize, a scrollbar appearing)
      // re-fits every word on screen, so text size and width match the room it has now
      if (auto && resized && bodiesRef.current.size > 0) {
        for (const body of bodiesRef.current.values()) {
          const measured = measureItem(body.id)
          if (!measured) continue
          const { fit, ...size } = measured
          fitsRef.current.set(body.id, fit)
          body.w = size.w
          body.h = size.h
        }
        setFits(new Map(fitsRef.current))
        return
      }
      for (const [id, node] of nodesRef.current) {
        const body = bodiesRef.current.get(id)
        if (!body) continue
        body.w = node.offsetWidth
        body.h = node.offsetHeight
      }
    }
    // Text fitting is stable until the ring resizes, the well changes, or its fonts finish loading.
    let measuredWell = wellRef.current
    let measuredScale = textScaleRef.current
    const measuredItems = new Map<
      string,
      { w: number; h: number; fit: ItemFit }
    >()
    measure()
    remeasureRef.current = measure
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    const nodeObserver = new ResizeObserver((entries) => {
      for (const { target } of entries) {
        const node = target as HTMLButtonElement
        const body = bodiesRef.current.get(node.dataset.orbitItem ?? "")
        if (body) {
          body.w = node.offsetWidth
          body.h = node.offsetHeight
        }
      }
    })
    nodeObserverRef.current = nodeObserver
    const onFontsLoaded = () => {
      measuredItems.clear()
      measure()
    }
    document.fonts.addEventListener("loadingdone", onFontsLoaded)

    let frame = 0
    let last = performance.now()
    let nextSpawn = 0

    /**
     * The open slice's close button as a pinned body, so words steer around it and new ones
     * don't spawn on it. The crowd check skips pinned bodies, so it never removes a word.
     */
    const closeObstacle = (): Body | null => {
      const openId = openRef.current
      if (!openId) return null
      const scoreAt = scoresRef.current.findIndex(
        (entry) => entry.id === openId
      )
      const list = scoreAt !== -1 ? scoresRef.current : actionsRef.current
      const index =
        scoreAt !== -1
          ? scoreAt
          : list.findIndex((entry) => entry.id === openId)
      if (index === -1) return null
      const angle =
        -Math.PI / 2 +
        (scoreAt !== -1 ? scoreOffset(list.length) : 0) +
        index * ((Math.PI * 2) / Math.max(1, list.length))
      const reach =
        ((wellRef.current * 100 - CLOSE_INSET) / 100) * sizeRef.current
      return {
        id: "\u0000close",
        x: Math.cos(angle) * reach,
        y: Math.sin(angle) * reach,
        vx: 0,
        vy: 0,
        pin: true,
        w: CLOSE_CLEARANCE,
        h: CLOSE_CLEARANCE,
      }
    }
    /**
     * The prompt label as a pinned body, so words spread around it instead of covering it.
     * Gone while a slice is open, when the label is hidden.
     */
    const promptObstacle = (): Body | null => {
      const label = promptRef.current
      const stage = stageRef.current
      if (!label || !stage || openRef.current) return null
      const box = label.getBoundingClientRect()
      const area = stage.getBoundingClientRect()
      if (!box.width || !area.width) return null
      return {
        id: "\u0000prompt",
        x: box.left + box.width / 2 - (area.left + area.width / 2),
        y: box.top + box.height / 2 - (area.top + area.height / 2),
        vx: 0,
        vy: 0,
        pin: true,
        w: box.width + PROMPT_CLEARANCE * 2,
        h: box.height + PROMPT_CLEARANCE * 2,
      }
    }
    /** Fixed things words steer around and don't spawn on */
    const obstacles = () =>
      [closeObstacle(), promptObstacle()].filter(
        (body): body is Body => body !== null
      )
    /** When the ring last started being crowded (words overlapping), or null when it's clear */
    let crowdedSince: number | null = null
    /** The crowd check stays off until this time, set when a word is dropped */
    let crowdPausedUntil = 0

    /**
     * Auto mode: words that overlap each other or the rim for longer than
     * CROWD_GRACE_MS can't settle, so the newest of them goes back to the front of the queue.
     * It comes back once the fit check finds room. Repeats until the ring is clear; one
     * word always stays.
     */
    const thinCrowd = (now: number, radius: number) => {
      // Paused while a word is held, and for a moment after it's dropped so the ring can settle:
      // moving words around shouldn't make others disappear
      if (dragRef.current || now < crowdPausedUntil) {
        crowdedSince = null
        return
      }
      const bodies = [...bodiesRef.current.values()].filter(
        (body) => !body.pin && !flightsRef.current.has(body.id)
      )
      const offenders = new Set<string>()
      for (let i = 0; i < bodies.length; i++) {
        const a = bodies[i]
        if (farCorner(a.x, a.y, a.w, a.h) > radius + CROWD_SLACK) {
          offenders.add(a.id)
        }
        for (let j = i + 1; j < bodies.length; j++) {
          const b = bodies[j]
          const gapX = Math.abs(a.x - b.x) - (a.w + b.w) / 2
          const gapY = Math.abs(a.y - b.y) - (a.h + b.h) / 2
          if (gapX < -CROWD_SLACK && gapY < -CROWD_SLACK) {
            offenders.add(a.id)
            offenders.add(b.id)
          }
        }
      }
      if (offenders.size === 0 || bodiesRef.current.size <= 1) {
        crowdedSince = null
        return
      }
      crowdedSince ??= now
      if (now - crowdedSince < CROWD_GRACE_MS) return
      // Newest offender: bodies keep the order they were added in
      const newest = [...bodiesRef.current.keys()]
        .reverse()
        .find((id) => offenders.has(id))
      if (!newest) return
      // Out of the physics at once, so the rest can spread; the word fades out where it is
      bodiesRef.current.delete(newest)
      ;(openRef.current ? openQueueRef.current : queueRef.current).unshift(
        newest
      )
      setSelectedId((current) => (current === newest ? null : current))
      setLeaving((ids) => new Set(ids).add(newest))
      window.setTimeout(() => {
        setLeaving((ids) => {
          const next = new Set(ids)
          next.delete(newest)
          return next
        })
        // Still gone (not already back from the queue): take it off screen
        if (!bodiesRef.current.has(newest))
          setPresent((ids) => ids.filter((id) => id !== newest))
      }, CROWD_FADE_MS)
      crowdedSince = null
      // The queue waits for the fade, and a moment for the rest to settle, before refilling
      nextSpawn = now + CROWD_FADE_MS + CROWD_GRACE_MS
    }

    /** Well area words can sit in, between the dead zone and the rim */
    const usableArea = () => {
      const radius = sizeRef.current * wellRef.current
      const deadRadius = sizeRef.current * deadZoneRef.current
      return Math.PI * (radius * radius - deadRadius * deadRadius)
    }

    /** Rough count of typical words that fit before the well gets crowded */
    const fitCount = () => {
      const scale = Math.min(1, sizeRef.current / FULL_SIZE)
      const word = (TYPICAL_W * scale + GAP) * (TYPICAL_H * scale + GAP)
      return Math.max(
        MIN_VISIBLE,
        Math.floor((usableArea() * FILL_LIMIT) / word)
      )
    }

    /**
     * Emptiest place in the well for a new word: tries spots on a few rings around the
     * center and keeps the one with the most clearance from every word already there.
     * Size is guessed from the words on screen until the new one renders and is measured.
     */
    const openSpot = (size?: { w: number; h: number }, alone = false) => {
      // `alone` asks whether the box could fit at all, ignoring the words already there
      const bodies = alone
        ? []
        : [...bodiesRef.current.values(), ...obstacles()]
      const scale = Math.min(1, sizeRef.current / FULL_SIZE)
      const w =
        size?.w ??
        (bodies.length
          ? bodies.reduce((sum, body) => sum + body.w, 0) / bodies.length
          : TYPICAL_W * scale)
      const h =
        size?.h ??
        (bodies.length
          ? bodies.reduce((sum, body) => sum + body.h, 0) / bodies.length
          : TYPICAL_H * scale)
      const radius = sizeRef.current * wellRef.current
      const deadRadius = sizeRef.current * deadZoneRef.current
      let best = { x: 0, y: -radius / 2, clearance: -Infinity, fits: false }
      for (let step = 0; step < 24; step++) {
        const angle = (step / 24) * Math.PI * 2
        const ux = Math.cos(angle)
        const uy = Math.sin(angle)
        // Only distances where the whole box clears the center and stays inside the rim
        const { min, max } = radialLimits(ux, uy, w, h, radius, deadRadius)
        const fits = min <= max
        for (const share of [0, 0.25, 0.5, 0.75, 1]) {
          const distance = fits ? min + (max - min) * share : (min + max) / 2
          const x = ux * distance
          const y = uy * distance
          // Gap to the nearest word, as boxes: positive means free space
          let clearance = Infinity
          for (const body of bodies) {
            const gapX = Math.abs(x - body.x) - (w + body.w) / 2
            const gapY = Math.abs(y - body.y) - (h + body.h) / 2
            clearance = Math.min(clearance, Math.max(gapX, gapY))
          }
          // A spot that fits the well always beats one that doesn't
          if (
            fits > best.fits ||
            (fits === best.fits && clearance > best.clearance)
          ) {
            best = { x, y, clearance, fits }
          }
        }
      }
      return {
        x: best.x,
        y: best.y,
        w,
        h,
        clearance: best.clearance,
        fits: best.fits,
      }
    }

    /**
     * Rendered size of an item before it's shown, from a hidden copy styled like a word.
     * Auto mode also fits the item to the ring: if it can't fit even in an empty well, it
     * tries a wider box, then smaller text, and as a last resort caps the height and scrolls.
     */
    const measureItem = (id: string) => {
      const cached = measuredItems.get(id)
      if (cached) return cached
      const measured = measureUncachedItem(id)
      if (measured) measuredItems.set(id, measured)
      return measured
    }
    const measureUncachedItem = (id: string) => {
      const probe = measureRef.current
      const item = itemsRef.current.find((entry) => entry.id === id)
      if (!probe || !item) return null
      const thumb = item.imageUrl
        ? Math.min(36, Math.max(18, sizeRef.current * 0.053)) + 4
        : 0
      probe.textContent = item.label
      const read = (fit: ItemFit) => {
        probe.style.fontSize = fit.fontSize ? `${fit.fontSize}px` : ""
        probe.style.maxWidth = fit.maxWidth ? `${fit.maxWidth}px` : ""
        probe.style.maxHeight = fit.maxHeight ? `${fit.maxHeight}px` : ""
        return { w: probe.offsetWidth, h: probe.offsetHeight + thumb }
      }
      const natural = read({})
      if (openSpot(natural, true).fits)
        return { ...natural, fit: {} as ItemFit }

      // Room between the center and the rim bounds how wide and tall a word may be
      const radius = sizeRef.current * wellRef.current
      const deadRadius = sizeRef.current * deadZoneRef.current
      const band = radius - centerClearance(deadRadius)
      const base = parseFloat(getComputedStyle(probe).fontSize) || 13
      for (const fontScale of FIT_FONT_STEPS) {
        const fontSize = Math.max(
          MIN_FONT,
          Math.round(base * fontScale * 10) / 10
        )
        for (const widthShare of FIT_WIDTH_STEPS) {
          const fit = { fontSize, maxWidth: Math.round(radius * widthShare) }
          const size = read(fit)
          if (openSpot(size, true).fits) return { ...size, fit }
        }
      }
      // Still too tall: smallest text, widest box, and the tallest height that truly fits above
      // the center (corners inside the rim). The rest scrolls, faded at the bottom.
      const width = radius * FIT_WIDTH_STEPS[FIT_WIDTH_STEPS.length - 1]
      const top = Math.sqrt(Math.max(0, (radius - 6) ** 2 - (width / 2) ** 2))
      const fit = {
        fontSize: Math.max(
          MIN_FONT,
          base * FIT_FONT_STEPS[FIT_FONT_STEPS.length - 1]
        ),
        maxWidth: Math.floor(width),
        maxHeight: Math.floor(
          Math.max(
            36,
            Math.min(band, top - centerClearance(deadRadius) - 2) - thumb
          )
        ),
      }
      return { ...read(fit), fit }
    }

    const spawn = (now: number) => {
      const queue = openRef.current ? openQueueRef.current : queueRef.current
      const limit = openRef.current ? openLimit : visibleCap
      const room = limit - bodiesRef.current.size
      // Nothing new appears while a word is held
      if (room <= 0 || queue.length === 0 || now < nextSpawn || dragRef.current)
        return
      // A full well does not need an expensive fit search on every display frame.
      nextSpawn = now + 150

      // Auto: add the next item only if its real size fits in open space; always show at least one
      if (auto) {
        const measured = measureItem(queue[0])
        if (!measured) return
        const { fit, ...size } = measured
        const spot = openSpot(size)
        const empty = bodiesRef.current.size === 0
        if (!empty && (!spot.fits || spot.clearance < AUTO_GAP)) return
        const id = queue.shift()!
        fitsRef.current.set(id, fit)
        setFits(new Map(fitsRef.current))
        bodiesRef.current.set(id, {
          id,
          x: spot.x,
          y: spot.y,
          vx: 0,
          vy: 0,
          pin: false,
          ...size,
        })
        nextSpawn = now + (reduceMotionRef.current ? 0 : SPAWN_GAP_MS)
        setPresent((ids) => (ids.includes(id) ? ids : [...ids, id]))
        return
      }

      let covered = 0
      for (const body of bodiesRef.current.values()) {
        covered += (body.w + GAP) * (body.h + GAP)
      }
      const average =
        bodiesRef.current.size > 0 ? covered / bodiesRef.current.size : 0
      const crowded = covered + average > usableArea() * FILL_LIMIT
      if (crowded && bodiesRef.current.size >= MIN_VISIBLE) return
      const id = queue.shift()
      if (!id) return
      // New words take the emptiest spot in the well and pop in there, so nothing gets shoved.
      const spot = openSpot()
      const body: Body = {
        id,
        x: spot.x,
        y: spot.y,
        vx: 0,
        vy: 0,
        pin: false,
        w: spot.w,
        h: spot.h,
      }
      bodiesRef.current.set(id, body)
      nextSpawn = now + (reduceMotionRef.current ? 0 : SPAWN_GAP_MS)
      setPresent((ids) => (ids.includes(id) ? ids : [...ids, id]))
    }

    const scoreLabel = (scoreId: string) =>
      [...scoresRef.current, ...actionsRef.current].find(
        (entry) => entry.id === scoreId
      )?.label ?? "a score"

    /** Where a score or action slice sits, so an item can fly to it */
    const targetCenter = (targetId: string) => {
      const size = sizeRef.current
      const scoreAt = scoresRef.current.findIndex(
        (entry) => entry.id === targetId
      )
      if (scoreAt !== -1) {
        const count = scoresRef.current.length
        return segmentCenter(
          scoreAt,
          count,
          (size * (wellRef.current + RIM)) / 2,
          scoreOffset(count)
        )
      }
      const actionAt = actionsRef.current.findIndex(
        (entry) => entry.id === targetId
      )
      if (actionAt !== -1) {
        return segmentCenter(
          actionAt,
          actionsRef.current.length,
          (size * (RIM + OUTER)) / 2
        )
      }
      return null
    }

    /** Records a placement. An item that already has one moves to the new score. */
    const commit = (itemId: string, scoreId: string) => {
      const existing = placementsRef.current.some(
        (placement) => placement.itemId === itemId
      )
      const next = existing
        ? placementsRef.current.map((placement) =>
            placement.itemId === itemId ? { itemId, scoreId } : placement
          )
        : [...placementsRef.current, { itemId, scoreId }]
      placementsRef.current = next
      setPlacements(next)
      const item = itemsRef.current.find((entry) => entry.id === itemId)
      setNote(
        `${item?.label ?? "Item"} ${existing ? "moved to" : "placed on"} ${scoreLabel(scoreId)}.`
      )
      onPlaceRef.current?.({ itemId, scoreId })
      if (
        !existing &&
        !finishedRef.current &&
        next.length === itemsRef.current.length
      ) {
        finishedRef.current = true
        onCompleteRef.current?.(next)
      }
    }

    /** Lands any item still in flight, so the visible set can swap. */
    const landFlights = () => {
      for (const [id, flight] of flightsRef.current) {
        bodiesRef.current.delete(id)
        commit(id, flight.scoreId)
      }
      flightsRef.current.clear()
    }

    const resetHot = () => {
      hotRef.current = null
      setHotScoreId(null)
    }

    const close = () => {
      if (!openRef.current) return
      landFlights()
      bodiesRef.current = poolRef.current ?? new Map()
      poolRef.current = null
      popDelayRef.current.clear()
      ;[...bodiesRef.current.keys()].forEach((id, index) => {
        popDelayRef.current.set(id, index * OPEN_STAGGER_MS)
      })
      openRef.current = null
      openQueueRef.current = []
      setOpenScoreId(null)
      setPresent([...bodiesRef.current.keys()])
      setSelectedId(null)
      resetHot()
    }
    closeRef.current = close

    const open = (scoreId: string) => {
      if (openRef.current === scoreId) {
        close()
        return
      }
      close()
      landFlights()
      setPresent([...bodiesRef.current.keys()])
      const ids = placementsRef.current
        .filter((placement) => placement.scoreId === scoreId)
        .map((placement) => placement.itemId)
      if (ids.length === 0) {
        setNote(`Nothing on ${scoreLabel(scoreId)} yet.`)
        return
      }
      // Auto lets the fit check add the rest one by one; otherwise spill a batch out at once
      const shown = ids.slice(0, auto ? 1 : Math.min(openLimit, fitCount()))
      openQueueRef.current = ids.slice(shown.length)
      const opened = new Map<string, Body>()
      // Words spill out of the slice and drift inward, one after another.
      const source = targetCenter(scoreId) ?? { x: 0, y: 0 }
      const sourceDistance = Math.hypot(source.x, source.y) || 1
      const inX = -source.x / sourceDistance
      const inY = -source.y / sourceDistance
      const edge = sizeRef.current * wellRef.current * 0.7
      popDelayRef.current.clear()
      shown.forEach((id, index) => {
        const side = (index % 2 === 0 ? 1 : -1) * Math.ceil(index / 2) * 0.35
        popDelayRef.current.set(id, index * OPEN_STAGGER_MS)
        opened.set(id, {
          id,
          x: -inX * edge + -inY * side * edge * 0.5,
          y: -inY * edge + inX * side * edge * 0.5,
          vx: inX * 6,
          vy: inY * 6,
          pin: false,
          w: 96,
          h: 36,
        })
      })
      poolRef.current = bodiesRef.current
      bodiesRef.current = opened
      openRef.current = scoreId
      setOpenScoreId(scoreId)
      setPresent(shown)
      setSelectedId(null)
      resetHot()
      setNote(`Showing ${scoreLabel(scoreId)}. Drag a word to move it.`)
    }
    toggleOpenRef.current = open

    const place = (itemId: string, scoreId: string) => {
      if (!bodiesRef.current.has(itemId)) return
      bodiesRef.current.delete(itemId)
      flightsRef.current.delete(itemId)
      setPresent((ids) => ids.filter((id) => id !== itemId))
      setSelectedId((current) => (current === itemId ? null : current))
      autoSelectPendingRef.current = true
      commit(itemId, scoreId)
      const tune = soundRef.current
      const scoreList = scoresRef.current
      const at = scoreList.findIndex((score) => score.id === scoreId)
      if (tune && (at === -1 ? tune.flag : tune.place)) {
        // Scores get quieter and a touch lower toward neutral; flags always play as-is.
        const middle = (scoreList.length - 1) / 2
        const reach =
          at === -1 || middle === 0 ? 1 : Math.abs(at - middle) / middle
        playChime(
          at === -1,
          volumeRef.current *
            (tune.neutralVolume + (1 - tune.neutralVolume) * reach),
          tune.neutralPitch + (1 - tune.neutralPitch) * reach
        )
      }
      if (
        openRef.current &&
        bodiesRef.current.size === 0 &&
        openQueueRef.current.length === 0
      ) {
        close()
      }
    }

    /** Takes a word out of the open score and sends it back to the floating pool. */
    const unplace = (itemId: string) => {
      const pool = poolRef.current
      if (!openRef.current || !pool || !bodiesRef.current.delete(itemId)) return
      setPresent((ids) => ids.filter((id) => id !== itemId))
      setSelectedId((current) => (current === itemId ? null : current))
      resetHot()
      const next = placementsRef.current.filter(
        (placement) => placement.itemId !== itemId
      )
      placementsRef.current = next
      setPlacements(next)
      finishedRef.current = false
      const tune = soundRef.current
      if (tune?.return) playShuffle(volumeRef.current)
      onReturnRef.current?.(itemId)
      if (pool.size < visibleCap) {
        pool.set(itemId, {
          id: itemId,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          pin: false,
          w: 96,
          h: 36,
        })
      } else {
        queueRef.current.unshift(itemId)
      }
      const item = itemsRef.current.find((entry) => entry.id === itemId)
      setNote(`${item?.label ?? "Item"} is back in the pool.`)
      if (bodiesRef.current.size === 0 && openQueueRef.current.length === 0)
        close()
    }

    const fly = (itemId: string, targetId: string) => {
      const body = bodiesRef.current.get(itemId)
      const target = targetCenter(targetId)
      if (!body || !target) return
      if (targetId === openRef.current) {
        body.pin = false
        resetHot()
        return
      }
      if (reduceMotionRef.current) {
        place(itemId, targetId)
        return
      }
      body.pin = true
      flightsRef.current.set(itemId, {
        fromX: body.x,
        fromY: body.y,
        toX: target.x,
        toY: target.y,
        start: performance.now(),
        scoreId: targetId,
      })
      hotRef.current = targetId
      setHotScoreId(targetId)
    }

    /**
     * Keeps the words on screen in step with the physics. A word shown with no body behind it
     * would sit unpositioned in the stage's corner, so it's dropped; a body with no word shown
     * gets one. Words fading out or flying to a slice are left alone.
     */
    let nextReconcile = 0
    const reconcile = (now: number) => {
      if (now < nextReconcile) return
      nextReconcile = now + RECONCILE_MS
      const shown = presentRef.current
      const leavingNow = leavingRef.current
      const orphans = shown.filter(
        (id) =>
          !bodiesRef.current.has(id) &&
          !leavingNow.has(id) &&
          !flightsRef.current.has(id)
      )
      const missing = [...bodiesRef.current.keys()].filter(
        (id) => !shown.includes(id)
      )
      if (orphans.length === 0 && missing.length === 0) return
      // A dropped orphan goes back to the front of the queue, not into the void: the item
      // still needs an answer, so it must come around again
      for (const id of orphans) {
        const queued =
          queueRef.current.includes(id) || openQueueRef.current.includes(id)
        const placed = placementsRef.current.some(
          (placement) => placement.itemId === id
        )
        if (!queued && !placed) queueRef.current.unshift(id)
      }
      setPresent((ids) => [
        ...ids.filter((id) => !orphans.includes(id)),
        ...missing.filter((id) => !ids.includes(id)),
      ])
    }

    /** One frame: spawn, move, thin out crowding, land flights, and paint */
    const step = (now: number) => {
      reconcile(now)
      // Read stage geometry once, before any animation writes.
      const bounds = stage.getBoundingClientRect()
      const dt = Math.min(2, (now - last) / 16)
      last = now
      spawn(now)
      const bodies = [...bodiesRef.current.values()]
      const size = sizeRef.current
      const radius = size * wellRef.current
      for (const body of bodies) {
        // A body that picked up a non-finite coordinate can never paint a valid translate
        // again (its word sits frozen in the stage's corner), so re-seat it in the well
        if (!Number.isFinite(body.x + body.y + body.vx + body.vy)) {
          const angle = Math.random() * Math.PI * 2
          body.x = Math.cos(angle) * (radius / 2)
          body.y = Math.sin(angle) * (radius / 2)
          body.vx = 0
          body.vy = 0
        }
      }

      if (reduceMotionRef.current) {
        const spread = radius * 0.42
        bodies.forEach((body, index) => {
          if (body.pin) return
          const angle =
            -Math.PI / 2 + (index / Math.max(1, bodies.length)) * Math.PI * 2
          body.x = Math.cos(angle) * spread
          body.y = Math.sin(angle) * spread
          body.vx = 0
          body.vy = 0
        })
      } else {
        // The open slice's close button and the prompt label are fixed obstacles: words slide
        // around them. Held and flying cards float above the layout without pushing other cards.
        const floating = bodies.filter((body) => !body.pin)
        stepBodies(
          [...floating, ...obstacles()],
          radius,
          size * deadZoneRef.current,
          dt,
          settleRef.current
        )
      }
      if (auto) thinCrowd(now, radius)

      for (const [id, flight] of flightsRef.current) {
        const body = bodiesRef.current.get(id)
        if (!body) continue
        const elapsed = now - flight.start
        const progress = Math.min(1, elapsed / FLIGHT_MS)
        const eased = easeOut(progress)
        body.x = flight.fromX + (flight.toX - flight.fromX) * eased
        body.y = flight.fromY + (flight.toY - flight.fromY) * eased
        // Shrink and fade with the distance covered, so the word is gone by the time it slows
        // onto the slice instead of hovering there.
        const node = nodesRef.current.get(id)
        if (node) {
          // The pop-in animation and the hover transition would override or lag these frames.
          node.style.animation = "none"
          node.style.transition = "none"
          node.style.opacity = String(1 - eased)
          node.style.scale = String(1 - 0.6 * eased)
        }
        if (progress < 1) continue
        place(id, flight.scoreId)
        if (hotRef.current === flight.scoreId && !dragRef.current) {
          hotRef.current = null
          setHotScoreId(null)
        }
      }

      for (const body of bodies) {
        const node = nodesRef.current.get(body.id)
        if (node && dragRef.current?.id !== body.id)
          paintNode(node, body, bounds)
      }
    }

    /**
     * The animation loop. The next frame is booked before this one runs, and a frame that
     * throws is logged and skipped, so one bad frame can't freeze the ring with words left
     * unpositioned.
     */
    let inView = true
    const tick = (now: number) => {
      if (document.hidden || !inView) {
        frame = 0
        return
      }
      frame = requestAnimationFrame(tick)
      try {
        step(now)
      } catch (error) {
        console.error("Orbit ring: a frame failed and was skipped", error)
      }
    }
    const resume = () => {
      if (document.hidden || !inView || frame) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      resume()
    })
    intersection.observe(stage)
    document.addEventListener("visibilitychange", resume)

    let releaseTimer = 0
    let isOverCenter = false
    /** Tracks the dead zone under a drag and shows the center tooltip after `tooltipDelay` there */
    const markCenter = (over: boolean) => {
      setOverCenter(over)
      if (over === isOverCenter) return
      isOverCenter = over
      window.clearTimeout(releaseTimer)
      if (over)
        releaseTimer = window.setTimeout(
          () => setReleaseTip(true),
          tooltipDelayRef.current
        )
      else setReleaseTip(false)
    }

    const setHot = (scoreId: string | null) => {
      if (hotRef.current === scoreId) return
      hotRef.current = scoreId
      setHotScoreId(scoreId)
    }

    /**
     * Target id for a drag. An action needs the pointer right on the outer ring; a score
     * under the pointer wins next; otherwise the pull direction picks the score.
     */
    const intent = (drag: Drag) => {
      if (!drag.moved) return null
      const scoreList = scoresRef.current
      const actionList = actionsRef.current
      const size = sizeRef.current
      if (Math.hypot(drag.x, drag.y) <= size * deadZoneRef.current) {
        return openRef.current ? POOL_TARGET : null
      }
      const action = bandIndex(
        drag.x,
        drag.y,
        size,
        actionList.length,
        RIM,
        OUTER_REACH
      )
      if (action !== null && actionList[action]) return actionList[action].id
      const score =
        bandIndex(
          drag.x,
          drag.y,
          size,
          scoreList.length,
          wellRef.current - 0.02,
          RIM,
          scoreOffset(scoreList.length)
        ) ??
        aimIndex(
          drag.x + drag.offsetX,
          drag.y + drag.offsetY,
          drag.ax,
          drag.ay,
          size,
          scoreList.length,
          wellRef.current
        )
      return score === null ? null : (scoreList[score]?.id ?? null)
    }

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const body = bodiesRef.current.get(drag.id)
      if (!body) return
      const samples = event.getCoalescedEvents?.() ?? []
      for (const sample of samples.length > 0 ? samples : [event]) {
        drag.x = sample.clientX - drag.rect.left - drag.rect.width / 2
        drag.y = sample.clientY - drag.rect.top - drag.rect.height / 2
        drag.time = sample.timeStamp
        drag.samples.push({ x: drag.x, y: drag.y, t: drag.time })
      }
      while (
        drag.samples.length > 2 &&
        drag.time - drag.samples[1].t >= AIM_WINDOW_MS
      ) {
        drag.samples.shift()
      }
      const oldest = drag.samples[0]
      const strokeX = drag.x - oldest.x
      const strokeY = drag.y - oldest.y
      if (Math.hypot(strokeX, strokeY) >= AIM_MIN_STROKE) {
        drag.ax = strokeX
        drag.ay = strokeY
      } else if (drag.ax === 0 && drag.ay === 0) {
        drag.ax = drag.x - drag.startX
        drag.ay = drag.y - drag.startY
      }
      if (
        !drag.moved &&
        Math.hypot(drag.x - drag.startX, drag.y - drag.startY) >= DROP_DISTANCE
      ) {
        drag.moved = true
        window.clearTimeout(selectHoldTimerRef.current)
      }
      // Real movement (not hand tremble) disarms a hold cancel and restarts the countdown
      if (
        Math.hypot(drag.x - drag.holdX, drag.y - drag.holdY) >= HOLD_STILL_PX
      ) {
        drag.holdX = drag.x
        drag.holdY = drag.y
        if (drag.held) {
          drag.held = false
          setHoldCancel(false)
        }
        window.clearTimeout(holdTimerRef.current)
        holdTimerRef.current = window.setTimeout(releaseHold, HOLD_TIMEOUT_MS)
      }
      body.x = drag.x + drag.offsetX
      body.y = drag.y + drag.offsetY
      const node = nodesRef.current.get(drag.id)
      if (node) paintNode(node, body)
      setHot(drag.held ? null : intent(drag))
      markCenter(
        drag.moved &&
          Math.hypot(drag.x, drag.y) <= sizeRef.current * deadZoneRef.current
      )
    }

    /**
     * A word held still for HOLD_TIMEOUT_MS keeps the grab — holding never drops the word.
     * It arms "Cancel Selection": letting go places nothing and the word floats back.
     * Moving again disarms it.
     */
    const releaseHold = () => {
      const drag = dragRef.current
      if (!drag) return
      // A word pressed in place and never dragged is being selected, not cancelled
      if (!drag.moved) return
      drag.held = true
      setHoldCancel(true)
      setHot(null)
      setSelectedId((current) => (current === drag.id ? null : current))
    }
    releaseHoldRef.current = releaseHold

    const onPointerUp = () => {
      window.clearTimeout(holdTimerRef.current)
      window.clearTimeout(selectHoldTimerRef.current)
      const drag = dragRef.current
      if (!drag) return
      dragRef.current = null
      // Overlap removal waits a moment after a drop, so the ring can settle first
      crowdPausedUntil = performance.now() + CROWD_RESUME_MS
      setDragId(null)
      setHoldCancel(false)
      markCenter(false)
      const body = bodiesRef.current.get(drag.id)
      if (!body) {
        setHot(null)
        return
      }
      if (drag.held) {
        setHot(null)
        body.pin = false
        setSelectedId((current) => (current === drag.id ? null : current))
        onInteractionRef.current?.({ type: "cancel", itemId: drag.id })
        return
      }
      const targetId = intent(drag)
      if (targetId === POOL_TARGET) {
        unplace(drag.id)
        return
      }
      if (targetId !== null) {
        fly(drag.id, targetId)
        return
      }
      setHot(null)
      body.pin = false
      // Dragged and let go on the center (or nowhere): nothing was placed
      if (drag.moved)
        onInteractionRef.current?.({ type: "cancel", itemId: drag.id })
      // A tap toggles the selection; a press held long enough already selected it and keeps it
      if (!drag.moved && !drag.holdSelected) {
        setSelectedId((current) => (current === drag.id ? null : drag.id))
      }
    }

    stage.addEventListener("pointermove", onPointerMove)
    stage.addEventListener("pointerup", onPointerUp)
    stage.addEventListener("pointercancel", onPointerUp)
    frame = requestAnimationFrame(tick)

    sendRef.current = fly

    /** With a word selected, a score click places it; otherwise it opens that score. */
    const clickScore = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const scoreId = target
        .closest("[data-score-id]")
        ?.getAttribute("data-score-id")
      if (!scoreId) return
      const itemId = selectedRef.current
      if (itemId) fly(itemId, scoreId)
      else open(scoreId)
    }
    stage.addEventListener("click", clickScore)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(releaseTimer)
      observer.disconnect()
      nodeObserver.disconnect()
      nodeObserverRef.current = null
      intersection.disconnect()
      document.removeEventListener("visibilitychange", resume)
      document.fonts.removeEventListener("loadingdone", onFontsLoaded)
      stage.removeEventListener("pointermove", onPointerMove)
      stage.removeEventListener("pointerup", onPointerUp)
      stage.removeEventListener("pointercancel", onPointerUp)
      stage.removeEventListener("click", clickScore)
      window.clearTimeout(holdTimerRef.current)
      window.clearTimeout(selectHoldTimerRef.current)
    }
    // Keyed on ids, not array identity: a parent that rebuilds the same items or scales on every
    // render must not reset the round.
  }, [itemsKey, auto, visibleCap, openLimit, scoresKey, actionsKey])

  const byId = new Map(items.map((item) => [item.id, item]))
  const finished = items.length > 0 && placements.length === items.length
  const remaining = items.length - placements.length
  const openScore = [...scores, ...actions].find(
    (score) => score.id === openScoreId
  )
  const openIsScore = scores.some((score) => score.id === openScoreId)
  const openRing = openIsScore ? ring : actions
  const openSweep = (Math.PI * 2) / Math.max(1, openRing.length)
  const openAngle =
    -Math.PI / 2 +
    (openIsScore ? scoreOffset(scores.length) : 0) +
    openRing.findIndex((score) => score.id === openScoreId) * openSweep
  const closeReach = well * 100 - CLOSE_INSET

  /**
   * `along` turns labels to follow the ring, for bands too thin for upright text.
   * `scale` rings turn so the middle slice sits at the bottom and is marked neutral.
   */
  function renderSlices(
    list: OrbitScore[],
    inner: number,
    outer: number,
    labelClass: string,
    along = false,
    scale = false
  ) {
    const sweep = (Math.PI * 2) / Math.max(1, list.length)
    const firstAngle =
      -Math.PI / 2 - sweep / 2 + (scale ? scoreOffset(list.length) : 0)
    const neutral = scale ? neutralIndex(list.length) : -1
    const labelRadius = ((inner + outer) / 2) * 100
    const slices = list.map((score, index) => {
      const start = firstAngle + index * sweep
      const mid = start + sweep / 2
      const x = fix(50 + labelRadius * Math.cos(mid))
      const y = fix(50 + labelRadius * Math.sin(mid))
      const arcId = `${labelId}-arc-${score.id}`
      const count = countsShown
        ? placements.filter((placement) => placement.scoreId === score.id)
            .length
        : 0
      // Score labels read in Title Case ("Strongly Agree"); flags are uppercased in CSS
      const label = along ? score.label : titleCase(score.label)
      // Long upright labels wrap at the first space so they stay inside their slice.
      const space = label.indexOf(" ")
      const lines =
        label.length > WRAP_AT && space !== -1
          ? [label.slice(0, space), label.slice(space + 1)]
          : [label]
      const labelTop =
        y - ((lines.length - 1) * LINE_GAP) / 2 - (count > 0 ? 0.9 : 0)
      const colored = Boolean(score.color)
      const ink = colored ? ` ${styles.inkLabel}` : ""
      // Flags fall back to a pale tint in CSS; scores fall back to their own color.
      const hover = score.hoverColor ?? (along ? undefined : score.color)
      const sliceColors = colored
        ? ({
            "--slice": score.color,
            ...(hover ? { "--slice-hover": hover } : {}),
          } as CSSProperties)
        : undefined
      // Count circles take the slice's stronger color, so they read on a grey resting slice
      const badgeFill = score.hoverColor ?? score.color
      const shortcut =
        keyboardShortcuts && !along
          ? scores.findIndex((entry) => entry.id === score.id) + 1
          : 0
      const placedHere = placements.filter(
        (placement) => placement.scoreId === score.id
      ).length
      // Native tooltip: name (and key), what dropping here does, and what's already here
      const tip = [
        shortcut > 0 && shortcut <= 9 ? `${label} (key ${shortcut})` : label,
        score.hint ?? `Drop a statement here to answer "${label}".`,
        placedHere > 0 ? `${placedHere} placed here. Click to see them.` : "",
      ]
        .filter(Boolean)
        .join("\n")
      return (
        <g key={score.id}>
          <path
            className={`${
              hotScoreId === score.id
                ? styles.segmentHot
                : openScoreId === score.id
                  ? styles.segmentOpen
                  : styles.segment
            }${colored && !along ? ` ${styles.coloredSlice}` : ""}`}
            style={sliceColors}
            d={wedge(inner * 100, outer * 100, start, start + sweep)}
            filter={colored && grain > 0 ? `url(#${grainId})` : undefined}
            data-score-id={score.id}
            // Outer-ring actions (skip, confusing, typo), for guides that point at them
            data-orbit-action={!scale || undefined}
            data-neutral={index === neutral || undefined}
            tabIndex={0}
            role="button"
            aria-label={score.label}
            aria-keyshortcuts={
              shortcut > 0 && shortcut <= 9 ? String(shortcut) : undefined
            }
            aria-expanded={openScoreId === score.id}
            onMouseDown={(event) => event.preventDefault()}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return
              event.preventDefault()
              const itemId = selectedRef.current
              if (itemId) sendRef.current(itemId, score.id)
              else toggleOpenRef.current(score.id)
            }}
          >
            <title>{tip}</title>
          </path>
          {along ? (
            <>
              <path
                id={arcId}
                d={labelArc(labelRadius, start, start + sweep)}
                fill="none"
              />
              <text className={labelClass}>
                <textPath href={`#${arcId}`} startOffset="50%">
                  {count > 0 ? `${score.label} ${count}` : score.label}
                </textPath>
              </text>
            </>
          ) : labelsCurved ? (
            // "Word wrap": the score label bends along its slice on one line, like the action labels
            <>
              <path
                id={arcId}
                d={labelArc(labelRadius, start, start + sweep)}
                fill="none"
              />
              {/* Filled circle in the slice's color behind the count; placed on the digits after layout */}
              {count > 0 ? (
                <circle
                  className={styles.countBadge}
                  data-orbit-count-badge={String(count).length}
                  visibility="hidden"
                  style={badgeFill ? { fill: badgeFill } : undefined}
                />
              ) : null}
              <text className={`${labelClass}${ink}`}>
                <textPath href={`#${arcId}`} startOffset="50%">
                  {label}
                  {/* Inline after the label ("Strongly disagree 1"); short enough to keep on small screens */}
                  {count > 0 ? (
                    <tspan
                      className={styles.scoreCountInline}
                      dx="2.5"
                      style={
                        badgeFill ? { fill: readableOn(badgeFill) } : undefined
                      }
                    >
                      {count}
                    </tspan>
                  ) : null}
                </textPath>
              </text>
            </>
          ) : (
            <g data-orbit-score-label="">
              <text className={`${labelClass}${ink}`} x={x} y={labelTop}>
                {lines.map((line, lineIndex) => (
                  <tspan
                    key={lineIndex}
                    x={x}
                    dy={lineIndex === 0 ? 0 : LINE_GAP}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
              {count > 0 ? (
                <text
                  className={`${styles.scoreCount}${ink}`}
                  x={x}
                  y={labelTop + (lines.length - 1) * LINE_GAP + 2.7}
                >
                  {count}
                </text>
              ) : null}
            </g>
          )}
        </g>
      )
    })
    // Paint the open slice last so its border sits on top of its neighbours'
    const open = list.findIndex((score) => score.id === openScoreId)
    return open === -1
      ? slices
      : [...slices.slice(0, open), ...slices.slice(open + 1), slices[open]]
  }

  function bindNode(id: string, node: HTMLButtonElement | null) {
    if (!node) {
      const previous = nodesRef.current.get(id)
      if (previous) nodeObserverRef.current?.unobserve(previous)
      nodesRef.current.delete(id)
      return
    }
    nodesRef.current.set(id, node)
    nodeObserverRef.current?.observe(node)
    const body = bodiesRef.current.get(id)
    if (!body) return
    body.w = node.offsetWidth
    body.h = node.offsetHeight
    const delay = popDelayRef.current.get(id)
    if (delay) node.style.animationDelay = `${delay}ms`
    paintNode(node, body)
  }

  function onPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    id: string
  ) {
    const body = bodiesRef.current.get(id)
    const stage = stageRef.current
    if (!body || !stage || flightsRef.current.has(id) || event.button !== 0)
      return
    event.currentTarget.setPointerCapture(event.pointerId)
    const rect = stage.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    body.pin = true
    body.vx = 0
    body.vy = 0
    dragRef.current = {
      id,
      x,
      y,
      startX: x,
      startY: y,
      offsetX: body.x - x,
      offsetY: body.y - y,
      time: event.timeStamp,
      ax: 0,
      ay: 0,
      samples: [{ x, y, t: event.timeStamp }],
      moved: false,
      rect,
      pointerId: event.pointerId,
      holdX: x,
      holdY: y,
      held: false,
      holdSelected: false,
    }
    setDragId(id)
    setHoldCancel(false)
    armHold()
    // Holding a word in place selects it, without waiting for the pointer to lift
    window.clearTimeout(selectHoldTimerRef.current)
    selectHoldTimerRef.current = window.setTimeout(() => {
      const drag = dragRef.current
      if (!drag || drag.id !== id || drag.moved) return
      drag.holdSelected = true
      selectedRef.current = id
      setSelectedId(id)
    }, SELECT_HOLD_MS)
  }

  /** (Re)starts the countdown that lets go of a word held without moving */
  function armHold() {
    window.clearTimeout(holdTimerRef.current)
    holdTimerRef.current = window.setTimeout(
      () => releaseHoldRef.current(),
      HOLD_TIMEOUT_MS
    )
  }

  // Drawn past the rim and clipped to the disc, so each stroke ends on the circle
  const centerXReach = (deadZoneSize * 100 * 1.5) / Math.SQRT2
  const swirl = swirlPath(50, 50, deadZoneSize * 100)

  return (
    <div
      className={[
        styles.wrap,
        greyUntilHover ? styles.greyRest : "",
        className ?? "",
      ].join(" ")}
      style={wrapStyle as CSSProperties}
    >
      <style href={ORBIT_CSS_HREF} precedence="default">
        {ORBIT_CSS}
      </style>
      {keyboardShortcuts ? (
        <p
          ref={keyboardHelpRef}
          tabIndex={-1}
          id={`${labelId}-keyboard-help`}
          className={styles.live}
        >
          Tab cycles cards; Shift+Tab cycles backward. Press 1–
          {Math.min(scores.length, 9)} to answer. 1 = {scores[0]?.label};{" "}
          {Math.min(scores.length, 9)} ={" "}
          {scores[Math.min(scores.length, 9) - 1]?.label}. Escape releases
          selection to reach other controls.
        </p>
      ) : null}
      <div
        ref={stageRef}
        tabIndex={keyboardShortcuts ? -1 : undefined}
        className={styles.stage}
        onKeyDown={(event) => {
          // Holding Tab keeps cycling cards; other keys answer once per press
          if (
            !keyboardShortcuts ||
            settingsOpen ||
            event.defaultPrevented ||
            (event.repeat && event.key !== "Tab") ||
            event.nativeEvent.isComposing ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            dragRef.current
          )
            return
          const target = event.target
          if (
            target instanceof Element &&
            target.closest(
              'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
            )
          )
            return
          const itemId = selectedRef.current
          if (
            event.key === "Tab" &&
            (itemId || target === event.currentTarget)
          ) {
            const available = present.filter(
              (id) =>
                bodiesRef.current.has(id) &&
                !flightsRef.current.has(id) &&
                !leaving.has(id)
            )
            if (!available.length) return
            const current = itemId ? available.indexOf(itemId) : -1
            const next =
              current < 0
                ? event.shiftKey
                  ? available.length - 1
                  : 0
                : (current + (event.shiftKey ? -1 : 1) + available.length) %
                  available.length
            event.preventDefault()
            selectedRef.current = available[next]
            setSelectedId(available[next])
            nodesRef.current
              .get(available[next])
              ?.focus({ preventScroll: true })
            return
          }
          if (event.shiftKey) return
          if (!itemId || flightsRef.current.has(itemId)) return
          if (event.key === "Escape") {
            event.preventDefault()
            selectedRef.current = null
            setSelectedId(null)
            keyboardHelpRef.current?.focus({ preventScroll: true })
            return
          }
          if (!/^[1-9]$/.test(event.key)) return
          const score = scores[Number(event.key) - 1]
          if (!score || !bodiesRef.current.has(itemId)) return
          event.preventDefault()
          selectedRef.current = null
          setSelectedId(null)
          sendRef.current(itemId, score.id)
          stageRef.current?.focus({ preventScroll: true })
        }}
      >
        {wellLayer ? (
          <div
            aria-hidden
            className={styles.wellLayer}
            style={{ "--orbit-well-size": `${well * 200}%` } as CSSProperties}
          >
            {wellLayer}
          </div>
        ) : null}
        {/* Leave the center clear for drag feedback, settings, and the completion mark. */}
        {showCounter ? (
          <p
            className={styles.counter}
            data-hidden={
              Boolean(overCenter || settingsOpen || openScoreId || finished) ||
              undefined
            }
            aria-label={labels.remaining(remaining)}
          >
            <RollingNumber value={remaining} />
          </p>
        ) : null}
        {prompt ? (
          <div
            ref={promptRef}
            className={styles.prompt}
            data-hidden={Boolean(openScoreId) || undefined}
          >
            {prompt}
          </div>
        ) : null}
        {/* aria-label, not <title>: a <title> here would be the tooltip for every slice */}
        <svg
          className={styles.ring}
          viewBox="0 0 100 100"
          role="group"
          aria-label="Answer ring"
        >
          <defs>
            {/* Mono grain clipped to the slice and overlaid on its fill */}
            <filter id={grainId} colorInterpolationFilters="sRGB">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="4"
                numOctaves="2"
                stitchTiles="stitch"
              />
              <feColorMatrix
                type="matrix"
                values={`0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 ${grain}`}
              />
              <feComposite in2="SourceGraphic" operator="in" />
              <feBlend in2="SourceGraphic" mode="overlay" />
            </filter>
            {/* Diagonal crosshatching for the well while a slice is open */}
            <pattern
              id={hatchId}
              width="1.8"
              height="1.8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="1.8" height="1.8" />
              <line x1="0" y1="0" x2="0" y2="1.8" />
              <line x1="0" y1="0" x2="1.8" y2="0" />
            </pattern>
            <clipPath id={centerClipId}>
              <circle cx="50" cy="50" r={deadZoneSize * 100} />
            </clipPath>
          </defs>
          <circle className={styles.well} cx="50" cy="50" r={well * 100} />
          {/* Hatching marks the well as "inside a slice" while one is open */}
          <circle
            className={styles.wellHatch}
            cx="50"
            cy="50"
            r={well * 100}
            fill={`url(#${hatchId})`}
            data-shown={Boolean(openScoreId) || undefined}
          />
          <circle
            className={[
              hotScoreId === POOL_TARGET
                ? styles.deadZoneHot
                : openScoreId
                  ? styles.deadZoneOpen
                  : styles.deadZone,
              overCenter && hotScoreId !== POOL_TARGET
                ? styles.deadZoneShown
                : "",
            ].join(" ")}
            cx="50"
            cy="50"
            r={deadZoneSize * 100}
            data-orbit-center=""
            // Inside an open slice the disc hides behind the swirl but still takes the drop
            data-open={Boolean(openScoreId) || undefined}
            // Not clickable once the checkmark shows; the round is over
            data-done={(finished && !openScore) || undefined}
            onClick={
              soundOptions && !(finished && !openScore)
                ? () => setSettingsOpen((open) => !open)
                : undefined
            }
          >
            {soundOptions && !openScore && !finished ? (
              <title>{`${labels.settings}: sound and display options`}</title>
            ) : null}
          </circle>
          {/* Inside an open slice the center is a swirl ("back to the pool"); it spins slowly on
              hover or while a word is over it */}
          {openScoreId ? (
            <path
              className={styles.swirl}
              d={swirl}
              data-hot={hotScoreId === POOL_TARGET || undefined}
              aria-hidden="true"
            />
          ) : null}
          {/* Thin X across the disc while a dragged word is over the dead zone (not inside a
              slice, where the swirl shows instead) */}
          <g
            className={styles.centerX}
            clipPath={`url(#${centerClipId})`}
            data-shown={(overCenter && !openScoreId) || undefined}
            aria-hidden="true"
          >
            <line
              x1={50 - centerXReach}
              y1={50 - centerXReach}
              x2={50 + centerXReach}
              y2={50 + centerXReach}
            />
            <line
              x1={50 + centerXReach}
              y1={50 - centerXReach}
              x2={50 - centerXReach}
              y2={50 + centerXReach}
            />
          </g>
          <g className={styles.actionRing}>
            {renderSlices(actions, RIM, OUTER, styles.actionLabel, true)}
          </g>
          {renderSlices(ring, well, RIM, styles.scoreLabel, false, true)}
        </svg>
        {settingsOpen && soundOptions && !(finished && !openScore) ? (
          <div
            ref={settingsRef}
            className={styles.settings}
            style={{ top: `${50 - deadZoneSize * 100}%` }}
            role="dialog"
            aria-label={labels.settings}
          >
            <div className={styles.settingsRow}>
              {/* Speaker toggles mute; muting hides the slider and keeps the last volume to restore */}
              <button
                type="button"
                className={styles.muteButton}
                aria-label={volume > 0 ? labels.mute : labels.unmute}
                aria-pressed={volume === 0}
                onClick={() => {
                  if (volume > 0) {
                    lastVolumeRef.current = volume
                    setVolume(0)
                  } else {
                    const restored =
                      lastVolumeRef.current || DEFAULT_SOUND.volume
                    setVolume(restored)
                    playChime(false, restored)
                  }
                }}
              >
                <SpeakerIcon muted={volume === 0} />
              </button>
              {volume > 0 ? (
                <>
                  <input
                    type="range"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={volume}
                    aria-label={labels.volume}
                    className={styles.slider}
                    style={
                      {
                        "--orbit-fill": `${((volume - 0.05) / 0.95) * 100}%`,
                      } as CSSProperties
                    }
                    onChange={(event) => setVolume(Number(event.target.value))}
                    // A sample chime when the slider is let go, at the new volume
                    onPointerUp={() => playChime(false, volumeRef.current)}
                    onKeyUp={() => playChime(false, volumeRef.current)}
                  />
                  <span className={styles.settingsValue}>
                    {Math.round(volume * 100)}
                  </span>
                </>
              ) : null}
            </div>
            {/* Label on the left, checkbox on the right edge */}
            <div className={styles.settingsToggles}>
              <label
                className={`${styles.settingsRow} ${styles.settingsToggle}`}
              >
                <span>{labels.autoSelectNext}</span>
                <input
                  type="checkbox"
                  className={styles.check}
                  checked={autoSelect}
                  onChange={(event) => {
                    // Turning it on selects a word right away, not only after the next placement
                    if (event.target.checked)
                      autoSelectPendingRef.current = true
                    setOwnAutoSelect(event.target.checked)
                    onAutoSelectNextChange?.(event.target.checked)
                  }}
                />
              </label>
              <label
                className={`${styles.settingsRow} ${styles.settingsToggle}`}
              >
                <span>{labels.showCounts}</span>
                <input
                  type="checkbox"
                  className={styles.check}
                  checked={countsShown}
                  onChange={(event) => {
                    setOwnShowCounts(event.target.checked)
                    onShowCountsChange?.(event.target.checked)
                  }}
                />
              </label>
              <label
                className={`${styles.settingsRow} ${styles.settingsToggle}`}
              >
                <span>{labels.curveLabels}</span>
                <input
                  type="checkbox"
                  className={styles.check}
                  checked={labelsCurved}
                  onChange={(event) => {
                    setOwnCurveLabels(event.target.checked)
                    onCurveLabelsChange?.(event.target.checked)
                  }}
                />
              </label>
            </div>
            {/* The picked size is filled black; the rest are white */}
            <div
              className={styles.settingsSizes}
              role="group"
              aria-label={labels.textSize}
            >
              <span className={styles.settingsRow}>{labels.textSize}</span>
              <div className={styles.sizeButtons}>
                {TEXT_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={styles.sizeButton}
                    aria-pressed={TEXT_SCALES[size] === textScale}
                    onClick={() => {
                      setOwnTextSize(size)
                      onTextSizeChange?.(size)
                    }}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {onShowTutorial ? (
              <button
                type="button"
                className={styles.settingsTutorial}
                onClick={() => {
                  setSettingsOpen(false)
                  onShowTutorial()
                }}
              >
                {labels.tutorial}
              </button>
            ) : null}
          </div>
        ) : null}
        {/* Stays mounted so it can fade out as well as in */}
        <span
          className={styles.releaseTip}
          data-shown={(releaseTip && overCenter) || holdCancel || undefined}
          style={{ top: `${50 - deadZoneSize * 100}%` }}
          aria-hidden="true"
        >
          {/* Inside an open score the drop sends the word back to the pool; otherwise it cancels the drag */}
          {openScoreId && !holdCancel ? labels.return : labels.cancel}
        </span>
        {auto ? (
          // Same classes as a word, so measuring here matches what will render
          <span
            ref={measureRef}
            className={[styles.node, wrapLabels ? styles.nodeWrap : ""].join(
              " "
            )}
            style={{
              visibility: "hidden",
              animation: "none",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />
        ) : null}
        {present.map((id) => {
          const item = byId.get(id)
          if (!item) return null
          const selected = selectedId === id
          return (
            <button
              key={id}
              ref={(node) => bindNode(id, node)}
              type="button"
              className={[
                styles.node,
                dragId === id
                  ? styles.nodeDragging
                  : selected
                    ? styles.nodeSelected
                    : "",
                wrapLabels ? styles.nodeWrap : "",
                leaving.has(id) ? styles.nodeLeaving : "",
                dragId === id && overCenter ? styles.nodeOverCenter : "",
                dragId === id && holdCancel && !overCenter
                  ? styles.nodeHoldCancel
                  : "",
              ].join(" ")}
              style={fitStyle(fits.get(id))}
              data-scroll={fits.get(id)?.maxHeight ? "" : undefined}
              data-orbit-item={id}
              // Lift the bottom fade once the last line is in view
              onScroll={(event) => {
                const node = event.currentTarget
                node.toggleAttribute(
                  "data-scroll-end",
                  node.scrollTop + node.clientHeight >= node.scrollHeight - 2
                )
              }}
              aria-pressed={selected}
              aria-label={item.label}
              aria-describedby={
                keyboardShortcuts ? `${labelId}-keyboard-help` : undefined
              }
              onFocus={(event) => {
                if (
                  !keyboardShortcuts ||
                  !event.currentTarget.matches(":focus-visible") ||
                  flightsRef.current.has(id) ||
                  leaving.has(id)
                )
                  return
                selectedRef.current = id
                setSelectedId(id)
              }}
              onPointerDown={(event) => onPointerDown(event, id)}
              onClick={(event) => {
                if (event.detail === 0)
                  setSelectedId((current) => (current === id ? null : id))
              }}
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className={styles.thumb}
                  draggable={false}
                />
              ) : null}
              <span>{item.label}</span>
            </button>
          )
        })}
        {openScore ? (
          <button
            type="button"
            className={styles.closeOpen}
            style={{
              left: `${fix(50 + Math.cos(openAngle) * closeReach)}%`,
              top: `${fix(50 + Math.sin(openAngle) * closeReach)}%`,
            }}
            aria-label={`Close ${openScore.label}`}
            onClick={() => closeRef.current()}
          >
            {/* Dragging a word back over its own open slice does nothing, so the X becomes a "no" sign */}
            {dragId && hotScoreId === openScoreId ? <BanIcon /> : <XIcon />}
          </button>
        ) : null}
        {/* "More" dots on the center while it's hovered, hinting that it opens settings; inside an
            open slice the swirl shows instead */}
        {soundOptions && !finished && !dragId && !openScore ? (
          <span
            className={styles.more}
            style={
              {
                "--orbit-dead-zone-size": `${deadZoneSize * 100}%`,
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <MoreIcon />
          </span>
        ) : null}
        {confetti && finished && !openScore ? (
          <span className={styles.confetti} aria-hidden="true">
            {CONFETTI.map((piece, index) => (
              <i
                key={index}
                style={
                  {
                    "--dx": `${piece.dx}px`,
                    "--dy": `${piece.dy}px`,
                    "--spin": `${piece.spin}deg`,
                    "--delay": `${piece.delay}ms`,
                    background: confettiColors[index % confettiColors.length],
                  } as CSSProperties
                }
              />
            ))}
          </span>
        ) : null}
        {finished && !openScore ? (
          <p className={styles.done} role="img" aria-label={labels.done}>
            <CheckIcon />
          </p>
        ) : null}
      </div>
      <p className={styles.live} aria-live="polite">
        {note}
      </p>
      {showResults && placements.length > 0 ? (
        <div className={styles.results}>
          {[...scores, ...actions].map((score) => {
            const placed = placements.filter(
              (placement) => placement.scoreId === score.id
            )
            if (placed.length === 0) return null
            return (
              <section key={score.id}>
                <h2>{score.label}</h2>
                <ul>
                  {placed.map((placement) => (
                    <li key={placement.itemId}>
                      {byId.get(placement.itemId)?.label}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Five curved blades spiralling out from an open middle, centered on (cx, cy) and reaching
 * radius r. Each blade starts thin near the middle, swells, and tapers to a point at the rim.
 */
function swirlPath(cx: number, cy: number, r: number) {
  const blades = 5
  const steps = 32
  // How far round each blade wraps, and the radii it spirals between
  const sweep = Math.PI * 1.3
  const from = 0.36
  const to = 1
  let d = ""
  for (let blade = 0; blade < blades; blade++) {
    const start = (blade / blades) * Math.PI * 2
    const outer: string[] = []
    const inner: string[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const angle = start + sweep * t
      const mid = r * (from + (to - from) * t)
      // Fullest a little past halfway, pointed at both ends
      const half = r * 0.095 * Math.sin(Math.PI * Math.pow(t, 0.8))
      const point = (radius: number) =>
        `${fix(cx + radius * Math.cos(angle))} ${fix(cy + radius * Math.sin(angle))}`
      outer.push(point(mid + half))
      inner.unshift(point(mid - half))
    }
    d += `M${outer.join("L")}L${inner.join("L")}Z`
  }
  return d
}

/** Inline icons, so the component needs no icon library */
function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

/**
 * Fixed confetti burst: pieces spread evenly around the circle at varied distances,
 * so it looks scattered but renders the same every time.
 */
const CONFETTI = Array.from({ length: 28 }, (_, index) => {
  const angle = (index / 28) * Math.PI * 2 + (index % 3) * 0.35
  const reach = 90 + ((index * 37) % 70)
  return {
    dx: Math.round(Math.cos(angle) * reach),
    dy: Math.round(Math.sin(angle) * reach),
    spin: ((index * 53) % 360) - 180,
    delay: (index % 4) * 25,
  }
})

/** Confetti colors when no slice has its own: warm, cool, and neutral */
const CONFETTI_FALLBACK = [
  "#f4c430",
  "#e5484d",
  "#3e7bdc",
  "#46a758",
  "#f2efe9",
]

function BanIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m5.6 5.6 12.8 12.8" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="19" cy="12" r="2.2" />
    </svg>
  )
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5Z" fill="currentColor" />
      {muted ? (
        <path d="m22 9-6 6M16 9l6 6" />
      ) : (
        <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
      )}
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/**
 * Odometer-style number: each digit is a 0–9 strip that slides to its value,
 * so 9 â†’ 7 rolls past 8. Digits are keyed by place so they keep their position.
 */
function RollingNumber({ value }: { value: number }) {
  const digits = String(Math.max(0, Math.round(value))).split("")
  return (
    <span className={styles.roll} aria-hidden="true">
      {digits.map((digit, index) => (
        <span key={digits.length - index} className={styles.rollDigit}>
          <span
            className={styles.rollStrip}
            style={{ translate: `0 ${-Number(digit) * 10}%` }}
          >
            {DIGITS.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

/* Styles live here so the component is one file. React hoists and dedupes this <style>. */
const ORBIT_CSS = `.orbit-wrap {
  --orbit-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --orbit-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  /*
   * Color defaults. OrbitRing's 'colors' prop overrides these inline, so every
   * color below can be changed without touching this file.
   */
  --orbit-ink: #161616;
  --orbit-center: #f2efe9;
  --orbit-center-dark: #c9c2b6;
  --orbit-dead-zone: #3a3835;
  --orbit-dead-zone-open: #212122;
  --orbit-word-text: #2b2d31;
  --orbit-word-bg: var(--card);
  --orbit-word-text-dark: #f2efe9;
  --orbit-word-bg-dark: #060606;
  --orbit-max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.orbit-counter {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  pointer-events: none;
  display: grid;
  justify-items: center;
  margin: 0;
  color: #fff;
  font: 800 clamp(16px, 4.5cqi, 32px) / 1 var(--font-geist-sans), sans-serif;
  letter-spacing: -0.03em;
}

.orbit-counter[data-hidden],
.orbit-stage:has([data-orbit-center]:hover) .orbit-counter {
  opacity: 0;
}

/* The count fades in when a ring appears; no fill mode, so the hidden states still apply after */
.orbit-counter {
  animation: orbit-kf-counter-in 500ms ease-out;
}

@keyframes orbit-kf-counter-in {
  from {
    opacity: 0;
  }
}

.orbit-prompt {
  position: absolute;
  top: 24%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  pointer-events: none;
  max-width: 58%;
  padding: 0.3em 0.7em;
  background: rgb(0 0 0 / 0.06);
  color: #1d1b18;
  font: 600 calc(clamp(15px, 3.2cqi, 22px) * var(--orbit-text-scale, 1)) / 1.3
    var(--font-geist-sans), sans-serif;
  text-align: center;
  text-wrap: balance;
  transition: opacity 150ms ease;
}

.orbit-prompt[data-hidden] {
  opacity: 0;
}

.orbit-stage {
  position: relative;
  width: min(100%, var(--orbit-max-width));
  margin: 0 auto;
  aspect-ratio: 1;
  container-type: inline-size;
  color: var(--foreground);
  touch-action: none;
  user-select: none;
}

.orbit-ring {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Center circle: warm paper in light mode, a deeper stone in dark mode */
.orbit-well {
  fill: var(--orbit-center);
  stroke: var(--foreground);
  stroke-width: 0.45;
}

.dark .orbit-well {
  fill: var(--orbit-center-dark);
}

/* 'wellLayer': a caller's texture clipped to the well, over its fill and under the words */
.orbit-well-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  /* Over the ring's SVG (1), under the prompt and words, which come later or sit higher */
  z-index: 2;
  width: var(--orbit-well-size);
  aspect-ratio: 1;
  overflow: hidden;
  isolation: isolate;
  border-radius: 50%;
  translate: -50% -50%;
  pointer-events: none;
}

.orbit-well-hatch {
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms var(--orbit-ease);
}

.orbit-well-hatch[data-shown] {
  opacity: 1;
}

/* A dark tint plus dark lines: the open well reads about two shades darker */
.orbit-ring pattern rect {
  fill: #000;
  fill-opacity: 0.1;
}

.orbit-ring pattern line {
  stroke: #000;
  stroke-opacity: 0.2;
  stroke-width: 0.5;
}

/* Always-visible dark disc; its dashed border appears on hover or while a drag is over it */
.orbit-dead-zone {
  fill: var(--orbit-dead-zone);
  fill-opacity: 0.89;
  /* Dark dashes read against the pale well around the disc */
  stroke: var(--orbit-ink);
  stroke-width: 0.6;
  stroke-dasharray: 1.4 1.1;
  stroke-opacity: 0;
  pointer-events: all;
  transition:
    fill 240ms var(--orbit-ease),
    fill-opacity 240ms var(--orbit-ease),
    stroke-opacity 240ms var(--orbit-ease);
}

.orbit-dead-zone-shown {
  stroke-opacity: 1;
}

/* While a score is open the dead zone means "return", so it goes solid */
.orbit-dead-zone-open {
  fill: var(--orbit-dead-zone-open);
  fill-opacity: 1;
}

/* Keep center hover and drag feedback at full black/white contrast. */
.orbit-dead-zone:hover,
.orbit-dead-zone-hot,
.orbit-dead-zone-shown {
  fill: #000;
  fill-opacity: 1;
  stroke-opacity: 1;
}

/* Thin X across the black center while a dragged word is over the dead zone */
.orbit-center-x {
  stroke: #ff2d2d;
  stroke-width: 0.22;
  stroke-linecap: butt;
  fill: none;
  pointer-events: none;
  opacity: 0;
  transition: opacity 180ms var(--orbit-ease);
}

.orbit-center-x[data-shown] {
  opacity: 1;
}

/* Inside an open slice the swirl stands in for the disc, which stays as the (invisible) target */
[data-orbit-center][data-open],
[data-orbit-center][data-open]:hover {
  fill-opacity: 0;
  stroke-opacity: 0;
}

.orbit-swirl {
  fill: var(--orbit-dead-zone-open);
  pointer-events: none;
  transform-box: view-box;
  transform-origin: 50% 50%;
  animation: orbit-swirl-spin 5s linear infinite paused;
  transition: fill 240ms var(--orbit-ease);
}

.orbit-stage:has([data-orbit-center]:hover) .orbit-swirl,
.orbit-swirl[data-hot] {
  fill: #000;
  animation-play-state: running;
}

@keyframes orbit-swirl-spin {
  to {
    rotate: 360deg;
  }
}

.orbit-stage:has(.orbit-center-x[data-shown]) [data-orbit-center] {
  fill: #000;
  fill-opacity: 1;
  stroke-opacity: 0;
}

.orbit-segment,
.orbit-segment-hot,
.orbit-segment-open {
  stroke: var(--foreground);
  stroke-width: 0.45;
  cursor: pointer;
  transition:
    fill 240ms var(--orbit-ease),
    stroke 240ms var(--orbit-ease),
    stroke-width 240ms var(--orbit-ease);
}

.orbit-segment {
  fill: transparent;
}

.orbit-segment:hover,
.orbit-segment-hot,
.orbit-segment:focus-visible {
  fill: color-mix(in oklch, var(--accent) 42%, transparent);
  outline: none;
}

/* The open slice's border flips to the opposite of the others (white borders â†’ black, and back) */
.orbit-segment-open {
  fill: color-mix(in oklch, var(--foreground) 16%, transparent);
  stroke: var(--background);
  /* Pure black against light borders, pure white against dark ones */
  stroke: oklch(from var(--foreground) round(1 - l) 0 0);
  stroke-width: 0.9;
  cursor: pointer;
  outline: none;
}

/* The global focus ring outlines the slice's bounding box; trace the slice itself instead. */
.orbit-segment:is(:focus, :focus-visible),
.orbit-segment-hot:is(:focus, :focus-visible),
.orbit-segment-open:is(:focus, :focus-visible) {
  outline: none;
  box-shadow: none;
}

.orbit-segment:focus-visible,
.orbit-segment-hot:focus-visible,
.orbit-segment-open:focus-visible {
  stroke: var(--ring);
  stroke-width: 1.1;
}

/* Quiet hint above the dead zone after a drag rests there; sits over the dragged word */
.orbit-release-tip {
  position: absolute;
  left: 50%;
  z-index: 6;
  padding: 4px 8px;
  border: 0;
  border-radius: 4px;
  background: #000;
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.3;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  translate: -50% calc(-100% - 2px);
  transition:
    opacity 600ms var(--orbit-ease),
    translate 600ms var(--orbit-ease);
}

.orbit-release-tip[data-shown] {
  opacity: 1;
  translate: -50% calc(-100% - 6px);
}

.dark .orbit-release-tip {
  background: #fff;
  color: #000;
}

.orbit-close-open {
  position: absolute;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--orbit-ink);
  border-radius: 999px;
  /* Center colors so it reads the same on the light well in either theme */
  background: var(--orbit-center);
  color: var(--orbit-ink);
  translate: -50% -50%;
  cursor: pointer;
  animation: orbit-kf-pop 360ms var(--orbit-spring);
  transition:
    scale 200ms var(--orbit-ease),
    background-color 200ms var(--orbit-ease);
}

.orbit-close-open:hover {
  scale: 1.05;
}

.orbit-close-open:active {
  scale: 0.95;
}

.orbit-close-open:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.orbit-close-open svg {
  width: 14px;
  height: 14px;
}

/*
 * Outer action ring: one color per action ('--slice', set from each action's 'color'),
 * grained, saturated at rest and pale on hover ('--slice-hover' when given).
 */
.orbit-action-ring :is(.orbit-segment, .orbit-segment-hot, .orbit-segment-open) {
  fill: var(--slice, color-mix(in oklch, var(--muted) 55%, transparent));
  transition:
    fill 240ms var(--orbit-ease),
    stroke 240ms var(--orbit-ease),
    stroke-width 240ms var(--orbit-ease);
}

/* Hairline borders in screen pixels, whatever the ring size */
.orbit-action-ring :is(.orbit-segment, .orbit-segment-hot, .orbit-segment-open) {
  vector-effect: non-scaling-stroke;
  stroke-width: 1px;
}

.orbit-action-ring :is(.orbit-segment-open, .orbit-segment:focus-visible, .orbit-segment-hot:focus-visible, .orbit-segment-open:focus-visible) {
  stroke-width: 2px;
}

/*
 * Saturated at rest. The pale hover tint is mixed with white rather than made
 * see-through, so it looks the same on light and dark pages.
 */
.orbit-action-ring .orbit-segment {
  fill: oklch(from var(--slice, var(--muted)) l calc(c * 1.3) h);
}

/* Softens to the pale tint once a flag is in play */
.orbit-action-ring :is(.orbit-segment:hover, .orbit-segment:focus-visible, .orbit-segment-hot, .orbit-segment-open) {
  fill: var(--slice-hover, color-mix(in srgb, var(--slice, var(--muted)) 40%, white));
}

/* Score slices with their own colors: the color at rest, the stronger tone on hover */
.orbit-colored-slice.orbit-segment {
  fill: var(--slice);
}

/* 'greyUntilHover': grey at rest (same lightness), color once in play */
.orbit-grey-rest .orbit-colored-slice.orbit-segment {
  fill: oklch(from var(--slice) l 0 h);
}

.orbit-colored-slice:is(.orbit-segment:hover, .orbit-segment:focus-visible, .orbit-segment-hot, .orbit-segment-open) {
  fill: var(--slice-hover);
}

.orbit-action-label {
  fill: var(--orbit-ink);
  font-size: 2.2px;
  font-weight: 700;
  letter-spacing: 0.08px;
  text-transform: uppercase;
}

.orbit-score-label,
.orbit-score-count {
  fill: currentColor;
}

.orbit-score-label,
.orbit-action-label,
.orbit-score-count {
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
}

.orbit-score-label {
  font-size: 2.5px;
  font-weight: 650;
}

.orbit-score-count {
  font-size: 2.2px;
  font-weight: 700;
}

.orbit-score-count-inline {
  font-size: 1.6px;
  font-weight: 800;
}

/* Filled circle behind a curved count: slice color, dark rim */
.orbit-count-badge {
  fill: var(--orbit-ink);
  stroke: var(--orbit-ink);
  stroke-width: 0.25;
  pointer-events: none;
}

.orbit-ink-label {
  fill: var(--orbit-ink);
}

.orbit-node {
  position: absolute;
  /* Anchored at the top-left; paintNode centers it on the stage in whole pixels */
  left: 0;
  top: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2px, 0.6cqi, 4px);
  max-width: 38%;
  margin: 0;
  /* Words shrink with the ring so small screens still fit a few */
  padding: clamp(3px, 0.9cqi, 6px) clamp(5px, 1.5cqi, 10px);
  border: 2px solid var(--foreground);
  border-radius: 2px;
  background: var(--card);
  color: var(--foreground);
  font: 700 calc(clamp(10px, 2.3cqi, 16px) * var(--orbit-text-scale, 1)) / 1.2
    var(--font-geist-sans), sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: grab;
  touch-action: none;
  scale: 1;
  /* Desktop keeps crisp text; touch devices opt into compositing below. */
  animation: orbit-kf-pop 650ms var(--orbit-spring) backwards;
  transition:
    scale 220ms var(--orbit-ease),
    box-shadow 220ms var(--orbit-ease),
    background-color 220ms var(--orbit-ease),
    color 220ms var(--orbit-ease);
}

@keyframes orbit-kf-pop {
  from {
    scale: 0.5;
    opacity: 0;
  }
}

.orbit-node:hover {
  scale: 1.05;
}

.orbit-node:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

.orbit-node:active,
.orbit-node-dragging,
.orbit-node-dragging:hover {
  z-index: 4;
  scale: 0.95;
  cursor: grabbing;
}

/* Words: text and border in one color on a card; selected or dragged words swap the two */
.orbit-node {
  border-color: var(--orbit-word-text);
  background: var(--orbit-word-bg);
  color: var(--orbit-word-text);
}

.orbit-node-selected,
.orbit-node:active,
.orbit-node-dragging {
  background: var(--orbit-word-text);
  color: var(--orbit-word-bg);
}

.dark .orbit-node {
  border-color: var(--orbit-word-text-dark);
  background: var(--orbit-word-bg-dark);
  color: var(--orbit-word-text-dark);
}

.dark :is(.orbit-node-selected, .orbit-node:active, .orbit-node-dragging) {
  background: var(--orbit-word-text-dark);
  color: var(--orbit-word-bg-dark);
}

.orbit-thumb {
  width: clamp(18px, 5.3cqi, 36px);
  height: clamp(18px, 5.3cqi, 36px);
  object-fit: contain;
  pointer-events: none;
}

.orbit-done {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  margin: 0;
  /* Green check on the dark dead zone */
  color: #22c55e;
  pointer-events: none;
}

.orbit-live {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.orbit-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px 20px;
}

.orbit-results h2 {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 700;
}

.orbit-results ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.orbit-results section,
.orbit-results li {
  animation: orbit-kf-rise 320ms var(--orbit-ease) backwards;
}

.orbit-results li {
  color: var(--muted-foreground);
  font-size: 14px;
  line-height: 1.45;
}

@keyframes orbit-kf-rise {
  from {
    translate: 0 4px;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-node,
  .orbit-counter,
  .orbit-close-open,
  .orbit-release-tip,
  .orbit-results section,
  .orbit-results li {
    animation: none;
    transition: none;
  }

  .orbit-segment,
  .orbit-segment-hot,
  .orbit-segment-open,
  .orbit-dead-zone,
  .orbit-action-ring :is(.orbit-segment, .orbit-segment-hot, .orbit-segment-open) {
    transition: none;
  }

  .orbit-swirl {
    animation: none;
  }
}

@media (max-width: 640px) {
  .orbit-score-count {
    display: none;
  }

  .orbit-score-label {
    font-size: 2.8px;
  }

  .orbit-action-label {
    font-size: 2.5px;
  }
}

/* Center click: a small settings popover just above the drop zone */
.orbit-dead-zone {
  cursor: pointer;
}

.orbit-dead-zone[data-done] {
  cursor: default;
  pointer-events: none;
}

.orbit-settings {
  position: absolute;
  left: 50%;
  z-index: 7;
  /* Sits above the drop zone */
  translate: -50% calc(-100% - 10px);
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--orbit-center);
  color: var(--orbit-ink);
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 0.08),
    0 8px 24px rgb(0 0 0 / 0.18);
  animation: orbit-kf-settings 200ms var(--orbit-ease);
}

@keyframes orbit-kf-settings {
  from {
    opacity: 0;
    translate: -50% calc(-100% - 4px);
  }
}

.orbit-settings-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 600;
}

.orbit-settings-toggles {
  display: grid;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgb(0 0 0 / 0.08);
}

.orbit-settings-toggle {
  justify-content: space-between;
  cursor: pointer;
}

.orbit-settings-sizes {
  display: grid;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgb(0 0 0 / 0.08);
}

.orbit-size-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

/* Picked: black with white text; the rest white with black text */
.orbit-size-button {
  min-width: 34px;
  padding: 4px 0;
  border: 1.5px solid #000;
  border-radius: 4px;
  background: #fff;
  color: #000;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.orbit-size-button[aria-pressed="true"] {
  background: #000;
  color: #fff;
}

.orbit-size-button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

/* Full-width white button under the sizes, styled like an unpicked size */
.orbit-settings-tutorial {
  width: 100%;
  margin-top: 8px;
  padding: 6px 0;
  border: 1.5px solid #000;
  border-radius: 4px;
  background: #fff;
  color: #000;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.orbit-settings-tutorial:hover {
  background: #000;
  color: #fff;
}

.orbit-settings-tutorial:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.orbit-check {
  flex: none;
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: var(--orbit-ink);
  /* The popover is light even on a dark page; a dark-scheme box would look filled while off */
  color-scheme: light;
  cursor: pointer;
}

.orbit-check:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.orbit-mute-button {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background-color 160ms var(--orbit-ease);
}

.orbit-mute-button:hover {
  background: rgb(0 0 0 / 0.07);
}

.orbit-mute-button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

/* 'wrapLabels': sentences wrap onto a few left-aligned lines in normal case */
.orbit-node.orbit-node-wrap {
  width: max-content;
  max-width: calc(min(max(28%, 120px), 210px) * var(--orbit-text-scale, 1));
  font-size: calc(clamp(13px, 2.8cqi, 19px) * var(--orbit-text-scale, 1));
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0;
  text-align: left;
  text-transform: none;
  white-space: normal;
}

/*
 * Auto mode: a word too tall for the ring scrolls inside its capped height with no scrollbar.
 * Its text fades out at the bottom until it's scrolled to the end.
 */
.orbit-node[data-scroll] {
  justify-content: flex-start;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.orbit-node[data-scroll]::-webkit-scrollbar {
  display: none;
}

/* The text keeps its full height so the chip scrolls it, instead of squeezing it to fit */
.orbit-node[data-scroll] > * {
  flex-shrink: 0;
}

/* Pinned to the visible bottom edge, in the chip's own background, faded upward */
.orbit-node[data-scroll]::after {
  content: "";
  position: sticky;
  bottom: 0;
  flex-shrink: 0;
  align-self: stretch;
  /* Light touch: a thin strip at the edge that stops short of solid, so even two-line chips read */
  height: 0.55em;
  margin-top: -0.55em;
  background: inherit;
  mask-image: linear-gradient(to bottom, transparent, rgb(0 0 0 / 0.6));
  pointer-events: none;
  transition: opacity 200ms var(--orbit-ease);
}

.orbit-node[data-scroll][data-scroll-end]::after {
  opacity: 0;
}

/* A word held over the center shrinks and fades: letting go there cancels or returns it */
.orbit-node.orbit-node-dragging.orbit-node-over-center {
  scale: 0.7;
  opacity: 0.55;
  transition:
    scale 180ms var(--orbit-ease),
    opacity 180ms var(--orbit-ease);
}

/* A word held still long enough to cancel only fades; shrinking is the center's cue */
.orbit-node.orbit-node-dragging.orbit-node-hold-cancel {
  opacity: 0.55;
  transition: opacity 180ms var(--orbit-ease);
}

/* Auto mode: a word taken back out of a crowded ring fades and shrinks away (CROWD_FADE_MS) */
.orbit-node.orbit-node-leaving {
  opacity: 0;
  scale: 0.85;
  pointer-events: none;
  transition:
    opacity 180ms var(--orbit-ease),
    scale 180ms var(--orbit-ease);
}

/* Confetti: small pieces burst out from the center, then drift down and fade */
.orbit-confetti {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 6;
  pointer-events: none;
}

.orbit-confetti i {
  position: absolute;
  width: 7px;
  height: 11px;
  margin: -5px -3px;
  border-radius: 1px;
  opacity: 0;
  animation: orbit-kf-confetti 1300ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay) forwards;
}

.orbit-confetti i:nth-child(3n) {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

@keyframes orbit-kf-confetti {
  0% {
    opacity: 1;
    transform: translate(0, 0) rotate(0deg) scale(0.4);
  }
  60% {
    opacity: 1;
    transform: translate(var(--dx), var(--dy)) rotate(var(--spin)) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--dx), calc(var(--dy) + 40px)) rotate(calc(var(--spin) * 2)) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-confetti {
    display: none;
  }
}

/* "More" dots over the center; they fade in while the center is hovered */
.orbit-more {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  display: grid;
  place-items: center;
  color: #fff;
  translate: -50% -50%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms var(--orbit-ease);
}

/* Shows after resting on the center for 100ms, hides right away */
.orbit-stage:has([data-orbit-center]:hover) .orbit-more {
  opacity: 1;
  /* Starts slow and builds, so the dots surface gently */
  transition: opacity 180ms ease-in 100ms;
}

.orbit-stage:has(.orbit-more):has([data-orbit-center]:hover) .orbit-counter {
  opacity: 0;
}

/* Touch devices use flat fills and only promote the small set of moving cards. */
@media (hover: none) and (pointer: coarse) {
  .orbit-ring [data-score-id] {
    filter: none;
  }

  .orbit-node:not([aria-hidden="true"]) {
    will-change: translate;
  }
}

.orbit-settings-value {
  min-width: 2ch;
  font-variant-numeric: tabular-nums;
  text-align: right;
  opacity: 0.6;
}

/* Minimal slider: thin track filled up to the thumb, small round thumb */
.orbit-slider {
  appearance: none;
  width: 120px;
  height: 16px;
  margin: 0;
  background: transparent;
  cursor: pointer;
}

.orbit-slider::-webkit-slider-runnable-track {
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--orbit-ink) var(--orbit-fill),
    rgb(0 0 0 / 0.15) var(--orbit-fill)
  );
}

.orbit-slider::-moz-range-track {
  height: 3px;
  border-radius: 999px;
  background: rgb(0 0 0 / 0.15);
}

.orbit-slider::-moz-range-progress {
  height: 3px;
  border-radius: 999px;
  background: var(--orbit-ink);
}

.orbit-slider::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  margin-top: -5.5px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.15), 0 1px 3px rgb(0 0 0 / 0.25);
}

.orbit-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.15), 0 1px 3px rgb(0 0 0 / 0.25);
}

.orbit-slider:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 4px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .orbit-settings {
    animation: none;
  }
}

/* Rolling counter */
.orbit-roll {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Keep every digit centered on its track, without trailing negative spacing. */
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
  /* Center the visible capitals rather than the font's ascender space. */
  translate: 0 0.025em;
}

.orbit-roll-digit {
  display: inline-block;
  flex: 0 0 1ch;
  width: 1ch;
  text-align: center;
  /* Taller than 1em so heavy glyphs aren't clipped top or bottom */
  height: 1.2em;
  overflow: hidden;
  line-height: 1.2;
  /* Soft top and bottom edges as digits roll through, kept clear of the resting digit */
  mask-image: linear-gradient(transparent, #000 8%, #000 92%, transparent);
}

.orbit-roll-strip {
  display: flex;
  flex-direction: column;
  transition: translate 500ms ${COUNTER_EASE};
}

.orbit-roll-strip > span {
  display: grid;
  place-items: center;
  flex: none;
  height: 1.2em;
  line-height: 1.2;
}

@media (prefers-reduced-motion: reduce) {
  .orbit-roll-strip {
    transition: none;
  }
}
`

/** React keeps one copy per style href, so the href changes with the CSS and edits are never stuck stale */
const ORBIT_CSS_HREF = `orbit-ring-${[...ORBIT_CSS]
  .reduce(
    (hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0,
    2166136261
  )
  .toString(36)}`
