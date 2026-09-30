"use client"

import { useState } from "react"
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/standard/badge"
import { ButtonArray } from "@/components/standard/button-array"
import { Card } from "@/components/standard/card"
import { Image } from "@/components/standard/image"
import { InfoIcon } from "@/components/standard/info-icon"
import { StandardGrid } from "@/components/standard/standard-grid"
import { TableList } from "@/components/standard/table-list"
import {
  StandardTable,
  type StandardTableColumn,
} from "@/components/standard/standard-table"
import { Tooltip } from "@/components/standard/tooltip"
import {
  STANDARD_MOCK_DEPARTMENTS,
  STANDARD_MOCK_STATUSES,
  STANDARD_MOCK_TABLE_ROWS,
  type StandardMockRow,
} from "@/features/standard-library/domain/mock/definesStandardMockData"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const STATUS_TONE: Record<
  StandardMockRow["status"],
  "default" | "quiet" | "danger"
> = {
  Active: "default",
  Pending: "quiet",
  Archived: "danger",
}

const STATUS_FILTER = {
  key: "status",
  label: "Status",
  type: "badge" as const,
  columnKey: "status",
  options: STANDARD_MOCK_STATUSES.map((status) => ({
    id: status,
    label: status,
    value: status,
  })),
}

const DEPT_FILTER = {
  key: "department",
  label: "Dept",
  type: "select" as const,
  columnKey: "department",
  options: STANDARD_MOCK_DEPARTMENTS.map((dept) => ({
    id: dept,
    label: dept,
    value: dept,
  })),
}

const COLUMNS: StandardTableColumn<StandardMockRow>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    sortFunction: (a, b) => a.name.localeCompare(b.name),
    renderCell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    sortFunction: (a, b) => a.status.localeCompare(b.status),
    renderCell: (row) => (
      <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
    ),
    filter: STATUS_FILTER,
  },
  {
    key: "department",
    label: "Dept",
    sortable: true,
    sortFunction: (a, b) => a.department.localeCompare(b.department),
    renderCell: (row) => row.department,
    filter: DEPT_FILTER,
  },
]

function renderingGetsGridCard(row: StandardMockRow) {
  return (
    <Card
      title={row.name}
      meta={`${row.status} · ${row.department}`}
      padding="sm"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          Updated {row.updated_at}
        </span>
        <InfoIcon
          label={`${row.name} details`}
          body={`${row.status} · ${row.department}. Updated ${row.updated_at}.`}
        />
      </div>
    </Card>
  )
}

type MediaItem = { id: string; label: string; src: string }

// Inline SVG scenes so the demo needs no network or next/image config.
const MEDIA_PALETTES: [string, string, string, string][] = [
  ["#0f172a", "#f97316", "#7c2d12", "#fde68a"],
  ["#38bdf8", "#e0f2fe", "#475569", "#fef9c3"],
  ["#1e3a8a", "#a5b4fc", "#312e81", "#e0e7ff"],
  ["#14532d", "#bbf7d0", "#3f6212", "#fef08a"],
  ["#7c3aed", "#f0abfc", "#4c1d95", "#fdf4ff"],
  ["#78350f", "#fcd34d", "#451a03", "#fffbeb"],
  ["#0e7490", "#a5f3fc", "#164e63", "#ecfeff"],
  ["#be123c", "#fda4af", "#4c0519", "#fff1f2"],
]

function composingMediaSrc([sky, glow, peak, sun]: string[], index: number) {
  const summit = 90 + ((index * 37) % 140)
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="${glow}"/></linearGradient></defs><rect width="320" height="320" fill="url(#s)"/><circle cx="${260 - summit / 2}" cy="80" r="26" fill="${sun}" opacity="0.9"/><path d="M0 320 L${summit - 70} 170 L${summit} 90 L${summit + 90} 200 L320 150 L320 320 Z" fill="${peak}"/><path d="M0 320 L0 250 Q160 210 320 260 L320 320 Z" fill="${sky}" opacity="0.55"/></svg>`
  )}`
}

const MEDIA_ITEMS: MediaItem[] = Array.from({ length: 20 }, (_, index) => ({
  id: `media-${index + 1}`,
  label: `Photo ${index + 1}`,
  src: composingMediaSrc(MEDIA_PALETTES[index % MEDIA_PALETTES.length], index),
}))

function renderingGetsMediaTile(
  item: MediaItem,
  onDelete: (id: string) => void
) {
  return (
    <div className="group/media relative">
      <Image
        src={item.src}
        alt={item.label}
        ratio="square"
        fit="cover"
        rounded={false}
      />
      <Tooltip content="Delete">
        <button
          type="button"
          aria-label={`Delete ${item.label}`}
          onClick={() => onDelete(item.id)}
          className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-md bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/media:opacity-100 hover:bg-black/60 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white [&_svg]:size-4"
        >
          <Trash2Icon />
        </button>
      </Tooltip>
    </div>
  )
}

const TABLE_PANELS = [
  { id: "default", label: "Default" },
  { id: "compact", label: "Compact" },
  { id: "comfortable", label: "Comfortable" },
  { id: "striped", label: "Striped" },
  { id: "bordered", label: "Bordered" },
  { id: "filters", label: "Filters" },
  { id: "chrome", label: "Chrome" },
  { id: "paging", label: "Paging" },
  { id: "empty", label: "Empty" },
  { id: "sticky", label: "Sticky" },
  { id: "actions", label: "Actions" },
]

const TABLE_PANEL_LABELS: Record<string, string> = {
  compact: 'density="compact"',
  comfortable: 'density="comfortable"',
  striped: "striped",
  bordered: "bordered · striped",
  filters: "filterBadge · filterSelect · showRefresh",
  chrome: "errorBar · titleBar",
  paging: "pagination · initialPageSize={3}",
  empty: "emptyMessage",
  sticky: "stickyFirstColumn",
  actions: "rowActions · bulkActions · pagination",
}

const GRID_PANELS = [
  { id: "default", label: "Default" },
  { id: "gap", label: "Gap" },
  { id: "columns", label: "Columns" },
  { id: "filters", label: "Filters" },
  { id: "chrome", label: "Chrome" },
  { id: "empty", label: "Empty" },
  { id: "media", label: "Media" },
]

export function RendersStandardTableDemo() {
  const [panel, setPanel] = useState("default")
  const rows = STANDARD_MOCK_TABLE_ROWS
  const actions = panel === "actions"
  const label = TABLE_PANEL_LABELS[panel] ?? "showSearch · sorting"

  return (
    <RendersDemoCard className="w-full" label={label}>
      <div className="flex w-full flex-col gap-3">
        <ButtonArray
          appearance="badge"
          size="sm"
          items={TABLE_PANELS}
          value={panel}
          onValueChange={setPanel}
        />
        <StandardTable
          data={panel === "empty" ? [] : rows}
          columns={COLUMNS}
          getRowKey={(row) => row.id}
          showSearch
          sorting
          density={
            panel === "compact"
              ? "compact"
              : panel === "comfortable"
                ? "comfortable"
                : "default"
          }
          striped={panel === "striped" || panel === "bordered"}
          bordered={panel === "bordered"}
          filterBadge={panel === "filters"}
          filterSelect={panel === "filters" || panel === "chrome"}
          showRefresh={panel === "filters" || panel === "chrome"}
          onRefresh={
            panel === "filters" || panel === "chrome"
              ? () => undefined
              : undefined
          }
          titleBar={{
            left: "Projects",
            center: `${rows.length} open`,
            actions: [{ id: "add", label: "+" }],
          }}
          errorBar={
            panel === "chrome" ? "2 rows missing cost codes" : undefined
          }
          pagination={panel === "paging" || actions}
          initialPageSize={panel === "paging" || actions ? 3 : 10}
          stickyFirstColumn={panel === "sticky"}
          getRowLabel={(row) => row.name}
          rowActions={
            actions
              ? () => [
                  {
                    id: "open",
                    label: "Open",
                    icon: <EyeIcon />,
                    onSelect: () => undefined,
                  },
                  {
                    id: "edit",
                    label: "Edit",
                    icon: <PencilIcon />,
                    onSelect: () => undefined,
                  },
                  {
                    id: "delete",
                    label: "Delete",
                    tone: "danger",
                    icon: <Trash2Icon />,
                    onSelect: () => undefined,
                  },
                ]
              : undefined
          }
          bulkActions={
            actions
              ? (visible) => [
                  {
                    id: "archive",
                    label: `Archive ${visible.length} visible`,
                    onSelect: () => undefined,
                  },
                  {
                    id: "delete",
                    label: "Delete visible",
                    tone: "danger",
                    onSelect: () => undefined,
                  },
                ]
              : undefined
          }
          emptyMessage="No projects match your filters."
        />
      </div>
    </RendersDemoCard>
  )
}

export function RendersStandardGridDemo() {
  const [panel, setPanel] = useState("default")
  const [media, setMedia] = useState(MEDIA_ITEMS)
  const rows = STANDARD_MOCK_TABLE_ROWS
  const gap = panel === "gap" ? "md" : "sm"
  const columnCount = panel === "columns" ? 1 : 2
  const label =
    panel === "gap"
      ? `gap="${gap}"`
      : panel === "columns"
        ? `columns · ${columnCount}`
        : panel === "filters"
          ? "showSearch · filterSelect"
          : panel === "chrome"
            ? "errorBar · titleBar"
            : panel === "empty"
              ? "emptyMessage"
              : panel === "media"
                ? 'gap="xs" · columns · 5 · hover delete'
                : "renderCard · skipCardWrapper"

  return (
    <RendersDemoCard className="w-full" label={label}>
      <div className="flex w-full flex-col gap-3">
        <ButtonArray
          appearance="badge"
          size="sm"
          items={GRID_PANELS}
          value={panel}
          onValueChange={setPanel}
        />
        {panel === "media" ? (
          <StandardGrid
            data={media}
            getItemKey={(item) => item.id}
            columns={{ base: 3, sm: 5 }}
            gap="xs"
            skipCardWrapper
            titleBar={{
              left: "Media",
              center: `${media.length} items`,
              actions: [
                {
                  id: "reset",
                  label: "Reset",
                  onSelect: () => setMedia(MEDIA_ITEMS),
                },
              ],
            }}
            emptyMessage="No media yet."
            renderCard={(item) =>
              renderingGetsMediaTile(item, (id) =>
                setMedia((current) =>
                  current.filter((entry) => entry.id !== id)
                )
              )
            }
          />
        ) : (
          <StandardGrid
            data={panel === "empty" ? [] : rows}
            getItemKey={(row) => row.id}
            columns={{ base: 1, sm: columnCount }}
            gap={gap}
            skipCardWrapper
            showSearch={panel === "filters" || panel === "chrome"}
            filterSelect={panel === "filters" || panel === "chrome"}
            filterBadge={panel === "filters"}
            filters={
              panel === "filters" || panel === "chrome"
                ? [STATUS_FILTER, DEPT_FILTER]
                : []
            }
            titleBar={{
              left: "Projects",
              center: `${rows.length} open`,
              actions: [{ id: "add", label: "+" }],
            }}
            errorBar={panel === "chrome" ? "2 cards need review" : undefined}
            emptyMessage="No projects match your filters."
            renderCard={(row) => renderingGetsGridCard(row)}
          />
        )}
      </div>
    </RendersDemoCard>
  )
}

/** TableList: one list with a table / grid toggle in its title bar. */
export function RendersTableListDemo() {
  const rows = STANDARD_MOCK_TABLE_ROWS

  return (
    <RendersDemoCard className="w-full" label="TableList · viewSwitcher">
      <TableList
        data={rows}
        columns={COLUMNS}
        getRowKey={(row) => row.id}
        renderCard={(row) => renderingGetsGridCard(row)}
        viewSwitcher
        defaultView="table"
        gridColumns={{ base: 1, sm: 2 }}
        gap="sm"
        skipCardWrapper
        showSearch
        sorting
        filterSelect
        titleBar={{
          left: "Projects",
          center: `${rows.length} open`,
          actions: [{ id: "add", label: "+" }],
        }}
        pagination
        initialPageSize={3}
        emptyMessage="No projects match your filters."
      />
    </RendersDemoCard>
  )
}
