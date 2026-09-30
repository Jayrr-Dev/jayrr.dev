import * as React from "react"
import { cn } from "cn"

import { Switch } from "@/components/standard/switch"

const toggleRowClass =
  "flex w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"

/**
 * @deprecated Use <Switch label labelPosition="start">
 *
 * A Switch child is folded into one labelled Switch. Any other child still
 * renders beside the label as before.
 */
function ToggleRow({
  className,
  label,
  children,
}: {
  className?: string
  label: string
  children: React.ReactNode
}) {
  if (React.isValidElement(children) && children.type === Switch) {
    const switchProps = children.props as React.ComponentProps<typeof Switch>
    return (
      <Switch
        {...switchProps}
        label={label}
        labelPosition="start"
        className={cn(
          toggleRowClass,
          "items-center [&_[data-slot=field-label]]:font-normal",
          switchProps.className,
          className
        )}
      />
    )
  }

  return (
    <div data-slot="toggle-row" className={cn(toggleRowClass, className)}>
      <span className="text-sm">{label}</span>
      {children}
    </div>
  )
}

export { ToggleRow }
