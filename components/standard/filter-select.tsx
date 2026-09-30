"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-react"
import { cn } from "cn"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/standard/badge"
import { Checkbox } from "@/components/standard/checkbox"
import {
  BADGE_SELECT_OPTION_BADGE_CLASS,
  BadgeSelectSheet,
  resolvesBadgeSelectOptionClasses,
  resolvesBadgeSelectOptionTone,
  resolvesBadgeSelectSubtitleClass,
  type BadgeSelectOption,
} from "@/components/standard/badge-select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"

const CATEGORY_ROW_CLASS =
  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted"

const TRIGGER_FIELD_CLASS =
  "group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-transparent text-left text-sm text-foreground transition-colors outline-none hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:bg-input/30"

const TRIGGER_BADGE_WRAPPER_CLASS =
  "inline-flex max-w-full cursor-pointer rounded-full border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

/** Popover width presets, same scale as BadgeSelect. */
const SIZE_CLASSES: Record<NonNullable<FilterSelectProps["size"]>, string> = {
  xs: "w-40 max-h-48",
  sm: "w-80 max-h-64",
  md: "w-[480px] max-h-80",
  lg: "w-[590px] max-h-96",
  xl: "w-[800px] max-h-[480px]",
}

/*
 * `layout="miller"` styles, from the utilitek timesheet Work Performed picker:
 * flat separator rows in bordered columns, with a green fill on the open or
 * selected row.
 */
const MILLER_SELECTED_CLASS =
  "bg-green-100 text-foreground hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/30"

const MILLER_TAB_CLASS =
  "inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

const MILLER_COLUMN_CLASS =
  "flex min-h-0 min-w-0 flex-col overflow-y-auto overscroll-contain rounded-md border border-border"

const MILLER_BANNER_CLASS =
  "sticky top-0 z-[1] shrink-0 border-b border-border bg-muted px-2 py-0.5 text-[9px] font-medium tracking-wide text-foreground uppercase"

const MILLER_ROW_CLASS =
  "flex w-full min-w-0 cursor-pointer items-center gap-2 border-b border-border px-2 py-2 text-left text-sm text-foreground outline-none transition-colors last:border-b-0 hover:bg-muted/70 focus-visible:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-50"

const MILLER_COUNT_CLASS = "ml-auto shrink-0 pl-1 text-right tabular-nums"

/** Characters typed before search replaces the columns with results. */
const MILLER_SEARCH_MIN_LENGTH = 2

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
}

/** One filter category: a row in the list, then a badge grid when opened. */
export interface FilterSelectGroup {
  /** Stable id, used as the key in the value map. */
  id: string
  label: string
  /** Short line under the label in the list. */
  description?: string
  /** Badge options, same shape as BadgeSelect. */
  options: readonly BadgeSelectOption[]
  /** Default `multi`. */
  selectType?: "single" | "multi"
  /** Grid columns in the detail view (default 3). Up to 7 options use one row. */
  columns?: number
  search?: boolean
  searchPlaceholder?: string
  /** Default true. */
  sortAlphabetically?: boolean
  /** `layout="miller"` only: the tab this group sits under. */
  section?: string
}

/** Selections keyed by group id. */
export type FilterSelectValue = Record<string, string | string[] | null>

export interface FilterSelectProps {
  groups: readonly FilterSelectGroup[]
  value: FilterSelectValue
  onChange: (groupId: string, selectedId: string | string[] | null) => void
  /** Trigger label. The active count is added in brackets (default `Filters`). */
  placeholder?: string
  disabled?: boolean
  className?: string
  /**
   * Popover width preset: xs 160px, sm 320px, md 480px, lg 590px, xl 800px.
   * Default `md`, or `xl` for `layout="miller"`.
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /** Trigger chrome: bordered field, select-style, or badge chip. */
  variant?: "default" | "select" | "badge"
  /**
   * Panel body. `drill` pages from the category list into a badge grid.
   * `miller` is utilitek's Work Performed picker: group sections as tabs,
   * then group, option header, and checkbox columns side by side, with a
   * search that lists matches from every group.
   */
  layout?: "drill" | "miller"
  /** `layout="miller"` banner labels (default Groups, Headers, Options). */
  columnLabels?: readonly [string, string, string]
  /** Max height of the scrolling body (default `max-h-64`). */
  maxHeight?: string
  /** Smaller trigger for `variant="default"`. */
  compact?: boolean
  /** Shows Clear all when any group has a selection. */
  showClearAll?: boolean
  /** Clears everything in one call instead of one onChange per group. */
  onClearAll?: () => void
  triggerId?: string
  onOpenChange?: (open: boolean) => void
  /** Radix Popover modal mode. Use false inside a Dialog. */
  popoverModal?: boolean
  contentClassName?: string
}

type PopoverSide = "top" | "bottom"

/**
 * Pads the locked side far past the viewport so Radix's flip never fires,
 * while the horizontal shift still keeps the panel on screen.
 */
function resolvesCollisionPadding(side: PopoverSide | null) {
  if (!side) return 8
  return {
    top: side === "top" ? -100000 : 8,
    right: 8,
    bottom: side === "bottom" ? -100000 : 8,
    left: 8,
  }
}

function countsSelections(selected: string | string[] | null | undefined) {
  if (selected == null || selected === "") return 0
  return Array.isArray(selected) ? selected.length : 1
}

function listsSelectedIds(selected: string | string[] | null | undefined) {
  if (selected == null || selected === "") return []
  return Array.isArray(selected) ? selected : [selected]
}

/** Middle-column name for an option; options without a string header fall under the group. */
function readsOptionHeader(option: BadgeSelectOption, group: FilterSelectGroup) {
  return typeof option.header === "string" && option.header.trim()
    ? option.header
    : group.label
}

/** Unique headers in first-seen order. */
function listsGroupHeaders(group: FilterSelectGroup) {
  const headers: string[] = []
  for (const option of group.options) {
    const header = readsOptionHeader(option, group)
    if (!headers.includes(header)) headers.push(header)
  }
  return headers
}

function sortsGroupOptions(group: FilterSelectGroup, options: readonly BadgeSelectOption[]) {
  const sorted = [...options]
  if (group.sortAlphabetically !== false) {
    sorted.sort((a, b) => a.label.localeCompare(b.label))
  }
  return sorted
}

function matchesOptionSearch(option: BadgeSelectOption, term: string) {
  return (
    option.label.toLowerCase().includes(term) ||
    Boolean(option.description?.toLowerCase().includes(term)) ||
    Boolean(option.subtitle?.toLowerCase().includes(term)) ||
    (typeof option.value === "string" && option.value.toLowerCase().includes(term))
  )
}

/**
 * Filters in two steps: pick a category, then toggle its badges.
 *
 * @example
 * ```tsx
 * <FilterSelect
 *   groups={[
 *     { id: "status", label: "Status", options: [{ id: "open", label: "Open" }] },
 *     { id: "dept", label: "Department", options: [{ id: "eng", label: "Engineering" }] },
 *   ]}
 *   value={filters}
 *   onChange={(groupId, selected) =>
 *     setFilters((prev) => ({ ...prev, [groupId]: selected }))
 *   }
 * />
 * ```
 */
export function FilterSelect({
  groups,
  value,
  onChange,
  placeholder = "Filters",
  disabled = false,
  className,
  size,
  variant = "default",
  layout = "drill",
  columnLabels = ["Groups", "Headers", "Options"],
  maxHeight = "max-h-64",
  compact = false,
  showClearAll = true,
  onClearAll,
  triggerId,
  onOpenChange,
  popoverModal = true,
  contentClassName,
}: FilterSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [activeGroupId, setActiveGroupId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  // `layout="miller"`: open tab and middle-column row.
  const [activeSection, setActiveSection] = React.useState<string | null>(null)
  const [activeHeader, setActiveHeader] = React.useState<string | null>(null)
  // Side Radix picked on open; locked so growing content can't flip the panel.
  const [lockedSide, setLockedSide] = React.useState<PopoverSide | null>(null)
  // Held in state: the portal mounts the content a render after `open` flips.
  const [contentNode, setContentNode] = React.useState<HTMLDivElement | null>(null)
  const isMobile = useIsMobile()

  const updateOpen = React.useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) {
        setActiveGroupId(null)
        setActiveSection(null)
        setActiveHeader(null)
        setSearchQuery("")
        setLockedSide(null)
      } else if (layout === "miller") {
        // Like the timesheet picker, reopen on the first selected option.
        const selectedGroup = groups.find(
          (group) => countsSelections(value[group.id]) > 0
        )
        const firstId = selectedGroup
          ? listsSelectedIds(value[selectedGroup.id])[0]
          : null
        const firstOption = selectedGroup?.options.find(
          (option) => option.id === firstId
        )
        setActiveSection(selectedGroup?.section ?? groups[0]?.section ?? null)
        setActiveGroupId(selectedGroup?.id ?? null)
        setActiveHeader(
          selectedGroup && firstOption
            ? readsOptionHeader(firstOption, selectedGroup)
            : null
        )
      }
      onOpenChange?.(next)
    },
    [onOpenChange, layout, groups, value]
  )

  React.useEffect(() => {
    if (!open || lockedSide || isMobile) return
    const content = contentNode
    const wrapper = content?.parentElement
    if (!content || !wrapper) return

    // Radix parks the wrapper at translate(0, -200%) until Floating UI has
    // placed it; lock whichever side it lands on first.
    function locksPlacedSide() {
      if (!content || !wrapper || wrapper.style.transform.includes("-200%")) {
        return false
      }
      const placed = content.dataset.side
      if (placed !== "top" && placed !== "bottom") return false
      setLockedSide(placed)
      return true
    }

    if (locksPlacedSide()) return
    const observer = new MutationObserver(() => {
      if (locksPlacedSide()) observer.disconnect()
    })
    observer.observe(wrapper, { attributes: true, attributeFilter: ["style"] })
    return () => observer.disconnect()
  }, [open, lockedSide, isMobile, contentNode])

  const activeGroup = groups.find((group) => group.id === activeGroupId) ?? null

  const totalCount = groups.reduce(
    (sum, group) => sum + countsSelections(value[group.id]),
    0
  )

  const triggerText =
    totalCount > 0 ? `${placeholder} (${totalCount})` : placeholder

  function goesBack() {
    setActiveGroupId(null)
    setSearchQuery("")
  }

  function clearsAll() {
    if (disabled) return
    if (onClearAll) {
      onClearAll()
      return
    }
    for (const group of groups) {
      onChange(group.id, (group.selectType ?? "multi") === "multi" ? [] : null)
    }
  }

  function togglesOption(group: FilterSelectGroup, optionId: string) {
    if (disabled) return
    const option = group.options.find((entry) => entry.id === optionId)
    if (option?.disabled) return

    const current = value[group.id]

    if ((group.selectType ?? "multi") === "multi") {
      const ids = listsSelectedIds(current)
      onChange(
        group.id,
        ids.includes(optionId)
          ? ids.filter((id) => id !== optionId)
          : [...ids, optionId]
      )
      return
    }

    // Clicking the active single option clears it.
    onChange(group.id, current === optionId ? null : optionId)
  }

  const activeOptions = React.useMemo(() => {
    if (!activeGroup) return []
    let options = [...activeGroup.options]
    if (activeGroup.sortAlphabetically !== false) {
      options.sort((a, b) => a.label.localeCompare(b.label))
    }
    if (activeGroup.search && searchQuery.trim()) {
      const term = searchQuery.toLowerCase()
      options = options.filter(
        (option) =>
          option.label.toLowerCase().includes(term) ||
          option.description?.toLowerCase().includes(term) ||
          option.subtitle?.toLowerCase().includes(term) ||
          (typeof option.value === "string" &&
            option.value.toLowerCase().includes(term))
      )
    }
    return options
  }, [activeGroup, searchQuery])

  function rendersCategoryList() {
    return (
      <div className="flex flex-col gap-0.5">
        {showClearAll && totalCount > 0 ? (
          <div className="mb-1 flex justify-end border-b border-border pb-2">
            <button
              type="button"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              disabled={disabled}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                clearsAll()
              }}
            >
              Clear all
            </button>
          </div>
        ) : null}
        <div className={cn("overflow-y-auto", maxHeight)}>
          {groups.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No filters
            </div>
          ) : (
            groups.map((group) => {
              const count = countsSelections(value[group.id])
              return (
                <button
                  key={group.id}
                  type="button"
                  disabled={disabled}
                  className={cn(
                    CATEGORY_ROW_CLASS,
                    disabled && "cursor-not-allowed opacity-50",
                    count > 0 && "font-medium"
                  )}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    if (disabled) return
                    setActiveGroupId(group.id)
                    setSearchQuery("")
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{group.label}</span>
                    {group.description ? (
                      <span className="block text-xs font-normal text-muted-foreground">
                        {group.description}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {count > 0 ? (
                      <Badge className="h-5 min-w-5 justify-center rounded-sm px-1.5 text-[10px] font-semibold">
                        {count}
                      </Badge>
                    ) : null}
                    <ChevronRightIcon aria-hidden className="size-4 opacity-50" />
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>
    )
  }

  function rendersDetail(group: FilterSelectGroup) {
    const selectType = group.selectType ?? "multi"
    const selectedIds = listsSelectedIds(value[group.id])
    const optionCount = activeOptions.length
    // Up to seven options sit on one row; more fall back to the group's columns.
    const columns =
      optionCount > 0 && optionCount <= 7 ? optionCount : (group.columns ?? 3)

    return (
      <div className="flex min-h-0 flex-col">
        <div className="relative mb-2 flex min-h-8 items-center border-b border-border pb-2">
          <button
            type="button"
            aria-label="Back to filters"
            className="absolute left-0 inline-flex size-8 items-center justify-center rounded-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              goesBack()
            }}
          >
            <ChevronLeftIcon aria-hidden className="size-4" />
          </button>
          <div className="w-full truncate px-9 text-center text-sm font-medium">
            {group.label}
          </div>
        </div>

        {group.search ? (
          <div className="mb-2 border-b border-border pb-2">
            <div className="relative">
              <SearchIcon className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                aria-label={group.searchPlaceholder ?? "Search options..."}
                placeholder={group.searchPlaceholder ?? "Search options..."}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                disabled={disabled}
                className="h-9 w-full rounded-md border border-input bg-transparent py-2 pr-3 pl-8 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </div>
          </div>
        ) : null}

        <div className={cn("flex-1 overflow-y-auto", maxHeight)}>
          {optionCount === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No options found
            </div>
          ) : (
            <div
              role="listbox"
              aria-label={group.label}
              aria-multiselectable={selectType === "multi"}
              className={cn("grid w-full gap-2", GRID_COLS[columns] ?? "grid-cols-3")}
            >
              {activeOptions.map((option) => {
                const isSelected = selectedIds.includes(option.id)
                const isDisabled = Boolean(option.disabled) || disabled
                const subtitle = option.subtitle?.trim() ?? ""

                return (
                  <Badge
                    key={option.id}
                    tone={resolvesBadgeSelectOptionTone(option, isSelected)}
                    className={cn(
                      BADGE_SELECT_OPTION_BADGE_CLASS,
                      "w-full min-w-0 break-words !whitespace-normal",
                      subtitle && "flex flex-col items-stretch gap-1",
                      resolvesBadgeSelectOptionClasses(option, isSelected),
                      isDisabled && "cursor-not-allowed opacity-50",
                      !isDisabled && !isSelected && "hover:underline hover:opacity-80"
                    )}
                    style={option.badgeStyle}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled || undefined}
                    tabIndex={isDisabled ? -1 : 0}
                    onClick={() => {
                      if (!isDisabled) togglesOption(group, option.id)
                    }}
                    onKeyDown={(event) => {
                      if (!isDisabled && (event.key === "Enter" || event.key === " ")) {
                        event.preventDefault()
                        togglesOption(group, option.id)
                      }
                    }}
                  >
                    <span className="flex w-full min-w-0 flex-col gap-0.5 text-left">
                      <span className="block w-full min-w-0">{option.label}</span>
                      {subtitle ? (
                        <span className={resolvesBadgeSelectSubtitleClass(isSelected)}>
                          {subtitle}
                        </span>
                      ) : null}
                    </span>
                  </Badge>
                )
              })}
            </div>
          )}
        </div>

        {selectType === "multi" && selectedIds.length > 0 && isMobile ? (
          <div className="mt-4 border-t border-border pt-4">
            <button
              type="button"
              className="w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                goesBack()
              }}
            >
              Done ({selectedIds.length} selected)
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  function rendersOptionRow(
    group: FilterSelectGroup,
    option: BadgeSelectOption,
    trailing?: React.ReactNode
  ) {
    const isSelected = listsSelectedIds(value[group.id]).includes(option.id)
    const isDisabled = Boolean(option.disabled) || disabled
    return (
      <label
        key={`${group.id}-${option.id}`}
        role="option"
        aria-selected={isSelected}
        aria-disabled={isDisabled || undefined}
        className={cn(
          MILLER_ROW_CLASS,
          isSelected && MILLER_SELECTED_CLASS,
          isDisabled && "cursor-not-allowed opacity-50"
        )}
      >
        <Checkbox
          checked={isSelected}
          disabled={isDisabled}
          onChange={() => togglesOption(group, option.id)}
        />
        <span className="min-w-0 flex-1 break-words">
          <span className="block">{option.label}</span>
          {option.subtitle ? (
            <span className="block text-xs text-muted-foreground">
              {option.subtitle}
            </span>
          ) : null}
        </span>
        {trailing}
      </label>
    )
  }

  function rendersColumnRow({
    key,
    label,
    description,
    count,
    isOpen,
    onToggle,
  }: {
    key: string
    label: string
    description?: string
    count: number
    isOpen: boolean
    onToggle: () => void
  }) {
    return (
      <button
        key={key}
        type="button"
        role="option"
        aria-selected={isOpen}
        disabled={disabled}
        className={cn(MILLER_ROW_CLASS, "font-semibold", isOpen && MILLER_SELECTED_CLASS)}
        onClick={onToggle}
      >
        <span className="min-w-0 flex-1 break-words">
          <span className="block">{label}</span>
          {description ? (
            <span className="block text-xs font-normal text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
        {count > 0 ? <span className={MILLER_COUNT_CLASS}>{count}</span> : null}
      </button>
    )
  }

  function rendersMillerColumns() {
    const sections = groups.reduce<string[]>((list, group) => {
      if (group.section && !list.includes(group.section)) list.push(group.section)
      return list
    }, [])
    const section = activeSection ?? sections[0] ?? null
    const sectionGroups = section
      ? groups.filter((group) => group.section === section)
      : groups
    const openGroup = sectionGroups.find((group) => group.id === activeGroupId) ?? null
    const headers = openGroup ? listsGroupHeaders(openGroup) : []
    const openHeader = openGroup && activeHeader && headers.includes(activeHeader)
      ? activeHeader
      : null
    const headerOptions = openGroup && openHeader
      ? sortsGroupOptions(
          openGroup,
          openGroup.options.filter(
            (option) => readsOptionHeader(option, openGroup) === openHeader
          )
        )
      : []
    const term = searchQuery.trim().toLowerCase()
    const showsResults = term.length >= MILLER_SEARCH_MIN_LENGTH
    // Hidden columns keep their slot on desktop so widths never shift.
    const hiddenColumnClass = isMobile ? "hidden" : "invisible pointer-events-none"

    function countsSection(name: string) {
      return groups
        .filter((group) => group.section === name)
        .reduce((sum, group) => sum + countsSelections(value[group.id]), 0)
    }

    function countsHeader(group: FilterSelectGroup, header: string) {
      const ids = listsSelectedIds(value[group.id])
      return group.options.filter(
        (option) =>
          ids.includes(option.id) && readsOptionHeader(option, group) === header
      ).length
    }

    return (
      <div className="flex min-h-0 flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              aria-label="Search options"
              placeholder="Search options..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              disabled={disabled}
              className="h-8 w-full rounded-md border border-input bg-transparent py-1 pr-3 pl-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </div>
          {showClearAll && totalCount > 0 ? (
            <button
              type="button"
              className="shrink-0 text-xs font-medium text-primary underline-offset-4 hover:underline"
              disabled={disabled}
              onClick={clearsAll}
            >
              Clear all
            </button>
          ) : null}
        </div>

        {showsResults ? (
          rendersSearchResults(term)
        ) : (
          <>
            {sections.length > 0 ? (
              <div role="tablist" className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
                {sections.map((name) => {
                  const isActive = name === section
                  const count = countsSection(name)
                  return (
                    <button
                      key={name}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      disabled={disabled}
                      className={cn(
                        MILLER_TAB_CLASS,
                        isActive && cn("shadow-sm", MILLER_SELECTED_CLASS)
                      )}
                      onClick={() => {
                        setActiveSection(name)
                        setActiveGroupId(null)
                        setActiveHeader(null)
                      }}
                    >
                      {name}
                      {count > 0 ? <span className="tabular-nums">{count}</span> : null}
                    </button>
                  )
                })}
              </div>
            ) : null}

            <div
              className={cn(
                "grid min-h-0 gap-2",
                isMobile ? "grid-cols-1" : "h-72 grid-cols-3"
              )}
            >
              <div className={cn(MILLER_COLUMN_CLASS, isMobile && "max-h-56")}>
                <div className={MILLER_BANNER_CLASS}>{columnLabels[0]}</div>
                <div role="listbox" aria-label={columnLabels[0]}>
                  {sectionGroups.map((group) =>
                    rendersColumnRow({
                      key: group.id,
                      label: group.label,
                      description: group.description,
                      count: countsSelections(value[group.id]),
                      isOpen: group.id === openGroup?.id,
                      onToggle: () => {
                        // Re-clicking the open row closes the columns after it.
                        const closes = group.id === openGroup?.id
                        setActiveGroupId(closes ? null : group.id)
                        setActiveHeader(
                          closes ? null : (listsGroupHeaders(group)[0] ?? null)
                        )
                      },
                    })
                  )}
                </div>
              </div>

              <div
                aria-hidden={openGroup ? undefined : true}
                className={cn(
                  MILLER_COLUMN_CLASS,
                  isMobile && "max-h-56",
                  !openGroup && hiddenColumnClass
                )}
              >
                <div className={MILLER_BANNER_CLASS}>{columnLabels[1]}</div>
                {openGroup ? (
                  <div role="listbox" aria-label={columnLabels[1]}>
                    {headers.map((header) =>
                      rendersColumnRow({
                        key: header,
                        label: header,
                        count: countsHeader(openGroup, header),
                        isOpen: header === openHeader,
                        onToggle: () =>
                          setActiveHeader(header === openHeader ? null : header),
                      })
                    )}
                  </div>
                ) : null}
              </div>

              <div
                aria-hidden={openHeader ? undefined : true}
                className={cn(
                  MILLER_COLUMN_CLASS,
                  isMobile && "max-h-72",
                  !openHeader && hiddenColumnClass
                )}
              >
                <div className={MILLER_BANNER_CLASS}>{columnLabels[2]}</div>
                {openGroup && openHeader ? (
                  <div
                    role="listbox"
                    aria-label={openHeader}
                    aria-multiselectable={(openGroup.selectType ?? "multi") === "multi"}
                  >
                    {headerOptions.map((option) => rendersOptionRow(openGroup, option))}
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  /** Matches from every group, each tagged with where it lives. */
  function rendersSearchResults(term: string) {
    const hits = groups.flatMap((group) =>
      sortsGroupOptions(
        group,
        group.options.filter((option) => matchesOptionSearch(option, term))
      ).map((option) => ({ group, option }))
    )

    if (hits.length === 0) {
      return (
        <div className="py-6 text-center text-xs text-muted-foreground">
          No options found
        </div>
      )
    }

    return (
      <div
        role="listbox"
        aria-label="Search results"
        aria-multiselectable
        className={cn(MILLER_COLUMN_CLASS, isMobile ? "max-h-96" : "h-72")}
      >
        {hits.map(({ group, option }) => {
          const header = readsOptionHeader(option, group)
          const path = [group.section, group.label, header === group.label ? null : header]
            .filter(Boolean)
            .join(" · ")
          return rendersOptionRow(
            group,
            option,
            <span className="max-w-[45%] shrink-0 truncate text-right text-xs text-muted-foreground">
              {path}
            </span>
          )
        })}
      </div>
    )
  }

  const panelBody =
    layout === "miller"
      ? rendersMillerColumns()
      : activeGroup
        ? rendersDetail(activeGroup)
        : rendersCategoryList()

  function opensOnMobile() {
    if (!disabled && isMobile) updateOpen(true)
  }

  const triggerButton =
    variant === "badge" ? (
      <button
        id={triggerId}
        type="button"
        data-slot="filter-select"
        disabled={disabled}
        aria-label={triggerText}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(TRIGGER_BADGE_WRAPPER_CLASS, className)}
        onClick={opensOnMobile}
      >
        <Badge
          tone="outline"
          className="h-auto min-h-7 max-w-full cursor-pointer gap-1 px-2.5 py-1 text-xs font-medium whitespace-normal"
        >
          <span className="line-clamp-2 min-w-0 flex-1 text-left leading-snug break-words">
            {triggerText}
          </span>
          <ChevronDownIcon aria-hidden className="size-3 shrink-0 opacity-60" />
        </Badge>
      </button>
    ) : (
      <button
        id={triggerId}
        type="button"
        data-slot="filter-select"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          TRIGGER_FIELD_CLASS,
          variant === "select"
            ? "h-8 px-3"
            : cn(
                "w-auto min-w-[5.5rem]",
                compact ? "h-7 px-2 py-1 text-xs" : "min-h-10 w-full px-3 py-2"
              ),
          className
        )}
        onClick={opensOnMobile}
        onKeyDown={(event) => {
          if (disabled || !isMobile) return
          if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
            event.preventDefault()
            updateOpen(true)
          }
        }}
      >
        <span className={cn("truncate", totalCount === 0 && "text-muted-foreground")}>
          {triggerText}
        </span>
        <ChevronDownIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </button>
    )

  if (isMobile) {
    return (
      <>
        {triggerButton}
        <BadgeSelectSheet open={open} onOpenChange={updateOpen} title={placeholder}>
          <div className="min-h-0 flex-1 overflow-hidden">{panelBody}</div>
        </BadgeSelectSheet>
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={updateOpen} modal={popoverModal}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent
        ref={setContentNode}
        align="start"
        side={lockedSide ?? "bottom"}
        collisionPadding={resolvesCollisionPadding(lockedSide)}
        className={cn(
          "z-[200] gap-0",
          layout === "miller" ? "max-w-[calc(100vw-1rem)] p-3" : "p-2",
          SIZE_CLASSES[size ?? (layout === "miller" ? "xl" : "md")],
          layout === "miller" && "max-h-none",
          contentClassName
        )}
        onWheelCapture={(event) => event.stopPropagation()}
      >
        {panelBody}
      </PopoverContent>
    </Popover>
  )
}
