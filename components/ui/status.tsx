import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import {
  CheckIcon,
  CircleQuestionMarkIcon,
  Loader2Icon,
  MinusIcon,
  XIcon,
} from "lucide-react"

const statusVariants = cva(
  "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive:
          "bg-destructive/10 text-destructive dark:bg-destructive/20",
        outline: "border-border text-foreground",
        ghost: "text-foreground",
        // Colored states: tinted background + tinted icon, text stays foreground.
        success:
          "bg-emerald-500/15 text-foreground dark:bg-emerald-500/20 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400",
        error:
          "bg-red-500/15 text-foreground dark:bg-red-500/20 [&>svg]:text-red-600 dark:[&>svg]:text-red-400",
        warning:
          "bg-amber-500/15 text-foreground dark:bg-amber-500/20 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
        info:
          "bg-sky-500/15 text-foreground dark:bg-sky-500/20 [&>svg]:text-sky-600 dark:[&>svg]:text-sky-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type StatusVariant = NonNullable<VariantProps<typeof statusVariants>["variant"]>

type StatusStateConfig = {
  /** Leading icon. Omit or pass `null` for no icon. */
  icon?: React.ReactElement | null
  /** Spin the icon, like a loader. */
  spin?: boolean
  /** Mark the pill as busy (`role="status"` + `aria-busy`). */
  busy?: boolean
  /** Pill look (background + icon tint) for this state unless `variant` is passed. */
  variant?: StatusVariant
}

const statusStates = {
  none: {},
  loading: { icon: <Loader2Icon />, spin: true, busy: true },
  success: { icon: <CheckIcon />, variant: "success" },
  error: { icon: <XIcon />, variant: "error" },
  unknown: { icon: <CircleQuestionMarkIcon />, variant: "warning" },
  neutral: { icon: <MinusIcon />, variant: "secondary" },
} satisfies Record<string, StatusStateConfig>

type StatusStateName = keyof typeof statusStates

const iconClass = "animate-in fade-in zoom-in-50 duration-200"

/**
 * A pill with a leading state icon and background. `state` picks the icon and
 * tint (success green, error red, ...); the text color never changes.
 *
 * Add your own states with `states` (or spread `statusStates` into a shared
 * map), or replace one icon with `icon` (`icon={null}` hides it).
 *
 * <Status state="review" states={{ review: { icon: <EyeIcon /> } }}>Review</Status>
 */
function Status<K extends string = StatusStateName>({
  className,
  state = "none" as K,
  states,
  variant,
  icon,
  children,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  variant?: StatusVariant
  state?: K | StatusStateName
  states?: Partial<Record<K, StatusStateConfig>>
  icon?: React.ReactNode
  children?: React.ReactNode
}) {
  const config: StatusStateConfig =
    (states as Record<string, StatusStateConfig> | undefined)?.[state] ??
    (statusStates as Record<string, StatusStateConfig>)[state] ??
    {}

  let leading: React.ReactNode = icon
  if (icon === undefined && React.isValidElement<{ className?: string }>(config.icon)) {
    leading = React.cloneElement(config.icon, {
      key: state,
      "data-icon": "inline-start",
      "aria-hidden": true,
      className: cn(
        config.spin ? "animate-spin" : iconClass,
        config.icon.props.className
      ),
    } as React.Attributes)
  }

  return (
    <span
      data-slot="status"
      data-state={state}
      role={config.busy ? "status" : undefined}
      aria-busy={config.busy || undefined}
      className={cn(
        statusVariants({ variant: variant ?? config.variant }),
        className
      )}
      {...props}
    >
      {leading}
      {children}
    </span>
  )
}

export { Status, statusStates, statusVariants }
export type { StatusStateConfig, StatusStateName, StatusVariant }
