"use client"

import { useState, type ReactNode } from "react"

import { Button } from "@/components/standard/button"
import { Cursor, cursorVariants, type CursorVariant } from "@/components/standard/cursor"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

const customContents = {
  none: undefined,
  "🔥": "🔥",
  "✨": "✨",
  svg: (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6 fill-primary">
      <path d="m12 2 2.9 6.9L22 9.3l-5.4 4.8 1.6 7.4L12 17.8l-6.2 3.7 1.6-7.4L2 9.3l7.1-.4z" />
    </svg>
  ),
} satisfies Record<string, ReactNode>

type CustomContent = keyof typeof customContents

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

function RendersCursorPlayground() {
  const [variant, setVariant] = useState<CursorVariant>("dot-ring")
  const [custom, setCustom] = useState<CustomContent>("none")
  const [trail, setTrail] = useState(false)

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {cursorVariants.map((entry) => (
          <RendersChip
            key={entry}
            active={entry === variant}
            onClick={() => setVariant(entry)}
          >
            {entry}
          </RendersChip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-mono text-2xs text-muted-foreground uppercase">
          content
        </span>
        {(Object.keys(customContents) as CustomContent[]).map((entry) => (
          <RendersChip
            key={entry}
            active={entry === custom}
            onClick={() => setCustom(entry)}
          >
            {entry}
          </RendersChip>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        <RendersChip active={trail} onClick={() => setTrail((on) => !on)}>
          trail
        </RendersChip>
      </div>
      <div className="w-full overflow-hidden rounded-lg border border-dashed border-border bg-background">
        <Cursor
          variant={variant}
          content={customContents[custom]}
          trail={trail}
          className="flex h-56 w-full flex-col items-center justify-center overflow-hidden"
        >
          <div className="flex flex-col items-center gap-4">
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
          </div>
        </Cursor>
      </div>
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
