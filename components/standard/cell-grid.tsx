"use client"

import * as React from "react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

/**
 * A grid of equal cells: the base of heatmaps, contribution graphs, seat
 * maps and payment timelines. Each cell takes a `level` on a ramp of
 * `color`, or its own `color`, plus an optional inner `mark` (a "today" pip).
 *
 * Cells fill row by row across `columns`, or column by column down `rows`
 * (the contribution-graph layout: 7 rows, one column per week). Pass
 * `onValueChange` or `selectable` to make cells a keyboard-navigable listbox.
 *
 * <CellGrid rows={7} cells={days} color="oklch(0.7 0.17 150)" selectable />
 */

export type CellGridCell = {
  id: string
  /** Tooltip and accessible name. */
  label?: string
  /** Step on the color ramp, 0 (empty) to `levels - 1` (full). */
  level?: number
  /** A fill of its own; wins over `level`. */
  color?: string
  /** Draws an inner pip, e.g. to flag today. */
  mark?: boolean
  /** Dims the cell, e.g. days padded outside a range. */
  faded?: boolean
  /** Holds the slot but draws nothing and cannot be focused. */
  placeholder?: boolean
  disabled?: boolean
}

const cellGridSizes = ["xs", "sm", "default", "lg", "xl"] as const
type CellGridSize = (typeof cellGridSizes)[number]

const SIZE_VARS: Record<CellGridSize, { size: string; gap: string }> = {
  xs: { size: "0.5rem", gap: "2px" },
  sm: { size: "0.625rem", gap: "2px" },
  default: { size: "0.75rem", gap: "3px" },
  lg: { size: "0.875rem", gap: "3px" },
  xl: { size: "1rem", gap: "4px" },
}

/** The `--cell-size` and `--cell-gap` vars, for laying labels out beside the grid. */
function cellGridSizeVars(size: CellGridSize = "default") {
  const vars = SIZE_VARS[size]
  return {
    "--cell-size": vars.size,
    "--cell-gap": vars.gap,
  } as React.CSSProperties
}

/** Level 0 is the empty track; the rest step from a light tint to `color`. */
function fillsLevel(level: number, levels: number) {
  if (level <= 0) {
    return undefined
  }
  const steps = Math.max(levels - 1, 1)
  const clamped = Math.min(level, steps)
  const percent = steps === 1 ? 100 : 30 + (70 * (clamped - 1)) / (steps - 1)
  return `color-mix(in oklab, var(--cell-grid-color) ${Math.round(percent)}%, var(--cell-grid-track))`
}

function CellGrid({
  cells,
  rows,
  columns,
  size = "default",
  shape = "square",
  levels = 5,
  color = "var(--primary)",
  value: valueProp,
  defaultValue = null,
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
  cells: CellGridCell[]
  /** Fill column by column, this many cells tall. Wins over `columns`. */
  rows?: number
  /** Fill row by row, this many cells wide. Defaults to 10 when `rows` is unset. */
  columns?: number
  size?: CellGridSize
  shape?: "square" | "round"
  /** Steps on the color ramp, counting the empty level 0. */
  levels?: number
  /** The full-level fill; any CSS color. */
  color?: string
  /** Id of the selected cell. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /** Makes cells selectable without controlling the value. */
  selectable?: boolean
  /** The cell under the pointer or focus, or null when it leaves. */
  onActiveChange?: (cell: CellGridCell | null) => void
}) {
  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const interactive = Boolean(
    selectable || onValueChange || valueProp !== undefined
  )
  const byColumn = rows !== undefined
  const lanes = Math.max(1, (byColumn ? rows : columns) ?? 10)

  const cellRefs = React.useRef<(HTMLElement | null)[]>([])
  const [focusIndex, setFocusIndex] = React.useState<number | null>(null)

  const firstUsable = cells.findIndex((c) => !c.placeholder && !c.disabled)
  const selectedIndex = cells.findIndex((c) => c.id === value)
  const tabIndexAt =
    focusIndex ?? (selectedIndex >= 0 ? selectedIndex : firstUsable)

  /**
   * Steps from `from` by `delta` until it lands on a usable cell, staying
   * within `lane` when given so a step along a lane never wraps.
   */
  const findsCell = (from: number, delta: number, lane?: number) => {
    for (let i = from + delta; i >= 0 && i < cells.length; i += delta) {
      if (lane !== undefined && Math.floor(i / lanes) !== lane) {
        return null
      }
      if (!cells[i].placeholder && !cells[i].disabled) {
        return i
      }
    }
    return null
  }

  const movesFocus = (index: number | null) => {
    if (index === null) {
      return
    }
    setFocusIndex(index)
    cellRefs.current[index]?.focus()
  }

  const handlesKeyDown = (event: React.KeyboardEvent, index: number) => {
    // Along a lane is ±1 and stays in it; across lanes is ±lanes.
    const steps: Record<string, number> = byColumn
      ? { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -lanes, ArrowRight: lanes }
      : { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -lanes, ArrowDown: lanes }
    const lane = Math.floor(index / lanes)
    if (event.key in steps) {
      event.preventDefault()
      const delta = steps[event.key]
      movesFocus(
        findsCell(index, delta, Math.abs(delta) === 1 ? lane : undefined)
      )
    } else if (event.key === "Home") {
      event.preventDefault()
      movesFocus(
        event.ctrlKey ? findsCell(-1, 1) : findsCell(lane * lanes - 1, 1, lane)
      )
    } else if (event.key === "End") {
      event.preventDefault()
      movesFocus(
        event.ctrlKey
          ? findsCell(cells.length, -1)
          : findsCell((lane + 1) * lanes, -1, lane)
      )
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      setValue(cells[index].id === value ? null : cells[index].id)
    }
  }

  return (
    <div
      data-slot="cell-grid"
      data-interactive={interactive || undefined}
      role={interactive ? "listbox" : "img"}
      aria-label={ariaLabel}
      aria-orientation={
        interactive ? (byColumn ? "vertical" : "horizontal") : undefined
      }
      className={cn("grid w-max gap-(--cell-gap)", className)}
      style={{
        ...cellGridSizeVars(size),
        ...({
          "--cell-grid-color": color,
          "--cell-grid-track": "var(--muted)",
        } as React.CSSProperties),
        ...(byColumn
          ? {
              gridTemplateRows: `repeat(${lanes}, var(--cell-size))`,
              gridAutoFlow: "column",
              gridAutoColumns: "var(--cell-size)",
            }
          : {
              gridTemplateColumns: `repeat(${lanes}, var(--cell-size))`,
              gridAutoRows: "var(--cell-size)",
            }),
        ...style,
      }}
      onPointerLeave={() => onActiveChange?.(null)}
      {...props}
    >
      {cells.map((cell, index) => {
        if (cell.placeholder) {
          return (
            <span
              key={cell.id}
              data-slot="cell-grid-cell"
              data-placeholder
              aria-hidden
            />
          )
        }
        const selected = cell.id === value
        const fill = cell.color ?? fillsLevel(cell.level ?? 0, levels)
        const cellProps = {
          "data-slot": "cell-grid-cell",
          "data-level": cell.level ?? 0,
          "data-selected": selected || undefined,
          "data-faded": cell.faded || undefined,
          "data-mark": cell.mark || undefined,
          "data-disabled": cell.disabled || undefined,
          title: cell.label,
          style: { backgroundColor: fill ?? "var(--cell-grid-track)" },
          className: cn(
            "relative block size-(--cell-size) shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_7%,transparent)] transition-[opacity,outline-color] duration-150",
            shape === "round"
              ? "rounded-full"
              : "rounded-[max(2px,calc(var(--cell-size)*0.2))]",
            "data-faded:opacity-35",
            "data-selected:outline-2 data-selected:outline-offset-1 data-selected:outline-foreground data-selected:outline-solid"
          ),
          onPointerEnter: () => onActiveChange?.(cell),
        }
        const mark = cell.mark ? (
          <span
            aria-hidden
            data-slot="cell-grid-mark"
            className={cn(
              "absolute inset-[22%] bg-foreground",
              shape === "round" ? "rounded-full" : "rounded-[1px]"
            )}
          />
        ) : null

        if (!interactive) {
          return (
            <span key={cell.id} {...cellProps}>
              {mark}
            </span>
          )
        }
        return (
          <button
            key={cell.id}
            ref={(node) => {
              cellRefs.current[index] = node
            }}
            type="button"
            role="option"
            aria-selected={selected}
            aria-label={cell.label ?? cell.id}
            aria-disabled={cell.disabled || undefined}
            tabIndex={index === tabIndexAt ? 0 : -1}
            {...cellProps}
            className={cn(
              cellProps.className,
              "cursor-pointer outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              "data-disabled:cursor-not-allowed data-disabled:opacity-35"
            )}
            onFocus={() => {
              setFocusIndex(index)
              onActiveChange?.(cell)
            }}
            onBlur={() => onActiveChange?.(null)}
            onClick={() => {
              if (cell.disabled) {
                return
              }
              setFocusIndex(index)
              setValue(selected ? null : cell.id)
            }}
            onKeyDown={(event) => handlesKeyDown(event, index)}
          >
            {mark}
          </button>
        )
      })}
    </div>
  )
}

export { CellGrid, cellGridSizes, cellGridSizeVars, type CellGridSize }
