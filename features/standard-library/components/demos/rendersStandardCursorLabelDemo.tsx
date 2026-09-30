"use client"

import { useState, type ReactNode } from "react"

import {
  CursorLabel,
  type CursorLabelContent,
  type CursorLabelPlacement,
} from "@/components/standard/cursor-label"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

// The 8 placements laid out around the pointer; the middle cell is the pointer.
const placementGrid: (CursorLabelPlacement | null)[] = [
  "top-left",
  "top",
  "top-right",
  "left",
  null,
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
]

const contents = {
  coordinates: ({ x, y }) => `${x}, ${y}`,
  text: "Drop to upload",
  element: (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2 shadow-md">
      <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        JR
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-medium">Jayrr</span>
        <span className="text-[10px] text-muted-foreground">is editing</span>
      </div>
    </div>
  ),
} satisfies Record<string, CursorLabelContent>

type ContentKey = keyof typeof contents

function RendersChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border border-border px-2 py-1 font-mono text-xs transition-colors",
        active
          ? "bg-foreground text-background"
          : "bg-background text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function RendersPlacementPicker({
  value,
  onChange,
}: {
  value: CursorLabelPlacement
  onChange: (placement: CursorLabelPlacement) => void
}) {
  return (
    <div className="grid w-max grid-cols-3 gap-1">
      {placementGrid.map((placement, index) =>
        placement ? (
          <button
            key={placement}
            type="button"
            title={placement}
            aria-label={placement}
            aria-pressed={placement === value}
            onClick={() => onChange(placement)}
            className={cn(
              "size-5 rounded-sm border border-border transition-colors",
              placement === value
                ? "bg-foreground"
                : "bg-background hover:bg-muted"
            )}
          />
        ) : (
          <span
            key={index}
            aria-hidden
            className="flex size-5 items-center justify-center"
          >
            <span className="size-1.5 rounded-full bg-foreground" />
          </span>
        )
      )}
    </div>
  )
}

function RendersCursorLabelPlayground() {
  const [placement, setPlacement] =
    useState<CursorLabelPlacement>("bottom-right")
  const [content, setContent] = useState<ContentKey>("coordinates")

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <RendersPlacementPicker value={placement} onChange={setPlacement} />
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">
            {placement}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(contents) as ContentKey[]).map((entry) => (
              <RendersChip
                key={entry}
                active={entry === content}
                onClick={() => setContent(entry)}
              >
                {entry}
              </RendersChip>
            ))}
          </div>
        </div>
      </div>
      <CursorLabel
        placement={placement}
        content={contents[content]}
        className="flex h-56 w-full items-center justify-center rounded-lg border border-dashed border-border bg-background"
      >
        <p className="text-sm text-muted-foreground">
          Move around here. Try the edges.
        </p>
      </CursorLabel>
    </div>
  )
}

export function RendersStandardCursorLabelDemo() {
  return (
    <RendersDemoCard fill label="placement · content · scoped to the box">
      <RendersCursorLabelPlayground />
    </RendersDemoCard>
  )
}
