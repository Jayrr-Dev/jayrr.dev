"use client"

import { useState } from "react"

import { CellGrid, type CellGridCell } from "@/components/standard/cell-grid"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const LEVEL_CELLS: CellGridCell[] = Array.from({ length: 7 * 20 }, (_, i) => {
  const level = (i * 7 + ((i * i) % 11)) % 5
  return { id: `day-${i}`, label: `Day ${i + 1} · level ${level}`, level }
})

/** A loan's payment timeline, after JayrrBudget: tones, a faded future, and today. */
const PAID = "oklch(0.68 0.1 165)"
const MISSED = "oklch(0.8 0.08 25)"
const DUE = "oklch(0.58 0.2 0)"
const TIMELINE_CELLS: CellGridCell[] = Array.from(
  { length: 7 * 16 },
  (_, i) => {
    const today = 61
    const payday = i % 14 === 13
    const missed = payday && i === 41
    if (i < today) {
      return {
        id: `t-${i}`,
        label: payday ? (missed ? "Missed payment" : "Paid") : undefined,
        color: payday ? (missed ? MISSED : PAID) : undefined,
        mark: payday,
      }
    }
    return {
      id: `t-${i}`,
      label: i === today ? "Today" : payday ? "Pay date" : undefined,
      color: payday ? DUE : undefined,
      mark: i === today,
      faded: i > today && !(payday && i < today + 14),
    }
  }
)

const SEAT_ROWS = 6
const SEAT_COLUMNS = 12
const TAKEN = new Set([3, 4, 15, 16, 17, 28, 40, 41, 52, 53, 54, 66, 67])
const SEAT_CELLS: CellGridCell[] = Array.from(
  { length: SEAT_ROWS * SEAT_COLUMNS },
  (_, i) => {
    const row = String.fromCharCode(65 + Math.floor(i / SEAT_COLUMNS))
    const seat = (i % SEAT_COLUMNS) + 1
    // An aisle down the middle.
    if (seat === 7) {
      return { id: `aisle-${i}`, placeholder: true }
    }
    return {
      id: `${row}${seat}`,
      label: `Seat ${row}${seat}${TAKEN.has(i) ? " (taken)" : ""}`,
      level: TAKEN.has(i) ? 4 : 0,
      disabled: TAKEN.has(i),
    }
  }
)

export function RendersStandardCellGridDemo() {
  const [picked, setPicked] = useState<string | null>("day-24")
  const [seat, setSeat] = useState<string | null>(null)

  return (
    <div className="flex w-full flex-col gap-3">
      <RendersDemoCard label="levels · column flow, 7 rows · arrows to move, enter to pick">
        <CellGrid
          rows={7}
          cells={LEVEL_CELLS}
          color="oklch(0.66 0.17 150)"
          value={picked}
          onValueChange={setPicked}
          aria-label="Levels by day"
        />
        <span className="text-xs text-muted-foreground">
          {picked ?? "Nothing picked"}
        </span>
      </RendersDemoCard>
      <RendersDemoCard label="own colors + marks · a loan payment timeline">
        <CellGrid
          rows={7}
          size="lg"
          cells={TIMELINE_CELLS}
          aria-label="Loan payments: 4 of 8 paid"
        />
      </RendersDemoCard>
      <RendersDemoCard label="round · placeholders + disabled · seat picker">
        <CellGrid
          columns={SEAT_COLUMNS}
          size="xl"
          shape="round"
          cells={SEAT_CELLS}
          value={seat}
          onValueChange={setSeat}
          aria-label="Seats"
        />
        <span className="text-xs text-muted-foreground">
          {seat ? `Seat ${seat}` : "Pick a seat"}
        </span>
      </RendersDemoCard>
    </div>
  )
}
