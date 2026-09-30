"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { cn } from "cn"

const arrowClassName =
  "absolute inset-x-0 z-10 flex h-6 items-center justify-center from-background to-transparent text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"

const scrollbarClassName = {
  default: "",
  thin: "scrollbar-thin",
  hidden: "scrollbar-none",
} as const

// How far the edge fade reaches into the content.
const fadeSize = "1.5rem"

function ScrollArea({
  className,
  children,
  showArrows = false,
  scrollbar = "default",
  fade = false,
  maxHeight,
  ...props
}: React.ComponentProps<"div"> & {
  showArrows?: boolean
  /** Native scrollbar style: thin, or hidden while still scrollable. */
  scrollbar?: keyof typeof scrollbarClassName
  /** Fades the content out at an edge while there is more to scroll to. */
  fade?: boolean
  /** Grows with its content up to this height, then scrolls. */
  maxHeight?: number | string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = React.useState(false)
  const [canScrollDown, setCanScrollDown] = React.useState(false)
  const tracksEdges = showArrows || fade

  const updateArrows = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanScrollUp(el.scrollTop > 1)
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
  }, [])

  React.useEffect(() => {
    if (!tracksEdges) return
    const el = ref.current
    if (!el) return
    updateArrows()
    const observer = new ResizeObserver(updateArrows)
    observer.observe(el)
    for (const child of Array.from(el.children)) observer.observe(child)
    return () => observer.disconnect()
  }, [tracksEdges, updateArrows, children])

  function scrollBy(amount: number) {
    ref.current?.scrollBy({ top: amount, behavior: "smooth" })
  }

  const maskImage = fade
    ? `linear-gradient(to bottom, ${canScrollUp ? "transparent" : "black"}, black ${fadeSize}, black calc(100% - ${fadeSize}), ${canScrollDown ? "transparent" : "black"})`
    : undefined

  return (
    <div
      data-slot="scroll-area"
      data-scrollbar={scrollbar}
      data-fade={fade || undefined}
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-border bg-background text-sm",
        maxHeight === undefined ? "h-24" : "h-auto",
        className
      )}
      {...props}
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
        data-slot="scroll-area-viewport"
        onScroll={tracksEdges ? updateArrows : undefined}
        className={cn(
          "h-full overflow-auto p-2",
          scrollbarClassName[scrollbar]
        )}
        style={{ maxHeight, maskImage, WebkitMaskImage: maskImage }}
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
