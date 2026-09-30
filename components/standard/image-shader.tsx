"use client"

import * as React from "react"
import {
  FlutedGlass,
  flutedGlassPresets,
  GemSmoke,
  gemSmokePresets,
  HalftoneCmyk,
  halftoneCmykPresets,
  HalftoneDots,
  halftoneDotsPresets,
  Heatmap,
  heatmapPresets,
  ImageDithering,
  imageDitheringPresets,
  LensDistortion,
  lensDistortionPresets,
  LiquidMetal,
  liquidMetalPresets,
  PaperTexture,
  paperTexturePresets,
  Water,
  waterPresets,
} from "@paper-design/shaders-react"

import { layerProps, type LayerProps } from "@/components/standard/layer"

type ImageShaderParams = Record<string, unknown>

type ImageShaderEntry = {
  Component: React.ComponentType<ImageShaderParams>
  presets: { name: string; params: ImageShaderParams }[]
}

const entry = (Component: unknown, presets: unknown): ImageShaderEntry => ({
  Component: Component as ImageShaderEntry["Component"],
  presets: presets as ImageShaderEntry["presets"],
})

/** Paper Shaders that take a source image, keyed by kind. */
const imageShaders = {
  "paper-texture": entry(PaperTexture, paperTexturePresets),
  "fluted-glass": entry(FlutedGlass, flutedGlassPresets),
  water: entry(Water, waterPresets),
  "image-dithering": entry(ImageDithering, imageDitheringPresets),
  "halftone-dots": entry(HalftoneDots, halftoneDotsPresets),
  "halftone-cmyk": entry(HalftoneCmyk, halftoneCmykPresets),
  "lens-distortion": entry(LensDistortion, lensDistortionPresets),
  heatmap: entry(Heatmap, heatmapPresets),
  "liquid-metal": entry(LiquidMetal, liquidMetalPresets),
  "gem-smoke": entry(GemSmoke, gemSmokePresets),
} satisfies Record<string, ImageShaderEntry>

type ImageShaderKind = keyof typeof imageShaders

/**
 * Filters restyle a photo. Logo effects read a shape's silhouette (a mark
 * on a transparent background) and animate around it.
 */
const imageShaderGroups = {
  filter: [
    "paper-texture",
    "fluted-glass",
    "water",
    "image-dithering",
    "halftone-dots",
    "halftone-cmyk",
    "lens-distortion",
  ],
  logo: ["heatmap", "liquid-metal", "gem-smoke"],
} as const satisfies Record<string, readonly ImageShaderKind[]>

const imageShaderKinds = Object.keys(imageShaders) as ImageShaderKind[]

/** Preset names for a kind, in Paper's order. The first is the default. */
function imageShaderPresetNames(kind: ImageShaderKind) {
  return imageShaders[kind].presets.map((preset) => preset.name)
}

type ImageShaderProps = LayerProps & {
  kind?: ImageShaderKind
  /**
   * Source image URL. Must be same-origin or served with CORS, since WebGL
   * reads its pixels. Logo kinds want a mark on a transparent background.
   */
  src: string
  /** A preset name from `imageShaderPresetNames(kind)`. Defaults to the first. */
  preset?: string
  /** Overrides on top of the preset, e.g. `{ colorBack: "#000" }`. */
  params?: ImageShaderParams
  /** Animation speed. 0 renders a still frame. Always 0 under reduced motion. */
  speed?: number
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

/**
 * WebGL image effect layer from Paper Shaders: photo filters (paper, fluted
 * glass, water, dithering, halftone, lens) and logo animations (heatmap,
 * liquid metal, gem smoke). Fills its `relative isolate` parent.
 */
function ImageShader({
  kind = "halftone-dots",
  src,
  preset,
  params,
  speed,
  ...layer
}: ImageShaderProps) {
  const reduced = usesReducedMotion()
  const { Component, presets } = imageShaders[kind]
  const chosen = presets.find((entry) => entry.name === preset) ?? presets[0]
  const props = layerProps(layer, "image-shader")
  const presetSpeed = chosen.params.speed

  return (
    <div {...props} data-kind={kind} data-preset={chosen.name}>
      <Component
        {...chosen.params}
        {...params}
        image={src}
        speed={reduced ? 0 : (speed ?? presetSpeed)}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}

export {
  ImageShader,
  imageShaderGroups,
  imageShaderKinds,
  imageShaderPresetNames,
  type ImageShaderKind,
  type ImageShaderProps,
}
