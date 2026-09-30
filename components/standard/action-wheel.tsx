"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { PlusIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { Tooltip } from "@/components/standard/tooltip"

export type ActionWheelSize = "compact" | "default" | "large"
export type ActionWheelTone =
  "solid" | "violet" | "primary" | "secondary" | "surface"
/** `always` pins a card beside every action, `hover` reveals it on hover or focus. */
/** `wheel` rings a small center close button; `arc` fans out from a launcher. */
export type ActionWheelVariant = "wheel" | "arc"
export type ActionWheelDirection =
  | "up"
  | "up-right"
  | "right"
  | "down-right"
  | "down"
  | "down-left"
  | "left"
  | "up-left"

/** Center of the fan in degrees clockwise from 12 o'clock. */
const ARC_DIRECTION_DEGREES: Record<ActionWheelDirection, number> = {
  up: 0,
  "up-right": 45,
  right: 90,
  "down-right": 135,
  down: 180,
  "down-left": 225,
  left: 270,
  "up-left": 315,
}

export type ActionWheelLabels = "always" | "hover" | "none"
/** `click` toggles a nested arc; `hover` also opens it when the mouse rests on its parent. */
export type ActionWheelSubmenuTrigger = "click" | "hover"

export type ActionWheelItem = {
  label: string
  icon: React.ReactNode
  /** Tooltip body when labels are off. Defaults to the label. */
  hint?: string
  onSelect?: () => void
  disabled?: boolean
  /** Per-action override, e.g. a muted color for a pinned smart action. */
  className?: string
  /** Nested actions. Clicking this action fans them out on an outer arc. */
  items?: ActionWheelItem[]
}

/** Trigger, action, and ring radius in px for each size. */
const WHEEL_METRICS: Record<
  ActionWheelSize,
  { trigger: number; item: number; radius: number; icon: string; text: string }
> = {
  compact: {
    trigger: 24,
    item: 40,
    radius: 68,
    icon: "[&_svg]:size-4",
    text: "text-xs",
  },
  default: {
    trigger: 30,
    item: 52,
    radius: 92,
    icon: "[&_svg]:size-5",
    text: "text-sm",
  },
  large: {
    trigger: 36,
    item: 64,
    radius: 116,
    icon: "[&_svg]:size-6",
    text: "text-base",
  },
}

const WHEEL_TONES: Record<ActionWheelTone, string> = {
  solid: "bg-foreground text-background",
  violet: "bg-indigo-900 text-white",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  surface: "border border-border/80 bg-card text-foreground",
}

// Space between an action's edge and its label card.
const LABEL_GAP = 12

/** Trig output as a fixed string, so server and client styles match. */
function fixed(value: number) {
  return value.toFixed(2)
}

/**
 * Radial action menu modeled on the Logi Options+ Actions Ring: a small gray
 * close button in the middle, a ring of solid circular actions around it,
 * and a label card pushed outward from each one. An action with `items`
 * opens a submenu: its children fan out on an outer arc centered on it.
 * `startAngle` is in degrees clockwise from 12 o'clock, and `sweep` below
 * 360 spreads the actions over an arc. `variant="arc"` drops the ring for a
 * launcher that stays put and fans its actions out toward `direction`.
 * Arrow keys walk the ring, Escape or a click outside closes it.
 */
function ActionWheel({
  className,
  label,
  icon = <PlusIcon />,
  items,
  size = "default",
  tone = "solid",
  labels = "always",
  submenuTrigger = "click",
  radius: radiusProp,
  variant = "wheel",
  direction = "up",
  startAngle: startAngleProp,
  sweep: sweepProp,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  triggerless = false,
}: {
  className?: string
  /** Accessible name for the trigger and the action group. */
  label: string
  icon?: React.ReactNode
  items: ActionWheelItem[]
  size?: ActionWheelSize
  tone?: ActionWheelTone
  labels?: ActionWheelLabels
  /** How nested actions open. Touch and keyboard always open on click. */
  submenuTrigger?: ActionWheelSubmenuTrigger
  /** Distance in px from the center to each action's center. */
  radius?: number
  variant?: ActionWheelVariant
  /** Arc only: which way the fan opens from the launcher. */
  direction?: ActionWheelDirection
  /** Overrides the ring start. Arcs derive it from `direction`. */
  startAngle?: number
  /** Degrees the actions span. Defaults to 360 for a wheel, 90 for an arc. */
  sweep?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Hides the launcher while closed, for wheels opened some other way. */
  triggerless?: boolean
}) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const rootRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const ringRef = React.useRef<HTMLDivElement>(null)
  const ringId = React.useId()
  const metrics = WHEEL_METRICS[size]
  const arc = variant === "arc"
  const sweep = sweepProp ?? (arc ? 90 : 360)
  const startAngle =
    startAngleProp ?? (arc ? ARC_DIRECTION_DEGREES[direction] - sweep / 2 : 0)
  // Tight arcs grow the radius until neighbors clear by 15% of their size.
  const slotStep =
    Math.min(sweep, 360) /
    (sweep >= 360 ? items.length : Math.max(items.length - 1, 1))
  const fitRadius =
    items.length > 1
      ? (metrics.item * 1.15) / (2 * Math.sin((slotStep * Math.PI) / 360))
      : 0
  const radius = radiusProp ?? Math.max(metrics.radius, Math.ceil(fitRadius))
  // An arc lays out like its launcher and lets the fan overflow around it.
  const box = arc ? metrics.item : radius * 2 + metrics.item
  // A wheel shrinks its launcher into the small gray close button.
  const compactTrigger = !arc && (open || triggerless)
  const triggerSize = compactTrigger ? metrics.trigger : metrics.item

  const [expanded, setExpanded] = React.useState<number | null>(null)
  const hoverRef = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(hoverRef.current), [])

  // A short rest before switching, so sweeping across the ring to reach an
  // outer action does not flicker through every submenu on the way.
  function expandsOnHover(event: React.PointerEvent, next: number | null) {
    if (submenuTrigger !== "hover" || event.pointerType !== "mouse") {
      return
    }

    window.clearTimeout(hoverRef.current)
    hoverRef.current = window.setTimeout(() => setExpanded(next), 120)
  }

  const setOpen = React.useCallback(
    (next: boolean) => {
      window.clearTimeout(hoverRef.current)
      setOpenState(next)
      setExpanded(null)
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

    // Window capture runs before a host dialog's document listener, so
    // Escape folds the wheel without also dismissing the dialog under it.
    function closesOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return
      }

      event.stopPropagation()

      // Escape backs out of a submenu before it closes the wheel.
      if (expanded !== null) {
        const parent = ringRef.current?.querySelector<HTMLButtonElement>(
          `[data-slot="action-wheel-item"][data-index="${expanded}"]`
        )
        setExpanded(null)
        parent?.focus()
        return
      }

      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener("pointerdown", closesOnOutside)
    window.addEventListener("keydown", closesOnEscape, true)
    return () => {
      document.removeEventListener("pointerdown", closesOnOutside)
      window.removeEventListener("keydown", closesOnEscape, true)
    }
  }, [open, expanded, setOpen])

  // Without a launcher to click, move focus in so Escape and arrows work.
  React.useEffect(() => {
    if (open && triggerless) {
      triggerRef.current?.focus({ preventScroll: true })
    }
  }, [open, triggerless])

  function movesFocus(event: React.KeyboardEvent) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0

    if (step === 0 || !open) {
      return
    }

    const actions = Array.from(
      ringRef.current?.querySelectorAll<HTMLButtonElement>("button:enabled") ??
        []
    ).filter((action) => !action.closest("[inert]"))

    if (actions.length === 0) {
      return
    }

    event.preventDefault()
    const index = actions.indexOf(document.activeElement as HTMLButtonElement)
    const next =
      index === -1
        ? step === 1
          ? 0
          : actions.length - 1
        : (index + step + actions.length) % actions.length

    actions[next]?.focus()
  }

  // A full ring spaces every action evenly; an arc pins both ends.
  const fullRing = sweep >= 360
  const gaps = fullRing ? items.length : Math.max(items.length - 1, 1)
  const reach = metrics.item / 2 + LABEL_GAP
  const ringDegrees = (index: number) =>
    startAngle + (index * Math.min(sweep, 360)) / gaps

  // Nested actions sit one action-width further out, spaced so neighbors
  // clear each other by a fifth of their size.
  const outerRadius = radius + metrics.item + 12
  const arcStep =
    (2 * Math.asin(Math.min(1, (metrics.item * 1.2) / 2 / outerRadius)) * 180) /
    Math.PI

  const pointAt = (degrees: number, distance: number) => {
    const angle = (degrees * Math.PI) / 180
    return { sin: Math.sin(angle), cos: Math.cos(angle), distance }
  }

  function rendersSlot({
    item,
    slotKey,
    index,
    at,
    from,
    shown,
    delay,
    dimmed = false,
    labelHidden = false,
    parent = false,
    onActivate,
    onHover,
  }: {
    item: ActionWheelItem
    slotKey: string
    index?: number
    at: ReturnType<typeof pointAt>
    /** Where the slot folds back to while hidden. */
    from: { x: number; y: number }
    shown: boolean
    delay: number
    dimmed?: boolean
    labelHidden?: boolean
    parent?: boolean
    onActivate: () => void
    onHover?: (event: React.PointerEvent) => void
  }) {
    const { sin, cos, distance } = at
    const isExpanded = parent && index === expanded

    const button = (
      <button
        data-slot="action-wheel-item"
        data-index={index}
        data-expanded={isExpanded || undefined}
        type="button"
        aria-label={item.label}
        aria-haspopup={parent ? "true" : undefined}
        aria-expanded={parent ? isExpanded : undefined}
        disabled={item.disabled}
        style={{
          width: metrics.item,
          height: metrics.item,
          left: -metrics.item / 2,
          top: -metrics.item / 2,
        }}
        className={cn(
          "pointer-events-auto absolute isolate inline-flex items-center justify-center rounded-full shadow-md transition-[scale,box-shadow] duration-200 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
          "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-current before:opacity-0 before:transition-opacity hover:scale-105 hover:shadow-lg hover:before:opacity-[0.08] focus-visible:before:opacity-10 active:scale-95 active:before:opacity-10",
          metrics.icon,
          WHEEL_TONES[tone],
          isExpanded && "scale-105 shadow-lg before:opacity-10",
          item.className
        )}
        onClick={onActivate}
        onPointerEnter={onHover}
      >
        <span aria-hidden className="relative flex">
          {item.icon}
        </span>
      </button>
    )

    return (
      <div
        key={slotKey}
        data-slot="action-wheel-slot"
        inert={!shown}
        style={{
          transitionDelay: `${delay}ms`,
          translate: shown
            ? `${fixed(sin * distance)}px ${fixed(-cos * distance)}px`
            : `${fixed(from.x)}px ${fixed(from.y)}px`,
        }}
        className={cn(
          "group/wheel-item absolute top-1/2 left-1/2 size-0 transition-[translate,scale,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          !shown && "scale-50 opacity-0",
          shown && dimmed && "opacity-40 hover:opacity-100"
        )}
      >
        {labels === "none" ? (
          <Tooltip label={item.label} body={item.hint ?? item.label}>
            {button}
          </Tooltip>
        ) : (
          button
        )}
        {labels === "none" ? null : (
          <span
            aria-hidden
            data-slot="action-wheel-label"
            style={{
              left: `${fixed(sin * reach)}px`,
              top: `${fixed(-cos * reach)}px`,
              // Push the card outward so its near edge faces the action.
              transform: `translate(${fixed(-50 + 50 * sin)}%, ${fixed(-50 - 50 * cos)}%)`,
            }}
            className={cn(
              "pointer-events-none absolute max-w-44 truncate rounded-md border border-border/60 bg-card px-3 py-1.5 font-medium whitespace-nowrap text-card-foreground shadow-md transition-[opacity,box-shadow] duration-200",
              metrics.text,
              labelHidden
                ? "opacity-0"
                : labels === "hover"
                  ? "opacity-0 group-focus-within/wheel-item:opacity-100 group-hover/wheel-item:opacity-100"
                  : "group-hover/wheel-item:shadow-lg"
            )}
          >
            {item.label}
          </span>
        )}
      </div>
    )
  }

  function selects(item: ActionWheelItem) {
    item.onSelect?.()
    setOpen(false)
    triggerRef.current?.focus()
  }

  const submenu = expanded === null ? null : items[expanded]

  return (
    <div
      ref={rootRef}
      data-slot="action-wheel"
      data-size={size}
      data-variant={variant}
      data-open={open || undefined}
      data-expanded={submenu ? "" : undefined}
      onKeyDown={movesFocus}
      style={{ width: box, height: box }}
      className={cn("pointer-events-none relative shrink-0", className)}
    >
      <div
        ref={ringRef}
        id={ringId}
        role="group"
        aria-label={label}
        inert={!open}
        className="absolute inset-0"
      >
        {items.map((item, index) => {
          const hasChildren = Boolean(item.items?.length)

          return rendersSlot({
            item,
            slotKey: item.label,
            index,
            at: pointAt(ringDegrees(index), radius),
            from: { x: 0, y: 0 },
            shown: open,
            delay: (open ? index : items.length - 1 - index) * 25,
            dimmed: submenu !== null && index !== expanded,
            // The arc fans out over the ring's labels, so they step aside.
            labelHidden: submenu !== null,
            parent: hasChildren,
            onActivate: hasChildren
              ? () => {
                  window.clearTimeout(hoverRef.current)
                  // A hover-opened arc stays open on click instead of folding.
                  setExpanded(
                    index === expanded && submenuTrigger === "click"
                      ? null
                      : index
                  )
                }
              : () => selects(item),
            // Resting on a plain ring action folds any open arc away.
            onHover: (event) =>
              expandsOnHover(event, hasChildren ? index : null),
          })
        })}
        {items.map((item, index) => {
          const children = item.items ?? []
          const center = ringDegrees(index)
          const origin = pointAt(center, radius)
          const shown = open && index === expanded

          return children.map((child, childIndex) =>
            rendersSlot({
              item: child,
              slotKey: `${item.label}/${child.label}`,
              at: pointAt(
                center + (childIndex - (children.length - 1) / 2) * arcStep,
                outerRadius
              ),
              from: { x: origin.sin * radius, y: -origin.cos * radius },
              shown,
              delay:
                (shown ? childIndex : children.length - 1 - childIndex) * 30,
              onActivate: () => selects(child),
              // Reaching the arc cancels a pending switch from the ring.
              onHover: () => window.clearTimeout(hoverRef.current),
            })
          )
        })}
      </div>
      <button
        ref={triggerRef}
        data-slot="action-wheel-trigger"
        type="button"
        aria-label={open ? `Close ${label.toLowerCase()}` : label}
        aria-expanded={open}
        aria-controls={ringId}
        style={{
          width: triggerSize,
          height: triggerSize,
          marginLeft: -triggerSize / 2,
          marginTop: -triggerSize / 2,
        }}
        tabIndex={triggerless && !open ? -1 : undefined}
        className={cn(
          "pointer-events-auto absolute top-1/2 left-1/2 z-10 inline-flex items-center justify-center rounded-full transition-[width,height,margin,background-color,color,box-shadow,scale,opacity] duration-300 ease-out outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95",
          compactTrigger
            ? "bg-muted text-muted-foreground hover:text-foreground [&_svg]:size-3.5"
            : cn("shadow-md", metrics.icon, WHEEL_TONES[tone]),
          triggerless && !open && "pointer-events-none scale-0 opacity-0"
        )}
        onClick={() => setOpen(!open)}
      >
        <span className="grid [&>*]:col-start-1 [&>*]:row-start-1 [&>*]:transition-[rotate,opacity,scale] [&>*]:duration-300">
          <span
            aria-hidden
            className={cn(
              "flex",
              (open || (triggerless && !arc)) && "scale-50 rotate-90 opacity-0"
            )}
          >
            {icon}
          </span>
          <XIcon
            aria-hidden
            className={cn(
              !open && !(triggerless && !arc) && "scale-50 -rotate-90 opacity-0"
            )}
          />
        </span>
      </button>
    </div>
  )
}

// Matches the slot transition, so the ring can fold back in before unmounting.
const WHEEL_EXIT_MS = 300

/**
 * Opens an ActionWheel at the pointer on right-click, like the Logi Options+
 * ring on a mouse gesture. The wheel's center lands on the cursor and the
 * gray close button sits under it. Inside a modal dialog the wheel portals
 * into that dialog, so clicking an action does not count as outside it.
 */
function ActionWheelContextMenu({
  children,
  className,
  onOpenChange,
  ...wheelProps
}: Omit<
  React.ComponentProps<typeof ActionWheel>,
  "open" | "defaultOpen" | "className"
> & {
  children: React.ReactNode
  className?: string
}) {
  const [point, setPoint] = React.useState<{
    x: number
    y: number
    host: HTMLElement
  } | null>(null)
  const [open, setOpen] = React.useState(false)
  const exitRef = React.useRef<number | undefined>(undefined)
  const anchorRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => () => window.clearTimeout(exitRef.current), [])

  function opensAtPointer(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault()
    window.clearTimeout(exitRef.current)

    const dialog = event.currentTarget.closest<HTMLElement>('[role="dialog"]')
    const frame = (dialog ?? document.documentElement).getBoundingClientRect()

    setOpen(false)
    setPoint({
      x: event.clientX - frame.left + (dialog?.scrollLeft ?? 0),
      y: event.clientY - frame.top + (dialog?.scrollTop ?? 0),
      host: dialog ?? document.body,
    })
  }

  const onOpenChangeRef = React.useRef(onOpenChange)
  React.useLayoutEffect(() => {
    onOpenChangeRef.current = onOpenChange
  })

  // The wheel commits closed at the new point; flushing its styles before
  // opening lets the ring spring out from the cursor instead of popping in.
  React.useLayoutEffect(() => {
    if (!point) {
      return
    }

    anchorRef.current?.getBoundingClientRect()
    setOpen(true)
    onOpenChangeRef.current?.(true)
  }, [point])

  function closes(next: boolean) {
    if (next) {
      return
    }

    setOpen(false)
    onOpenChange?.(false)
    window.clearTimeout(exitRef.current)
    exitRef.current = window.setTimeout(() => setPoint(null), WHEEL_EXIT_MS)
  }

  return (
    <>
      <div
        data-slot="action-wheel-context-menu"
        data-open={open || undefined}
        onContextMenu={opensAtPointer}
        className={className}
      >
        {children}
      </div>
      {point
        ? createPortal(
            <div
              key={`${point.x},${point.y}`}
              ref={anchorRef}
              style={{ left: point.x, top: point.y }}
              className="pointer-events-none absolute z-50 size-0"
            >
              <ActionWheel
                {...wheelProps}
                className="-translate-x-1/2 -translate-y-1/2"
                triggerless
                open={open}
                onOpenChange={closes}
              />
            </div>,
            point.host
          )
        : null}
    </>
  )
}

export { ActionWheel, ActionWheelContextMenu }
