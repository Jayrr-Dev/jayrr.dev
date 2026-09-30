"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MenuIcon,
  MousePointerClickIcon,
} from "lucide-react"
import { cn } from "cn"

import { DropdownMenu } from "@/components/standard/menu"
import {
  readingListCell,
  RendersStandardListChrome,
  RendersStandardListPager,
  useStandardList,
  type StandardListFilter,
  type StandardListProps,
  type StandardListSortDirection,
} from "@/components/standard/standard-list-chrome"

export type StandardTableColumn<T> = {
  key: string
  label: string
  sortable?: boolean
  sortFunction?: (a: T, b: T) => number
  renderCell?: (item: T, index: number) => React.ReactNode
  filter?: StandardListFilter
}

export type StandardTableAction = {
  id: string
  label: string
  onSelect: () => void
  disabled?: boolean
  tone?: "default" | "danger"
  /** Leading icon in the menu item. */
  icon?: React.ReactNode
}

export type StandardTableDensity = "compact" | "default" | "comfortable"

const standardTableVariants = cva("w-full", {
  variants: {
    bordered: {
      true: "[&_td:not(:last-child)]:border-r [&_td:not(:last-child)]:border-r-border [&_th:not(:last-child)]:border-r [&_th:not(:last-child)]:border-r-border",
      false: "",
    },
  },
  defaultVariants: {
    bordered: false,
  },
})

const standardTableHeadVariants = cva("", {
  variants: {
    density: {
      compact: "h-8 px-2 py-0.5 text-sm text-foreground",
      default: "h-10 px-2 text-xs font-semibold text-foreground",
      comfortable: "h-12 px-3 text-xs font-semibold text-foreground",
    },
  },
  defaultVariants: {
    density: "default",
  },
})

const standardTableCellVariants = cva("text-center text-sm", {
  variants: {
    density: {
      compact: "px-1.5 py-1 text-foreground",
      default: "px-2 py-2",
      comfortable: "px-3 py-3",
    },
  },
  defaultVariants: {
    density: "default",
  },
})

function RendersTableActionsMenu({
  label,
  actions,
  icon,
  disabled = false,
}: {
  label: string
  actions: StandardTableAction[]
  icon: React.ReactNode
  disabled?: boolean
}) {
  return (
    <DropdownMenu
      modal={false}
      align="start"
      disabled={disabled || actions.length === 0}
      className="min-w-36"
      itemClassName="max-md:min-h-11"
      items={actions.map((action) => ({
        id: action.id,
        label: action.label,
        tone: action.tone,
        icon: action.icon,
        disabled: action.disabled,
        onSelect: () => {
          // Let the menu close before the action opens a dialog.
          window.setTimeout(() => action.onSelect(), 0)
        },
      }))}
      trigger={
        <button
          type="button"
          aria-label={label}
          title={label}
          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 max-md:size-11"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {icon}
        </button>
      }
    />
  )
}

/** Table-only props, shared by StandardTable and StandardList's table view. */
export type StandardTableViewProps<T extends object> = {
  columns: StandardTableColumn<T>[]
  getRowKey: (item: T, index: number) => string | number
  sorting?: boolean
  /** Row height and padding. */
  density?: StandardTableDensity
  /** @deprecated Use density="compact" */
  compact?: boolean
  /** Shades every other row. */
  striped?: boolean
  /** Adds lines between columns. */
  bordered?: boolean
  stickyFirstColumn?: boolean
  /** Per-row menu in a trailing actions column. */
  rowActions?: (item: T, index: number) => StandardTableAction[]
  /** Header menu for the actions column; receives the currently visible (filtered + paged) rows. */
  bulkActions?: (visibleRows: T[]) => StandardTableAction[]
  getRowLabel?: (item: T, index: number) => string
}

export type StandardTableProps<T extends object> = StandardListProps<T> &
  StandardTableViewProps<T>

/** Resolves `density`, falling back to the deprecated `compact` flag. */
export function readingTableDensity(
  density: StandardTableDensity | undefined,
  compact: boolean | undefined
): StandardTableDensity {
  if (density) {
    return density
  }
  return compact ? "compact" : "default"
}

/** Lists the filters declared on columns. */
export function readingColumnFilters<T>(columns: StandardTableColumn<T>[]) {
  return columns
    .map((column) => column.filter)
    .filter((filter): filter is StandardListFilter => Boolean(filter))
}

/**
 * The scrolling table itself: header with sort buttons, rows and the actions
 * column. State lives in the caller (see useStandardList).
 */
export function RendersStandardTableBody<T extends object>({
  columns,
  rows,
  getRowKey,
  sorting = true,
  sortKey,
  sortDir,
  onSort,
  density = "default",
  striped = false,
  bordered = false,
  stickyFirstColumn = false,
  rowActions,
  bulkActions,
  getRowLabel,
  emptyMessage = "No Data",
}: Omit<StandardTableViewProps<T>, "compact"> & {
  rows: T[]
  sortKey: string | null
  sortDir: StandardListSortDirection
  onSort: (key: string) => void
  emptyMessage?: string
}) {
  const hasActions = Boolean(rowActions || bulkActions)
  const cellPad = standardTableCellVariants({ density })
  const headPad = standardTableHeadVariants({ density })

  return (
    <div className="max-h-80 overflow-auto">
      <table
        data-density={density}
        className={standardTableVariants({ bordered })}
      >
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
                      onClick={() => onSort(column.key)}
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
            {hasActions ? (
              <th
                className={cn(
                  "w-10 border-b border-foreground text-center",
                  headPad
                )}
              >
                {bulkActions ? (
                  <RendersTableActionsMenu
                    label="Actions for visible rows"
                    actions={bulkActions(rows)}
                    disabled={rows.length === 0}
                    icon={
                      <MousePointerClickIcon aria-hidden className="size-4" />
                    }
                  />
                ) : (
                  <span className="sr-only">Actions</span>
                )}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={hasActions ? columns.length + 1 : columns.length}
                className="py-12 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className={cn(
                  "border-b border-border last:border-0 hover:bg-muted/40",
                  striped ? "even:bg-muted/25" : undefined
                )}
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
                {hasActions ? (
                  <td className={cn("w-10", cellPad)}>
                    {rowActions ? (
                      <RendersTableActionsMenu
                        label={`Actions for ${
                          getRowLabel
                            ? getRowLabel(row, index)
                            : `row ${index + 1}`
                        }`}
                        actions={rowActions(row, index)}
                        icon={<MenuIcon aria-hidden className="size-5" />}
                      />
                    ) : null}
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function StandardTable<T extends object>({
  columns,
  data,
  getRowKey,
  className,
  density,
  compact = false,
  striped = false,
  bordered = false,
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
  rowActions,
  bulkActions,
  getRowLabel,
}: StandardTableProps<T>) {
  const list = useStandardList({
    data,
    filters: readingColumnFilters(columns),
    columns,
    sorting,
    pagination,
    initialPageSize,
  })

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
        showRefresh={showRefresh}
        onRefresh={onRefresh}
        filterBadge={filterBadge}
        filterSelect={filterSelect}
        {...list.chromeProps}
      />
      <RendersStandardTableBody
        columns={columns}
        rows={list.paged}
        getRowKey={getRowKey}
        sorting={sorting}
        sortKey={list.sortKey}
        sortDir={list.sortDir}
        onSort={list.sortBy}
        density={readingTableDensity(density, compact)}
        striped={striped}
        bordered={bordered}
        stickyFirstColumn={stickyFirstColumn}
        rowActions={rowActions}
        bulkActions={bulkActions}
        getRowLabel={getRowLabel}
        emptyMessage={emptyMessage}
      />
      {pagination ? <RendersStandardListPager {...list.pagerProps} /> : null}
    </div>
  )
}

export { StandardTable }
