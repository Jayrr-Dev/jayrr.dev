"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import { LoadingState } from "@/components/standard/loading-state"
import { Masonry } from "@/components/ui/masonry"

/**
 * Lays out any components and asks for more as the end comes into view.
 * Pass `items` with `renderItem`, or compose children yourself; either way
 * a sentinel after the last item calls `onLoadMore` once it's within
 * `rootMargin` of the scroll edge, until `hasMore` is false.
 *
 * `layout` is a `list`, a responsive `grid` (columns from `minItemWidth`,
 * or a fixed `columns`) or `masonry`. `scroll="page"` loads against the
 * window; `scroll="container"` makes the component its own scroll box, so
 * give it a height.
 *
 * `direction` is the way new items arrive. `"up"` puts the sentinel at the
 * top and keeps the scroll position as older items are prepended, for chat
 * logs. `"right"` and `"left"` scroll sideways: a list becomes a row, a grid
 * fills `rows` rows of `minItemWidth` columns (masonry falls back to it),
 * and the component always scrolls itself. Sideways rows swipe natively on
 * touch with momentum, can `snap` item by item, and drag with a mouse.
 *
 * If `onLoadMore` returns a promise, the component waits for it before
 * asking again; otherwise pass `loading`. `trigger="button"` swaps the
 * sentinel for a Load more button.
 *
 * `useInfiniteList` wraps a page fetcher into the props this takes:
 *
 * const [feed, reset] = useInfiniteList((page) => fetchPosts(page))
 * <InfiniteScroll {...feed} renderItem={(post) => <PostCard post={post} />} />
 */

type InfiniteScrollLayout = "list" | "grid" | "masonry"

type InfiniteScrollProps<T> = Omit<React.ComponentProps<"div">, "children"> & {
  items?: readonly T[]
  renderItem?: (item: T, index: number) => React.ReactNode
  /** Defaults to the item's `id` or `key` field, then its index. */
  getItemKey?: (item: T, index: number) => React.Key
  /** Used instead of `items` when you compose the list yourself. */
  children?: React.ReactNode
  hasMore?: boolean
  loading?: boolean
  onLoadMore?: () => unknown
  /** Shown in place of the loader after a failed load, with a retry. */
  error?: React.ReactNode
  layout?: InfiniteScrollLayout
  /** Fixed column count for `grid` and `masonry`. */
  columns?: number
  /**
   * Column width floor (px) that picks the count for `grid` and `masonry`;
   * the column width of a sideways grid.
   */
  minItemWidth?: number
  /** Row count of a sideways grid. */
  rows?: number
  scroll?: "page" | "container"
  direction?: "down" | "up" | "right" | "left"
  /** Snaps scrolling to the start of each item. */
  snap?: boolean
  /** Lets a mouse drag a sideways row. Touch always swipes. */
  draggable?: boolean
  trigger?: "auto" | "button"
  /** How far past the scroll edge to start loading, as a CSS margin. */
  rootMargin?: string
  /** Replaces the default loading row. */
  loader?: React.ReactNode
  /** Shown after the last page. */
  end?: React.ReactNode
  /** Shown when there are no items and nothing left to load. */
  empty?: React.ReactNode
  /** Class for the element holding the items. */
  contentClassName?: string
}

function keyOf<T>(item: T, index: number): React.Key {
  if (item && typeof item === "object") {
    const record = item as { id?: unknown; key?: unknown }
    const key = record.id ?? record.key
    if (typeof key === "string" || typeof key === "number") return key
  }
  return index
}

function InfiniteScroll<T>({
  items,
  renderItem,
  getItemKey = keyOf,
  children,
  hasMore = false,
  loading = false,
  onLoadMore,
  error,
  layout = "list",
  columns,
  minItemWidth = 220,
  rows = 2,
  scroll: scrollProp = "page",
  direction = "down",
  snap = false,
  draggable = true,
  trigger = "auto",
  rootMargin = "320px",
  loader,
  end,
  empty,
  className,
  contentClassName,
  style,
  ...props
}: InfiniteScrollProps<T>) {
  const horizontal = direction === "right" || direction === "left"
  const backward = direction === "up" || direction === "left"
  const scroll = horizontal ? "container" : scrollProp
  const rootRef = React.useRef<HTMLDivElement>(null)
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const [pending, setPending] = React.useState(false)
  const busy = loading || pending
  const canLoad = hasMore && !busy && !error && onLoadMore != null

  const nodes = items
    ? items.map((item, index) => (
        <React.Fragment key={getItemKey(item, index)}>
          {renderItem?.(item, index)}
        </React.Fragment>
      ))
    : React.Children.toArray(children)
  const count = nodes.length

  // Prepending shifts everything along; hold the view on the same item.
  const sizeBeforeLoad = React.useRef<number | null>(null)

  const loadMore = React.useCallback(() => {
    if (!onLoadMore) return
    const root = rootRef.current
    if (backward && root) {
      sizeBeforeLoad.current = horizontal ? root.scrollWidth : root.scrollHeight
    }
    const result = onLoadMore()
    if (result instanceof Promise) {
      setPending(true)
      result.finally(() => setPending(false))
    }
  }, [backward, horizontal, onLoadMore])

  // Re-observing after every change fires a fresh callback, so a sentinel
  // that is still visible (the page didn't fill the view) loads again.
  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !canLoad || trigger !== "auto") return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) loadMore()
      },
      {
        root: scroll === "container" ? rootRef.current : null,
        rootMargin,
      }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [canLoad, count, loadMore, rootMargin, scroll, trigger])

  React.useLayoutEffect(() => {
    const root = rootRef.current
    const before = sizeBeforeLoad.current
    if (!root || before == null) return
    if (horizontal) root.scrollLeft += root.scrollWidth - before
    else root.scrollTop += root.scrollHeight - before
    sizeBeforeLoad.current = null
  }, [count, horizontal])

  // Backward lists, like chat logs, open on the newest item.
  const startedAtEnd = React.useRef(false)
  React.useLayoutEffect(() => {
    const root = rootRef.current
    if (!backward || !root || startedAtEnd.current || !count) return
    if (horizontal) root.scrollLeft = root.scrollWidth
    else root.scrollTop = root.scrollHeight
    startedAtEnd.current = true
  }, [backward, count, horizontal])

  const drag = useDragScroll(horizontal && draggable)

  const content =
    layout === "masonry" && !horizontal ? (
      <Masonry
        data-slot="infinite-scroll-content"
        columns={columns ?? 3}
        minColumnWidth={columns ? undefined : minItemWidth}
        className={cn("gap-4", contentClassName)}
      >
        {nodes}
      </Masonry>
    ) : (
      <div
        data-slot="infinite-scroll-content"
        style={
          horizontal && layout !== "list"
            ? {
                gridTemplateRows: `repeat(${rows}, auto)`,
                gridAutoColumns: `${minItemWidth}px`,
              }
            : layout === "grid"
              ? {
                  gridTemplateColumns: columns
                    ? `repeat(${columns}, minmax(0, 1fr))`
                    : `repeat(auto-fill, minmax(min(${minItemWidth}px, 100%), 1fr))`,
                }
              : undefined
        }
        className={cn(
          horizontal
            ? layout === "list"
              ? "flex w-max gap-3 *:shrink-0"
              : "grid w-max grid-flow-col gap-4"
            : layout === "grid"
              ? "grid gap-4"
              : "flex flex-col gap-3",
          snap && "*:snap-start",
          contentClassName
        )}
      >
        {nodes}
      </div>
    )

  const edgePadding = horizontal ? "px-4" : "py-4"
  let status: React.ReactNode = null
  if (error) {
    status = (
      <div
        className={cn(
          "flex flex-col items-center gap-2 text-sm text-muted-foreground",
          edgePadding
        )}
      >
        <span>{error}</span>
        <Button size="sm" tone="outline" onClick={loadMore}>
          Try again
        </Button>
      </div>
    )
  } else if (busy) {
    status = loader ?? (
      <LoadingState
        layout={horizontal ? "inline" : "block"}
        className={edgePadding}
      />
    )
  } else if (hasMore && trigger === "button") {
    status = (
      <div className={cn("flex justify-center", edgePadding)}>
        <Button tone="outline" onClick={loadMore}>
          Load more
        </Button>
      </div>
    )
  } else if (!hasMore && count === 0) {
    status = empty ?? (
      <p className="p-8 text-center text-sm whitespace-nowrap text-muted-foreground">
        Nothing here yet.
      </p>
    )
  } else if (!hasMore && end) {
    status = end
  }

  const edge = (
    <div
      data-slot="infinite-scroll-status"
      className={cn(horizontal && "flex shrink-0 items-center")}
    >
      <div
        ref={sentinelRef}
        aria-hidden
        className={horizontal ? "w-px self-stretch" : "h-px"}
      />
      {status}
    </div>
  )

  return (
    <div
      ref={rootRef}
      data-slot="infinite-scroll"
      data-layout={layout}
      data-direction={direction}
      aria-busy={busy}
      style={style}
      className={cn(
        horizontal
          ? "flex overflow-x-auto overscroll-x-contain"
          : "flex flex-col",
        scroll === "container" &&
          !horizontal &&
          "overflow-y-auto overscroll-contain",
        snap && (horizontal ? "snap-x snap-mandatory" : "snap-y snap-mandatory"),
        drag.active && "cursor-grabbing snap-none select-none",
        className
      )}
      {...drag.handlers}
      {...props}
    >
      {backward && edge}
      {content}
      {!backward && edge}
    </div>
  )
}

/**
 * Mouse drag-to-scroll for a sideways row. Touch and pen keep the native
 * swipe (with momentum), so this only acts on `pointerType === "mouse"`.
 * A drag past a few pixels swallows the click that ends it, so items under
 * the pointer don't activate.
 */
function useDragScroll(enabled: boolean) {
  const [active, setActive] = React.useState(false)
  const start = React.useRef<{ x: number; left: number } | null>(null)
  const moved = React.useRef(false)

  if (!enabled) return { active: false, handlers: {} }

  const ends = () => {
    start.current = null
    setActive(false)
  }

  const handlers = {
    onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
      if (event.pointerType !== "mouse" || event.button !== 0) return
      start.current = { x: event.clientX, left: event.currentTarget.scrollLeft }
      moved.current = false
    },
    onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
      const from = start.current
      if (!from) return
      const dx = event.clientX - from.x
      if (!moved.current) {
        if (Math.abs(dx) < 4) return
        moved.current = true
        setActive(true)
        event.currentTarget.setPointerCapture(event.pointerId)
      }
      event.currentTarget.scrollLeft = from.left - dx
    },
    onPointerUp: ends,
    onPointerCancel: ends,
    onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
      if (!moved.current) return
      moved.current = false
      event.preventDefault()
      event.stopPropagation()
    },
    // Stops the browser dragging images and links out of the row.
    onDragStart(event: React.DragEvent<HTMLDivElement>) {
      if (start.current) event.preventDefault()
    },
  }
  return { active, handlers }
}

type InfinitePage<T> = {
  items: readonly T[]
  /** Defaults to whether the page came back non-empty. */
  hasMore?: boolean
}

/**
 * Keeps the state for a paged source: call `fetchPage` with 0, 1, 2… and
 * append each page. Spread the first result onto `InfiniteScroll`; the
 * second, `reset`, clears the list and loads page 0 again, e.g. after a
 * filter changes.
 */
function useInfiniteList<T>(
  fetchPage: (page: number) => Promise<InfinitePage<T> | readonly T[]>
) {
  const [items, setItems] = React.useState<T[]>([])
  const [hasMore, setHasMore] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<React.ReactNode>(null)
  const page = React.useRef(0)
  const inFlight = React.useRef(false)
  const generation = React.useRef(0)
  const fetchRef = React.useRef(fetchPage)
  React.useEffect(() => {
    fetchRef.current = fetchPage
  })

  const onLoadMore = React.useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    const run = generation.current
    setLoading(true)
    setError(null)
    try {
      const result = await fetchRef.current(page.current)
      if (run !== generation.current) return
      const next: InfinitePage<T> = Array.isArray(result)
        ? { items: result }
        : (result as InfinitePage<T>)
      page.current += 1
      setItems((current) => [...current, ...next.items])
      setHasMore(next.hasMore ?? next.items.length > 0)
    } catch (caught) {
      if (run !== generation.current) return
      setError(caught instanceof Error ? caught.message : "Couldn't load more.")
    } finally {
      if (run === generation.current) {
        inFlight.current = false
        setLoading(false)
      }
    }
  }, [])

  const reset = React.useCallback(() => {
    generation.current += 1
    inFlight.current = false
    page.current = 0
    setItems([])
    setHasMore(true)
    setLoading(false)
    setError(null)
  }, [])

  return [{ items, hasMore, loading, error, onLoadMore }, reset] as const
}

export { InfiniteScroll, useInfiniteList }
export type { InfiniteScrollLayout, InfiniteScrollProps, InfinitePage }
