"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsLeftRightIcon,
  ChevronsUpDownIcon,
  PlusIcon,
} from "lucide-react"
import { cn } from "cn"

import {
  columnLetter,
  type SortDirection,
} from "@/components/standard/data-grid-model"
import type {
  Axis2,
  GridActions,
} from "@/components/standard/data-grid/actions"
import {
  HeaderFilter,
  stopsEvent,
} from "@/components/standard/data-grid/filter"

// Row and column headers.

export type DataGridSortIndicator = "arrow" | "chevron"

export type HeaderMode = "coordinates" | "labels" | "both"
export type HeaderState = "none" | "partial" | "full"

export type HeaderCellProps = {
  axis: Axis2
  index: number
  x: number
  y: number
  width: number
  height: number
  label: string | undefined
  mode: HeaderMode
  state: HeaderState
  hiddenBefore: boolean
  hiddenAfter: boolean
  renaming: boolean
  editable: boolean
  sortDirection: SortDirection | null
  sortIndicator: DataGridSortIndicator
  filterable: boolean
  filterActive: boolean
  actions: GridActions
}

export const HeaderCell = React.memo(function HeaderCell({
  axis,
  index,
  x,
  y,
  width,
  height,
  label,
  mode,
  state,
  hiddenBefore,
  hiddenAfter,
  renaming,
  editable,
  sortDirection,
  sortIndicator,
  filterable,
  filterActive,
  actions,
}: HeaderCellProps) {
  const coordinate = axis === "col" ? columnLetter(index) : String(index + 1)
  const isCol = axis === "col"
  const UnhideIcon = isCol ? ChevronsLeftRightIcon : ChevronsUpDownIcon
  const noun = isCol ? "column" : "row"

  return (
    <div
      role={isCol ? "columnheader" : "rowheader"}
      aria-colindex={isCol ? index + 2 : 1}
      aria-selected={state !== "none"}
      data-grid-row={isCol ? -1 : index}
      data-grid-col={isCol ? index : -1}
      className={cn(
        "group/header absolute flex min-w-0 items-center gap-1.5 border-r border-b border-border bg-muted/60 px-2 text-xs text-muted-foreground select-none",
        mode === "coordinates" && "justify-center",
        filterable && "pr-9",
        state === "partial" && "bg-(--grid-tint) text-foreground",
        state === "full" &&
          "bg-(--grid-tint-strong) font-medium text-foreground"
      )}
      style={{ left: x, top: y, width, height }}
      onPointerDown={(event) => actions.headerPointerDown(event, axis, index)}
      onClick={(event) => actions.headerClick(event, axis, index)}
      onDoubleClick={() => actions.headerDoubleClick(axis, index)}
      onContextMenu={(event) => actions.headerContextMenu(event, axis, index)}
    >
      {renaming ? (
        <input
          data-grid-editor
          autoFocus
          defaultValue={label ?? ""}
          aria-label={`Rename ${noun} ${coordinate}`}
          className="h-6 min-w-0 flex-1 rounded-sm bg-background px-1 text-xs text-foreground ring-1 ring-(--grid-accent) outline-none"
          onPointerDown={(event) => event.stopPropagation()}
          onBlur={(event) =>
            actions.finishRename(axis, index, event.currentTarget.value)
          }
          onKeyDown={(event) => {
            event.stopPropagation()
            if (event.key === "Enter") {
              actions.finishRename(axis, index, event.currentTarget.value)
            } else if (event.key === "Escape") {
              actions.finishRename(axis, index, null)
            }
          }}
        />
      ) : (
        <>
          {mode !== "labels" || !label ? (
            <span
              className={cn(
                "shrink-0 tabular-nums",
                mode === "both" && label && "font-mono opacity-60"
              )}
            >
              {coordinate}
            </span>
          ) : null}
          {mode !== "coordinates" && label ? (
            <span className="truncate">{label}</span>
          ) : null}
          {sortDirection && sortIndicator === "arrow" ? (
            <span
              aria-label={
                sortDirection === "asc"
                  ? "Sorted ascending"
                  : "Sorted descending"
              }
              className="shrink-0 text-foreground"
            >
              {sortDirection === "asc" ? (
                <ArrowUpIcon aria-hidden className="size-3" />
              ) : (
                <ArrowDownIcon aria-hidden className="size-3" />
              )}
            </span>
          ) : null}
        </>
      )}

      {sortDirection && sortIndicator === "chevron" ? (
        <span
          role="img"
          aria-label={
            sortDirection === "asc" ? "Sorted ascending" : "Sorted descending"
          }
          className={cn(
            "pointer-events-none absolute left-1/2 flex -translate-x-1/2 text-foreground",
            sortDirection === "asc" ? "-top-0.5" : "-bottom-0.5"
          )}
        >
          {sortDirection === "asc" ? (
            <ChevronUpIcon aria-hidden className="size-3.5" strokeWidth={2.5} />
          ) : (
            <ChevronDownIcon
              aria-hidden
              className="size-3.5"
              strokeWidth={2.5}
            />
          )}
        </span>
      ) : null}

      {filterable && !renaming ? (
        <HeaderFilter index={index} active={filterActive} actions={actions} />
      ) : null}

      {hiddenBefore ? (
        <button
          type="button"
          aria-label={`Show hidden ${noun}s`}
          className={cn(
            "absolute z-20 flex items-center justify-center rounded-sm border border-border bg-background text-muted-foreground hover:text-foreground",
            isCol
              ? "top-1/2 -left-1.5 h-4 w-3 -translate-y-1/2"
              : "-top-1.5 left-1/2 h-3 w-4 -translate-x-1/2"
          )}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => actions.unhideNear(axis, index, "before")}
        >
          <UnhideIcon aria-hidden className="size-2.5" />
        </button>
      ) : null}
      {hiddenAfter ? (
        <button
          type="button"
          aria-label={`Show hidden ${noun}s`}
          className={cn(
            "absolute z-20 flex items-center justify-center rounded-sm border border-border bg-background text-muted-foreground hover:text-foreground",
            isCol
              ? "top-1/2 -right-1.5 h-4 w-3 -translate-y-1/2"
              : "-bottom-1.5 left-1/2 h-3 w-4 -translate-x-1/2"
          )}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => actions.unhideNear(axis, index, "after")}
        >
          <UnhideIcon aria-hidden className="size-2.5" />
        </button>
      ) : null}

      {editable ? (
        // The edge between this header and the next: drag to resize, and the
        // insert button shows only while the pointer is on this edge.
        <div
          className={cn(
            "group/edge absolute z-10",
            isCol
              ? "top-0 -right-1.5 h-full w-3"
              : "-bottom-1.5 left-0 h-3 w-full"
          )}
          // Clicks here resize or insert; they must not reach the header and sort it.
          onClick={stopsEvent}
          onDoubleClick={stopsEvent}
        >
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 group-hover/edge:bg-(--grid-tint-strong)",
              isCol ? "cursor-col-resize" : "cursor-row-resize"
            )}
            onPointerDown={(event) =>
              actions.resizePointerDown(event, axis, index)
            }
            onDoubleClick={(event) => {
              event.stopPropagation()
              actions.resizeReset(axis, index)
            }}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={
              isCol
                ? `Insert column after ${coordinate}`
                : `Insert row after ${coordinate}`
            }
            className="absolute top-1/2 left-1/2 hidden size-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-(--grid-accent) text-primary-foreground shadow-sm group-hover/edge:flex"
            onPointerDown={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              actions.insertAfter(axis, index)
            }}
          >
            <PlusIcon aria-hidden className="size-3" />
          </button>
        </div>
      ) : null}
    </div>
  )
})
