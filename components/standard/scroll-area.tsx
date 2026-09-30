"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { cn } from "cn"

const arrowClassName =
  "absolute inset-x-0 z-10 flex h-6 items-center justify-center from-background to-transparent text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"

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
  const [canScrollUp, setCanScrollUp] = React.useState(false)
  const [canScrollDown, setCanScrollDown] = React.useState(false)

  const updateArrows = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanScrollUp(el.scrollTop > 1)
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
  }, [])

  React.useEffect(() => {
    if (!showArrows) return
    const el = ref.current
    if (!el) return
    updateArrows()
    const observer = new ResizeObserver(updateArrows)
    observer.observe(el)
    for (const child of Array.from(el.children)) observer.observe(child)
    return () => observer.disconnect()
  }, [showArrows, updateArrows, children])

  function scrollBy(amount: number) {
    ref.current?.scrollBy({ top: amount, behavior: "smooth" })
  }

  return (
    <div
      data-slot="scroll-area"
      className={cn(
        "relative h-24 w-full overflow-hidden rounded-lg border border-border bg-background text-sm",
        className
      )}
    >
      {showArrows && canScrollUp ? (
        <button
          type="button"
          className={cn(arrowClassName, "top-0 bg-linear-to-b")}
          aria-label="Scroll up"
          onClick={() => scrollBy(-48)}
        >
          <ChevronUpIcon className="size-4" />
        </button>
      ) : null}
      <div
        ref={ref}
        onScroll={showArrows ? updateArrows : undefined}
        className="h-full overflow-auto p-2"
      >
        {children}
      </div>
      {showArrows && canScrollDown ? (
        <button
          type="button"
          className={cn(arrowClassName, "bottom-0 bg-linear-to-t")}
          aria-label="Scroll down"
          onClick={() => scrollBy(48)}
        >
          <ChevronDownIcon className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

export { ScrollArea }
