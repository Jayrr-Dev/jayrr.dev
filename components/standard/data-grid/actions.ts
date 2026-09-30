import * as React from "react"

import type {
  CellValue,
  GridConditionOp,
  GridFilter,
  SortDirection,
} from "@/components/standard/data-grid-model"
import type { DataGridEditMove } from "@/components/standard/data-grid/cell-types"

// Stable handlers: memoized cells get one object whose methods always call
// the latest render's closures.

export type Handler = (...args: never[]) => unknown

export function useStableHandlers<T extends Record<string, Handler>>(
  handlers: T
): T {
  const ref = React.useRef(handlers)
  React.useLayoutEffect(() => {
    ref.current = handlers
  })
  const [stable] = React.useState(() => {
    const proxy = {} as Record<string, Handler>
    for (const key of Object.keys(handlers)) {
      proxy[key] = (...args: never[]) => ref.current[key](...args)
    }
    return proxy as T
  })
  return stable
}

export type Axis2 = "row" | "col"

export type GridActions = {
  cellPointerDown: (event: React.PointerEvent, row: number, col: number) => void
  cellDoubleClick: (row: number, col: number) => void
  cellContextMenu: (event: React.MouseEvent, row: number, col: number) => void
  fillPointerDown: (event: React.PointerEvent) => void
  setCellValue: (row: number, col: number, value: CellValue) => void
  commitEdit: (value: CellValue, move?: DataGridEditMove) => void
  cancelEdit: () => void
  registerEditor: (save: (() => void) | null) => void
  headerPointerDown: (
    event: React.PointerEvent,
    axis: Axis2,
    index: number
  ) => void
  headerDoubleClick: (axis: Axis2, index: number) => void
  headerContextMenu: (
    event: React.MouseEvent,
    axis: Axis2,
    index: number
  ) => void
  resizePointerDown: (
    event: React.PointerEvent,
    axis: Axis2,
    index: number
  ) => void
  resizeReset: (axis: Axis2, index: number) => void
  insertAfter: (axis: Axis2, index: number) => void
  unhideNear: (axis: Axis2, index: number, side: "before" | "after") => void
  finishRename: (axis: Axis2, index: number, label: string | null) => void
  headerClick: (event: React.MouseEvent, axis: Axis2, index: number) => void
  filterOptions: (index: number) => FilterOptions
  applyFilter: (index: number, filter: GridFilter | null) => void
  sortColumn: (index: number, direction: SortDirection | null) => void
  focusGrid: () => void
}

export type FilterOptions = {
  name: string
  filter: GridFilter | null
  values: { key: string; label: string }[]
  sections: FilterSections
  /** This column's current sort, if the rows are sorted by it. */
  sorted: SortDirection | null
}

export type FilterSections = {
  sort: boolean
  /** Operators to offer; empty hides the condition section. */
  conditions: GridConditionOp[]
  values: boolean
}
