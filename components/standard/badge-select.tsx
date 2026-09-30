"use client"

import * as React from "react"
import {
  CheckIcon,
  ChevronDownIcon,
  ListFilterIcon,
  SearchIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { Dialog as DialogPrimitive, Tooltip as TooltipPrimitive } from "radix-ui"
import { cn } from "cn"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/standard/badge"
import { Button } from "@/components/standard/button"
import { Divider } from "@/components/standard/divider"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"
import { TooltipProvider } from "@/components/standard/tooltip"

type BadgeTone = "default" | "quiet" | "outline" | "danger"

type BadgeSelectSize = "xs" | "sm" | "md" | "lg" | "xl"

/** Reserved id for the All option when allowAllOption is true. */
const ALL_OPTION_ID = "__all__"

/** Delay before option description tooltips open. */
const OPTION_TOOLTIP_DELAY_MS = 250

/** First paint option count when a large list opens, then more per frame. */
const LAZY_INITIAL_BATCH = 24
const LAZY_BATCH = 48

const AUTO_COLUMN_MAX = 3
const AUTO_ONE_COLUMN_MAX_OPTIONS = 5
const AUTO_FOUR_COLUMN_MIN_OPTIONS = 8

/** Shape shared by every option badge (the Standard Badge is a round pill). */
const OPTION_BADGE_CLASS =
  "relative w-fit shrink-0 cursor-pointer justify-start gap-1 overflow-hidden rounded-sm px-2 py-0.5 text-left text-xs font-semibold whitespace-nowrap transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

/** Selected option without its own badgeClass: primary fill. */
const OPTION_SELECTED_PRIMARY_CLASS =
  "!border-primary !bg-primary !text-primary-foreground shadow-sm"

/** Selected option that keeps its own badgeClass colors. */
const OPTION_SELECTED_WITH_BADGE_CLASS = "border-2 !border-primary shadow-md"

const OPTION_MIN_WIDTH_CLASS = "min-w-21.25"
const OPTION_ONE_COLUMN_CLASS =
  "max-w-full min-w-0 overflow-hidden whitespace-nowrap"

const OPTION_SUBTITLE_CLASS = "block w-full min-w-0 font-normal leading-snug"

const OPTION_SECONDARY_BADGE_CLASS =
  "rounded-sm px-1 py-0 text-[10px] font-normal leading-tight shadow-none"

const OPTION_HEADER_CLASS =
  "mb-0.5 block w-full text-left text-[10px] leading-tight font-normal opacity-75"

const LIST_ROW_BASE_CLASS =
  "flex w-full cursor-pointer items-center rounded-sm text-left outline-none transition-colors focus-visible:bg-muted"

const LIST_ROW_SIZE_CLASS: Record<BadgeSelectSize, string> = {
  xs: "gap-2 px-2 py-1.5 text-xs",
  sm: "gap-2 px-2.5 py-2 text-sm",
  md: "gap-2 px-3 py-2 text-sm",
  lg: "gap-3 px-3 py-2.5 text-sm",
  xl: "gap-3 px-4 py-3 text-base",
}

const LIST_ROW_SELECTED_CLASS = "bg-muted font-medium text-foreground"
const LIST_ROW_IDLE_CLASS = "text-foreground hover:bg-muted/60"

const SHEET_ROW_CLASS =
  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors active:bg-muted/80"
const SHEET_ROW_SELECTED_CLASS = "border border-primary bg-primary/10"
const SHEET_ROW_IDLE_CLASS = "bg-muted/30 hover:bg-muted/50"

const TOOLTIP_CONTENT_CLASS =
  "pointer-events-none z-[300] max-w-sm rounded-md border border-border bg-popover px-2 py-1.5 text-left text-popover-foreground shadow-md"

const SEARCH_INPUT_CLASS =
  "w-full rounded-md border border-input bg-transparent py-2 pl-8 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

const CLEAR_ALL_IN_SEARCH_CLASS =
  "absolute top-1/2 right-2 z-10 -translate-y-1/2 cursor-pointer text-xs font-medium text-primary underline-offset-4 hover:underline"

const CLEAR_ICON_IN_SEARCH_CLASS =
  "absolute top-1/2 right-2 z-10 -translate-y-1/2 cursor-pointer rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"

const TRIGGER_FIELD_CLASS =
  "group flex h-8 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-transparent text-left text-sm text-foreground transition-colors outline-none hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:bg-input/30"

const TRIGGER_BADGE_WRAPPER_CLASS =
  "inline-flex max-w-full cursor-pointer rounded-full border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

const TRIGGER_ICON_CLASS =
  "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
}

const BADGE_WIDTH_CLASSES: Record<string, string> = {
  xs: "w-20",
  sm: "w-24",
  md: "w-36",
  lg: "w-46",
  xl: "w-52",
}

const POPOVER_MAX_HEIGHT: Record<BadgeSelectSize, string> = {
  xs: "max-h-48",
  sm: "max-h-64",
  md: "max-h-80",
  lg: "max-h-96",
  xl: "max-h-[480px]",
}

const POPOVER_FULL_WIDTH: Record<BadgeSelectSize, string> = {
  xs: "w-40",
  sm: "w-80",
  md: "w-[480px]",
  lg: "w-[590px]",
  xl: "w-[800px]",
}

/** Popover width per auto column count: 1, 2, 3 (full) and 4 (full plus one). */
const POPOVER_WIDTH_BY_COLUMNS: Record<
  BadgeSelectSize,
  Record<1 | 2 | 3 | 4, string>
> = {
  xs: { 1: "w-[170px] max-w-[170px]", 2: "w-[107px]", 3: "w-40", 4: "w-[213px]" },
  sm: { 1: "w-[214px] max-w-[214px]", 2: "w-[213px]", 3: "w-80", 4: "w-[427px]" },
  md: { 1: "w-80 max-w-80", 2: "w-80", 3: "w-[480px]", 4: "w-[640px]" },
  lg: { 1: "w-[394px] max-w-[394px]", 2: "w-[393px]", 3: "w-[590px]", 4: "w-[787px]" },
  xl: { 1: "w-[534px] max-w-[534px]", 2: "w-[533px]", 3: "w-[800px]", 4: "w-[1067px]" },
}

const POPOVER_ONE_COLUMN_MIN_WIDTH: Record<BadgeSelectSize, string> = {
  xs: "min-w-[170px] overflow-x-hidden",
  sm: "min-w-[214px] overflow-x-hidden",
  md: "min-w-80 overflow-x-hidden",
  lg: "min-w-[394px] overflow-x-hidden",
  xl: "min-w-[534px] overflow-x-hidden",
}

/** Compact badge shown below a {@link BadgeSelectOption} label. */
export interface BadgeSelectSecondaryBadge {
  /** Stable key when labels may repeat. */
  id?: string
  label: string
  /** Badge tone (default `outline`). */
  tone?: BadgeTone
  className?: string
}

export interface BadgeSelectOption {
  id: string
  label: string
  /** Unbolded second line under the label. */
  subtitle?: string | null
  /** Leading visual. In the grid it takes a left column, like a media card. */
  icon?: React.ReactNode
  /** Extra value. Strings are matched by search. */
  value?: string | boolean | number | null
  /** Hover tooltip. A first line split by a newline is shown bold. */
  description?: string | null
  /** Small text above the label, or the section name when groupByHeader is on. */
  header?: string | React.ReactNode
  disabled?: boolean
  /** Idle colors for the badge (background, text, border). */
  badgeClass?: string
  /** Inline badge styles, such as a dynamic hex background. */
  badgeStyle?: React.CSSProperties
  /** Count shown after the label. */
  notificationCount?: number
  /** Shows the count after a vertical divider, zero included. */
  notificationCountWithSeparator?: boolean
  /** Compact badges below the label. */
  secondaryBadges?: readonly BadgeSelectSecondaryBadge[]
  /** Custom body for list rows. `label` still drives search and the trigger. */
  listContent?: React.ReactNode
  /** Control beside the option that does not toggle it (such as Preview). */
  trailing?: React.ReactNode
}

export interface BadgeSelectProps {
  options: readonly BadgeSelectOption[]
  /** A string for single, a string array for multi, null for empty. */
  selectedId?: string | string[] | null
  onSelect: (id: string | string[] | null) => void
  className?: string
  placeholder?: string
  /** Max height of the scrolling option area. */
  maxHeight?: string
  selectType?: "single" | "multi"
  search?: boolean
  searchPlaceholder?: string
  disabled?: boolean
  /**
   * Grid columns. At 3 or less (default 3) columns follow the option count:
   * 1 to 5 options use 1, even counts use 2 (4 at 8 or more), multiples of 3
   * use 3, and 8 or more that divide by neither use 4. Above 3 is kept as is.
   */
  columns?: number
  /** Popover width preset: xs 160px, sm 320px, md 480px, lg 590px, xl 800px. */
  size?: BadgeSelectSize
  /** Badge width preset (xs to xl) or any Tailwind width class. */
  badgeWidth?: string
  mode?: "grid" | "flex"
  sortAlphabetically?: boolean
  /** Adds a toggle that selects every option or none. Multi only. */
  filter?: boolean
  compact?: boolean
  /** Adds an empty option (None). */
  allowEmpty?: boolean
  emptyLabel?: string
  /** Groups options by `header` into sections. */
  groupByHeader?: boolean
  /** Adds an All option that calls onSelect(null). */
  allowAllOption?: boolean
  allOptionLabel?: string
  /** Trigger chrome: field, seamless inline text, select, badge chip, or icon only. */
  variant?: "default" | "seamless" | "select" | "badge" | "icon"
  /** Icon for `variant="icon"` (default ListFilter). */
  triggerIcon?: LucideIcon
  /** Badge tone for `variant="badge"` (default `outline`). */
  triggerBadgeTone?: BadgeTone
  /** Idle label for the badge trigger. Falls back to placeholder. */
  triggerLabel?: string
  /** Max width of the badge trigger label (default `max-w-40`). */
  triggerMaxWidthClass?: string
  triggerBadgeClassName?: string
  triggerLabelClassName?: string
  /** Classes on grid option labels (such as `line-clamp-3`). */
  optionLabelClassName?: string
  /** `list` shows full-width rows like a native select. Default `badges`. */
  optionLayout?: "badges" | "list"
  listOptionSelectedClassName?: string
  listOptionIdleClassName?: string
  listOptionClassName?: string
  /** Extra classes on the desktop popover or dialog. */
  contentClassName?: string
  /** When false, clicking the active single option again keeps it. */
  allowToggleDeselect?: boolean
  triggerId?: string
  triggerRef?: React.Ref<HTMLButtonElement | null>
  /** Controlled open state for the popover or sheet. */
  open?: boolean
  optionDescriptionTooltipDelayMs?: number
  onOpenChange?: (open: boolean) => void
  /** Content between the search and the options (such as quick filters). */
  popoverHeaderContent?: React.ReactNode
  /** Control to the right of the search field (such as Add). */
  searchTrailingContent?: React.ReactNode
  /** When false, the dialog overlay has no Done button. */
  showDialogDone?: boolean
  /** Lets the trigger label wrap instead of truncating. */
  wrapTrigger?: boolean
  /** Shows Select all above search. Multi with search only. */
  enableSelectAll?: boolean
  /** Shows Clear all (multi) or the X (single) inside the search field. */
  enableClearAll?: boolean
  ariaLabel?: string
  /** Radix Popover modal mode. Use false inside a Dialog. */
  popoverModal?: boolean
  /** `dialog` opens a full dialog instead of a popover, for long lists. */
  overlay?: "popover" | "dialog"
  /** `cards` wraps each header group in a card and keeps source order. */
  groupLayout?: "stack" | "cards"
}

function resolvesColumnCount(optionCount: number, customColumns: number) {
  if (customColumns > AUTO_COLUMN_MAX) return customColumns
  if (optionCount <= AUTO_ONE_COLUMN_MAX_OPTIONS) return 1
  if (optionCount % 2 === 0) {
    return optionCount >= AUTO_FOUR_COLUMN_MIN_OPTIONS ? 4 : 2
  }
  if (optionCount % 3 === 0) return 3
  if (optionCount >= AUTO_FOUR_COLUMN_MIN_OPTIONS) return 4
  return 3
}

function resolvesPopoverWidth(
  size: BadgeSelectSize,
  columnCount: number,
  customColumns: number
) {
  if (customColumns > AUTO_COLUMN_MAX) return POPOVER_FULL_WIDTH[size]
  if (columnCount >= 1 && columnCount <= 4) {
    return POPOVER_WIDTH_BY_COLUMNS[size][columnCount as 1 | 2 | 3 | 4]
  }
  return POPOVER_FULL_WIDTH[size]
}

/** Selection classes for an option badge, respecting its own colors. */
export function resolvesBadgeSelectOptionClasses(
  option: Pick<BadgeSelectOption, "badgeClass" | "badgeStyle">,
  isSelected: boolean
) {
  if (option.badgeStyle) {
    return isSelected
      ? cn("border-transparent", OPTION_SELECTED_WITH_BADGE_CLASS)
      : "border-transparent"
  }
  if (!isSelected) return option.badgeClass ?? ""
  if (option.badgeClass) {
    return cn(option.badgeClass, OPTION_SELECTED_WITH_BADGE_CLASS)
  }
  return OPTION_SELECTED_PRIMARY_CLASS
}

/** Filled tone only when selected without custom colors. */
export function resolvesBadgeSelectOptionTone(
  option: Pick<BadgeSelectOption, "badgeClass">,
  isSelected: boolean
): BadgeTone {
  return isSelected && !option.badgeClass ? "default" : "outline"
}

/** Muted subtitle when idle, inherited when selected so fills stay readable. */
export function resolvesBadgeSelectSubtitleClass(isSelected: boolean) {
  return cn(
    OPTION_SUBTITLE_CLASS,
    isSelected ? "text-inherit opacity-90" : "text-muted-foreground"
  )
}

/** Shared option badge class, exported for FilterSelect. */
export const BADGE_SELECT_OPTION_BADGE_CLASS = OPTION_BADGE_CLASS

function usesMediaLayout(option: Pick<BadgeSelectOption, "icon">) {
  return option.icon != null
}

function rendersSecondaryBadges(
  secondaryBadges: readonly BadgeSelectSecondaryBadge[] | undefined,
  isSelected = false
) {
  if (!secondaryBadges?.length) return null

  return (
    <div className="mt-1 flex w-full flex-wrap items-center gap-1">
      {secondaryBadges.map((badge, index) => (
        <Badge
          key={badge.id ?? `${badge.label}-${index}`}
          tone={badge.tone ?? "outline"}
          className={cn(
            OPTION_SECONDARY_BADGE_CLASS,
            badge.className,
            isSelected && "!text-inherit opacity-70"
          )}
        >
          {badge.label}
        </Badge>
      ))}
    </div>
  )
}

/** Label with an optional count, inline or after a divider. */
function rendersOptionLabel(
  option: BadgeSelectOption,
  labelText: React.ReactNode = option.label
) {
  const hasCount = typeof option.notificationCount === "number"

  if (option.notificationCountWithSeparator && hasCount) {
    return (
      <span className="flex w-full min-w-0 items-stretch gap-0">
        <span className="min-w-0 flex-1 py-0.5 break-words">{labelText}</span>
        <Divider orientation="vertical" className="mx-1 h-auto bg-current/30" />
        {/* Fixed minimum width so dividers line up across rows (up to 3 digits). */}
        <span className="flex min-w-[calc(3ch+0.5rem)] shrink-0 items-center justify-end px-1 tabular-nums">
          {option.notificationCount}
        </span>
      </span>
    )
  }

  if (!option.notificationCountWithSeparator && hasCount && option.notificationCount! > 0) {
    return (
      <span className="flex w-full min-w-0 items-center justify-between gap-1.5">
        <span className="min-w-0 break-words">{labelText}</span>
        <span className="shrink-0 tabular-nums opacity-70">
          {option.notificationCount}
        </span>
      </span>
    )
  }

  return labelText
}

/** Trailing actions that must not toggle the option. */
function rendersTrailing(trailing: React.ReactNode) {
  return (
    <div
      className="w-full [&_button]:!text-foreground [&_button]:hover:!text-foreground"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {trailing}
    </div>
  )
}

function rendersGridOptionBody(
  option: BadgeSelectOption,
  labelClassName: string | undefined,
  isSelected: boolean,
  primaryLabel: React.ReactNode
) {
  const subtitle = option.subtitle?.trim() ?? ""
  return (
    <span className="flex w-full min-w-0 flex-col gap-0.5 text-left">
      <span
        className={cn("block w-full min-w-0", labelClassName)}
        title={labelClassName ? option.label : undefined}
      >
        {primaryLabel}
      </span>
      {subtitle ? (
        <span className={resolvesBadgeSelectSubtitleClass(isSelected)}>
          {subtitle}
        </span>
      ) : null}
      {rendersSecondaryBadges(option.secondaryBadges, isSelected)}
    </span>
  )
}

function rendersGridOptionContent(
  option: BadgeSelectOption,
  isSelected: boolean,
  labelClassName: string | undefined,
  primaryLabel: React.ReactNode
) {
  if (usesMediaLayout(option)) {
    return (
      <div className="flex w-full min-w-0 items-stretch gap-2">
        <div className="flex w-1/3 min-w-0 shrink-0 self-stretch">
          {option.icon}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-stretch gap-1">
          {rendersGridOptionBody(
            option,
            "line-clamp-3 min-h-[3lh] break-words leading-snug",
            isSelected,
            primaryLabel
          )}
          {option.trailing != null ? rendersTrailing(option.trailing) : null}
        </div>
      </div>
    )
  }

  return (
    <>
      {rendersGridOptionBody(option, labelClassName, isSelected, primaryLabel)}
      {option.trailing != null ? rendersTrailing(option.trailing) : null}
    </>
  )
}

function resolvesGridOptionHover(
  option: Pick<BadgeSelectOption, "icon">,
  isSelected: boolean,
  isDisabled: boolean
) {
  if (isDisabled || isSelected) return ""
  return usesMediaLayout(option)
    ? "hover:opacity-90"
    : "hover:opacity-80 hover:underline"
}

function rendersTooltipBody(description: string) {
  const trimmed = description.trim()
  if (!trimmed) return null

  const newlineIndex = trimmed.indexOf("\n")
  if (newlineIndex === -1) {
    return (
      <p className="text-xs leading-snug whitespace-pre-line">{trimmed}</p>
    )
  }

  const title = trimmed.slice(0, newlineIndex).trim()
  const body = trimmed.slice(newlineIndex + 1).trim()
  return (
    <div className="space-y-1 text-xs leading-snug">
      {title ? <p className="font-bold">{title}</p> : null}
      {body ? <p className="whitespace-pre-line">{body}</p> : null}
    </div>
  )
}

/** Case-insensitive key for groupByHeader buckets. */
function normalizesHeaderKey(header: BadgeSelectOption["header"]) {
  if (header == null) return "__none"
  const text = String(header).trim()
  return text ? text.toLocaleLowerCase() : "__none"
}

function assignsRef(ref: React.Ref<HTMLButtonElement | null> | undefined) {
  return (node: HTMLButtonElement | null) => {
    if (!ref) return
    if (typeof ref === "function") ref(node)
    else (ref as React.RefObject<HTMLButtonElement | null>).current = node
  }
}

function SelectionBox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-sm border-2",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-muted-foreground/30"
      )}
    >
      {checked ? <CheckIcon className="size-3.5" /> : null}
    </span>
  )
}

/** Bottom drawer used on phones, where a popover fights the keyboard. */
export function BadgeSelectSheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 flex h-[70vh] flex-col rounded-t-2xl border-t border-border bg-background px-4 pt-4 pb-8 text-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom">
          <div className="flex items-center justify-between pb-4">
            <DialogPrimitive.Title className="text-base font-semibold">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="sr-only">
            {title}
          </DialogPrimitive.Description>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/**
 * A select whose options are toggleable badges in a grid, or rows in a list.
 *
 * @example
 * ```tsx
 * <BadgeSelect
 *   variant="badge"
 *   triggerLabel="Type"
 *   options={[{ id: "general", label: "General" }]}
 *   selectedId={type}
 *   onSelect={setType}
 * />
 * ```
 */
export function BadgeSelect({
  options,
  selectedId,
  onSelect,
  className,
  placeholder = "Select an option",
  maxHeight = "max-h-64",
  selectType = "single",
  search = false,
  searchPlaceholder = "Search options...",
  disabled = false,
  columns = 3,
  size = "md",
  badgeWidth,
  mode = "grid",
  sortAlphabetically = true,
  filter = false,
  compact = false,
  allowEmpty = false,
  emptyLabel = "None",
  groupByHeader = false,
  allowAllOption = false,
  allOptionLabel = "All",
  variant = "default",
  triggerIcon: TriggerIcon = ListFilterIcon,
  triggerBadgeTone = "outline",
  triggerLabel,
  triggerMaxWidthClass = "max-w-40",
  triggerBadgeClassName,
  triggerLabelClassName,
  optionLabelClassName,
  optionLayout = "badges",
  listOptionSelectedClassName,
  listOptionIdleClassName,
  listOptionClassName,
  contentClassName,
  allowToggleDeselect = true,
  triggerId,
  triggerRef,
  open: openProp,
  optionDescriptionTooltipDelayMs = OPTION_TOOLTIP_DELAY_MS,
  onOpenChange,
  popoverHeaderContent,
  searchTrailingContent,
  showDialogDone = true,
  wrapTrigger = false,
  enableSelectAll = false,
  enableClearAll = true,
  ariaLabel,
  popoverModal = true,
  overlay = "popover",
  groupLayout = "stack",
}: BadgeSelectProps) {
  const filterToggleId = React.useId()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [uncontrolledSheetOpen, setUncontrolledSheetOpen] = React.useState(false)
  const [uncontrolledPopoverOpen, setUncontrolledPopoverOpen] =
    React.useState(false)

  const isMobile = useIsMobile()
  const isOpenControlled = openProp !== undefined
  const sheetOpen = isOpenControlled
    ? Boolean(openProp) && isMobile
    : uncontrolledSheetOpen
  const popoverOpen = isOpenControlled
    ? Boolean(openProp) && (!isMobile || overlay === "dialog")
    : uncontrolledPopoverOpen

  const updateSheetOpen = React.useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setUncontrolledSheetOpen(next)
      onOpenChange?.(next)
    },
    [isOpenControlled, onOpenChange]
  )

  const updatePopoverOpen = React.useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setUncontrolledPopoverOpen(next)
      onOpenChange?.(next)
    },
    [isOpenControlled, onOpenChange]
  )

  // One tooltip mounts for the hovered option only, so a long list does not
  // create a Tooltip root per badge.
  const [hoveredOptionId, setHoveredOptionId] = React.useState<string | null>(
    null
  )
  const hoverTimeoutRef = React.useRef<number | null>(null)

  const clearsHoverTimeout = React.useCallback(() => {
    if (hoverTimeoutRef.current == null) return
    window.clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = null
  }, [])

  React.useEffect(() => {
    if (popoverOpen || sheetOpen) return
    clearsHoverTimeout()
    setHoveredOptionId(null)
  }, [popoverOpen, sheetOpen, clearsHoverTimeout])

  function wrapsDescriptionTooltip(
    option: BadgeSelectOption,
    node: React.ReactElement
  ) {
    const isHovered = hoveredOptionId === option.id
    return (
      <span
        className="inline w-fit max-w-full"
        onMouseEnter={() => {
          clearsHoverTimeout()
          // Inside the open list the default delay feels slow, so skip it.
          const delay =
            optionDescriptionTooltipDelayMs === OPTION_TOOLTIP_DELAY_MS
              ? 0
              : optionDescriptionTooltipDelayMs
          if (delay <= 0) {
            setHoveredOptionId(option.id)
            return
          }
          hoverTimeoutRef.current = window.setTimeout(() => {
            setHoveredOptionId(option.id)
          }, delay)
        }}
        onMouseLeave={() => {
          clearsHoverTimeout()
          setHoveredOptionId((current) =>
            current === option.id ? null : current
          )
        }}
      >
        {isHovered ? (
          <TooltipPrimitive.Root open disableHoverableContent>
            <TooltipPrimitive.Trigger asChild>{node}</TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                side="top"
                sideOffset={6}
                className={TOOLTIP_CONTENT_CLASS}
              >
                {rendersTooltipBody(option.description ?? "")}
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        ) : (
          node
        )}
      </span>
    )
  }

  function rendersLabelWithTooltip(option: BadgeSelectOption) {
    const hasTooltip =
      Boolean(option.description?.trim()) && !option.secondaryBadges?.length
    if (!hasTooltip) return rendersOptionLabel(option)
    return rendersOptionLabel(
      option,
      wrapsDescriptionTooltip(option, <span className="inline">{option.label}</span>)
    )
  }

  const badgeWidthClass = cn(
    badgeWidth ? (BADGE_WIDTH_CLASSES[badgeWidth] ?? badgeWidth) : BADGE_WIDTH_CLASSES[size],
    OPTION_MIN_WIDTH_CLASS
  )

  // Grid badges fill their column evenly unless badgeWidth is set.
  const gridBadgeWidthClass = badgeWidth
    ? badgeWidthClass
    : cn("w-full shrink", OPTION_MIN_WIDTH_CLASS)

  const processedOptions = React.useMemo(() => {
    let processed = [...options]
    if (sortAlphabetically) {
      processed.sort((a, b) => a.label.localeCompare(b.label))
    }
    if (allowAllOption) {
      processed = [{ id: ALL_OPTION_ID, label: allOptionLabel }, ...processed]
    }
    return processed
  }, [options, sortAlphabetically, allowAllOption, allOptionLabel])

  const visibleOptionCount = processedOptions.length + (allowEmpty ? 1 : 0)
  const resolvedColumns = resolvesColumnCount(visibleOptionCount, columns)
  const isOneColumn = resolvedColumns === 1
  const gridColsClass = GRID_COLS[resolvedColumns] ?? "grid-cols-3"
  const popoverWidthClass = resolvesPopoverWidth(size, resolvedColumns, columns)

  const isEmptySelected =
    allowEmpty &&
    (selectType === "single"
      ? selectedId == null || selectedId === ""
      : Array.isArray(selectedId) && selectedId.length === 0)

  const selectedIds =
    selectType === "multi"
      ? Array.isArray(selectedId)
        ? selectedId
        : []
      : selectedId && selectedId !== ""
        ? [selectedId as string]
        : []

  const selectedOptions = processedOptions.filter((option) =>
    selectedIds.includes(option.id)
  )

  // All is on when nothing is chosen. For multi an empty array means None,
  // so only null or undefined counts as All there.
  const isAllSelected =
    allowAllOption &&
    (selectType === "multi"
      ? selectedId == null
      : selectedId == null || selectedId === "")

  const filteredOptions = React.useMemo(() => {
    let result = processedOptions

    if (searchQuery && search) {
      const term = searchQuery.toLowerCase()
      result = result.filter(
        (option) =>
          option.label.toLowerCase().includes(term) ||
          option.description?.toLowerCase().includes(term) ||
          option.subtitle?.toLowerCase().includes(term) ||
          option.secondaryBadges?.some((badge) =>
            badge.label.toLowerCase().includes(term)
          ) ||
          (typeof option.value === "string" &&
            option.value.toLowerCase().includes(term)) ||
          (typeof option.header === "string" &&
            option.header.toLowerCase().includes(term))
      )
    }

    // Filter mode narrows the list to what is already selected.
    if (
      filter &&
      selectType === "multi" &&
      Array.isArray(selectedId) &&
      selectedId.length > 0
    ) {
      result = result.filter((option) => selectedId.includes(option.id))
    }

    return result
  }, [processedOptions, searchQuery, search, filter, selectType, selectedId])

  const isSurfaceOpen = popoverOpen || sheetOpen
  const [lazyCount, setLazyCount] = React.useState(LAZY_INITIAL_BATCH)

  React.useEffect(() => {
    if (!isSurfaceOpen) {
      setLazyCount(LAZY_INITIAL_BATCH)
      return
    }
    if (searchQuery.trim()) {
      setLazyCount(filteredOptions.length)
      return
    }
    if (lazyCount >= filteredOptions.length) return
    const frameId = window.requestAnimationFrame(() => {
      setLazyCount((current) =>
        Math.min(current + LAZY_BATCH, filteredOptions.length)
      )
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [isSurfaceOpen, filteredOptions.length, searchQuery, lazyCount])

  const renderedOptions = React.useMemo(() => {
    if (!isSurfaceOpen) return []
    if (overlay === "dialog") return filteredOptions
    return filteredOptions.slice(0, lazyCount)
  }, [isSurfaceOpen, overlay, filteredOptions, lazyCount])

  const selectableIds = React.useMemo(
    () =>
      filteredOptions
        .filter((option) => option.id !== ALL_OPTION_ID && !option.disabled)
        .map((option) => option.id),
    [filteredOptions]
  )

  const showSelectAll =
    selectType === "multi" && !disabled && enableSelectAll && selectableIds.length > 0
  const showClearAll =
    selectType === "multi" && !disabled && enableClearAll && selectedIds.length > 0
  const hasSingleValue =
    selectType === "single" && selectedId != null && selectedId !== ""
  const showClearSingle =
    search &&
    !disabled &&
    enableClearAll &&
    selectType === "single" &&
    (searchQuery.length > 0 || (allowToggleDeselect && hasSingleValue))
  const searchPadClass = showClearAll ? "pr-16" : showClearSingle ? "pr-8" : "pr-3"

  const groupedByHeader = React.useMemo(() => {
    if (!groupByHeader) return null
    const groups = new Map<
      string,
      { header: BadgeSelectOption["header"]; options: BadgeSelectOption[] }
    >()
    for (const option of renderedOptions) {
      const key = normalizesHeaderKey(option.header)
      if (!groups.has(key)) {
        groups.set(key, { header: option.header ?? "", options: [] })
      }
      groups.get(key)!.options.push(option)
    }
    return [...groups.values()].filter(
      (group) => group.header !== "" && group.header != null && group.options.length > 0
    )
  }, [groupByHeader, renderedOptions])

  function picksOption(id: string) {
    if (disabled) return
    if (id === ALL_OPTION_ID) {
      onSelect(null)
      if (selectType === "single") updatePopoverOpen(false)
      return
    }
    const option = processedOptions.find((entry) => entry.id === id)
    if (option?.disabled) return

    if (selectType === "multi") {
      const current = Array.isArray(selectedId) ? selectedId : []
      onSelect(
        current.includes(id)
          ? current.filter((entry) => entry !== id)
          : [...current, id]
      )
      return
    }

    const currentSingle = selectedId == null || selectedId === "" ? null : selectedId
    if (currentSingle === id) {
      if (allowToggleDeselect) onSelect(null)
    } else {
      onSelect(id)
    }
    updatePopoverOpen(false)
  }

  function picksEmpty() {
    if (disabled) return
    onSelect(selectType === "multi" ? [] : null)
  }

  function resolvesDisplayText(idleLabel?: string) {
    const idle = idleLabel ?? placeholder
    if (allowAllOption && isAllSelected) return allOptionLabel
    if (isEmptySelected) return emptyLabel
    if (selectType === "multi") {
      if (selectedOptions.length === 0) return idle
      if (selectedOptions.length <= 3) {
        return selectedOptions.map((option) => option.label).join(", ")
      }
      return `${selectedOptions.length} selected`
    }
    const selected = processedOptions.find((option) => option.id === selectedId)
    if (!selected) return idle
    if (variant === "select") return selected.label
    const subtitle = selected.subtitle?.trim()
    return subtitle ? `${selected.label} ${subtitle}` : selected.label
  }

  const triggerText = resolvesDisplayText(
    variant === "badge" ? triggerLabel : undefined
  )

  const isListLayout =
    (optionLayout === "list" || variant === "select") && !groupByHeader
  const listSelectedClass =
    listOptionSelectedClassName?.trim() || LIST_ROW_SELECTED_CLASS
  const listIdleClass = listOptionIdleClassName?.trim() || LIST_ROW_IDLE_CLASS

  function isOptionSelected(option: BadgeSelectOption) {
    return option.id === ALL_OPTION_ID
      ? isAllSelected
      : selectedIds.includes(option.id) && !isEmptySelected
  }

  function rendersListRow(option: BadgeSelectOption, afterSelect?: () => void) {
    const isSelected = isOptionSelected(option)
    const isDisabled = Boolean(option.disabled) || disabled
    const headerText =
      typeof option.header === "string" ? option.header.trim() : ""
    const subtitle = option.subtitle?.trim()

    const labelBody =
      option.listContent != null ? (
        <div className="min-w-0 flex-1">{option.listContent}</div>
      ) : (
        <div
          className={cn(
            "min-w-0 flex-1",
            option.icon != null && "flex items-center gap-3"
          )}
        >
          {option.icon != null ? (
            <span className="inline-flex shrink-0 items-center">{option.icon}</span>
          ) : null}
          <span className="flex w-full min-w-0 flex-col gap-0.5 leading-snug font-normal break-words">
            {rendersLabelWithTooltip(option)}
            {subtitle ? (
              <span className={resolvesBadgeSelectSubtitleClass(isSelected)}>
                {subtitle}
              </span>
            ) : null}
            {rendersSecondaryBadges(option.secondaryBadges)}
          </span>
        </div>
      )

    const row = (
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        disabled={isDisabled}
        className={cn(
          LIST_ROW_BASE_CLASS,
          LIST_ROW_SIZE_CLASS[size],
          listOptionClassName,
          isSelected ? listSelectedClass : listIdleClass,
          isDisabled && "cursor-not-allowed opacity-50"
        )}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (isDisabled) return
          picksOption(option.id)
          afterSelect?.()
        }}
        onPointerDown={(event) => {
          if (!isDisabled) event.stopPropagation()
        }}
      >
        {selectType === "multi" ? <SelectionBox checked={isSelected} /> : null}
        {labelBody}
        {selectType === "single" && isSelected ? (
          <CheckIcon aria-hidden className="size-4 shrink-0 text-primary" />
        ) : null}
      </button>
    )

    const sectionHeader = headerText ? (
      <div className="pointer-events-none px-3 pt-2 pb-1 text-xs font-semibold text-foreground select-none">
        {headerText}
      </div>
    ) : null

    if (option.trailing == null) {
      return (
        <React.Fragment key={option.id}>
          {sectionHeader}
          {row}
        </React.Fragment>
      )
    }

    return (
      <div key={option.id} className="flex flex-col">
        {sectionHeader}
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">{row}</div>
          <div
            className="shrink-0 pr-1"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            {option.trailing}
          </div>
        </div>
      </div>
    )
  }

  /** The All or None row at the top of a list. */
  function rendersListSpecialRow(
    label: string,
    isSelected: boolean,
    onPick: () => void
  ) {
    return (
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        disabled={disabled}
        className={cn(
          LIST_ROW_BASE_CLASS,
          LIST_ROW_SIZE_CLASS[size],
          listOptionClassName,
          isSelected ? listSelectedClass : listIdleClass,
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={(event) => {
          event.preventDefault()
          if (disabled) return
          onPick()
          updatePopoverOpen(false)
        }}
      >
        {selectType === "multi" ? <SelectionBox checked={isSelected} /> : null}
        <span className="min-w-0 flex-1 text-left font-normal break-words">
          {label}
        </span>
        {selectType === "single" && isSelected ? (
          <CheckIcon aria-hidden className="size-4 shrink-0 text-primary" />
        ) : null}
      </button>
    )
  }

  function rendersGridBadge(option: BadgeSelectOption, withHeader: boolean) {
    const isSelected = isOptionSelected(option)
    const isDisabled = Boolean(option.disabled) || disabled
    const hasSeparatorCount = Boolean(option.notificationCountWithSeparator)
    const isMedia = usesMediaLayout(option)
    const hasHeader = withHeader && option.header != null && option.header !== ""
    const hasStackedBody =
      !isMedia &&
      (Boolean(option.secondaryBadges?.length) ||
        option.trailing != null ||
        hasHeader ||
        Boolean(option.subtitle?.trim()))

    return (
      <Badge
        key={option.id}
        tone={resolvesBadgeSelectOptionTone(option, isSelected)}
        className={cn(
          OPTION_BADGE_CLASS,
          isOneColumn ? OPTION_ONE_COLUMN_CLASS : "break-words !whitespace-normal",
          isMedia && "flex w-full flex-col items-stretch gap-0 p-2",
          hasStackedBody && "flex flex-col items-stretch gap-1",
          hasSeparatorCount && "flex flex-row items-stretch !gap-0 pr-1 pl-2",
          !hasSeparatorCount && !isMedia && (compact ? "px-1.5 py-0.5" : "px-2"),
          isOneColumn
            ? "w-full max-w-full min-w-0"
            : mode === "grid"
              ? gridBadgeWidthClass
              : badgeWidthClass,
          resolvesBadgeSelectOptionClasses(option, isSelected),
          isDisabled && "cursor-not-allowed opacity-50",
          resolvesGridOptionHover(option, isSelected, isDisabled)
        )}
        style={option.badgeStyle}
        role="option"
        aria-selected={isSelected}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : 0}
        onClick={() => picksOption(option.id)}
        onKeyDown={(event) => {
          if (!isDisabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault()
            picksOption(option.id)
          }
        }}
      >
        {hasHeader ? <span className={OPTION_HEADER_CLASS}>{option.header}</span> : null}
        {rendersGridOptionContent(
          option,
          isSelected,
          isOneColumn ? cn("truncate", optionLabelClassName) : optionLabelClassName,
          rendersLabelWithTooltip(option)
        )}
      </Badge>
    )
  }

  function rendersEmptyBadge(extraClassName?: string) {
    return (
      <Badge
        tone={isEmptySelected ? "default" : "outline"}
        className={cn(
          OPTION_BADGE_CLASS,
          compact ? "px-1.5 py-0.5" : "px-2",
          extraClassName,
          isEmptySelected && OPTION_SELECTED_PRIMARY_CLASS,
          disabled && "cursor-not-allowed opacity-50",
          !disabled && !isEmptySelected && "hover:underline hover:opacity-80"
        )}
        role="option"
        aria-selected={isEmptySelected}
        tabIndex={disabled ? -1 : 0}
        onClick={picksEmpty}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault()
            picksEmpty()
          }
        }}
      >
        {emptyLabel}
      </Badge>
    )
  }

  function rendersSelectAll() {
    if (!showSelectAll) return null
    return (
      <div className="mb-2 flex min-h-5 items-center justify-between gap-2">
        <button
          type="button"
          className="cursor-pointer text-xs font-medium text-primary underline-offset-4 hover:underline"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (disabled || selectType !== "multi" || selectableIds.length === 0) return
            onSelect([...new Set([...selectedIds, ...selectableIds])])
          }}
        >
          Select all
        </button>
      </div>
    )
  }

  function rendersSearchClears() {
    if (showClearAll) {
      return (
        <button
          type="button"
          className={CLEAR_ALL_IN_SEARCH_CLASS}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onSelect([])
          }}
        >
          Clear all
        </button>
      )
    }
    if (showClearSingle) {
      const clearsValue = hasSingleValue && allowToggleDeselect
      return (
        <button
          type="button"
          className={CLEAR_ICON_IN_SEARCH_CLASS}
          aria-label={clearsValue ? "Clear filter" : "Clear search"}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setSearchQuery("")
            if (clearsValue) onSelect(null)
          }}
        >
          <XIcon className="size-4" />
        </button>
      )
    }
    return null
  }

  function rendersSheetBody() {
    return (
      <>
        {search ? (
          <div className="mb-4">
            {rendersSelectAll()}
            <div className="relative">
              <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className={cn(
                  "h-11 w-full rounded-xl border-0 bg-muted/50 pl-10 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  searchPadClass
                )}
                disabled={disabled}
              />
              {rendersSearchClears()}
            </div>
          </div>
        ) : null}

        {popoverHeaderContent ? (
          <div className="border-b border-border">{popoverHeaderContent}</div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No options found
            </div>
          ) : (
            <div role="listbox" aria-multiselectable={selectType === "multi"} className="space-y-1">
              {allowAllOption ? (
                <button
                  type="button"
                  className={cn(
                    SHEET_ROW_CLASS,
                    isAllSelected ? SHEET_ROW_SELECTED_CLASS : SHEET_ROW_IDLE_CLASS
                  )}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    if (disabled) return
                    onSelect(null)
                    updateSheetOpen(false)
                  }}
                >
                  {selectType === "multi" ? <SelectionBox checked={isAllSelected} /> : null}
                  <div className="min-w-0 flex-1 font-medium">{allOptionLabel}</div>
                  {selectType === "single" && isAllSelected ? (
                    <CheckIcon className="size-5 shrink-0 text-primary" />
                  ) : null}
                </button>
              ) : null}
              {allowEmpty ? (
                <button
                  type="button"
                  className={cn(
                    SHEET_ROW_CLASS,
                    isEmptySelected ? SHEET_ROW_SELECTED_CLASS : SHEET_ROW_IDLE_CLASS
                  )}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    if (disabled) return
                    picksEmpty()
                    updateSheetOpen(false)
                  }}
                >
                  <div className="min-w-0 flex-1 font-medium">{emptyLabel}</div>
                  {isEmptySelected ? (
                    <CheckIcon className="size-5 shrink-0 text-primary" />
                  ) : null}
                </button>
              ) : null}
              {renderedOptions
                .filter((option) => option.id !== ALL_OPTION_ID)
                .map((option) => {
                  const closesAfter =
                    selectType === "single" ? () => updateSheetOpen(false) : undefined
                  if (isListLayout) return rendersListRow(option, closesAfter)

                  const isSelected = isOptionSelected(option)
                  const isDisabled = Boolean(option.disabled) || disabled
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={isDisabled}
                      className={cn(
                        SHEET_ROW_CLASS,
                        isSelected ? SHEET_ROW_SELECTED_CLASS : SHEET_ROW_IDLE_CLASS,
                        isDisabled && "cursor-not-allowed opacity-50"
                      )}
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        if (isDisabled) return
                        picksOption(option.id)
                        closesAfter?.()
                      }}
                    >
                      {selectType === "multi" ? <SelectionBox checked={isSelected} /> : null}
                      <div className="min-w-0 flex-1">
                        {option.header ? (
                          <div className="mb-0.5 text-[10px] font-normal break-words whitespace-normal text-muted-foreground">
                            {option.header}
                          </div>
                        ) : null}
                        <div className="flex w-full min-w-0 flex-col items-start font-medium break-words whitespace-normal">
                          <div className="inline-flex w-full min-w-0 items-start gap-1.5">
                            {option.icon != null ? (
                              <span className="inline-flex shrink-0 items-center pt-0.5">
                                {option.icon}
                              </span>
                            ) : null}
                            <span className="w-full min-w-0">
                              {rendersLabelWithTooltip(option)}
                            </span>
                          </div>
                          {option.subtitle?.trim() ? (
                            <span className={resolvesBadgeSelectSubtitleClass(false)}>
                              {option.subtitle.trim()}
                            </span>
                          ) : null}
                          {rendersSecondaryBadges(option.secondaryBadges)}
                        </div>
                      </div>
                      {selectType === "single" && isSelected ? (
                        <CheckIcon className="size-5 shrink-0 text-primary" />
                      ) : null}
                    </button>
                  )
                })}
            </div>
          )}
        </div>

        {selectType === "multi" && selectedIds.length > 0 ? (
          <div className="mt-4 border-t border-border pt-4">
            <button
              type="button"
              className="w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                updateSheetOpen(false)
              }}
            >
              Done ({selectedIds.length} selected)
            </button>
          </div>
        ) : null}
      </>
    )
  }

  function rendersOverlayBody(scrollClassName: string) {
    return (
      <>
        {search ? (
          <div className="mb-2 border-b border-border pb-2">
            {rendersSelectAll()}
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <SearchIcon className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  aria-label={searchPlaceholder}
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className={cn(SEARCH_INPUT_CLASS, searchPadClass)}
                  disabled={disabled}
                />
                {rendersSearchClears()}
              </div>
              {searchTrailingContent ? (
                <div className="flex shrink-0 self-stretch">{searchTrailingContent}</div>
              ) : null}
            </div>
          </div>
        ) : null}

        {popoverHeaderContent ? (
          <div className="border-b border-border">{popoverHeaderContent}</div>
        ) : null}

        {filter && selectType === "multi" ? (
          <div className="mb-3 border-b border-border p-2">
            <label
              htmlFor={filterToggleId}
              className="flex cursor-pointer items-center gap-2 text-xs font-medium"
            >
              <input
                id={filterToggleId}
                type="checkbox"
                className="rounded accent-primary"
                checked={selectedIds.length > 0}
                disabled={disabled}
                onChange={(event) =>
                  onSelect(
                    event.target.checked
                      ? processedOptions
                          .filter((option) => option.id !== ALL_OPTION_ID)
                          .map((option) => option.id)
                      : []
                  )
                }
              />
              {selectedIds.length > 0
                ? `Filter Active (${selectedIds.length} selected)`
                : "Enable Filter"}
            </label>
          </div>
        ) : null}

        <div
          role="listbox"
          aria-label={ariaLabel ?? placeholder}
          aria-multiselectable={selectType === "multi"}
          className={cn("flex-1 overflow-y-auto outline-none", scrollClassName)}
          tabIndex={0}
        >
          {isListLayout ? (
            <div className="flex flex-col gap-0.5 py-0.5">
              {allowAllOption
                ? rendersListSpecialRow(allOptionLabel, isAllSelected, () => onSelect(null))
                : null}
              {allowEmpty
                ? rendersListSpecialRow(emptyLabel, isEmptySelected, picksEmpty)
                : null}
              {renderedOptions
                .filter((option) => option.id !== ALL_OPTION_ID)
                .map((option) => rendersListRow(option))}
            </div>
          ) : groupedByHeader && groupedByHeader.length > 0 ? (
            <div className={groupLayout === "cards" ? "space-y-3" : "space-y-2"}>
              {allowEmpty ? (
                <div className="flex flex-wrap justify-center gap-1">
                  {rendersEmptyBadge()}
                </div>
              ) : null}
              {groupedByHeader.map((group, index) => {
                // Stack layout lists newest first (months under a year).
                const groupOptions =
                  groupLayout === "cards" ? group.options : [...group.options].reverse()
                return (
                  <div
                    key={index}
                    className={
                      groupLayout === "cards"
                        ? "rounded-md border border-border bg-muted/20 p-3"
                        : "space-y-2"
                    }
                  >
                    <div
                      className={
                        groupLayout === "cards"
                          ? "mb-2 text-left text-xs font-semibold text-foreground"
                          : "text-center text-xs font-semibold text-foreground"
                      }
                    >
                      {group.header}
                    </div>
                    <div
                      className={
                        groupLayout === "cards"
                          ? "flex flex-wrap gap-1.5"
                          : cn("grid w-full gap-2", gridColsClass)
                      }
                    >
                      {groupOptions.map((option) => rendersGridBadge(option, false))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              className={
                mode === "grid"
                  ? cn("grid w-full gap-2", gridColsClass)
                  : "flex flex-wrap justify-center gap-1"
              }
            >
              {allowEmpty
                ? rendersEmptyBadge(
                    isOneColumn
                      ? cn("w-full max-w-full min-w-0", OPTION_ONE_COLUMN_CLASS)
                      : mode === "grid"
                        ? gridBadgeWidthClass
                        : badgeWidthClass
                  )
                : null}
              {renderedOptions.map((option) => rendersGridBadge(option, true))}
            </div>
          )}
        </div>
      </>
    )
  }

  const hasIconSelection = selectedIds.length > 0 && !isAllSelected
  const isOpen = popoverOpen || sheetOpen
  const isIdle =
    selectType === "single"
      ? !selectedId && !isEmptySelected
      : selectedOptions.length === 0 && !isEmptySelected && !isAllSelected

  function opensFromTrigger() {
    if (disabled) return
    if (isMobile && overlay !== "dialog") {
      updateSheetOpen(true)
      return
    }
    if (!popoverOpen) updatePopoverOpen(true)
  }

  function handlesTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault()
      event.stopPropagation()
      opensFromTrigger()
    }
  }

  const sharedTriggerProps = {
    ref: assignsRef(triggerRef),
    id: triggerId,
    type: "button" as const,
    disabled,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": isOpen,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      opensFromTrigger()
    },
    onKeyDown: handlesTriggerKeyDown,
  }

  const triggerButton =
    variant === "icon" ? (
      <button
        {...sharedTriggerProps}
        data-slot="badge-select"
        className={cn(TRIGGER_ICON_CLASS, hasIconSelection && "text-primary hover:text-primary", className)}
        aria-label={ariaLabel ?? triggerText}
        aria-pressed={hasIconSelection}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <TriggerIcon aria-hidden className="size-3.5" />
      </button>
    ) : variant === "badge" ? (
      <button
        {...sharedTriggerProps}
        data-slot="badge-select"
        className={cn(TRIGGER_BADGE_WRAPPER_CLASS, className)}
        aria-label={ariaLabel ?? triggerText}
      >
        <Badge
          tone={triggerBadgeTone}
          className={cn(
            "h-auto min-h-7 max-w-full cursor-pointer gap-1 px-2.5 py-1 text-xs font-medium whitespace-normal",
            triggerMaxWidthClass,
            triggerBadgeClassName
          )}
        >
          <span
            className={cn(
              "line-clamp-2 min-w-0 flex-1 text-left leading-snug break-words whitespace-normal",
              triggerLabelClassName
            )}
          >
            {triggerText}
          </span>
          <ChevronDownIcon
            aria-hidden
            className={cn("size-3 shrink-0 opacity-60", isOpen && "opacity-100")}
          />
        </Badge>
      </button>
    ) : (
      <button
        {...sharedTriggerProps}
        data-slot="badge-select"
        aria-label={ariaLabel}
        className={cn(
          variant === "seamless"
            ? cn(
                "group flex h-auto min-h-5 w-full cursor-pointer items-center justify-between gap-1 rounded-sm border-0 bg-transparent p-0 text-left text-foreground outline-none",
                "transition-[background-color,box-shadow,padding] duration-150",
                "hover:bg-muted/50 hover:px-1 focus-visible:bg-muted/50 focus-visible:px-1 focus-visible:ring-1 focus-visible:ring-ring",
                isOpen && "bg-muted/50 px-1 ring-1 ring-ring"
              )
            : cn(
                TRIGGER_FIELD_CLASS,
                compact ? "h-7 px-2 py-1 text-xs" : "px-3",
                wrapTrigger && "h-auto min-h-8 items-start py-1.5"
              ),
          className
        )}
      >
        <span
          className={cn(
            wrapTrigger
              ? "min-w-0 flex-1 text-left break-words whitespace-normal"
              : "truncate",
            triggerLabelClassName,
            isIdle && "text-muted-foreground",
            isIdle && variant === "default" && "group-hover:text-foreground"
          )}
        >
          {triggerText}
        </span>
        <ChevronDownIcon
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            variant === "seamless" &&
              "pointer-events-none opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100",
            variant === "seamless" && isOpen && "opacity-100"
          )}
        />
      </button>
    )

  const selectedSingle =
    selectType === "single" && selectedOptions.length === 1
      ? selectedOptions[0]
      : undefined
  const selectedDescription = selectedSingle?.description?.trim() ?? ""

  /** Shows the chosen option's description when hovering the trigger. */
  function wrapsTriggerTooltip(trigger: React.ReactElement) {
    if (!selectedDescription) return trigger
    return (
      <TooltipPrimitive.Root
        delayDuration={optionDescriptionTooltipDelayMs}
        disableHoverableContent
      >
        <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            sideOffset={6}
            className={TOOLTIP_CONTENT_CLASS}
          >
            {rendersTooltipBody(selectedDescription)}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    )
  }

  if (isMobile && overlay !== "dialog") {
    return (
      <TooltipProvider>
        {wrapsTriggerTooltip(triggerButton)}
        <BadgeSelectSheet
          open={sheetOpen}
          onOpenChange={updateSheetOpen}
          title={placeholder}
        >
          {rendersSheetBody()}
        </BadgeSelectSheet>
      </TooltipProvider>
    )
  }

  if (overlay === "dialog") {
    return (
      <TooltipProvider>
        {wrapsTriggerTooltip(triggerButton)}
        <DialogPrimitive.Root open={popoverOpen} onOpenChange={updatePopoverOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
            <DialogPrimitive.Content
              className={cn(
                "fixed top-1/2 left-1/2 z-50 flex max-h-[min(90dvh,56rem)] w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col gap-3 overflow-hidden rounded-xl border border-border bg-background p-4 text-foreground shadow-lg",
                contentClassName
              )}
            >
              <div className="flex items-center justify-between">
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
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {rendersOverlayBody("min-h-0 max-h-[min(70dvh,40rem)] flex-1")}
              </div>
              {showDialogDone ? (
                <div className="flex justify-end">
                  <Button onClick={() => updatePopoverOpen(false)}>Done</Button>
                </div>
              ) : null}
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Popover open={popoverOpen} onOpenChange={updatePopoverOpen} modal={popoverModal}>
        {wrapsTriggerTooltip(<PopoverTrigger asChild>{triggerButton}</PopoverTrigger>)}
        <PopoverContent
          align="start"
          side="bottom"
          collisionPadding={8}
          className={cn(
            "pointer-events-auto z-[100] gap-0 p-2",
            popoverWidthClass,
            isOneColumn && POPOVER_ONE_COLUMN_MIN_WIDTH[size],
            POPOVER_MAX_HEIGHT[size],
            contentClassName
          )}
          onWheelCapture={(event) => event.stopPropagation()}
        >
          {rendersOverlayBody(maxHeight)}
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}

/** Width preset for compact action badges, matching option badges. */
export const BADGE_SELECT_ACTION_BADGE_WIDTH = "sm"

export interface BadgeSelectActionProps {
  label: string
  /** Leading icon, such as a Lucide icon at `size-2.5`. */
  icon?: React.ReactNode
  onClick: () => void
  tone?: BadgeTone
  /** Width preset (xs to xl) or any Tailwind width class. */
  badgeWidth?: string
  ariaLabel?: string
  className?: string
  disabled?: boolean
}

/**
 * A clickable action badge with the same width and type as BadgeSelect options.
 *
 * @example
 * ```tsx
 * <BadgeSelectAction label="Edit" icon={<PencilIcon className="size-2.5" />} onClick={edit} />
 * ```
 */
export function BadgeSelectAction({
  label,
  icon,
  onClick,
  tone = "outline",
  badgeWidth = BADGE_SELECT_ACTION_BADGE_WIDTH,
  ariaLabel,
  className,
  disabled = false,
}: BadgeSelectActionProps) {
  const widthClass = BADGE_WIDTH_CLASSES[badgeWidth] ?? badgeWidth

  return (
    <Badge
      data-slot="badge-select-action"
      tone={tone}
      className={cn(
        "cursor-pointer justify-center gap-1 rounded-sm text-[10px] font-semibold normal-case !whitespace-normal transition-all outline-none select-none hover:underline hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50",
        widthClass,
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        className
      )}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel ?? label}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(event) => {
        if (disabled) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onClick()
        }
      }}
    >
      {icon}
      {label}
    </Badge>
  )
}
