"use client"

import * as React from "react"
import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createExpandedRowModel,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  metaHelper,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type Column,
  type ColumnDef,
  type FilterFn,
  type RowData,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  EyeOffIcon,
  GripVerticalIcon,
  PinIcon,
  PinOffIcon,
  Settings2Icon,
} from "lucide-react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"
import { Button } from "@/components/standard/button"
import { Checkbox } from "@/components/standard/checkbox"
import {
  DropdownMenu,
  type MenuEntry,
  type MenuItem,
} from "@/components/standard/menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"
import { Search } from "@/components/standard/search"
import { Select } from "@/components/standard/select"

export type DataTableColumnMeta = {
  /** Plain-text name for menus, filters and exports. Defaults to a string header, then the column id. */
  label?: string
  align?: "start" | "center" | "end"
  /** Adds a toolbar filter: text matches a substring, select picks from the column's distinct values. */
  filter?: "text" | "select"
  /** Cells become an input on click. Needs onCellEdit on the table. */
  editable?: "text" | "number"
}

// Every feature is registered once; props decide which ones the UI exposes.
export const dataTableFeatures = tableFeatures({
  columnMeta: metaHelper<DataTableColumnMeta>(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  columnFacetingFeature,
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  columnSizingFeature,
  columnResizingFeature,
  columnPinningFeature,
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
})

type DataTableFeatures = typeof dataTableFeatures

// Columns hold different value types, so the value slot has to accept any of them.
export type DataTableColumn<TData extends RowData> = ColumnDef<
  DataTableFeatures,
  TData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>

/** Column helper bound to DataTable's features, so `meta` and filter names type-check. */
export function createDataTableColumns<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}

export type DataTableDensity = "compact" | "default" | "comfortable"

export type DataTableExportFormat = "csv" | "json"

export type DataTableCellEdit<TData> = {
  row: TData
  rowId: string
  columnId: string
  value: string | number
}

export type DataTableProps<TData extends RowData> = {
  columns: DataTableColumn<TData>[]
  data: TData[]
  /** Stable row ids keep selection and expansion attached to the right rows. Defaults to the index path. */
  getRowId?: (row: TData, index: number) => string
  /** Turns the table into a tree: rows with children get an expand toggle in the first column. */
  getSubRows?: (row: TData) => TData[] | undefined
  /** Search box that matches any column. */
  search?: boolean
  searchPlaceholder?: string
  /** Leading checkbox column with select-all in the header. */
  selectable?: boolean
  onSelectionChange?: (rows: TData[]) => void
  /** Menu shown in the toolbar while rows are selected. */
  bulkActions?: (rows: TData[]) => MenuEntry[]
  pagination?: boolean
  /** Starting page size. */
  pageSize?: number
  pageSizes?: number[]
  density?: DataTableDensity
  defaultDensity?: DataTableDensity
  onDensityChange?: (density: DataTableDensity) => void
  /** Toolbar View popover: density plus a checkbox per hideable column. */
  viewOptions?: boolean
  /** Drag the right edge of a header to resize; double-click it to reset. */
  resizable?: boolean
  /** Drag headers by their grip to reorder columns. */
  reorderable?: boolean
  /** Column menu entries to pin a column to the start or end. */
  pinnable?: boolean
  /** Export the filtered and sorted rows (every page) from the toolbar. */
  exportable?: boolean | DataTableExportFormat[]
  exportFileName?: string
  /** Makes columns with `meta.editable` editable; update `data` to keep the change. */
  onCellEdit?: (edit: DataTableCellEdit<TData>) => void
  striped?: boolean
  /** Lines between columns. */
  bordered?: boolean
  emptyMessage?: React.ReactNode
  /** Height at which the body scrolls under a sticky header. */
  maxHeight?: number | string
  /** Extra toolbar content after the built-in controls. */
  trailing?: React.ReactNode
  className?: string
}

const SELECT_COLUMN_ID = "select"
const DEFAULT_PAGE_SIZES = [5, 10, 20, 50]
const EMPTY_SELECTION: string[] = []

const DENSITY_OPTIONS: { value: DataTableDensity; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "default", label: "Default" },
  { value: "comfortable", label: "Comfortable" },
]

const HEAD_DENSITY: Record<DataTableDensity, string> = {
  compact: "h-8 px-2",
  default: "h-10 px-3",
  comfortable: "h-12 px-4",
}

const CELL_DENSITY: Record<DataTableDensity, string> = {
  compact: "px-2 py-1",
  default: "px-3 py-2",
  comfortable: "px-4 py-3.5",
}

const ALIGN_CLASS = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
} as const

const JUSTIFY_CLASS = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
} as const

// Select filters hold the picked values; a row passes when its value is one of them.
const includesPicked: FilterFn<DataTableFeatures, RowData> = (
  row,
  columnId,
  picked: string[]
) => picked.includes(String(row.getValue(columnId)))
includesPicked.autoRemove = (picked) =>
  !Array.isArray(picked) || picked.length === 0

type AnyColumn = Column<DataTableFeatures, RowData, unknown>

function labelingColumn(column: AnyColumn) {
  const { meta, header } = column.columnDef
  if (meta?.label) {
    return meta.label
  }
  return typeof header === "string" ? header : column.id
}

function stylingPinned(column: AnyColumn): React.CSSProperties {
  const pinned = column.getIsPinned()
  if (!pinned) {
    return {}
  }
  return {
    position: "sticky",
    insetInlineStart: pinned === "start" ? column.getStart("start") : undefined,
    insetInlineEnd: pinned === "end" ? column.getAfter("end") : undefined,
  }
}

// Fixed layouts pad the row with a filler cell, placed before the end-pinned
// columns so they stay against the table's end edge.
function placingFiller(
  columns: AnyColumn[],
  filler: React.ReactNode,
  cells: React.ReactNode[]
) {
  if (!filler) {
    return cells
  }
  const endIndex = columns.findIndex((column) => column.getIsPinned() === "end")
  const at = endIndex === -1 ? cells.length : endIndex
  return [...cells.slice(0, at), filler, ...cells.slice(at)]
}

function escapingCsv(value: unknown) {
  const text = value == null ? "" : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function downloadingFile(name: string, type: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

// Select filter columns get the picked-values filter unless they bring their own.
function preparingColumns<TData extends RowData>(
  columns: DataTableColumn<TData>[]
): DataTableColumn<TData>[] {
  return columns.map((column) => {
    const nested = "columns" in column && column.columns
    if (nested) {
      return {
        ...column,
        columns: preparingColumns(nested as DataTableColumn<TData>[]),
      }
    }
    if (column.meta?.filter === "select" && !column.filterFn) {
      return {
        ...column,
        filterFn: includesPicked as FilterFn<DataTableFeatures, TData>,
      }
    }
    return column
  })
}

function RendersEditableCell({
  value,
  kind,
  label,
  align,
  onCommit,
  children,
}: {
  value: unknown
  kind: "text" | "number"
  label: string
  align: "start" | "center" | "end"
  onCommit: (value: string | number) => void
  children: React.ReactNode
}) {
  const [editing, setEditing] = React.useState(false)

  function committing(raw: string) {
    setEditing(false)
    const next = kind === "number" ? Number(raw) : raw
    if (kind === "number" && (raw.trim() === "" || Number.isNaN(next))) {
      return
    }
    if (next !== value) {
      onCommit(next)
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        aria-label={label}
        type={kind === "number" ? "number" : "text"}
        defaultValue={value == null ? "" : String(value)}
        className={cn(
          "-my-1 h-7 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          ALIGN_CLASS[align]
        )}
        onBlur={(event) => committing(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur()
          } else if (event.key === "Escape") {
            setEditing(false)
          }
        }}
      />
    )
  }

  return (
    <button
      type="button"
      aria-label={`${label}: ${value == null ? "" : String(value)}`}
      className={cn(
        "-mx-1 -my-0.5 block w-[calc(100%+0.5rem)] cursor-text rounded-md px-1 py-0.5 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        ALIGN_CLASS[align]
      )}
      onClick={() => setEditing(true)}
    >
      {children}
    </button>
  )
}

function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  getSubRows,
  search = false,
  searchPlaceholder = "Search",
  selectable = false,
  onSelectionChange,
  bulkActions,
  pagination = false,
  pageSize = 10,
  pageSizes = DEFAULT_PAGE_SIZES,
  density: densityProp,
  defaultDensity = "default",
  onDensityChange,
  viewOptions = false,
  resizable = false,
  reorderable = false,
  pinnable = false,
  exportable = false,
  exportFileName = "table",
  onCellEdit,
  striped = false,
  bordered = false,
  emptyMessage = "No results.",
  maxHeight,
  trailing,
  className,
}: DataTableProps<TData>) {
  const [density, setDensity] = useControllableState({
    value: densityProp,
    defaultValue: defaultDensity,
    onChange: onDensityChange,
  })
  const [dragging, setDragging] = React.useState<string | null>(null)

  const tableColumns = React.useMemo(() => {
    const prepared = preparingColumns(columns)
    if (!selectable) {
      return prepared
    }
    const selectColumn: DataTableColumn<TData> = {
      id: SELECT_COLUMN_ID,
      size: 44,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enablePinning: false,
      enableGlobalFilter: false,
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all rows on this page"
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select row ${row.index + 1}`}
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    }
    return [selectColumn, ...prepared]
  }, [columns, selectable])

  const table = useTable({
    features: dataTableFeatures,
    columns: tableColumns,
    data,
    getRowId,
    getSubRows,
    globalFilterFn: "includesString",
    // First click sorts ascending for every column type.
    sortDescFirst: false,
    columnResizeMode: "onChange",
    enableColumnResizing: resizable,
    enableColumnPinning: pinnable,
    initialState: {
      pagination: { pageIndex: 0, pageSize },
      columnPinning: {
        start: selectable && pinnable ? [SELECT_COLUMN_ID] : [],
        end: [],
      },
    },
  })

  const { rowSelection, globalFilter } = table.state

  const selectedRows = React.useMemo(
    () => table.getSelectedRowModel().flatRows.map((row) => row.original),
    // The selected model follows rowSelection and data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowSelection, data]
  )

  const onSelectionChangeRef = React.useRef(onSelectionChange)
  React.useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange
  })
  React.useEffect(() => {
    onSelectionChangeRef.current?.(selectedRows)
  }, [selectedRows])

  const leafColumns = table.getAllLeafColumns() as unknown as AnyColumn[]
  const filterColumns = leafColumns.filter(
    (column) => column.columnDef.meta?.filter && column.getCanFilter()
  )
  const hideableColumns = leafColumns.filter((column) => column.getCanHide())
  const firstContentColumnId = table
    .getVisibleLeafColumns()
    .find((column) => column.id !== SELECT_COLUMN_ID)?.id

  const exportFormats: DataTableExportFormat[] =
    exportable === true ? ["csv", "json"] : exportable || []
  const fixedLayout = resizable || pinnable
  const rows = pagination
    ? table.getRowModel().rows
    : table.getPrePaginatedRowModel().rows
  const visibleColumnCount = table.getVisibleLeafColumns().length

  function exporting(format: DataTableExportFormat) {
    const exportColumns = table
      .getVisibleLeafColumns()
      .filter(
        (column) => column.id !== SELECT_COLUMN_ID
      ) as unknown as AnyColumn[]
    const exportRows = table.getSortedRowModel().flatRows
    if (format === "json") {
      const records = exportRows.map((row) =>
        Object.fromEntries(
          exportColumns.map((column) => [
            labelingColumn(column),
            row.getValue(column.id),
          ])
        )
      )
      downloadingFile(
        `${exportFileName}.json`,
        "application/json",
        JSON.stringify(records, null, 2)
      )
      return
    }
    const lines = [
      exportColumns
        .map((column) => escapingCsv(labelingColumn(column)))
        .join(","),
      ...exportRows.map((row) =>
        exportColumns
          .map((column) => escapingCsv(row.getValue(column.id)))
          .join(",")
      ),
    ]
    downloadingFile(`${exportFileName}.csv`, "text/csv", lines.join("\n"))
  }

  function reordering(activeId: string, overId: string) {
    if (activeId === overId) {
      return
    }
    const current = table.state.columnOrder.length
      ? [...table.state.columnOrder]
      : table.getAllLeafColumns().map((column) => column.id)
    const next = current.filter((id) => id !== activeId)
    next.splice(next.indexOf(overId), 0, activeId)
    table.setColumnOrder(next)
  }

  function columnMenuItems(column: AnyColumn): MenuEntry[] {
    const entries: MenuEntry[] = []
    if (column.getCanSort()) {
      entries.push({
        type: "group",
        id: "sort",
        items: [
          {
            id: "asc",
            label: "Sort ascending",
            icon: <ArrowUpIcon />,
            onSelect: () => column.toggleSorting(false),
          },
          {
            id: "desc",
            label: "Sort descending",
            icon: <ArrowDownIcon />,
            onSelect: () => column.toggleSorting(true),
          },
        ],
      })
    }
    if (pinnable && column.getCanPin()) {
      const pinned = column.getIsPinned()
      const pinItems: MenuItem[] = []
      if (pinned !== "start") {
        pinItems.push({
          id: "pin-start",
          label: "Pin to start",
          icon: <PinIcon />,
          onSelect: () => column.pin("start"),
        })
      }
      if (pinned !== "end") {
        pinItems.push({
          id: "pin-end",
          label: "Pin to end",
          icon: <PinIcon className="-scale-x-100" />,
          onSelect: () => column.pin("end"),
        })
      }
      if (pinned) {
        pinItems.push({
          id: "unpin",
          label: "Unpin",
          icon: <PinOffIcon />,
          onSelect: () => column.pin(false),
        })
      }
      entries.push(
        { type: "separator", id: "pin-sep" },
        { type: "group", id: "pin", items: pinItems }
      )
    }
    if (viewOptions && column.getCanHide()) {
      entries.push(
        { type: "separator", id: "hide-sep" },
        {
          id: "hide",
          label: "Hide column",
          icon: <EyeOffIcon />,
          onSelect: () => column.toggleVisibility(false),
        }
      )
    }
    // Drop a separator that ended up first.
    return entries[0]?.type === "separator" ? entries.slice(1) : entries
  }

  const hasToolbar =
    search ||
    filterColumns.length > 0 ||
    exportFormats.length > 0 ||
    viewOptions ||
    Boolean(bulkActions) ||
    Boolean(trailing)
  const hasFooter = pagination || selectable

  return (
    <div
      data-slot="data-table"
      data-density={density}
      className={cn(
        "flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-background",
        className
      )}
    >
      {hasToolbar ? (
        <div
          data-slot="data-table-toolbar"
          className="flex flex-wrap items-center gap-2 border-b border-border p-2"
        >
          {search ? (
            <Search
              size="sm"
              clearable
              className="w-full sm:w-56"
              placeholder={searchPlaceholder}
              value={String(globalFilter ?? "")}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
            />
          ) : null}
          {filterColumns.map((column) => {
            const label = labelingColumn(column)
            if (column.columnDef.meta?.filter === "select") {
              const options = [...column.getFacetedUniqueValues().keys()]
                .map(String)
                .sort()
                .map((value) => ({ value, label: value }))
              return (
                <Select
                  key={column.id}
                  multiple
                  indicator="checkbox"
                  aria-label={`Filter ${label}`}
                  placeholder={label}
                  options={options}
                  values={
                    (column.getFilterValue() as string[]) ?? EMPTY_SELECTION
                  }
                  onValuesChange={(values) =>
                    column.setFilterValue(values.length ? values : undefined)
                  }
                />
              )
            }
            return (
              <Search
                key={column.id}
                size="sm"
                clearable
                className="w-full sm:w-40"
                placeholder={`Filter ${label}`}
                value={String(column.getFilterValue() ?? "")}
                onChange={(event) =>
                  column.setFilterValue(event.target.value || undefined)
                }
              />
            )
          })}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {bulkActions && selectedRows.length > 0 ? (
              <DropdownMenu
                align="end"
                items={bulkActions(selectedRows)}
                trigger={
                  <Button size="sm" tone="outline">
                    {selectedRows.length} selected
                  </Button>
                }
              />
            ) : null}
            {exportFormats.length > 0 ? (
              <DropdownMenu
                align="end"
                items={exportFormats.map((format) => ({
                  id: format,
                  label: format === "csv" ? "Export CSV" : "Export JSON",
                  onSelect: () => exporting(format),
                }))}
                trigger={
                  <Button size="sm" tone="outline" leading={<DownloadIcon />}>
                    Export
                  </Button>
                }
              />
            ) : null}
            {viewOptions ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" tone="outline" leading={<Settings2Icon />}>
                    View
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="flex w-64 flex-col gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Density
                    </span>
                    <div
                      role="radiogroup"
                      aria-label="Density"
                      className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-0.5"
                    >
                      {DENSITY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={density === option.value}
                          className="rounded-md px-1.5 py-1 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-checked:bg-background aria-checked:font-medium aria-checked:shadow-sm"
                          onClick={() => setDensity(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {hideableColumns.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        Columns
                      </span>
                      {hideableColumns.map((column) => (
                        <Checkbox
                          key={column.id}
                          size="sm"
                          label={labelingColumn(column)}
                          checked={column.getIsVisible()}
                          onChange={(event) =>
                            column.toggleVisibility(event.target.checked)
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                </PopoverContent>
              </Popover>
            ) : null}
            {trailing}
          </div>
        </div>
      ) : null}

      <div
        data-slot="data-table-body"
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <table
          className={cn(
            "caption-bottom border-separate border-spacing-0 text-sm",
            fixedLayout ? "table-fixed" : "w-full"
          )}
          // At least full width; the filler column takes whatever the sized columns leave.
          style={
            fixedLayout
              ? { width: table.getTotalSize(), minWidth: "100%" }
              : undefined
          }
        >
          <thead className="sticky top-0 z-20 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {placingFiller(
                  headerGroup.headers.map(
                    (header) => header.column as unknown as AnyColumn
                  ),
                  fixedLayout ? (
                    <th
                      key="filler"
                      aria-hidden
                      className="border-b border-border bg-background p-0"
                    />
                  ) : null,
                  headerGroup.headers.map((header) => {
                    const column = header.column as unknown as AnyColumn
                    const align = column.columnDef.meta?.align ?? "start"
                    const sorted = column.getIsSorted()
                    const canReorder =
                      reorderable &&
                      !header.isPlaceholder &&
                      column.id !== SELECT_COLUMN_ID &&
                      header.subHeaders.length === 0
                    const menu = header.isPlaceholder
                      ? []
                      : columnMenuItems(column)
                    const label = labelingColumn(column)

                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        aria-sort={
                          sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : undefined
                        }
                        data-pinned={column.getIsPinned() || undefined}
                        data-drop-target={
                          dragging && dragging !== column.id && canReorder
                            ? true
                            : undefined
                        }
                        className={cn(
                          "group/th relative border-b border-border bg-background font-medium whitespace-nowrap text-muted-foreground",
                          HEAD_DENSITY[density],
                          ALIGN_CLASS[align],
                          bordered && "border-r last:border-r-0",
                          column.getIsPinned() && "z-10",
                          "data-drop-target:bg-muted/60",
                          column.id === SELECT_COLUMN_ID && "w-11"
                        )}
                        style={{
                          width: fixedLayout ? header.getSize() : undefined,
                          ...stylingPinned(column),
                        }}
                        onDragOver={
                          canReorder && dragging
                            ? (event) => event.preventDefault()
                            : undefined
                        }
                        onDrop={
                          canReorder
                            ? (event) => {
                                event.preventDefault()
                                if (dragging) {
                                  reordering(dragging, column.id)
                                }
                                setDragging(null)
                              }
                            : undefined
                        }
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              "flex min-w-0 items-center gap-1",
                              JUSTIFY_CLASS[align]
                            )}
                          >
                            {canReorder ? (
                              <span
                                draggable
                                role="button"
                                aria-label={`Drag to move ${label}`}
                                title="Drag to reorder"
                                className="-ml-1 inline-flex cursor-grab text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
                                onDragStart={(event) => {
                                  event.dataTransfer.effectAllowed = "move"
                                  event.dataTransfer.setData(
                                    "text/plain",
                                    column.id
                                  )
                                  setDragging(column.id)
                                }}
                                onDragEnd={() => setDragging(null)}
                              >
                                <GripVerticalIcon
                                  aria-hidden
                                  className="size-3.5"
                                />
                              </span>
                            ) : null}
                            {column.getCanSort() ? (
                              <button
                                type="button"
                                className="-mx-1 inline-flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                                onClick={column.getToggleSortingHandler()}
                              >
                                <span className="truncate">
                                  <table.FlexRender header={header} />
                                </span>
                                {sorted === "asc" ? (
                                  <ArrowUpIcon
                                    aria-hidden
                                    className="size-3.5 shrink-0 text-foreground"
                                  />
                                ) : sorted === "desc" ? (
                                  <ArrowDownIcon
                                    aria-hidden
                                    className="size-3.5 shrink-0 text-foreground"
                                  />
                                ) : (
                                  <ChevronsUpDownIcon
                                    aria-hidden
                                    className="size-3.5 shrink-0 opacity-40"
                                  />
                                )}
                              </button>
                            ) : (
                              <span className="min-w-0 truncate">
                                <table.FlexRender header={header} />
                              </span>
                            )}
                            {menu.length > 0 && (pinnable || viewOptions) ? (
                              <DropdownMenu
                                align="start"
                                modal={false}
                                items={menu}
                                trigger={
                                  <button
                                    type="button"
                                    aria-label={`${label} column options`}
                                    className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 outline-none group-hover/th:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:opacity-100 max-md:opacity-100 group-data-pinned/th:opacity-100"
                                  >
                                    {column.getIsPinned() ? (
                                      <PinIcon
                                        aria-hidden
                                        className="size-3.5"
                                      />
                                    ) : (
                                      <EllipsisVerticalIcon
                                        aria-hidden
                                        className="size-3.5"
                                      />
                                    )}
                                  </button>
                                }
                              />
                            ) : null}
                          </div>
                        )}
                        {resizable && column.getCanResize() ? (
                          <div
                            role="separator"
                            aria-orientation="vertical"
                            aria-label={`Resize ${label}`}
                            data-resizing={column.getIsResizing() || undefined}
                            className="absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize touch-none select-none after:absolute after:inset-y-2 after:right-0 after:w-px after:bg-border hover:after:w-0.5 hover:after:bg-primary data-resizing:after:w-0.5 data-resizing:after:bg-primary"
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            onDoubleClick={() => column.resetSize()}
                          />
                        ) : null}
                      </th>
                    )
                  })
                )}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumnCount + (fixedLayout ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  data-depth={row.depth || undefined}
                  className={cn(
                    "group/row",
                    striped && "even:[&>td]:bg-muted/40"
                  )}
                >
                  {placingFiller(
                    row
                      .getVisibleCells()
                      .map((cell) => cell.column as unknown as AnyColumn),
                    fixedLayout ? (
                      <td
                        key="filler"
                        aria-hidden
                        className="border-b border-border bg-background p-0 group-last/row:border-b-0 group-hover/row:bg-muted/50 group-data-[state=selected]/row:bg-muted"
                      />
                    ) : null,
                    row.getVisibleCells().map((cell) => {
                      const column = cell.column as unknown as AnyColumn
                      const meta = column.columnDef.meta
                      const align = meta?.align ?? "start"
                      const content = <table.FlexRender cell={cell} />
                      const editable = meta?.editable && onCellEdit
                      const body = editable ? (
                        <RendersEditableCell
                          value={cell.getValue()}
                          kind={meta.editable ?? "text"}
                          label={`Edit ${labelingColumn(column)}`}
                          align={align}
                          onCommit={(value) =>
                            onCellEdit({
                              row: row.original,
                              rowId: row.id,
                              columnId: column.id,
                              value,
                            })
                          }
                        >
                          {content}
                        </RendersEditableCell>
                      ) : (
                        content
                      )
                      const isTreeColumn =
                        getSubRows && column.id === firstContentColumnId

                      return (
                        <td
                          key={cell.id}
                          data-pinned={column.getIsPinned() || undefined}
                          className={cn(
                            "border-b border-border bg-background align-middle group-last/row:border-b-0 group-hover/row:bg-muted/50 group-data-[state=selected]/row:bg-muted",
                            CELL_DENSITY[density],
                            ALIGN_CLASS[align],
                            bordered && "border-r last:border-r-0",
                            fixedLayout && "truncate",
                            column.getIsPinned() && "z-10"
                          )}
                          style={{
                            width: fixedLayout ? column.getSize() : undefined,
                            ...stylingPinned(column),
                          }}
                        >
                          {isTreeColumn ? (
                            <div
                              className="flex items-center gap-1"
                              style={{ paddingInlineStart: row.depth * 20 }}
                            >
                              {row.getCanExpand() ? (
                                <button
                                  type="button"
                                  aria-expanded={row.getIsExpanded()}
                                  aria-label={
                                    row.getIsExpanded()
                                      ? "Collapse row"
                                      : "Expand row"
                                  }
                                  className="-ml-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                                  onClick={row.getToggleExpandedHandler()}
                                >
                                  <ChevronRightIcon
                                    aria-hidden
                                    className={cn(
                                      "size-4 transition-transform",
                                      row.getIsExpanded() && "rotate-90"
                                    )}
                                  />
                                </button>
                              ) : (
                                <span
                                  aria-hidden
                                  className="-ml-1 size-6 shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">{body}</div>
                            </div>
                          ) : (
                            body
                          )}
                        </td>
                      )
                    })
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasFooter ? (
        <div
          data-slot="data-table-footer"
          className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground"
        >
          <span aria-live="polite">
            {selectable
              ? `${selectedRows.length} of ${table.getFilteredRowModel().flatRows.length} row(s) selected`
              : `${table.getFilteredRowModel().rows.length} row(s)`}
          </span>
          {pagination ? (
            <div className="flex flex-wrap items-center gap-2">
              <Select
                aria-label="Rows per page"
                className="min-w-20"
                options={pageSizes.map((size) => ({
                  value: String(size),
                  label: `${size} / page`,
                }))}
                value={String(table.state.pagination.pageSize)}
                onValueChange={(value) => table.setPageSize(Number(value))}
              />
              <span className="tabular-nums">
                Page {table.state.pagination.pageIndex + 1} of{" "}
                {Math.max(table.getPageCount(), 1)}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  iconOnly
                  size="sm"
                  tone="outline"
                  aria-label="First page"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.firstPage()}
                >
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  iconOnly
                  size="sm"
                  tone="outline"
                  aria-label="Previous page"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  iconOnly
                  size="sm"
                  tone="outline"
                  aria-label="Next page"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                >
                  <ChevronRightIcon />
                </Button>
                <Button
                  iconOnly
                  size="sm"
                  tone="outline"
                  aria-label="Last page"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.lastPage()}
                >
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export { DataTable }
