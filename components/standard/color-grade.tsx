"use client"

import * as React from "react"

import { layerProps, type LayerProps } from "@/components/standard/layer"

const colorGradePresets = [
  "sepia",
  "bw",
  "noir",
  "vivid",
  "muted",
  "vintage",
  "warm",
  "cool",
  "duotone",
] as const

type ColorGradePreset = (typeof colorGradePresets)[number]

const presetFilters: Record<Exclude<ColorGradePreset, "duotone">, string> = {
  sepia: "sepia(1)",
  bw: "grayscale(1)",
  noir: "grayscale(1) contrast(1.4) brightness(0.9)",
  vivid: "saturate(1.8) contrast(1.05)",
  muted: "saturate(0.5)",
  vintage: "sepia(0.45) contrast(1.1) saturate(1.2) hue-rotate(-10deg) brightness(1.05)",
  warm: "sepia(0.25) saturate(1.3) hue-rotate(-12deg)",
  cool: "saturate(1.1) hue-rotate(12deg) brightness(1.02)",
}

/** Fine-tuning on top of a preset. 1 is unchanged, except sepia, grayscale and hue. */
type ColorAdjust = {
  sepia?: number
  grayscale?: number
  saturate?: number
  contrast?: number
  brightness?: number
  /** Degrees. */
  hue?: number
  invert?: number
}

type ColorGradeProps = Omit<LayerProps, "placement"> & {
  preset?: ColorGradePreset
  adjust?: ColorAdjust
  /** Shadow and highlight hex colors for the duotone preset. */
  duotone?: [string, string]
  /**
   * With children, grades them. Without, grades whatever is painted behind
   * the layer (backdrop), so it works over backgrounds you don't own.
   */
  children?: React.ReactNode
}

function adjustFilter({
  sepia,
  grayscale,
  saturate,
  contrast,
  brightness,
  hue,
  invert,
}: ColorAdjust) {
  return [
    sepia !== undefined && `sepia(${sepia})`,
    grayscale !== undefined && `grayscale(${grayscale})`,
    saturate !== undefined && `saturate(${saturate})`,
    contrast !== undefined && `contrast(${contrast})`,
    brightness !== undefined && `brightness(${brightness})`,
    hue !== undefined && `hue-rotate(${hue}deg)`,
    invert !== undefined && `invert(${invert})`,
  ]
    .filter(Boolean)
    .join(" ")
}

/** "#rrggbb" or "#rgb" to 0–1 channels. */
function hexChannels(hex: string) {
  const value = hex.replace("#", "")
  const full =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value

  return [0, 2, 4].map((start) => parseInt(full.slice(start, start + 2), 16) / 255)
}

/** Maps luminance onto a shadow → highlight ramp. */
function DuotoneFilter({ id, colors }: { id: string; colors: [string, string] }) {
  const [shadow, highlight] = colors.map(hexChannels)

  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="table" tableValues={`${shadow[0]} ${highlight[0]}`} />
          <feFuncG type="table" tableValues={`${shadow[1]} ${highlight[1]}`} />
          <feFuncB type="table" tableValues={`${shadow[2]} ${highlight[2]}`} />
        </feComponentTransfer>
      </filter>
    </svg>
  )
}

/** Color treatment: sepia, black and white, saturation, duotone and more. */
function ColorGrade({
  preset,
  adjust,
  duotone = ["#1b0f3b", "#ffc98b"],
  children,
  className,
  style,
  ...layer
}: ColorGradeProps) {
  const filterId = `color-grade-${React.useId().replace(/:/g, "")}`
  const filter =
    [
      preset === "duotone" ? `url(#${filterId})` : preset && presetFilters[preset],
      adjust && adjustFilter(adjust),
    ]
      .filter(Boolean)
      .join(" ") || "none"

  const svg =
    preset === "duotone" ? <DuotoneFilter id={filterId} colors={duotone} /> : null

  if (children !== undefined) {
    return (
      <div
        data-slot="color-grade"
        data-preset={preset}
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
    "color-grade"
  )

  return (
    <>
      {svg}
      <div
        {...props}
        data-preset={preset}
        style={{ backdropFilter: filter, WebkitBackdropFilter: filter, ...props.style }}
      />
    </>
  )
}

export {
  ColorGrade,
  colorGradePresets,
  type ColorAdjust,
  type ColorGradePreset,
  type ColorGradeProps,
}
