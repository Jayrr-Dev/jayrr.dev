import * as React from "react"
import { cn } from "cn"

/** Opt-in thin native scrollbar. Needs `scrollbar-thin` utilities in globals.css. */
const thinScrollbarClassName = "scrollbar-thin"

function ThinScrollbar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="thin-scrollbar"
      className={cn(
        thinScrollbarClassName,
        "overflow-auto rounded-lg border border-border p-2",
        className
      )}
      {...props}
    />
  )
}

export { ThinScrollbar, thinScrollbarClassName }
