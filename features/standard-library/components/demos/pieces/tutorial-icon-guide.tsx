"use client"

import { useRef, useState } from "react"

import { Button } from "@/components/standard/button"
import { Switch } from "@/components/standard/switch"
import {
  TutorialIconGuide,
  tutorialDevices,
  type TutorialDevice,
} from "@/components/standard/tutorial-icon-guide"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

/** Tap or drag between two targets, with every option to try. */
function RendersPlayground() {
  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState(false)
  const [device, setDevice] = useState<TutorialDevice>("auto")
  const [path, setPath] = useState(false)
  const [straight, setStraight] = useState(false)

  return (
    <RendersDemoCard label="tap or drag · pointer, finger and path" fill>
      <div className="flex w-full flex-col items-center gap-3">
        <div className="relative h-56 w-full rounded-lg border border-border bg-background">
          <div
            ref={fromRef}
            className="absolute top-1/2 left-[18%] -translate-y-1/2 rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm"
          >
            Item
          </div>
          <div
            ref={toRef}
            className="absolute top-1/2 right-[14%] flex size-20 -translate-y-1/2 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground"
          >
            Drop here
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Switch
            variant="flip"
            flipLabels={["Tap", "Drag"]}
            checked={drag}
            onCheckedChange={setDrag}
          />
          <div className="flex gap-1">
            {tutorialDevices.map((option) => (
              <Button
                key={option}
                size="sm"
                tone={device === option ? "default" : "outline"}
                aria-pressed={device === option}
                onClick={() => setDevice(option)}
              >
                {option}
              </Button>
            ))}
          </div>
          <Switch label="Path" checked={path} onCheckedChange={setPath} />
          <Switch
            label="Straight"
            checked={straight}
            onCheckedChange={setStraight}
          />
        </div>
      </div>
      <TutorialIconGuide
        gesture={drag ? "drag" : "tap"}
        target={toRef}
        from={fromRef}
        to={toRef}
        device={device}
        path={path}
        curl={straight ? 0 : -0.7}
      />
    </RendersDemoCard>
  )
}

/** A point instead of an element: the finger presses a spot on a picture. */
function RendersPoint() {
  const boxRef = useRef<HTMLDivElement>(null)

  return (
    <RendersDemoCard label="touch · press a spot by fraction" fill>
      <div
        ref={boxRef}
        className="grid h-40 w-full grid-cols-3 gap-2 rounded-lg border border-border bg-background p-3"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="rounded-md bg-muted" />
        ))}
      </div>
      <TutorialIconGuide target={boxRef} at={[0.83, 0.72]} device="touch" />
    </RendersDemoCard>
  )
}

export function RendersTutorialIconGuideDemo() {
  return (
    <>
      <RendersPlayground />
      <RendersPoint />
    </>
  )
}
