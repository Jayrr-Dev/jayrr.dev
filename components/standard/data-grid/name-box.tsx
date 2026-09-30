"use client"

import * as React from "react"
import { MoveHorizontalIcon } from "lucide-react"

import {
  formatRange,
  type GridRange,
} from "@/components/standard/data-grid-model"

// The bar above the grid: an editable A1 range, the active cell's text, and
// trailing controls.
export function NameBox({
  range,
  activeText,
  onSelectRange,
  onDone,
  trailing,
}: {
  range: GridRange
  activeText: string
  /** Runs with the typed text ("B2", "A1:C9") when Enter is pressed. */
  onSelectRange: (text: string) => void
  /** Runs after Enter or Escape, to hand focus back to the grid. */
  onDone: () => void
  trailing?: React.ReactNode
}) {
  const [draft, setDraft] = React.useState<string | null>(null)
  return (
    <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-2">
      <input
        aria-label="Name box"
        value={draft ?? formatRange(range)}
        spellCheck={false}
        className="h-7 w-28 shrink-0 rounded-md border border-input bg-transparent px-2 font-mono text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        onFocus={(event) => {
          setDraft(formatRange(range))
          event.currentTarget.select()
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => setDraft(null)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            onSelectRange(event.currentTarget.value)
            setDraft(null)
            onDone()
          } else if (event.key === "Escape") {
            setDraft(null)
            onDone()
          }
        }}
      />
      <span aria-hidden className="h-5 w-px bg-border" />
      <p
        className="min-w-0 flex-1 truncate text-sm text-muted-foreground"
        aria-live="polite"
      >
        {activeText}
      </p>
      {trailing}
    </div>
  )
}

export function AutoFitButton({
  selectedOnly,
  disabled,
  onFit,
}: {
  /** True when whole columns are selected, so only those are fitted. */
  selectedOnly: boolean
  disabled?: boolean
  onFit: () => void
}) {
  const label = selectedOnly
    ? "Fit selected columns to content"
    : "Fit all columns to content"
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
      onClick={onFit}
    >
      <MoveHorizontalIcon aria-hidden className="size-3.5" />
    </button>
  )
}
