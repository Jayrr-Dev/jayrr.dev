"use client"

import { useEffect, useState } from "react"
import {
  CircleCheckIcon,
  CircleIcon,
  EyeIcon,
  PauseIcon,
  RocketIcon,
  StarIcon,
} from "lucide-react"

import {
  Status,
  statusStates,
  type StatusStateConfig,
  type StatusStateName,
} from "@/components/ui/status"

import { RendersDemoCard } from "./rendersDemoCard"

const STATUS_STATES: {
  state: StatusStateName
  label: string
}[] = [
  { state: "none", label: "Ready" },
  { state: "loading", label: "Working" },
  { state: "success", label: "Done" },
  { state: "error", label: "Failed" },
  { state: "unknown", label: "Unknown" },
  { state: "neutral", label: "Skipped" },
]

const CUSTOM_STATES = {
  ...statusStates,
  review: { icon: <EyeIcon />, variant: "info" },
  paused: { icon: <PauseIcon />, variant: "warning" },
  shipped: { icon: <RocketIcon />, variant: "default" },
} satisfies Record<string, StatusStateConfig>

function StatusLiveDemo() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(
      () => setIndex((i) => (i + 1) % STATUS_STATES.length),
      1600
    )
    return () => clearInterval(id)
  }, [playing])

  const state = STATUS_STATES[index]
  const code = `<Status state="${state.state}">${state.label}</Status>`

  return (
    <RendersDemoCard label="live — same badge, changing state">
      <div className="flex flex-col gap-4">
        <div className="flex min-h-10 items-center justify-between gap-3">
          <Status state={state.state}>{state.label}</Status>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
          >
            {playing ? "Pause" : "Auto-play"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_STATES.map((s, i) => (
            <button
              key={s.state}
              type="button"
              aria-pressed={i === index}
              onClick={() => {
                setPlaying(false)
                setIndex(i)
              }}
              className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                i === index
                  ? "border-foreground/40 bg-muted text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {s.state}
            </button>
          ))}
        </div>
        <pre className="max-w-full overflow-x-auto rounded-md bg-background/60 p-2 text-xs whitespace-pre-wrap text-muted-foreground">
          {code}
        </pre>
      </div>
    </RendersDemoCard>
  )
}

export function RendersIconDemo({ pieceName }: { pieceName: string }) {
  if (pieceName === "Symbol") {
    return (
      <>
        <RendersDemoCard>
          <StarIcon />
        </RendersDemoCard>
        <RendersDemoCard>
          <CircleIcon />
        </RendersDemoCard>
        <RendersDemoCard>
          <CircleCheckIcon />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Status") {
    return (
      <>
        <StatusLiveDemo />
        <RendersDemoCard label="state=&quot;none&quot;">
          <Status state="none">Ready</Status>
        </RendersDemoCard>
        <RendersDemoCard label="state=&quot;loading&quot;">
          <Status state="loading">Working</Status>
        </RendersDemoCard>
        <RendersDemoCard label="state=&quot;success&quot;">
          <Status state="success">Done</Status>
        </RendersDemoCard>
        <RendersDemoCard label="state=&quot;error&quot;">
          <Status state="error">Failed</Status>
        </RendersDemoCard>
        <RendersDemoCard label="state=&quot;unknown&quot;">
          <Status state="unknown">Unknown</Status>
        </RendersDemoCard>
        <RendersDemoCard label="state=&quot;neutral&quot;">
          <Status state="neutral">Skipped</Status>
        </RendersDemoCard>
        <RendersDemoCard label="custom states">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Status states={CUSTOM_STATES} state="review">
                In review
              </Status>
              <Status states={CUSTOM_STATES} state="paused">
                Paused
              </Status>
              <Status states={CUSTOM_STATES} state="shipped">
                Shipped
              </Status>
            </div>
            <pre className="max-w-full overflow-x-auto rounded-md bg-background/60 p-2 text-xs whitespace-pre-wrap text-muted-foreground">
              {`const states = {
  ...statusStates,
  review: {
    icon: <EyeIcon />,
    variant: "info",
  },
}

<Status
  states={states}
  state="review"
>`}
            </pre>
          </div>
        </RendersDemoCard>
        <RendersDemoCard label="icon prop (one-off)">
          <Status icon={<RocketIcon data-icon="inline-start" />}>Launch</Status>
        </RendersDemoCard>
        <RendersDemoCard label="variant + state">
          <div className="flex flex-wrap gap-2">
            <Status state="success" variant="secondary">
              Saved
            </Status>
            <Status state="error" variant="destructive">
              Blocked
            </Status>
            <Status state="loading" variant="outline">
              Syncing
            </Status>
          </div>
        </RendersDemoCard>
      </>
    )
  }

  return null
}
