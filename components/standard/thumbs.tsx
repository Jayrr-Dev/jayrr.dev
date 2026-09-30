"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "cn"
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"

import { useControllableState } from "@/hooks/use-controllable-state"

type ThumbsValue = "up" | "down" | null
type ThumbsSize = "sm" | "default" | "lg"

const thumbsButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1 rounded-md text-muted-foreground tabular-nums transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-7 min-w-7 px-1.5 text-xs [&_svg]:size-3.5",
        default: "h-8 min-w-8 px-2 text-sm [&_svg]:size-4",
        lg: "h-9 min-w-9 px-2.5 text-sm [&_svg]:size-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

// A chosen thumb fills its icon: up in the primary colour, down in danger.
const ACTIVE_CLASSES = {
  up: "text-primary hover:text-primary [&_svg]:fill-current",
  down: "text-destructive hover:text-destructive [&_svg]:fill-current",
} as const

type ThumbsProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "children"
> & {
  value?: ThumbsValue
  defaultValue?: ThumbsValue
  /** Clicking the chosen thumb again clears it to `null`. */
  onValueChange?: (value: ThumbsValue) => void
  size?: ThumbsSize
  disabled?: boolean
  /** Counts shown beside each icon. */
  counts?: { up?: number; down?: number }
  /** Accessible names for the two buttons. */
  upLabel?: string
  downLabel?: string
}

/**
 * Thumbs up / thumbs down feedback. Each thumb is a pressed-state toggle;
 * picking one clears the other.
 */
function Thumbs({
  className,
  value,
  defaultValue,
  onValueChange,
  size = "default",
  disabled = false,
  counts,
  upLabel = "Thumbs up",
  downLabel = "Thumbs down",
  ...props
}: ThumbsProps) {
  const [current, setCurrent] = useControllableState<ThumbsValue>({
    value,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  })

  const thumbs = [
    { key: "up", icon: <ThumbsUpIcon />, label: upLabel },
    { key: "down", icon: <ThumbsDownIcon />, label: downLabel },
  ] as const

  return (
    <div
      role="group"
      data-slot="thumbs"
      data-size={size}
      data-value={current ?? undefined}
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {thumbs.map(({ key, icon, label }) => {
        const pressed = current === key
        const count = counts?.[key]
        return (
          <button
            key={key}
            type="button"
            data-slot={`thumbs-${key}`}
            aria-label={label}
            aria-pressed={pressed}
            disabled={disabled}
            className={cn(
              thumbsButtonVariants({ size }),
              pressed && ACTIVE_CLASSES[key]
            )}
            onClick={() => setCurrent(pressed ? null : key)}
          >
            {icon}
            {count != null ? <span>{count}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

export { Thumbs, thumbsButtonVariants }
export type { ThumbsProps, ThumbsSize, ThumbsValue }
