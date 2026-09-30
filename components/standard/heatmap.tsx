"use client"

import * as React from "react"
import { cn } from "cn"

import {
  CellGrid,
  cellGridSizeVars,
  type CellGridCell,
  type CellGridSize,
} from "@/components/standard/cell-grid"

/**
 * A matrix of values shaded on a ramp, with row and column labels, a
 * "Less … More" legend and a readout of the cell under the pointer or focus.
 * Built on Cell Grid.
 *
 * A null value leaves the slot empty (outside the data); 0 draws the empty
 * track. Pass an object for a cell that needs its own label or mark.
 *
 * <Heatmap
 *   values={[[0, 2, 5], [1, 0, 3]]}
 *   rowLabels={["Mon", "Tue"]}
 *   columnLabels={["9a", "10a", "11a"]}
 * />
 */

export type HeatmapDatum = {
  value: number | null
  /** Replaces the readout text for this cell. */
  label?: string
  mark?: boolean
  faded?: boolean
}

export type HeatmapCell = {
  id: string
  row: number
  column: number
  value: number | null
}

/**
 * Buckets `value` into `levels` steps: 0 and below are level 0, and the
 * rest split (0, max] evenly, so any activity at all shows up.
 */
function quantizesHeatmap(value: number, max: number, levels: number) {
  if (value <= 0 || max <= 0) {
    return 0
  }
  const steps = levels - 1
  return Math.min(steps, Math.max(1, Math.ceil((value / max) * steps)))
}

function readsDatum(entry: number | null | HeatmapDatum): HeatmapDatum {
  return entry !== null && typeof entry === "object" ? entry : { value: entry }
}

function Heatmap({
  values,
  rowLabels,
  columnLabels,
  levels = 5,
  max: maxProp,
  color = "var(--primary)",
  size = "default",
  shape = "square",
  formatCell = (cell) =>
    cell.value === null
      ? ""
      : `${cell.value} at row ${cell.row + 1}, column ${cell.column + 1}`,
  caption,
  legend = true,
  scrollTo = "start",
  value,
  defaultValue,
  onValueChange,
  selectable,
  onActiveChange,
  className,
  style,
  "aria-label": ariaLabel,
  ...props
}: Omit<
  React.ComponentProps<"div">,
  "children" | "defaultValue" | "onChange"
> & {
  /** Rows of values. */
  values: (number | null | HeatmapDatum)[][]
  /** One per row; empty strings skip a row, e.g. ["", "Mon", "", "Wed"]. */
  rowLabels?: string[]
  /** One per column; empty strings skip a column. Long labels overflow right. */
  columnLabels?: string[]
  /** Steps on the ramp, counting the empty level 0. */
  levels?: number
  /** Value of the fullest step. Defaults to the largest value. */
  max?: number
  color?: string
  size?: CellGridSize
  shape?: "square" | "round"
  /** Readout text and tooltip for a cell. */
  formatCell?: (cell: HeatmapCell) => string
  /** Shown in the footer when no cell is active. */
  caption?: React.ReactNode
  legend?: boolean
  /** Where a wide map starts scrolled: the first or last column. */
  scrollTo?: "start" | "end"
  /** Id of the selected cell, `${row}:${column}`. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  selectable?: boolean
  onActiveChange?: (cell: HeatmapCell | null) => void
}) {
  const columnCount = Math.max(0, ...values.map((row) => row.length))
  const max =
    maxProp ??
    Math.max(0, ...values.flat().map((entry) => readsDatum(entry).value ?? 0))

  const { cells, byId } = React.useMemo(() => {
    const cells: CellGridCell[] = []
    const byId = new Map<string, HeatmapCell & { label: string }>()
    values.forEach((row, rowIndex) => {
      for (let column = 0; column < columnCount; column++) {
        const datum = readsDatum(row[column] ?? null)
        const id = `${rowIndex}:${column}`
        if (datum.value === null) {
          cells.push({ id, placeholder: true })
          continue
        }
        const cell = { id, row: rowIndex, column, value: datum.value }
        const label = datum.label ?? formatCell(cell)
        byId.set(id, { ...cell, label })
        cells.push({
          id,
          label,
          level: quantizesHeatmap(datum.value, max, levels),
          mark: datum.mark,
          faded: datum.faded,
        })
      }
    })
    return { cells, byId }
  }, [values, columnCount, max, levels, formatCell])

  const [active, setActive] = React.useState<string | null>(null)
  const [selected, setSelected] = React.useState<string | null>(
    value ?? defaultValue ?? null
  )
  const shown = byId.get(active ?? value ?? selected ?? "")

  const scrollerRef = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (scroller && scrollTo === "end") {
      scroller.scrollLeft = scroller.scrollWidth
    }
  }, [scrollTo, columnCount])

  const hasRowLabels = Boolean(rowLabels?.some(Boolean))
  const hasColumnLabels = Boolean(columnLabels?.some(Boolean))

  return (
    <div
      data-slot="heatmap"
      className={cn("flex w-full min-w-0 flex-col gap-2", className)}
      style={{ ...cellGridSizeVars(size), ...style }}
      {...props}
    >
      <div
        ref={scrollerRef}
        data-slot="heatmap-scroller"
        className="scrollbar-thin max-w-full overflow-x-auto p-1"
      >
        <div
          className="grid w-max gap-x-2 gap-y-1"
          style={{
            gridTemplateColumns: hasRowLabels ? "auto auto" : "auto",
          }}
        >
          {hasColumnLabels ? (
            <>
              {hasRowLabels ? <span aria-hidden /> : null}
              <div
                aria-hidden
                data-slot="heatmap-column-labels"
                className="grid gap-x-(--cell-gap) text-[10px] leading-none text-muted-foreground"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, var(--cell-size))`,
                }}
              >
                {Array.from({ length: columnCount }, (_, column) => (
                  <span
                    key={column}
                    className="overflow-visible whitespace-nowrap"
                  >
                    {columnLabels?.[column] ?? ""}
                  </span>
                ))}
              </div>
            </>
          ) : null}
          {hasRowLabels ? (
            <div
              aria-hidden
              data-slot="heatmap-row-labels"
              className="grid gap-y-(--cell-gap) text-[10px] leading-none text-muted-foreground"
              style={{
                gridTemplateRows: `repeat(${values.length}, var(--cell-size))`,
              }}
            >
              {values.map((_, row) => (
                <span key={row} className="flex items-center justify-end">
                  {rowLabels?.[row] ?? ""}
                </span>
              ))}
            </div>
          ) : null}
          <CellGrid
            cells={cells}
            columns={Math.max(columnCount, 1)}
            size={size}
            shape={shape}
            levels={levels}
            color={color}
            value={value}
            defaultValue={defaultValue}
            onValueChange={(next) => {
              setSelected(next)
              onValueChange?.(next)
            }}
            selectable={selectable}
            aria-label={ariaLabel}
            onActiveChange={(cell) => {
              setActive(cell?.id ?? null)
              onActiveChange?.(cell ? (byId.get(cell.id) ?? null) : null)
            }}
          />
        </div>
      </div>
      {caption !== undefined || legend || shown ? (
        <div
          data-slot="heatmap-footer"
          className="flex min-h-4 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground"
        >
          <span
            data-slot="heatmap-readout"
            aria-live="polite"
            className="tabular-nums"
          >
            {shown ? (
              <span className="text-foreground">{shown.label}</span>
            ) : (
              caption
            )}
          </span>
          {legend ? (
            <HeatmapLegend levels={levels} color={color} shape={shape} />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/** "Less ▢▢▢▢▢ More": the ramp as a key. */
function HeatmapLegend({
  levels = 5,
  color = "var(--primary)",
  shape = "square",
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  levels?: number
  color?: string
  shape?: "square" | "round"
}) {
  return (
    <div
      data-slot="heatmap-legend"
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}
      {...props}
    >
      <span>Less</span>
      <CellGrid
        aria-hidden
        cells={Array.from({ length: levels }, (_, level) => ({
          id: String(level),
          level,
        }))}
        columns={levels}
        size="sm"
        shape={shape}
        levels={levels}
        color={color}
      />
      <span>More</span>
    </div>
  )
}

export { Heatmap, HeatmapLegend, quantizesHeatmap }
