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
  const withTip = tip ? <Tooltip content={tip}>{button}</Tooltip> : button

  if (badge === undefined) {
    return withTip
  }

  return (
    <ToolbarCountBadge count={badge} tone="danger">
      {withTip}
    </ToolbarCountBadge>
  )
}

type FabRow = "top" | "middle" | "bottom"

/** The eight edge and corner slots a FabStack can pin to. */
export type FabPosition = Exclude<`${FabRow}-${FabPlacement}`, "middle-center">

const FAB_ROWS: FabRow[] = ["top", "middle", "bottom"]
const FAB_COLUMNS: FabPlacement[] = ["start", "center", "end"]

// M3 keeps FABs 16px off the edges; the viewport also clears device insets.
const FAB_STACK_EDGE: Record<
  "viewport" | "container",
  Record<FabRow | FabPlacement, string>
> = {
  viewport: {
    top: "top-[max(1rem,env(safe-area-inset-top))]",
    middle: "top-1/2 -translate-y-1/2",
    bottom: "bottom-[max(1rem,env(safe-area-inset-bottom))]",
    start: "left-[max(1rem,env(safe-area-inset-left))] items-start",
    center: "left-1/2 -translate-x-1/2 items-center",
    end: "right-[max(1rem,env(safe-area-inset-right))] items-end",
  },
  container: {
    top: "top-4",
    middle: "top-1/2 -translate-y-1/2",
    bottom: "bottom-4",
    start: "left-4 items-start",
    center: "left-1/2 -translate-x-1/2 items-center",
    end: "right-4 items-end",
  },
}

// `hidden` slides the stack off whichever edge it sits against.
const FAB_STACK_HIDDEN: Record<FabPosition, string> = {
  "top-start": "-translate-y-[calc(100%+2rem)]",
  "top-center": "-translate-y-[calc(100%+2rem)]",
  "top-end": "-translate-y-[calc(100%+2rem)]",
  "middle-start": "-translate-x-[calc(100%+2rem)]",
  "middle-end": "translate-x-[calc(100%+2rem)]",
  "bottom-start": "translate-y-[calc(100%+2rem)]",
  "bottom-center": "translate-y-[calc(100%+2rem)]",
  "bottom-end": "translate-y-[calc(100%+2rem)]",
}

// Pointer travel before a press becomes a drag, so taps still click.
const FAB_DRAG_THRESHOLD = 6

function splitsPosition(position: FabPosition) {
  const [row, column] = position.split("-") as [FabRow, FabPlacement]
  return { row, column }
}

/** Snaps a point to the nearest slot, splitting the bounds into thirds. */
function snapsToPosition(x: number, y: number, bounds: DOMRect): FabPosition {
  const nx = (x - bounds.left) / bounds.width
  const ny = (y - bounds.top) / bounds.height
  const column = FAB_COLUMNS[Math.min(2, Math.max(0, Math.floor(nx * 3)))]
  const row = FAB_ROWS[Math.min(2, Math.max(0, Math.floor(ny * 3)))]

  if (row === "middle" && column === "center") {
    // The dead center has no slot: fall to whichever edge is closer.
    return Math.abs(nx - 0.5) > Math.abs(ny - 0.5)
      ? nx < 0.5
        ? "middle-start"
        : "middle-end"
      : ny < 0.5
        ? "top-center"
        : "bottom-center"
  }

  return `${row}-${column}` as FabPosition
}

/** Steps one slot along the 3×3 grid, hopping over the empty center. */
function stepsPosition(position: FabPosition, dx: number, dy: number) {
  const { row, column } = splitsPosition(position)
  let r = FAB_ROWS.indexOf(row)
  let c = FAB_COLUMNS.indexOf(column)

  do {
    r = Math.min(2, Math.max(0, r + dy))
    c = Math.min(2, Math.max(0, c + dx))
  } while (r === 1 && c === 1)

  return `${FAB_ROWS[r]}-${FAB_COLUMNS[c]}` as FabPosition
}

/**
 * Pins FABs to one of eight edge slots, stacked away from the edge from the
 * first child (utilitek's `flex-col-reverse` column, flipped along the top).
 * The column lets clicks through between buttons. `anchor="container"` pins
 * to the nearest positioned parent instead of the viewport. `hidden` slides
 * the stack off its edge, e.g. on scroll.
 *
 * `draggable` lets people fling the stack to another slot: it follows the
 * pointer, then snaps to the nearest corner or edge with a FLIP glide.
 * Alt + arrow keys step between slots from the keyboard.
 */
function FabStack({
  className,
  placement = "end",
  position: positionProp,
  defaultPosition,
  onPositionChange,
  anchor = "viewport",
  hidden = false,
  draggable = false,
  onPointerDown,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"div">, "draggable"> & {
  /** Bottom-row shorthand, used when no `position` is set. */
  placement?: FabPlacement
  position?: FabPosition
  defaultPosition?: FabPosition
  onPositionChange?: (position: FabPosition) => void
  anchor?: "viewport" | "container"
  hidden?: boolean
  draggable?: boolean
}) {
  const [positionState, setPositionState] = React.useState(defaultPosition)
  const position: FabPosition =
    positionProp ?? positionState ?? `bottom-${placement}`
  const uncontrolledPosition = positionProp === undefined
  const { row, column } = splitsPosition(position)

  const rootRef = React.useRef<HTMLDivElement>(null)
  // Where the stack sat on screen just before it moved slots, for FLIP.
  const flipFromRef = React.useRef<DOMRect | null>(null)
  const [dragging, setDragging] = React.useState(false)

  const movesTo = React.useCallback(
    (next: FabPosition, from: DOMRect) => {
      if (next === position) {
        return false
      }

      flipFromRef.current = from
      if (uncontrolledPosition) {
        setPositionState(next)
      }
      onPositionChange?.(next)
      return true
    },
    [position, uncontrolledPosition, onPositionChange]
  )

  React.useLayoutEffect(() => {
    const element = rootRef.current
    const from = flipFromRef.current
    flipFromRef.current = null

    if (!element || !from) {
      return
    }

    // Invert: jump back to where it was, then play the transform to zero.
    element.style.transition = "none"
    element.style.transform = ""
    const to = element.getBoundingClientRect()
    element.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px)`
    void element.offsetWidth
    element.style.transition = ""
    element.style.transform = ""
  }, [position])

  function startsDrag(event: React.PointerEvent<HTMLDivElement>) {
    onPointerDown?.(event)

    const element = rootRef.current
    if (
      !draggable ||
      hidden ||
      !element ||
      event.defaultPrevented ||
      event.button !== 0
    ) {
      return
    }

    const pointerId = event.pointerId
    const startX = event.clientX
    const startY = event.clientY
    let moved = false

    function follows(move: PointerEvent) {
      if (move.pointerId !== pointerId || !element) {
        return
      }

      const dx = move.clientX - startX
      const dy = move.clientY - startY

      if (!moved && Math.hypot(dx, dy) < FAB_DRAG_THRESHOLD) {
        return
      }

      if (!moved) {
        moved = true
        setDragging(true)
        element.style.transition = "none"
      }

      move.preventDefault()
      element.style.transform = `translate(${dx}px, ${dy}px)`
    }

    function drops(up: PointerEvent) {
      if (up.pointerId !== pointerId) {
        return
      }

      window.removeEventListener("pointermove", follows)
      window.removeEventListener("pointerup", drops)
      window.removeEventListener("pointercancel", drops)

      if (!moved || !element) {
        return
      }

      setDragging(false)
      // The release lands on a FAB, which would otherwise fire its click.
      function swallowsClick(click: MouseEvent) {
        click.stopPropagation()
        click.preventDefault()
      }
      window.addEventListener("click", swallowsClick, {
        capture: true,
        once: true,
      })
      setTimeout(
        () => window.removeEventListener("click", swallowsClick, true),
        0
      )

      const from = element.getBoundingClientRect()
      const bounds =
        anchor === "container" && element.offsetParent
          ? element.offsetParent.getBoundingClientRect()
          : new DOMRect(0, 0, window.innerWidth, window.innerHeight)
      const next =
        up.type === "pointercancel"
          ? position
          : snapsToPosition(
              from.left + from.width / 2,
              from.top + from.height / 2,
              bounds
            )

      if (!movesTo(next, from)) {
        // Same slot (or a controlled parent that said no): glide home.
        element.style.transition = ""
        element.style.transform = ""
      }
    }

    window.addEventListener("pointermove", follows)
    window.addEventListener("pointerup", drops)
    window.addEventListener("pointercancel", drops)
  }

  function stepsWithKeys(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)

    const element = rootRef.current
    if (!draggable || !event.altKey || event.defaultPrevented || !element) {
      return
    }

    const step: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }
    const delta = step[event.key]

    if (!delta) {
      return
    }

    event.preventDefault()
    movesTo(
      stepsPosition(position, delta[0], delta[1]),
      element.getBoundingClientRect()
    )
  }

  return (
    <div
      ref={rootRef}
      data-slot="fab-stack"
      data-placement={column}
      data-position={position}
      data-hidden={hidden || undefined}
      data-draggable={draggable || undefined}
      data-dragging={dragging || undefined}
      inert={hidden}
      onPointerDown={startsDrag}
      onKeyDown={stepsWithKeys}
      className={cn(
        "pointer-events-none z-30 flex gap-3 transition-[translate,opacity,transform] duration-300 ease-out [&>*]:pointer-events-auto",
        row === "top" ? "flex-col" : "flex-col-reverse",
        anchor === "viewport" ? "fixed" : "absolute",
        FAB_STACK_EDGE[anchor][row],
        FAB_STACK_EDGE[anchor][column],
        draggable && "[&>*]:cursor-grab [&>*]:touch-none",
        dragging && "[&>*]:cursor-grabbing",
        hidden && [FAB_STACK_HIDDEN[position], "opacity-0"],
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

const FAB_MENU_ALIGN: Record<FabPlacement | "auto", string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  // Follow a draggable FabStack as it moves between columns.
  auto: "items-end [[data-placement=start]_&]:items-start [[data-placement=center]_&]:items-center",
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
  align,
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
  /** Defaults to the enclosing FabStack's column, else `end`. */
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

    // Alt + arrows belong to a draggable FabStack moving between slots.
    if (
      event.altKey ||
      (event.key !== "ArrowUp" && event.key !== "ArrowDown")
    ) {
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
        // Along the top edge of a FabStack the menu drops down instead.
        "flex flex-col-reverse gap-2 [[data-position^=top]_&]:flex-col",
        FAB_MENU_ALIGN[align ?? "auto"],
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
          "flex flex-col-reverse gap-1 [[data-position^=top]_&]:flex-col",
          FAB_MENU_ALIGN[align ?? "auto"]
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
