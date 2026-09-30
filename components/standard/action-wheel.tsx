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
export type ActionWheelLabels = "always" | "hover" | "none"

export type ActionWheelItem = {
  label: string
  icon: React.ReactNode
  /** Tooltip body when labels are off. Defaults to the label. */
  hint?: string
  onSelect?: () => void
  disabled?: boolean
  /** Per-action override, e.g. a muted color for a pinned smart action. */
  className?: string
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
 * and a label card pushed outward from each one. `startAngle` is in degrees clockwise from
 * 12 o'clock, and `sweep` below 360 spreads the actions over an arc.
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
  radius: radiusProp,
  startAngle = 0,
  sweep = 360,
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
  /** Distance in px from the center to each action's center. */
  radius?: number
  startAngle?: number
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
  const radius = radiusProp ?? metrics.radius
  const box = radius * 2 + metrics.item
  const triggerSize = open || triggerless ? metrics.trigger : metrics.item

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

    // Window capture runs before a host dialog's document listener, so
    // Escape folds the wheel without also dismissing the dialog under it.
    function closesOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return
      }

      event.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener("pointerdown", closesOnOutside)
    window.addEventListener("keydown", closesOnEscape, true)
    return () => {
      document.removeEventListener("pointerdown", closesOnOutside)
      window.removeEventListener("keydown", closesOnEscape, true)
    }
  }, [open, setOpen])

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
    )

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

  return (
    <div
      ref={rootRef}
      data-slot="action-wheel"
      data-size={size}
      data-open={open || undefined}
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
          const degrees = startAngle + (index * Math.min(sweep, 360)) / gaps
          const angle = (degrees * Math.PI) / 180
          const sin = Math.sin(angle)
          const cos = Math.cos(angle)
          const delay = (open ? index : items.length - 1 - index) * 25

          const button = (
            <button
              data-slot="action-wheel-item"
              type="button"
              aria-label={item.label}
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
                item.className
              )}
              onClick={() => {
                item.onSelect?.()
                setOpen(false)
                triggerRef.current?.focus()
              }}
            >
              <span aria-hidden className="relative flex">
                {item.icon}
              </span>
            </button>
          )

          return (
            <div
              key={item.label}
              data-slot="action-wheel-slot"
              style={{
                transitionDelay: `${delay}ms`,
                translate: open
                  ? `${fixed(sin * radius)}px ${fixed(-cos * radius)}px`
                  : "0 0",
              }}
              className={cn(
                "group/wheel-item absolute top-1/2 left-1/2 size-0 transition-[translate,scale,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                !open && "scale-50 opacity-0"
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
                    labels === "hover"
                      ? "opacity-0 group-focus-within/wheel-item:opacity-100 group-hover/wheel-item:opacity-100"
                      : "group-hover/wheel-item:shadow-lg"
                  )}
                >
                  {item.label}
                </span>
              )}
            </div>
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
          open || triggerless
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
              (open || triggerless) && "scale-50 rotate-90 opacity-0"
            )}
          >
            {icon}
          </span>
          <XIcon
            aria-hidden
            className={cn(
              !open && !triggerless && "scale-50 -rotate-90 opacity-0"
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
