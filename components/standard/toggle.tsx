"use client"

import * as React from "react"
import { cn } from "cn"

function Toggle({
  className,
  pressed,
  defaultPressed = false,
  onPressedChange,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultPressed)
  const isOn = pressed ?? uncontrolled

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    props.onClick?.(event)
    if (event.defaultPrevented) {
      return
    }

    const next = !isOn
    if (pressed === undefined) {
      setUncontrolled(next)
    }
    onPressedChange?.(next)
  }

  return (
    <button
      data-slot="toggle"
      data-pressed={isOn}
      type={type}
      aria-pressed={isOn}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-lg border border-input px-3 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[pressed=true]:bg-muted data-[pressed=true]:text-foreground",
        className
      )}
      {...props}
      onClick={handleClick}
    />
  )
}

export { Toggle }
