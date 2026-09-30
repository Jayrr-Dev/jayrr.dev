"use client"

import * as React from "react"
import { cn } from "cn"

import {
  resolveGridColor,
  type CellValue,
  type GridColumn,
  type GridRow,
  type GridStyle,
} from "@/components/standard/data-grid-model"
import type { GridActions } from "@/components/standard/data-grid/actions"
import {
  formatsPlain,
  TextEditor,
  type DataGridCellContext,
  type DataGridCellType,
  type DataGridEditorContext,
} from "@/components/standard/data-grid/cell-types"
import { edgeShadows } from "@/components/standard/data-grid/selection"

export type GridCellProps = {
  gridId: string
  rowIndex: number
  colIndex: number
  row: GridRow
  column: GridColumn
  value: CellValue
  type: DataGridCellType
  x: number
  y: number
  width: number
  height: number
  inRange: boolean
  active: boolean
  rangeEdges: number
  inFill: boolean
  fillEdges: number
  handle: boolean
  editing: boolean
  initialText: string | null
  readOnly: boolean
  ruleStyle: GridStyle | null
  actions: GridActions
}

export const ALIGN_CLASS = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
} as const

/** Inline CSS for a rule style. Keeps the selection tint on top of a rule background. */
export function ruleCss(
  style: GridStyle | null,
  tinted: boolean
): React.CSSProperties {
  if (!style) {
    return {}
  }
  const css: React.CSSProperties = { ...(style.css as React.CSSProperties) }
  if (style.background) {
    const background = resolveGridColor(style.background, "background")
    css.background = tinted
      ? `linear-gradient(var(--grid-tint), var(--grid-tint)), ${background}`
      : background
  }
  if (style.color) css.color = resolveGridColor(style.color, "text")
  if (style.bold) css.fontWeight = 600
  if (style.italic) css.fontStyle = "italic"
  if (style.fontSize) css.fontSize = style.fontSize
  const lines = [
    style.underline && "underline",
    style.strike && "line-through",
  ].filter(Boolean)
  if (lines.length > 0) css.textDecorationLine = lines.join(" ")
  return css
}

export const GridCell = React.memo(function GridCell({
  gridId,
  rowIndex,
  colIndex,
  row,
  column,
  value,
  type,
  x,
  y,
  width,
  height,
  inRange,
  active,
  rangeEdges,
  inFill,
  fillEdges,
  handle,
  editing,
  initialText,
  readOnly,
  ruleStyle,
  actions,
}: GridCellProps) {
  const context: DataGridCellContext = {
    value,
    column,
    row,
    rowIndex,
    colIndex,
    active,
    readOnly,
    setValue: (next) => actions.setCellValue(rowIndex, colIndex, next),
  }
  const shadows = [
    ...(active ? ["inset 0 0 0 2px var(--grid-accent)"] : []),
    ...edgeShadows(rangeEdges, "var(--grid-accent)"),
    ...edgeShadows(fillEdges, "var(--grid-fill-edge)"),
    ...(ruleStyle?.border
      ? [`inset 0 0 0 1px ${resolveGridColor(ruleStyle.border, "text")}`]
      : []),
  ]
  const align = ruleStyle?.align ?? type.align

  let content: React.ReactNode
  if (editing && type.edit !== false) {
    const editorContext: DataGridEditorContext = {
      ...context,
      initialText,
      text: (type.format ?? formatsPlain)(value, column),
      parse: (text) => (type.parse ? type.parse(text, column) : text),
      commit: actions.commitEdit,
      cancel: actions.cancelEdit,
      register: actions.registerEditor,
    }
    content = type.edit ? (
      type.edit(editorContext)
    ) : (
      <TextEditor context={editorContext} />
    )
  } else if (type.render) {
    content = type.render(context)
  } else {
    content = (
      <span className="truncate">
        {(type.format ?? formatsPlain)(value, column)}
      </span>
    )
  }

  return (
    <div
      role="gridcell"
      id={active ? `${gridId}-active` : undefined}
      aria-colindex={colIndex + 2}
      aria-selected={inRange}
      aria-readonly={readOnly || undefined}
      data-grid-row={rowIndex}
      data-grid-col={colIndex}
      data-active={active || undefined}
      className={cn(
        "absolute flex min-w-0 items-center border-r border-b border-border px-2 text-sm",
        align && ALIGN_CLASS[align],
        inRange && !active && "bg-(--grid-tint)",
        inFill && "bg-(--grid-tint)",
        editing || handle ? "z-10 overflow-visible" : "overflow-hidden",
        editing && "bg-background",
        ruleStyle?.className
      )}
      style={{
        ...ruleCss(ruleStyle, (inRange && !active) || inFill),
        left: x,
        top: y,
        width,
        height,
        boxShadow: shadows.length > 0 ? shadows.join(", ") : undefined,
      }}
      onPointerDown={(event) =>
        actions.cellPointerDown(event, rowIndex, colIndex)
      }
      onDoubleClick={() => actions.cellDoubleClick(rowIndex, colIndex)}
      onContextMenu={(event) =>
        actions.cellContextMenu(event, rowIndex, colIndex)
      }
    >
      {content}
      {handle ? (
        <span
          aria-hidden
          data-grid-fill-handle
          className="absolute -right-1 -bottom-1 z-10 size-2 cursor-crosshair border border-background bg-(--grid-accent)"
          onPointerDown={actions.fillPointerDown}
        />
      ) : null}
    </div>
  )
})
