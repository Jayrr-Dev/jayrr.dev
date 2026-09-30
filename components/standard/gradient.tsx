import * as React from "react"

import { layerProps, type LayerProps } from "@/components/standard/layer"

const gradientKinds = ["linear", "radial", "conic", "mesh"] as const

type GradientKind = (typeof gradientKinds)[number]

type PresetSpec = {
  kind?: GradientKind
  colors?: string[]
  angle?: number
  at?: string
  /** A full background-image, for looks the kinds can't make. */
  image?: string
  /** Solid color painted under the image. */
  base?: string
}

/** Burnt edge fading in from each side, like an inset shadow. */
function edgeBurn(color: string, depth: string) {
  const fade = `rgb(${color} / 0.6) 0, rgb(${color} / 0.25) calc(${depth} * 0.4), rgb(${color} / 0.08) calc(${depth} * 0.7), transparent ${depth}`
  return ["bottom", "top", "right", "left"]
    .map((side) => `linear-gradient(to ${side}, ${fade})`)
    .join(", ")
}

// A preset replaces kind and colors with a ready-made look.
const presetSpecs = {
  // Dark wash from the bottom, so light text reads over photos.
  scrim: {
    colors: ["transparent 40%", "rgb(0 0 0 / 0.75)"],
    angle: 180,
  },
  // Fades into the page background, for cut-off content.
  fade: {
    colors: ["transparent 50%", "var(--background)"],
    angle: 180,
  },
  // Soft light from the top center.
  spotlight: {
    image:
      "radial-gradient(ellipse 70% 60% at 50% 0%, rgb(255 255 255 / 0.35), transparent 70%)",
  },
  // Darkened corners that pull the eye inward.
  vignette: {
    image:
      "radial-gradient(ellipse at center, transparent 50%, rgb(0 0 0 / 0.55) 100%)",
  },
  // Theme primary tint from the top-left corner.
  primary: {
    colors: [
      "color-mix(in oklch, var(--primary) 35%, transparent)",
      "transparent 70%",
    ],
    angle: 135,
  },
  sunset: {
    colors: ["oklch(0.8 0.16 70)", "oklch(0.68 0.2 20)", "oklch(0.45 0.18 320)"],
    angle: 160,
  },
  ocean: {
    colors: ["oklch(0.82 0.12 190)", "oklch(0.55 0.15 240)", "oklch(0.32 0.12 265)"],
    angle: 160,
  },
  aurora: {
    kind: "mesh",
    colors: ["oklch(0.8 0.18 160)", "oklch(0.6 0.2 290)", "oklch(0.75 0.14 210)"],
  },
  peach: {
    colors: ["oklch(0.93 0.06 60)", "oklch(0.85 0.1 20)"],
    angle: 135,
  },
  midnight: {
    colors: ["oklch(0.3 0.08 270)", "oklch(0.16 0.04 260)"],
    angle: 180,
  },
  // Cream paper with scorched edges.
  parchment: {
    image: edgeBurn("138 77 15", "64px"),
    base: "#fffef0",
  },
} satisfies Record<string, PresetSpec>

type GradientPreset = keyof typeof presetSpecs

const gradientPresets = Object.keys(presetSpecs) as GradientPreset[]

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
  /** A ready-made look. Overrides kind and colors. */
  preset?: GradientPreset
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

function presetStyle(spec: PresetSpec): React.CSSProperties {
  return {
    backgroundImage:
      spec.image ??
      gradientImage(
        spec.kind ?? "linear",
        spec.colors ?? defaultGradientColors,
        spec.angle ?? 135,
        spec.at ?? "50% 50%"
      ),
    backgroundColor: spec.base,
  }
}

type GradientLook = Pick<GradientProps, "preset" | "kind" | "colors" | "angle" | "at">

/** Background for a gradient look, for merging into a Surface's backgrounds. */
function gradientBackground({
  preset,
  kind = "linear",
  colors = defaultGradientColors,
  angle = 135,
  at = "50% 50%",
}: GradientLook): React.CSSProperties {
  return preset
    ? presetStyle(presetSpecs[preset])
    : { backgroundImage: gradientImage(kind, colors, angle, at) }
}

/** Color transition layer: linear, radial, conic, mesh or a preset. */
function Gradient({
  preset,
  kind = "linear",
  colors,
  angle,
  at,
  ...layer
}: GradientProps) {
  const props = layerProps(layer, "gradient")

  return (
    <div
      {...props}
      data-kind={preset ? undefined : kind}
      data-preset={preset}
      style={{
        ...gradientBackground({ preset, kind, colors, angle, at }),
        ...props.style,
      }}
    />
  )
}

export {
  Gradient,
  gradientBackground,
  gradientKinds,
  gradientPresets,
  type GradientKind,
  type GradientPreset,
  type GradientProps,
}
