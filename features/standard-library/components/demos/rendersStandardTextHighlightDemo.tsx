"use client"

import { useState } from "react"

import { Button } from "@/components/standard/button"
import {
  TextHighlight,
  type TextHighlightDirection,
} from "@/components/standard/text-highlight"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const copy =
  "Our platform turns raw data into decisions. From real-time insights to predictive analytics, we build the tools that drive growth, and the data stays yours."

const highlights = [
  "real-time insights",
  "predictive analytics",
  "growth",
  { text: "data", occurrence: 2 },
]

const directions: TextHighlightDirection[] = ["left", "right", "top", "bottom"]

function RendersAnimatedDemo() {
  const [direction, setDirection] = useState<TextHighlightDirection>("left")
  const [run, setRun] = useState(0)

  return (
    <div className="flex w-full flex-col gap-4">
      <TextHighlight
        key={`${direction}-${run}`}
        animate
        direction={direction}
        highlights={highlights}
        size="lg"
      >
        {copy}
      </TextHighlight>
      <div className="flex flex-wrap items-center gap-1.5">
        {directions.map((entry) => (
          <Button
            key={entry}
            size="sm"
            tone={entry === direction ? "default" : "outline"}
            aria-pressed={entry === direction}
            onClick={() => setDirection(entry)}
          >
            {entry}
          </Button>
        ))}
        <Button size="sm" tone="ghost" onClick={() => setRun(run + 1)}>
          Replay
        </Button>
      </div>
    </div>
  )
}

export function RendersStandardTextHighlightDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="animated · blurs in, then sweeps">
        <RendersAnimatedDemo />
      </RendersDemoCard>
      <RendersDemoCard fill label="static">
        <TextHighlight highlights={highlights} size="lg">
          {copy}
        </TextHighlight>
      </RendersDemoCard>
      <RendersDemoCard fill label="static · custom colors">
        <div className="flex w-full flex-col gap-2">
          <TextHighlight
            highlights={["ship on Fridays"]}
            color="color-mix(in oklab, var(--info) 30%, transparent)"
          >
            We ship on Fridays, and we sleep fine.
          </TextHighlight>
          <TextHighlight
            highlights={["read the docs"]}
            color="color-mix(in oklab, var(--success) 30%, transparent)"
          >
            When in doubt, read the docs first.
          </TextHighlight>
          <TextHighlight
            highlights={["never"]}
            color="color-mix(in oklab, var(--destructive) 30%, transparent)"
          >
            Secrets never go in the repo.
          </TextHighlight>
        </div>
      </RendersDemoCard>
    </div>
  )
}
