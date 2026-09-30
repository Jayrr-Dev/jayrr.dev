"use client"

import * as React from "react"
import { PlusIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { Tooltip } from "@/components/standard/tooltip"

export type ActionWheelSize = "compact" | "default" | "large"
export type ActionWheelTone = "inverse" | "surface" | "secondary"

export type ActionWheelItem = {
  label: string
  icon: React.ReactNode
  /** Tooltip body. Defaults to the label. */
  hint?: string
  onSelect?: () => void
  disabled?: boolean
}

/** Trigger, action, and ring radius in px for each size. */
const WHEEL_METRICS: Record<
  ActionWheelSize,
  { trigger: number; item: number; radius: number; icon: string }
> = {
  compact: { trigger: 28, item: 40, radius: 68, icon: "[&_svg]:size-4" },
  default: { trigger: 32, item: 48, radius: 84, icon: "[&_svg]:size-5" },
  large: { trigger: 40, item: 56, radius: 100, icon: "[&_svg]:size-6" },
}

const WHEEL_TONES: Record<ActionWheelTone, string> = {
  inverse: "bg-foreground/90 text-background",
  surface: "border border-border/80 bg-card text-foreground",
  secondary: "bg-secondary text-secondary-foreground",
}

/**
 * Radial action menu in the logictek style: a small center trigger that turns
 * into a red close button while a ring of circular actions fans out around it.
 * `startAngle` is in degrees clockwise from 12 o'clock and `sweep` below 360
 * spreads the actions over an arc, e.g. `sweep={90}` for a corner wheel.
 * Arrow keys walk the ring, Escape or a click outside closes it.
 */
function ActionWheel({
  className,
  label,
  icon = <PlusIcon />,
  items,
  size = "default",
  tone = "inverse",
  radius: radiusProp,
  startAngle = 0,
  sweep = 360,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: {
  className?: string
  /** Accessible name for the trigger and the action group. */
  label: string
  icon?: React.ReactNode
  items: ActionWheelItem[]
  size?: ActionWheelSize
  tone?: ActionWheelTone
  /** Distance in px from the center to each action's center. */
  radius?: number
  startAngle?: number
  sweep?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
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
        className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto"
      >
        {items.map((item, index) => {
          const angle =
            ((startAngle + (index * Math.min(sweep, 360)) / gaps) * Math.PI) /
            180
          const x = Math.sin(angle) * radius
          const y = -Math.cos(angle) * radius
          const delay = (open ? index : items.length - 1 - index) * 25

          return (
            <Tooltip
              key={item.label}
              label={item.label}
              body={item.hint ?? item.label}
            >
              <button
                data-slot="action-wheel-item"
                type="button"
                aria-label={item.label}
                disabled={item.disabled}
                style={{
                  width: metrics.item,
                  height: metrics.item,
                  marginLeft: -metrics.item / 2,
                  marginTop: -metrics.item / 2,
                  transitionDelay: `${delay}ms`,
                  translate: open ? `${x}px ${y}px` : "0 0",
                }}
                className={cn(
                  "absolute top-1/2 left-1/2 isolate inline-flex items-center justify-center overflow-hidden rounded-full shadow-md transition-[translate,scale,opacity,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
                  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-current before:opacity-0 before:transition-opacity hover:scale-110 hover:shadow-lg hover:before:opacity-[0.08] focus-visible:before:opacity-10 active:scale-95 active:before:opacity-10",
                  metrics.icon,
                  WHEEL_TONES[tone],
                  !open && "scale-50 opacity-0"
                )}
                onClick={() => {
                  item.onSelect?.()
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
              >
                <span aria-hidden className="flex">
                  {item.icon}
                </span>
              </button>
            </Tooltip>
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
          width: metrics.trigger,
          height: metrics.trigger,
          marginLeft: -metrics.trigger / 2,
          marginTop: -metrics.trigger / 2,
        }}
        className={cn(
          "pointer-events-auto absolute top-1/2 left-1/2 z-10 inline-flex items-center justify-center rounded-full shadow-md transition-[background-color,color,scale] duration-200 ease-out outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 [&_svg]:size-3.5",
          open ? "bg-destructive text-white" : WHEEL_TONES[tone]
        )}
        onClick={() => setOpen(!open)}
      >
        <span className="grid [&>*]:col-start-1 [&>*]:row-start-1 [&>*]:transition-[rotate,opacity,scale] [&>*]:duration-300">
          <span
            aria-hidden
            className={cn("flex", open && "scale-50 rotate-90 opacity-0")}
          >
            {icon}
          </span>
          <XIcon
            aria-hidden
            className={cn(!open && "scale-50 -rotate-90 opacity-0")}
          />
        </span>
      </button>
    </div>
  )
}

export { ActionWheel }
