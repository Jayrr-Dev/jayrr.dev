"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { XIcon } from "lucide-react"
import { cn } from "cn"

import { ToolbarCountBadge } from "@/components/standard/toolbar-count"
import { Tooltip } from "@/components/standard/tooltip"

export type FabSize = "compact" | "default" | "medium" | "large"
export type FabTone = "primary" | "secondary" | "surface"
/** `true` always shows the label, `"hover"` reveals it on hover or focus. */
export type FabExtended = boolean | "hover"
export type FabPlacement = "end" | "start" | "center"

/**
 * Material 3 FAB sizes (56 / 80 / 96px, 16 / 20 / 28px corners) plus the
 * 32px `compact` chrome from utilitek, which stays a circle. Horizontal
 * padding centers the icon, so a collapsed label leaves an exact square.
 */
const fabVariants = cva(
  "group/fab relative isolate inline-flex shrink-0 items-center overflow-hidden font-medium whitespace-nowrap transition-[box-shadow,background-color,color,border-radius] duration-200 ease-out outline-none select-none before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-current before:opacity-0 before:transition-opacity hover:before:opacity-[0.08] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:before:opacity-10 active:before:opacity-10 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        compact:
          "h-8 min-w-8 rounded-full px-[9px] text-xs shadow-md hover:shadow-lg [&_svg]:size-3.5",
        default:
          "h-14 min-w-14 rounded-2xl px-4 text-base shadow-lg hover:shadow-xl [&_svg]:size-6",
        medium:
          "h-20 min-w-20 rounded-[20px] px-[26px] text-xl shadow-lg hover:shadow-xl [&_svg]:size-7",
        large:
          "h-24 min-w-24 rounded-[28px] px-[30px] text-2xl shadow-lg hover:shadow-xl [&_svg]:size-9",
      },
      tone: {
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        surface: "border border-border/80 bg-card text-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      tone: "primary",
    },
  }
)

const FAB_LABEL_GAP: Record<FabSize, string> = {
  compact: "pl-1",
  default: "pl-3",
  medium: "pl-3",
  large: "pl-4",
}

/**
 * Floating action button. The label animates open with a grid track instead
 * of utilitek's per-character pixel widths, so any label length fits.
 */
function Fab({
  className,
  label,
  icon,
  size = "default",
  tone = "primary",
  extended = false,
  badge,
  hint,
  type = "button",
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  /** Accessible name, and the visible text when extended. */
  label: string
  icon: React.ReactNode
  size?: FabSize
  tone?: FabTone
  extended?: FabExtended
  /** Count bubble on the corner, hidden at zero. */
  badge?: number
  /** Tooltip body. Defaults to the label while the label is hidden. */
  hint?: string
}) {
  const alwaysOpen = extended === true
  const button = (
    <button
      data-slot="fab"
      data-size={size}
      data-tone={tone}
      data-extended={extended === "hover" ? "hover" : alwaysOpen || undefined}
      type={type}
      aria-label={label}
      className={cn(fabVariants({ size, tone }), className)}
      {...props}
    >
      <span aria-hidden className="flex shrink-0">
        {icon}
      </span>
      {extended ? (
        <span
          aria-hidden
          className={cn(
            "grid transition-[grid-template-columns,opacity] duration-300 ease-out",
            alwaysOpen
              ? "grid-cols-[1fr]"
              : "grid-cols-[0fr] opacity-0 group-hover/fab:grid-cols-[1fr] group-hover/fab:opacity-100 group-focus-visible/fab:grid-cols-[1fr] group-focus-visible/fab:opacity-100"
          )}
        >
          <span className="min-w-0 overflow-hidden">
            <span className={cn("block", FAB_LABEL_GAP[size])}>{label}</span>
          </span>
        </span>
      ) : null}
    </button>
  )

  const tip = hint ?? (alwaysOpen ? undefined : label)
  const withTip = tip ? (
    <Tooltip label={label} body={tip}>
      {button}
    </Tooltip>
  ) : (
    button
  )

  if (badge === undefined) {
    return withTip
  }

  return (
    <ToolbarCountBadge count={badge} tone="danger">
      {withTip}
    </ToolbarCountBadge>
  )
}

// M3 keeps FABs 16px off the edges; the viewport also clears device insets.
const FAB_STACK_PLACEMENT: Record<
  "viewport" | "container",
  Record<FabPlacement, string>
> = {
  viewport: {
    end: "right-[max(1rem,env(safe-area-inset-right))] items-end",
    start: "left-[max(1rem,env(safe-area-inset-left))] items-start",
    center: "left-1/2 -translate-x-1/2 items-center",
  },
  container: {
    end: "right-4 items-end",
    start: "left-4 items-start",
    center: "left-1/2 -translate-x-1/2 items-center",
  },
}

/**
 * Pins FABs to a corner, stacked upward from the first child (utilitek's
 * `flex-col-reverse` column). The column lets clicks through between buttons.
 * `anchor="container"` pins to the nearest positioned parent instead of the
 * viewport. `hidden` slides the stack off the bottom edge, e.g. on scroll.
 */
function FabStack({
  className,
  placement = "end",
  anchor = "viewport",
  hidden = false,
  ...props
}: React.ComponentProps<"div"> & {
  placement?: FabPlacement
  anchor?: "viewport" | "container"
  hidden?: boolean
}) {
  return (
    <div
      data-slot="fab-stack"
      data-placement={placement}
      data-hidden={hidden || undefined}
      inert={hidden}
      className={cn(
        "pointer-events-none z-30 flex flex-col-reverse gap-3 transition-[translate,opacity] duration-300 ease-out [&>*]:pointer-events-auto",
        anchor === "viewport"
          ? "fixed bottom-[max(1rem,env(safe-area-inset-bottom))]"
          : "absolute bottom-4",
        FAB_STACK_PLACEMENT[anchor][placement],
        hidden && "translate-y-[calc(100%+2rem)] opacity-0",
        className
      )}
      {...props}
    />
  )
}

export type FabMenuItem = {
  label: string
  icon: React.ReactNode
  onSelect?: () => void
  disabled?: boolean
}

/**
 * Material 3 expressive FAB menu: the FAB turns into a close button and a
 * column of pill actions rises above it. Escape or a click outside closes it
 * and returns focus to the FAB. Arrow keys move between actions.
 */
function FabMenu({
  className,
  label,
  icon,
  items,
  size = "default",
  tone = "primary",
  align = "end",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: {
  className?: string
  label: string
  icon: React.ReactNode
  items: FabMenuItem[]
  size?: Exclude<FabSize, "compact">
  tone?: FabTone
  align?: FabPlacement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const rootRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const listId = React.useId()

  const setOpen = React.useCallback(
    (next: boolean) => {
      setOpenState(next)
      onOpenChange?.(next)
    },
    [onOpenChange]
  )

  React.useEffect(() => {
    if (!open) {
      return
    }

    function closesOnOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", closesOnOutside)
    return () => document.removeEventListener("pointerdown", closesOnOutside)
  }, [open, setOpen])

  function movesFocus(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }

    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return
    }

    const actions = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>("button:enabled") ??
        []
    )

    if (actions.length === 0) {
      return
    }

    event.preventDefault()
    // The list renders bottom-up, so ArrowUp walks toward the last action.
    const index = actions.indexOf(document.activeElement as HTMLButtonElement)
    const step = event.key === "ArrowUp" ? 1 : -1
    const next =
      index === -1
        ? step === 1
          ? 0
          : actions.length - 1
        : (index + step + actions.length) % actions.length

    actions[next]?.focus()
  }

  const itemHeight = size === "default" ? "h-14" : "h-16"

  return (
    <div
      ref={rootRef}
      data-slot="fab-menu"
      data-open={open || undefined}
      onKeyDown={movesFocus}
      className={cn(
        "flex flex-col-reverse gap-2",
        align === "end" && "items-end",
        align === "start" && "items-start",
        align === "center" && "items-center",
        className
      )}
    >
      <Fab
        ref={triggerRef}
        label={open ? `Close ${label.toLowerCase()}` : label}
        icon={
          <span className="grid [&>*]:col-start-1 [&>*]:row-start-1 [&>*]:transition-[rotate,opacity,scale] [&>*]:duration-300">
            <span
              className={cn("flex", open && "scale-50 rotate-90 opacity-0")}
            >
              {icon}
            </span>
            <XIcon className={cn(!open && "scale-50 -rotate-90 opacity-0")} />
          </span>
        }
        size={size}
        tone={open ? "primary" : tone}
        aria-expanded={open}
        aria-controls={listId}
        className={cn(open && "rounded-full")}
        onClick={() => setOpen(!open)}
      />
      <div
        ref={listRef}
        id={listId}
        role="group"
        aria-label={label}
        inert={!open}
        className={cn(
          "flex flex-col-reverse gap-1",
          align === "end" && "items-end",
          align === "start" && "items-start",
          align === "center" && "items-center"
        )}
      >
        {items.map((item, index) => (
          <button
            key={item.label}
            data-slot="fab-menu-item"
            type="button"
            disabled={item.disabled}
            // Stagger outward from the FAB on open, back in on close.
            style={{
              transitionDelay: `${(open ? index : items.length - 1 - index) * 30}ms`,
            }}
            className={cn(
              "relative isolate inline-flex items-center gap-2 overflow-hidden rounded-full px-5 text-base font-medium whitespace-nowrap shadow-md transition-[translate,opacity,scale] duration-200 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 [&_svg]:size-5",
              "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-current before:opacity-0 before:transition-opacity hover:before:opacity-[0.08] focus-visible:before:opacity-10 active:before:opacity-10",
              itemHeight,
              tone === "surface"
                ? "border border-border/80 bg-card text-foreground"
                : tone === "secondary"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground",
              open
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-3 scale-95 opacity-0"
            )}
            onClick={() => {
              item.onSelect?.()
              setOpen(false)
              triggerRef.current?.focus()
            }}
          >
            <span aria-hidden className="flex shrink-0">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Scroll state for M3 FAB behavior: `collapsed` once the page leaves the top
 * (shrink an extended FAB to its icon) and `hidden` while scrolling down
 * (slide a FabStack away). Watches `target`, or the window when omitted.
 */
function useFabScroll(
  target?: React.RefObject<HTMLElement | null>,
  { threshold = 8 }: { threshold?: number } = {}
) {
  const [state, setState] = React.useState({ collapsed: false, hidden: false })

  React.useEffect(() => {
    const element = target?.current
    const source: HTMLElement | Window = element ?? window
    const readsTop = () => (element ? element.scrollTop : window.scrollY)
    let last = readsTop()

    function tracksScroll() {
      const top = readsTop()
      const delta = top - last

      if (Math.abs(delta) < threshold) {
        return
      }

      last = top
      setState({ collapsed: top > threshold, hidden: delta > 0 && top > 0 })
    }

    source.addEventListener("scroll", tracksScroll, { passive: true })
    return () => source.removeEventListener("scroll", tracksScroll)
  }, [target, threshold])

  return state
}

export { Fab, FabMenu, FabStack, fabVariants, useFabScroll }
