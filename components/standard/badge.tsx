import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

type BadgeTone =
  "default" | "quiet" | "outline" | "danger" | "success" | "warning" | "info"
type BadgeAppearance = "solid" | "soft" | "outline"

// Colour per appearance and tone. Solid fills with the tone, soft tints the
// background and colours the text, outline draws a tone-coloured border.
const TONE_CLASSES: Record<BadgeAppearance, Record<BadgeTone, string>> = {
  solid: {
    default: "border-transparent bg-primary text-primary-foreground",
    quiet: "border-transparent bg-secondary text-secondary-foreground",
    outline: "border-border bg-transparent text-foreground",
    danger: "border-transparent bg-destructive text-white",
    success: "border-transparent bg-emerald-600 text-white",
    warning: "border-transparent bg-amber-400 text-amber-950",
    info: "border-transparent bg-sky-600 text-white",
  },
  soft: {
    default: "border-transparent bg-primary/10 text-primary",
    quiet: "border-transparent bg-muted text-muted-foreground",
    outline: "border-border bg-transparent text-foreground",
    danger:
      "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20",
    success:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    warning:
      "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
    info: "border-transparent bg-sky-500/15 text-sky-700 dark:text-sky-400",
  },
  outline: {
    default: "border-primary/50 bg-transparent text-primary",
    quiet: "border-border bg-transparent text-muted-foreground",
    outline: "border-border bg-transparent text-foreground",
    danger: "border-destructive/50 bg-transparent text-destructive",
    success:
      "border-emerald-500/50 bg-transparent text-emerald-700 dark:text-emerald-400",
    warning:
      "border-amber-500/50 bg-transparent text-amber-700 dark:text-amber-400",
    info: "border-sky-500/50 bg-transparent text-sky-700 dark:text-sky-400",
  },
}

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      // Colours come from compoundVariants below (tone x appearance).
      tone: {
        default: "",
        quiet: "",
        outline: "",
        danger: "",
        success: "",
        warning: "",
        info: "",
      },
      appearance: {
        solid: "",
        soft: "",
        outline: "",
      },
      size: {
        sm: "px-1.5 py-px text-[11px] [&_svg]:size-2.5",
        default: "px-2 py-0.5 text-xs [&_svg]:size-3",
        lg: "px-3 py-0.5 text-xs [&_svg]:size-3.5",
      },
      // Circle is a round count that scales with the surrounding text, so it
      // overrides the size padding and font size. Keep it after `size`.
      shape: {
        default: "",
        circle:
          "h-[1.5em] min-w-[1.5em] justify-center px-[0.25em] py-0 text-[0.75em] leading-none font-semibold tabular-nums",
      },
    },
    compoundVariants: (
      Object.entries(TONE_CLASSES) as [
        BadgeAppearance,
        Record<BadgeTone, string>,
      ][]
    ).flatMap(([appearance, tones]) =>
      (Object.entries(tones) as [BadgeTone, string][]).map(
        ([tone, className]) => ({ appearance, tone, className })
      )
    ),
    defaultVariants: {
      tone: "default",
      appearance: "solid",
      size: "default",
      shape: "default",
    },
  }
)

/**
 * Short label or count. `leading` / `trailing` hold an icon or other content
 * beside the text; `dot` adds a small status dot in the text colour.
 * `shape="circle"` makes a round count that scales with the text around it.
 */
function Badge({
  className,
  tone = "default",
  appearance = "solid",
  size = "default",
  shape = "default",
  dot = false,
  leading,
  trailing,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    /** Small leading status dot in the text colour. */
    dot?: boolean
    leading?: React.ReactNode
    trailing?: React.ReactNode
  }) {
  return (
    <span
      data-slot="badge"
      data-tone={tone}
      data-appearance={appearance}
      data-size={size}
      data-shape={shape}
      className={cn(
        badgeVariants({ tone, appearance, size, shape }),
        className
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          data-slot="badge-dot"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      ) : null}
      {leading}
      {children}
      {trailing}
    </span>
  )
}

export { Badge, badgeVariants }
