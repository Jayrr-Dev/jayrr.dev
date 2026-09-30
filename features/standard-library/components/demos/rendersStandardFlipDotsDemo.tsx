"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/standard/button"
import {
  FlipDots,
  flipDotsPatterns,
  flipDotsShapes,
  flipDotsSweeps,
  flipDotsVariants,
  type FlipDotsPattern,
  type FlipDotsShape,
  type FlipDotsSweep,
  type FlipDotsVariant,
} from "@/components/standard/flip-dots"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

const DRAW = "draw"
const patternOptions = [...flipDotsPatterns, DRAW] as const
type PatternOption = (typeof patternOptions)[number]

const discColors = [
  { label: "Fluorescent", value: "oklch(0.93 0.21 118)" },
  { label: "Amber", value: "oklch(0.8 0.17 70)" },
  { label: "White", value: "oklch(0.97 0 0)" },
  { label: "Red", value: "oklch(0.65 0.23 27)" },
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

function RendersBoardDemo() {
  const [pattern, setPattern] = useState<PatternOption>("marquee")
  const [text, setText] = useState("FLIP DOTS ♥ JAYRR.DEV")
  const [sweep, setSweep] = useState<FlipDotsSweep>("column")
  const [variant, setVariant] = useState<FlipDotsVariant>("disc")
  const [shape, setShape] = useState<FlipDotsShape>("circle")
  const [color, setColor] = useState(discColors[0].value)
  const [paused, setPaused] = useState(false)
  const drawing = pattern === DRAW
  const usesText = pattern === "marquee" || pattern === "text"

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersChips
        options={patternOptions}
        value={pattern}
        onChange={setPattern}
      />
      <FlipDots
        pattern={drawing ? null : (pattern as FlipDotsPattern)}
        text={text}
        sweep={sweep}
        variant={variant}
        shape={shape}
        color={color}
        paused={paused}
        editable
      />
      <div className="flex w-full flex-wrap items-center gap-3">
        <RendersChips
          options={flipDotsVariants}
          value={variant}
          onChange={setVariant}
        />
        <RendersChips
          options={flipDotsShapes}
          value={shape}
          onChange={setShape}
        />
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <RendersChips
          options={flipDotsSweeps}
          value={sweep}
          onChange={setSweep}
        />
        <div className="flex gap-1.5">
          {discColors.map((entry) => (
            <button
              key={entry.label}
              type="button"
              aria-label={entry.label}
              aria-pressed={entry.value === color}
              onClick={() => setColor(entry.value)}
              className={cn(
                "size-6 rounded-full border-2 border-neutral-900 ring-offset-2 ring-offset-background",
                entry.value === color && "ring-2 ring-foreground"
              )}
              style={{ background: entry.value }}
            />
          ))}
        </div>
        {!drawing && (
          <Button
            size="sm"
            tone="outline"
            onClick={() => setPaused((was) => !was)}
          >
            {paused ? "Resume" : "Pause"}
          </Button>
        )}
      </div>
      {usesText && (
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={60}
          aria-label="Board text"
          className="h-8 w-full rounded-md border border-input bg-background px-2 font-mono text-sm uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      )}
      <p className="text-xs text-muted-foreground">
        {drawing
          ? "Press and drag on the board to flip dots."
          : "Drag on the board to paint into the running pattern. Try seeding life."}
      </p>
    </div>
  )
}

/** How long each game runs before the board switches to the next, in milliseconds. */
const arcade = [
  { pattern: "pong", runs: 15_000 },
  { pattern: "snake", runs: 30_000 },
] as const

/** Plays pong, then snake, then pong again, with the game named under the board. */
function RendersArcadeBoard() {
  const [turn, setTurn] = useState(0)
  const game = arcade[turn % arcade.length]

  useEffect(() => {
    const timer = window.setTimeout(() => setTurn((was) => was + 1), game.runs)
    return () => window.clearTimeout(timer)
  }, [turn, game.runs])

  return (
    <div className="flex w-full flex-col gap-1.5">
      <FlipDots cols={96} rows={40} pattern={game.pattern} sweep="none" />
      <p className="font-mono text-xs text-muted-foreground">
        now playing: {game.pattern}
      </p>
    </div>
  )
}

export function RendersStandardFlipDotsDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="board · pick a pattern, drag to paint">
        <RendersBoardDemo />
      </RendersDemoCard>
      <RendersDemoCard fill label="signs">
        <div className="flex w-full flex-col gap-3">
          <FlipDots
            cols={60}
            rows={9}
            pattern="marquee"
            text="42  DOWNTOWN VIA MAIN ST"
            color="oklch(0.8 0.17 70)"
          />
          <div className="grid w-full grid-cols-2 gap-3">
            <FlipDots cols={28} rows={9} pattern="clock" sweep="random" />
            <FlipDots
              cols={28}
              rows={9}
              pattern="wave"
              sweep="none"
              variant="flat"
              shape="rounded"
              color="oklch(0.97 0 0)"
            />
          </div>
        </div>
      </RendersDemoCard>
      <RendersDemoCard fill label="micro · thousands of tiny dots">
        <div className="flex w-full flex-col gap-3">
          <FlipDots
            cols={128}
            rows={48}
            pattern="life"
            sweep="random"
            editable
          />
          <RendersArcadeBoard />
          <FlipDots
            cols={160}
            rows={11}
            pattern="marquee"
            text="TINY DOTS, SAME FLIP ♥ 5000 DISCS AND COUNTING"
            interval={70}
            color="oklch(0.8 0.17 70)"
          />
          <div className="grid w-full grid-cols-2 gap-3">
            <FlipDots
              cols={80}
              rows={40}
              pattern="ripple"
              sweep="none"
              variant="flat"
            />
            <FlipDots
              cols={80}
              rows={40}
              pattern="rain"
              sweep="none"
              shape="square"
              variant="flat"
              color="oklch(0.97 0 0)"
            />
          </div>
        </div>
      </RendersDemoCard>
    </div>
  )
}
