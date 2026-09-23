"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

function ScrollArea({
  className,
  children,
  showArrows = false,
}: {
  className?: string
  children: React.ReactNode
  showArrows?: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  function scrollBy(amount: number) {
    ref.current?.scrollBy({ top: amount, behavior: "smooth" })
  }

  return (
    <div data-slot="scroll-area" className="flex w-full items-start gap-1">
      {showArrows ? (
        <Button
          tone="outline"
          size="sm"
          className="size-8 px-0"
          aria-label="Scroll up"
          onClick={() => scrollBy(-48)}
        >
          <ChevronUpIcon className="size-4" />
        </Button>
      ) : null}
      <div
        ref={ref}
        className={cn(
          "h-24 w-full overflow-auto rounded-lg border border-border p-2 text-sm",
          className
        )}
      >
        {children}
      </div>
      {showArrows ? (
        <Button
          tone="outline"
          size="sm"
          className="size-8 px-0"
          aria-label="Scroll down"
          onClick={() => scrollBy(48)}
        >
          <ChevronDownIcon className="size-4" />
        </Button>
      ) : null}
    </div>
  )
}

export { ScrollArea }
