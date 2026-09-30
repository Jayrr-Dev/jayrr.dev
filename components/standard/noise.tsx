import * as React from "react"

import { layerProps, svgUrl, type LayerProps } from "@/components/standard/layer"

const noiseKinds = ["grain", "paper", "clouds"] as const

type NoiseKind = (typeof noiseKinds)[number]

/** Turbulence settings per kind. Paper stretches the noise into fibers. */
const noiseDefaults: Record<
  NoiseKind,
  { frequency: string; octaves: number; tile: number; opacity: number }
> = {
  grain: { frequency: "0.9", octaves: 3, tile: 200, opacity: 0.3 },
  paper: { frequency: "0.02 0.6", octaves: 4, tile: 300, opacity: 0.25 },
  clouds: { frequency: "0.012", octaves: 4, tile: 480, opacity: 0.35 },
}

type NoiseProps = LayerProps & {
  kind?: NoiseKind
  /** feTurbulence baseFrequency. One number, or "x y" to stretch. */
  frequency?: number | string
  octaves?: number
  seed?: number
  /** Tile size in px. */
  tile?: number
  /** Gray noise. Off keeps the colored channels. */
  monochrome?: boolean
  /** Jitters the grain like film. Stops under reduced motion. */
  animate?: boolean
}

function noiseSvg(
  frequency: string,
  octaves: number,
  seed: number,
  tile: number,
  monochrome: boolean
) {
  const gray = monochrome
    ? `<feColorMatrix type='saturate' values='0'/>`
    : ""

  return `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='${octaves}' seed='${seed}' stitchTiles='stitch'/>${gray}</filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
}

const noiseKeyframes = `@keyframes noise-jitter{0%{background-position:0 0}20%{background-position:-37px 21px}40%{background-position:53px -48px}60%{background-position:-14px 66px}80%{background-position:71px 9px}100%{background-position:0 0}}@media (prefers-reduced-motion:reduce){[data-slot=noise]{animation:none!important}}`

/** Random surface texture: grain, paper fibers or clouds. */
function Noise({
  kind = "grain",
  frequency,
  octaves,
  seed = 0,
  tile,
  monochrome = true,
  animate = false,
  ...layer
}: NoiseProps) {
  const defaults = noiseDefaults[kind]
  const size = tile ?? defaults.tile
  const props = layerProps(
    { opacity: defaults.opacity, ...layer },
    "noise"
  )

  return (
    <>
      {animate ? (
        <style href="standard-noise" precedence="default">
          {noiseKeyframes}
        </style>
      ) : null}
      <div
        {...props}
        data-kind={kind}
        style={{
          backgroundImage: svgUrl(
            noiseSvg(
              String(frequency ?? defaults.frequency),
              octaves ?? defaults.octaves,
              seed,
              size,
              monochrome
            )
          ),
          backgroundSize: `${size}px ${size}px`,
          animation: animate ? "noise-jitter 0.6s steps(5) infinite" : undefined,
          ...props.style,
        }}
      />
    </>
  )
}

export { Noise, noiseKinds, type NoiseKind, type NoiseProps }
