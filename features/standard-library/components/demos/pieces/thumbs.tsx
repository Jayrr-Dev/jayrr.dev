"use client"

import { useState } from "react"

import {
  Thumbs,
  type ThumbsEffect,
  type ThumbsValue,
} from "@/components/standard/thumbs"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const EFFECTS: ThumbsEffect[] = ["tilt", "pop", "burst", "float"]
const BASE_COUNTS = { up: 128, down: 7 }

function RendersThumbsCountsCard() {
  const [vote, setVote] = useState<ThumbsValue>(null)

  return (
    <RendersDemoCard label="counts · controlled">
      <Thumbs
        value={vote}
        onValueChange={setVote}
        counts={{
          up: BASE_COUNTS.up + (vote === "up" ? 1 : 0),
          down: BASE_COUNTS.down + (vote === "down" ? 1 : 0),
        }}
      />
    </RendersDemoCard>
  )
}

export function RendersThumbsDemo() {
  return (
    <>
      <RendersDemoCard label="no effect (default)">
        <Thumbs size="lg" />
      </RendersDemoCard>
      {EFFECTS.map((effect) => (
        <RendersDemoCard key={effect} label={`effect ${effect}`}>
          <Thumbs effect={effect} size="lg" />
        </RendersDemoCard>
      ))}
      <RendersDemoCard label="defaultValue up">
        <Thumbs defaultValue="up" />
      </RendersDemoCard>
      <RendersDemoCard label="defaultValue down">
        <Thumbs defaultValue="down" />
      </RendersDemoCard>
      <RendersDemoCard label="size sm, default, lg">
        <div className="flex flex-col gap-2">
          <Thumbs size="sm" />
          <Thumbs />
          <Thumbs size="lg" />
        </div>
      </RendersDemoCard>
      <RendersThumbsCountsCard />
      <RendersDemoCard label="disabled">
        <Thumbs disabled defaultValue="up" />
      </RendersDemoCard>
    </>
  )
}
