import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircleIcon } from "lucide-react"
import { cn } from "cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:not-disabled:translate-y-px disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        outline:
          "border border-input bg-transparent hover:bg-muted hover:text-foreground active:bg-muted/70",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/70",
        danger:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        default: "h-8",
        lg: "h-9 px-4",
      },
    },
    defaultVariants: {
      tone: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  tone = "default",
  size = "default",
  type = "button",
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner and blocks clicks while an action runs. */
    loading?: boolean
  }) {
  return (
    <button
      data-slot="button"
      data-tone={tone}
      data-size={size}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ tone, size }), className)}
      {...props}
    >
      {loading ? (
        <LoaderCircleIcon
          aria-hidden
          className={cn("shrink-0 animate-spin", size === "sm" ? "size-3.5" : "size-4")}
        />
      ) : null}
      {children}
    </button>
  )
}

export { Button, buttonVariants }
