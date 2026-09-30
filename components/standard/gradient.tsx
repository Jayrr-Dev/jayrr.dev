import * as React from "react"

import { layerProps, type LayerProps } from "@/components/standard/layer"

const gradientKinds = ["linear", "radial", "conic", "mesh"] as const

type GradientKind = (typeof gradientKinds)[number]

const defaultGradientColors = [
  "oklch(0.7 0.2 300)",
  "oklch(0.8 0.15 200)",
  "oklch(0.85 0.15 85)",
]

/** Where mesh color spots sit, in order. Repeats past the last one. */
const meshSpots = [
  "20% 20%",
  "80% 25%",
  "50% 90%",
  "10% 80%",
  "90% 85%",
  "50% 45%",
]

type GradientProps = LayerProps & {
  kind?: GradientKind
  /** Any CSS colors, including theme vars like `var(--primary)`. */
  colors?: string[]
  /** Degrees, for linear and conic. */
  angle?: number
  /** Center for radial and conic, e.g. "50% 0%". */
  at?: string
}

function gradientImage(
  kind: GradientKind,
  colors: string[],
  angle: number,
  at: string
) {
  const stops = colors.join(", ")

  switch (kind) {
    case "linear":
      return `linear-gradient(${angle}deg, ${stops})`
    case "radial":
      return `radial-gradient(circle at ${at}, ${stops})`
    case "conic":
      return `conic-gradient(from ${angle}deg at ${at}, ${stops}, ${colors[0]})`
    case "mesh":
      return colors
        .map(
          (color, index) =>
            `radial-gradient(at ${meshSpots[index % meshSpots.length]}, ${color} 0, transparent 60%)`
        )
        .join(", ")
  }
}

/** Color transition layer: linear, radial, conic or mesh. */
function Gradient({
  kind = "linear",
  colors = defaultGradientColors,
  angle = 135,
  at = "50% 50%",
  ...layer
}: GradientProps) {
  const props = layerProps(layer, "gradient")

  return (
    <div
      {...props}
      data-kind={kind}
      style={{
        backgroundImage: gradientImage(kind, colors, angle, at),
        ...props.style,
      }}
    />
  )
}

export { Gradient, gradientKinds, type GradientKind, type GradientProps }
