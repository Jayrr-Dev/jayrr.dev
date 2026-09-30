"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { useIsMobile } from "@/hooks/use-mobile"
import { Checkbox } from "@/components/standard/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"

/*
 * Styles from the utilitek timesheet Work Performed picker: flat separator
 * rows in bordered columns, with a green fill on the open or selected row.
 */
const TRIGGER_CLASS =
  "group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-transparent text-left text-sm text-foreground transition-colors outline-none hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:bg-input/30"

const SELECTED_CLASS =
  "bg-success/15 text-foreground hover:bg-success/15"

const TAB_CLASS =
  "inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

const COLUMN_CLASS =
  "flex min-h-0 min-w-0 flex-col overflow-y-auto overscroll-contain rounded-md border border-border"

const BANNER_CLASS =
  "sticky top-0 z-[1] shrink-0 border-b border-border bg-muted px-2 py-0.5 text-[9px] font-medium tracking-wide text-foreground uppercase"

const ROW_CLASS =
  "flex w-full min-w-0 cursor-pointer items-center gap-2 border-b border-border px-2 py-2 text-left text-sm text-foreground outline-none transition-colors last:border-b-0 hover:bg-muted/70 focus-visible:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-50"

const COUNT_CLASS = "ml-auto shrink-0 pl-1 text-right tabular-nums"

/** Characters typed before search replaces the columns with results. */
const SEARCH_MIN_LENGTH = 2

/** A checkbox row in the last column. */
export interface MillerSelectOption {
  id: string
  label: string
  /** Middle-column row this option sits under. Defaults to the group label. */
  header?: string
  /** Muted second line under the label. */
  subtitle?: string | null
  /** Matched by search, not shown. */
  description?: string | null
  disabled?: boolean
}

/** A row in the first column. Its options fill the other two. */
export interface MillerSelectGroup {
  /** Stable id, used as the key in the value map. */
  id: string
  label: string
  /** Short line under the label. */
  description?: string
  /** The tab this group sits under. Groups without one skip the tab strip. */
  section?: string
  options: readonly MillerSelectOption[]
  /** Default `multi`. */
  selectType?: "single" | "multi"
  /** Default true. */
  sortAlphabetically?: boolean
}

/** Selections keyed by group id. */
export type MillerSelectValue = Record<string, string | string[] | null>

export interface MillerSelectProps {
  groups: readonly MillerSelectGroup[]
  value: MillerSelectValue
  onChange: (groupId: string, selectedId: string | string[] | null) => void
  /** Trigger label. The selection count is added in brackets (default `Select`). */
  placeholder?: string
  /** Column banner labels (default Groups, Headers, Options). */
  columnLabels?: readonly [string, string, string]
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  /** Smaller trigger. */
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

/** Middle-column name for an option; options without a header fall under the group. */
function readsOptionHeader(option: MillerSelectOption, group: MillerSelectGroup) {
  return option.header?.trim() ? option.header : group.label
}

/** Unique headers in first-seen order. */
function listsGroupHeaders(group: MillerSelectGroup) {
  const headers: string[] = []
  for (const option of group.options) {
    const header = readsOptionHeader(option, group)
    if (!headers.includes(header)) headers.push(header)
  }
  return headers
}

function sortsGroupOptions(
  group: MillerSelectGroup,
  options: readonly MillerSelectOption[]
) {
  const sorted = [...options]
  if (group.sortAlphabetically !== false) {
    sorted.sort((a, b) => a.label.localeCompare(b.label))
  }
  return sorted
}

function matchesOptionSearch(option: MillerSelectOption, term: string) {
  return (
    option.label.toLowerCase().includes(term) ||
    Boolean(option.description?.toLowerCase().includes(term)) ||
    Boolean(option.subtitle?.toLowerCase().includes(term))
  )
}

/**
 * Miller-column picker, from the utilitek timesheet Work Performed field:
 * sections as tabs, then group, header, and checkbox columns side by side,
 * with a search that lists matches from every group. Opens as a popover on
 * desktop and a bottom sheet on mobile, where the columns stack.
 *
 * @example
 * ```tsx
 * <MillerSelect
 *   columnLabels={["Steps", "Substeps", "Activity"]}
 *   groups={[
 *     {
 *       id: "layout",
 *       section: "Design",
 *       label: "2 Layout",
 *       options: [{ id: "vd", label: "Voltage drop", header: "B Calcs" }],
 *     },
 *   ]}
 *   value={value}
 *   onChange={(groupId, selected) =>
 *     setValue((prev) => ({ ...prev, [groupId]: selected }))
 *   }
 * />
 * ```
 */
export function MillerSelect({
  groups,
  value,
  onChange,
  placeholder = "Select",
  columnLabels = ["Groups", "Headers", "Options"],
  searchPlaceholder = "Search options...",
  disabled = false,
  className,
  compact = false,
  showClearAll = true,
  onClearAll,
  triggerId,
  onOpenChange,
  popoverModal = true,
  contentClassName,
}: MillerSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState<string | null>(null)
  const [activeGroupId, setActiveGroupId] = React.useState<string | null>(null)
  const [activeHeader, setActiveHeader] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  // Side Radix picked on open; locked so growing content can't flip the panel.
  const [lockedSide, setLockedSide] = React.useState<PopoverSide | null>(null)
  // Held in state: the portal mounts the content a render after `open` flips.
  const [contentNode, setContentNode] = React.useState<HTMLDivElement | null>(null)
  const isMobile = useIsMobile()

  const updateOpen = React.useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) {
        setActiveSection(null)
        setActiveGroupId(null)
        setActiveHeader(null)
        setSearchQuery("")
        setLockedSide(null)
      } else {
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
    [onOpenChange, groups, value]
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

  const totalCount = groups.reduce(
    (sum, group) => sum + countsSelections(value[group.id]),
    0
  )

  const triggerText =
    totalCount > 0 ? `${placeholder} (${totalCount})` : placeholder

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

  function togglesOption(group: MillerSelectGroup, optionId: string) {
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

  function rendersOptionRow(
    group: MillerSelectGroup,
    option: MillerSelectOption,
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
          ROW_CLASS,
          isSelected && SELECTED_CLASS,
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
        className={cn(ROW_CLASS, "font-semibold", isOpen && SELECTED_CLASS)}
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
        {count > 0 ? <span className={COUNT_CLASS}>{count}</span> : null}
      </button>
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
        className={cn(COLUMN_CLASS, isMobile ? "max-h-96" : "h-72")}
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

  function rendersPanel() {
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
    const showsResults = term.length >= SEARCH_MIN_LENGTH
    // Hidden columns keep their slot on desktop so widths never shift.
    const hiddenColumnClass = isMobile ? "hidden" : "invisible pointer-events-none"

    function countsSection(name: string) {
      return groups
        .filter((group) => group.section === name)
        .reduce((sum, group) => sum + countsSelections(value[group.id]), 0)
    }

    function countsHeader(group: MillerSelectGroup, header: string) {
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
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
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
                      className={cn(TAB_CLASS, isActive && cn("shadow-sm", SELECTED_CLASS))}
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
              <div className={cn(COLUMN_CLASS, isMobile && "max-h-56")}>
                <div className={BANNER_CLASS}>{columnLabels[0]}</div>
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
                  COLUMN_CLASS,
                  isMobile && "max-h-56",
                  !openGroup && hiddenColumnClass
                )}
              >
                <div className={BANNER_CLASS}>{columnLabels[1]}</div>
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
                  COLUMN_CLASS,
                  isMobile && "max-h-72",
                  !openHeader && hiddenColumnClass
                )}
              >
                <div className={BANNER_CLASS}>{columnLabels[2]}</div>
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

  const triggerButton = (
    <button
      id={triggerId}
      type="button"
      data-slot="miller-select"
      disabled={disabled}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={cn(
        TRIGGER_CLASS,
        compact ? "h-7 w-auto px-2 py-1 text-xs" : "min-h-10 px-3 py-2",
        className
      )}
      onClick={() => {
        if (!disabled && isMobile) updateOpen(true)
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
        <DialogPrimitive.Root open={open} onOpenChange={updateOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
            <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 flex h-[70vh] flex-col rounded-t-2xl border-t border-border bg-background px-4 pt-4 pb-8 text-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom">
              <div className="flex items-center justify-between pb-4">
                <DialogPrimitive.Title className="text-base font-semibold">
                  {placeholder}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  aria-label="Close"
                  className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <XIcon className="size-4" />
                </DialogPrimitive.Close>
              </div>
              <DialogPrimitive.Description className="sr-only">
                {placeholder}
              </DialogPrimitive.Description>
              <div className="min-h-0 flex-1 overflow-y-auto">{rendersPanel()}</div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
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
          "z-[200] w-200 max-w-[calc(100vw-1rem)] gap-0 p-3",
          contentClassName
        )}
        onWheelCapture={(event) => event.stopPropagation()}
      >
        {rendersPanel()}
      </PopoverContent>
    </Popover>
  )
}
