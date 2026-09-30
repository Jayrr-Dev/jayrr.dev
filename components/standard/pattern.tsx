import * as React from "react"

import { layerProps, svgUrl, type LayerProps } from "@/components/standard/layer"

const basicPatternKinds = ["dots", "grid", "lines", "diagonal", "checker"] as const

/** Action lines and traditional textile motifs. Halftone tones live in Screentone. */
const decorativePatternKinds = [
  "speed-lines",
  "motion-lines",
  "sunburst",
  "seigaiha",
  "asanoha",
  "kikko",
  "shippo",
  "sparkles",
  "sakura",
] as const

/** Printed and built surfaces: paper stock, cloth, wood, pegboard, drafting grids. */
const materialPatternKinds = [
  "paper",
  "newsprint",
  "linen",
  "woodgrain",
  "pegboard",
  "blueprint",
  "fold",
] as const

/** Print-style line and shape repeats: waves, stripes, staggered marks. */
const graphicPatternKinds = [
  "waves",
  "pinstripe",
  "barcode",
  "polka",
  "triangles",
  "diamonds",
  "dotted-diagonal",
  "double-diagonal",
  "dashed-diagonal",
  "band",
] as const

const patternKinds = [
  ...basicPatternKinds,
  ...graphicPatternKinds,
  ...decorativePatternKinds,
  ...materialPatternKinds,
] as const

type PatternKind = (typeof patternKinds)[number]

/** Cell size per kind, in px. Rays for speed lines and sunburst scale with it. */
const defaultPatternSizes: Record<PatternKind, number> = {
  dots: 16,
  grid: 16,
  lines: 16,
  diagonal: 12,
  checker: 16,
  "speed-lines": 18,
  "motion-lines": 160,
  sunburst: 12,
  seigaiha: 40,
  asanoha: 48,
  kikko: 26,
  shippo: 36,
  sparkles: 110,
  sakura: 120,
  paper: 3,
  newsprint: 3,
  linen: 3,
  woodgrain: 9,
  pegboard: 18,
  blueprint: 8,
  fold: 0,
  waves: 48,
  pinstripe: 8,
  barcode: 60,
  polka: 16,
  triangles: 26,
  diamonds: 24,
  "dotted-diagonal": 20,
  "double-diagonal": 14,
  "dashed-diagonal": 20,
  band: 22,
}

type PatternProps = LayerProps & {
  kind?: PatternKind
  /** Cell size in px. Defaults per kind. */
  size?: number
  /** Line width or dot radius in px. */
  thickness?: number
  /** Any CSS color. Defaults to a faint foreground. */
  color?: string
}

const round = (value: number) => Math.round(value * 100) / 100

function svgTile(width: number, height: number, body: string, viewBox?: string) {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${round(width)}' height='${round(height)}'${viewBox ? ` viewBox='${viewBox}'` : ""}>${body}</svg>`
}

/** Horizontal action streaks of uneven length and weight. */
function motionLinesTile(size: number, thickness: number) {
  const height = size / 2
  const streaks = [
    [0.08, 0.04, 0.5, 1],
    [0.2, 0.42, 0.52, 0.6],
    [0.33, 0.1, 0.3, 1.4],
    [0.46, 0.56, 0.4, 0.8],
    [0.58, 0.02, 0.6, 1],
    [0.7, 0.36, 0.34, 0.6],
    [0.83, 0.6, 0.36, 1.2],
    [0.94, 0.14, 0.26, 0.7],
  ]
  const body = streaks
    .map(([y, x, length, weight]) => {
      const barHeight = round(weight * thickness * 1.5)
      return `<rect x='${round(x * size)}' y='${round(y * height - barHeight / 2)}' width='${round(length * size)}' height='${barHeight}' rx='${barHeight / 2}'/>`
    })
    .join("")

  return svgTile(size, height, body)
}

/**
 * Overlapping wave scales. Every scale that reaches the tile is drawn back
 * to front inside an SVG mask, so front scales hide the rings behind them
 * and the tile repeats without seams.
 */
function seigaihaTile(size: number, thickness: number) {
  const radius = size / 2
  const height = radius
  let rings = ""

  for (let step = -2; step <= 4; step++) {
    const cy = (step * radius) / 2
    const xs = step % 2 === 0 ? [0, size] : [radius]

    for (const cx of xs) {
      rings += `<circle cx='${cx}' cy='${cy}' r='${radius}' fill='black'/>`
      for (const scale of [1, 0.78, 0.56, 0.34]) {
        rings += `<circle cx='${cx}' cy='${cy}' r='${round(radius * scale - thickness / 2)}' fill='none' stroke='white' stroke-width='${thickness}'/>`
      }
    }
  }

  return svgTile(
    size,
    height,
    `<mask id='m'>${rings}</mask><rect width='100%' height='100%' mask='url(#m)'/>`
  )
}

/** Hemp leaf: a triangle lattice with every triangle's corners joined to its center. */
function asanohaTile(size: number, thickness: number) {
  const rowHeight = (size * Math.sqrt(3)) / 2
  const point = (i: number, j: number): [number, number] => [
    i * size + (Math.abs(j) % 2 === 1 ? size / 2 : 0),
    j * rowHeight,
  ]
  let path = ""

  for (let j = -1; j <= 2; j++) {
    for (let i = -1; i <= 1; i++) {
      const odd = Math.abs(j) % 2 === 1
      const triangles = odd
        ? [
            [point(i, j), point(i + 1, j), point(i + 1, j + 1)],
            [point(i, j), point(i, j + 1), point(i + 1, j + 1)],
          ]
        : [
            [point(i, j), point(i + 1, j), point(i, j + 1)],
            [point(i + 1, j), point(i, j + 1), point(i + 1, j + 1)],
          ]

      for (const [a, b, c] of triangles) {
        const center = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3]
        path += `M${round(a[0])} ${round(a[1])}L${round(b[0])} ${round(b[1])}L${round(c[0])} ${round(c[1])}Z`
        for (const corner of [a, b, c]) {
          path += `M${round(corner[0])} ${round(corner[1])}L${round(center[0])} ${round(center[1])}`
        }
      }
    }
  }

  return svgTile(
    size,
    rowHeight * 2,
    `<path d='${path}' fill='none' stroke='black' stroke-width='${thickness}'/>`
  )
}

/** Tortoiseshell: pointy-top hexagons with an inner hexagon. */
function kikkoTile(size: number, thickness: number) {
  const width = Math.sqrt(3) * size
  const height = 3 * size
  const hexagon = (cx: number, cy: number, side: number) => {
    const half = (Math.sqrt(3) * side) / 2
    const points = [
      [cx, cy - side],
      [cx + half, cy - side / 2],
      [cx + half, cy + side / 2],
      [cx, cy + side],
      [cx - half, cy + side / 2],
      [cx - half, cy - side / 2],
    ]
    return `M${points.map(([x, y]) => `${round(x)} ${round(y)}`).join("L")}Z`
  }
  const centers = [
    [width / 2, size],
    [0, 2.5 * size],
    [width, 2.5 * size],
    [0, -0.5 * size],
    [width, -0.5 * size],
  ]
  const path = centers
    .map(([cx, cy]) => hexagon(cx, cy, size) + hexagon(cx, cy, size * 0.62))
    .join("")

  return svgTile(
    width,
    height,
    `<path d='${path}' fill='none' stroke='black' stroke-width='${thickness}'/>`
  )
}

/** Seven treasures: interlocking circles that form four-petal flowers. */
function shippoTile(size: number, thickness: number) {
  const radius = size / 2
  const centers = [
    [0, 0],
    [size, 0],
    [0, size],
    [size, size],
    [radius, radius],
  ]
  const body = centers
    .map(
      ([cx, cy]) =>
        `<circle cx='${cx}' cy='${cy}' r='${radius}'/>`
    )
    .join("")

  return svgTile(
    size,
    size,
    `<g fill='none' stroke='black' stroke-width='${thickness}'>${body}</g>`
  )
}

function sparklePath(x: number, y: number, reach: number) {
  const pinch = reach * 0.12
  return `M${x} ${y - reach}Q${x + pinch} ${y - pinch} ${x + reach} ${y}Q${x + pinch} ${y + pinch} ${x} ${y + reach}Q${x - pinch} ${y + pinch} ${x - reach} ${y}Q${x - pinch} ${y - pinch} ${x} ${y - reach}Z`
}

/** Scattered four-point stars and glints. */
function sparklesTile(size: number) {
  const stars = [
    [20, 25, 10],
    [70, 14, 6],
    [56, 60, 12],
    [14, 76, 5],
    [86, 82, 7],
  ]
  const glints = [
    [40, 40, 1.1],
    [82, 44, 0.8],
    [30, 56, 0.8],
    [64, 90, 1],
    [92, 8, 0.9],
  ]
  const body =
    `<path d='${stars.map(([x, y, reach]) => sparklePath(x, y, reach)).join("")}'/>` +
    glints.map(([x, y, r]) => `<circle cx='${x}' cy='${y}' r='${r}'/>`).join("")

  return svgTile(size, size, body, "0 0 100 100")
}

/** Notched cherry blossom petal, pointing up from its base. */
const sakuraPetal = "M0 0C-6 -5 -7 -12 -3 -16L0 -13.5L3 -16C7 -12 6 -5 0 0Z"

/** A few blossoms and drifting petals. */
function sakuraTile(size: number) {
  const blossom = (x: number, y: number, scale: number, turn: number) =>
    [0, 72, 144, 216, 288]
      .map(
        (angle) =>
          `<path transform='translate(${x} ${y}) rotate(${angle + turn}) scale(${scale})' d='${sakuraPetal}'/>`
      )
      .join("")
  const petals = [
    [76, 22, 0.8, 40],
    [66, 76, 0.7, -30],
    [18, 88, 0.6, 110],
    [92, 56, 0.55, 200],
    [44, 8, 0.5, 160],
  ]
  const body =
    blossom(28, 34, 1, 0) +
    blossom(78, 88, 0.6, 20) +
    petals
      .map(
        ([x, y, scale, angle]) =>
          `<path transform='translate(${x} ${y}) rotate(${angle}) scale(${scale})' d='${sakuraPetal}'/>`
      )
      .join("")

  return svgTile(size, size, body, "0 0 100 100")
}

/** Parallel wavy lines. Copies above and below keep crests from clipping. */
function wavesTile(size: number, thickness: number) {
  const gap = size / 4
  const amplitude = size / 6
  const wave = (y: number) =>
    `M0 ${round(y)}Q${size / 4} ${round(y - amplitude * 2)} ${size / 2} ${round(y)}T${size} ${round(y)}`
  const path = [-gap, 0, gap].map((offset) => wave(gap / 2 + offset)).join("")

  return svgTile(
    size,
    gap,
    `<path d='${path}' fill='none' stroke='black' stroke-width='${thickness * 1.5}'/>`
  )
}

/** Vertical bars of uneven width and spacing. */
function barcodeTile(size: number, thickness: number) {
  const bars = [
    [0.02, 1],
    [0.1, 2.5],
    [0.2, 1],
    [0.27, 1],
    [0.36, 3],
    [0.5, 1.2],
    [0.58, 1],
    [0.66, 2],
    [0.78, 1],
    [0.86, 2.8],
  ]
  const body = bars
    .map(
      ([x, width]) =>
        `<rect x='${round(x * size)}' width='${round(width * thickness)}' height='100%'/>`
    )
    .join("")

  return svgTile(size, size, body)
}

/** Small filled triangles in staggered rows, each turned a little. */
function trianglesTile(size: number, thickness: number) {
  const reach = round(size * 0.14 * thickness)
  const triangle = (x: number, y: number, turn: number) =>
    `<path transform='translate(${round(x)} ${round(y)}) rotate(${turn})' d='M0 ${-reach}L${round(reach * 0.87)} ${round(reach / 2)}L${round(-reach * 0.87)} ${round(reach / 2)}Z'/>`

  return svgTile(
    size,
    size,
    triangle(size / 4, size / 4, 10) + triangle((size * 3) / 4, (size * 3) / 4, -20)
  )
}

/** Outlined diamonds in staggered rows. */
function diamondsTile(size: number, thickness: number) {
  const reach = round(size * 0.16)
  const diamond = (x: number, y: number) =>
    `M${round(x)} ${round(y - reach)}L${round(x + reach)} ${round(y)}L${round(x)} ${round(y + reach)}L${round(x - reach)} ${round(y)}Z`

  return svgTile(
    size,
    size,
    `<path d='${diamond(size / 4, size / 4)}${diamond((size * 3) / 4, (size * 3) / 4)}' fill='none' stroke='black' stroke-width='${round(thickness * 1.6)}'/>`
  )
}

/** A "/" line through a square tile, with wrapped copies so it tiles seamlessly. */
function diagonalPath(size: number, offset: number) {
  return [-size, 0, size]
    .map((shift) => {
      const start = offset + shift
      return `M${round(start)} ${size}L${round(start + size)} 0`
    })
    .join("")
}

/** Rows of dots along diagonals, alternating with a faint hairline. */
function dottedDiagonalTile(size: number, thickness: number) {
  const radius = round(1.1 * thickness)
  const dots = [0, 0.25, 0.5, 0.75]
    .map((step) => `<circle cx='${round(step * size)}' cy='${round(size - step * size)}' r='${radius}'/>`)
    .join("")
  // The dot at the tile corner needs its wrapped twin.
  const corner = `<circle cx='${size}' cy='0' r='${radius}'/>`

  return svgTile(
    size,
    size,
    `${dots}${corner}<path d='${diagonalPath(size, size / 2)}' stroke='black' stroke-width='${round(thickness * 0.6)}' opacity='0.5'/>`
  )
}

/** A solid diagonal line with a dashed one between. */
function dashedDiagonalTile(size: number, thickness: number) {
  const dash = round(size * 0.18)

  return svgTile(
    size,
    size,
    `<path d='${diagonalPath(size, 0)}' stroke='black' stroke-width='${round(thickness * 1.4)}'/><path d='${diagonalPath(size, size / 2)}' stroke='black' stroke-width='${thickness}' stroke-dasharray='${dash} ${dash}' opacity='0.55'/>`
  )
}

/** Half-strength version of a color, for secondary lines. */
function faint(color: string) {
  return `color-mix(in oklch, ${color} 50%, transparent)`
}

/** An SVG tile painted in `color` through a mask, so theme vars still work. */
function maskedTile(svg: string, color: string, width: number, height: number) {
  const image = svgUrl(svg)
  const tile = `${round(width)}px ${round(height)}px`

  return {
    backgroundColor: color,
    maskImage: image,
    WebkitMaskImage: image,
    maskSize: tile,
    WebkitMaskSize: tile,
  }
}

function kindBackground(
  kind: PatternKind,
  size: number,
  thickness: number,
  color: string
): React.CSSProperties {
  const cell = `${size}px ${size}px`

  switch (kind) {
    case "dots":
      return {
        backgroundImage: `radial-gradient(circle, ${color} ${thickness}px, transparent ${thickness + 0.5}px)`,
        backgroundSize: cell,
      }
    case "grid":
      return {
        backgroundImage: `linear-gradient(${color} ${thickness}px, transparent ${thickness}px), linear-gradient(90deg, ${color} ${thickness}px, transparent ${thickness}px)`,
        backgroundSize: cell,
      }
    case "lines":
      return {
        backgroundImage: `linear-gradient(${color} ${thickness}px, transparent ${thickness}px)`,
        backgroundSize: cell,
      }
    case "diagonal":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${color} 0 ${thickness}px, transparent ${thickness}px ${size / 2}px)`,
      }
    case "checker":
      return {
        backgroundImage: `conic-gradient(${color} 25%, transparent 0 50%, ${color} 0 75%, transparent 0)`,
        backgroundSize: cell,
      }
    case "speed-lines": {
      // Two ray sets with different spacing read as hand-drawn focus lines.
      const period = 360 / (size * 4)
      const ray = round(period * 0.18 * thickness)
      const fade = "radial-gradient(circle, transparent 22%, #000 70%)"
      return {
        backgroundImage: `repeating-conic-gradient(${color} 0 ${ray}deg, transparent ${ray}deg ${round(period)}deg), repeating-conic-gradient(from ${round(period / 3)}deg, ${color} 0 ${round(ray / 2)}deg, transparent ${round(ray / 2)}deg ${round(period * 1.7)}deg)`,
        maskImage: fade,
        WebkitMaskImage: fade,
      }
    }
    case "sunburst": {
      const ray = round(360 / (size * 2))
      return {
        backgroundImage: `repeating-conic-gradient(from 0deg at 50% 110%, ${color} 0 ${ray}deg, transparent ${ray}deg ${ray * 2}deg)`,
      }
    }
    case "motion-lines":
      return maskedTile(motionLinesTile(size, thickness), color, size, size / 2)
    case "seigaiha":
      return maskedTile(seigaihaTile(size, thickness), color, size, size / 2)
    case "asanoha":
      return maskedTile(asanohaTile(size, thickness), color, size, size * Math.sqrt(3))
    case "kikko":
      return maskedTile(kikkoTile(size, thickness), color, Math.sqrt(3) * size, 3 * size)
    case "shippo":
      return maskedTile(shippoTile(size, thickness), color, size, size)
    case "sparkles":
      return maskedTile(sparklesTile(size), color, size, size)
    case "sakura":
      return maskedTile(sakuraTile(size), color, size, size)
    case "paper":
      return {
        backgroundImage: `radial-gradient(${color} ${round(0.7 * thickness)}px, transparent ${round(0.8 * thickness)}px)`,
        backgroundSize: cell,
      }
    case "newsprint":
      return {
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0 ${size - thickness}px, ${color} ${size - thickness}px ${size}px)`,
      }
    case "linen": {
      const weft = round(size * (4 / 3))
      return {
        backgroundImage: `repeating-linear-gradient(0deg, ${color} 0 ${thickness}px, transparent ${thickness}px ${size}px), repeating-linear-gradient(90deg, ${faint(color)} 0 ${thickness}px, transparent ${thickness}px ${weft}px)`,
      }
    }
    case "woodgrain": {
      // Uneven grain from a slightly tilted line set over faint cross rays.
      const line = round(size / 3)
      return {
        backgroundImage: `repeating-linear-gradient(92deg, transparent 0 ${line}px, ${color} ${line}px ${line + thickness}px, transparent ${line + thickness}px ${size}px), repeating-linear-gradient(0deg, color-mix(in oklch, ${color} 25%, transparent) 0 1px, transparent 1px ${round(size * 0.67)}px)`,
      }
    }
    case "pegboard":
      // Dark hole with a lighter rim, like drilled board.
      return {
        backgroundImage: `radial-gradient(circle, ${color} ${round(1.5 * thickness)}px, color-mix(in oklch, ${color}, white 55%) ${round(2 * thickness)}px, transparent ${round(3 * thickness)}px)`,
        backgroundSize: cell,
      }
    case "blueprint": {
      const major = size * 5
      const minor = faint(color)
      return {
        backgroundImage: `linear-gradient(${color} ${thickness}px, transparent ${thickness}px), linear-gradient(90deg, ${color} ${thickness}px, transparent ${thickness}px), linear-gradient(${minor} ${thickness}px, transparent ${thickness}px), linear-gradient(90deg, ${minor} ${thickness}px, transparent ${thickness}px)`,
        backgroundSize: `${major}px ${major}px, ${major}px ${major}px, ${cell}, ${cell}`,
      }
    }
    case "fold": {
      // Cross-folded sheet: a shadowed crease with a highlight down each fold.
      const crease = `transparent 48.8%, ${faint(color)} 49.6%, color-mix(in oklch, white 60%, transparent) 50%, ${color} 50.4%, transparent 51.2%`
      return {
        backgroundImage: `linear-gradient(90deg, ${crease}), linear-gradient(0deg, ${crease})`,
      }
    }
    case "waves":
      return maskedTile(wavesTile(size, thickness), color, size, size / 4)
    case "pinstripe":
      return {
        backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 ${thickness}px, transparent ${thickness}px ${size}px)`,
      }
    case "barcode":
      return maskedTile(barcodeTile(size, thickness), color, size, size)
    case "polka": {
      // Two offset dot grids make the staggered rows.
      const radius = round(size * 0.2 * thickness)
      const dot = `radial-gradient(circle, ${color} ${radius}px, transparent ${radius + 0.5}px)`
      return {
        backgroundImage: `${dot}, ${dot}`,
        backgroundSize: `${cell}, ${cell}`,
        backgroundPosition: `0 0, ${size / 2}px ${size / 2}px`,
      }
    }
    case "triangles":
      return maskedTile(trianglesTile(size, thickness), color, size, size)
    case "diamonds":
      return maskedTile(diamondsTile(size, thickness), color, size, size)
    case "dotted-diagonal":
      return maskedTile(dottedDiagonalTile(size, thickness), color, size, size)
    case "double-diagonal": {
      const line = round(thickness * 1.5)
      return {
        backgroundImage: `repeating-linear-gradient(-45deg, ${color} 0 ${line}px, transparent ${line}px ${line * 3}px, ${color} ${line * 3}px ${line * 4}px, transparent ${line * 4}px ${size}px)`,
      }
    }
    case "dashed-diagonal":
      return maskedTile(dashedDiagonalTile(size, thickness), color, size, size)
    case "band": {
      // A wide soft band with a thin line riding beside it.
      const band = round(size * 0.4)
      const line = band + round(size * 0.15)
      return {
        backgroundImage: `repeating-linear-gradient(-45deg, ${faint(color)} 0 ${band}px, transparent ${band}px ${line}px, ${color} ${line}px ${line + thickness}px, transparent ${line + thickness}px ${size}px)`,
      }
    }
  }
}

type PatternLook = Pick<PatternProps, "kind" | "size" | "thickness" | "color">

/**
 * Background for a pattern look, for merging into a Surface's backgrounds.
 * Tile kinds paint through a mask, so they come back with `maskImage` and
 * can't be merged.
 */
function patternBackground({
  kind = "dots",
  size,
  thickness = 1,
  color = "color-mix(in oklch, var(--foreground) 18%, transparent)",
}: PatternLook): React.CSSProperties {
  return kindBackground(kind, size ?? defaultPatternSizes[kind], thickness, color)
}

/**
 * Repeating shapes. Basic: dots, grid, lines, diagonal, checker. Graphic:
 * waves, pinstripe, barcode, polka, triangles, diamonds, dotted, double and
 * dashed diagonals, band. Decorative:
 * speed lines, motion lines, sunburst, seigaiha, asanoha, kikko, shippo,
 * sparkles, sakura. Material: paper, newsprint, linen, woodgrain, pegboard,
 * blueprint, fold.
 */
function Pattern({ kind = "dots", size, thickness, color, ...layer }: PatternProps) {
  const props = layerProps(layer, "pattern")

  return (
    <div
      {...props}
      data-kind={kind}
      style={{
        ...patternBackground({ kind, size, thickness, color }),
        ...props.style,
      }}
    />
  )
}

export {
  Pattern,
  patternBackground,
  decorativePatternKinds,
  basicPatternKinds,
  graphicPatternKinds,
  materialPatternKinds,
  patternKinds,
  type PatternKind,
  type PatternProps,
}
