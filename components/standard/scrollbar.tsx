import * as React from "react"
import { cn } from "cn"

import { ScrollArea } from "@/components/standard/scroll-area"

/** Opt-in thin native scrollbar. Needs `scrollbar-thin` utilities in globals.css. */
const thinScrollbarClassName = "scrollbar-thin"

/** @deprecated Use <ScrollArea scrollbar="thin"> */
function ThinScrollbar({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <ScrollArea
      data-slot="thin-scrollbar"
      scrollbar="thin"
      // ThinScrollbar grew with its content unless given a height.
      className={cn("h-auto bg-transparent", className)}
      {...props}
    >
      {children}
    </ScrollArea>
  )
}

export { ThinScrollbar, thinScrollbarClassName }
