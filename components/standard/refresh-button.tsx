import {
  RefreshCcwDotIcon,
  RefreshCcwIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  RotateCwIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

const REFRESH_ICONS = {
  "refresh-cw": RefreshCwIcon,
  "refresh-ccw": RefreshCcwIcon,
  "refresh-ccw-dot": RefreshCcwDotIcon,
  "rotate-cw": RotateCwIcon,
  "rotate-ccw": RotateCcwIcon,
} satisfies Record<string, LucideIcon>

const ICON_SIZE = {
  xs: "size-3",
  sm: "size-3.5",
  default: "size-4",
  lg: "size-4",
} as const

/** Seconds per full turn while refreshing. */
const SPIN_DURATION = {
  slow: "2s",
  default: "1s",
  fast: "0.5s",
} as const

type RefreshIcon = keyof typeof REFRESH_ICONS

/** Outline refresh action whose icon spins while `refreshing`. */
function RefreshButton({
  className,
  style,
  icon = "refresh-cw",
  size = "sm",
  speed = "default",
  iconOnly = false,
  refreshing = false,
  loading,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> & {
  /** A named arrow, or any icon node. */
  icon?: RefreshIcon | React.ReactNode
  size?: keyof typeof ICON_SIZE
  /** How fast the icon turns while `refreshing`. */
  speed?: keyof typeof SPIN_DURATION
  iconOnly?: boolean
  refreshing?: boolean
}) {
  const Icon =
    typeof icon === "string" && icon in REFRESH_ICONS
      ? REFRESH_ICONS[icon as RefreshIcon]
      : null

  return (
    <Button
      data-slot="refresh-button"
      data-refreshing={refreshing || undefined}
      data-speed={speed}
      tone="outline"
      size={size}
      shape={iconOnly ? "circle" : undefined}
      iconOnly={iconOnly}
      aria-label="Refresh"
      leading={
        Icon ? <Icon aria-hidden className={ICON_SIZE[size]} /> : icon
      }
      loading={refreshing ? "spin-icon" : loading}
      className={cn(
        // eslint-disable-next-line shadcn/no-arbitrary-values -- Button owns the spinning span; the speed reaches it through a custom property.
        "[&_[data-slot=button-leading]]:[animation-duration:var(--refresh-spin)]",
        iconOnly && size === "sm" && "size-8",
        className
      )}
      style={
        {
          "--refresh-spin": SPIN_DURATION[speed],
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {iconOnly ? null : (children ?? "Refresh")}
    </Button>
  )
}

export { RefreshButton, type RefreshIcon }
