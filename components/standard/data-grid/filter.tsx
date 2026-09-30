"use client"

import * as React from "react"
import { ListFilterIcon } from "lucide-react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { cn } from "cn"

import {
  ColumnFilter,
  columnFilterConditions,
} from "@/components/standard/column-filter"
import type {
  GridColumn,
  GridFilterMenu,
} from "@/components/standard/data-grid-model"
import type {
  FilterSections,
  GridActions,
} from "@/components/standard/data-grid/actions"

// The header's filter button and its popover, a ColumnFilter fed from the grid.

// Reads the column's values once, when the popover opens.
function GridColumnFilter({
  index,
  actions,
  onDone,
}: {
  index: number
  actions: GridActions
  onDone: () => void
}) {
  const [info] = React.useState(() => actions.filterOptions(index))
  const { sections } = info
  return (
    <ColumnFilter
      name={info.name}
      options={sections.values ? info.values : undefined}
      conditions={sections.conditions}
      value={info.filter}
      onValueChange={(filter) => actions.applyFilter(index, filter)}
      sort={info.sorted}
      onSortChange={
        sections.sort
          ? (direction) => actions.sortColumn(index, direction)
          : undefined
      }
      onDone={onDone}
      autoFocus
    />
  )
}

export function stopsEvent(event: React.SyntheticEvent) {
  event.stopPropagation()
}

export function HeaderFilter({
  index,
  active,
  actions,
}: {
  index: number
  active: boolean
  actions: GridActions
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={active ? "Filter (active)" : "Filter"}
          data-active={active || undefined}
          className={cn(
            "absolute top-1/2 right-2.5 z-20 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground",
            active &&
              "bg-(--grid-accent) text-primary-foreground hover:bg-(--grid-accent) hover:text-primary-foreground"
          )}
          onPointerDown={stopsEvent}
          onClick={stopsEvent}
          onDoubleClick={stopsEvent}
        >
          <ListFilterIcon aria-hidden className="size-3.5" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-grid-editor
          align="end"
          sideOffset={6}
          collisionPadding={8}
          className="z-50 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none"
          onPointerDown={stopsEvent}
          onClick={stopsEvent}
          onDoubleClick={stopsEvent}
          onContextMenu={stopsEvent}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            actions.focusGrid()
          }}
        >
          {open ? (
            <GridColumnFilter
              index={index}
              actions={actions}
              onDone={() => setOpen(false)}
            />
          ) : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

/** Merges the grid's filter menu defaults with a column's own settings. */
export function resolvesFilterSections(
  gridMenu: GridFilterMenu | undefined,
  column: GridColumn,
  readOnly: boolean
): FilterSections {
  const menu: GridFilterMenu = {
    ...gridMenu,
    ...(typeof column.filterable === "object" ? column.filterable : null),
  }
  const conditions = menu.conditions ?? true
  return {
    sort: (menu.sort ?? true) && !readOnly,
    conditions:
      conditions === false
        ? []
        : conditions === true
          ? columnFilterConditions.map((option) => option.value)
          : conditions,
    values: menu.values ?? true,
  }
}

export function hasFilterSections(sections: FilterSections) {
  return sections.sort || sections.conditions.length > 0 || sections.values
}
