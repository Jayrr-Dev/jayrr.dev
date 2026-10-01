"use client"

import * as React from "react"
import { DicesIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

/**
 * Real polyhedral dice that hop, tumble in 3D and settle with the rolled
 * face up. Values are picked before the roll starts, so `onRoll` always
 * matches what lands.
 *
 * <Dice count={2} onRoll={(values, total) => move(total)} />
 * <Dice dice={[20]} modifier={5} />                  // a d20 + 5
 * <Dice dice={[8, 8, { sides: 6, color: "var(--destructive)" }]} />
 *
 * Every die is a true solid: d4 tetrahedron, d6 cube with pips, d8
 * octahedron, d10 pentagonal trapezohedron (0 to 9), d12 dodecahedron and
 * d20 icosahedron, lit from the top left. Opposite faces add up the way they
 * do on real dice. d100 is a percentile pair: a tens die (00 to 90) and a
 * ones die. `holdable` lets people keep dice out of the next roll (Yahtzee
 * style). Reduced motion shows the result straight away.
 */

type DiceSides = 4 | 6 | 8 | 10 | 12 | 20 | 100
type DiceSize = "sm" | "default" | "lg"
type DiceTone = "default" | "inverse"

/** A die by its sides, or with its own colours. */
type DieSpec =
  | DiceSides
  | {
      sides: DiceSides
      /** Body colour, any CSS color (e.g. "var(--chart-2)"). */
      color?: string
      /** Number and pip colour. */
      ink?: string
    }

type DiceProps = Omit<React.ComponentProps<"div">, "children" | "color"> & {
  /** How many dice. Ignored when `dice`, `values` or `defaultValues` is set. */
  count?: number
  /** Faces on every die. Use `dice` to mix kinds. */
  sides?: DiceSides
  /** One entry per die, e.g. [20, 6, 6], or objects with their own colours. */
  dice?: DieSpec[]
  /** Controlled faces, 1 to the die's sides each. */
  values?: number[]
  defaultValues?: number[]
  onValuesChange?: (values: number[]) => void
  /** Added to the total, e.g. 3 for "+3". */
  modifier?: number
  /** Called when a roll lands, with every die's face and the total (with modifier). */
  onRoll?: (values: number[], total: number) => void
  /** Click a die to hold it; held dice sit out the next roll. */
  holdable?: boolean
  /** Held dice, by index. Controlled. */
  held?: number[]
  onHeldChange?: (held: number[]) => void
  /** Roll button under the dice, or none (roll by clicking a die). */
  rollButton?: "below" | "none"
  rollLabel?: React.ReactNode
  /** Shows the total when there is more than one die or a modifier. */
  showTotal?: boolean
  /** Writes the kind ("d20") under each die. On by default for non-d6 dice. */
  showKind?: boolean
  size?: DiceSize
  tone?: DiceTone
  /** Body colour for every die without its own. */
  color?: string
  /** Number and pip colour for every die without its own. */
  ink?: string
  /** Seconds a roll takes. */
  duration?: number
  disabled?: boolean
  /**
   * row: dice in a line that roll in place. tray: a felt tray where people
   * grab, drag and throw dice that slide, bounce off each other and settle
   * on whichever face ends up on top.
   */
  variant?: "row" | "tray"
}

const DICE_SIZES: Record<DiceSize, string> = {
  sm: "2.5rem",
  default: "3.75rem",
  lg: "5.5rem",
}

const TONES: Record<DiceTone, { color: string; ink: string }> = {
  default: { color: "var(--foreground)", ink: "var(--background)" },
  inverse: { color: "var(--card)", ink: "var(--foreground)" },
}

/**
 * How large each solid draws, so a d4 and a d6 look as big as a d20 the way
 * real dice do, rather than all sharing one corner radius.
 */
const DRAW_SCALE: Record<Exclude<DiceSides, 100>, number> = {
  4: 1.2,
  6: 1.32,
  8: 1.12,
  10: 1.05,
  12: 1.02,
  20: 1,
}

/**
 * The die's turn on the table about its top face. Cubes sit well round so
 * three faces show; the rest only a little, so their number stays readable.
 */
function yawFor(sides: number, random: number) {
  return sides === 6 ? 0.55 + (random - 0.5) * 0.4 : (random - 0.5) * 0.5
}

// The die hops while it tumbles; its shadow shrinks as it leaves the table.
const diceKeyframes = `
@keyframes dice-hop{0%,100%{transform:translateY(0)}35%{transform:translateY(calc(var(--dice-size) * -0.6))}70%{transform:translateY(calc(var(--dice-size) * -0.12))}}
@keyframes dice-shadow{0%,100%{transform:scale(1);opacity:1}35%{transform:scale(.55);opacity:.35}}
[data-slot=dice-die][data-rolling] [data-dice-hop]{animation:dice-hop var(--dice-duration) ease-out}
[data-slot=dice-die][data-rolling] [data-dice-shadow]{animation:dice-shadow var(--dice-duration) ease-out}
@media (prefers-reduced-motion:reduce){[data-dice-hop],[data-dice-shadow]{animation:none!important}}
`

/* ------------------------------------------------------------------------ */
/* Vector and quaternion maths. Screen frame: x right, y down, z to viewer. */
/* ------------------------------------------------------------------------ */

type V3 = [number, number, number]
type Quat = [number, number, number, number]

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const times = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const unit = (a: V3): V3 => times(a, 1 / Math.hypot(a[0], a[1], a[2]))

function multiplies(a: Quat, b: Quat): Quat {
  return [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ]
}

function aroundAxis(axis: V3, radians: number): Quat {
  const [x, y, z] = unit(axis)
  const half = Math.sin(radians / 2)

  return [Math.cos(radians / 2), x * half, y * half, z * half]
}

function rotates(q: Quat, v: V3): V3 {
  const [w, x, y, z] = q
  const t = times(cross([x, y, z], v), 2)

  return add(add(v, times(t, w)), cross([x, y, z], t))
}

/** The rotation whose matrix rows are `a`, `b`, `c`. */
function fromRows(a: V3, b: V3, c: V3): Quat {
  const trace = a[0] + b[1] + c[2]

  if (trace > 0) {
    const s = Math.sqrt(trace + 1) * 2
    return [s / 4, (c[1] - b[2]) / s, (a[2] - c[0]) / s, (b[0] - a[1]) / s]
  }
  if (a[0] > b[1] && a[0] > c[2]) {
    const s = Math.sqrt(1 + a[0] - b[1] - c[2]) * 2
    return [(c[1] - b[2]) / s, s / 4, (a[1] + b[0]) / s, (a[2] + c[0]) / s]
  }
  if (b[1] > c[2]) {
    const s = Math.sqrt(1 + b[1] - a[0] - c[2]) * 2
    return [(a[2] - c[0]) / s, (a[1] + b[0]) / s, s / 4, (b[2] + c[1]) / s]
  }
  const s = Math.sqrt(1 + c[2] - a[0] - b[1]) * 2
  return [(b[0] - a[1]) / s, (a[2] + c[0]) / s, (b[2] + c[1]) / s, s / 4]
}

function slerps(a: Quat, b: Quat, t: number): Quat {
  let cos = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
  const end: Quat = cos < 0 ? [-b[0], -b[1], -b[2], -b[3]] : b
  cos = Math.abs(cos)

  if (cos > 0.9995) {
    const mixed = a.map((value, i) => value + (end[i] - value) * t) as Quat
    const length = Math.hypot(...mixed)
    return mixed.map((value) => value / length) as Quat
  }

  const angle = Math.acos(cos)
  const wa = Math.sin((1 - t) * angle) / Math.sin(angle)
  const wb = Math.sin(t * angle) / Math.sin(angle)

  return a.map((value, i) => value * wa + end[i] * wb) as Quat
}

/* ------------------------------------------------------------------------ */
/* The solids.                                                              */
/* ------------------------------------------------------------------------ */

type Face = {
  corners: number[]
  normal: V3
  centre: V3
  /** Which way is up for the number or pips. */
  up: V3
  right: V3
  /** Room round the centre, for sizing the number. */
  inradius: number
  /** The number this face shows, 1 to the die's sides. */
  value: number
}

type Solid = { vertices: V3[]; faces: Face[]; sides: number }

const PHI = (1 + Math.sqrt(5)) / 2

/** Corners of each face: the vertices furthest along its normal, in order. */
function facesFrom(vertices: V3[], normals: V3[]) {
  return normals.map((direction) => {
    const normal = unit(direction)
    const reach = vertices.map((vertex) => dot(vertex, normal))
    const furthest = Math.max(...reach)
    const corners = vertices
      .map((_, index) => index)
      .filter((index) => furthest - reach[index] < 1e-6)
    const centre = times(
      corners.reduce<V3>((sum, index) => add(sum, vertices[index]), [0, 0, 0]),
      1 / corners.length
    )
    const across = unit(sub(vertices[corners[0]], centre))
    const along = cross(normal, across)

    // Anticlockwise seen from outside.
    corners.sort((a, b) => {
      const pa = sub(vertices[a], centre)
      const pb = sub(vertices[b], centre)
      return (
        Math.atan2(dot(pa, along), dot(pa, across)) -
        Math.atan2(dot(pb, along), dot(pb, across))
      )
    })

    return corners
  })
}

function buildsSolid(
  vertices: V3[],
  faceCorners: number[][],
  labelUp: "corner" | "edge"
): Solid {
  const faces = faceCorners.map((corners) => {
    const points = corners.map((index) => vertices[index])
    const centre = times(
      points.reduce<V3>((sum, point) => add(sum, point), [0, 0, 0]),
      1 / points.length
    )
    let normal = unit(
      cross(sub(points[1], points[0]), sub(points[2], points[0]))
    )
    if (dot(normal, centre) < 0) {
      normal = times(normal, -1)
    }
    const aim =
      labelUp === "corner" ? points[0] : times(add(points[0], points[1]), 0.5)
    const upRaw = sub(aim, centre)
    const up = unit(sub(upRaw, times(normal, dot(upRaw, normal))))
    // Screen right is down x normal, so labels are never mirrored.
    const right = cross(times(up, -1), normal)
    const inradius = Math.min(
      ...points.map((point, i) => {
        const next = points[(i + 1) % points.length]
        const edge = unit(sub(next, point))
        const offset = sub(centre, point)
        return Math.hypot(...sub(offset, times(edge, dot(offset, edge))))
      })
    )

    return { corners, normal, centre, up, right, inradius, value: 0 }
  })

  // Opposite faces add up to sides + 1, like real dice.
  const sides = faces.length
  const done = new Set<number>()
  let next = 1

  faces.forEach((face, index) => {
    if (done.has(index)) {
      return
    }
    const opposite = faces.findIndex(
      (other, j) =>
        j !== index && !done.has(j) && dot(other.normal, face.normal) < -0.999
    )
    face.value = next
    done.add(index)
    if (opposite >= 0) {
      faces[opposite].value = sides + 1 - next
      done.add(opposite)
    }
    next += 1
  })

  // A tetrahedron has no opposite faces; number it straight through.
  if (faces.some((face) => face.value > sides)) {
    faces.forEach((face, index) => {
      face.value = index + 1
    })
  }

  // Fit inside a unit sphere.
  const reach = Math.max(...vertices.map((vertex) => Math.hypot(...vertex)))
  const scaled = vertices.map((vertex) => times(vertex, 1 / reach))

  return {
    vertices: scaled,
    sides,
    faces: faces.map((face) => ({
      ...face,
      centre: times(face.centre, 1 / reach),
      inradius: face.inradius / reach,
    })),
  }
}

function signs(): V3[] {
  const out: V3[] = []
  for (const x of [-1, 1]) {
    for (const y of [-1, 1]) {
      for (const z of [-1, 1]) {
        out.push([x, y, z])
      }
    }
  }
  return out
}

function icosahedronVertices(): V3[] {
  const out: V3[] = []
  for (const a of [-1, 1]) {
    for (const b of [-PHI, PHI]) {
      out.push([0, a, b], [a, b, 0], [b, 0, a])
    }
  }
  return out
}

function dodecahedronVertices(): V3[] {
  const out: V3[] = signs()
  // The icosahedron's dual: its face centres are the icosahedron's corners.
  for (const a of [-PHI, PHI]) {
    for (const b of [-1 / PHI, 1 / PHI]) {
      out.push([0, a, b], [a, b, 0], [b, 0, a])
    }
  }
  return out
}

function makesTrapezohedron(): Solid {
  // A pentagonal trapezohedron: two apexes and two staggered rings of five.
  // The ring height keeps each kite flat.
  const apex = 1.15
  const ring =
    (apex * (1 - Math.cos(Math.PI / 5))) / (1 + Math.cos(Math.PI / 5))
  const vertices: V3[] = [
    [0, -apex, 0],
    [0, apex, 0],
  ]
  for (let k = 0; k < 5; k++) {
    const a = (k * 2 * Math.PI) / 5
    const b = a + Math.PI / 5
    vertices.push([Math.cos(a), -ring, Math.sin(a)])
    vertices.push([Math.cos(b), ring, Math.sin(b)])
  }
  const upper = (k: number) => 2 + 2 * (k % 5)
  const lower = (k: number) => 3 + 2 * (k % 5)
  const faces: number[][] = []
  for (let k = 0; k < 5; k++) {
    faces.push([0, upper(k), lower(k), upper(k + 1)])
    faces.push([1, lower(k + 1), upper(k + 1), lower(k)])
  }

  return buildsSolid(vertices, faces, "corner")
}

const SOLIDS: Record<Exclude<DiceSides, 100>, Solid> = (() => {
  const axes: V3[] = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ]
  const tetra: V3[] = [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ]
  const ico = icosahedronVertices()
  const dodeca = dodecahedronVertices()

  return {
    4: buildsSolid(
      tetra,
      facesFrom(
        tetra,
        tetra.map((vertex) => times(vertex, -1))
      ),
      "corner"
    ),
    6: buildsSolid(signs(), facesFrom(signs(), axes), "edge"),
    8: buildsSolid(axes, facesFrom(axes, signs()), "corner"),
    10: makesTrapezohedron(),
    12: buildsSolid(dodeca, facesFrom(dodeca, ico), "corner"),
    20: buildsSolid(ico, facesFrom(ico, dodeca), "corner"),
  }
})()

/** Which of the nine pip spots (3 x 3, row by row) each face fills. */
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

// The rolled face ends up facing up and toward the viewer, as if resting on
// a table seen from a little above.
const REST_TILT = aroundAxis([1, 0, 0], (33 * Math.PI) / 180)
const LIGHT = unit([-0.45, -0.7, 0.55])

/** The orientation that rests a face on top, twisted by `yaw` radians. */
function restingOn(face: Face, yaw: number): Quat {
  const down = times(face.up, -1)
  const align = fromRows(face.right, down, face.normal)
  const twist = aroundAxis([0, 0, 1], yaw)

  return multiplies(REST_TILT, multiplies(twist, align))
}

function rounds(value: number) {
  return Math.round(value * 100) / 100
}

function shades(base: string, light: number) {
  // Lit faces lean toward white, faces turned away toward black.
  const amount = light - 0.45

  return amount >= 0
    ? `color-mix(in oklab, ${base}, white ${Math.round(amount * 45)}%)`
    : `color-mix(in oklab, ${base}, black ${Math.round(-amount * 70)}%)`
}

type Labels = (value: number) => string

const plainLabels: Labels = (value) => String(value)
/** d10 faces read 0 to 9, with 10 shown as 0. */
const onesLabels: Labels = (value) => String(value % 10)
/** The percentile tens die reads 00 to 90. */
const tensLabels: Labels = (value) => `${value % 10}0`

/** One solid die, drawn in SVG, tumbling to its target face. */
function SolidDie({
  sides,
  value,
  roll,
  seconds,
  delay,
  color,
  ink,
  held,
  labels = plainLabels,
}: {
  sides: Exclude<DiceSides, 100>
  value: number
  /** Bumped for every roll this die takes part in. */
  roll: number
  seconds: number
  delay: number
  color: string
  ink: string
  held: boolean
  labels?: Labels
}) {
  const solid = SOLIDS[sides]
  const face =
    solid.faces.find((candidate) => candidate.value === value) ?? solid.faces[0]
  const [orientation, setOrientation] = React.useState(() =>
    restingOn(face, yawFor(sides, 0.5))
  )
  const current = React.useRef(orientation)
  const frame = React.useRef<number | undefined>(undefined)
  // What the die last settled for, so the first render doesn't tumble.
  const settled = React.useRef({ roll, face })

  // Tumble from wherever the die is to rest on the new face.
  React.useEffect(() => {
    if (settled.current.roll === roll && settled.current.face === face) {
      return
    }
    settled.current = { roll, face }

    const target = restingOn(face, yawFor(sides, Math.random()))
    const start = current.current
    const axis = unit([
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5,
    ])
    // Whole turns about the axis vanish at both ends, so the tumble starts
    // and stops without a jump.
    const spin = (2 + Math.floor(Math.random() * 2)) * 2 * Math.PI
    let began: number | undefined

    function steps(now: number) {
      began ??= now + delay
      const elapsed = Math.max(0, now - began)
      const t = seconds === 0 ? 1 : Math.min(1, elapsed / (seconds * 1000))
      const eased = 1 - (1 - t) ** 3
      const next =
        t >= 1
          ? target
          : multiplies(
              aroundAxis(axis, spin * (1 - eased)),
              slerps(start, target, eased)
            )

      current.current = next
      setOrientation(next)
      if (t < 1) {
        frame.current = window.requestAnimationFrame(steps)
      }
    }

    frame.current = window.requestAnimationFrame(steps)

    return () => window.cancelAnimationFrame(frame.current ?? 0)
  }, [roll, face, seconds, delay, sides])

  return (
    <DieGraphic
      sides={sides}
      orientation={orientation}
      color={color}
      ink={ink}
      held={held}
      labels={labels}
    />
  )
}

/** A solid die at a given orientation, lit and numbered, in SVG. */
function DieGraphic({
  sides,
  orientation,
  color,
  ink,
  held = false,
  labels = plainLabels,
}: {
  sides: Exclude<DiceSides, 100>
  orientation: Quat
  color: string
  ink: string
  held?: boolean
  labels?: Labels
}) {
  const solid = SOLIDS[sides]
  const turned = solid.vertices.map((vertex) => rotates(orientation, vertex))
  const scale = 40 * DRAW_SCALE[sides]
  const toScreen = (point: V3) =>
    [rounds(50 + point[0] * scale), rounds(50 + point[1] * scale)] as const
  const edge = held ? "var(--ring)" : `color-mix(in oklab, ${color}, black 55%)`

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className="size-full overflow-visible"
    >
      {solid.faces.map((solidFace, index) => {
        const normal = rotates(orientation, solidFace.normal)

        // Faces turned away are hidden behind the ones in front.
        if (normal[2] <= 0.001) {
          return null
        }

        const points = solidFace.corners
          .map((corner) => toScreen(turned[corner]).join(","))
          .join(" ")
        const light = Math.max(0, dot(normal, LIGHT))
        const centre = toScreen(rotates(orientation, solidFace.centre))
        const right = rotates(orientation, solidFace.right)
        const down = rotates(orientation, times(solidFace.up, -1))
        // Face-local units (a tenth of the solid's radius) onto the screen.
        const k = scale / 10
        const place = [
          right[0] * k,
          right[1] * k,
          down[0] * k,
          down[1] * k,
          centre[0],
          centre[1],
        ]
          .map(rounds)
          .join(" ")
        const label = labels(solidFace.value)
        const fontSize = rounds(
          solidFace.inradius * 10 * (label.length > 1 ? 0.95 : 1.25)
        )
        const ambiguous =
          sides >= 8 &&
          labels === plainLabels &&
          (label === "6" || label === "9")

        return (
          <g key={index}>
            <polygon
              points={points}
              strokeWidth={held ? 2 : 1}
              strokeLinejoin="round"
              style={{ fill: shades(color, light), stroke: edge }}
            />
            <g
              transform={`matrix(${place})`}
              style={{
                fill: ink,
                opacity: rounds(
                  Math.min(1, Math.max(0, (normal[2] - 0.2) / 0.3))
                ),
              }}
            >
              {sides === 6 ? (
                PIPS[solidFace.value].map((spot) => (
                  <circle
                    key={spot}
                    cx={((spot % 3) - 1) * 3.2}
                    cy={(Math.floor(spot / 3) - 1) * 3.2}
                    r={1.15}
                  />
                ))
              ) : (
                <>
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={fontSize}
                    fontWeight={800}
                  >
                    {label}
                  </text>
                  {ambiguous ? (
                    <rect
                      x={-fontSize * 0.25}
                      y={fontSize * 0.5}
                      width={fontSize * 0.5}
                      height={fontSize * 0.08}
                      rx={fontSize * 0.04}
                    />
                  ) : null}
                </>
              )}
            </g>
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/* The tray: grab, drag and throw dice that slide, bounce and settle.       */
/* ------------------------------------------------------------------------ */

/** Pixel size of each die size, matching DICE_SIZES at a 16px root. */
const DICE_PIXELS: Record<DiceSize, number> = { sm: 40, default: 60, lg: 88 }

/** The direction a resting top face points, in the screen frame. */
const REST_UP = rotates(REST_TILT, [0, 0, 1])

const conjugate = (q: Quat): Quat => [q[0], -q[1], -q[2], -q[3]]

type TrayBody = {
  /** Centre, as a share of the tray's width and height. */
  fx: number
  fy: number
  /** Velocity in pixels a second. */
  vx: number
  vy: number
  /** Orientation; a d100 has a second die (the ones) in `q2`. */
  q: Quat
  q2: Quat
  mode: "idle" | "held" | "moving" | "settling"
  /** When it started moving, so no throw can roll on forever. */
  since?: number
  settleFrom?: [Quat, Quat]
  settleTo?: [Quat, Quat]
  settleStart?: number
  /** Where the pointer grabbed it, relative to its centre, in pixels. */
  grab?: [number, number]
  samples?: { x: number; y: number; t: number }[]
}

type TrayView = { fx: number; fy: number; q: Quat; q2: Quat; lifted: boolean }

type TrayHandle = { throwsAll: () => void }

/** Which face is closest to up, and the resting turn that keeps its twist. */
function settlesOn(sides: Exclude<DiceSides, 100>, q: Quat) {
  const solid = SOLIDS[sides]
  let best = solid.faces[0]
  let reach = -Infinity

  for (const face of solid.faces) {
    const up = dot(rotates(q, face.normal), REST_UP)
    if (up > reach) {
      reach = up
      best = face
    }
  }

  // Keep the die's current twist on the table so it doesn't snap round.
  const right = rotates(conjugate(REST_TILT), rotates(q, best.right))
  const yaw = Math.atan2(right[1], right[0])

  return { value: best.value, rest: restingOn(best, yaw) }
}

function randomTurn(): Quat {
  return aroundAxis(
    [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
    Math.random() * Math.PI * 2
  )
}

function DiceTray({
  ref,
  kinds,
  values,
  colors,
  inks,
  size,
  disabled,
  onMotionStart,
  onSettle,
}: {
  ref?: React.Ref<TrayHandle>
  kinds: DiceSides[]
  values: number[]
  colors: string[]
  inks: string[]
  size: DiceSize
  disabled: boolean
  onMotionStart: () => void
  /** Every die is still: the faces now showing. */
  onSettle: (values: number[]) => void
}) {
  const trayRef = React.useRef<HTMLDivElement>(null)
  const px = DICE_PIXELS[size]

  const bodiesRef = React.useRef<TrayBody[] | null>(null)
  const valuesRef = React.useRef(values)
  const frameRef = React.useRef<number | undefined>(undefined)
  const lastRef = React.useRef<number | undefined>(undefined)
  const pendingRef = React.useRef(false)

  /** Where each die starts: in a row across the middle, resting on its value. */
  const columns = Math.min(kinds.length, 4) || 1
  const rows = Math.ceil(kinds.length / columns)
  const laysOut = () =>
    kinds.map((kind, index) => {
      const value = values[index] ?? 1
      const sides = kind === 100 ? 10 : kind
      const tens = kind === 100 ? Math.floor((value % 100) / 10) || 10 : value
      const ones = value % 10 || 10
      const face = (die: Exclude<DiceSides, 100>, v: number) =>
        SOLIDS[die].faces.find((candidate) => candidate.value === v) ??
        SOLIDS[die].faces[0]

      return {
        // A grid of up to four across, so a handful never starts piled up.
        fx: ((index % columns) + 1) / (columns + 1),
        fy: (Math.floor(index / columns) + 1) / (rows + 1),
        q: restingOn(face(sides, tens), yawFor(sides, 0.5)),
        q2: restingOn(face(10, ones), yawFor(10, 0.3)),
        lifted: false,
      }
    })
  const setKey = kinds.join(",")
  const [view, setView] = React.useState<TrayView[]>(laysOut)
  const [layoutKey, setLayoutKey] = React.useState(setKey)
  const bodiesKeyRef = React.useRef("")
  // The animation loop outlives renders, so it reads callbacks from here.
  const latest = React.useRef({ onSettle, onMotionStart })

  React.useEffect(() => {
    latest.current = { onSettle, onMotionStart }
  })

  // A new set of dice starts a new layout; rolls keep their places.
  if (layoutKey !== setKey) {
    setLayoutKey(setKey)
    setView(laysOut())
  }

  function bodies() {
    if (!bodiesRef.current || bodiesKeyRef.current !== setKey) {
      bodiesKeyRef.current = setKey
      bodiesRef.current = view.map((die) => ({
        fx: die.fx,
        fy: die.fy,
        vx: 0,
        vy: 0,
        q: die.q,
        q2: die.q2,
        mode: "idle" as const,
      }))
    }
    return bodiesRef.current
  }

  /** Radius in pixels; a percentile pair is wider. */
  const radiusOf = (index: number) =>
    kinds[index] === 100 ? px * 0.8 : px * 0.5

  function publishes(list: TrayBody[]) {
    setView(
      list.map((body) => ({
        fx: body.fx,
        fy: body.fy,
        q: body.q,
        q2: body.q2,
        lifted: body.mode === "held",
      }))
    )
  }

  function steps(now: number) {
    const tray = trayRef.current
    const list = bodies()

    if (!tray) {
      return
    }

    const width = tray.clientWidth
    const height = tray.clientHeight
    const dt = Math.min(0.033, (now - (lastRef.current ?? now) || 16) / 1000)
    lastRef.current = now

    list.forEach((body, index) => {
      const r = radiusOf(index)
      const kind = kinds[index]

      if (body.mode === "moving") {
        let x = body.fx * width + body.vx * dt
        let y = body.fy * height + body.vy * dt

        // Felt drags harder the faster the die slides.
        const speed = Math.hypot(body.vx, body.vy)
        const slowed = Math.max(0, speed - (speed * 2.1 + 160) * dt)
        const keep = speed > 0 ? slowed / speed : 0
        body.vx *= keep
        body.vy *= keep

        // Bounce off the walls, losing some speed.
        if (x < r) {
          x = r
          body.vx = Math.abs(body.vx) * 0.55
        } else if (x > width - r) {
          x = width - r
          body.vx = -Math.abs(body.vx) * 0.55
        }
        if (y < r) {
          y = r
          body.vy = Math.abs(body.vy) * 0.55
        } else if (y > height - r) {
          y = height - r
          body.vy = -Math.abs(body.vy) * 0.55
        }

        body.fx = x / width
        body.fy = y / height

        // Rolling: turn about the axis across the direction of travel.
        if (slowed > 1) {
          const axis: V3 = [-body.vy, body.vx, 0]
          const angle = (slowed * dt) / (r * 0.9)
          body.q = multiplies(aroundAxis(axis, angle), body.q)
          body.q2 = multiplies(aroundAxis(axis, angle * 1.15), body.q2)
        }

        // Slow enough: tip onto whichever face is nearest up.
        if (slowed < 70 || now - (body.since ?? now) > 4500) {
          const main = settlesOn(kind === 100 ? 10 : kind, body.q)
          const second = settlesOn(10, body.q2)
          body.mode = "settling"
          body.settleFrom = [body.q, body.q2]
          body.settleTo = [main.rest, second.rest]
          body.settleStart = now
          valuesRef.current = valuesRef.current.map((value, i) => {
            if (i !== index) {
              return value
            }
            if (kind !== 100) {
              return main.value
            }
            // Percentile: tens face 00–90 plus the ones face, 00 + 0 = 100.
            const total = (main.value % 10) * 10 + (second.value % 10)
            return total === 0 ? 100 : total
          })
        }
      } else if (body.mode === "settling" && body.settleFrom && body.settleTo) {
        const t = Math.min(1, (now - (body.settleStart ?? now)) / 320)
        const eased = 1 - (1 - t) ** 3
        body.q = slerps(body.settleFrom[0], body.settleTo[0], eased)
        body.q2 = slerps(body.settleFrom[1], body.settleTo[1], eased)
        body.vx = 0
        body.vy = 0
        if (t >= 1) {
          body.mode = "idle"
        }
      }
    })

    // Dice knock into each other; a still die that is hit starts rolling.
    for (let a = 0; a < list.length; a++) {
      for (let b = a + 1; b < list.length; b++) {
        const one = list[a]
        const two = list[b]
        if (one.mode === "held" || two.mode === "held") {
          continue
        }
        const dx = (two.fx - one.fx) * width
        const dy = (two.fy - one.fy) * height
        const gap = Math.hypot(dx, dy)
        const reach = radiusOf(a) + radiusOf(b)
        if (gap === 0 || gap >= reach) {
          continue
        }
        const nx = dx / gap
        const ny = dy / gap
        const push = (reach - gap) / 2
        one.fx -= (nx * push) / width
        one.fy -= (ny * push) / height
        two.fx += (nx * push) / width
        two.fy += (ny * push) / height
        const closing = (one.vx - two.vx) * nx + (one.vy - two.vy) * ny
        if (closing > 0) {
          const impulse = closing * 0.85
          one.vx -= impulse * nx
          one.vy -= impulse * ny
          two.vx += impulse * nx
          two.vy += impulse * ny
          for (const body of [one, two]) {
            if (body.mode !== "moving" && Math.hypot(body.vx, body.vy) > 70) {
              body.mode = "moving"
              body.since = now
            }
          }
        }
      }
    }

    publishes(list)

    const busy = list.some((body) => body.mode !== "idle")
    if (busy) {
      frameRef.current = window.requestAnimationFrame(steps)
    } else {
      frameRef.current = undefined
      lastRef.current = undefined
      if (pendingRef.current) {
        pendingRef.current = false
        latest.current.onSettle([...valuesRef.current])
      }
    }
  }

  function runs() {
    if (frameRef.current === undefined) {
      lastRef.current = undefined
      frameRef.current = window.requestAnimationFrame(steps)
    }
  }

  // Stop the loop on unmount, and forget it. If the effect runs again (a
  // remount or hot reload mid-throw), pick up any dice still in motion.
  React.useEffect(() => {
    if (bodiesRef.current?.some((body) => body.mode !== "idle")) {
      runs()
    }

    return () => {
      window.cancelAnimationFrame(frameRef.current ?? 0)
      frameRef.current = undefined
    }
    // Mount and unmount only; runs reads everything it needs from refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, [])

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }

  /** Lands every die at once, for reduced motion. */
  function landsNow(list: TrayBody[]) {
    list.forEach((body, index) => {
      const kind = kinds[index]
      body.q = randomTurn()
      body.q2 = randomTurn()
      const main = settlesOn(kind === 100 ? 10 : kind, body.q)
      const second = settlesOn(10, body.q2)
      body.q = main.rest
      body.q2 = second.rest
      body.mode = "idle"
      valuesRef.current[index] =
        kind === 100
          ? (main.value % 10) * 10 + (second.value % 10) || 100
          : main.value
    })
    publishes(list)
    latest.current.onSettle([...valuesRef.current])
  }

  React.useImperativeHandle(ref, () => ({
    throwsAll() {
      const tray = trayRef.current
      const list = bodies()
      if (!tray || disabled) {
        return
      }

      valuesRef.current = [...values]
      latest.current.onMotionStart()
      if (reduced()) {
        landsNow(list)
        return
      }

      // Toss every die in from the near edge, fanning out.
      list.forEach((body, index) => {
        body.fx = (index + 1) / (list.length + 1)
        body.fy = 0.86
        body.vx = (Math.random() - 0.5) * 900
        body.vy = -(1000 + Math.random() * 700)
        body.q = randomTurn()
        body.q2 = randomTurn()
        body.mode = "moving"
        body.since = performance.now()
      })
      pendingRef.current = true
      runs()
    },
  }))

  function pointsAt(event: React.PointerEvent) {
    const box = trayRef.current!.getBoundingClientRect()
    return [event.clientX - box.left, event.clientY - box.top] as const
  }

  function grabs(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0 || !trayRef.current) {
      return
    }
    const [x, y] = pointsAt(event)
    const width = trayRef.current.clientWidth
    const height = trayRef.current.clientHeight
    const list = bodies()

    // The nearest die under the pointer, if any.
    let picked = -1
    let nearest = Infinity
    list.forEach((body, index) => {
      const distance = Math.hypot(body.fx * width - x, body.fy * height - y)
      if (distance < radiusOf(index) * 1.15 && distance < nearest) {
        nearest = distance
        picked = index
      }
    })
    if (picked < 0) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    const body = list[picked]
    body.mode = "held"
    body.vx = 0
    body.vy = 0
    body.grab = [x - body.fx * width, y - body.fy * height]
    body.samples = [{ x, y, t: event.timeStamp }]
    valuesRef.current = [...valuesRef.current]
    publishes(list)
  }

  function drags(event: React.PointerEvent<HTMLDivElement>) {
    const tray = trayRef.current
    const list = bodiesRef.current
    const index = list?.findIndex((body) => body.mode === "held") ?? -1
    if (!tray || !list || index < 0) {
      return
    }
    const body = list[index]
    const [x, y] = pointsAt(event)
    const width = tray.clientWidth
    const height = tray.clientHeight
    const r = radiusOf(index)
    const nextX = Math.min(width - r, Math.max(r, x - (body.grab?.[0] ?? 0)))
    const nextY = Math.min(height - r, Math.max(r, y - (body.grab?.[1] ?? 0)))
    const moveX = nextX - body.fx * width
    const moveY = nextY - body.fy * height
    const moved = Math.hypot(moveX, moveY)

    // Carried dice turn a little in the hand.
    if (moved > 0) {
      const axis: V3 = [-moveY, moveX, 0]
      body.q = multiplies(aroundAxis(axis, (moved / r) * 0.5), body.q)
      body.q2 = multiplies(aroundAxis(axis, (moved / r) * 0.6), body.q2)
    }
    body.fx = nextX / width
    body.fy = nextY / height
    body.samples = [
      ...(body.samples ?? []).filter(
        (sample) => event.timeStamp - sample.t < 90
      ),
      { x, y, t: event.timeStamp },
    ]
    publishes(list)
  }

  function releases(event: React.PointerEvent<HTMLDivElement>) {
    const list = bodiesRef.current
    const index = list?.findIndex((body) => body.mode === "held") ?? -1
    if (!list || index < 0) {
      return
    }
    const body = list[index]
    const samples = body.samples ?? []
    const first = samples[0]
    const last = samples[samples.length - 1]
    const elapsed = Math.max(1, (last?.t ?? 0) - (first?.t ?? 0))
    const stale = event.timeStamp - (last?.t ?? 0) > 80
    // Pixels a second, capped so a flick stays on the table.
    const scaleBy = stale ? 0 : 1000 / elapsed
    let vx = first && last ? (last.x - first.x) * scaleBy : 0
    let vy = first && last ? (last.y - first.y) * scaleBy : 0
    const speed = Math.hypot(vx, vy)
    if (speed > 2600) {
      vx *= 2600 / speed
      vy *= 2600 / speed
    }

    body.samples = undefined
    body.grab = undefined
    body.vx = vx
    body.vy = vy
    // Even a gentle drop lets the die tip onto its nearest face.
    body.mode = "moving"
    body.since = performance.now()
    pendingRef.current = true
    latest.current.onMotionStart()

    if (reduced()) {
      const kind = kinds[index]
      const main = settlesOn(kind === 100 ? 10 : kind, body.q)
      const second = settlesOn(10, body.q2)
      body.q = main.rest
      body.q2 = second.rest
      body.mode = "idle"
      valuesRef.current[index] =
        kind === 100
          ? (main.value % 10) * 10 + (second.value % 10) || 100
          : main.value
      publishes(list)
      pendingRef.current = false
      latest.current.onSettle([...valuesRef.current])
      return
    }
    runs()
  }

  return (
    <div
      ref={trayRef}
      data-slot="dice-tray"
      onPointerDown={grabs}
      onPointerMove={drags}
      onPointerUp={releases}
      onPointerCancel={releases}
      className={cn(
        "relative h-72 w-full touch-none overflow-hidden rounded-2xl border border-border shadow-inner select-none",
        disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
      )}
      style={{
        // Felt: a soft pool of light on the tray's colour.
        background:
          "radial-gradient(ellipse at 50% 35%, color-mix(in oklab, var(--muted), white 6%), var(--muted) 70%)",
      }}
    >
      {view.map((die, index) => {
        const kind = kinds[index]
        const wide = kind === 100
        const lift = die.lifted ? 1 : 0

        return (
          <React.Fragment key={index}>
            {/* The shadow stays on the felt; a lifted die's falls further away. */}
            <span
              aria-hidden
              className="pointer-events-none absolute block"
              style={{
                left: `${die.fx * 100}%`,
                top: `${die.fy * 100}%`,
                width: wide ? px * 1.7 : px * 1.05,
                height: px * 0.3,
                transform: `translate(-50%, ${px * (0.32 + lift * 0.28)}px) scale(${1 - lift * 0.15})`,
                opacity: 1 - lift * 0.45,
                background:
                  "radial-gradient(closest-side, rgb(0 0 0 / 0.5), rgb(0 0 0 / 0.2) 55%, transparent)",
              }}
            />
            <span
              aria-hidden
              data-slot="dice-tray-die"
              className="pointer-events-none absolute flex items-end"
              style={{
                left: `${die.fx * 100}%`,
                top: `${die.fy * 100}%`,
                width: wide ? px * 1.7 : px,
                height: px,
                transform: `translate(-50%, -50%) translateY(${-lift * px * 0.18}px) scale(${1 + lift * 0.12})`,
                transition: "transform 120ms ease-out",
              }}
            >
              {wide ? (
                <>
                  <span className="block size-full">
                    <DieGraphic
                      sides={10}
                      orientation={die.q}
                      color={colors[index]}
                      ink={inks[index]}
                      labels={tensLabels}
                    />
                  </span>
                  <span className="block size-4/5">
                    <DieGraphic
                      sides={10}
                      orientation={die.q2}
                      color={colors[index]}
                      ink={inks[index]}
                      labels={onesLabels}
                    />
                  </span>
                </>
              ) : (
                <DieGraphic
                  sides={kind}
                  orientation={die.q}
                  color={colors[index]}
                  ink={inks[index]}
                  labels={kind === 10 ? onesLabels : plainLabels}
                />
              )}
            </span>
          </React.Fragment>
        )
      })}
      <ul className="sr-only">
        {values.map((value, index) => (
          <li key={index}>
            Die {index + 1}, d{kinds[index]}: {value}
          </li>
        ))}
      </ul>
      <span className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-muted-foreground/70">
        Grab a die and throw it
      </span>
    </div>
  )
}

function clampsFace(value: number, sides: number) {
  return Math.min(sides, Math.max(1, Math.round(value) || 1))
}

function Dice({
  count = 1,
  sides = 6,
  dice,
  values: valuesProp,
  defaultValues,
  onValuesChange,
  modifier = 0,
  onRoll,
  holdable = false,
  held: heldProp,
  onHeldChange,
  rollButton = "below",
  rollLabel = "Roll",
  showTotal = true,
  showKind,
  size = "default",
  tone = "default",
  color,
  ink,
  duration = 1.3,
  disabled = false,
  variant = "row",
  className,
  style,
  ...props
}: DiceProps) {
  const specOf = (index: number) => {
    const spec = dice?.[index] ?? sides
    return typeof spec === "number" ? { sides: spec } : spec
  }
  const kindOf = (index: number) => specOf(index).sides
  const [ownValues, setOwnValues] = React.useState(() =>
    (
      defaultValues ??
      Array.from({ length: dice?.length ?? count }, (_, index) =>
        // d6s count up 1, 2, 3; other dice start on their highest face.
        kindOf(index) === 6 ? (index % 6) + 1 : kindOf(index)
      )
    ).map((value, index) => clampsFace(value, kindOf(index)))
  )
  const values = (valuesProp ?? ownValues).map((value, index) =>
    clampsFace(value, kindOf(index))
  )
  const [ownHeld, setOwnHeld] = React.useState<number[]>([])
  const held = heldProp ?? ownHeld
  const [rolling, setRolling] = React.useState(false)
  const [seconds, setSeconds] = React.useState(duration)
  const [announcement, setAnnouncement] = React.useState("")
  // A count per die, bumped on every roll it takes part in.
  const [rolls, setRolls] = React.useState<number[]>(() => values.map(() => 0))
  const timerRef = React.useRef<number | undefined>(undefined)
  const trayRef = React.useRef<TrayHandle>(null)

  React.useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function startsTrayMotion() {
    setRolling(true)
    setAnnouncement("")
  }

  function settlesTray(next: number[]) {
    const landed = next.reduce((a, b) => a + b, 0) + modifier
    const bonus =
      modifier === 0
        ? ""
        : ` ${modifier > 0 ? "plus" : "minus"} ${Math.abs(modifier)}`

    setRolling(false)
    if (valuesProp === undefined) {
      setOwnValues(next)
    }
    onValuesChange?.(next)
    setAnnouncement(
      next.length > 1 || modifier !== 0
        ? `Rolled ${next.join(", ")}${bonus}. Total ${landed}.`
        : `Rolled ${next[0]}.`
    )
    onRoll?.(next, landed)
  }

  const sum = values.reduce((total, value) => total + value, 0)
  const total = sum + modifier
  const allHeld = values.length > 0 && held.length >= values.length
  const labelsKinds = showKind ?? values.some((_, index) => kindOf(index) !== 6)

  function setsHeld(next: number[]) {
    if (heldProp === undefined) {
      setOwnHeld(next)
    }
    onHeldChange?.(next)
  }

  function rollsDice() {
    if (variant === "tray") {
      if (!rolling && !disabled) {
        trayRef.current?.throwsAll()
      }
      return
    }
    if (rolling || disabled || allHeld) {
      return
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const time = reduced ? 0 : duration
    const next = values.map((value, index) =>
      held.includes(index)
        ? value
        : Math.floor(Math.random() * kindOf(index)) + 1
    )

    setSeconds(time)
    setRolling(true)
    setAnnouncement("")
    setRolls((current) =>
      values.map((_, index) =>
        held.includes(index) ? (current[index] ?? 0) : (current[index] ?? 0) + 1
      )
    )
    if (valuesProp === undefined) {
      setOwnValues(next)
    }
    onValuesChange?.(next)

    // The last die starts a little late; wait for it to land.
    const settle = time * 1000 + (time > 0 ? (values.length - 1) * 70 : 0)

    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      const landed = next.reduce((a, b) => a + b, 0) + modifier
      const bonus =
        modifier === 0
          ? ""
          : ` ${modifier > 0 ? "plus" : "minus"} ${Math.abs(modifier)}`

      setRolling(false)
      setAnnouncement(
        next.length > 1 || modifier !== 0
          ? `Rolled ${next.join(", ")}${bonus}. Total ${landed}.`
          : `Rolled ${next[0]}.`
      )
      onRoll?.(next, landed)
    }, settle)
  }

  function pressesDie(index: number) {
    if (holdable) {
      if (rolling || disabled) {
        return
      }
      setsHeld(
        held.includes(index)
          ? held.filter((item) => item !== index)
          : [...held, index]
      )
      return
    }

    rollsDice()
  }

  return (
    <div
      data-slot="dice"
      data-rolling={rolling || undefined}
      className={cn("flex w-full flex-col items-center gap-4", className)}
      style={
        {
          "--dice-size": DICE_SIZES[size],
          "--dice-duration": `${seconds}s`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <style href="standard-dice" precedence="default">
        {diceKeyframes}
      </style>

      {variant === "tray" ? (
        <DiceTray
          ref={trayRef}
          kinds={values.map((_, index) => kindOf(index))}
          values={values}
          colors={values.map(
            (_, index) => specOf(index).color ?? color ?? TONES[tone].color
          )}
          inks={values.map(
            (_, index) => specOf(index).ink ?? ink ?? TONES[tone].ink
          )}
          size={size}
          disabled={disabled}
          onMotionStart={startsTrayMotion}
          onSettle={settlesTray}
        />
      ) : (
        <div
          role="group"
          aria-label="Dice"
          className="flex flex-wrap items-end justify-center gap-x-4 gap-y-3 pt-6"
        >
          {values.map((value, index) => {
            const spec = specOf(index)
            const kind = spec.sides
            const body = spec.color ?? color ?? TONES[tone].color
            const mark = spec.ink ?? ink ?? TONES[tone].ink
            const isHeld = held.includes(index)
            const tumbling = rolling && !isHeld
            const Die = holdable || rollButton === "none" ? "button" : "div"
            const name = `Die ${index + 1}${kind === 6 ? "" : `, d${kind}`}: ${value}`
            const shared = {
              roll: rolls[index] ?? 0,
              seconds,
              delay: index * 70,
              color: body,
              ink: mark,
              held: isHeld,
            }
            const wide = kind === 100

            return (
              <Die
                key={index}
                data-slot="dice-die"
                data-sides={kind}
                data-rolling={tumbling || undefined}
                data-held={isHeld || undefined}
                {...(Die === "button"
                  ? {
                      type: "button" as const,
                      onClick: () => pressesDie(index),
                      disabled: disabled || (rolling && !holdable),
                      "aria-pressed": holdable ? isHeld : undefined,
                      "aria-label": `${name}${isHeld ? ", held" : ""}`,
                    }
                  : { role: "img", "aria-label": name })}
                className={cn(
                  "group/die relative flex flex-col items-center rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  Die === "button" && "cursor-pointer disabled:cursor-default"
                )}
              >
                <span
                  data-dice-hop
                  className="flex items-end"
                  style={{
                    width: wide
                      ? "calc(var(--dice-size) * 1.7)"
                      : "var(--dice-size)",
                    height: "var(--dice-size)",
                    animationDelay: `${index * 70}ms`,
                  }}
                >
                  {wide ? (
                    // Percentile: a tens die and a ones die, 00 + 0 reading 100.
                    <>
                      <span className="block size-full">
                        <SolidDie
                          {...shared}
                          sides={10}
                          value={Math.floor((value % 100) / 10) || 10}
                          labels={tensLabels}
                        />
                      </span>
                      <span className="block size-4/5">
                        <SolidDie
                          {...shared}
                          sides={10}
                          value={value % 10 || 10}
                          labels={onesLabels}
                        />
                      </span>
                    </>
                  ) : (
                    <SolidDie
                      {...shared}
                      sides={kind}
                      labels={kind === 10 ? onesLabels : plainLabels}
                      value={value}
                    />
                  )}
                </span>
                <span
                  aria-hidden
                  data-dice-shadow
                  className="block"
                  // A soft dark oval tucked under the die, darker in the middle
                  // like a contact shadow. Always dark, so it reads as shade in
                  // light and dark themes.
                  style={{
                    width: wide
                      ? "calc(var(--dice-size) * 1.75)"
                      : "calc(var(--dice-size) * 1.05)",
                    height: "calc(var(--dice-size) * 0.22)",
                    marginTop: "calc(var(--dice-size) * -0.1)",
                    background:
                      "radial-gradient(closest-side, rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.25) 55%, transparent)",
                    animationDelay: `${index * 70}ms`,
                  }}
                />
                {labelsKinds ? (
                  <span className="mt-1 font-mono text-xs text-muted-foreground">
                    d{kind}
                  </span>
                ) : null}
                {holdable ? (
                  <span
                    className={cn(
                      "mt-1.5 text-xs font-medium tracking-wide uppercase",
                      isHeld ? "text-foreground" : "text-muted-foreground/60"
                    )}
                  >
                    {isHeld ? "Held" : "Hold"}
                  </span>
                ) : null}
              </Die>
            )
          })}
        </div>
      )}

      {showTotal && (values.length > 1 || modifier !== 0) ? (
        <div className="flex items-baseline gap-1.5 text-sm text-muted-foreground">
          Total
          <span
            className={cn(
              "text-2xl font-bold text-foreground tabular-nums transition-opacity",
              rolling && "opacity-30"
            )}
          >
            {total}
          </span>
          {modifier !== 0 ? (
            <span className="font-mono text-xs tabular-nums">
              ({sum} {modifier > 0 ? "+" : "−"} {Math.abs(modifier)})
            </span>
          ) : null}
        </div>
      ) : null}

      {rollButton === "below" ? (
        <Button
          data-slot="dice-roll"
          shape="pill"
          onClick={rollsDice}
          disabled={rolling || disabled || allHeld}
          leading={
            <DicesIcon className={cn("size-4", rolling && "animate-bounce")} />
          }
        >
          {rolling ? "Rolling…" : rollLabel}
        </Button>
      ) : null}

      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  )
}

export { Dice, type DiceProps, type DiceSides, type DieSpec }
