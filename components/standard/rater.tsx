"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "cn"
import { StarIcon } from "lucide-react"

import { FieldLabel } from "@/components/standard/field-label"
import { useControllableState } from "@/hooks/use-controllable-state"

type RaterTone =
  "default" | "quiet" | "outline" | "success" | "warning" | "info" | "danger"
type RaterSize = "xs" | "sm" | "default" | "lg" | "xl"

// Filled icons take the tone colour; outline draws strokes only.
const FILLED_TONE_CLASSES: Record<RaterTone, string> = {
  default: "text-primary [&_svg]:fill-current",
  quiet: "text-muted-foreground [&_svg]:fill-current",
  outline: "text-foreground",
  success: "text-success [&_svg]:fill-current",
  warning: "text-warning [&_svg]:fill-current",
  info: "text-info [&_svg]:fill-current",
  danger: "text-destructive [&_svg]:fill-current",
}

const raterItemVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center leading-none whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        xs: "text-sm [&_svg]:size-3",
        sm: "text-base [&_svg]:size-4",
        default: "text-xl [&_svg]:size-5",
        lg: "text-2xl [&_svg]:size-6",
        xl: "text-3xl [&_svg]:size-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type RaterProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "children"
> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Number of icons. */
  max?: number
  /** Smallest change: 1 for whole icons, 0.5 for halves. */
  step?: number
  size?: RaterSize
  tone?: RaterTone
  /** The icon to repeat, or one per position (0-based) for e.g. emoji faces. */
  icon?: React.ReactNode | ((index: number) => React.ReactNode)
  /** range: fill every icon up to the value. single: highlight only the chosen icon. */
  highlight?: "range" | "single"
  /** Shows the value without letting it change. */
  readOnly?: boolean
  disabled?: boolean
  /** Visible label above the icons. */
  label?: React.ReactNode
  /** Submits the value with a form under this name. */
  name?: string
  /** Screen-reader text for a value. Defaults to "3 out of 5". */
  getValueText?: (value: number, max: number) => string
}

function defaultValueText(value: number, max: number) {
  return `${value} out of ${max}`
}

function Rater({
  className,
  value,
  defaultValue,
  onValueChange,
  max = 5,
  step = 1,
  size = "default",
  tone = "default",
  icon = <StarIcon />,
  highlight = "range",
  readOnly = false,
  disabled = false,
  label,
  name,
  getValueText = defaultValueText,
  id,
  onKeyDown,
  onPointerLeave,
  ...props
}: RaterProps) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? 0,
    onChange: onValueChange,
  })
  const [hovered, setHovered] = React.useState<number | null>(null)
  const autoId = React.useId()
  const labelId = label != null ? `${autoId}-label` : undefined
  const raterId = id ?? autoId
  const rootRef = React.useRef<HTMLDivElement>(null)

  const interactive = !readOnly && !disabled
  const shown = interactive && hovered != null ? hovered : current

  function clamp(next: number) {
    return Math.min(max, Math.max(0, Math.round(next / step) * step))
  }

  // Value under the pointer: the icon's index plus the part of it covered,
  // rounded up to the step so the hovered icon always counts.
  function valueAt(event: React.PointerEvent | React.MouseEvent, index: number) {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 1
    const part = Math.max(step, Math.ceil(ratio / step) * step)
    return clamp(index + Math.min(1, part))
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || !interactive) {
      return
    }
    const moves: Record<string, number> = {
      ArrowRight: current + step,
      ArrowUp: current + step,
      ArrowLeft: current - step,
      ArrowDown: current - step,
      PageUp: current + 1,
      PageDown: current - 1,
      Home: 0,
      End: max,
    }
    if (!(event.key in moves)) {
      return
    }
    event.preventDefault()
    setHovered(null)
    setCurrent(clamp(moves[event.key]))
  }

  const valueText = getValueText(current, max)
  const selectedIndex = Math.ceil(shown) - 1

  const items = Array.from({ length: max }, (_, index) => {
    const glyph = typeof icon === "function" ? icon(index) : icon
    const fill = Math.min(1, Math.max(0, shown - index))
    const single = highlight === "single"
    const active = single ? index === selectedIndex : fill > 0

    return (
      <span
        key={index}
        data-slot="rater-item"
        data-active={active || undefined}
        className={cn(
          raterItemVariants({ size }),
          interactive && "cursor-pointer",
          single && "transition-transform",
          single && active && "scale-110"
        )}
        onPointerMove={
          interactive ? (event) => setHovered(valueAt(event, index)) : undefined
        }
        onClick={
          interactive
            ? (event) => {
                setCurrent(valueAt(event, index))
                rootRef.current?.focus()
              }
            : undefined
        }
      >
        {single ? (
          <span
            className={cn(
              "transition-[opacity,filter]",
              active
                ? FILLED_TONE_CLASSES[tone]
                : "text-muted-foreground opacity-40 grayscale"
            )}
          >
            {glyph}
          </span>
        ) : (
          <>
            <span
              className={cn(
                tone === "outline"
                  ? "text-muted-foreground/40"
                  : "text-muted-foreground/20 [&_svg]:fill-current"
              )}
            >
              {glyph}
            </span>
            <span
              className={cn(
                "absolute inset-y-0 left-0 flex items-center overflow-hidden",
                FILLED_TONE_CLASSES[tone]
              )}
              style={{ width: `${fill * 100}%` }}
            >
              {glyph}
            </span>
          </>
        )}
      </span>
    )
  })

  const control = (
    <div
      ref={rootRef}
      data-slot="rater"
      data-size={size}
      data-tone={tone}
      data-readonly={readOnly || undefined}
      data-disabled={disabled || undefined}
      id={raterId}
      {...(readOnly
        ? { role: "img", "aria-label": props["aria-label"] ?? valueText }
        : {
            role: "slider",
            tabIndex: disabled ? -1 : 0,
            "aria-valuemin": 0,
            "aria-valuemax": max,
            "aria-valuenow": current,
            "aria-valuetext": valueText,
            "aria-disabled": disabled || undefined,
          })}
      // A read-only rater names itself by the label followed by its value.
      aria-labelledby={
        labelId && readOnly ? `${labelId} ${raterId}` : labelId
      }
      {...props}
      className={cn(
        "inline-flex w-fit items-center gap-0.5 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        disabled && "cursor-not-allowed opacity-50",
        label == null && className
      )}
      onKeyDown={handleKeyDown}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        setHovered(null)
      }}
    >
      {items}
      {name ? <input type="hidden" name={name} value={current} /> : null}
    </div>
  )

  if (label == null) {
    return control
  }

  return (
    <div
      data-slot="rater-field"
      className={cn("flex flex-col gap-2", className)}
    >
      <FieldLabel
        id={labelId}
        className={cn(disabled && "opacity-50")}
        onClick={() => rootRef.current?.focus()}
      >
        {label}
      </FieldLabel>
      {control}
    </div>
  )
}

export { Rater, raterItemVariants }
export type { RaterProps, RaterSize, RaterTone }
