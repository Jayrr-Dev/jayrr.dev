"use client"

import * as React from "react"
import { cn } from "cn"

import {
  RendersStandardListChrome,
  RendersStandardListPager,
  useStandardList,
  type StandardListFilter,
  type StandardListProps,
} from "@/components/standard/standard-list-chrome"

export type StandardGridColumnConfig = {
  base?: number
  sm?: number
  md?: number
}

type StandardGridColumnCount = 1 | 2 | 3 | 4 | 5 | 6

/** Grid-only props, shared by StandardGrid and TableList's grid view. */
export type StandardGridViewProps<T extends object> = {
  renderCard: (item: T, index: number) => React.ReactNode
  getItemKey: (item: T, index: number) => string | number
  columns?: StandardGridColumnConfig
  /** `xs` packs tiles edge to edge, for media grids. */
  gap?: "xs" | "sm" | "md" | "lg"
  skipCardWrapper?: boolean
}

export type StandardGridProps<T extends object> = StandardListProps<T> &
  StandardGridViewProps<T> & {
    filters?: StandardListFilter[]
  }

const GAP_CLASS = {
  xs: "gap-0.5",
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
} as const

// Literal class names so Tailwind generates every breakpoint.
const COL_CLASS = {
  "": {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  },
  "sm:": {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    5: "sm:grid-cols-5",
    6: "sm:grid-cols-6",
  },
  "md:": {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  },
} as const

function readingColClass(
  count: number | undefined,
  prefix: keyof typeof COL_CLASS
) {
  if (count === undefined) {
    return prefix ? "" : COL_CLASS[""][1]
  }
  const clamped = Math.min(
    Math.max(Math.round(count), 1),
    6
  ) as StandardGridColumnCount
  return COL_CLASS[prefix][clamped]
}

/**
 * The scrolling card grid, or the empty state. State lives in the caller
 * (see useStandardList).
 */
export function RendersStandardGridBody<T extends object>({
  rows,
  renderCard,
  getItemKey,
  columns,
  gap = "md",
  skipCardWrapper = false,
  emptyMessage = "No Data",
}: StandardGridViewProps<T> & {
  rows: T[]
  emptyMessage?: string
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  const gridClass = cn(
    "grid",
    GAP_CLASS[gap],
    readingColClass(columns?.base ?? 1, ""),
    readingColClass(columns?.sm, "sm:"),
    readingColClass(columns?.md, "md:")
  )

  return (
    <div className={cn("max-h-80 overflow-auto", gridClass)}>
      {rows.map((item, index) => {
        const card = renderCard(item, index)
        if (skipCardWrapper) {
          return (
            <div key={getItemKey(item, index)} className="min-w-0">
              {card}
            </div>
          )
        }
        return (
          <div
            key={getItemKey(item, index)}
            className="min-w-0 rounded-xl border border-border bg-card p-3"
          >
            {card}
          </div>
        )
      })}
    </div>
  )
}

function StandardGrid<T extends object>({
  data,
  renderCard,
  getItemKey,
  columns,
  gap = "md",
  className,
  skipCardWrapper = false,
  emptyMessage = "No Data",
  showSearch = false,
  searchPlaceholder,
  filterBadge = false,
  filterSelect = false,
  filters = [],
  showRefresh = false,
  onRefresh,
  titleBar,
  errorBar,
  pagination = false,
  initialPageSize = 10,
}: StandardGridProps<T>) {
  const list = useStandardList({
    data,
    filters,
    pagination,
    initialPageSize,
  })

  return (
    <div
      data-slot="standard-grid"
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-lg border border-foreground",
        className
      )}
    >
      <RendersStandardListChrome
        titleBar={titleBar}
        errorBar={errorBar}
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
        showRefresh={showRefresh}
        onRefresh={onRefresh}
        filterBadge={filterBadge}
        filterSelect={filterSelect}
        {...list.chromeProps}
      />
      <RendersStandardGridBody
        rows={list.paged}
        renderCard={renderCard}
        getItemKey={getItemKey}
        columns={columns}
        gap={gap}
        skipCardWrapper={skipCardWrapper}
        emptyMessage={emptyMessage}
      />
      {pagination ? <RendersStandardListPager {...list.pagerProps} /> : null}
    </div>
  )
}

export { StandardGrid }
