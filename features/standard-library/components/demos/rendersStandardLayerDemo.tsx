"use client"

import { useState, type ReactNode } from "react"

import { Button } from "@/components/standard/button"
import {
  ColorGrade,
  colorGradePresets,
  type ColorGradePreset,
} from "@/components/standard/color-grade"
import { Distort, distortKinds, type DistortKind } from "@/components/standard/distort"
import { Gradient, gradientKinds, type GradientKind } from "@/components/standard/gradient"
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
      <TabsList variant="line">
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
  const [kind, setKind] = useState<GradientKind | null>("mesh")
  const [placement, setPlacement] = useState<LayerPlacement>("behind")

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips clearable options={gradientKinds} value={kind} onChange={setKind} />
      <RendersChips
        options={placements}
        value={placement}
        onChange={(next) => next && setPlacement(next)}
      />
      <RendersTarget
        layers={
          kind && (
            <Gradient
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
        <TabsList variant="line">
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

/** Every primitive at once, to show they stack. */
function RendersStackedDemo() {
  return (
    <ColorGrade preset="vintage" className="w-full rounded-xl">
      <RendersTarget
        layers={
          <>
            <Gradient kind="mesh" />
            <Mask kind="fade" direction="bottom" softness={60} placement="behind">
              <Pattern kind="grid" size={20} />
            </Mask>
            <Noise kind="paper" blend="multiply" opacity={0.35} />
            <Noise kind="grain" placement="over" blend="overlay" opacity={0.25} />
          </>
        }
      />
    </ColorGrade>
  )
}

const LAYER_DEMOS: Record<string, () => ReactNode> = {
  Gradient: RendersGradientDemo,
  Noise: RendersNoiseDemo,
  Pattern: RendersPatternDemo,
  Screentone: RendersScreentoneDemo,
  "Color Grade": RendersColorGradeDemo,
  Distort: RendersDistortDemo,
  Mask: RendersMaskDemo,
}

export function RendersStandardLayerDemo({ pieceName }: { pieceName: string }) {
  const Demo = LAYER_DEMOS[pieceName] ?? RendersGradientDemo

  return (
    <>
      <RendersDemoCard fill label={`${pieceName.toLowerCase()} · on any relative isolate box`}>
        <Demo />
      </RendersDemoCard>
      <RendersDemoCard fill label="stacked · gradient + pattern + mask + noise + color grade">
        <RendersStackedDemo />
      </RendersDemoCard>
    </>
  )
}
