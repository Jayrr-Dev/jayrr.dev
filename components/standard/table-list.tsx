"use client"

import * as React from "react"
import { LayoutGridIcon, TableIcon } from "lucide-react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"
import {
  RendersStandardGridBody,
  type StandardGridViewProps,
} from "@/components/standard/standard-grid"
import {
  RendersStandardListChrome,
  RendersStandardListPager,
  useStandardList,
  type StandardListFilter,
  type StandardListProps,
} from "@/components/standard/standard-list-chrome"
import {
  readingColumnFilters,
  RendersStandardTableBody,
  type StandardTableViewProps,
} from "@/components/standard/standard-table"

export type TableListView = "table" | "grid"

/**
 * Props for <TableList>. The shared chrome props (search, filters, title
 * bar, paging) are `StandardListProps` in standard-list-chrome.
 */
export type TableListProps<T extends object> = StandardListProps<T> &
  StandardTableViewProps<T> &
  Omit<StandardGridViewProps<T>, "getItemKey" | "columns"> & {
    /** Controlled view. */
    view?: TableListView
    defaultView?: TableListView
    onViewChange?: (view: TableListView) => void
    /** Adds a table / grid toggle to the title bar. */
    viewSwitcher?: boolean
    /** Grid columns per breakpoint (`columns` holds the table columns). */
    gridColumns?: StandardGridViewProps<T>["columns"]
    /** Filters beyond the ones declared on `columns`. */
    filters?: StandardListFilter[]
  }

const VIEW_OPTIONS = [
  { value: "table", label: "Table view", icon: TableIcon },
  { value: "grid", label: "Grid view", icon: LayoutGridIcon },
] as const

function RendersTableListViewSwitcher({
  view,
  onViewChange,
}: {
  view: TableListView
  onViewChange: (view: TableListView) => void
}) {
  return (
    <div
      role="group"
      aria-label="View"
      data-slot="view-switcher"
      className="flex items-center rounded-md border border-border p-0.5"
    >
      {VIEW_OPTIONS.map((option) => {
        const Icon = option.icon
        const isOn = view === option.value

        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={isOn}
            title={option.label}
            className={cn(
              "inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
              isOn ? "bg-muted text-foreground" : undefined
            )}
            onClick={() => onViewChange(option.value)}
          >
            <Icon aria-hidden className="size-3.5" />
          </button>
        )
      })}
    </div>
  )
}

/**
 * One list, two views. Renders the same rows as a StandardTable or a
 * StandardGrid behind shared chrome, so search, filters, sort order and page
 * survive a switch between views.
 */
function TableList<T extends object>({
  data,
  className,
  emptyMessage = "No Data",
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
  filters = [],
  view: viewProp,
  defaultView = "table",
  onViewChange,
  viewSwitcher = false,
  columns,
  getRowKey,
  sorting = true,
  density = "default",
  striped = false,
  bordered = false,
  stickyFirstColumn = false,
  rowActions,
  bulkActions,
  getRowLabel,
  renderCard,
  gridColumns,
  gap = "md",
  skipCardWrapper = false,
}: TableListProps<T>) {
  const [view, setView] = useControllableState<TableListView>({
    value: viewProp,
    defaultValue: defaultView,
    onChange: onViewChange,
  })

  const columnFilters = readingColumnFilters(columns)
  const allFilters = [
    ...columnFilters,
    ...filters.filter(
      (filter) => !columnFilters.some((entry) => entry.key === filter.key)
    ),
  ]

  const list = useStandardList({
    data,
    filters: allFilters,
    columns,
    sorting,
    pagination,
    initialPageSize,
  })

  return (
    <div
      data-slot="table-list"
      data-view={view}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-lg border border-foreground",
        className
      )}
    >
      <RendersStandardListChrome
        titleBar={titleBar}
        titleBarTrailing={
          viewSwitcher ? (
            <RendersTableListViewSwitcher
              view={view}
              onViewChange={setView}
            />
          ) : undefined
        }
        errorBar={errorBar}
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
        showRefresh={showRefresh}
        onRefresh={onRefresh}
        filterBadge={filterBadge}
        filterSelect={filterSelect}
        {...list.chromeProps}
      />
      {view === "grid" ? (
        <RendersStandardGridBody
          rows={list.paged}
          renderCard={renderCard}
          getItemKey={getRowKey}
          columns={gridColumns}
          gap={gap}
          skipCardWrapper={skipCardWrapper}
          emptyMessage={emptyMessage}
        />
      ) : (
        <RendersStandardTableBody
          columns={columns}
          rows={list.paged}
          getRowKey={getRowKey}
          sorting={sorting}
          sortKey={list.sortKey}
          sortDir={list.sortDir}
          onSort={list.sortBy}
          density={density}
          striped={striped}
          bordered={bordered}
          stickyFirstColumn={stickyFirstColumn}
          rowActions={rowActions}
          bulkActions={bulkActions}
          getRowLabel={getRowLabel}
          emptyMessage={emptyMessage}
        />
      )}
      {pagination ? <RendersStandardListPager {...list.pagerProps} /> : null}
    </div>
  )
}

export { TableList }
