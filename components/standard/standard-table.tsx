"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { cn } from "cn"

import {
  filteringListRows,
  readingListCell,
  RendersStandardListChrome,
  RendersStandardListPager,
  type StandardListFilter,
  type StandardListTitleBar,
} from "@/components/standard/standard-list-chrome"

export type StandardTableColumn<T> = {
  key: string
  label: string
  sortable?: boolean
  sortFunction?: (a: T, b: T) => number
  renderCell?: (item: T, index: number) => React.ReactNode
  filter?: StandardListFilter
}

export type StandardTableProps<T extends object> = {
  columns: StandardTableColumn<T>[]
  data: T[]
  getRowKey: (item: T, index: number) => string | number
  className?: string
  compact?: boolean
  sorting?: boolean
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
  emptyMessage?: string
  stickyFirstColumn?: boolean
  renderRowActions?: (item: T, index: number) => React.ReactNode
}

function StandardTable<T extends object>({
  columns,
  data,
  getRowKey,
  className,
  compact = false,
  sorting = true,
  showSearch = false,
  searchPlaceholder,
  filterBadge = false,
  filterSelect = false,
  showRefresh = false,
  onRefresh,
  titleBar,
  errorBar,
  pagination = false,
  initialPageSize = 10,
  emptyMessage = "No Data",
  stickyFirstColumn = false,
  renderRowActions,
}: StandardTableProps<T>) {
  const [query, setQuery] = React.useState("")
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(initialPageSize)
  const [selectedFilters, setSelectedFilters] = React.useState<
    Record<string, string>
  >({})

  const filters = columns
    .map((column) => column.filter)
    .filter((filter): filter is StandardListFilter => Boolean(filter))

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

  const cellPad = compact
    ? "px-1.5 py-1 text-center text-sm text-foreground"
    : "px-2 py-2 text-center text-sm"
  const headPad = compact
    ? "h-8 px-2 py-0.5 text-sm text-foreground"
    : "h-10 px-2 text-xs font-semibold text-foreground"

  return (
    <div
      data-slot="standard-table"
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
      <div className="max-h-80 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-background">
            <tr>
              {columns.map((column, columnIndex) => {
                let canSort = sorting
                if (column.sortable === false) {
                  canSort = false
                }
                const isActive = sortKey === column.key
                let isAsc = false
                let isDesc = false
                if (isActive) {
                  isAsc = sortDir === "asc"
                  isDesc = sortDir === "desc"
                }

                return (
                  <th
                    key={column.key}
                    aria-sort={
                      isAsc ? "ascending" : isDesc ? "descending" : "none"
                    }
                    className={cn(
                      "relative overflow-hidden border-b border-foreground text-center align-middle whitespace-nowrap",
                      headPad,
                      canSort ? "cursor-pointer select-none" : undefined,
                      stickyFirstColumn && columnIndex === 0
                        ? "sticky left-0 z-20 bg-background"
                        : undefined
                    )}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        className="relative flex h-full w-full min-h-0 flex-col items-center justify-center overflow-hidden"
                        onClick={() => sortBy(column.key)}
                      >
                        {isAsc ? (
                          <ChevronUpIcon
                            aria-hidden
                            className="pointer-events-none absolute top-0 left-1/2 z-10 size-3 -translate-x-1/2 text-foreground"
                          />
                        ) : null}
                        <span className="relative z-0 px-0.5 leading-none">
                          {column.label}
                        </span>
                        {isDesc ? (
                          <ChevronDownIcon
                            aria-hidden
                            className="pointer-events-none absolute bottom-0 left-1/2 z-10 size-3 -translate-x-1/2 text-foreground"
                          />
                        ) : null}
                      </button>
                    ) : (
                      <span className="leading-none">{column.label}</span>
                    )}
                  </th>
                )
              })}
              {renderRowActions ? (
                <th
                  className={cn(
                    "border-b border-foreground text-center text-xs font-semibold",
                    headPad
                  )}
                >
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    renderRowActions ? columns.length + 1 : columns.length
                  }
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className="border-b border-border last:border-0 hover:bg-muted/40"
                >
                  {columns.map((column, columnIndex) => (
                    <td
                      key={column.key}
                      className={cn(
                        cellPad,
                        stickyFirstColumn && columnIndex === 0
                          ? "sticky left-0 z-10 bg-background"
                          : undefined
                      )}
                    >
                      {column.renderCell
                        ? column.renderCell(row, index)
                        : readingListCell(row, column.key)}
                    </td>
                  ))}
                  {renderRowActions ? (
                    <td className={cellPad}>{renderRowActions(row, index)}</td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination ? (
        <RendersStandardListPager
          page={currentPage}
          pageSize={pageSize}
          total={sorted.length}
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

export { StandardTable }
