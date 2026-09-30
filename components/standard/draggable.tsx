"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { GripVerticalIcon } from "lucide-react"
import { cn } from "cn"

type DraggableLocation = { listId: string; index: number }

type DraggableMove = {
  id: string
  from: DraggableLocation
  to: DraggableLocation
}

type DraggableOrientation = "vertical" | "horizontal" | "grid"

type DraggableItemState = {
  index: number
  /** This item is the one being moved. */
  isDragging: boolean
  /** Drawn in the floating copy under the pointer. */
  isOverlay: boolean
}

type DraggableProps<T> = Omit<React.ComponentProps<"div">, "children"> & {
  items: T[]
  getId: (item: T) => string
  renderItem: (item: T, state: DraggableItemState) => React.ReactNode
  /** Called with the reordered list when a move lands in (or leaves) this list. */
  onItemsChange?: (items: T[]) => void
  /** Needed to drag between lists inside one `DraggableRoot`. */
  listId?: string
  /** Screen reader name for the list, e.g. "To do". */
  label?: string
  /** Screen reader name for an item. Defaults to "item n". */
  getItemLabel?: (item: T) => string
  orientation?: DraggableOrientation
  /** Only a `DraggableHandle` inside the item starts a drag. */
  handle?: boolean
  /** Whether this list takes an item dragged in from another list. */
  accept?: (item: T, fromListId: string) => boolean
  disabled?: boolean
  /** Shown when the list has no items. It still takes drops. */
  empty?: React.ReactNode
  itemClassName?: string
}

type ListEntry = {
  id: string
  element: HTMLElement | null
  items: unknown[]
  getId: (item: unknown) => string
  renderItem: (item: unknown, state: DraggableItemState) => React.ReactNode
  getItemLabel?: (item: unknown) => string
  onItemsChange?: (items: unknown[]) => void
  accept?: (item: unknown, fromListId: string) => boolean
  label?: string
  orientation: DraggableOrientation
  itemClassName?: string
  /** Rendered item wrappers, keyed by item id. */
  nodes: Map<string, HTMLElement>
}

type ActiveDrag = {
  id: string
  item: unknown
  from: DraggableLocation
  over: DraggableLocation
  mode: "pointer" | "keyboard"
  /** Pointer offset inside the item, and the item's size. */
  offset: { x: number; y: number }
  size: { width: number; height: number }
  /** The list it came from, for drawing the floating copy. */
  source: ListEntry
}

type RootContextValue = {
  active: ActiveDrag | null
  register: (entry: ListEntry) => () => void
  startPointer: (
    event: React.PointerEvent<HTMLElement>,
    listId: string,
    id: string
  ) => void
  keyDown: (
    event: React.KeyboardEvent<HTMLElement>,
    listId: string,
    id: string
  ) => void
  /** Item that should hold focus after a keyboard move, if any. */
  pendingFocus: () => string | null
  settleFocus: () => void
}

const RootContext = React.createContext<RootContextValue | null>(null)

type ItemContextValue = {
  listId: string
  id: string
  label: string
  disabled: boolean
  isDragging: boolean
  isOverlay: boolean
}

const ItemContext = React.createContext<ItemContextValue | null>(null)

/** Moves pointer this far before a press turns into a drag, so clicks still work. */
const DRAG_THRESHOLD = 4

/** Returns a copy of `items` with the entry at `from` moved to `to`. */
function arrayMove<T>(items: T[], from: number, to: number) {
  const next = items.slice()
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/** Applies a move to lists kept together, e.g. kanban columns keyed by id. */
function applyDraggableMove<T>(
  lists: Record<string, T[]>,
  move: DraggableMove
): Record<string, T[]> {
  const source = lists[move.from.listId] ?? []
  if (move.from.listId === move.to.listId) {
    return {
      ...lists,
      [move.from.listId]: arrayMove(source, move.from.index, move.to.index),
    }
  }
  const target = (lists[move.to.listId] ?? []).slice()
  target.splice(move.to.index, 0, source[move.from.index])
  return {
    ...lists,
    [move.from.listId]: source.filter((_, index) => index !== move.from.index),
    [move.to.listId]: target,
  }
}

function sortsByDocument(entries: ListEntry[]) {
  return entries
    .filter((entry) => entry.element)
    .sort((a, b) =>
      a.element!.compareDocumentPosition(b.element!) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1
    )
}

/** Where among `rects` a pointer at (x, y) would drop. */
function indexAt(
  rects: DOMRect[],
  x: number,
  y: number,
  orientation: DraggableOrientation
) {
  let index = 0
  for (const rect of rects) {
    const before =
      orientation === "vertical"
        ? rect.top + rect.height / 2 < y
        : orientation === "horizontal"
          ? rect.left + rect.width / 2 < x
          : y > rect.bottom ||
            (y >= rect.top && x > rect.left + rect.width / 2)
    if (before) index++
  }
  return index
}

/**
 * Lets items move between several `Draggable` lists, e.g. kanban columns.
 * A lone `Draggable` makes its own root, so this is only needed for that.
 */
function DraggableRoot({
  onMove,
  children,
}: {
  /** Fires once per drop that changes something. */
  onMove?: (move: DraggableMove) => void
  children: React.ReactNode
}) {
  const lists = React.useRef(new Map<string, ListEntry>())
  const [active, setActive] = React.useState<ActiveDrag | null>(null)
  const activeRef = React.useRef<ActiveDrag | null>(null)
  const [pointer, setPointer] = React.useState({ x: 0, y: 0 })
  const [message, setMessage] = React.useState("")
  const focusId = React.useRef<string | null>(null)
  const onMoveRef = React.useRef(onMove)
  React.useEffect(() => {
    onMoveRef.current = onMove
  })

  const update = React.useCallback((next: ActiveDrag | null) => {
    activeRef.current = next
    setActive(next)
  }, [])

  const register = React.useCallback((entry: ListEntry) => {
    lists.current.set(entry.id, entry)
    return () => {
      if (lists.current.get(entry.id) === entry) lists.current.delete(entry.id)
    }
  }, [])

  function labelsItem(list: ListEntry | undefined, item: unknown, index: number) {
    return list?.getItemLabel?.(item) ?? `item ${index + 1}`
  }

  function describesSpot(location: DraggableLocation, count: number) {
    const list = lists.current.get(location.listId)
    const where = list?.label ? ` in ${list.label}` : ""
    return `position ${location.index + 1} of ${count}${where}`
  }

  // Length of the target list once the active item sits in it.
  function countAt(drag: ActiveDrag, listId: string) {
    const length = lists.current.get(listId)?.items.length ?? 0
    return listId === drag.from.listId ? length : length + 1
  }

  function accepts(list: ListEntry, drag: ActiveDrag) {
    return (
      list.id === drag.from.listId ||
      (list.accept?.(drag.item, drag.from.listId) ?? true)
    )
  }

  function commits(drag: ActiveDrag) {
    const { from, over } = drag
    if (from.listId === over.listId && from.index === over.index) return
    onMoveRef.current?.({ id: drag.id, from, to: over })
    const source = lists.current.get(from.listId)
    const target = lists.current.get(over.listId)
    if (!source) return
    if (source === target) {
      source.onItemsChange?.(arrayMove(source.items, from.index, over.index))
      return
    }
    source.onItemsChange?.(
      source.items.filter((_, index) => index !== from.index)
    )
    if (target) {
      const next = target.items.slice()
      next.splice(over.index, 0, drag.item)
      target.onItemsChange?.(next)
    }
  }

  function finishes(drop: boolean) {
    const drag = activeRef.current
    if (!drag) return
    if (drop) {
      commits(drag)
      setMessage(`Dropped at ${describesSpot(drag.over, countAt(drag, drag.over.listId))}.`)
    } else {
      setMessage("Move cancelled.")
    }
    if (drag.mode === "keyboard") focusId.current = drag.id
    update(null)
  }

  // Works out which list and slot sit under the pointer.
  function tracks(x: number, y: number) {
    const drag = activeRef.current
    if (!drag) return
    let over = drag.over
    for (const list of lists.current.values()) {
      const rect = list.element?.getBoundingClientRect()
      if (
        !rect ||
        x < rect.left ||
        x > rect.right ||
        y < rect.top ||
        y > rect.bottom ||
        !accepts(list, drag)
      ) {
        continue
      }
      const rects = list.items
        .map(list.getId)
        .filter((id) => id !== drag.id)
        .map((id) => list.nodes.get(id)?.getBoundingClientRect())
        .filter((value): value is DOMRect => Boolean(value))
      over = { listId: list.id, index: indexAt(rects, x, y, list.orientation) }
      break
    }
    setPointer({ x, y })
    if (over.listId !== drag.over.listId || over.index !== drag.over.index) {
      update({ ...drag, over })
    }
  }

  function startPointer(
    event: React.PointerEvent<HTMLElement>,
    listId: string,
    id: string
  ) {
    if (event.button !== 0 || activeRef.current) return
    const list = lists.current.get(listId)
    const node = list?.nodes.get(id)
    if (!list || !node) return
    const index = list.items.findIndex((item) => list.getId(item) === id)
    if (index < 0) return

    const startX = event.clientX
    const startY = event.clientY
    const pointerId = event.pointerId
    let started = false

    const move = (next: PointerEvent) => {
      if (next.pointerId !== pointerId) return
      if (!started) {
        if (
          Math.hypot(next.clientX - startX, next.clientY - startY) <
          DRAG_THRESHOLD
        ) {
          return
        }
        started = true
        const rect = node.getBoundingClientRect()
        document.body.style.userSelect = "none"
        document.body.style.cursor = "grabbing"
        // The press may already have begun a text selection; drop it.
        window.getSelection()?.removeAllRanges()
        update({
          id,
          item: list.items[index],
          from: { listId, index },
          over: { listId, index },
          mode: "pointer",
          offset: { x: startX - rect.left, y: startY - rect.top },
          size: { width: rect.width, height: rect.height },
          source: list,
        })
        setMessage(
          `Picked up ${labelsItem(list, list.items[index], index)}, ${describesSpot({ listId, index }, list.items.length)}.`
        )
      }
      next.preventDefault()
      tracks(next.clientX, next.clientY)
    }

    const end = (next: PointerEvent) => {
      if (next.pointerId !== pointerId) return
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
      window.removeEventListener("pointercancel", end)
      window.removeEventListener("keydown", escape)
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
      if (started) finishes(next.type === "pointerup")
    }

    const escape = (next: KeyboardEvent) => {
      if (next.key !== "Escape" || !started) return
      started = false
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
      finishes(false)
    }

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
    window.addEventListener("pointercancel", end)
    window.addEventListener("keydown", escape)
  }

  function keyDown(
    event: React.KeyboardEvent<HTMLElement>,
    listId: string,
    id: string
  ) {
    const drag = activeRef.current

    if (!drag) {
      if (event.key !== " " && event.key !== "Enter") return
      const list = lists.current.get(listId)
      if (!list) return
      const index = list.items.findIndex((item) => list.getId(item) === id)
      if (index < 0) return
      event.preventDefault()
      focusId.current = id
      update({
        id,
        item: list.items[index],
        from: { listId, index },
        over: { listId, index },
        mode: "keyboard",
        offset: { x: 0, y: 0 },
        size: { width: 0, height: 0 },
        source: list,
      })
      setMessage(
        `Picked up ${labelsItem(list, list.items[index], index)}, ${describesSpot({ listId, index }, list.items.length)}. Use the arrow keys to move, Space to drop, Escape to cancel.`
      )
      return
    }

    if (drag.mode !== "keyboard" || drag.id !== id) return

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault()
      finishes(true)
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      finishes(false)
      return
    }

    const list = lists.current.get(drag.over.listId)
    if (!list) return
    const along =
      list.orientation === "horizontal"
        ? { back: "ArrowLeft", forward: "ArrowRight" }
        : { back: "ArrowUp", forward: "ArrowDown" }
    const across =
      list.orientation === "horizontal"
        ? { back: "ArrowUp", forward: "ArrowDown" }
        : { back: "ArrowLeft", forward: "ArrowRight" }

    let over = drag.over
    if (event.key === along.back || event.key === along.forward) {
      const last = countAt(drag, list.id) - 1
      const step = event.key === along.back ? -1 : 1
      over = {
        listId: list.id,
        index: Math.min(last, Math.max(0, drag.over.index + step)),
      }
    } else if (
      list.orientation === "grid" &&
      (event.key === across.back || event.key === across.forward)
    ) {
      // Grids read left to right, so sideways arrows step through the order too.
      const last = countAt(drag, list.id) - 1
      const step = event.key === across.back ? -1 : 1
      over = {
        listId: list.id,
        index: Math.min(last, Math.max(0, drag.over.index + step)),
      }
    } else if (event.key === across.back || event.key === across.forward) {
      const ordered = sortsByDocument([...lists.current.values()])
      const at = ordered.findIndex((entry) => entry.id === list.id)
      const step = event.key === across.back ? -1 : 1
      let next = at + step
      while (ordered[next] && !accepts(ordered[next], drag)) next += step
      const target = ordered[next]
      if (!target) return
      over = {
        listId: target.id,
        index: Math.min(drag.over.index, countAt(drag, target.id) - 1),
      }
    } else {
      return
    }

    event.preventDefault()
    if (over.listId === drag.over.listId && over.index === drag.over.index) return
    focusId.current = id
    update({ ...drag, over })
    setMessage(`Moved to ${describesSpot(over, countAt(drag, over.listId))}.`)
  }

  const overlayList = active?.mode === "pointer" ? active.source : null

  function pendingFocus() {
    return focusId.current
  }

  function settleFocus() {
    if (!activeRef.current) focusId.current = null
  }

  return (
    <RootContext.Provider
      value={{
        active,
        register,
        startPointer,
        keyDown,
        pendingFocus,
        settleFocus,
      }}
    >
      {children}
      <span aria-live="assertive" aria-atomic className="sr-only">
        {message}
      </span>
      {active && overlayList
        ? createPortal(
            <div
              data-slot="draggable-overlay"
              aria-hidden
              style={{
                left: pointer.x - active.offset.x,
                top: pointer.y - active.offset.y,
                width: active.size.width,
                height: active.size.height,
              }}
              className="pointer-events-none fixed z-[100] cursor-grabbing"
            >
              <ItemContext.Provider
                value={{
                  listId: active.from.listId,
                  id: active.id,
                  label: "",
                  disabled: false,
                  isDragging: false,
                  isOverlay: true,
                }}
              >
                <div
                  className={cn(
                    overlayList.itemClassName,
                    "h-full rotate-1 shadow-lg ring-1 ring-border"
                  )}
                >
                  {overlayList.renderItem(active.item, {
                    index: active.over.index,
                    isDragging: false,
                    isOverlay: true,
                  })}
                </div>
              </ItemContext.Provider>
            </div>,
            document.body
          )
        : null}
    </RootContext.Provider>
  )
}

function DraggableList<T>({
  items,
  getId,
  renderItem,
  onItemsChange,
  listId: listIdProp,
  label,
  getItemLabel,
  orientation = "vertical",
  handle = false,
  accept,
  disabled = false,
  empty,
  itemClassName,
  className,
  ...props
}: DraggableProps<T>) {
  const root = React.useContext(RootContext)!
  const generatedId = React.useId()
  const listId = listIdProp ?? generatedId
  const element = React.useRef<HTMLDivElement>(null)
  const nodes = React.useRef(new Map<string, HTMLElement>())
  const rects = React.useRef(new Map<string, DOMRect>())

  React.useLayoutEffect(() =>
    root.register({
      id: listId,
      element: element.current,
      items: items as unknown[],
      getId: getId as (item: unknown) => string,
      renderItem: renderItem as ListEntry["renderItem"],
      getItemLabel: getItemLabel as ListEntry["getItemLabel"],
      onItemsChange: onItemsChange as ListEntry["onItemsChange"],
      accept: accept as ListEntry["accept"],
      label,
      orientation,
      itemClassName,
      nodes: nodes.current,
    })
  )

  const active = root.active
  // The order to draw: the active item lifted out of its old slot and
  // dropped into the one it hovers.
  let shown: { item: T; id: string }[] = items.map((item) => ({
    item,
    id: getId(item),
  }))
  if (active) {
    shown = shown.filter((entry) => entry.id !== active.id)
    if (active.over.listId === listId) {
      shown.splice(active.over.index, 0, {
        item: active.item as T,
        id: active.id,
      })
    }
  }
  const order = shown.map((entry) => entry.id).join("\u0000")

  // Slides items from their old spot to the new one when the order changes.
  React.useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const next = new Map<string, DOMRect>()
    for (const [id, node] of nodes.current) {
      const rect = node.getBoundingClientRect()
      next.set(id, rect)
      const previous = rects.current.get(id)
      if (!previous || reduced) continue
      const dx = previous.left - rect.left
      const dy = previous.top - rect.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue
      node.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
        { duration: 160, easing: "cubic-bezier(0.2, 0, 0, 1)" }
      )
    }
    rects.current = next
  }, [order])

  // Keyboard moves can remount the item in another list; keep focus on it.
  React.useLayoutEffect(() => {
    const id = root.pendingFocus()
    if (!id) return
    const node = nodes.current.get(id)
    if (!node) return
    const target =
      node.querySelector<HTMLElement>("[data-slot='draggable-handle']") ?? node
    if (document.activeElement !== target) target.focus({ preventScroll: false })
    root.settleFocus()
  })

  return (
    <div
      ref={element}
      role="list"
      aria-label={label}
      data-slot="draggable"
      data-orientation={orientation}
      data-over={active?.over.listId === listId || undefined}
      className={cn(
        orientation === "vertical" && "flex flex-col gap-2",
        orientation === "horizontal" && "flex flex-row gap-2",
        orientation === "grid" && "flex flex-wrap gap-2",
        className
      )}
      {...props}
    >
      {shown.length === 0 && empty ? (
        <div data-slot="draggable-empty">{empty}</div>
      ) : null}
      {shown.map(({ item, id }, index) => {
        const isDragging = active?.id === id
        const keyboard = isDragging && active?.mode === "keyboard"
        const itemLabel = getItemLabel?.(item) ?? `item ${index + 1}`
        const whole = !handle && !disabled

        return (
          <div
            key={id}
            ref={(node) => {
              if (node) nodes.current.set(id, node)
              else nodes.current.delete(id)
            }}
            role="listitem"
            data-slot="draggable-item"
            data-dragging={isDragging || undefined}
            tabIndex={whole ? 0 : undefined}
            aria-roledescription={whole ? "draggable item" : undefined}
            aria-label={whole ? itemLabel : undefined}
            onPointerDown={
              whole
                ? (event) => {
                    // Leave inner buttons and fields to do their own thing.
                    const target = event.target as HTMLElement
                    if (
                      target !== event.currentTarget &&
                      target.closest("button, a, input, textarea, select")
                    ) {
                      return
                    }
                    root.startPointer(event, listId, id)
                  }
                : undefined
            }
            onKeyDown={
              whole
                ? (event) => {
                    if (event.target === event.currentTarget) {
                      root.keyDown(event, listId, id)
                    }
                  }
                : undefined
            }
            className={cn(
              "outline-none",
              whole &&
                "cursor-grab touch-none select-none focus-visible:ring-3 focus-visible:ring-ring/50",
              itemClassName,
              isDragging &&
                active?.mode === "pointer" &&
                "opacity-40 [&>*]:invisible outline-2 -outline-offset-2 outline-dashed outline-border",
              keyboard && "ring-2 ring-primary"
            )}
          >
            <ItemContext.Provider
              value={{
                listId,
                id,
                label: itemLabel,
                disabled,
                isDragging,
                isOverlay: false,
              }}
            >
              {renderItem(item, { index, isDragging, isOverlay: false })}
            </ItemContext.Provider>
          </div>
        )
      })}
    </div>
  )
}

/**
 * A list people can reorder by dragging, with the keyboard (Space to lift,
 * arrows to move, Space to drop) or by pointer. Put several inside a
 * `DraggableRoot` with `listId`s to move items between them.
 */
function Draggable<T>(props: DraggableProps<T>) {
  const root = React.useContext(RootContext)
  if (root) return <DraggableList {...props} />
  return (
    <DraggableRoot>
      <DraggableList {...props} />
    </DraggableRoot>
  )
}

/** Grip that starts a drag. Use it inside `renderItem` with `handle` set. */
function DraggableHandle({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const root = React.useContext(RootContext)
  const item = React.useContext(ItemContext)
  const keyboard =
    root?.active?.mode === "keyboard" && root.active.id === item?.id

  return (
    <button
      type="button"
      data-slot="draggable-handle"
      aria-roledescription="drag handle"
      aria-label={item?.label ? `Move ${item.label}` : "Move"}
      aria-pressed={keyboard}
      disabled={item?.disabled}
      tabIndex={item?.isOverlay ? -1 : undefined}
      onPointerDown={(event) => {
        if (root && item && !item.isOverlay) {
          root.startPointer(event, item.listId, item.id)
        }
      }}
      onKeyDown={(event) => {
        if (root && item && !item.isOverlay) {
          root.keyDown(event, item.listId, item.id)
        }
      }}
      className={cn(
        "inline-flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {children ?? <GripVerticalIcon aria-hidden />}
    </button>
  )
}

export {
  applyDraggableMove,
  arrayMove,
  Draggable,
  DraggableHandle,
  DraggableRoot,
  type DraggableItemState,
  type DraggableLocation,
  type DraggableMove,
  type DraggableOrientation,
  type DraggableProps,
}
