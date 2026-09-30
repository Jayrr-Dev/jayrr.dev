"use client"

import { useState, type ReactNode } from "react"

import { Button } from "@/components/standard/button"
import { Card } from "@/components/standard/card"
import {
  ColorGrade,
  colorGradePresets,
  type ColorGradePreset,
} from "@/components/standard/color-grade"
import { Distort, distortKinds, type DistortKind } from "@/components/standard/distort"
import {
  Gradient,
  gradientKinds,
  gradientPresets,
  type GradientKind,
  type GradientPreset,
} from "@/components/standard/gradient"
import type { LayerPlacement } from "@/components/standard/layer"
import { Mask, maskKinds, type MaskKind } from "@/components/standard/mask"
import { Noise, noiseKinds, type NoiseKind } from "@/components/standard/noise"
import {
  basicPatternKinds,
  decorativePatternKinds,
  graphicPatternKinds,
  materialPatternKinds,
  Pattern,
  type PatternKind,
} from "@/components/standard/pattern"
import {
  Screentone,
  screentoneGradations,
  screentoneKinds,
  screentoneTextures,
  type ScreentoneKind,
  type ScreentoneTone,
} from "@/components/standard/screentone"
import {
  ImageShader,
  imageShaderGroups,
  imageShaderPresetNames,
  type ImageShaderKind,
} from "@/components/standard/image-shader"
import {
  Shader,
  shaderGroups,
  shaderPresetNames,
  type ShaderKind,
} from "@/components/standard/shader"
import { Surface, type SurfaceLayer } from "@/components/standard/surface"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

const placements: LayerPlacement[] = ["behind", "over"]

/** A colorful strip so color and distort changes are easy to see. */
const swatchImage =
  "linear-gradient(90deg, oklch(0.63 0.22 25) 0 25%, oklch(0.7 0.18 145) 0 50%, oklch(0.6 0.2 255) 0 75%, oklch(0.82 0.16 85) 0)"

/** With `clearable`, clicking the active chip deselects it to show the surface without the layer. */
function RendersChips<T extends string>({
  options,
  value,
  onChange,
  clearable,
}: {
  options: readonly T[]
  value: T | null
  onChange: (next: T | null) => void
  clearable?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((entry) => (
        <button
          key={entry}
          type="button"
          aria-pressed={entry === value}
          onClick={() => onChange(clearable && entry === value ? null : entry)}
          className={cn(
            "rounded-md border border-border px-2 py-1 font-mono text-xs transition-colors",
            entry === value
              ? "bg-foreground text-background"
              : "bg-background text-muted-foreground hover:text-foreground"
          )}
        >
          {entry}
        </button>
      ))}
    </div>
  )
}

/** Chip groups behind line tabs, so long option lists stay compact. */
function RendersTabbedChips<T extends string>({
  groups,
  value,
  onChange,
  clearable,
}: {
  groups: { label: string; options: readonly T[] }[]
  value: T | null
  onChange: (next: T | null) => void
  clearable?: boolean
}) {
  const [tab, setTab] = useState(
    () =>
      groups.find((group) => value && group.options.includes(value))?.label ??
      groups[0].label
  )
  const active = groups.find((group) => group.label === tab) ?? groups[0]

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList variant="line" className="h-auto max-w-full flex-wrap justify-start group-data-horizontal/tabs:h-auto [&>[data-slot=tabs-trigger]]:h-8 [&>[data-slot=tabs-trigger]]:flex-none">
        {groups.map((group) => (
          <TabsTrigger key={group.label} value={group.label}>
            {group.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <RendersChips
        clearable={clearable}
        options={active.options}
        value={value}
        onChange={onChange}
      />
    </Tabs>
  )
}

/** Stand-in component the layers sit on. `relative isolate` is all a host needs. */
function RendersTarget({
  layers,
  className,
  children,
}: {
  layers?: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        "relative isolate flex h-56 w-full flex-col justify-end gap-2 overflow-clip rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      {layers}
      {children ?? <RendersTargetContent />}
    </div>
  )
}

function RendersTargetContent() {
  return (
    <>
      <div className="h-8 w-full rounded-md" style={{ backgroundImage: swatchImage }} />
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-base font-semibold">Layered surface</p>
          <p className="text-sm text-muted-foreground">Text stays on top of behind layers.</p>
        </div>
        <Button size="sm">Action</Button>
      </div>
    </>
  )
}

const stillness = ["still", "animated"] as const

function RendersGradientDemo() {
  const [look, setLook] = useState<GradientKind | GradientPreset | null>("mesh")
  const [placement, setPlacement] = useState<LayerPlacement>("behind")
  const preset = gradientPresets.find((entry) => entry === look)
  const kind = gradientKinds.find((entry) => entry === look)

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips clearable options={gradientKinds} value={kind ?? null} onChange={setLook} />
      <RendersChips clearable options={gradientPresets} value={preset ?? null} onChange={setLook} />
      <RendersChips
        options={placements}
        value={placement}
        onChange={(next) => next && setPlacement(next)}
      />
      <RendersTarget
        // Parchment stays light in dark mode, so its text stays dark.
        className={cn(
          preset === "parchment" &&
            placement === "behind" &&
            "text-zinc-900 [&_.text-muted-foreground]:text-zinc-600"
        )}
        layers={
          look && (
            <Gradient
              preset={preset}
              kind={kind}
              placement={placement}
              blend={placement === "over" ? "soft-light" : undefined}
            />
          )
        }
      />
    </div>
  )
}

function RendersNoiseDemo() {
  const [kind, setKind] = useState<NoiseKind | null>("grain")
  const [motion, setMotion] = useState<(typeof stillness)[number]>("still")

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips clearable options={noiseKinds} value={kind} onChange={setKind} />
      <RendersChips
        options={stillness}
        value={motion}
        onChange={(next) => next && setMotion(next)}
      />
      <RendersTarget
        className="h-80"
        layers={
          <>
            <Gradient kind="mesh" />
            {kind && (
              <Noise
                kind={kind}
                animate={motion === "animated"}
                blend="overlay"
                opacity={0.6}
              />
            )}
          </>
        }
      />
    </div>
  )
}

function RendersPatternDemo() {
  const [kind, setKind] = useState<PatternKind | null>("dots")

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersTabbedChips
        clearable
        groups={[
          { label: "Basic", options: basicPatternKinds },
          { label: "Graphic", options: graphicPatternKinds },
          { label: "Decorative", options: decorativePatternKinds },
          { label: "Material", options: materialPatternKinds },
        ]}
        value={kind}
        onChange={setKind}
      />
      <RendersTarget
        layers={
          kind && (
            <Mask kind="fade" direction="bottom" softness={70} placement="behind">
              <Pattern
                kind={kind}
                color="color-mix(in oklch, var(--foreground) 28%, transparent)"
              />
            </Mask>
          )
        }
      />
    </div>
  )
}

const finishes = ["clean", "rough"] as const

function RendersScreentoneDemo() {
  const [kind, setKind] = useState<ScreentoneKind | null>("dots")
  const [tone, setTone] = useState<ScreentoneTone>("clouds")
  const [finish, setFinish] = useState<(typeof finishes)[number]>("clean")

  return (
    <div className="flex w-full flex-col gap-3">
      <Tabs defaultValue="shape" className="w-full">
        <TabsList variant="line" className="h-auto max-w-full flex-wrap justify-start group-data-horizontal/tabs:h-auto [&>[data-slot=tabs-trigger]]:h-8 [&>[data-slot=tabs-trigger]]:flex-none">
          <TabsTrigger value="shape">Shape</TabsTrigger>
          <TabsTrigger value="gradation">Gradation</TabsTrigger>
          <TabsTrigger value="organic">Organic</TabsTrigger>
          <TabsTrigger value="finish">Finish</TabsTrigger>
        </TabsList>
        <TabsContent value="shape">
          <RendersChips clearable options={screentoneKinds} value={kind} onChange={setKind} />
        </TabsContent>
        <TabsContent value="gradation">
          <RendersChips
            options={screentoneGradations}
            value={tone}
            onChange={(next) => next && setTone(next)}
          />
        </TabsContent>
        <TabsContent value="organic">
          <RendersChips
            options={screentoneTextures}
            value={tone}
            onChange={(next) => next && setTone(next)}
          />
        </TabsContent>
        <TabsContent value="finish">
          <RendersChips
            options={finishes}
            value={finish}
            onChange={(next) => next && setFinish(next)}
          />
        </TabsContent>
      </Tabs>
      <RendersTarget
        className="h-72"
        layers={
          kind && (
            <Screentone
              kind={kind}
              tone={tone}
              rough={finish === "rough"}
              color="color-mix(in oklch, var(--foreground) 38%, transparent)"
            />
          )
        }
      />
    </div>
  )
}

function RendersShaderDemo() {
  const [kind, setKind] = useState<ShaderKind | null>("mesh-gradient")
  const [preset, setPreset] = useState<string | null>(null)
  const presets = kind ? shaderPresetNames(kind) : []

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersTabbedChips
        clearable
        groups={[
          { label: "Color", options: shaderGroups.gradient },
          { label: "Noise", options: shaderGroups.noise },
          { label: "Dots", options: shaderGroups.dots },
          { label: "Light", options: shaderGroups.light },
          { label: "Fractal", options: shaderGroups.fractal },
          { label: "Retro", options: shaderGroups.retro },
          { label: "Code", options: shaderGroups.code },
        ]}
        value={kind}
        onChange={(next) => {
          setKind(next)
          setPreset(null)
        }}
      />
      {presets.length > 1 ? (
        <RendersChips
          options={presets}
          value={preset ?? presets[0]}
          onChange={(next) => next && setPreset(next)}
        />
      ) : null}
      <RendersTarget
        className="h-72"
        layers={kind && <Shader kind={kind} preset={preset ?? undefined} />}
      />
    </div>
  )
}

const sampleImages = {
  scene: "/fx/sample-scene.svg",
  logo: "/fx/sample-logo.svg",
}

function RendersImageShaderDemo() {
  const [kind, setKind] = useState<ImageShaderKind | null>("halftone-dots")
  const [preset, setPreset] = useState<string | null>(null)
  const presets = kind ? imageShaderPresetNames(kind) : []
  const isLogo = kind !== null && (imageShaderGroups.logo as readonly string[]).includes(kind)

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersTabbedChips
        clearable
        groups={[
          { label: "Filter", options: imageShaderGroups.filter },
          { label: "Logo", options: imageShaderGroups.logo },
        ]}
        value={kind}
        onChange={(next) => {
          setKind(next)
          setPreset(null)
        }}
      />
      {presets.length > 1 ? (
        <RendersChips
          options={presets}
          value={preset ?? presets[0]}
          onChange={(next) => next && setPreset(next)}
        />
      ) : null}
      <RendersTarget
        className="h-72"
        layers={
          kind ? (
            <ImageShader
              kind={kind}
              preset={preset ?? undefined}
              src={isLogo ? sampleImages.logo : sampleImages.scene}
            />
          ) : (
            // Without an effect, show the untouched source.
            <img
              alt=""
              src={sampleImages.scene}
              className="absolute inset-0 -z-10 size-full rounded-[inherit] object-cover"
            />
          )
        }
      />
    </div>
  )
}

function RendersColorGradeDemo() {
  const [preset, setPreset] = useState<ColorGradePreset | null>("sepia")
  const grade = preset ?? undefined

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips
        clearable
        options={colorGradePresets}
        value={preset}
        onChange={setPreset}
      />
      <div className="grid w-full gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Wrapping content</span>
          <ColorGrade preset={grade} className="rounded-xl">
            <RendersTarget layers={<Gradient kind="mesh" />} />
          </ColorGrade>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Backdrop, left half</span>
          <RendersTarget
            layers={
              <>
                <Gradient kind="mesh" />
                {grade && (
                  <ColorGrade preset={grade} style={{ clipPath: "inset(0 50% 0 0)" }} />
                )}
              </>
            }
          />
        </div>
      </div>
    </div>
  )
}

function RendersDistortDemo() {
  const [kind, setKind] = useState<DistortKind | null>("waves")
  const [motion, setMotion] = useState<(typeof stillness)[number]>("animated")
  const layers = (
    <>
      <Gradient kind="mesh" placement="behind" className="-inset-6" />
      <Pattern kind="grid" size={22} placement="behind" />
    </>
  )
  const groupClass = "absolute inset-0 -z-10 rounded-[inherit]"

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips clearable options={distortKinds} value={kind} onChange={setKind} />
      <RendersChips
        options={stillness}
        value={motion}
        onChange={(next) => next && setMotion(next)}
      />
      <RendersTarget
        layers={
          kind ? (
            <Distort kind={kind} animate={motion === "animated"} className={groupClass}>
              {layers}
            </Distort>
          ) : (
            <div className={groupClass}>{layers}</div>
          )
        }
      />
    </div>
  )
}

function RendersMaskDemo() {
  const [kind, setKind] = useState<MaskKind | null>("fade")
  const layers = (
    <>
      <Gradient kind="mesh" />
      <Noise kind="grain" blend="overlay" opacity={0.5} />
    </>
  )

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips clearable options={maskKinds} value={kind} onChange={setKind} />
      <RendersTarget
        layers={
          kind ? (
            <Mask kind={kind} softness={60} at="30% 30%" placement="behind">
              {layers}
            </Mask>
          ) : (
            layers
          )
        }
      />
    </div>
  )
}

const hillsSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 100' preserveAspectRatio='none'><path d='M0 62Q70 28 150 54T290 44T400 58V100H0Z' fill='rgb(40 10 50 / .55)'/><path d='M0 80Q110 52 220 76T400 70V100H0Z' fill='rgb(30 5 40 / .8)'/></svg>"

const starsSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><g fill='white'><circle cx='12' cy='18' r='1'/><circle cx='64' cy='9' r='.6'/><circle cx='98' cy='40' r='1.2'/><circle cx='36' cy='62' r='.7'/><circle cx='82' cy='88' r='1'/><circle cx='20' cy='104' r='.6'/><circle cx='110' cy='112' r='.8'/></g></svg>"

/** Ready-made stacks. Layers run bottom to top. */
const surfaceStacks = {
  aurora: [
    { type: "gradient", preset: "aurora" },
    { type: "pattern", kind: "grid", size: 24, color: "rgb(255 255 255 / 0.12)" },
    { type: "gradient", preset: "vignette" },
    { type: "noise", kind: "grain", blend: "overlay", opacity: 0.5 },
  ],
  dusk: [
    { type: "gradient", preset: "sunset" },
    { type: "gradient", kind: "radial", colors: ["oklch(0.97 0.08 90)", "transparent 12%"], at: "70% 38%" },
    { type: "svg", svg: hillsSvg, size: "100% 55%", position: "bottom", repeat: "no-repeat" },
  ],
  night: [
    { type: "gradient", preset: "midnight" },
    { type: "svg", svg: starsSvg, size: "120px 120px", drift: { x: "120px", duration: 40 } },
    { type: "svg", svg: starsSvg, size: "60px 60px", opacity: 0.5, drift: { x: "60px", duration: 40 } },
    { type: "gradient", preset: "scrim" },
  ],
  blueprint: [
    { type: "gradient", colors: ["oklch(0.45 0.13 255)", "oklch(0.35 0.12 260)"], angle: 180 },
    { type: "pattern", kind: "blueprint", size: 12, color: "rgb(255 255 255 / 0.3)" },
    { type: "noise", kind: "paper", blend: "soft-light" },
  ],
  halftone: [
    { type: "gradient", preset: "peach" },
    { type: "screentone", kind: "dots", tone: "corner", color: "rgb(120 40 20 / 0.35)" },
  ],
} satisfies Record<string, SurfaceLayer[]>

type SurfaceStack = keyof typeof surfaceStacks

const surfaceStackNames = Object.keys(surfaceStacks) as SurfaceStack[]

function RendersSurfaceDemo() {
  const [stack, setStack] = useState<SurfaceStack>("aurora")
  const layers: SurfaceLayer[] = surfaceStacks[stack]
  // Light-backed stacks keep dark text in either theme.
  const lightBacked = stack === "halftone"

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips
        options={surfaceStackNames}
        value={stack}
        onChange={(next) => next && setStack(next)}
      />
      <div className="grid w-full gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">As a div</span>
          <Surface
            layers={layers}
            className={cn(
              "flex h-56 flex-col justify-end gap-1 overflow-clip rounded-xl border border-border p-4",
              lightBacked ? "text-zinc-900" : "text-white"
            )}
          >
            <p className="text-base font-semibold">{stack}</p>
            <p className={cn("text-sm", lightBacked ? "text-zinc-700" : "text-white/75")}>
              {layers.length} layers from props.
            </p>
          </Surface>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">asChild on a Card</span>
          <Surface asChild layers={layers}>
            <Card
              title="Card with layers"
              meta="The Card keeps its own styles and slots."
              className={cn(
                "h-56 justify-end overflow-clip",
                lightBacked
                  ? "text-zinc-900 [&_[data-slot=card-meta]]:text-zinc-700"
                  : "text-white [&_[data-slot=card-meta]]:text-white/75"
              )}
            />
          </Surface>
        </div>
      </div>
      <pre className="max-h-48 overflow-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-xs">
        {JSON.stringify(layers, (key, value) => (key === "svg" ? "<svg …>" : value), 2)}
      </pre>
    </div>
  )
}

const LAYER_DEMOS: Record<string, () => ReactNode> = {
  Gradient: RendersGradientDemo,
  Noise: RendersNoiseDemo,
  Pattern: RendersPatternDemo,
  Screentone: RendersScreentoneDemo,
  Shader: RendersShaderDemo,
  "Image Shader": RendersImageShaderDemo,
  "Color Grade": RendersColorGradeDemo,
  Distort: RendersDistortDemo,
  Mask: RendersMaskDemo,
  Surface: RendersSurfaceDemo,
}

export function RendersStandardLayerDemo({ pieceName }: { pieceName: string }) {
  const Demo = LAYER_DEMOS[pieceName] ?? RendersGradientDemo

  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label={`${pieceName.toLowerCase()} · on any relative isolate box`}>
        <Demo />
      </RendersDemoCard>
    </div>
  )
}
