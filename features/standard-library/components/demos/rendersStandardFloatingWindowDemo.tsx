"use client"

import { useState, type ReactNode } from "react"
import { MessageCircleIcon, MusicIcon, PauseIcon, PlayIcon } from "lucide-react"

import {
  FloatingWindow,
  floatingWindowPositions,
  type FloatingWindowPosition,
} from "@/components/standard/floating-window"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { cn } from "@/lib/utils"

function RendersStage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative h-72 w-full overflow-hidden rounded-lg border border-border bg-background bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px]",
        className
      )}
    >
      {children}
    </div>
  )
}

function RendersPositionPicker({
  value,
  onChange,
}: {
  value: FloatingWindowPosition
  onChange: (next: FloatingWindowPosition) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Position"
      className="grid w-fit grid-cols-3 gap-1 rounded-md border border-border p-1"
    >
      {floatingWindowPositions.map((position) => (
        <button
          key={position}
          type="button"
          role="radio"
          aria-checked={position === value}
          aria-label={position}
          title={position}
          onClick={() => onChange(position)}
          className={cn(
            "size-6 rounded-sm transition-colors",
            position === value
              ? "bg-foreground"
              : "bg-muted hover:bg-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}

function RendersNowPlaying() {
  const [playing, setPlaying] = useState(true)
  return (
    <div className="flex w-56 items-center gap-3 rounded-xl border border-border bg-popover p-2.5 text-popover-foreground shadow-lg">
      <div className="grid size-10 shrink-0 place-items-center rounded-md bg-gradient-to-br from-fuchsia-500 to-orange-400 text-white">
        <MusicIcon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">Night Drive</p>
        <p className="truncate text-xs text-muted-foreground">Neon Coast</p>
      </div>
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        onClick={() => setPlaying((value) => !value)}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-background"
      >
        {playing ? (
          <PauseIcon className="size-3.5" />
        ) : (
          <PlayIcon className="size-3.5" />
        )}
      </button>
    </div>
  )
}

function RendersPositionDemo() {
  const [position, setPosition] =
    useState<FloatingWindowPosition>("bottom-right")
  return (
    <div className="flex w-full flex-col gap-3">
      <RendersStage>
        <FloatingWindow strategy="absolute" position={position}>
          <RendersNowPlaying />
        </FloatingWindow>
      </RendersStage>
      <div className="flex items-center gap-3">
        <RendersPositionPicker value={position} onChange={setPosition} />
        <code className="font-mono text-xs text-muted-foreground">
          position=&quot;{position}&quot;
        </code>
      </div>
    </div>
  )
}

function RendersDraggableDemo() {
  const [position, setPosition] =
    useState<FloatingWindowPosition>("bottom-right")
  return (
    <div className="flex w-full flex-col gap-3">
      <RendersStage>
        <FloatingWindow
          strategy="absolute"
          draggable
          position={position}
          onPositionChange={setPosition}
          aria-label="Chat"
          radius="xl"
        >
          <div className="flex w-60 flex-col gap-2 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageCircleIcon className="size-4" />
              Support
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                drag me
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Drop anywhere and I&apos;ll snap to the nearest spot. Text fields
              still take clicks.
            </p>
            <input
              placeholder="Type a message…"
              className="h-7 rounded-md border border-border bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
        </FloatingWindow>
      </RendersStage>
      <code className="font-mono text-xs text-muted-foreground">
        draggable · position=&quot;{position}&quot;
      </code>
    </div>
  )
}

function RendersAllPositionsDemo() {
  return (
    <RendersStage className="h-56">
      {floatingWindowPositions.map((position) => (
        <FloatingWindow
          key={position}
          strategy="absolute"
          position={position}
          offset={12}
        >
          <span className="rounded-md border border-border bg-popover px-2 py-1 font-mono text-xs text-popover-foreground shadow-sm">
            {position}
          </span>
        </FloatingWindow>
      ))}
    </RendersStage>
  )
}

export function RendersStandardFloatingWindowDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label="nine positions">
        <RendersPositionDemo />
      </RendersDemoCard>
      <RendersDemoCard fill label="draggable · drag and snap">
        <RendersDraggableDemo />
      </RendersDemoCard>
      <RendersDemoCard fill label="every position">
        <RendersAllPositionsDemo />
      </RendersDemoCard>
    </div>
  )
}
