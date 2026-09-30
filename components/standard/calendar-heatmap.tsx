"use client"

import * as React from "react"

import { Heatmap } from "@/components/standard/heatmap"
import type { CellGridSize } from "@/components/standard/cell-grid"

/**
 * A contribution graph: one cell per day, a column per week, month labels
 * on top and weekday labels down the side. Built on Heatmap.
 *
 * Days are local `YYYY-MM-DD` keys. The range runs `weeks` back from `end`
 * (today by default); pin `end` when rendering on the server so the server
 * and browser agree on the day.
 *
 * <CalendarHeatmap
 *   data={{ "2026-09-28": 4, "2026-09-29": 1 }}
 *   unit="commit"
 *   onValueChange={(day) => openDay(day)}
 * />
 */

export type CalendarHeatmapData =
  Record<string, number> | { date: string | Date; value: number }[]

const DAY_MS = 24 * 60 * 60 * 1000

/** A local date's `YYYY-MM-DD` key. */
function keysDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** Reads a key or Date as local midnight; `new Date("2026-09-29")` would be UTC. */
function readsDate(input: string | Date) {
  if (input instanceof Date) {
    return new Date(input.getFullYear(), input.getMonth(), input.getDate())
  }
  const [year, month, day] = input.slice(0, 10).split("-").map(Number)
  return new Date(year, month - 1, day)
}

function addsDays(date: Date, days: number) {
  // Through noon so a DST shift never lands on the wrong day.
  const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
  const moved = new Date(noon.getTime() + days * DAY_MS)
  return new Date(moved.getFullYear(), moved.getMonth(), moved.getDate())
}

function readsTotals(data: CalendarHeatmapData) {
  const totals = new Map<string, number>()
  const entries = Array.isArray(data)
    ? data.map(
        (entry) => [keysDate(readsDate(entry.date)), entry.value] as const
      )
    : Object.entries(data).map(
        ([key, value]) => [keysDate(readsDate(key)), value] as const
      )
  for (const [key, value] of entries) {
    totals.set(key, (totals.get(key) ?? 0) + value)
  }
  return totals
}

function CalendarHeatmap({
  data,
  end: endProp,
  start: startProp,
  weeks = 53,
  weekStartsOn = 0,
  today: todayProp,
  locale,
  unit = "contribution",
  formatDay,
  levels = 5,
  color,
  size = "default",
  shape = "square",
  caption,
  legend = true,
  value,
  defaultValue,
  onValueChange,
  selectable,
  onActiveChange,
  ...props
}: Omit<
  React.ComponentProps<typeof Heatmap>,
  | "values"
  | "rowLabels"
  | "columnLabels"
  | "formatCell"
  | "scrollTo"
  | "onActiveChange"
  | "max"
> & {
  /** Totals per day, as a key map or a list; repeated days add up. */
  data: CalendarHeatmapData
  /** Last day shown. Defaults to today. */
  end?: string | Date
  /** First day shown. Defaults to `weeks` back from `end`. */
  start?: string | Date
  weeks?: number
  /** 0 for Sunday, 1 for Monday. */
  weekStartsOn?: 0 | 1
  /** Day that gets the mark. Defaults to today; null for none. */
  today?: string | Date | null
  locale?: string
  /** Singular noun for the readout: "3 commits on Sep 29, 2026". */
  unit?: string
  /** Replaces the readout text. */
  formatDay?: (day: { date: string; value: number }) => string
  size?: CellGridSize
  /** Selected day key. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  onActiveChange?: (day: { date: string; value: number } | null) => void
}) {
  const now = new Date()
  const end = readsDate(endProp ?? now)
  const todayKey =
    todayProp === null ? null : keysDate(readsDate(todayProp ?? now))
  const endKey = keysDate(end)
  const startKey = keysDate(
    startProp ? readsDate(startProp) : addsDays(end, -(weeks * 7 - 1))
  )

  const model = React.useMemo(() => {
    const start = readsDate(startKey)
    const last = readsDate(endKey)
    const totals = readsTotals(data)
    // Pad back to the week's first day so every column is a whole week.
    const lead = (start.getDay() - weekStartsOn + 7) % 7
    const gridStart = addsDays(start, -lead)
    const span = Math.round((last.getTime() - gridStart.getTime()) / DAY_MS) + 1
    const columnCount = Math.ceil(span / 7)

    const dayFormat = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    const monthFormat = new Intl.DateTimeFormat(locale, { month: "short" })
    const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: "short" })

    const rows: ({ value: number; label: string; mark?: boolean } | null)[][] =
      Array.from({ length: 7 }, () => [])
    const dates: string[][] = Array.from({ length: 7 }, () => [])
    const columnLabels: string[] = []
    let lastLabelled = -Infinity
    let lastMonth = -1

    for (let column = 0; column < columnCount; column++) {
      for (let row = 0; row < 7; row++) {
        const date = addsDays(gridStart, column * 7 + row)
        const key = keysDate(date)
        dates[row][column] = key
        if (date < start || date > last) {
          rows[row][column] = null
          continue
        }
        const total = totals.get(key) ?? 0
        const plural = total === 1 ? unit : `${unit}s`
        rows[row][column] = {
          value: total,
          mark: key === todayKey,
          label: formatDay
            ? formatDay({ date: key, value: total })
            : `${total === 0 ? "No" : total.toLocaleString(locale)} ${plural} on ${dayFormat.format(date)}`,
        }
      }
      // Label each month at the column where it first appears. A stub month
      // in the first column gives way when the next label would crowd it.
      columnLabels[column] = ""
      const weekStart = addsDays(gridStart, column * 7)
      const labelDay = weekStart < start ? start : weekStart
      if (labelDay.getMonth() !== lastMonth) {
        lastMonth = labelDay.getMonth()
        if (column - lastLabelled < 3 && lastLabelled === 0) {
          columnLabels[0] = ""
          lastLabelled = -Infinity
        }
        if (column - lastLabelled >= 3) {
          columnLabels[column] = monthFormat.format(labelDay)
          lastLabelled = column
        }
      }
    }

    // Monday, Wednesday and Friday, whichever rows they land on.
    const rowLabels = Array.from({ length: 7 }, (_, row) => {
      const weekday = (row + weekStartsOn) % 7
      return weekday % 2 === 1
        ? weekdayFormat.format(new Date(2024, 0, 7 + weekday))
        : ""
    })

    return { rows, dates, columnLabels, rowLabels, totals }
  }, [data, startKey, endKey, weekStartsOn, todayKey, locale, unit, formatDay])

  // The heatmap speaks in `${row}:${column}` ids; this maps them to days.
  const idsDay = (id: string | null) => {
    if (!id) {
      return null
    }
    const [row, column] = id.split(":").map(Number)
    return model.dates[row]?.[column] ?? null
  }
  const daysId = (day: string | null | undefined) => {
    if (!day) {
      return day === undefined ? undefined : null
    }
    for (let row = 0; row < 7; row++) {
      const column = model.dates[row].indexOf(keysDate(readsDate(day)))
      if (column >= 0) {
        return `${row}:${column}`
      }
    }
    return null
  }

  return (
    <Heatmap
      data-slot="calendar-heatmap"
      values={model.rows}
      rowLabels={model.rowLabels}
      columnLabels={model.columnLabels}
      formatCell={(cell) => String(cell.value)}
      levels={levels}
      color={color}
      size={size}
      shape={shape}
      caption={caption}
      legend={legend}
      scrollTo="end"
      value={daysId(value)}
      defaultValue={daysId(defaultValue)}
      onValueChange={(id) => onValueChange?.(idsDay(id))}
      selectable={selectable}
      onActiveChange={(cell) => {
        const date = idsDay(cell?.id ?? null)
        onActiveChange?.(date ? { date, value: cell?.value ?? 0 } : null)
      }}
      {...props}
    />
  )
}

export {
  CalendarHeatmap,
  addsDays as addsCalendarDays,
  keysDate as keysCalendarDate,
  readsDate as readsCalendarDate,
  readsTotals as readsCalendarTotals,
}
