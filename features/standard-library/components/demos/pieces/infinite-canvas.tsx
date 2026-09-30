"use client"

import { useState } from "react"

import {
  InfiniteCanvas,
  infiniteCanvasBackgrounds,
  type InfiniteCanvasBackground,
  type InfiniteCanvasItem,
  type InfiniteCanvasView,
} from "@/components/standard/infinite-canvas"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

type BoardItem = InfiniteCanvasItem & {
  kind: "note" | "card" | "photo"
  title: string
  body?: string
  tone?: string
}

const BOARD: BoardItem[] = [
  {
    id: "brief",
    kind: "card",
    x: 0,
    y: 0,
    title: "Brief",
    body: "A calm landing page for the spring release. One idea per screen.",
  },
  {
    id: "n1",
    kind: "note",
    x: 312,
    y: -24,
    title: "Warm neutrals, one accent",
    tone: "oklch(0.93 0.1 95)",
  },
  {
    id: "n2",
    kind: "note",
    x: 312,
    y: 168,
    title: "Type: big, loose, few weights",
    tone: "oklch(0.9 0.08 200)",
  },
  {
    id: "p1",
    kind: "photo",
    x: -312,
    y: -48,
    title: "Moodboard",
    tone: "linear-gradient(135deg, oklch(0.78 0.12 50), oklch(0.62 0.16 20))",
  },
  {
    id: "p2",
    kind: "photo",
    x: -312,
    y: 168,
    title: "Texture",
    tone: "linear-gradient(135deg, oklch(0.8 0.07 160), oklch(0.55 0.1 220))",
  },
  {
    id: "n3",
    kind: "note",
    x: 24,
    y: 216,
    title: "Ship behind a flag first",
    tone: "oklch(0.9 0.09 330)",
  },
]

const CHART: InfiniteCanvasItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `node-${i}`,
  x: (i % 4) * 192,
  y: Math.floor(i / 4) * 120,
  width: 144,
  height: 64,
  content: (
    <div className="flex size-full items-center justify-center rounded-lg border border-border bg-card font-mono text-xs text-muted-foreground shadow-xs">
      step {String(i + 1).padStart(2, "0")}
    </div>
  ),
}))

function RendersBoardItem({
  item,
  selected,
}: {
  item: BoardItem
  selected: boolean
}) {
  if (item.kind === "note") {
    return (
      <div
        className={cn(
          "flex size-44 items-start p-4 text-sm leading-snug font-medium text-neutral-900 shadow-md transition-transform",
          selected ? "rotate-0" : "-rotate-1"
        )}
        style={{ background: item.tone }}
      >
        {item.title}
      </div>
    )
  }
  if (item.kind === "photo") {
    return (
      <figure className="flex w-56 flex-col gap-2 rounded-lg border border-border bg-card p-2 shadow-sm">
        <div
          className="aspect-[4/3] rounded-md"
          style={{ background: item.tone }}
        />
        <figcaption className="px-1 text-xs text-muted-foreground">
          {item.title}
        </figcaption>
      </figure>
    )
  }
  return (
    <div className="flex w-64 flex-col gap-1.5 rounded-lg border border-border bg-card p-4 shadow-sm">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {item.title}
      </span>
      <p className="text-sm text-card-foreground">{item.body}</p>
      <input
        aria-label={`${item.title} notes`}
        placeholder="Type here, it won't drag"
        className="mt-1 h-7 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  )
}

function RendersBoardDemo() {
  const [items, setItems] = useState(BOARD)
  const [background, setBackground] = useState<InfiniteCanvasBackground>("dots")
  const [snap, setSnap] = useState(false)
  const [view, setView] = useState<InfiniteCanvasView>({ x: 0, y: 0, zoom: 1 })

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {infiniteCanvasBackgrounds.map((entry) => (
          <button
            key={entry}
            type="button"
            aria-pressed={entry === background}
            onClick={() => setBackground(entry)}
            className={cn(
              "rounded-md border border-border px-2 py-1 font-mono text-xs transition-colors",
              entry === background
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {entry}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={snap}
          onClick={() => setSnap((was) => !was)}
          className={cn(
            "rounded-md border border-border px-2 py-1 font-mono text-xs transition-colors",
            snap
              ? "bg-foreground text-background"
              : "bg-background text-muted-foreground hover:text-foreground"
          )}
        >
          snap
        </button>
        <span className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">
          {Math.round(-view.x / view.zoom)}, {Math.round(-view.y / view.zoom)} ·{" "}
          {Math.round(view.zoom * 100)}%
        </span>
      </div>
      <InfiniteCanvas
        aria-label="Moodboard"
        className="h-[28rem]"
        items={items}
        onItemsChange={setItems}
        getItemLabel={(item) => item.title}
        renderItem={(item, state) => (
          <RendersBoardItem item={item} selected={state.selected} />
        )}
        defaultView="fit"
        onViewChange={setView}
        background={background}
        snap={snap}
        minimap
      />
      <p className="text-xs text-muted-foreground">
        Drag the background, hold space or scroll to pan, or drag the minimap.
        Pinch or ctrl + scroll to zoom. Drag items, or focus one and use the
        arrow keys. + − 0 1 zoom from the keyboard.
      </p>
    </div>
  )
}

export function RendersInfiniteCanvasDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="board · drag, pan, zoom">
        <RendersBoardDemo />
      </RendersDemoCard>
      <RendersDemoCard fill label="read only · grid, wheel zooms, fit on mount">
        <InfiniteCanvas
          aria-label="Flow chart"
          className="h-72"
          defaultItems={CHART}
          defaultView="fit"
          background="grid"
          wheel="zoom"
          readOnly
        />
      </RendersDemoCard>
    </div>
  )
}
