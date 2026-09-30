"use client"

import { useState } from "react"

import { Button } from "@/components/standard/button"
import { Cursor, cursorVariants, type CursorVariant } from "@/components/standard/cursor"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

function RendersCursorPlayground() {
  const [variant, setVariant] = useState<CursorVariant>("dot-ring")

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {cursorVariants.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setVariant(entry)}
            className={cn(
              "rounded-md border border-border px-2 py-1 font-mono text-xs transition-colors",
              entry === variant
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {entry}
          </button>
        ))}
      </div>
      <Cursor
        variant={variant}
        className="flex h-56 w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-lg border border-dashed border-border bg-background"
      >
        <p className="text-sm text-muted-foreground">Move around here</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="sm">Hover me</Button>
          <a href="#cursor" className="text-sm underline underline-offset-4">
            A link
          </a>
          <input
            placeholder="Text caret"
            className="h-8 w-32 rounded-md border border-border bg-transparent px-2 text-sm"
          />
        </div>
      </Cursor>
    </div>
  )
}

export function RendersStandardCursorDemo() {
  return (
    <RendersDemoCard fill label="variants · scoped to the box">
      <RendersCursorPlayground />
    </RendersDemoCard>
  )
}
