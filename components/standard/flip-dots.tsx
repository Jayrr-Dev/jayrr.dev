"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * An electromechanical flip-dot board: a grid of two-sided discs that turn
 * over between a bright face and a black face, sweeping across the board the
 * way a real display controller pulses its columns.
 *
 * The board is drawn on one canvas. Hundreds of individually transformed DOM
 * elements flicker as the browser composites them; a canvas repaints every
 * moving disc in the same pass, so frames land whole.
 *
 * Run a built-in pattern, or control the dots yourself with `value`. With
 * `editable`, press and drag to paint dots (into a running pattern too, so
 * you can seed Life or drop rain by hand).
 *
 * <FlipDots pattern="marquee" text="NEXT STOP 42" />
 * <FlipDots pattern="life" editable />
 * <FlipDots pattern="wave" variant="flat" shape="diamond" />
 * <FlipDots value={rows} editable onValueChange={setRows} />
 */

const flipDotsPatterns = [
  "marquee",
  "text",
  "clock",
  "wave",
  "ripple",
  "rain",
  "life",
  "checker",
  "wipe",
  "sparkle",
  "bounce",
  "pong",
  "snake",
] as const

type FlipDotsPattern = (typeof flipDotsPatterns)[number]

/** The order the discs of one frame flip in. */
const flipDotsSweeps = ["column", "row", "diagonal", "random", "none"] as const

type FlipDotsSweep = (typeof flipDotsSweeps)[number]

/** `disc` shades the faces like real lit discs; `flat` paints them solid. */
const flipDotsVariants = ["disc", "flat"] as const

type FlipDotsVariant = (typeof flipDotsVariants)[number]

const flipDotsShapes = [
  "circle",
  "square",
  "rounded",
  "diamond",
  "hexagon",
  "triangle",
  "star",
  "plus",
] as const

type FlipDotsShape = (typeof flipDotsShapes)[number]

/** Polygon outlines as x, y pairs in percent of the dot box. */
const SHAPE_POINTS: Partial<Record<FlipDotsShape, number[]>> = {
  diamond: [50, 0, 100, 50, 50, 100, 0, 50],
  hexagon: [25, 3, 75, 3, 100, 50, 75, 97, 25, 97, 0, 50],
  triangle: [50, 4, 100, 94, 0, 94],
  star: [
    50, 0, 61, 35, 98, 35, 68, 57, 79, 91, 50, 70, 21, 91, 32, 57, 2, 35, 39,
    35,
  ],
  plus: [
    33, 0, 67, 0, 67, 33, 100, 33, 100, 67, 67, 67, 67, 100, 33, 100, 33, 67, 0,
    67, 0, 33, 33, 33,
  ],
}

type Frame = boolean[]

type StepContext = {
  tick: number
  cols: number
  rows: number
  prev: Frame
  text: string
  /** Scratch space that lives for one run of a pattern, for games with state. */
  memory: Record<string, unknown>
}

/** Milliseconds between frames when `interval` is not set. */
const DEFAULT_INTERVALS: Record<FlipDotsPattern, number> = {
  marquee: 110,
  text: 1000,
  clock: 500,
  wave: 120,
  ripple: 140,
  rain: 110,
  life: 220,
  checker: 800,
  wipe: 60,
  sparkle: 160,
  bounce: 90,
  pong: 60,
  snake: 70,
}

/** Longest wait, in milliseconds, from the first disc of a frame flipping to the last. */
const SWEEP_SPAN = 90
/** Default longest flip of one disc, in milliseconds. */
const FLIP_DURATION = 60
/** Frame interval assumed for a controlled `value`. */
const CONTROLLED_INTERVAL = 200

// 5x7 bitmap font, rows top to bottom. Narrow glyphs set their own width.
const GLYPHS: Record<string, string> = {
  A: ".###. #...# #...# ##### #...# #...# #...#",
  B: "####. #...# #...# ####. #...# #...# ####.",
  C: ".###. #...# #.... #.... #.... #...# .###.",
  D: "####. #...# #...# #...# #...# #...# ####.",
  E: "##### #.... #.... ####. #.... #.... #####",
  F: "##### #.... #.... ####. #.... #.... #....",
  G: ".###. #...# #.... #.### #...# #...# .####",
  H: "#...# #...# #...# ##### #...# #...# #...#",
  I: "### .#. .#. .#. .#. .#. ###",
  J: "..### ...#. ...#. ...#. ...#. #..#. .##..",
  K: "#...# #..#. #.#.. ##... #.#.. #..#. #...#",
  L: "#.... #.... #.... #.... #.... #.... #####",
  M: "#...# ##.## #.#.# #.#.# #...# #...# #...#",
  N: "#...# #...# ##..# #.#.# #..## #...# #...#",
  O: ".###. #...# #...# #...# #...# #...# .###.",
  P: "####. #...# #...# ####. #.... #.... #....",
  Q: ".###. #...# #...# #...# #.#.# #..#. .##.#",
  R: "####. #...# #...# ####. #.#.. #..#. #...#",
  S: ".#### #.... #.... .###. ....# ....# ####.",
  T: "##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..",
  U: "#...# #...# #...# #...# #...# #...# .###.",
  V: "#...# #...# #...# #...# #...# .#.#. ..#..",
  W: "#...# #...# #...# #.#.# #.#.# #.#.# .#.#.",
  X: "#...# #...# .#.#. ..#.. .#.#. #...# #...#",
  Y: "#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..",
  Z: "##### ....# ...#. ..#.. .#... #.... #####",
  "0": ".###. #...# #..## #.#.# ##..# #...# .###.",
  "1": "..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.",
  "2": ".###. #...# ....# ...#. ..#.. .#... #####",
  "3": "####. ....# ....# .###. ....# ....# ####.",
  "4": "...#. ..##. .#.#. #..#. ##### ...#. ...#.",
  "5": "##### #.... ####. ....# ....# #...# .###.",
  "6": "..##. .#... #.... ####. #...# #...# .###.",
  "7": "##### ....# ...#. ..#.. .#... .#... .#...",
  "8": ".###. #...# #...# .###. #...# #...# .###.",
  "9": ".###. #...# #...# .#### ....# ...#. .##..",
  " ": "... ... ... ... ... ... ...",
  ".": ". . . . . . #",
  ",": ".. .. .. .. .. .# #.",
  ":": ". . # . # . .",
  "'": "# # . . . . .",
  "!": "# # # # # . #",
  "?": ".###. #...# ....# ...#. ..#.. ..... ..#..",
  "-": "... ... ... ### ... ... ...",
  "+": "..... ..#.. ..#.. ##### ..#.. ..#.. .....",
  "=": "..... ..... ##### ..... ##### ..... .....",
  "/": "....# ....# ...#. ..#.. .#... #.... #....",
  "(": ".# #. #. #. #. #. .#",
  ")": "#. .# .# .# .# .# #.",
  "♥": ".#.#. ##### ##### ##### .###. ..#.. .....",
}

const GLYPH_HEIGHT = 7
const EMPTY_COLUMN: boolean[] = Array(GLYPH_HEIGHT).fill(false)

const columnCache = new Map<string, boolean[][]>()

/** The text as columns of 7 dots, one blank column between glyphs. Treat as read-only. */
function textColumns(text: string) {
  const cached = columnCache.get(text)
  if (cached) return cached

  const columns: boolean[][] = []

  Array.from(text.toUpperCase()).forEach((char, index) => {
    const rows = (GLYPHS[char] ?? GLYPHS["?"]).split(" ")

    if (index > 0) columns.push(EMPTY_COLUMN)
    for (let x = 0; x < rows[0].length; x++) {
      columns.push(rows.map((row) => row[x] === "#"))
    }
  })

  // Bounded, since the clock and live text inputs keep producing new strings.
  if (columnCache.size > 64) columnCache.clear()
  columnCache.set(text, columns)
  return columns
}

function blankFrame(cols: number, rows: number): Frame {
  return Array(cols * rows).fill(false)
}

function mapsFrame(
  cols: number,
  rows: number,
  on: (x: number, y: number) => boolean
): Frame {
  const frame = blankFrame(cols, rows)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) frame[y * cols + x] = on(x, y)
  }

  return frame
}

/** Draws text columns starting at column `left`, centered vertically. */
function drawsColumns(
  columns: boolean[][],
  left: number,
  cols: number,
  rows: number
) {
  const frame = blankFrame(cols, rows)
  const top = Math.floor((rows - GLYPH_HEIGHT) / 2)

  columns.forEach((column, index) => {
    const x = left + index
    if (x < 0 || x >= cols) return

    column.forEach((on, y) => {
      const row = top + y
      if (on && row >= 0 && row < rows) frame[row * cols + x] = true
    })
  })

  return frame
}

/** Bounces between 0 and `max` as `t` grows. */
function triangle(t: number, max: number) {
  const period = 2 * max
  return max - Math.abs((((t % period) + period) % period) - max)
}

function randomFrame(cols: number, rows: number, density: number) {
  return mapsFrame(cols, rows, () => Math.random() < density)
}

function stepsLife({ cols, rows, prev, tick }: StepContext) {
  if (tick % 150 === 0 || !prev.includes(true)) {
    return randomFrame(cols, rows, 0.35)
  }

  const next = mapsFrame(cols, rows, (x, y) => {
    let neighbors = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const nx = (x + dx + cols) % cols
        const ny = (y + dy + rows) % rows
        if (prev[ny * cols + nx]) neighbors++
      }
    }
    return neighbors === 3 || (neighbors === 2 && prev[y * cols + x])
  })

  // A board that stopped changing starts over.
  return next.every((on, index) => on === prev[index])
    ? randomFrame(cols, rows, 0.35)
    : next
}

/**
 * An endless rally: the ball bounces between the paddles, and each paddle
 * chases the ball a few frames behind, so the rally looks played rather
 * than scripted. Everything follows from the tick, like the other patterns.
 */
function stepsPong({ tick, cols, rows }: StepContext) {
  const ball = rows >= 24 ? 2 : 1
  const paddle = Math.max(3, Math.round(rows / 5))
  const ballYAt = (at: number) => triangle(at * 0.55, rows - ball)
  const ballX = Math.round(2 + triangle(tick * 0.9, cols - 4 - ball))
  const ballY = Math.round(ballYAt(tick))
  const paddleAt = (lag: number) =>
    Math.min(
      rows - paddle,
      Math.max(0, Math.round(ballYAt(tick - lag) + ball / 2 - paddle / 2))
    )
  const left = paddleAt(2)
  const right = paddleAt(4)
  const net = Math.floor(cols / 2)

  return mapsFrame(cols, rows, (x, y) => {
    if (x === 0) return y >= left && y < left + paddle
    if (x === cols - 1) return y >= right && y < right + paddle
    if (x >= ballX && x < ballX + ball && y >= ballY && y < ballY + ball)
      return true
    return x === net && y % 4 < 2
  })
}

type SnakeGame = {
  /** Cell indexes, head first. */
  body: number[]
  food: number
  /** Frames left of the death flash, or 0 while alive. */
  dying: number
}

function emptyCell(cols: number, rows: number, taken: Set<number>) {
  const free: number[] = []
  for (let index = 0; index < cols * rows; index++)
    if (!taken.has(index)) free.push(index)
  return free.length ? free[Math.floor(Math.random() * free.length)] : -1
}

function startsSnake(cols: number, rows: number): SnakeGame {
  const head = Math.floor(rows / 2) * cols + Math.floor(cols / 2)
  const body = [head, head - 1, head - 2]
  return { body, food: emptyCell(cols, rows, new Set(body)), dying: 0 }
}

/** Cells reachable from `start` without crossing `blocked`, stopping once `enough` are found. */
function floods(
  start: number,
  cols: number,
  rows: number,
  blocked: Set<number>,
  enough: number
) {
  const seen = new Set([start])
  const queue = [start]
  while (queue.length && seen.size < enough) {
    const cell = queue.pop()!
    const x = cell % cols
    for (const next of [
      cell - cols,
      cell + cols,
      x > 0 ? cell - 1 : -1,
      x < cols - 1 ? cell + 1 : -1,
    ]) {
      if (
        next < 0 ||
        next >= cols * rows ||
        seen.has(next) ||
        blocked.has(next)
      )
        continue
      seen.add(next)
      queue.push(next)
    }
  }
  return seen.size
}

/**
 * A snake that plays itself: it heads for the food, but never into a pocket
 * too small to hold its body. When it has nowhere to go it flashes and a
 * new game starts.
 */
function stepsSnake({ cols, rows, memory, tick }: StepContext) {
  let game = memory.snake as SnakeGame | undefined
  if (!game || game.body.some((cell) => cell >= cols * rows)) {
    game = startsSnake(cols, rows)
    memory.snake = game
  }

  if (game.dying > 0) {
    game.dying--
    const shown = game.dying % 2 === 0
    const body = new Set(game.body)
    if (game.dying === 0) memory.snake = startsSnake(cols, rows)
    return mapsFrame(cols, rows, (x, y) => shown && body.has(y * cols + x))
  }

  const [head] = game.body
  const headX = head % cols
  const foodX = game.food % cols
  const foodY = Math.floor(game.food / cols)
  // The tail moves out of the way this frame, so it is not an obstacle.
  const blocked = new Set(game.body.slice(0, -1))

  let best: { cell: number; score: number } | null = null
  for (const cell of [
    head - cols,
    head + cols,
    headX > 0 ? head - 1 : -1,
    headX < cols - 1 ? head + 1 : -1,
  ]) {
    if (cell < 0 || cell >= cols * rows || blocked.has(cell)) continue

    const distance =
      Math.abs((cell % cols) - foodX) +
      Math.abs(Math.floor(cell / cols) - foodY)
    const room = floods(cell, cols, rows, blocked, game.body.length + 2)
    const trapped = room < game.body.length + 1
    // Room matters first, then the food, with a little noise so games differ.
    const score = (trapped ? 10_000 : 0) + distance + Math.random() * 0.5
    if (!best || score < best.score) best = { cell, score }
  }

  if (!best) {
    game.dying = 8
  } else {
    game.body.unshift(best.cell)
    if (best.cell === game.food) {
      game.food = emptyCell(cols, rows, new Set(game.body))
      // A snake that fills the board has won; start over.
      if (game.food < 0) game.dying = 8
    } else {
      game.body.pop()
    }
  }

  const body = new Set(game.body)
  const food = game.food
  // The food blinks slowly so it reads apart from the snake.
  const foodShown = tick % 6 < 4
  return mapsFrame(cols, rows, (x, y) => {
    const cell = y * cols + x
    return body.has(cell) || (foodShown && cell === food)
  })
}

const STEPS: Record<FlipDotsPattern, (context: StepContext) => Frame> = {
  marquee: ({ tick, cols, rows, text }) => {
    const columns = textColumns(text)
    return drawsColumns(
      columns,
      cols - (tick % (columns.length + cols)),
      cols,
      rows
    )
  },
  text: ({ cols, rows, text }) => {
    const columns = textColumns(text)
    return drawsColumns(
      columns,
      Math.floor((cols - columns.length) / 2),
      cols,
      rows
    )
  },
  clock: ({ cols, rows }) => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, "0")
    const columns = [
      ...textColumns(`${hours}:${String(now.getMinutes()).padStart(2, "0")}`),
    ]
    // The colon blinks with the seconds.
    if (now.getSeconds() % 2)
      columns[textColumns(hours).length + 1] = EMPTY_COLUMN
    return drawsColumns(
      columns,
      Math.floor((cols - columns.length) / 2),
      cols,
      rows
    )
  },
  wave: ({ tick, cols, rows }) =>
    mapsFrame(cols, rows, (x, y) => {
      const crest =
        (rows - 1) / 2 + Math.sin(x * 0.45 - tick * 0.5) * (rows / 3)
      return y >= crest
    }),
  ripple: ({ tick, cols, rows }) =>
    mapsFrame(cols, rows, (x, y) => {
      const distance = Math.hypot(
        x - (cols - 1) / 2,
        (y - (rows - 1) / 2) * 1.2
      )
      return (((distance - tick * 0.6) % 5) + 5) % 5 < 2
    }),
  rain: ({ cols, rows, prev }) =>
    mapsFrame(cols, rows, (x, y) =>
      y === 0 ? Math.random() < 0.08 : prev[(y - 1) * cols + x]
    ),
  life: stepsLife,
  checker: ({ tick, cols, rows }) =>
    mapsFrame(
      cols,
      rows,
      (x, y) => (Math.floor(x / 2) + Math.floor(y / 2) + tick) % 2 === 0
    ),
  wipe: ({ tick, cols, rows }) => {
    const span = cols + rows
    const phase = tick % (2 * span)
    return mapsFrame(cols, rows, (x, y) =>
      phase < span ? x + y < phase : x + y >= phase - span
    )
  },
  sparkle: ({ cols, rows, prev }) =>
    prev.map((on) => (Math.random() < 0.05 ? !on : on)).slice(0, cols * rows),
  bounce: ({ tick, cols, rows }) => {
    const cx = triangle(tick, cols - 1)
    const cy = triangle(tick * 0.7, rows - 1)
    return mapsFrame(cols, rows, (x, y) => Math.hypot(x - cx, y - cy) <= 1.6)
  },
  pong: stepsPong,
  snake: stepsSnake,
}

/**
 * Flip and sweep lengths for a frame interval. The last disc of a frame has
 * to land before the next frame starts, or fast patterns reverse discs
 * mid-flip and the image breaks up.
 */
function timingFor(interval: number, flipDuration?: number) {
  // Discs should rest for a good part of each frame, or fast patterns shimmer.
  const span = Math.min(SWEEP_SPAN, interval * 0.2)
  const duration =
    flipDuration ?? Math.max(20, Math.min(FLIP_DURATION, interval * 0.3))
  return { span, duration }
}

function sweepDelay(
  sweep: FlipDotsSweep,
  x: number,
  y: number,
  cols: number,
  rows: number,
  span: number
) {
  switch (sweep) {
    case "column":
      return (x / cols) * span
    case "row":
      return (y / rows) * span
    case "diagonal":
      return ((x + y) / (cols + rows)) * span
    case "random":
      return (((((x * 73856093) ^ (y * 19349663)) >>> 0) % 1000) / 1000) * span
    default:
      return 0
  }
}

function toRows(frame: Frame, cols: number) {
  const rows: boolean[][] = []
  for (let index = 0; index < frame.length; index += cols) {
    rows.push(frame.slice(index, index + cols))
  }
  return rows
}

function fromRows(value: boolean[][], cols: number, rows: number) {
  return mapsFrame(cols, rows, (x, y) => Boolean(value[y]?.[x]))
}

/** Fraction of a cell the dot fills. */
const DOT_SIZE = 0.86
/** Tilt of the pivot off horizontal, in radians, like a real flip disc. */
const PIVOT_TILT = 0.28
/** Face colors that do not follow `color`. */
const DARK_FACE: Record<FlipDotsVariant, string> = {
  disc: "#171717",
  flat: "#222222",
}

type Look = { variant: FlipDotsVariant; shape: FlipDotsShape; color: string }

type BoardConfig = {
  cols: number
  rows: number
  delays: number[]
  duration: number
  look: Look
}

/** Turning away speeds up and turning in slows down, as the magnet pulls the disc through. */
function easesFlip(progress: number) {
  return progress < 0.5
    ? 2 * progress * progress
    : 1 - (-2 * progress + 2) ** 2 / 2
}

/** Traces `shape` in a unit box centered on the origin. */
function tracesShape(context: CanvasRenderingContext2D, shape: FlipDotsShape) {
  context.beginPath()
  if (shape === "circle") {
    context.arc(0, 0, 0.5, 0, Math.PI * 2)
  } else if (shape === "square") {
    context.rect(-0.5, -0.5, 1, 1)
  } else if (shape === "rounded") {
    context.roundRect(-0.5, -0.5, 1, 1, 0.25)
  } else {
    const points = SHAPE_POINTS[shape] ?? []
    for (let index = 0; index < points.length; index += 2) {
      const x = points[index] / 100 - 0.5
      const y = points[index + 1] / 100 - 0.5
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    }
    context.closePath()
  }
}

/**
 * Draws and animates the discs. Each disc has a flip progress from 0 (dark
 * face out) to 1 (lit face out); a frame only sets targets, and one
 * animation loop moves every disc toward its target and redraws the ones
 * that moved. The loop sleeps once every disc has landed.
 */
class FlipDotsRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D | null
  private readonly observer: ResizeObserver | null
  private readonly litShine: CanvasGradient | null
  private readonly darkShine: CanvasGradient | null
  private readonly shadow: CanvasGradient | null
  private cols = 0
  private rows = 0
  private progress = new Float32Array(0)
  private target = new Uint8Array(0)
  private startAt = new Float64Array(0)
  private delays: number[] = []
  private duration = FLIP_DURATION
  private look: Look = { variant: "disc", shape: "circle", color: "#fff" }
  private cell = 0
  private request = 0
  private last = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = canvas.getContext("2d")
    this.litShine = this.createsShine(0.45)
    this.darkShine = this.createsShine(0.07)
    this.shadow = this.createsShadow(0.3)
    this.observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => this.measures())
    this.observer?.observe(canvas)
  }

  // Canvas gradients blend color and alpha separately, so a stop list that
  // runs from white into black passes through a visible gray ring. Light and
  // shadow are two gradients that each keep one color and only fade alpha.

  /** A soft light from the top left, in unit dot space. */
  private createsShine(strength: number) {
    const shine =
      this.context?.createRadialGradient(-0.16, -0.2, 0, -0.16, -0.2, 0.5) ??
      null
    shine?.addColorStop(0, `rgb(255 255 255 / ${strength})`)
    shine?.addColorStop(1, "rgb(255 255 255 / 0)")
    return shine
  }

  /** Falloff toward the bottom right edge, in unit dot space. */
  private createsShadow(strength: number) {
    const shadow =
      this.context?.createRadialGradient(-0.1, -0.12, 0.2, 0, 0, 0.6) ?? null
    shadow?.addColorStop(0, "rgb(0 0 0 / 0)")
    shadow?.addColorStop(1, `rgb(0 0 0 / ${strength})`)
    return shadow
  }

  configure({ cols, rows, delays, duration, look }: BoardConfig) {
    if (cols !== this.cols || rows !== this.rows) {
      this.cols = cols
      this.rows = rows
      this.progress = new Float32Array(cols * rows)
      this.target = new Uint8Array(cols * rows)
      this.startAt = new Float64Array(cols * rows)
    }
    this.delays = delays
    this.duration = duration
    this.look = look
    this.measures()
  }

  /** Sets where every disc should end up; the sweep delays when each starts. */
  shows(frame: Frame) {
    const now = performance.now()
    let changed = false

    for (let index = 0; index < this.target.length; index++) {
      const goal = frame[index] ? 1 : 0
      if (this.target[index] === goal) continue

      // A disc already turning reverses on the spot instead of waiting its turn.
      const turning = this.progress[index] !== this.target[index]
      this.target[index] = goal
      this.startAt[index] = turning ? now : now + (this.delays[index] ?? 0)
      changed = true
    }

    if (changed && !this.request) {
      this.last = now
      this.request = requestAnimationFrame(this.animates)
    }
  }

  destroy() {
    cancelAnimationFrame(this.request)
    this.request = 0
    this.observer?.disconnect()
  }

  private readonly animates = (now: number) => {
    // A long gap (a hidden tab) finishes flips instead of skipping ahead oddly.
    const elapsed = Math.min(now - this.last, 100)
    const step = this.duration > 0 ? elapsed / this.duration : 1
    this.last = now
    let moving = false

    for (let index = 0; index < this.target.length; index++) {
      const goal = this.target[index]
      const current = this.progress[index]
      if (current === goal) continue

      moving = true
      if (now < this.startAt[index]) continue

      this.progress[index] =
        goal === 1 ? Math.min(1, current + step) : Math.max(0, current - step)
      this.drawsDot(index)
    }

    this.request = moving ? requestAnimationFrame(this.animates) : 0
  }

  private measures() {
    const width = this.canvas.clientWidth
    if (!width || !this.cols) return

    const scale = window.devicePixelRatio || 1
    this.canvas.width = Math.round(width * scale)
    this.canvas.height = Math.round((width * scale * this.rows) / this.cols)
    this.cell = this.canvas.width / this.cols
    for (let index = 0; index < this.target.length; index++)
      this.drawsDot(index)
  }

  private drawsDot(index: number) {
    const { context, cell, look } = this
    if (!context || !cell) return

    const x = (index % this.cols) * cell
    const y = Math.floor(index / this.cols) * cell
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(x, y, cell, cell)

    // Half a turn from dark face out to lit face out. The visible face is
    // foreshortened by the cosine of the angle, and is edge-on at 90°.
    const facing = Math.cos(Math.PI * easesFlip(this.progress[index]))
    const squash = Math.abs(facing)
    if (squash < 0.02) return
    const lit = facing < 0

    const size = cell * DOT_SIZE
    context.setTransform(size, 0, 0, size, x + cell / 2, y + cell / 2)
    context.rotate(PIVOT_TILT)
    context.scale(1, squash)
    context.rotate(-PIVOT_TILT)
    tracesShape(context, look.shape)

    context.fillStyle = lit ? look.color : DARK_FACE[look.variant]
    context.fill()
    if (look.variant === "disc") {
      for (const layer of [lit ? this.litShine : this.darkShine, this.shadow]) {
        if (!layer) continue
        context.fillStyle = layer
        context.fill()
      }
    }
    // A face turned away from the viewer catches less light.
    if (squash < 1) {
      context.fillStyle = `rgb(0 0 0 / ${(1 - squash) * 0.45})`
      context.fill()
    }
  }
}

function FlipDots({
  cols = 28,
  rows = 14,
  pattern = "marquee",
  text = "FLIP DOTS",
  value,
  onValueChange,
  editable = false,
  paused = false,
  interval,
  flipDuration,
  sweep = "column",
  variant = "disc",
  shape = "circle",
  color = "oklch(0.93 0.21 118)",
  label,
  className,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  cols?: number
  rows?: number
  /** The animation to run; `null` leaves the board still (for drawing). Ignored with `value`. */
  pattern?: FlipDotsPattern | null
  /** Text for the `marquee` and `text` patterns. */
  text?: string
  /** Controls the dots directly, as rows of columns. */
  value?: boolean[][]
  onValueChange?: (value: boolean[][]) => void
  /** Press and drag to paint dots. */
  editable?: boolean
  paused?: boolean
  /** Milliseconds between frames; each pattern has its own default. */
  interval?: number
  /** Milliseconds for one disc to flip; defaults to a quick flip that fits the interval. */
  flipDuration?: number
  sweep?: FlipDotsSweep
  /** `disc` for shaded discs, `flat` for solid faces with no gradient. */
  variant?: FlipDotsVariant
  shape?: FlipDotsShape
  /** Color of the lit face; any CSS color, including `var(--token)`. */
  color?: string
  /** Accessible description; defaults to the text or the pattern name. */
  label?: string
}) {
  const size = cols * rows
  const controlled = value !== undefined
  const running = !controlled && !paused && pattern !== null
  const frameInterval = controlled
    ? CONTROLLED_INTERVAL
    : (interval ?? (pattern ? DEFAULT_INTERVALS[pattern] : CONTROLLED_INTERVAL))
  const { span, duration } = timingFor(frameInterval, flipDuration)

  const boardRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const rendererRef = React.useRef<FlipDotsRenderer | null>(null)
  // The frame on the board. Frames go straight to the renderer, not through state.
  const frameRef = React.useRef<Frame>([])

  React.useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = new FlipDotsRenderer(canvas)
    rendererRef.current = renderer
    return () => {
      renderer.destroy()
      rendererRef.current = null
    }
  }, [])

  const delays = React.useMemo(
    () =>
      Array.from({ length: size }, (_, index) =>
        sweepDelay(
          sweep,
          index % cols,
          Math.floor(index / cols),
          cols,
          rows,
          span
        )
      ),
    [sweep, size, cols, rows, span]
  )

  React.useLayoutEffect(() => {
    const board = boardRef.current
    if (!board) return
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    rendererRef.current?.configure({
      cols,
      rows,
      delays: reduced ? [] : delays,
      duration: reduced ? 0 : duration,
      // Read back from the board so `var(--token)` colors resolve.
      look: { variant, shape, color: getComputedStyle(board).color },
    })
  }, [cols, rows, delays, duration, variant, shape, color])

  // After any render (new size, a new `value`), bring the board up to date.
  React.useLayoutEffect(() => {
    if (controlled) frameRef.current = fromRows(value, cols, rows)
    else if (frameRef.current.length !== size)
      frameRef.current = blankFrame(cols, rows)
    rendererRef.current?.shows(frameRef.current)
  })

  // Only animate while the board is on screen.
  const [visible, setVisible] = React.useState(true)
  React.useEffect(() => {
    const board = boardRef.current
    if (!board || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting)
    )
    observer.observe(board)
    return () => observer.disconnect()
  }, [])

  const tickRef = React.useRef(0)
  const runKeyRef = React.useRef("")
  const memoryRef = React.useRef<Record<string, unknown>>({})

  React.useEffect(() => {
    if (!running || !visible || !pattern) return

    // Changing what runs starts it over; pausing picks up where it left off.
    const runKey = `${pattern}|${text}|${cols}x${rows}`
    if (runKeyRef.current !== runKey) {
      runKeyRef.current = runKey
      tickRef.current = 0
      memoryRef.current = {}
    }

    const step = STEPS[pattern]
    // Frames ride animation frames, so a hidden tab stops ticking for free.
    let last = performance.now() - frameInterval + 60
    let request = requestAnimationFrame(function ticks(now) {
      if (now - last >= frameInterval) {
        // Keep the beat even when a frame lands late, without bursting to catch up.
        last = now - ((now - last) % frameInterval)
        const prev =
          frameRef.current.length === size
            ? frameRef.current
            : blankFrame(cols, rows)
        const next = step({
          tick: tickRef.current++,
          cols,
          rows,
          prev,
          text,
          memory: memoryRef.current,
        })
        frameRef.current = next
        rendererRef.current?.shows(next)
      }
      request = requestAnimationFrame(ticks)
    })

    return () => cancelAnimationFrame(request)
  }, [running, visible, pattern, text, cols, rows, size, frameInterval])

  const paintRef = React.useRef<boolean | null>(null)

  function paints(index: number, on: boolean) {
    const next = [...frameRef.current]
    next[index] = on
    frameRef.current = next
    rendererRef.current?.shows(next)
    onValueChange?.(toRows(next, cols))
  }

  function dotAt(event: React.PointerEvent) {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect?.width || !rect.height) return null
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * cols)
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * rows)
    return x >= 0 && x < cols && y >= 0 && y < rows ? y * cols + x : null
  }

  function endsPaint(event: React.PointerEvent<HTMLDivElement>) {
    paintRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div
      ref={boardRef}
      role="img"
      aria-label={
        label ??
        (!controlled && (pattern === "marquee" || pattern === "text")
          ? text
          : `Flip-dot display${pattern && !controlled ? `: ${pattern}` : ""}`)
      }
      data-slot="flip-dots"
      data-editable={editable || undefined}
      data-variant={variant}
      data-shape={shape}
      className={cn(
        "w-full rounded-lg bg-neutral-950 p-[1.5%] shadow-[inset_0_2px_8px_rgb(0_0_0/0.6)] select-none",
        editable && "cursor-crosshair touch-none",
        className
      )}
      // `color` sits on the board so the renderer can read it back resolved.
      style={{ color, ...style }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (!editable || event.button !== 0) return
        const index = dotAt(event)
        if (index === null) return
        event.currentTarget.setPointerCapture(event.pointerId)
        paintRef.current = !frameRef.current[index]
        paints(index, paintRef.current)
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (paintRef.current === null) return
        const index = dotAt(event)
        if (index !== null && frameRef.current[index] !== paintRef.current) {
          paints(index, paintRef.current)
        }
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event)
        endsPaint(event)
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        endsPaint(event)
      }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="block w-full"
        style={{ aspectRatio: `${cols} / ${rows}` }}
      />
    </div>
  )
}

export {
  FlipDots,
  flipDotsPatterns,
  flipDotsShapes,
  flipDotsSweeps,
  flipDotsVariants,
  type FlipDotsPattern,
  type FlipDotsShape,
  type FlipDotsSweep,
  type FlipDotsVariant,
}
