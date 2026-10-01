"use client"

import { useState } from "react"

import { Button } from "@/components/standard/button"
import {
  CircleWave,
  circleWaveDirections,
  circleWaveGradients,
  circleWavePaletteNames,
  circleWavePatterns,
  circleWaveVariants,
  type CircleWaveDirection,
  type CircleWaveGradient,
  type CircleWavePalette,
  type CircleWavePattern,
  type CircleWaveVariant,
} from "@/components/standard/circle-wave"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

const barCounts = ["48", "120", "240", "480"] as const
const toggles = ["glow", "spin", "rounded"] as const
type Toggle = (typeof toggles)[number]
const colorOptions = ["text", ...circleWavePaletteNames]

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

function RendersPlayground() {
  const [pattern, setPattern] = useState<CircleWavePattern>("bloom")
  const [variant, setVariant] = useState<CircleWaveVariant>("bars")
  const [direction, setDirection] = useState<CircleWaveDirection>("out")
  const [bars, setBars] = useState<(typeof barCounts)[number]>("120")
  const [colorName, setColorName] = useState("spectrum")
  const [gradient, setGradient] = useState<CircleWaveGradient>("sweep")
  const [on, setOn] = useState<Record<Toggle, boolean>>({
    glow: false,
    spin: false,
    rounded: false,
  })
  const [paused, setPaused] = useState(false)

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips
        options={circleWavePatterns}
        value={pattern}
        onChange={setPattern}
      />
      <div className="flex w-full justify-center">
        <CircleWave
          pattern={pattern}
          variant={variant}
          direction={direction}
          bars={Number(bars)}
          lines={variant === "lines" ? 10 : 1}
          palette={
            colorName === "text" ? undefined : (colorName as CircleWavePalette)
          }
          gradient={gradient}
          glow={on.glow}
          spin={on.spin ? 0.05 : 0}
          rounded={on.rounded}
          paused={paused}
          interactive
          className="size-72"
        />
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <RendersChips
          options={circleWaveVariants}
          value={variant}
          onChange={setVariant}
        />
        <RendersChips
          options={circleWaveDirections}
          value={direction}
          onChange={setDirection}
        />
        <RendersChips options={barCounts} value={bars} onChange={setBars} />
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">color</span>
        <RendersChips
          options={colorOptions}
          value={colorName}
          onChange={setColorName}
        />
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">gradient</span>
        <RendersChips
          options={circleWaveGradients}
          value={gradient}
          onChange={setGradient}
        />
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
        Hover the ring to push a bump out at the pointer.
      </p>
    </div>
  )
}

export function RendersStandardCircleWaveDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="ring · pick a pattern and a variant">
        <RendersPlayground />
      </RendersDemoCard>
      <RendersDemoCard fill label="variants">
        <div className="grid w-full grid-cols-2 place-items-center gap-4 sm:grid-cols-4">
          <CircleWave
            pattern="spectrum"
            variant="segments"
            bars={64}
            gap={0.3}
            className="size-36"
          />
          <CircleWave
            pattern="voice"
            direction="both"
            bars={160}
            gap={0.5}
            radius={0.75}
            className="size-36"
          />
          <CircleWave
            pattern="blob"
            variant="lines"
            lines={14}
            spread={0.15}
            palette="neon"
            gradient="sweep"
            thickness={1}
            className="size-36"
          />
          <CircleWave
            pattern="voice"
            variant="fill"
            bars={360}
            radius={0.7}
            className="size-36"
          />
          <CircleWave
            pattern="bloom"
            bars={90}
            gap={0.55}
            radius={0.4}
            frequency={1.4}
            className="size-36"
          />
          <CircleWave
            pattern="spectrum"
            variant="segments"
            bars={48}
            segments={10}
            palette="ember"
            gradient="level"
            className="size-36"
          />
          <CircleWave
            pattern="pulse"
            direction="in"
            bars={96}
            rounded
            palette="aurora"
            gradient="tip"
            radius={0.85}
            className="size-36"
          />
          <CircleWave
            pattern="blob"
            variant="fill"
            direction="both"
            palette="candy"
            gradient="sweep"
            radius={0.6}
            className="size-36"
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="neon · glow and spin">
        <div className="grid w-full grid-cols-2 place-items-center gap-4 sm:grid-cols-4">
          {(["spectrum", "neon", "ocean", "sunset"] as const).map(
            (palette, index) => (
              <CircleWave
                key={palette}
                pattern={(["spectrum", "voice", "interference", "bloom"] as const)[index]}
                bars={140}
                gap={0.45}
                rounded
                palette={palette}
                glow
                spin={index % 2 ? -0.04 : 0.04}
                className="size-36"
              />
            )
          )}
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="with center content">
        <div className="flex w-full justify-center">
          <CircleWave
            pattern="spectrum"
            bars={160}
            gap={0.4}
            rounded
            radius={0.62}
            palette="aurora"
            glow
            className="size-64"
          >
            <span className="font-mono text-sm text-muted-foreground">
              02:47
            </span>
          </CircleWave>
        </div>
      </RendersDemoCard>
    </div>
  )
}
