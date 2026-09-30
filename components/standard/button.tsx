import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircleIcon } from "lucide-react"
import { cn } from "cn"

import { NotificationBadge } from "@/components/standard/notification-badge"

const BUTTON_BOX = {
  xs: "size-6",
  sm: "size-7",
  default: "size-8",
  lg: "size-9",
} as const

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:not-disabled:translate-y-px disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        quiet: "bg-muted text-foreground hover:bg-muted/70 active:bg-muted/60",
        outline:
          "border border-input bg-transparent hover:bg-muted hover:text-foreground active:bg-muted/70",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/70",
        link: "bg-transparent text-primary underline-offset-4 hover:underline",
        success:
          "bg-success text-success-foreground hover:bg-success/90 active:bg-success/80",
        danger:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80",
        // For media and coloured surfaces: fills with the surrounding text
        // colour, and the label takes the opposite (see INVERSE_LABEL).
        inverse: "bg-current hover:bg-current/90 active:bg-current/80",
        "inverse-outline":
          "border border-current/40 bg-transparent hover:bg-current/10 active:bg-current/15",
      },
      size: {
        xs: "h-6 gap-1 rounded-md px-2 text-xs",
        sm: "h-7 px-2.5 text-xs",
        default: "h-8",
        lg: "h-9 px-4",
      },
      shape: {
        default: "",
        pill: "rounded-full",
        // Circle and square are square boxes (see compoundVariants), meant for icons.
        circle: "rounded-full px-0",
        square: "rounded-md px-0",
      },
      iconOnly: {
        true: "px-0",
        false: "",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    compoundVariants: [
      // A link reads as text: no box height or side padding.
      { tone: "link", class: "h-auto px-0" },
      // Icon-only, circle and square buttons are as wide as they are tall.
      ...(Object.keys(BUTTON_BOX) as (keyof typeof BUTTON_BOX)[]).flatMap(
        (size) => [
          { size, iconOnly: true, class: BUTTON_BOX[size] },
          { size, shape: "circle" as const, class: BUTTON_BOX[size] },
          { size, shape: "square" as const, class: BUTTON_BOX[size] },
        ]
      ),
    ],
    defaultVariants: {
      tone: "default",
      size: "default",
      shape: "default",
      iconOnly: false,
      block: false,
    },
  }
)

type ButtonOwnProps = Omit<
  VariantProps<typeof buttonVariants>,
  "iconOnly" | "block"
> & {
  /** Content before the label, usually an icon. */
  leading?: React.ReactNode
  /** Content after the label (and after `count`), usually an icon. */
  trailing?: React.ReactNode
  /** Number shown inline after the label as a notification badge. */
  count?: number
  /**
   * Square button that holds only an icon (the children). Give it an
   * `aria-label` for its accessible name.
   */
  iconOnly?: boolean
  /** Stretches to the full width of its container. */
  block?: boolean
  /**
   * Blocks clicks while an action runs. `true` shows a spinner before the
   * label (in place of `leading`); `"spin-icon"` spins the `leading` icon.
   */
  loading?: boolean | "spin-icon"
}

type ButtonProps = ButtonOwnProps &
  React.ComponentProps<"button"> & {
    /** Renders an `<a>` with the same look instead of a `<button>`. */
    href?: string
    target?: React.ComponentProps<"a">["target"]
    rel?: string
    download?: React.ComponentProps<"a">["download"]
  }

// An inverse button's fill is the surrounding text colour, so its label and
// icons are drawn in that colour and flipped to a neutral opposite.
const INVERSE_LABEL = {
  xs: "inline-flex items-center gap-1 grayscale invert",
  sm: "inline-flex items-center gap-1.5 grayscale invert",
  default: "inline-flex items-center gap-1.5 grayscale invert",
  lg: "inline-flex items-center gap-1.5 grayscale invert",
} as const

const SPINNER_SIZE = {
  xs: "size-3",
  sm: "size-3.5",
  default: "size-4",
  lg: "size-4",
} as const

function Button(allProps: ButtonProps) {
  const {
    className,
    tone = "default",
    size = "default",
    shape = "default",
    iconOnly = false,
    block = false,
    loading = false,
    leading,
    trailing,
    count,
    children,
    ...rest
  } = allProps
  const busy = loading !== false

  const spinner =
    loading === true ? (
      <LoaderCircleIcon
        aria-hidden
        className={cn("shrink-0 animate-spin", SPINNER_SIZE[size ?? "default"])}
      />
    ) : null
  // An icon-only button with no leading slot swaps its icon for the spinner.
  const spinnerReplacesBody = spinner !== null && iconOnly && leading == null

  const body = (
    <>
      {spinner && !spinnerReplacesBody ? (
        spinner
      ) : leading != null ? (
        <span
          data-slot="button-leading"
          className={cn(
            "inline-flex shrink-0",
            loading === "spin-icon" && "animate-spin"
          )}
        >
          {leading}
        </span>
      ) : null}
      {spinnerReplacesBody ? spinner : children}
      {count !== undefined ? (
        <NotificationBadge
          count={count}
          tone={tone === "default" ? "quiet" : "danger"}
          className={
            tone === "default" ? "bg-primary-foreground text-primary" : undefined
          }
        />
      ) : null}
      {trailing != null ? (
        <span data-slot="button-trailing" className="inline-flex shrink-0">
          {trailing}
        </span>
      ) : null}
    </>
  )
  const content =
    tone === "inverse" ? (
      <span
        data-slot="button-label"
        className={INVERSE_LABEL[size ?? "default"]}
      >
        {body}
      </span>
    ) : (
      body
    )

  const shared = {
    "data-tone": tone,
    "data-size": size,
    "data-shape": shape,
    "data-icon-only": iconOnly || undefined,
    "data-loading": busy ? String(loading) : undefined,
    "aria-busy": busy || undefined,
  }
  const classes = buttonVariants({ tone, size, shape, iconOnly, block })

  const {
    href,
    target,
    rel,
    download,
    type = "button",
    disabled,
    onClick,
    ref,
    ...native
  } = rest

  if (href !== undefined) {
    const inert = Boolean(disabled) || busy

    return (
      <a
        data-slot="button"
        {...shared}
        aria-disabled={inert || undefined}
        tabIndex={inert ? -1 : undefined}
        href={href}
        target={target}
        rel={rel}
        download={download}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cn(
          classes,
          "aria-disabled:pointer-events-none aria-disabled:opacity-50",
          className
        )}
        // Button-only attributes (form, value, …) have no meaning on a link.
        {...(native as React.ComponentProps<"a">)}
        onClick={(event) => {
          if (inert) {
            event.preventDefault()
            return
          }
          onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>)
        }}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      data-slot="button"
      {...shared}
      ref={ref}
      type={type}
      // A spinning icon keeps the button looking live, so it is not disabled;
      // its clicks are dropped below instead.
      disabled={disabled || loading === true}
      className={cn(classes, className)}
      {...native}
      onClick={(event) => {
        if (loading === "spin-icon") {
          return
        }
        onClick?.(event)
      }}
    >
      {content}
    </button>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
