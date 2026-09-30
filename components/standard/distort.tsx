"use client"

import * as React from "react"

import { layerProps, type LayerProps } from "@/components/standard/layer"

const distortKinds = ["waves", "ripple", "warp", "blur"] as const

type DistortKind = (typeof distortKinds)[number]

/** Turbulence driving each displacement. Blur needs none. */
const distortDefaults: Record<
  DistortKind,
  { type: "turbulence" | "fractalNoise"; frequency: [number, number]; octaves: number; strength: number }
> = {
  waves: { type: "turbulence", frequency: [0.002, 0.05], octaves: 1, strength: 18 },
  ripple: { type: "turbulence", frequency: [0.03, 0.03], octaves: 1, strength: 10 },
  warp: { type: "fractalNoise", frequency: [0.008, 0.008], octaves: 2, strength: 40 },
  blur: { type: "fractalNoise", frequency: [0, 0], octaves: 1, strength: 8 },
}

type DistortProps = Omit<LayerProps, "placement"> & {
  kind?: DistortKind
  /** Displacement in px, or blur radius for `blur`. */
  strength?: number
  /** feTurbulence baseFrequency as [x, y]. */
  frequency?: [number, number]
  /** Moves the distortion. Stops under reduced motion. */
  animate?: boolean
  /** Seconds per animation loop. */
  duration?: number
  /**
   * With children, distorts them. Without, distorts whatever is painted
   * behind the layer. Backdrop displacement is Chromium only; blur works
   * everywhere.
   */
  children?: React.ReactNode
}

function usesReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  return reduced
}

function DisplacementFilter({
  id,
  kind,
  strength,
  frequency,
  moving,
  duration,
}: {
  id: string
  kind: Exclude<DistortKind, "blur">
  strength: number
  frequency: [number, number]
  moving: boolean
  duration: number
}) {
  const { type, octaves } = distortDefaults[kind]
  const [x, y] = frequency
  const base = `${x} ${y}`
  const peak = `${x * 1.35} ${y * 1.35}`

  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type={type} baseFrequency={base} numOctaves={octaves} result="noise">
          {moving ? (
            <animate
              attributeName="baseFrequency"
              dur={`${duration}s`}
              values={`${base};${peak};${base}`}
              repeatCount="indefinite"
            />
          ) : null}
        </feTurbulence>
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale={strength}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  )
}

/** Spatial effect: waves, ripple, warp or blur. */
function Distort({
  kind = "waves",
  strength,
  frequency,
  animate = false,
  duration = 8,
  children,
  className,
  style,
  ...layer
}: DistortProps) {
  const filterId = `distort-${React.useId().replace(/:/g, "")}`
  const reduced = usesReducedMotion()
  const amount = strength ?? distortDefaults[kind].strength
  const filter = kind === "blur" ? `blur(${amount}px)` : `url(#${filterId})`

  const svg =
    kind === "blur" ? null : (
      <DisplacementFilter
        id={filterId}
        kind={kind}
        strength={amount}
        frequency={frequency ?? distortDefaults[kind].frequency}
        moving={animate && !reduced}
        duration={duration}
      />
    )

  if (children !== undefined) {
    return (
      <div
        data-slot="distort"
        data-kind={kind}
        className={className}
        style={{ filter, ...style }}
      >
        {svg}
        {children}
      </div>
    )
  }

  const props = layerProps(
    { ...layer, placement: "over", className, style },
    "distort"
  )

  return (
    <>
      {svg}
      <div
        {...props}
        data-kind={kind}
        style={{ backdropFilter: filter, WebkitBackdropFilter: filter, ...props.style }}
      />
    </>
  )
}

export { Distort, distortKinds, type DistortKind, type DistortProps }
