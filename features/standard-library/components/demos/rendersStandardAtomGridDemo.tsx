"use client"

import { useState, type CSSProperties } from "react"

import {
  AtomGrid,
  atomGridPatterns,
  atomGridShapes,
  type AtomGridPattern,
  type AtomGridShape,
} from "@/components/standard/atom-grid"
import { Button } from "@/components/standard/button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

const gridSizes = ["3", "5", "7", "9"] as const
type GridSize = (typeof gridSizes)[number]

const inks = [
  { label: "Foreground", value: "var(--foreground)" },
  { label: "Primary", value: "var(--primary)" },
  { label: "Success", value: "var(--success)" },
  { label: "Warning", value: "var(--warning)" },
  { label: "Danger", value: "var(--destructive)" },
]

const fillCards: { pattern: AtomGridPattern; title: string; ink: string }[] = [
  { pattern: "ripple", title: "Generating", ink: "var(--primary)" },
  { pattern: "rain", title: "Syncing", ink: "var(--muted-foreground)" },
  { pattern: "orbit", title: "Waiting for review", ink: "var(--success)" },
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

function RendersSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit: string
  onChange: (next: number) => void
}) {
  return (
    <label className="flex min-w-36 flex-1 flex-col gap-1 text-xs text-muted-foreground">
      <span className="flex justify-between font-mono">
        {label}
        <span className="text-foreground">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-foreground"
      />
    </label>
  )
}

function RendersPlayground() {
  const [pattern, setPattern] = useState<AtomGridPattern>("orbit")
  const [size, setSize] = useState<GridSize>("5")
  const [shape, setShape] = useState<AtomGridShape>("circle")
  const [ink, setInk] = useState(inks[0].value)
  const [dotSize, setDotSize] = useState(6)
  const [gap, setGap] = useState(3)
  const [speed, setSpeed] = useState(1.2)
  const [glow, setGlow] = useState(false)
  const [paused, setPaused] = useState(false)
  const [fill, setFill] = useState(false)

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips
        options={atomGridPatterns}
        value={pattern}
        onChange={setPattern}
      />
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
        <AtomGrid
          fill={fill}
          className={fill ? "absolute inset-0" : undefined}
          pattern={pattern}
          cols={Number(size)}
          shape={shape}
          dotSize={dotSize}
          gap={gap}
          speed={speed}
          glow={glow}
          paused={paused}
          color={ink}
        />
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <RendersChips options={gridSizes} value={size} onChange={setSize} />
        <RendersChips
          options={atomGridShapes}
          value={shape}
          onChange={setShape}
        />
        <div className="flex gap-1.5">
          {inks.map((entry) => (
            <button
              key={entry.label}
              type="button"
              aria-label={entry.label}
              aria-pressed={entry.value === ink}
              onClick={() => setInk(entry.value)}
              className={cn(
                "size-6 rounded-full border border-border bg-(--ink) ring-offset-2 ring-offset-background",
                entry.value === ink && "ring-2 ring-foreground"
              )}
              style={{ "--ink": entry.value } as CSSProperties}
            />
          ))}
        </div>
      </div>
      <div className="flex w-full flex-wrap items-end gap-4">
        <RendersSlider
          label="dot"
          value={dotSize}
          min={2}
          max={12}
          unit="px"
          onChange={setDotSize}
        />
        <RendersSlider
          label="gap"
          value={gap}
          min={0}
          max={8}
          unit="px"
          onChange={setGap}
        />
        <RendersSlider
          label="speed"
          value={speed}
          min={0.4}
          max={4}
          step={0.1}
          unit="s"
          onChange={setSpeed}
        />
        <div className="flex gap-1.5">
          <Button
            size="sm"
            tone="outline"
            aria-pressed={fill}
            onClick={() => setFill((was) => !was)}
          >
            {fill ? "Fill on" : "Fill off"}
          </Button>
          <Button
            size="sm"
            tone="outline"
            aria-pressed={glow}
            onClick={() => setGlow((was) => !was)}
          >
            {glow ? "Glow on" : "Glow off"}
          </Button>
          <Button
            size="sm"
            tone="outline"
            onClick={() => setPaused((was) => !was)}
          >
            {paused ? "Resume" : "Pause"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function RendersStandardAtomGridDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="playground · pick a pattern">
        <RendersPlayground />
      </RendersDemoCard>
      <RendersDemoCard fill label="every pattern">
        <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-6">
          {atomGridPatterns.map((pattern) => (
            <div
              key={pattern}
              className="flex flex-col items-center gap-2 rounded-md border border-border py-4"
            >
              <AtomGrid pattern={pattern} cols={7} dotSize={4} gap={2} />
              <span className="font-mono text-xs text-muted-foreground">
                {pattern}
              </span>
            </div>
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="fill · behind a card">
        <div className="grid w-full gap-2 sm:grid-cols-3">
          {fillCards.map((card) => (
            <div
              key={card.pattern}
              className="relative flex h-40 flex-col justify-end overflow-hidden rounded-lg border border-border bg-background p-4"
            >
              <AtomGrid
                fill
                pattern={card.pattern}
                dotSize={4}
                gap={4}
                idleOpacity={0.08}
                color={card.ink}
                className="absolute inset-0"
              />
              <span className="relative text-sm font-medium">{card.title}</span>
              <span className="relative font-mono text-xs text-muted-foreground">
                {card.pattern}
              </span>
            </div>
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="inline · next to text">
        <div className="flex w-full flex-col gap-3 text-sm">
          <p className="flex items-center gap-2">
            <AtomGrid pattern="orbit" cols={3} dotSize={3} gap={1} />
            Thinking…
          </p>
          <p className="flex items-center gap-2 text-primary">
            <AtomGrid pattern="snake" cols={4} dotSize={3} gap={1} />
            Syncing 12 files
          </p>
          <p className="flex items-center gap-2 text-success">
            <AtomGrid pattern="pulse" cols={3} dotSize={3} gap={1} glow />
            Connected
          </p>
          <Button tone="outline" size="sm" className="w-fit">
            <AtomGrid pattern="rain" cols={3} dotSize={2} gap={1} />
            Deploying
          </Button>
        </div>
      </RendersDemoCard>
    </div>
  )
}
