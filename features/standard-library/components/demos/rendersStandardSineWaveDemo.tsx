"use client"

import { useState } from "react"

import { Button } from "@/components/standard/button"
import {
  SineWave,
  sineWaveShapes,
  type SineWaveShape,
} from "@/components/standard/sine-wave"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

const lineCounts = ["1", "3", "6", "12"] as const
const frequencies = ["1", "3", "5", "9"] as const
const toggles = ["grid", "axis", "glow"] as const
type Toggle = (typeof toggles)[number]

const traceColors = [
  { label: "text", value: undefined },
  { label: "lime", value: "oklch(0.93 0.21 118)" },
  { label: "amber", value: "oklch(0.8 0.17 70)" },
  { label: "cyan", value: "oklch(0.85 0.14 200)" },
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
  const [shape, setShape] = useState<SineWaveShape>("sine")
  const [lines, setLines] = useState<(typeof lineCounts)[number]>("1")
  const [frequency, setFrequency] =
    useState<(typeof frequencies)[number]>("5")
  const [colorName, setColorName] = useState("lime")
  const [on, setOn] = useState<Record<Toggle, boolean>>({
    grid: true,
    axis: true,
    glow: false,
  })
  const [paused, setPaused] = useState(false)
  // Remounting replays the intro, from a flat line.
  const [take, setTake] = useState(0)
  const color = traceColors.find((entry) => entry.label === colorName)?.value

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips options={sineWaveShapes} value={shape} onChange={setShape} />
      <SineWave
        key={take}
        shape={shape}
        lines={Number(lines)}
        frequency={Number(frequency)}
        color={color}
        grid={on.grid}
        axis={on.axis}
        glow={on.glow}
        paused={paused}
        className="h-56"
      />
      <div className="flex w-full flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">lines</span>
        <RendersChips options={lineCounts} value={lines} onChange={setLines} />
        <span className="font-mono text-xs text-muted-foreground">cycles</span>
        <RendersChips
          options={frequencies}
          value={frequency}
          onChange={setFrequency}
        />
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <RendersChips
          options={traceColors.map((entry) => entry.label)}
          value={colorName}
          onChange={setColorName}
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

export function RendersStandardSineWaveDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="trace · starts as a flat line">
        <RendersPlayground />
      </RendersDemoCard>
      <RendersDemoCard fill label="echoes · stacked lines">
        <div className="flex w-full flex-col gap-3">
          <SineWave
            lines={12}
            spread={0.035}
            frequency={2}
            amplitude={0.75}
            thickness={1.5}
            color="oklch(0.85 0.14 200)"
            className="h-40"
          />
          <div className="grid w-full grid-cols-2 gap-3">
            <SineWave
              lines={5}
              spread={0.12}
              frequency={1.5}
              speed={0.25}
              color="oklch(0.8 0.17 70)"
              glow
            />
            <SineWave
              lines={8}
              spread={-0.05}
              frequency={4}
              speed={-0.6}
              thickness={1.5}
            />
          </div>
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="shapes">
        <div className="grid w-full grid-cols-2 gap-3">
          {sineWaveShapes.map((entry) => (
            <div key={entry} className="flex flex-col gap-1.5">
              <SineWave
                shape={entry}
                frequency={4}
                grid
                gridColumns={16}
                gridRows={6}
                axis
                color="oklch(0.93 0.21 118)"
                className="h-24"
              />
              <p className="font-mono text-xs text-muted-foreground">{entry}</p>
            </div>
          ))}
        </div>
      </RendersDemoCard>
    </div>
  )
}
