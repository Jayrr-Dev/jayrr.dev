"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * Rings of items orbiting a centre. Rings alternate direction by default: the
 * inner ring turns clockwise, the next counter-clockwise, and so on. Items
 * stay upright while their ring turns.
 *
 * Each item orbits on its own from a zero-size anchor at the centre, so
 * nothing larger than the items themselves turns, and the rings never push
 * a scroll container into overflow.
 *
 * Radii are in a `size` x `size` box that scales with the element.
 *
 * <Planetary
 *   center={<PlanetaryItem size="lg"><Atom /></PlanetaryItem>}
 *   rings={[
 *     { items: [<PlanetaryItem><Type /></PlanetaryItem>, ...] },
 *     { items: [<PlanetaryItem><Star /></PlanetaryItem>, ...], duration: 60 },
 *   ]}
 * />
 */

type PlanetaryDirection = "clockwise" | "counterclockwise"

type PlanetaryRing = {
  items: React.ReactNode[]
  /** Ring radius in box units. Defaults to spacing rings evenly out to the edge. */
  radius?: number
  /** Defaults to clockwise for the inner ring, alternating outwards. */
  direction?: PlanetaryDirection
  /** Seconds per full turn. Defaults to the Planetary `duration`. */
  duration?: number
  /** Turns the ring's starting position, as a share of a turn (0 to 1). */
  offset?: number
  className?: string
}

type PlanetaryProps = Omit<React.ComponentProps<"div">, "children"> & {
  rings: PlanetaryRing[]
  /** Sits still in the middle. */
  center?: React.ReactNode
  /** Coordinate box the radii are written in. */
  size?: number
  /** Room kept between the outer ring and the box edge. */
  inset?: number
  /** Seconds per full turn for every ring without its own `duration`. */
  duration?: number
  /** Draws each ring's orbit line. */
  showOrbits?: boolean
  /** Keeps items upright while their ring turns. */
  upright?: boolean
  paused?: boolean
  pauseOnHover?: boolean
  itemClassName?: string
  orbitClassName?: string
}

// An item turns about the centre by its angle, steps out by the radius, and
// turns back: all the way back to stay upright, or only by its starting angle
// to turn with the ring. Reduced motion holds the first frame, which is the
// item's resting place.
const planetaryKeyframes = `
@keyframes planetary-orbit{from{transform:rotate(var(--planetary-angle)) translateX(var(--planetary-radius)) rotate(calc(-1 * var(--planetary-angle)))}to{transform:rotate(calc(var(--planetary-angle) + 360deg)) translateX(var(--planetary-radius)) rotate(calc(-1 * var(--planetary-angle)))}}
@keyframes planetary-orbit-upright{from{transform:rotate(var(--planetary-angle)) translateX(var(--planetary-radius)) rotate(calc(-1 * var(--planetary-angle)))}to{transform:rotate(calc(var(--planetary-angle) + 360deg)) translateX(var(--planetary-radius)) rotate(calc(-1 * var(--planetary-angle) - 360deg))}}
[data-slot=planetary]:is([data-paused],[data-pause-on-hover]:hover) [data-planetary-orbit]{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){[data-planetary-orbit]{animation-play-state:paused!important}}
`

function orbits({
  angle,
  radius,
  size,
  duration,
  direction,
  upright,
}: {
  angle: number
  radius: number
  size: number
  duration: number
  direction: PlanetaryDirection
  upright: boolean
}) {
  return {
    "--planetary-angle": `${angle}deg`,
    // Box units to a share of the element's width, which sets its height too.
    "--planetary-radius": `${(radius / size) * 100}cqw`,
    animation: `${upright ? "planetary-orbit-upright" : "planetary-orbit"} ${duration}s linear infinite`,
    animationDirection: direction === "clockwise" ? "normal" : "reverse",
  } as React.CSSProperties
}

function Planetary({
  rings,
  center,
  size = 400,
  inset = 24,
  duration = 40,
  showOrbits = true,
  upright = true,
  paused = false,
  pauseOnHover = false,
  itemClassName,
  orbitClassName,
  className,
  style,
  ...props
}: PlanetaryProps) {
  const outer = size / 2 - inset

  return (
    <div
      data-slot="planetary"
      data-paused={paused || undefined}
      data-pause-on-hover={pauseOnHover || undefined}
      className={cn("relative w-full", className)}
      style={{ aspectRatio: "1 / 1", containerType: "inline-size", ...style }}
      {...props}
    >
      <style href="standard-planetary" precedence="default">
        {planetaryKeyframes}
      </style>
      {rings.map((ring, index) => {
        const radius = ring.radius ?? (outer * (index + 1)) / rings.length
        const direction =
          ring.direction ?? (index % 2 === 0 ? "clockwise" : "counterclockwise")
        const seconds = ring.duration ?? duration
        const count = ring.items.length

        return (
          <div
            key={index}
            data-slot="planetary-ring"
            className="absolute inset-0"
          >
            {showOrbits ? (
              <svg
                aria-hidden
                viewBox={`0 0 ${size} ${size}`}
                className="pointer-events-none absolute inset-0 size-full overflow-visible"
              >
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  className={cn("stroke-border", orbitClassName)}
                />
              </svg>
            ) : null}
            <div className={cn("absolute inset-0", ring.className)}>
              {ring.items.map((item, position) => (
                <div
                  key={position}
                  data-planetary-orbit
                  className="absolute top-1/2 left-1/2 size-0"
                  style={orbits({
                    // Evenly round the ring, clockwise from the right.
                    angle: ((position / count + (ring.offset ?? 0)) % 1) * 360,
                    radius,
                    size,
                    duration: seconds,
                    direction,
                    upright,
                  })}
                >
                  <div
                    data-slot="planetary-item"
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2",
                      itemClassName
                    )}
                  >
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      {center ? (
        <div
          data-slot="planetary-center"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          {center}
        </div>
      ) : null}
    </div>
  )
}

const planetaryItemSizes = {
  sm: "size-8 [&_svg]:size-3.5",
  default: "size-10 [&_svg]:size-4",
  lg: "size-16 [&_svg]:size-7",
}

/** A round body for a Planetary ring or its centre. */
function PlanetaryItem({
  size = "default",
  className,
  ...props
}: React.ComponentProps<"div"> & { size?: keyof typeof planetaryItemSizes }) {
  return (
    <div
      data-slot="planetary-body"
      data-size={size}
      className={cn(
        "grid place-items-center rounded-full border bg-card text-muted-foreground shadow-xs",
        size === "lg" && "text-foreground",
        planetaryItemSizes[size],
        className
      )}
      {...props}
    />
  )
}

export { Planetary, PlanetaryItem, type PlanetaryDirection, type PlanetaryRing }
