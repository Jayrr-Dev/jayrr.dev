import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"

import { Spinner } from "@/components/ui/spinner"

const loadingStateVariants = cva(
  "flex items-center gap-2 text-sm text-muted-foreground",
  {
    variants: {
      layout: {
        inline: "",
        // Centred in its own block, e.g. an empty panel while it loads.
        block: "w-full flex-col justify-center py-8",
        // Covers the nearest positioned parent with a blurred scrim.
        overlay:
          "absolute inset-0 z-10 flex-col justify-center rounded-[inherit] bg-background/60 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      layout: "inline",
    },
  }
)

function LoadingState({
  className,
  label = "Loading",
  layout = "inline",
  done = false,
  doneLabel = "Done",
  doneDismissAfter,
}: {
  className?: string
  label?: string
  /** Shows a check and `doneLabel` in place of the spinner. */
  done?: boolean
  doneLabel?: string
  /** When done, fades the check out after this many ms; the label stays. */
  doneDismissAfter?: number
} & VariantProps<typeof loadingStateVariants>) {
  const dismisses = done && doneDismissAfter != null
  return (
    <div
      data-slot="loading-state"
      data-layout={layout}
      data-state={done ? "done" : "loading"}
      role="status"
      aria-live="polite"
      className={cn(loadingStateVariants({ layout }), className)}
    >
      {done ? (
        <CheckIcon
          className={cn(
            "size-4 text-emerald-600 dark:text-emerald-400",
            dismisses &&
              "animate-out fade-out zoom-out-50 fill-mode-forwards duration-300"
          )}
          style={dismisses ? { animationDelay: `${doneDismissAfter}ms` } : undefined}
        />
      ) : (
        <Spinner aria-hidden />
      )}
      {done ? doneLabel : label}
    </div>
  )
}

export { LoadingState, loadingStateVariants }

// The standard Spinner is the ui one; re-exported so existing imports keep working.
export { Spinner, type SpinnerVariant } from "@/components/ui/spinner"
