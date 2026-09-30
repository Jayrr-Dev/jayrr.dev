"use client"

import * as React from "react"

import { Badge } from "@/components/standard/badge"
import { Button } from "@/components/standard/button"
import { Select } from "@/components/standard/select"
import { RefreshButton } from "@/components/standard/refresh-button"
import { TextField } from "@/components/standard/text-field"

export type StandardListFilterOption = {
  id: string
  label: string
  value: string
}

export type StandardListFilter = {
  key: string
  label: string
  type: "badge" | "select"
  columnKey: string
  options: StandardListFilterOption[]
}

export type StandardListTitleBar = {
  left?: string
  center?: string
  actions?: { id: string; label: string; onSelect?: () => void }[]
}

/** Chrome and paging props shared by StandardTable, StandardGrid and StandardList. */
export type StandardListProps<T extends object> = {
  data: T[]
  className?: string
  emptyMessage?: string
  showSearch?: boolean
  searchPlaceholder?: string
  filterBadge?: boolean
  filterSelect?: boolean
  showRefresh?: boolean
  onRefresh?: () => void
  titleBar?: StandardListTitleBar
  errorBar?: string
  pagination?: boolean
  initialPageSize?: number
}

export type StandardListSortColumn<T> = {
  key: string
  sortFunction?: (a: T, b: T) => number
}

export type StandardListSortDirection = "asc" | "desc"

export function readingListCell(item: object, key: string) {
  const record = item as Record<string, unknown>
  const value = record[key]
  if (value === null || value === undefined) {
    return ""
  }
  return String(value)
}

export function filteringListRows<T extends object>(
  rows: T[],
  query: string,
  filters: StandardListFilter[],
  selected: Record<string, string>
) {
  const needle = query.trim().toLowerCase()

  return rows.filter((row) => {
    for (const filter of filters) {
      const picked = selected[filter.key]
      if (!picked) {
        continue
      }
      if (readingListCell(row, filter.columnKey) !== picked) {
        return false
      }
    }

    if (!needle) {
      return true
    }

    const haystack = Object.values(row as Record<string, unknown>)
      .map((value) => String(value ?? "").toLowerCase())
      .join(" ")

    return haystack.includes(needle)
  })
}

/**
 * Search, filter, sort and paging state behind the list chrome. Returns the
 * rows at each stage plus ready-made props for RendersStandardListChrome and
 * RendersStandardListPager, so every list view behaves the same.
 */
export function useStandardList<T extends object>({
  data,
  filters,
  columns = [],
  sorting = false,
  pagination = false,
  initialPageSize = 10,
}: {
  data: T[]
  filters: StandardListFilter[]
  /** Columns that can be sorted, with their optional comparators. */
  columns?: StandardListSortColumn<T>[]
  sorting?: boolean
  pagination?: boolean
  initialPageSize?: number
}) {
  const [query, setQuery] = React.useState("")
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortDir, setSortDir] = React.useState<StandardListSortDirection>("asc")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(initialPageSize)
  const [selectedFilters, setSelectedFilters] = React.useState<
    Record<string, string>
  >({})

  const filtered = filteringListRows(data, query, filters, selectedFilters)

  const sorted = [...filtered].sort((left, right) => {
    if (!sortKey) {
      return 0
    }

    const column = columns.find((entry) => entry.key === sortKey)
    if (column?.sortFunction) {
      const compared = column.sortFunction(left, right)
      if (sortDir === "asc") {
        return compared
      }
      return compared * -1
    }

    const compared = readingListCell(left, sortKey).localeCompare(
      readingListCell(right, sortKey)
    )
    if (sortDir === "asc") {
      return compared
    }
    return compared * -1
  })

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const paged = pagination
    ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sorted

  function sortBy(key: string) {
    if (!sorting) {
      return
    }
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
      return
    }
    setSortKey(key)
    setSortDir("asc")
  }

  return {
    query,
    sortKey,
    sortDir,
    sortBy,
    selectedFilters,
    filtered,
    sorted,
    paged,
    chromeProps: {
      filters,
      searchValue: query,
      onSearchChange: (value: string) => {
        setQuery(value)
        setPage(1)
      },
      selectedFilters,
      onFilterChange: (key: string, value: string) => {
        setSelectedFilters((current) => ({ ...current, [key]: value }))
        setPage(1)
      },
    },
    pagerProps: {
      page: currentPage,
      pageSize,
      total: sorted.length,
      onPageChange: setPage,
      onPageSizeChange: (next: number) => {
        setPageSize(next)
        setPage(1)
      },
    },
  }
}

export function RendersStandardListChrome({
  titleBar,
  titleBarTrailing,
  errorBar,
  showSearch,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  showRefresh,
  onRefresh,
  filterBadge,
  filterSelect,
  filters,
  selectedFilters,
  onFilterChange,
}: {
  titleBar?: StandardListTitleBar
  /** Extra controls at the end of the title bar, e.g. a view switcher. */
  titleBarTrailing?: React.ReactNode
  errorBar?: string
  showSearch?: boolean
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  showRefresh?: boolean
  onRefresh?: () => void
  filterBadge?: boolean
  filterSelect?: boolean
  filters: StandardListFilter[]
  selectedFilters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
}) {
  const badgeFilters = filters.filter((filter) => filter.type === "badge")
  const selectFilters = filters.filter((filter) => filter.type === "select")
  const showToolbar = Boolean(
    showSearch || showRefresh || filterSelect || filterBadge
  )

  return (
    <div className="flex flex-col">
      {errorBar ? (
        <p
          role="alert"
          className="w-full min-w-0 px-4 py-0.5 text-xs font-medium leading-snug whitespace-pre-wrap text-destructive"
        >
          {`>\t${errorBar}`}
        </p>
      ) : null}
      {titleBar || titleBarTrailing ? (
        <div
          data-slot="title-bar"
          className="grid w-full min-w-0 grid-cols-4 items-center gap-2 border-b border-foreground px-4 py-2 text-xs font-semibold leading-none text-foreground"
        >
          <div className="col-span-1 min-w-0 justify-self-start self-center text-left">
            {titleBar?.left}
          </div>
          <div className="col-span-2 min-w-0 justify-self-center self-center text-center">
            {titleBar?.center}
          </div>
          <div className="col-span-1 flex min-w-0 items-center justify-end gap-1 justify-self-end self-center">
            {titleBarTrailing}
            {titleBar?.actions?.map((action) => (
              <button
                key={action.id}
                type="button"
                aria-label={action.label}
                title={action.label}
                onClick={action.onSelect}
              >
                <Badge shape="circle">{action.label}</Badge>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {showToolbar ? (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2">
          {showSearch ? (
            <div className="min-w-40 flex-1">
              <TextField
                type="search"
                size="sm"
                clearable={false}
                aria-label={searchPlaceholder ?? "Search"}
                placeholder={searchPlaceholder ?? "Search"}
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          ) : null}
          {filterSelect
            ? selectFilters.map((filter) => (
                <Select
                  key={filter.key}
                  placeholder={filter.label}
                  value={selectedFilters[filter.key] ?? ""}
                  onValueChange={(next) => onFilterChange(filter.key, next)}
                  options={filter.options.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              ))
            : null}
          {showRefresh ? <RefreshButton onClick={onRefresh} /> : null}
        </div>
      ) : null}
      {filterBadge ? (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {badgeFilters.map((filter) => (
            <div key={filter.key} className="flex flex-wrap gap-1">
              {filter.options.map((option) => {
                const isOn = selectedFilters[filter.key] === option.value

                return (
                  <Button
                    key={option.id}
                    size="sm"
                    tone={isOn ? "default" : "outline"}
                    onClick={() =>
                      onFilterChange(filter.key, isOn ? "" : option.value)
                    }
                  >
                    {option.label}
                  </Button>
                )
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function RendersStandardListPager({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-xs text-muted-foreground">
      <span>
        Showing {start} to {end} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Select
          value={String(pageSize)}
          placeholder="Page size"
          onValueChange={(next) => onPageSizeChange(Number(next))}
          options={[
            { value: "3", label: "3" },
            { value: "5", label: "5" },
            { value: "10", label: "10" },
          ]}
        />
        <Button
          size="sm"
          tone="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        <Button
          size="sm"
          tone="outline"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
