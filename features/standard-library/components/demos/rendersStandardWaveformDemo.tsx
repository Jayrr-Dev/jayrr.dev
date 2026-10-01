"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/standard/button"
import {
  Waveform,
  waveformAnchors,
  waveformFades,
  waveformGradients,
  waveformOrientations,
  waveformPaletteNames,
  waveformPatterns,
  type WaveformAnchor,
  type WaveformFade,
  type WaveformFunction,
  type WaveformGradient,
  type WaveformOrientation,
  type WaveformPalette,
  type WaveformPattern,
} from "@/components/standard/waveform"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

const barCounts = ["48", "128", "320", "800"] as const
const gaps = ["0", "0.15", "0.35", "0.6"] as const

const solids = [
  { label: "text", value: undefined },
  { label: "lime", value: "oklch(0.93 0.21 118)" },
]
const colorOptions = [
  ...solids.map((entry) => entry.label),
  ...waveformPaletteNames,
]

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
  const [pattern, setPattern] = useState<WaveformPattern>("interference")
  const [anchor, setAnchor] = useState<WaveformAnchor>("bottom")
  const [bars, setBars] = useState<(typeof barCounts)[number]>("128")
  const [gap, setGap] = useState<(typeof gaps)[number]>("0")
  const [colorName, setColorName] = useState("aurora")
  const [gradient, setGradient] = useState<WaveformGradient>("tip")
  const [fade, setFade] = useState<WaveformFade>("none")
  const [orientation, setOrientation] =
    useState<WaveformOrientation>("horizontal")
  const [paused, setPaused] = useState(false)
  const solid = solids.find((entry) => entry.label === colorName)
  const vertical = orientation === "vertical"

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips
        options={waveformPatterns}
        value={pattern}
        onChange={setPattern}
      />
      <div className={cn("flex w-full", vertical && "justify-center")}>
        <Waveform
          pattern={pattern}
          orientation={orientation}
          anchor={anchor}
          bars={Number(bars)}
          gap={Number(gap)}
          color={solid?.value}
          palette={solid ? undefined : (colorName as WaveformPalette)}
          gradient={gradient}
          fade={fade}
          paused={paused}
          interactive
          className={vertical ? "h-80 w-48" : "h-48"}
        />
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <RendersChips
          options={waveformOrientations}
          value={orientation}
          onChange={setOrientation}
        />
        <RendersChips
          options={waveformAnchors}
          value={anchor}
          onChange={setAnchor}
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
          options={waveformGradients}
          value={gradient}
          onChange={setGradient}
        />
        <span className="font-mono text-xs text-muted-foreground">fade</span>
        <RendersChips options={waveformFades} value={fade} onChange={setFade} />
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">gap</span>
        <RendersChips options={gaps} value={gap} onChange={setGap} />
        <Button
          size="sm"
          tone="outline"
          onClick={() => setPaused((was) => !was)}
        >
          {paused ? "Resume" : "Pause"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Hover the field to push a bump into the wave.
      </p>
    </div>
  )
}

/** A wave written inline: two beating sines under a slow swell. */
const beats: WaveformFunction = (x, t) =>
  0.5 +
  0.3 * Math.sin(x * 40 - t * 4) * Math.sin(x * 3 + t * 0.7) +
  0.12 * Math.sin(x * 6 - t)

/** Random levels that change a few times a second, eased by `smoothing`. */
function RendersMeter() {
  const [levels, setLevels] = useState(() => Array<number>(32).fill(0))

  useEffect(() => {
    const timer = window.setInterval(
      () =>
        setLevels((was) =>
          was.map((_, index) => Math.random() * (1 - index / 48))
        ),
      180
    )
    return () => window.clearInterval(timer)
  }, [])

  return (
    <Waveform
      value={levels}
      gap={0.25}
      smoothing={0.7}
      color="oklch(0.93 0.21 118)"
      label="Level meter"
    />
  )
}

export function RendersStandardWaveformDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="field · pick a pattern, hover to push">
        <RendersPlayground />
      </RendersDemoCard>
      <RendersDemoCard fill label="gradients · tip, span and level">
        <div className="flex w-full flex-col gap-3">
          <Waveform
            pattern="voice"
            anchor="center"
            bars={480}
            palette="sunset"
            gradient="span"
            fade="edges"
            className="h-28"
          />
          <div className="grid w-full grid-cols-2 gap-3">
            <Waveform
              pattern="terrain"
              bars={320}
              palette="ocean"
              fade="tip"
            />
            <Waveform
              pattern="spectrum"
              bars={64}
              gap={0.2}
              palette="ember"
              gradient="level"
            />
            <Waveform
              pattern="ripple"
              anchor="center"
              bars={240}
              palette="neon"
              gradient="span"
            />
            <Waveform
              pattern="breathe"
              anchor="center"
              bars={320}
              colors={["var(--muted-foreground)", "var(--foreground)"]}
              fade="both"
            />
          </div>
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="vertical · bars stacked top to bottom">
        <div className="grid w-full grid-cols-4 gap-3">
          <Waveform
            orientation="vertical"
            pattern="sine"
            bars={160}
            palette="aurora"
          />
          <Waveform
            orientation="vertical"
            pattern="voice"
            anchor="center"
            bars={200}
            palette="candy"
            gradient="span"
          />
          <Waveform
            orientation="vertical"
            pattern="spectrum"
            bars={40}
            gap={0.25}
            palette="ember"
            gradient="level"
          />
          <Waveform
            orientation="vertical"
            pattern="heartbeat"
            anchor="top"
            bars={200}
            palette="ocean"
            fade="tip"
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="dense · hundreds of packed bars">
        <div className="flex w-full flex-col gap-3">
          <Waveform
            pattern="voice"
            anchor="center"
            bars={480}
            className="h-28"
          />
          <div className="grid w-full grid-cols-2 gap-3">
            <Waveform
              pattern="terrain"
              bars={320}
              color="oklch(0.55 0.15 255)"
              tipColor="oklch(0.95 0.05 210)"
            />
            <Waveform
              pattern="heartbeat"
              bars={320}
              color="oklch(0.65 0.23 27)"
            />
            <Waveform
              pattern="ripple"
              anchor="center"
              bars={240}
              frequency={1.5}
            />
            <Waveform
              pattern="packet"
              bars={400}
              color="oklch(0.8 0.17 70)"
            />
          </div>
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="your own wave · and controlled values">
        <div className="grid w-full grid-cols-2 gap-3">
          <Waveform wave={beats} anchor="center" bars={300} interactive />
          <RendersMeter />
        </div>
      </RendersDemoCard>
    </div>
  )
}
