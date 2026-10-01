"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/standard/button"
import {
  RingWave,
  ringWaveGradients,
  ringWaveKinds,
  ringWavePaletteNames,
  ringWavePatterns,
  type RingWaveGradient,
  type RingWaveKind,
  type RingWavePalette,
  type RingWavePattern,
  type RingWaveRing,
} from "@/components/standard/ring-wave"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

const ringCounts = ["4", "8", "12", "20"] as const
const toggles = ["full", "glow", "track", "rounded"] as const
const kindOptions = ["mixed", ...ringWaveKinds] as const
type Toggle = (typeof toggles)[number]
const colorOptions = ["text", ...ringWavePaletteNames]

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
  const [pattern, setPattern] = useState<RingWavePattern>("grow")
  const [rings, setRings] = useState<(typeof ringCounts)[number]>("8")
  const [seed, setSeed] = useState(1)
  const [colorName, setColorName] = useState("hud")
  const [gradient, setGradient] = useState<RingWaveGradient>("ring")
  const [kind, setKind] = useState<(typeof kindOptions)[number]>("mixed")
  const [on, setOn] = useState<Record<Toggle, boolean>>({
    full: false,
    glow: true,
    track: true,
    rounded: false,
  })
  const [paused, setPaused] = useState(false)
  // Remounting replays the intro, arcs growing from a point.
  const [take, setTake] = useState(0)

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips
        options={ringWavePatterns}
        value={pattern}
        onChange={setPattern}
      />
      <div className="flex w-full justify-center">
        <RingWave
          key={take}
          pattern={pattern}
          rings={Number(rings)}
          seed={seed}
          full={on.full}
          kind={kind === "mixed" ? undefined : (kind as RingWaveKind)}
          palette={
            colorName === "text" ? undefined : (colorName as RingWavePalette)
          }
          gradient={gradient}
          glow={on.glow}
          track={on.track}
          rounded={on.rounded}
          paused={paused}
          className="size-72"
        />
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">rings</span>
        <RendersChips options={ringCounts} value={rings} onChange={setRings} />
        <span className="font-mono text-xs text-muted-foreground">
          seed {seed}
        </span>
        <Button
          size="sm"
          tone="outline"
          onClick={() => setSeed((was) => was + 1)}
        >
          Shuffle rings
        </Button>
        <RendersChips options={kindOptions} value={kind} onChange={setKind} />
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
          options={ringWaveGradients}
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
        <Button size="sm" tone="outline" onClick={() => setTake((was) => was + 1)}>
          Replay
        </Button>
      </div>
    </div>
  )
}

/** A gauge: three thick solid rings over two fine tick rings. */
const gaugeLayout: RingWaveRing[] = [
  { kind: "ticks", weight: 0.5, segments: 36, speed: 0.05 },
  { kind: "solid", weight: 1, speed: 0 },
  { kind: "segments", weight: 0.8, segments: 24, speed: 0 },
  { kind: "solid", weight: 1, speed: 0 },
  { kind: "ticks", weight: 0.6, segments: 60, speed: -0.03 },
]

/** Levels that wander, eased in by the rings. */
function RendersGauge() {
  const [levels, setLevels] = useState([0.3, 0.86, 0.6, 0.45, 1])

  useEffect(() => {
    const timer = window.setInterval(
      () =>
        setLevels((was) =>
          was.map((level, index) =>
            index === 0 || index === 4
              ? 1
              : Math.min(1, Math.max(0.1, level + (Math.random() - 0.5) * 0.3))
          )
        ),
      1200
    )
    return () => window.clearInterval(timer)
  }, [])

  return (
    <RingWave
      value={levels}
      layout={gaugeLayout}
      palette="hud"
      smoothing={0.8}
      rounded
      radius={0.35}
      label="Gauge"
      className="size-36"
    />
  )
}

export function RendersStandardRingWaveDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="rings · arcs grow from a point">
        <RendersPlayground />
      </RendersDemoCard>
      <RendersDemoCard fill label="full card · a ripple from the center">
        <div className="relative h-80 w-full overflow-hidden rounded-xl bg-background">
          <RingWave
            full
            pattern="ripple"
            kind="solid"
            fit="cover"
            rings={36}
            radius={0}
            gap={0.2}
            spin={0}
            palette="hud"
            glow
            className="absolute inset-0 size-full"
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="no gap · rings packed edge to edge">
        <div className="flex w-full flex-col gap-4">
          <div className="relative h-64 w-full overflow-hidden rounded-xl bg-background">
            <RingWave
              full
              pattern="ripple"
              kind="solid"
              weight={1}
              gap={0}
              fit="cover"
              rings={48}
              radius={0}
              spin={0}
              palette="ocean"
              className="absolute inset-0 size-full"
            />
          </div>
          <div className="grid w-full grid-cols-2 place-items-center gap-4 sm:grid-cols-4">
            <RingWave
              full
              pattern="ripple"
              kind="solid"
              weight={1}
              gap={0}
              rings={20}
              radius={0}
              spin={0}
              className="size-36"
            />
            <RingWave
              pattern="grow"
              kind="solid"
              weight={1}
              gap={0}
              rings={14}
              track={false}
              palette="sunset"
              className="size-36"
            />
            <RingWave
              pattern="cascade"
              kind="segments"
              weight={1}
              gap={0}
              rings={10}
              seed={3}
              palette="aurora"
              className="size-36"
            />
            <RingWave
              full
              pattern="spectrum"
              kind="solid"
              weight={1}
              gap={0}
              rings={16}
              radius={0.15}
              palette="neon"
              gradient="sweep"
              className="size-36"
            />
          </div>
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="full rings · the wave as brightness">
        <div className="grid w-full grid-cols-2 place-items-center gap-4 sm:grid-cols-4">
          <RingWave
            full
            pattern="ripple"
            kind="solid"
            rings={16}
            radius={0.05}
            spin={0}
            className="size-36"
          />
          <RingWave
            full
            pattern="ripple"
            kind="segments"
            rings={12}
            seed={4}
            palette="ocean"
            className="size-36"
          />
          <RingWave
            full
            pattern="grow"
            kind="ticks"
            rings={10}
            seed={8}
            palette="neon"
            gradient="sweep"
            glow
            className="size-36"
          />
          <RingWave
            full
            pattern="spectrum"
            rings={14}
            seed={6}
            palette="ember"
            className="size-36"
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="variants">
        <div className="grid w-full grid-cols-2 place-items-center gap-4 sm:grid-cols-4">
          <RingWave seed={3} palette="hud" glow className="size-36" />
          <RingWave
            pattern="cascade"
            rings={10}
            seed={5}
            className="size-36"
          />
          <RingWave
            pattern="spectrum"
            rings={14}
            seed={9}
            palette="neon"
            gradient="sweep"
            glow
            className="size-36"
          />
          <RendersGauge />
          <RingWave
            pattern="orbit"
            rings={6}
            seed={2}
            palette="ocean"
            spin={2}
            className="size-36"
          />
          <RingWave
            pattern="grow"
            rings={20}
            seed={12}
            gap={0.15}
            track={false}
            palette="ember"
            className="size-36"
          />
          <RingWave
            pattern="cascade"
            rings={6}
            seed={4}
            layout={Array.from({ length: 6 }, () => ({
              kind: "solid" as const,
              weight: 1,
            }))}
            rounded
            palette="aurora"
            className="size-36"
          />
          <RingWave
            pattern="orbit"
            rings={9}
            seed={21}
            layout={Array.from({ length: 9 }, () => ({
              kind: "ticks" as const,
            }))}
            radius={0.1}
            spin={3}
            palette="sunset"
            gradient="sweep"
            className="size-36"
          />
        </div>
      </RendersDemoCard>
    </div>
  )
}
