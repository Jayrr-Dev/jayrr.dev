import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const pillVariants = cva(
  "inline-flex items-stretch overflow-hidden border text-xs font-medium leading-none",
  {
    variants: {
      tone: {
        default: "border-transparent",
        outline: "border-border",
        danger: "border-transparent",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        full: "rounded-full [&>[data-slot=pill-label]]:pl-2.5 [&>[data-slot=pill-value]]:pr-2.5",
      },
    },
    defaultVariants: {
      tone: "default",
      radius: "full",
    },
  }
)

const pillValueVariants = cva("px-2 py-1", {
  variants: {
    tone: {
      default: "bg-primary text-primary-foreground",
      outline: "bg-transparent text-foreground",
      danger: "bg-destructive text-white",
    },
  },
  defaultVariants: {
    tone: "default",
  },
})

function Pill({
  className,
  label,
  tone = "default",
  radius = "full",
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof pillVariants> & {
    label: React.ReactNode
  }) {
  return (
    <span
      data-slot="pill"
      data-tone={tone}
      data-radius={radius}
      className={cn(pillVariants({ tone, radius }), className)}
      {...props}
    >
      <span
        data-slot="pill-label"
        className="bg-secondary px-2 py-1 text-muted-foreground"
      >
        {label}
      </span>
      <span data-slot="pill-value" className={pillValueVariants({ tone })}>
        {children}
      </span>
    </span>
  )
}

export { Pill, pillVariants }
