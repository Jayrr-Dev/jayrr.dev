import * as React from "react"
import { cn } from "cn"
import { Slot } from "radix-ui"

import { gradientBackground, type GradientProps } from "@/components/standard/gradient"
import { layerProps, svgUrl, type LayerProps } from "@/components/standard/layer"
import { Noise, type NoiseProps } from "@/components/standard/noise"
import { patternBackground, type PatternProps } from "@/components/standard/pattern"
import { Screentone, type ScreentoneProps } from "@/components/standard/screentone"

/** Overrides for how a background layer tiles. Applies to every image in the layer. */
type SurfaceFit = {
  /** background-size, e.g. "cover" or "24px 24px". */
  size?: string
  /** background-position, e.g. "bottom" or "50% 100%". */
  position?: string
  /** background-repeat, e.g. "no-repeat" or "repeat-x". */
  repeat?: string
}

/**
 * Slides the background by `x` and `y` every `duration` seconds, looping.
 * Set the offsets to the tile size for a seamless loop. Stops under reduced
 * motion.
 */
type SurfaceDrift = {
  x?: string
  y?: string
  /** Seconds per loop. */
  duration?: number
}

type SurfaceBackgroundLayer = LayerProps &
  SurfaceFit & {
    drift?: SurfaceDrift
  }

type SurfaceLayer =
  | ({ type: "gradient" } & Pick<GradientProps, "preset" | "kind" | "colors" | "angle" | "at"> &
      SurfaceBackgroundLayer)
  | ({ type: "pattern" } & Pick<PatternProps, "kind" | "size" | "thickness" | "color"> &
      Omit<SurfaceBackgroundLayer, "size">)
  | ({ type: "image"; src: string } & SurfaceBackgroundLayer)
  /** Inline SVG markup, painted without adding it to the DOM. */
  | ({ type: "svg"; svg: string } & SurfaceBackgroundLayer)
  | ({ type: "noise" } & NoiseProps)
  | ({ type: "screentone" } & ScreentoneProps)

type SurfaceProps = React.ComponentProps<"div"> & {
  /** Painted bottom to top, under the children unless a layer is `over`. */
  layers?: SurfaceLayer[]
  /** Paints the layers onto the child element (a Card, Banner, link...) instead of a div. */
  asChild?: boolean
}

/** One image of a background layer with its own size, position and repeat. */
type BackgroundEntry = {
  image: string
  size: string
  position: string
  repeat: string
}

/** Splits a comma list like background-image, ignoring commas inside functions. */
function splitList(value: string) {
  const parts: string[] = []
  let depth = 0
  let start = 0

  for (let index = 0; index < value.length; index++) {
    const char = value[index]
    if (char === "(") depth++
    else if (char === ")") depth--
    else if (char === "," && depth === 0) {
      parts.push(value.slice(start, index).trim())
      start = index + 1
    }
  }
  parts.push(value.slice(start).trim())

  return parts.filter(Boolean)
}

/** Pairs each image with its size, position and repeat, cycling short lists like CSS does. */
function backgroundEntries(style: React.CSSProperties, fit: SurfaceFit): BackgroundEntry[] {
  const images = splitList(String(style.backgroundImage ?? ""))
  const sizes = splitList(fit.size ?? String(style.backgroundSize ?? "auto"))
  const positions = splitList(fit.position ?? String(style.backgroundPosition ?? "0% 0%"))
  const repeats = splitList(fit.repeat ?? String(style.backgroundRepeat ?? "repeat"))

  return images.map((image, index) => ({
    image,
    size: sizes[index % sizes.length],
    position: positions[index % positions.length],
    repeat: repeats[index % repeats.length],
  }))
}

/** Background layers become their CSS; noise and screentone stay components. */
function layerBackground(layer: SurfaceLayer): React.CSSProperties | null {
  switch (layer.type) {
    case "gradient":
      return gradientBackground(layer)
    case "pattern":
      return patternBackground(layer)
    case "image":
      return { backgroundImage: `url("${layer.src}")` }
    case "svg":
      return { backgroundImage: svgUrl(layer.svg) }
    default:
      return null
  }
}

function layerFit(layer: SurfaceLayer): SurfaceFit {
  if (layer.type === "noise" || layer.type === "screentone") return {}
  return {
    size: layer.type === "pattern" ? undefined : layer.size,
    position: layer.position,
    repeat: layer.repeat,
  }
}

/**
 * A layer can share one element's backgrounds with its neighbours when it
 * only paints images: anything that needs its own opacity, blend against the
 * content, mask, base color, animation or placement gets its own element.
 */
function canMerge(layer: SurfaceLayer, style: React.CSSProperties | null) {
  if (!style || layer.type === "noise" || layer.type === "screentone") return false
  return (
    (layer.placement ?? "behind") === "behind" &&
    layer.opacity == null &&
    layer.blend == null &&
    layer.className == null &&
    layer.style == null &&
    layer.drift == null &&
    style.backgroundColor == null &&
    style.maskImage == null
  )
}

/** Longhands for a list of entries. CSS paints the first entry on top. */
function entriesStyle(entries: BackgroundEntry[]): React.CSSProperties {
  return {
    backgroundImage: entries.map((entry) => entry.image).join(", "),
    backgroundSize: entries.map((entry) => entry.size).join(", "),
    backgroundPosition: entries.map((entry) => entry.position).join(", "),
    backgroundRepeat: entries.map((entry) => entry.repeat).join(", "),
  }
}

const keywordOffsets: Record<string, string> = {
  left: "0%",
  top: "0%",
  center: "50%",
  right: "100%",
  bottom: "100%",
}

/** A background-position as an "x y" pair of lengths, so it can be offset with calc(). */
function positionPair(position: string): [string, string] {
  const tokens = position.split(/\s+/).filter(Boolean)
  const value = (token: string) => keywordOffsets[token] ?? token

  if (tokens.length === 1) {
    const [token] = tokens
    if (token === "top" || token === "bottom") return ["50%", value(token)]
    return [value(token), "50%"]
  }

  const [first, second] = tokens
  // "top left" names y first.
  if (first === "top" || first === "bottom" || second === "left" || second === "right") {
    return [value(second), value(first)]
  }
  return [value(first), value(second)]
}

function driftStyle(entries: BackgroundEntry[], drift: SurfaceDrift): React.CSSProperties {
  const x = drift.x ?? "0px"
  const y = drift.y ?? "0px"
  const pairs = entries.map((entry) => positionPair(entry.position))

  return {
    "--surface-drift-from": pairs.map(([px, py]) => `${px} ${py}`).join(", "),
    "--surface-drift-to": pairs
      .map(([px, py]) => `calc(${px} + ${x}) calc(${py} + ${y})`)
      .join(", "),
    animation: `surface-drift ${drift.duration ?? 20}s linear infinite`,
  } as React.CSSProperties
}

const surfaceKeyframes = `@keyframes surface-drift{from{background-position:var(--surface-drift-from)}to{background-position:var(--surface-drift-to)}}@media (prefers-reduced-motion:reduce){[data-slot=surface-layer]{animation:none!important}}`

/** Everything but the look: placement, blend, opacity, className, style. */
function pickLayerProps({ placement, blend, opacity, className, style }: LayerProps): LayerProps {
  return { placement, blend, opacity, className, style }
}

function renderLayers(layers: SurfaceLayer[]) {
  const nodes: React.ReactNode[] = []
  // Consecutive mergeable layers, bottom first, waiting to share one element.
  let run: BackgroundEntry[][] = []

  const flush = () => {
    if (run.length === 0) return
    const props = layerProps({}, "surface-layer")
    // Reverse so the last layer in the array lands first, on top.
    const entries = [...run].reverse().flat()
    nodes.push(
      <div
        key={`run-${nodes.length}`}
        {...props}
        data-layers={run.length}
        style={entriesStyle(entries)}
      />
    )
    run = []
  }

  layers.forEach((layer, index) => {
    const style = layerBackground(layer)

    if (style && canMerge(layer, style)) {
      run.push(backgroundEntries(style, layerFit(layer)))
      return
    }

    flush()

    // Their layer props ignore the extra `type`.
    if (layer.type === "noise") {
      nodes.push(<Noise key={index} {...layer} />)
      return
    }
    if (layer.type === "screentone") {
      nodes.push(<Screentone key={index} {...layer} />)
      return
    }
    if (!style) return

    const props = layerProps(pickLayerProps(layer), "surface-layer")
    const entries = backgroundEntries(style, layerFit(layer))
    const drift = "drift" in layer ? layer.drift : undefined

    nodes.push(
      <div
        key={index}
        {...props}
        data-type={layer.type}
        style={{
          ...style,
          ...entriesStyle(entries),
          ...(drift ? driftStyle(entries, drift) : null),
          ...props.style,
        }}
      />
    )
  })

  flush()

  return nodes
}

/**
 * Stacks layers from data: gradients, patterns, images, inline SVG, noise
 * and screentone. Plain background layers next to each other merge into one
 * element's multiple backgrounds; the rest render as their own layer.
 */
function Surface({
  layers = [],
  asChild = false,
  className,
  children,
  ...props
}: SurfaceProps) {
  const Comp = asChild ? Slot.Root : "div"
  const drifts = layers.some((layer) => "drift" in layer && layer.drift)

  return (
    <Comp
      // As a child, the host keeps its own data-slot (card, banner...), so
      // the key is left out rather than passed as undefined.
      {...(asChild ? null : { "data-slot": "surface" })}
      data-surface=""
      className={cn("relative isolate", className)}
      {...props}
    >
      {drifts ? (
        <style href="standard-surface" precedence="default">
          {surfaceKeyframes}
        </style>
      ) : null}
      {renderLayers(layers)}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
    </Comp>
  )
}

export {
  Surface,
  type SurfaceDrift,
  type SurfaceFit,
  type SurfaceLayer,
  type SurfaceProps,
}
