import {
  normalizeRange,
  type CellRef,
  type GridRange,
} from "@/components/standard/data-grid-model"

// Selection

export type SelectionMode = "cells" | "rows" | "cols" | "all"
export type Selection = { anchor: CellRef; focus: CellRef; mode: SelectionMode }

export function clampIndex(value: number, count: number) {
  return Math.min(Math.max(value, 0), Math.max(count - 1, 0))
}

export function clampRef(ref: CellRef, rows: number, cols: number): CellRef {
  return { row: clampIndex(ref.row, rows), col: clampIndex(ref.col, cols) }
}

export function selectionRange(
  selection: Selection,
  rows: number,
  cols: number
): GridRange {
  const range = normalizeRange(selection.anchor, selection.focus)
  if (selection.mode === "rows" || selection.mode === "all") {
    range.left = 0
    range.right = cols - 1
  }
  if (selection.mode === "cols" || selection.mode === "all") {
    range.top = 0
    range.bottom = rows - 1
  }
  return range
}

export function sameRef(a: CellRef, b: CellRef) {
  return a.row === b.row && a.col === b.col
}

export function sameSelection(a: Selection, b: Selection) {
  return (
    a.mode === b.mode &&
    sameRef(a.anchor, b.anchor) &&
    sameRef(a.focus, b.focus)
  )
}

export function sameRange(a: GridRange | null, b: GridRange | null) {
  if (a === null || b === null) {
    return a === b
  }
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.bottom === b.bottom &&
    a.right === b.right
  )
}

export function rangeSelection(range: GridRange): Selection {
  return {
    anchor: { row: range.top, col: range.left },
    focus: { row: range.bottom, col: range.right },
    mode: "cells",
  }
}

export function indicesOf(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, at) => from + at)
}

export const EDGE_TOP = 1
export const EDGE_RIGHT = 2
export const EDGE_BOTTOM = 4
export const EDGE_LEFT = 8

export function edgeShadows(edges: number, color: string) {
  const parts: string[] = []
  if (edges & EDGE_TOP) parts.push(`inset 0 1px 0 0 ${color}`)
  if (edges & EDGE_BOTTOM) parts.push(`inset 0 -1px 0 0 ${color}`)
  if (edges & EDGE_LEFT) parts.push(`inset 1px 0 0 0 ${color}`)
  if (edges & EDGE_RIGHT) parts.push(`inset -1px 0 0 0 ${color}`)
  return parts
}
