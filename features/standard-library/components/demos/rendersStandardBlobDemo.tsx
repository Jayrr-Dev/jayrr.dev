"use client"

import { useState } from "react"

import { Button } from "@/components/standard/button"
import {
  Blob,
  blobMaterials,
  blobMotions,
  blobPaletteNames,
  blobShapes,
  blobTints,
  type BlobMaterial,
  type BlobMotion,
  type BlobPalette,
  type BlobShape,
  type BlobTint,
} from "@/components/standard/blob"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

const blobCounts = ["3", "6", "9", "14"] as const
const wobbles = ["0", "0.35", "0.7"] as const
const gooLevels = ["0", "0.5", "1"] as const
const blendLevels = ["0", "0.5", "1"] as const

/** Flat single colors, in the spirit of hand-drawn blob shapes. */
const solids = [
  "oklch(0.55 0.25 320)",
  "oklch(0.65 0.18 150)",
  "oklch(0.6 0.2 285)",
  "oklch(0.8 0.16 75)",
  "oklch(0.7 0.17 35)",
  "oklch(0.75 0.13 200)",
  "var(--foreground)",
  "oklch(0.86 0.17 95)",
]
const toggles = ["merge", "liquid"] as const
type Toggle = (typeof toggles)[number]

/** A dark liquid for each palette, so the blobs read in either theme. */
const liquids: Record<BlobPalette, string> = {
  lava: "oklch(0.22 0.05 30)",
  plasma: "oklch(0.2 0.07 300)",
  slime: "oklch(0.2 0.04 180)",
  ocean: "oklch(0.18 0.05 260)",
  aurora: "oklch(0.18 0.05 280)",
  candy: "oklch(0.24 0.05 320)",
}

function RendersChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[]
  value: T
  onChange: (next: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((entry) => (
        <button
          key={entry}
          type="button"
          aria-pressed={entry === value}
          onClick={() => onChange(entry)}
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

/** Something busy to look through, so the glass has a backdrop to bend. */
const backdrop = {
  "--backdrop": [
    "radial-gradient(circle at 12% 75%, oklch(0.7 0.2 30) 0 56px, transparent 57px)",
    "radial-gradient(circle at 78% 62%, oklch(0.65 0.2 260) 0 72px, transparent 73px)",
    "radial-gradient(circle at 58% 18%, oklch(0.85 0.16 95) 0 40px, transparent 41px)",
    "radial-gradient(circle at 92% 12%, oklch(0.7 0.18 150) 0 28px, transparent 29px)",
    "repeating-linear-gradient(90deg, oklch(0.5 0 0 / 0.25) 0 1px, transparent 1px 24px)",
    "repeating-linear-gradient(0deg, oklch(0.5 0 0 / 0.25) 0 1px, transparent 1px 24px)",
  ].join(", "),
} as React.CSSProperties

function RendersLiquidGlass() {
  return (
    <div
      className="relative h-72 w-full overflow-hidden rounded-xl border border-border bg-background bg-(image:--backdrop)"
      style={backdrop}
    >
      <div className="absolute inset-0 flex flex-col justify-center gap-1 p-6">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          Liquid glass
        </span>
        <span className="max-w-xs text-sm text-muted-foreground">
          Clear blobs that bend what sits behind them at the edge, and melt
          together where they meet.
        </span>
      </div>
      <Blob
        material="glass"
        motion="drift"
        shape="rect"
        color="oklch(0.95 0 0)"
        count={5}
        size={0.18}
        wobble={0.3}
        morph={0.6}
        speed={0.7}
        interactive
        className="absolute inset-0 size-full"
      />
    </div>
  )
}

function RendersPlayground() {
  const [palette, setPalette] = useState<BlobPalette>("lava")
  const [motion, setMotion] = useState<BlobMotion>("lava")
  const [material, setMaterial] = useState<BlobMaterial>("solid")
  const [shape, setShape] = useState<BlobShape>("circle")
  const [tint, setTint] = useState<BlobTint>("heat")
  const [count, setCount] = useState<(typeof blobCounts)[number]>("6")
  const [wobble, setWobble] = useState<(typeof wobbles)[number]>("0.35")
  const [goo, setGoo] = useState<(typeof gooLevels)[number]>("0.5")
  const [blend, setBlend] = useState<(typeof blendLevels)[number]>("0.5")
  const [on, setOn] = useState<Record<Toggle, boolean>>({
    merge: false,
    liquid: true,
  })
  const [paused, setPaused] = useState(false)

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-wrap items-center gap-3">
        <RendersChips
          options={blobPaletteNames}
          value={palette}
          onChange={setPalette}
        />
        <RendersChips
          options={blobMaterials}
          value={material}
          onChange={setMaterial}
        />
      </div>
      <div className="flex w-full justify-center">
        <Blob
          palette={palette}
          motion={motion}
          material={material}
          shape={shape}
          tint={tint}
          count={Number(count)}
          wobble={Number(wobble)}
          goo={Number(goo)}
          blend={Number(blend)}
          merge={on.merge}
          liquid={on.liquid ? liquids[palette] : undefined}
          paused={paused}
          interactive
          className={shape === "circle" ? "size-72" : "h-80 w-40"}
        />
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <RendersChips
          options={blobMotions}
          value={motion}
          onChange={setMotion}
        />
        <RendersChips options={blobShapes} value={shape} onChange={setShape} />
        <RendersChips options={blobTints} value={tint} onChange={setTint} />
        <RendersChips options={blobCounts} value={count} onChange={setCount} />
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">wobble</span>
        <RendersChips options={wobbles} value={wobble} onChange={setWobble} />
        <span className="font-mono text-xs text-muted-foreground">goo</span>
        <RendersChips options={gooLevels} value={goo} onChange={setGoo} />
        <span className="font-mono text-xs text-muted-foreground">blend</span>
        <RendersChips options={blendLevels} value={blend} onChange={setBlend} />
        <div className="flex flex-wrap gap-1.5">
          {toggles.map((entry) => (
            <button
              key={entry}
              type="button"
              aria-pressed={on[entry]}
              onClick={() => setOn((was) => ({ ...was, [entry]: !was[entry] }))}
              className={cn(
                "rounded-md border border-border px-2 py-1 font-mono text-xs transition-colors",
                on[entry]
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              {entry}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          tone="outline"
          onClick={() => setPaused((was) => !was)}
        >
          {paused ? "Resume" : "Pause"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Move the pointer through the field to stir the blobs; they fuse with the
        pointer as it passes.
      </p>
    </div>
  )
}

export function RendersStandardBlobDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="blobs · pick a palette and a motion">
        <RendersPlayground />
      </RendersDemoCard>
      <RendersDemoCard fill label="liquid glass · move the pointer through it">
        <RendersLiquidGlass />
      </RendersDemoCard>
      <RendersDemoCard fill label="glass and water">
        <div className="grid w-full grid-cols-2 place-items-center gap-4 sm:grid-cols-4">
          <Blob
            material="glass"
            refract={false}
            motion="drift"
            count={1}
            size={0.32}
            wobble={0.45}
            color="var(--foreground)"
            className="size-36"
          />
          <Blob
            material="water"
            motion="drift"
            count={1}
            size={0.3}
            wobble={0.35}
            color="oklch(0.7 0.15 240)"
            className="size-36"
          />
          <Blob
            material="glass"
            refract={false}
            palette="candy"
            tint="blob"
            liquid={liquids.candy}
            merge
            count={7}
            size={0.12}
            className="size-36"
          />
          <Blob
            material="water"
            palette="slime"
            liquid={liquids.slime}
            merge
            count={8}
            size={0.11}
            className="size-36"
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard
        fill
        label="solid · one blob, one color, colors fading together"
      >
        <div className="grid w-full grid-cols-2 place-items-center gap-4 sm:grid-cols-4">
          <Blob
            motion="drift"
            count={1}
            size={0.32}
            wobble={0.4}
            color={solids[0]}
            seed={4}
            className="size-36"
          />
          <Blob
            motion="drift"
            count={1}
            size={0.32}
            wobble={0.66}
            morph={1.4}
            color={solids[3]}
            seed={7}
            className="size-36"
          />
          <Blob
            motion="drift"
            count={5}
            size={0.13}
            wobble={0.45}
            color={solids[5]}
            seed={10}
            className="size-36"
          />
          <Blob
            motion="drift"
            tint="blob"
            palette="plasma"
            count={5}
            size={0.15}
            wobble={0.5}
            shape="rect"
            seed={3}
            className="size-36"
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="lamps · lava rises, cools and sinks">
        <div className="flex w-full flex-wrap items-end justify-center gap-6">
          <Blob
            shape="capsule"
            palette="lava"
            liquid={liquids.lava}
            count={5}
            size={0.22}
            className="h-72 w-28"
          />
          <Blob
            shape="capsule"
            palette="plasma"
            liquid={liquids.plasma}
            merge
            count={7}
            size={0.2}
            className="h-72 w-28"
          />
        </div>
      </RendersDemoCard>
    </div>
  )
}
