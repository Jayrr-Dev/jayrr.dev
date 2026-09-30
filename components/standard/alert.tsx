"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"
import { cn } from "cn"

import {
  Alert as AlertRoot,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

const alertVariants = cva("p-3", {
  variants: {
    tone: {
      default: "",
      info: "",
      success: "",
      warning: "",
      danger: "",
      broadcast: "",
    },
    appearance: {
      soft: "",
      solid:
        "border-transparent *:data-[slot=alert-description]:text-inherit *:data-[slot=alert-description]:opacity-90",
      outline: "bg-transparent",
    },
    // Banner runs edge to edge at the top of a page.
    layout: {
      inline: "",
      banner: "rounded-none border-x-0 border-t-0 px-4 py-2",
    },
  },
  compoundVariants: [
    // Soft: tinted surface, tinted border.
    { appearance: "soft", tone: "default", className: "border-border bg-muted/40" },
    {
      appearance: "soft",
      tone: "info",
      className: "border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-100",
    },
    {
      appearance: "soft",
      tone: "success",
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
    },
    {
      appearance: "soft",
      tone: "warning",
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100",
    },
    {
      appearance: "soft",
      tone: "danger",
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    },
    {
      appearance: "soft",
      tone: "broadcast",
      className:
        "border-border bg-primary/10 *:data-[slot=alert-description]:text-foreground",
    },
    // Solid: filled surface, inverse text.
    { appearance: "solid", tone: "default", className: "bg-foreground text-background" },
    { appearance: "solid", tone: "info", className: "bg-sky-600 text-white" },
    { appearance: "solid", tone: "success", className: "bg-emerald-600 text-white" },
    { appearance: "solid", tone: "warning", className: "bg-amber-500 text-black" },
    { appearance: "solid", tone: "danger", className: "bg-destructive text-white" },
    {
      appearance: "solid",
      tone: "broadcast",
      className: "bg-primary text-primary-foreground",
    },
    // Outline: no fill, coloured border.
    { appearance: "outline", tone: "default", className: "border-border" },
    {
      appearance: "outline",
      tone: "info",
      className: "border-sky-500/60 text-sky-700 dark:text-sky-300",
    },
    {
      appearance: "outline",
      tone: "success",
      className: "border-emerald-500/60 text-emerald-700 dark:text-emerald-300",
    },
    {
      appearance: "outline",
      tone: "warning",
      className: "border-amber-500/60 text-amber-700 dark:text-amber-300",
    },
    {
      appearance: "outline",
      tone: "danger",
      className: "border-destructive/60 text-destructive",
    },
    { appearance: "outline", tone: "broadcast", className: "border-primary/60" },
    // Coloured tones keep the description in the tone colour.
    {
      appearance: ["soft", "outline"],
      tone: ["info", "success", "warning", "danger"],
      className:
        "*:data-[slot=alert-description]:text-inherit *:data-[slot=alert-description]:opacity-85",
    },
  ],
  defaultVariants: {
    tone: "default",
    appearance: "soft",
    layout: "inline",
  },
})

type AlertProps = Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof alertVariants> & {
    title?: React.ReactNode
    /** Leading icon, e.g. a lucide icon. Sits beside the title and text. */
    icon?: React.ReactNode
    /** Trailing controls, pinned top right. */
    action?: React.ReactNode
    /** Shows a close button; the alert hides itself when it is pressed. */
    dismissible?: boolean
    onDismiss?: () => void
  }

function Alert({
  className,
  title,
  tone = "default",
  appearance = "soft",
  layout = "inline",
  icon,
  action,
  dismissible = false,
  onDismiss,
  children,
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = React.useState(false)

  if (dismissed) {
    return null
  }

  return (
    <AlertRoot
      data-tone={tone}
      data-appearance={appearance}
      data-layout={layout}
      className={cn(alertVariants({ tone, appearance, layout }), className)}
      {...props}
    >
      {icon}
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {children ? <AlertDescription>{children}</AlertDescription> : null}
      {action || dismissible ? (
        <AlertAction
          className={cn(
            "flex items-center gap-1",
            layout === "banner" ? "top-1.5 right-2" : "top-2.5 right-2.5"
          )}
        >
          {action}
          {dismissible ? (
            <button
              type="button"
              aria-label="Dismiss"
              className="inline-flex size-6 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={() => {
                setDismissed(true)
                onDismiss?.()
              }}
            >
              <XIcon className="size-4" />
            </button>
          ) : null}
        </AlertAction>
      ) : null}
    </AlertRoot>
  )
}

export { Alert, alertVariants }
