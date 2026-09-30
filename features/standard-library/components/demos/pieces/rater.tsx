"use client"

import { useState } from "react"
import { HeartIcon, SparkleIcon, ZapIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import { Rater } from "@/components/standard/rater"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const FACES = ["😡", "☹️", "😐", "🙂", "😍"]
const FACE_NAMES = ["Awful", "Bad", "Okay", "Good", "Great"]

function RendersRaterControlledCard() {
  const [rating, setRating] = useState(3)

  return (
    <RendersDemoCard label="controlled · step 0.5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Rater
            aria-label="Rating"
            step={0.5}
            value={rating}
            onValueChange={setRating}
          />
          <span className="text-sm text-muted-foreground tabular-nums">
            {rating} / 5
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" tone="outline" onClick={() => setRating(0)}>
            Clear
          </Button>
          <Button size="sm" tone="outline" onClick={() => setRating(5)}>
            Set to 5
          </Button>
          <Button size="sm" tone="outline" onClick={() => setRating(2.5)}>
            Set to 2.5
          </Button>
        </div>
      </div>
    </RendersDemoCard>
  )
}

function RendersRaterFacesCard() {
  const [mood, setMood] = useState(0)

  return (
    <RendersDemoCard label="icon per position · highlight single">
      <Rater
        label="How was your experience?"
        icon={(index) => FACES[index]}
        highlight="single"
        size="xl"
        value={mood}
        onValueChange={setMood}
        getValueText={(value) => FACE_NAMES[value - 1] ?? "Not rated"}
        className="gap-1"
      />
    </RendersDemoCard>
  )
}

export function RendersRaterDemo() {
  return (
    <>
      <RendersDemoCard>
        <Rater aria-label="Rating" defaultValue={3} />
      </RendersDemoCard>
      <RendersDemoCard label="step 0.5">
        <Rater aria-label="Rating" step={0.5} defaultValue={2.5} />
      </RendersDemoCard>
      <RendersDemoCard label="readOnly">
        <Rater label="Average 3.5" readOnly defaultValue={3.5} />
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <Rater aria-label="Rating" disabled defaultValue={2} />
      </RendersDemoCard>
      <RendersDemoCard label="size xs · sm · default · lg · xl">
        <div className="flex flex-col gap-2">
          <Rater aria-label="Extra small" size="xs" defaultValue={2} />
          <Rater aria-label="Small" size="sm" defaultValue={3} />
          <Rater aria-label="Default" defaultValue={2} />
          <Rater aria-label="Large" size="lg" defaultValue={3} />
          <Rater aria-label="Extra large" size="xl" defaultValue={4} />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="tone">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Rater label="warning" tone="warning" defaultValue={3} />
          <Rater label="danger" tone="danger" defaultValue={2} />
          <Rater label="quiet" tone="quiet" defaultValue={4} />
          <Rater label="outline" tone="outline" defaultValue={3} />
          <Rater label="success" tone="success" defaultValue={4} />
          <Rater label="info" tone="info" defaultValue={1} />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="icon">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Rater
            label="Heart"
            icon={<HeartIcon />}
            tone="danger"
            defaultValue={3}
          />
          <Rater
            label="Energy"
            icon={<ZapIcon />}
            tone="warning"
            defaultValue={2}
          />
          <Rater label="Sparkle" icon={<SparkleIcon />} defaultValue={4} />
          <Rater
            label="Ten points"
            max={10}
            size="sm"
            defaultValue={7}
            className="col-span-2"
          />
        </div>
      </RendersDemoCard>
      <RendersRaterControlledCard />
      <RendersRaterFacesCard />
    </>
  )
}
