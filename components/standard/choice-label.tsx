import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const choiceLabelVariants = cva(
  "flex cursor-pointer items-start gap-2 has-disabled:cursor-not-allowed has-disabled:opacity-50",
  {
    variants: {
      appearance: {
        default: "-mx-2 rounded-md px-2 py-1.5",
        // Bordered option tile that lights up while its control is checked.
        card: "rounded-lg border border-input p-3 transition-colors hover:bg-muted/40 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-aria-invalid:border-destructive",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
      },
    },
    defaultVariants: {
      appearance: "default",
      size: "default",
    },
  }
)

/**
 * The clickable label, and optional description, shared by Checkbox and
 * Radio. Internal: reach for those components instead.
 */
function ChoiceLabel({
  slot,
  className,
  appearance = "default",
  size = "default",
  control,
  label,
  description,
}: VariantProps<typeof choiceLabelVariants> & {
  /** data-slot for the label, e.g. "checkbox-label". */
  slot: string
  className?: string
  /** The input the label wraps. */
  control: React.ReactNode
  label: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <label
      data-slot={slot}
      data-appearance={appearance}
      className={cn(choiceLabelVariants({ appearance, size }), className)}
    >
      {control}
      <span className="flex flex-col gap-0.5 leading-snug">
        <span className={cn(appearance === "card" && "font-medium")}>
          {label}
        </span>
        {description ? (
          <span
            className={cn(
              "text-muted-foreground",
              size === "sm" ? "text-[0.6875rem]" : "text-xs"
            )}
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}

export { ChoiceLabel, choiceLabelVariants }
