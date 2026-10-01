"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * Flat organic blobs, drawn in SVG, that wobble and slowly change shape as
 * they move. Where two blobs meet they melt into one shape and stretch apart
 * again as they drift. With `merge`, blobs that run into each other join for
 * good, and big ones break apart again so there are always a few around.
 *
 * Each blob is a smooth closed path through a ring of points whose distance
 * from the middle drifts with noise. A goo filter blurs the paths together
 * and cuts the blur back to a hard edge, so neighbors bridge into one shape.
 * Colors come from a wider blur, so they fade into each other across a
 * fused shape; `blend` sets how far.
 *
 * `motion="lava"` moves them like a lava lamp: blobs heat at the bottom, rise,
 * cool at the top and sink, and a `heat` tint colors them by temperature
 * (coolest stop first). `motion="drift"` lets them float about freely. The
 * field is `size-48` by default.
 *
 * <Blob />
 * <Blob motion="drift" tint="blob" palette="candy" wobble={0.5} />
 * <Blob merge count={9} palette="plasma" liquid="oklch(0.2 0.06 300)" />
 * <Blob shape="capsule" className="h-72 w-28" interactive />
 * <Blob material="glass" motion="drift" palette="ocean" />
 */

/** The vessel the blobs float in; blobs bounce off its walls. */
const blobShapes = ["circle", "capsule", "rect"] as const

type BlobShape = (typeof blobShapes)[number]

/**
 * How blobs are colored: `heat` by temperature, so wax brightens as it warms
 * and darkens as it cools, or `blob` with one color per blob, spread along
 * the gradient and mixing where blobs fuse.
 */
const blobTints = ["heat", "blob"] as const

type BlobTint = (typeof blobTints)[number]

/** `lava` rises when hot and sinks when cool, like a lava lamp; `drift` floats about freely. */
const blobMotions = ["lava", "drift"] as const

type BlobMotion = (typeof blobMotions)[number]

/**
 * What the blobs are made of: `solid` flat color; `glass` clear liquid glass
 * that frosts and bends whatever is behind it, with bright edges; `water` a
 * fuller tint with a darker underside and a droplet's glint.
 */
const blobMaterials = ["solid", "glass", "water"] as const

type BlobMaterial = (typeof blobMaterials)[number]

/** Opacity of each layer `water` stacks up. */
const WATER = { body: 0.5, rim: 0.45, shine: 0.55, shade: 0.7, glint: 0.85 }

/** Ready-made gradients, coolest (or first) color first. */
const blobPalettes = {
  lava: ["oklch(0.5 0.2 25)", "oklch(0.66 0.23 40)", "oklch(0.86 0.17 85)"],
  plasma: [
    "oklch(0.5 0.22 300)",
    "oklch(0.65 0.26 345)",
    "oklch(0.85 0.13 25)",
  ],
  slime: [
    "oklch(0.55 0.16 155)",
    "oklch(0.78 0.22 140)",
    "oklch(0.94 0.18 115)",
  ],
  ocean: [
    "oklch(0.45 0.13 260)",
    "oklch(0.66 0.15 230)",
    "oklch(0.9 0.07 200)",
  ],
  aurora: [
    "oklch(0.5 0.15 265)",
    "oklch(0.75 0.17 165)",
    "oklch(0.93 0.2 125)",
  ],
  candy: ["oklch(0.7 0.2 350)", "oklch(0.72 0.16 290)", "oklch(0.85 0.12 200)"],
} satisfies Record<string, string[]>

type BlobPalette = keyof typeof blobPalettes

const blobPaletteNames = Object.keys(blobPalettes) as BlobPalette[]

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** Smooth value noise on a 2D lattice, from 0 to 1. */
function noise(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash(xi + yi * 57)
  const b = hash(xi + 1 + yi * 57)
  const c = hash(xi + (yi + 1) * 57)
  const d = hash(xi + 1 + (yi + 1) * 57)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

function clamps(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

const SVG = "http://www.w3.org/2000/svg"
const TAU = Math.PI * 2
/** Points around each blob's outline. */
const POINTS = 8
/** Colors sampled along the gradient. */
const LEVELS = 64
/** Upward pull per unit of temperature above lukewarm, in field widths per second squared. */
const LIFT = 0.7
/** How fast blobs lose speed; with `LIFT`, sets how fast they rise and sink. */
const DRAG = 1.6
/** Sideways drift. */
const WANDER = 0.3
/** Seconds simulated before the first frame, so blobs start spread through the lamp. */
const WARMUP = 4
/** Rounded corners of the `rect` shape, in CSS pixels; matches `rounded-2xl`. */
const RECT_CORNER = 16

type Drop = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  /** 0 is cold wax that sinks, 1 is hot wax that rises. */
  temp: number
  /** Position along the gradient for the `blob` tint. */
  hue: number
  /** How quickly this blob takes on heat, so blobs fall out of step. */
  rate: number
  seed: number
  /** Seconds before this blob can merge again, so a fresh split does not snap back. */
  cooldown: number
  /** The radius `r` eases toward, so blobs grow and shrink instead of snapping. */
  target: number
  /** The blob this one is melting into, if it is being absorbed. */
  into: Drop | null
}

type LampConfig = {
  count: number
  size: number
  goo: number
  speed: number
  merge: boolean
  shape: BlobShape
  tint: BlobTint
  motion: BlobMotion
  wobble: number
  morph: number
  blend: number
  colors: string[]
  /** Whether the vessel is drawn; without it, blobs stay wholly inside instead of being cut by the wall. */
  vessel: boolean
  seed: number
  running: boolean
}

type LampParts = {
  /** Every SVG layer; all share one viewBox. The first is measured. */
  svgs: SVGSVGElement[]
  blobs: SVGGElement
  /** Blurs the shapes together; the threshold after each sets the outline. */
  shapeBlurs: SVGFEGaussianBlurElement[]
  /** Blurs wider for color only, so colors fade across a fused shape. */
  colorBlur: SVGFEGaussianBlurElement
  vessel: SVGRectElement[]
  /** For `glass`: the outline scaled into CSS pixels, and the lens filter that bends the backdrop with it. */
  glass: {
    mask: SVGGElement
    /** The lens, when `refract` is on. */
    lens: SVGFilterElement | null
    /** The lens's picture of the outline, refreshed as blobs move. */
    image: SVGFEImageElement | null
  } | null
}

/**
 * Simulates the blobs and reshapes their paths. Positions are in field units,
 * where the shorter side of the field is 1, and the SVG's viewBox uses the
 * same units, so paths are drawn straight from the simulation.
 */
class BlobEngine {
  private readonly parts: LampParts
  private readonly observer: ResizeObserver | null
  private readonly paths: SVGPathElement[] = []
  private readonly cursor: SVGPathElement
  private config: LampConfig | null = null
  private blobs: Drop[] = []
  private seededFor = ""
  /** Field size in CSS pixels, and the shorter side. */
  private cssWidth = 0
  private cssHeight = 0
  private unit = 0
  private time = 0
  private last = 0
  private request = 0
  /** When the glass lens last got a fresh outline, in ms. */
  private outlinedAt = -Infinity
  private pointer = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    at: 0,
    strength: 0,
    inside: false,
  }

  constructor(parts: LampParts) {
    this.parts = parts
    this.cursor = document.createElementNS(SVG, "path")
    parts.blobs.appendChild(this.cursor)
    this.observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => this.measures())
    this.observer?.observe(parts.svgs[0])
  }

  configure(config: LampConfig) {
    const first = !this.config
    this.config = config
    // The goo reaches further with more blur; the threshold keeps edges hard.
    for (const blur of this.parts.shapeBlurs)
      blur.setAttribute(
        "stdDeviation",
        String(config.size * (0.12 + clamps(config.goo) * 0.4))
      )
    this.parts.colorBlur.setAttribute(
      "stdDeviation",
      String(config.size * (0.08 + clamps(config.blend) * 1.2))
    )
    if (first) this.measures()
    else {
      this.lenses()
      this.seeds()
      this.draws()
    }
    if (config.running) this.starts()
    else {
      this.stops()
      this.draws()
    }
  }

  /** Moves the pointer blob to a point in CSS pixels, or lifts it with `null`. */
  points(x: number | null, y = 0) {
    const pointer = this.pointer
    pointer.inside = x !== null
    if (x !== null && this.unit) {
      const ux = x / this.unit
      const uy = y / this.unit
      const now = performance.now()
      const elapsed = (now - pointer.at) / 1000
      if (pointer.at && elapsed > 0 && elapsed < 0.2) {
        // Carried into the wax as a stir.
        pointer.vx = clamps((ux - pointer.x) / elapsed, -3, 3)
        pointer.vy = clamps((uy - pointer.y) / elapsed, -3, 3)
      }
      pointer.x = ux
      pointer.y = uy
      pointer.at = now
    } else pointer.at = 0
    if (!this.config?.running) {
      pointer.strength = x === null ? 0 : 1
      this.draws()
    }
  }

  destroy() {
    this.stops()
    this.observer?.disconnect()
    for (const path of this.paths) path.remove()
    this.cursor.remove()
  }

  private starts() {
    if (this.request) return
    this.last = performance.now()
    this.request = requestAnimationFrame(this.animates)
  }

  private stops() {
    cancelAnimationFrame(this.request)
    this.request = 0
  }

  private readonly animates = (now: number) => {
    const elapsed = Math.min(now - this.last, 100)
    this.last = now
    this.steps(elapsed)
    this.draws()
    this.request = requestAnimationFrame(this.animates)
  }

  /** The vessel as a rounded rectangle: center, half sizes and corner radius, in field units. */
  private walls() {
    const width = this.cssWidth / this.unit
    const height = this.cssHeight / this.unit
    const shape = this.config?.shape ?? "circle"
    const cx = width / 2
    const cy = height / 2
    if (shape === "circle") return { cx, cy, hw: 0.5, hh: 0.5, corner: 0.5 }
    const hw = width / 2
    const hh = height / 2
    return {
      cx,
      cy,
      hw,
      hh,
      corner:
        shape === "capsule"
          ? Math.min(hw, hh)
          : Math.min(RECT_CORNER / this.unit, hw, hh),
    }
  }

  /** Signed distance from a point to the vessel wall, negative inside, with the outward normal. */
  private wallAt(x: number, y: number, walls = this.walls()) {
    const { cx, cy, hw, hh, corner } = walls
    const dx = x - cx
    const dy = y - cy
    const qx = Math.abs(dx) - (hw - corner)
    const qy = Math.abs(dy) - (hh - corner)
    const ox = Math.max(qx, 0)
    const oy = Math.max(qy, 0)
    const outside = Math.hypot(ox, oy)
    const distance = outside + Math.min(Math.max(qx, qy), 0) - corner
    let nx = 0
    let ny = 0
    if (outside > 0) {
      nx = (Math.sign(dx) * ox) / outside
      ny = (Math.sign(dy) * oy) / outside
    } else if (qx > qy) nx = Math.sign(dx) || 1
    else ny = Math.sign(dy) || 1
    return { distance, nx, ny }
  }

  /** Lays out fresh blobs when the count, size, seed or shape changes, then warms them up. */
  private seeds() {
    const config = this.config
    if (!config || !this.unit) return
    const key = [config.count, config.size, config.seed, config.shape].join("|")
    if (key === this.seededFor) return
    this.seededFor = key

    const walls = this.walls()
    const { cx, cy, hw, hh } = walls
    const reach = Math.min(hw, hh)
    this.blobs = Array.from({ length: config.count }, (_, index) => {
      const random = (salt: number) =>
        hash(config.seed * 97.3 + index * 13.1 + salt)
      const r = Math.min(reach * 0.7, config.size * (0.7 + 0.6 * random(1)))
      // Stacked through the lamp, low ones warm and high ones cool.
      const height = (index + random(3)) / config.count
      return {
        x: cx + (random(2) - 0.5) * Math.max(0, hw - r) * 1.4,
        y: cy + (height - 0.5) * hh * 1.4,
        vx: 0,
        vy: 0,
        r,
        temp: clamps(height + (random(4) - 0.5) * 0.4),
        hue: config.count > 1 ? index / (config.count - 1) : 0.5,
        rate: 0.7 + 0.6 * random(5),
        seed: random(6) * 100,
        cooldown: 0,
        target: r,
        into: null,
      }
    })
    for (const blob of this.blobs) this.contains(blob, walls)
    for (let t = 0; t < WARMUP; t += 1 / 30) this.ticks(1 / 30)
  }

  private steps(elapsed: number) {
    const config = this.config
    if (!config || !this.unit) return
    const pointer = this.pointer
    const pull = 1 - Math.exp(-elapsed / 140)
    pointer.strength += ((pointer.inside ? 1 : 0) - pointer.strength) * pull
    // Fixed small steps keep fast speeds stable.
    let left = (elapsed / 1000) * Math.max(0, config.speed)
    while (left > 1e-6) {
      const dt = Math.min(left, 1 / 30)
      this.ticks(dt)
      left -= dt
    }
  }

  private ticks(dt: number) {
    const config = this.config!
    const walls = this.walls()
    const top = walls.cy - walls.hh
    const span = walls.hh * 2
    const pointer = this.pointer
    this.time += dt

    for (const blob of this.blobs) {
      blob.cooldown = Math.max(0, blob.cooldown - dt)
      blob.r += (blob.target - blob.r) * (1 - Math.exp(-dt * 2.5))
      if (config.motion === "drift") {
        blob.vy += (noise(blob.seed + 57, this.time * 0.25) - 0.5) * WANDER * dt
      } else {
        // Heat only near the bottom and cool only near the top, so a blob
        // carries its temperature across the middle and overshoots.
        const fall = (blob.y - top) / span
        const heating = clamps((fall - 0.68) / 0.32)
        const cooling = clamps((0.32 - fall) / 0.32)
        // Big blobs hold their heat longer.
        const rate = (blob.rate * 2.2 * config.size) / blob.r
        if (heating)
          blob.temp += (1 - blob.temp) * (1 - Math.exp(-dt * rate * heating))
        if (cooling) blob.temp *= Math.exp(-dt * rate * cooling)
        blob.temp = clamps(
          blob.temp + (noise(blob.seed, this.time * 0.3) - 0.5) * 0.12 * dt
        )

        blob.vy -= (blob.temp - 0.5) * LIFT * dt
      }
      blob.vx += (noise(blob.seed + 31, this.time * 0.25) - 0.5) * WANDER * dt

      if (pointer.strength > 0.05) {
        const reach = blob.r + config.size * 1.5
        const away = Math.hypot(blob.x - pointer.x, blob.y - pointer.y)
        if (away < reach) {
          const pull = (1 - away / reach) * pointer.strength * dt * 3
          blob.vx += (pointer.vx - blob.vx) * pull
          blob.vy += (pointer.vy - blob.vy) * pull
        }
      }

      const damp = Math.exp(-dt * DRAG)
      blob.vx *= damp
      blob.vy *= damp
      blob.x += blob.vx * dt
      blob.y += blob.vy * dt
      this.contains(blob, walls)
    }

    this.absorbs(dt)

    const settle = Math.exp(-dt * 6)
    pointer.vx *= settle
    pointer.vy *= settle

    if (config.merge) {
      this.merges()
      this.splits(dt, walls)
    }
  }

  /** Pushes a blob back inside the vessel; it may squash a little against the wall. */
  private contains(blob: Drop, walls: ReturnType<BlobEngine["walls"]>) {
    const { distance, nx, ny } = this.wallAt(blob.x, blob.y, walls)
    const config = this.config
    // Against glass a blob may squash a little; in the open it keeps its lumps clear of the edge.
    // A blob too big to fit that clear is held near the middle; otherwise it
    // would be shoved from wall to wall every frame and jitter.
    const limit = Math.max(
      !config || config.vessel
        ? -blob.r * 0.8
        : -blob.r * (1.1 + config.wobble * 0.8),
      -Math.min(walls.hw, walls.hh) * 0.9
    )
    if (distance <= limit) return
    const push = distance - limit
    blob.x -= nx * push
    blob.y -= ny * push
    const into = blob.vx * nx + blob.vy * ny
    if (into > 0) {
      blob.vx -= nx * into * 1.2
      blob.vy -= ny * into * 1.2
    }
  }

  /**
   * Starts melting blobs that run into each other together: the smaller one
   * is drawn into the larger and shrinks while the larger grows to hold both.
   */
  private merges() {
    const blobs = this.blobs
    // A blob already melting, or taking another in, waits for that to finish.
    const busy = new Set<Drop>()
    for (const blob of blobs)
      if (blob.into) {
        busy.add(blob)
        busy.add(blob.into)
      }
    for (let i = 0; i < blobs.length; i++) {
      for (let j = i + 1; j < blobs.length; j++) {
        const a = blobs[i]
        const b = blobs[j]
        if (busy.has(a) || busy.has(b)) continue
        if (a.cooldown > 0 || b.cooldown > 0) continue
        if (Math.hypot(a.x - b.x, a.y - b.y) > (a.r + b.r) * 0.5) continue
        const [big, small] = a.target >= b.target ? [a, b] : [b, a]
        const area = big.target ** 2 + small.target ** 2
        const share = small.target ** 2 / area
        big.vx += (small.vx - big.vx) * share
        big.vy += (small.vy - big.vy) * share
        big.target = Math.sqrt(area)
        small.target = 0
        small.into = big
        busy.add(big)
        busy.add(small)
      }
    }
  }

  /** Moves melting blobs into their hosts, fades the host's color toward theirs, and drops them once gone. */
  private absorbs(dt: number) {
    const config = this.config!
    const pull = 1 - Math.exp(-dt * 3)
    for (const blob of this.blobs) {
      const host = blob.into
      if (!host) continue
      blob.x += (host.x - blob.x) * pull
      blob.y += (host.y - blob.y) * pull
      blob.vx = host.vx
      blob.vy = host.vy
      const share = blob.r ** 2 / (blob.r ** 2 + host.r ** 2)
      host.temp += (blob.temp - host.temp) * share * pull
      host.hue += (blob.hue - host.hue) * share * pull
    }
    this.blobs = this.blobs.filter(
      (blob) => !blob.into || blob.r > config.size * 0.06
    )
  }

  /** Breaks big blobs in two at the heater, so merging never leaves one lump. */
  private splits(dt: number, walls: ReturnType<BlobEngine["walls"]>) {
    const config = this.config!
    const top = walls.cy - walls.hh
    const span = walls.hh * 2
    for (const blob of [...this.blobs]) {
      if (blob.into || blob.cooldown > 0) continue
      const swollen = blob.target > config.size * 2.2
      if (!swollen && this.blobs.length >= config.count) continue
      if (blob.target < config.size * 1.25) continue
      // Pieces break off at the heater, sooner the fewer blobs are left.
      const low = (blob.y - top) / span > 0.55
      const chance = dt * (0.8 + 2 * (1 - this.blobs.length / config.count))
      if (!swollen && (!low || Math.random() > chance)) continue
      // Both halves ease to their new size, so the piece buds out of the parent.
      const r = blob.target / Math.SQRT2
      const side = Math.random() < 0.5 ? -1 : 1
      blob.target = r
      blob.cooldown = 2.5
      blob.vx -= side * 0.05
      blob.temp = clamps(blob.temp - 0.1)
      // The piece that breaks off is the hot one, so it rises away.
      const piece: Drop = {
        ...blob,
        x: blob.x + side * blob.r * 0.45,
        r: config.size * 0.15,
        target: r,
        vx: blob.vx + side * 0.18,
        vy: blob.vy - 0.05,
        temp: clamps(blob.temp + 0.35),
        rate: 0.7 + 0.6 * Math.random(),
        seed: Math.random() * 100,
        into: null,
      }
      this.contains(piece, walls)
      this.blobs.push(piece)
    }
  }

  /** Sizes the glass mask and lens to the field, in CSS pixels. */
  private lenses() {
    const glass = this.parts.glass
    if (!glass || !this.config || !this.unit) return
    const radius = this.config.size * this.unit
    glass.mask.setAttribute("transform", `scale(${this.unit})`)
    const { lens, image } = glass
    if (!lens || !image) return
    const sets = (part: string, name: string, value: number) =>
      lens
        .querySelector(`[data-lens="${part}"]`)
        ?.setAttribute(name, String(value))
    // Inside a backdrop filter, percentages do not line the image up with the
    // element, so the region and the outline image are sized in pixels.
    lens.setAttribute("filterUnits", "userSpaceOnUse")
    lens.setAttribute("width", String(this.cssWidth))
    lens.setAttribute("height", String(this.cssHeight))
    image.setAttribute("width", String(this.cssWidth))
    image.setAttribute("height", String(this.cssHeight))
    // Negative pulls the backdrop in from just outside the rim.
    sets("bend", "scale", -radius * 1.6)
    this.refreshesLens(true)
  }

  private measures() {
    const { svgs, vessel } = this.parts
    const box = svgs[0].getBoundingClientRect()
    if (!box.width || !box.height) return
    this.cssWidth = box.width
    this.cssHeight = box.height
    this.unit = Math.min(box.width, box.height)
    for (const svg of svgs)
      svg.setAttribute(
        "viewBox",
        `0 0 ${box.width / this.unit} ${box.height / this.unit}`
      )
    this.lenses()
    const { cx, cy, hw, hh, corner } = this.walls()
    for (const rect of vessel) {
      rect.setAttribute("x", String(cx - hw))
      rect.setAttribute("y", String(cy - hh))
      rect.setAttribute("width", String(hw * 2))
      rect.setAttribute("height", String(hh * 2))
      rect.setAttribute("rx", String(corner))
    }

    // The vessel moved, so pull everything back inside it.
    const walls = this.walls()
    for (const blob of this.blobs) this.contains(blob, walls)
    this.seeds()
    this.draws()
  }

  /**
   * A smooth closed outline round `(x, y)`: each point's distance from the
   * middle drifts with its own noise, and a Catmull-Rom curve joins them.
   */
  private outlines(x: number, y: number, r: number, seed: number) {
    const { wobble, morph } = this.config!
    const t = this.time * 0.35 * morph
    const turn = noise(seed + 91, t * 0.3) * TAU
    const points = Array.from({ length: POINTS }, (_, index) => {
      const angle = (index / POINTS) * TAU + turn
      const reach =
        r * (1 + (noise(seed * 3 + index * 11.7, t) - 0.5) * 1.6 * wobble)
      return [x + Math.cos(angle) * reach, y + Math.sin(angle) * reach]
    })
    const at = (index: number) => points[(index + POINTS) % POINTS]
    let d = `M${at(0)[0].toFixed(4)} ${at(0)[1].toFixed(4)}`
    for (let index = 0; index < POINTS; index++) {
      const [ax, ay] = at(index - 1)
      const [bx, by] = at(index)
      const [cx, cy] = at(index + 1)
      const [ex, ey] = at(index + 2)
      d += `C${(bx + (cx - ax) / 6).toFixed(4)} ${(by + (cy - ay) / 6).toFixed(4)} ${(cx - (ex - bx) / 6).toFixed(4)} ${(cy - (ey - by) / 6).toFixed(4)} ${cx.toFixed(4)} ${cy.toFixed(4)}`
    }
    return d + "Z"
  }

  /** Matches one path to each blob, adding or removing paths as blobs merge and split. */
  private draws() {
    const config = this.config
    if (!config || !this.unit) return
    const { blobs, paths, cursor } = this
    const group = this.parts.blobs
    while (paths.length < blobs.length) {
      const path = document.createElementNS(SVG, "path")
      group.insertBefore(path, cursor)
      paths.push(path)
    }
    while (paths.length > blobs.length) paths.pop()!.remove()

    const shade = (level: number) =>
      config.colors[Math.round(clamps(level) * (config.colors.length - 1))]
    blobs.forEach((blob, index) => {
      const path = paths[index]
      path.setAttribute("d", this.outlines(blob.x, blob.y, blob.r, blob.seed))
      path.setAttribute(
        "fill",
        shade(config.tint === "heat" ? blob.temp : blob.hue)
      )
    })

    const pointer = this.pointer
    if (pointer.strength > 0.01) {
      cursor.setAttribute(
        "d",
        this.outlines(
          pointer.x,
          pointer.y,
          config.size * 1.1 * pointer.strength,
          7
        )
      )
    } else cursor.removeAttribute("d")
    cursor.setAttribute("fill", shade(0.85))
    this.refreshesLens()
  }

  /**
   * Hands the glass lens the current fused outline as an image. Browsers do
   * not draw page elements inside a backdrop filter, but they do draw images,
   * so the outline goes in as a small SVG data URL, at most 20 times a second.
   */
  private refreshesLens(force = false) {
    const image = this.parts.glass?.image
    const config = this.config
    if (!image || !config || !this.unit) return
    const now = performance.now()
    if (!force && now - this.outlinedAt < 50) return
    this.outlinedAt = now
    const width = this.cssWidth / this.unit
    const height = this.cssHeight / this.unit
    const blur = config.size * (0.12 + clamps(config.goo) * 0.4)
    const shapes = this.paths
      .map((path) => path.getAttribute("d"))
      .concat(this.cursor.getAttribute("d"))
      .filter(Boolean)
      .map((d) => `<path d="${d}"/>`)
      .join("")
    // The bevel runs a fifth of a blob's radius in from the rim, so the
    // middle stays undistorted; its slope, sampled a step ahead and behind,
    // becomes red (x) and green (y) around a neutral ½. The slope is built
    // from the bevel and its inverse so the map stays opaque.
    const bevel = config.size * 0.2
    const step = config.size * 0.06
    const keep = (row: number) =>
      [0, 1, 2].map((channel) => (channel === row ? "1 0 0 0 0" : "0 0 0 0 0"))
    const svg =
      // Half resolution: the map is smooth, and the filter stretches it to fit.
      `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(this.cssWidth / 2)}" height="${Math.ceil(this.cssHeight / 2)}" viewBox="0 0 ${width} ${height}">` +
      `<filter id="m" filterUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" color-interpolation-filters="sRGB">` +
      `<feGaussianBlur stdDeviation="${blur}"/>` +
      `<feColorMatrix values="0 0 0 24 -10 0 0 0 24 -10 0 0 0 24 -10 0 0 0 0 1"/>` +
      `<feGaussianBlur stdDeviation="${bevel}" edgeMode="duplicate" result="bevel"/>` +
      `<feColorMatrix in="bevel" values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0" result="inverse"/>` +
      `<feOffset in="bevel" dx="${-step}" result="ax"/><feOffset in="inverse" dx="${step}" result="bx"/>` +
      `<feComposite in="ax" in2="bx" operator="arithmetic" k2="0.5" k3="0.5" result="sx"/>` +
      `<feOffset in="bevel" dy="${-step}" result="ay"/><feOffset in="inverse" dy="${step}" result="by"/>` +
      `<feComposite in="ay" in2="by" operator="arithmetic" k2="0.5" k3="0.5" result="sy"/>` +
      `<feColorMatrix in="sx" values="${keep(0).join(" ")} 0 0 0 0 1" result="mx"/>` +
      `<feColorMatrix in="sy" values="${keep(1).join(" ")} 0 0 0 0 1" result="my"/>` +
      `<feComposite in="mx" in2="my" operator="arithmetic" k2="1" k3="1"/></filter>` +
      // The rect spans the whole field, so the map is neutral everywhere the blobs are not.
      `<g filter="url(#m)" fill="#fff"><rect width="${width}" height="${height}" fill="none"/>${shapes}</g></svg>`
    image.setAttribute("href", `data:image/svg+xml,${encodeURIComponent(svg)}`)
  }
}

/** Samples `count` evenly spaced colors along a gradient through `stops`. */
function samplesStops(stops: string[], count: number) {
  if (stops.length < 2) return [stops[0] ?? "currentColor"]
  const canvas = document.createElement("canvas")
  canvas.width = count
  canvas.height = 1
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return stops
  const gradient = context.createLinearGradient(0.5, 0, count - 0.5, 0)
  stops.forEach((stop, index) =>
    gradient.addColorStop(index / (stops.length - 1), stop)
  )
  context.fillStyle = gradient
  context.fillRect(0, 0, count, 1)
  const pixels = context.getImageData(0, 0, count, 1).data
  return Array.from(
    { length: count },
    (_, index) =>
      `rgb(${pixels[index * 4]} ${pixels[index * 4 + 1]} ${pixels[index * 4 + 2]})`
  )
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function subscribesReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/** Resolves any CSS color, including `var(--token)`, to one a canvas can read. */
function resolvesColor(host: Element, color: string) {
  const probe = document.createElement("span")
  probe.style.color = color
  probe.hidden = true
  host.appendChild(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()
  return resolved
}

/**
 * Shrinks a shape's outline by about `by`: a blur, then only what stayed
 * nearly solid. Costs the same at any size, unlike `feMorphology`, whose cost
 * grows with the radius.
 */
function Erodes({
  source,
  by,
  result,
}: {
  source: string
  by: number
  result: string
}) {
  return (
    <>
      <feGaussianBlur
        in={source}
        stdDeviation={by * 0.6}
        result={`${result}Blur`}
      />
      <feColorMatrix
        in={`${result}Blur`}
        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 30 -28.5"
        result={result}
      />
    </>
  )
}

function Blob({
  count = 6,
  size = 0.14,
  goo = 0.5,
  speed = 1,
  merge = false,
  shape = "circle",
  tint = "heat",
  motion = "lava",
  wobble = 0.35,
  morph = 1,
  blend = 0.5,
  material = "solid",
  refract = true,
  color,
  colors,
  palette,
  liquid,
  seed = 1,
  paused = false,
  interactive = false,
  label,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: Omit<React.ComponentProps<"div">, "color"> & {
  /** How many blobs the lamp holds. With `merge`, the count it splits back up to. */
  count?: number
  /** Blob radius, as a fraction of the field's shorter side. Blobs vary around it. */
  size?: number
  /** From 0 to 1: how far apart blobs start to reach for each other and fuse. */
  goo?: number
  /** Scales how fast blobs move. */
  speed?: number
  /** Blobs that run into each other join for good, and big ones split at the heater. */
  merge?: boolean
  shape?: BlobShape
  tint?: BlobTint
  motion?: BlobMotion
  /** From 0 (round) to 1 (lumpy): how far each blob's outline strays from a circle. */
  wobble?: number
  /** Scales how fast the outlines change shape. */
  morph?: number
  /** From 0 (each blob keeps its own flat color) to 1 (colors fade across the whole fused shape). */
  blend?: number
  material?: BlobMaterial
  /**
   * For `glass`: bend what is behind the glass at its edge, like a lens.
   * Chromium only, and costly over a large field; off, the glass just softens
   * the backdrop a touch.
   */
  refract?: boolean
  /** One color for every blob; any CSS color, including `var(--token)`. */
  color?: string
  /** Gradient stops; any CSS colors. Wins over `palette` and `color`. */
  colors?: string[]
  /** A ready-made gradient. Defaults to `lava` when no color is given. */
  palette?: BlobPalette
  /** Fills the vessel behind the blobs; any CSS color. Transparent by default. */
  liquid?: string
  /** Picks the starting layout; change it for a different lamp. */
  seed?: number
  paused?: boolean
  /** The pointer becomes a blob the others fuse with, and stirs what it passes. */
  interactive?: boolean
  /** Accessible description. */
  label?: string
}) {
  const filterId = `blob-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const fieldRef = React.useRef<HTMLDivElement>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)
  const blobsRef = React.useRef<SVGGElement>(null)
  const shapeBlurRef = React.useRef<SVGFEGaussianBlurElement>(null)
  const frontRef = React.useRef<SVGSVGElement>(null)
  const cutBlurRef = React.useRef<SVGFEGaussianBlurElement>(null)
  const maskRef = React.useRef<SVGGElement>(null)
  const lensRef = React.useRef<SVGFilterElement>(null)
  const glassRef = React.useRef<HTMLDivElement>(null)
  const colorBlurRef = React.useRef<SVGFEGaussianBlurElement>(null)
  const liquidRef = React.useRef<SVGRectElement>(null)
  const clipRef = React.useRef<SVGRectElement>(null)
  const engineRef = React.useRef<BlobEngine | null>(null)
  const glass = material === "glass"

  React.useLayoutEffect(() => {
    const svg = svgRef.current
    const front = frontRef.current
    const blobs = blobsRef.current
    const shapeBlur = shapeBlurRef.current
    const colorBlur = colorBlurRef.current
    if (!svg || !front || !blobs || !shapeBlur || !colorBlur) return
    const mask = maskRef.current
    const lens = lensRef.current
    const engine = new BlobEngine({
      svgs: [svg, front],
      blobs,
      shapeBlurs: [shapeBlur, cutBlurRef.current].filter(
        (blur): blur is SVGFEGaussianBlurElement => !!blur
      ),
      colorBlur,
      vessel: [liquidRef.current, clipRef.current].filter(
        (rect): rect is SVGRectElement => !!rect
      ),
      glass: mask
        ? { mask, lens, image: lens?.querySelector("feImage") ?? null }
        : null,
    })
    engineRef.current = engine
    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [glass, refract])

  // Bends the backdrop where the browser allows an SVG filter there; everywhere else just softens it a touch.
  React.useLayoutEffect(() => {
    const layer = glassRef.current
    if (!layer) return
    const bends =
      refract &&
      typeof CSS !== "undefined" &&
      CSS.supports("backdrop-filter", "url(#lens) blur(1px)")
    const frost = "blur(0.5px) saturate(1.4)"
    layer.style.backdropFilter = bends
      ? `url(#${filterId}-lens) ${frost}`
      : frost
    layer.style.setProperty("-webkit-backdrop-filter", frost)
  }, [glass, refract, filterId])

  // Only animate while the lamp is on screen.
  const [visible, setVisible] = React.useState(true)
  React.useEffect(() => {
    const field = fieldRef.current
    if (!field || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting)
    )
    observer.observe(field)
    return () => observer.disconnect()
  }, [])

  const reduced = React.useSyncExternalStore(
    subscribesReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  )

  const stopList =
    colors ??
    (palette ? blobPalettes[palette] : color ? [color] : blobPalettes.lava)
  // A key, so a new array with the same colors does not resample the gradient.
  const stopKey = stopList.join("|")
  const blobCount = Math.max(1, Math.round(count))
  const radius = clamps(size, 0.02, 0.45)
  const hasLiquid = !!liquid

  React.useLayoutEffect(() => {
    const field = fieldRef.current
    if (!field) return
    const stops = stopKey.split("|").map((stop) => resolvesColor(field, stop))
    engineRef.current?.configure({
      count: blobCount,
      size: clamps(size, 0.02, 0.45),
      goo,
      speed,
      merge,
      shape,
      tint,
      motion,
      wobble: clamps(wobble),
      morph: Math.max(0, morph),
      blend,
      colors: samplesStops(stops, LEVELS),
      vessel: hasLiquid,
      seed,
      running: visible && !paused && !reduced,
    })
  }, [
    blobCount,
    size,
    goo,
    speed,
    merge,
    shape,
    tint,
    motion,
    wobble,
    morph,
    blend,
    stopKey,
    hasLiquid,
    glass,
    refract,
    seed,
    visible,
    paused,
    reduced,
  ])

  return (
    <div
      ref={fieldRef}
      role="img"
      aria-label={label ?? "Blobs"}
      data-slot="blob"
      data-shape={shape}
      data-material={material}
      data-interactive={interactive || undefined}
      className={cn("relative size-48 select-none", className)}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (!interactive) return
        const rect = event.currentTarget.getBoundingClientRect()
        engineRef.current?.points(
          event.clientX - rect.left,
          event.clientY - rect.top
        )
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        if (interactive) engineRef.current?.points(null)
      }}
      {...props}
    >
      <svg
        ref={svgRef}
        aria-hidden
        className="absolute inset-0 block size-full overflow-visible"
      >
        <defs>
          <filter
            id={`${filterId}-goo`}
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              ref={shapeBlurRef}
              in="SourceGraphic"
              result="soft"
            />
            {/* Cuts the blur back to a hard edge, so blobs that overlap read as one shape. */}
            <feColorMatrix
              in="soft"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 24 -10"
              result="goo"
            />
            <feGaussianBlur
              ref={colorBlurRef}
              in="SourceGraphic"
              result="smear"
            />
            {/*
              Lifts the wide blur to full opacity; what is left is each spot's
              average of nearby blob colors, which fades from one to the next.
            */}
            <feColorMatrix
              in="smear"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 60 0"
              result="paint"
            />
            <feComposite in="paint" in2="goo" operator="in" result="fill" />
            {material === "water" && (
              <>
                {/* A see-through body. */}
                <feColorMatrix
                  in="fill"
                  values={`1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ${WATER.body} 0`}
                  result="body"
                />
                {/* A thin rim round the edge, lightened toward white. */}
                <Erodes source="goo" by={radius * 0.05} result="inner" />
                <feComposite
                  in="fill"
                  in2="inner"
                  operator="out"
                  result="edge"
                />
                <feColorMatrix
                  in="edge"
                  values={`0.4 0 0 0 0.6 0 0.4 0 0 0.6 0 0 0.4 0 0.6 0 0 0 ${WATER.rim} 0`}
                  result="rim"
                />
                {/* The part a down-right copy does not cover: a lit lip along the top left. */}
                <feOffset
                  in="goo"
                  dx={radius * 0.16}
                  dy={radius * 0.16}
                  result="lowered"
                />
                <feComposite
                  in="goo"
                  in2="lowered"
                  operator="out"
                  result="lip"
                />
                <feGaussianBlur
                  in="lip"
                  stdDeviation={radius * 0.04}
                  result="lipSoft"
                />
                <feComposite
                  in="lipSoft"
                  in2="inner"
                  operator="in"
                  result="lipInside"
                />
                <feColorMatrix
                  in="lipInside"
                  values={`0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ${WATER.shine} 0`}
                  result="shine"
                />
                {/* And the same from the other side: a darker underside along the bottom right. */}
                <feOffset
                  in="goo"
                  dx={radius * -0.2}
                  dy={radius * -0.2}
                  result="raised"
                />
                <feComposite
                  in="fill"
                  in2="raised"
                  operator="out"
                  result="underside"
                />
                <feColorMatrix
                  in="underside"
                  values={`0.55 0 0 0 0 0 0.55 0 0 0 0 0 0.55 0 0 0 0 0 ${WATER.shade} 0`}
                  result="shade"
                />
                {/* A droplet's glint: a crescent at the top left of the blob's core. */}
                <Erodes source="goo" by={radius * 0.42} result="core" />
                <feOffset
                  in="core"
                  dx={radius * -0.14}
                  dy={radius * -0.18}
                  result="coreRaised"
                />
                <feComposite
                  in="coreRaised"
                  in2="core"
                  operator="out"
                  result="glintEdge"
                />
                <feComposite
                  in="glintEdge"
                  in2="inner"
                  operator="in"
                  result="glintInside"
                />
                <feColorMatrix
                  in="glintInside"
                  values={`0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ${WATER.glint} 0`}
                  result="glint"
                />
                <feMerge>
                  <feMergeNode in="body" />
                  <feMergeNode in="shade" />
                  <feMergeNode in="rim" />
                  <feMergeNode in="shine" />
                  <feMergeNode in="glint" />
                </feMerge>
              </>
            )}
            {glass && (
              <>
                {/* A faint wash of color; the glass is nearly clear. */}
                <feColorMatrix
                  in="fill"
                  values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.03 0"
                  result="body"
                />
                {/* A soft shadow, kept outside the glass so the backdrop stays clear. */}
                <feGaussianBlur
                  in="goo"
                  stdDeviation={radius * 0.25}
                  result="spread"
                />
                <feOffset in="spread" dy={radius * 0.12} result="dropped" />
                <feComposite
                  in="dropped"
                  in2="goo"
                  operator="out"
                  result="outside"
                />
                <feColorMatrix
                  in="outside"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.18 0"
                  result="shadow"
                />
                {/* Light pooling inside the edge, fading toward the middle. */}
                <Erodes source="goo" by={radius * 0.25} result="core" />
                <feGaussianBlur
                  in="core"
                  stdDeviation={radius * 0.2}
                  result="coreSoft"
                />
                <feComposite
                  in="goo"
                  in2="coreSoft"
                  operator="out"
                  result="ring"
                />
                <feColorMatrix
                  in="ring"
                  values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0"
                  result="glow"
                />
                {/* A thin bright rim all the way round. */}
                <Erodes source="goo" by={radius * 0.035} result="inner" />
                <feComposite
                  in="goo"
                  in2="inner"
                  operator="out"
                  result="edge"
                />
                <feColorMatrix
                  in="edge"
                  values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0"
                  result="rim"
                />
                {/* Specular edges on opposite sides: strong at the top left, softer at the bottom right. */}
                <feOffset
                  in="goo"
                  dx={radius * 0.09}
                  dy={radius * 0.09}
                  result="lowered"
                />
                <feComposite
                  in="goo"
                  in2="lowered"
                  operator="out"
                  result="lip"
                />
                <feGaussianBlur
                  in="lip"
                  stdDeviation={radius * 0.025}
                  result="lipSoft"
                />
                <feComposite
                  in="lipSoft"
                  in2="goo"
                  operator="in"
                  result="lipInside"
                />
                <feColorMatrix
                  in="lipInside"
                  values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0"
                  result="shineTop"
                />
                <feOffset
                  in="goo"
                  dx={radius * -0.07}
                  dy={radius * -0.07}
                  result="raised"
                />
                <feComposite
                  in="goo"
                  in2="raised"
                  operator="out"
                  result="underLip"
                />
                <feGaussianBlur
                  in="underLip"
                  stdDeviation={radius * 0.025}
                  result="underSoft"
                />
                <feComposite
                  in="underSoft"
                  in2="goo"
                  operator="in"
                  result="underInside"
                />
                <feColorMatrix
                  in="underInside"
                  values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
                  result="shineBottom"
                />
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="body" />
                  <feMergeNode in="glow" />
                  <feMergeNode in="rim" />
                  <feMergeNode in="shineTop" />
                  <feMergeNode in="shineBottom" />
                </feMerge>
              </>
            )}
          </filter>
          <clipPath id={`${filterId}-vessel`}>
            <rect ref={clipRef} />
          </clipPath>
          {/* The blob paths, drawn twice below: once through the look, once into the glass mask. */}
          <g id={`${filterId}-shapes`} ref={blobsRef} />
          {glass && (
            <>
              <filter
                id={`${filterId}-cut`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur ref={cutBlurRef} in="SourceGraphic" />
                <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 24 -10" />
              </filter>
              {/* The fused outline, in the glass layer's CSS pixels. */}
              <g id={`${filterId}-outline`} ref={maskRef}>
                <use
                  href={`#${filterId}-shapes`}
                  filter={`url(#${filterId}-cut)`}
                  clipPath={liquid ? `url(#${filterId}-vessel)` : undefined}
                />
              </g>
              <mask id={`${filterId}-mask`} style={{ maskType: "alpha" }}>
                <use href={`#${filterId}-outline`} />
              </mask>
              {/*
                Bends the backdrop near the edge, like a lens. The engine draws
                the displacement map as an image (see `refreshesLens`); here
                the backdrop is only pulled along it, once per frame.
              */}
              {refract && (
                <filter
                  ref={lensRef}
                  id={`${filterId}-lens`}
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  colorInterpolationFilters="sRGB"
                >
                  <feImage
                    preserveAspectRatio="none"
                    x="0"
                    y="0"
                    result="map"
                  />
                  <feDisplacementMap
                    data-lens="bend"
                    in="SourceGraphic"
                    in2="map"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              )}
            </>
          )}
        </defs>
        <rect ref={liquidRef} fill={liquid ?? "none"} />
      </svg>
      {glass && (
        <div
          ref={glassRef}
          aria-hidden
          data-slot="blob-glass"
          className="pointer-events-none absolute inset-0"
          style={{
            mask: `url(#${filterId}-mask)`,
            WebkitMask: `url(#${filterId}-mask)`,
          }}
        />
      )}
      <svg
        ref={frontRef}
        aria-hidden
        className="absolute inset-0 block size-full overflow-visible"
      >
        <g clipPath={liquid ? `url(#${filterId}-vessel)` : undefined}>
          <use href={`#${filterId}-shapes`} filter={`url(#${filterId}-goo)`} />
        </g>
      </svg>
      {children !== undefined && (
        <div
          data-slot="blob-center"
          className="absolute inset-0 flex items-center justify-center"
        >
          {children}
        </div>
      )}
    </div>
  )
}

export {
  Blob,
  blobMaterials,
  blobMotions,
  blobPaletteNames,
  blobPalettes,
  blobShapes,
  blobTints,
  type BlobMaterial,
  type BlobMotion,
  type BlobPalette,
  type BlobShape,
  type BlobTint,
}
