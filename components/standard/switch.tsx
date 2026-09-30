"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { FieldLabel } from "@/components/standard/field-label"
import { useControllableState } from "@/hooks/use-controllable-state"

const switchVariants = cva(
  "relative shrink-0 rounded-full bg-muted transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/40 data-[checked=true]:bg-primary",
  {
    variants: {
      size: {
        default: "h-5 w-8",
        sm: "h-4 w-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const switchThumbVariants = cva(
  "absolute top-0.5 left-0.5 rounded-full bg-background transition-transform",
  {
    variants: {
      size: {
        default: "size-4 group-data-[checked=true]/switch:translate-x-3",
        sm: "size-3 group-data-[checked=true]/switch:translate-x-2",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type SwitchProps = Omit<React.ComponentProps<"button">, "onChange"> &
  VariantProps<typeof switchVariants> & {
    checked?: boolean
    defaultChecked?: boolean
    onCheckedChange?: (checked: boolean) => void
    /** Visible label, clickable to toggle. */
    label?: React.ReactNode
    /** Secondary text under the label. */
    description?: React.ReactNode
    /** end: switch then label. start: label on the left, switch on the right, pushed apart. */
    labelPosition?: "start" | "end"
    /** Shows the error style. Same as passing aria-invalid. */
    invalid?: boolean
  }

function Switch({
  className,
  size = "default",
  checked,
  defaultChecked,
  onCheckedChange,
  onClick,
  label,
  description,
  labelPosition = "end",
  invalid,
  id,
  ...props
}: SwitchProps) {
  const [isOn, setIsOn] = useControllableState({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  })
  const autoId = React.useId()
  const hasLabel = label != null
  const switchId = id ?? (hasLabel ? autoId : undefined)
  const descriptionId = description != null ? `${autoId}-description` : undefined

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented) {
      return
    }
    setIsOn(!isOn)
  }

  const control = (
    <button
      data-slot="switch"
      data-size={size}
      data-checked={isOn}
      type="button"
      role="switch"
      id={switchId}
      {...props}
      aria-describedby={
        [props["aria-describedby"], descriptionId].filter(Boolean).join(" ") ||
        undefined
      }
      aria-checked={isOn}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={cn(
        "group/switch",
        switchVariants({ size }),
        !hasLabel && className
      )}
      onClick={toggle}
    >
      <span className={switchThumbVariants({ size })} />
    </button>
  )

  if (!hasLabel) {
    return control
  }

  return (
    <div
      data-slot="switch-field"
      data-label-position={labelPosition}
      className={cn(
        "flex items-start gap-2",
        labelPosition === "start" && "w-full flex-row-reverse justify-between gap-3",
        className
      )}
    >
      {control}
      <span className="flex min-w-0 flex-col gap-1">
        <FieldLabel
          htmlFor={switchId}
          className={cn(
            "cursor-pointer leading-5",
            size === "sm" && "text-xs leading-4",
            props.disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {label}
        </FieldLabel>
        {description != null ? (
          <span
            id={descriptionId}
            className={cn(
              "text-xs text-muted-foreground",
              props.disabled && "opacity-50"
            )}
          >
            {description}
          </span>
        ) : null}
      </span>
    </div>
  )
}

export { Switch, switchVariants }
export type { SwitchProps }
