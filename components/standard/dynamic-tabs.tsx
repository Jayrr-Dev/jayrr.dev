"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import { Tooltip } from "@/components/standard/tooltip"
import { useControllableState } from "@/hooks/use-controllable-state"

const SCROLL_PAGE_RATIO = 0.7
const RENAME_HOLD_MS = 550

type DynamicTabItem = {
  id: string
  label: string
  /** Content before the label, e.g. an icon or a checkbox. */
  leading?: React.ReactNode
  /** Set `false` to keep this one tab from being closed. */
  closable?: boolean
}

const TAB_SIZE = {
  sm: {
    tab: "h-7 min-w-[5.5rem] max-w-[8.5rem] text-[11px]",
    close: "size-3.5",
    closeIcon: "size-2.5",
    button: "xs",
  },
  default: {
    tab: "h-8 min-w-[6.5rem] max-w-[10rem] text-xs",
    close: "size-4",
    closeIcon: "size-3",
    button: "sm",
  },
} as const

type DynamicTabsSize = keyof typeof TAB_SIZE

/**
 * Where the overflow arrows sit. `inline` gives each arrow its own slot in
 * the strip. `overlay` floats them over the tabs with no background, and the
 * tabs fade out underneath.
 */
type DynamicTabsScrollButtons = "inline" | "overlay"

/** Width of the fade under an overlaid arrow. */
const OVERLAY_FADE = "2.75rem"

/** Mask that fades the tab row out on each side that can still scroll. */
function overlayFadeMask(left: boolean, right: boolean) {
  if (!left && !right) return undefined
  const start = left ? `transparent, black ${OVERLAY_FADE}` : "black"
  const end = right
    ? `black calc(100% - ${OVERLAY_FADE}), transparent`
    : "black"
  return `linear-gradient(to right, ${start}, ${end})`
}

function DynamicTab({
  tabId,
  item,
  active,
  canClose,
  canRename,
  size,
  onSelect,
  onClose,
  onRename,
  onKeyNavigate,
}: {
  tabId: string
  item: DynamicTabItem
  active: boolean
  canClose: boolean
  canRename: boolean
  size: DynamicTabsSize
  onSelect: () => void
  onClose: () => void
  onRename: (label: string) => void
  onKeyNavigate: (event: React.KeyboardEvent<HTMLDivElement>) => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(item.label)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const holdTimer = React.useRef<number>(0)
  const styles = TAB_SIZE[size]

  React.useEffect(() => {
    if (!editing) return
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [editing])

  React.useEffect(() => () => window.clearTimeout(holdTimer.current), [])

  function startEditing() {
    setDraft(item.label)
    setEditing(true)
  }

  function commit() {
    const next = draft.trim()
    setEditing(false)
    if (next && next !== item.label) onRename(next)
  }

  function clearHold() {
    window.clearTimeout(holdTimer.current)
  }

  function startHoldRename(event: React.PointerEvent<HTMLElement>) {
    if (!canRename || editing || event.pointerType === "mouse") return
    clearHold()
    holdTimer.current = window.setTimeout(startEditing, RENAME_HOLD_MS)
  }

  return (
    <div
      role="tab"
      id={tabId}
      aria-selected={active}
      data-slot="dynamic-tab"
      data-active={active || undefined}
      tabIndex={editing ? -1 : active ? 0 : -1}
      title={canRename ? "Double-click or press and hold to rename" : undefined}
      onClick={onSelect}
      onPointerDown={startHoldRename}
      onPointerUp={clearHold}
      onPointerCancel={clearHold}
      onPointerLeave={clearHold}
      onKeyDown={(event) => {
        if (editing || event.target !== event.currentTarget) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        } else if (event.key === "F2" && canRename) {
          event.preventDefault()
          startEditing()
        } else if (event.key === "Delete" && canClose) {
          event.preventDefault()
          onClose()
        } else {
          onKeyNavigate(event)
        }
      }}
      className={cn(
        "group/tab relative flex shrink-0 cursor-pointer touch-manipulation items-center gap-0.5 rounded-t-md border border-b-0 px-1 transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50",
        styles.tab,
        active
          ? "z-[1] -mb-px border-border bg-background text-foreground shadow-sm"
          : "border-transparent bg-muted/35 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {item.leading ? (
        <span
          className="flex shrink-0 items-center"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {item.leading}
        </span>
      ) : null}

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          aria-label="Tab name"
          className="min-w-0 flex-1 bg-transparent px-0.5 leading-snug outline-none"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            event.stopPropagation()
            if (event.key === "Enter") {
              event.preventDefault()
              commit()
            } else if (event.key === "Escape") {
              event.preventDefault()
              setEditing(false)
            }
          }}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        />
      ) : (
        <span
          className="min-w-0 flex-1 truncate px-0.5 leading-snug"
          onDoubleClick={(event) => {
            if (!canRename) return
            event.stopPropagation()
            startEditing()
          }}
        >
          {item.label}
        </span>
      )}

      {canClose ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Close ${item.label}`}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground",
            styles.close,
            !active &&
              "opacity-0 group-focus-within/tab:opacity-100 group-hover/tab:opacity-100 pointer-coarse:opacity-100"
          )}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            onClose()
          }}
        >
          <XIcon className={styles.closeIcon} strokeWidth={2} />
        </button>
      ) : (
        <span
          className={cn("inline-flex shrink-0", styles.close)}
          aria-hidden
        />
      )}
    </div>
  )
}

/**
 * Browser-style tab strip the user can grow, shrink and rename. The parent
 * owns `items`; the strip handles selection, overflow scrolling, inline
 * rename and picking a neighbour when the active tab closes.
 */
function DynamicTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  onAdd,
  onClose,
  onRename,
  minTabs = 1,
  size = "sm",
  scrollButtons = "inline",
  addLabel = "Add tab",
  trailing,
  children,
  className,
  "aria-label": ariaLabel = "Tabs",
}: {
  items: DynamicTabItem[]
  /** Id of the active tab. */
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Shows the add button. The parent appends the new item (and may select it). */
  onAdd?: () => void
  /** Enables close buttons. The parent removes the item. */
  onClose?: (id: string) => void
  /** Enables double-click / press-and-hold / F2 rename. */
  onRename?: (id: string, label: string) => void
  /** Close buttons hide once the strip is down to this many tabs. */
  minTabs?: number
  size?: DynamicTabsSize
  /** `overlay` floats the overflow arrows over the tabs with a fade. */
  scrollButtons?: DynamicTabsScrollButtons
  /** Tooltip and accessible name of the add button. */
  addLabel?: string
  /** Controls after the add button, e.g. a menu. */
  trailing?: React.ReactNode
  /** Panel for the active tab. */
  children?: React.ReactNode
  className?: string
  "aria-label"?: string
}) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? items[0]?.id ?? "",
    onChange: onValueChange,
  })
  const activeId = items.some((item) => item.id === selected)
    ? selected
    : items[0]?.id
  const baseId = React.useId()
  const tabIdFor = (id: string) => `${baseId}-tab-${id}`
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const buttonSize = TAB_SIZE[size].button
  const canCloseAny = onClose != null && items.length > minTabs
  const overlay = scrollButtons === "overlay"
  const fadeMask = overlay
    ? overlayFadeMask(canScrollLeft, canScrollRight)
    : undefined

  const syncOverflow = React.useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const observer = new ResizeObserver(syncOverflow)
    observer.observe(el)
    return () => observer.disconnect()
  }, [syncOverflow])

  // Keep the active tab in view as tabs come, go and change.
  React.useEffect(() => {
    const el = scrollerRef.current
    el?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({
      inline: "nearest",
      block: "nearest",
    })
    syncOverflow()
  }, [activeId, items.length, syncOverflow])

  function scrollByPage(direction: -1 | 1) {
    const el = scrollerRef.current
    el?.scrollBy({
      left: direction * el.clientWidth * SCROLL_PAGE_RATIO,
      behavior: "smooth",
    })
  }

  function focusTab(id: string) {
    setSelected(id)
    scrollerRef.current
      ?.querySelector<HTMLElement>(`#${CSS.escape(tabIdFor(id))}`)
      ?.focus()
  }

  function close(id: string) {
    if (id === activeId) {
      const index = items.findIndex((item) => item.id === id)
      const neighbour = items[index + 1] ?? items[index - 1]
      if (neighbour) setSelected(neighbour.id)
    }
    onClose?.(id)
  }

  function navigate(event: React.KeyboardEvent<HTMLDivElement>, index: number) {
    const last = items.length - 1
    const target =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null
    if (target === null) return
    event.preventDefault()
    focusTab(items[target]!.id)
  }

  const scrollButton = (direction: -1 | 1) => {
    const button = (
      <Button
        tone="ghost"
        size={buttonSize}
        iconOnly
        tabIndex={-1}
        aria-label={direction < 0 ? "Scroll tabs left" : "Scroll tabs right"}
        className="mb-0.5 shrink-0"
        onClick={() => scrollByPage(direction)}
      >
        {direction < 0 ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </Button>
    )

    if (!overlay) return button

    return (
      <div
        className={cn(
          "absolute inset-y-0 z-[2] flex items-end",
          direction < 0 ? "left-0" : "right-0"
        )}
      >
        {button}
      </div>
    )
  }

  return (
    <div
      data-slot="dynamic-tabs"
      className={cn("flex min-w-0 flex-col", className)}
    >
      <div className="flex min-w-0 items-end gap-0.5 border-b border-border bg-muted/25 px-0.5 pt-0.5">
        {!overlay && canScrollLeft ? scrollButton(-1) : null}
        <div className="relative flex min-w-0 flex-1 items-end">
          {overlay && canScrollLeft ? scrollButton(-1) : null}
          <div
            ref={scrollerRef}
            role="tablist"
            aria-label={ariaLabel}
            onScroll={syncOverflow}
            style={
              fadeMask
                ? { maskImage: fadeMask, WebkitMaskImage: fadeMask }
                : undefined
            }
            className="flex min-w-0 flex-1 [scrollbar-width:none] flex-nowrap items-end gap-0.5 overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, index) => (
              <DynamicTab
                key={item.id}
                tabId={tabIdFor(item.id)}
                item={item}
                active={item.id === activeId}
                canClose={canCloseAny && item.closable !== false}
                canRename={onRename != null}
                size={size}
                onSelect={() => setSelected(item.id)}
                onClose={() => close(item.id)}
                onRename={(label) => onRename?.(item.id, label)}
                onKeyNavigate={(event) => navigate(event, index)}
              />
            ))}
          </div>
          {overlay && canScrollRight ? scrollButton(1) : null}
        </div>
        {!overlay && canScrollRight ? scrollButton(1) : null}
        {onAdd || trailing ? (
          <div className="mb-0.5 flex shrink-0 items-center gap-0.5">
            {onAdd ? (
              <Tooltip content={addLabel}>
                <Button
                  tone="ghost"
                  size={buttonSize}
                  iconOnly
                  aria-label={addLabel}
                  onClick={onAdd}
                >
                  <PlusIcon />
                </Button>
              </Tooltip>
            ) : null}
            {trailing}
          </div>
        ) : null}
      </div>
      {children != null && activeId ? (
        <div
          role="tabpanel"
          aria-labelledby={tabIdFor(activeId)}
          data-slot="dynamic-tabs-panel"
          className="min-h-0 flex-1"
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Local state for a DynamicTabs strip: items plus add / close / rename
 * handlers, ready to spread onto the component. `create` builds a new item
 * from the next number ("Tab 3").
 */
function useDynamicTabs<T extends DynamicTabItem>({
  initialItems,
  create,
}: {
  initialItems: T[]
  create: (index: number) => T
}) {
  const [items, setItems] = React.useState(initialItems)
  const [value, setValue] = React.useState(initialItems[0]?.id ?? "")
  const counter = React.useRef(initialItems.length)

  const onAdd = React.useCallback(() => {
    counter.current += 1
    const next = create(counter.current)
    setItems((previous) => [...previous, next])
    setValue(next.id)
  }, [create])

  const onClose = React.useCallback((id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id))
  }, [])

  const onRename = React.useCallback((id: string, label: string) => {
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, label } : item))
    )
  }, [])

  return {
    items,
    setItems,
    value,
    onValueChange: setValue,
    onAdd,
    onClose,
    onRename,
  }
}

export { DynamicTabs, useDynamicTabs }
export type { DynamicTabItem, DynamicTabsScrollButtons, DynamicTabsSize }
