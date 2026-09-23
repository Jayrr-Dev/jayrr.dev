"use client"

import * as React from "react"
import { cn } from "cn"

import {
  filteringListRows,
  RendersStandardListChrome,
  RendersStandardListPager,
  type StandardListFilter,
  type StandardListTitleBar,
} from "@/components/standard/standard-list-chrome"

export type StandardGridColumnConfig = {
  base?: number
  sm?: number
  md?: number
}

export type StandardGridProps<T extends object> = {
  data: T[]
  renderCard: (item: T, index: number) => React.ReactNode
  getItemKey: (item: T, index: number) => string | number
  columns?: StandardGridColumnConfig
  gap?: "sm" | "md" | "lg"
  className?: string
  skipCardWrapper?: boolean
  emptyMessage?: string
  showSearch?: boolean
  searchPlaceholder?: string
  filterBadge?: boolean
  filterSelect?: boolean
  filters?: StandardListFilter[]
  showRefresh?: boolean
  onRefresh?: () => void
  titleBar?: StandardListTitleBar
  errorBar?: string
  pagination?: boolean
  initialPageSize?: number
}

const GAP_CLASS = {
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
} as const

function readingColClass(count: number | undefined, prefix: string) {
  if (count === undefined) {
    if (prefix) {
      return ""
    }
    return "grid-cols-1"
  }
  if (count === 2) {
    return `${prefix}grid-cols-2`
  }
  if (count === 3) {
    return `${prefix}grid-cols-3`
  }
  if (count === 4) {
    return `${prefix}grid-cols-4`
  }
  return `${prefix}grid-cols-1`
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
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(initialPageSize)
  const [selectedFilters, setSelectedFilters] = React.useState<
    Record<string, string>
  >({})

  const filtered = filteringListRows(data, query, filters, selectedFilters)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const paged = pagination
    ? filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filtered

  const gridClass = cn(
    "grid",
    GAP_CLASS[gap],
    readingColClass(columns?.base ?? 1, ""),
    readingColClass(columns?.sm, "sm:"),
    readingColClass(columns?.md, "md:")
  )

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
        searchValue={query}
        onSearchChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
        showRefresh={showRefresh}
        onRefresh={onRefresh}
        filterBadge={filterBadge}
        filterSelect={filterSelect}
        filters={filters}
        selectedFilters={selectedFilters}
        onFilterChange={(key, value) => {
          setSelectedFilters((current) => ({ ...current, [key]: value }))
          setPage(1)
        }}
      />
      {paged.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className={cn("max-h-80 overflow-auto", gridClass)}>
          {paged.map((item, index) => {
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
      )}
      {pagination ? (
        <RendersStandardListPager
          page={currentPage}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(next) => {
            setPageSize(next)
            setPage(1)
          }}
        />
      ) : null}
    </div>
  )
}

export { StandardGrid }
