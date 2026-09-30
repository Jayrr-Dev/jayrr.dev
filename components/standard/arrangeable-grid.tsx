"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

/** One entry per slot, `null` where the slot is empty. */
type ArrangeableSlots<T> = (T | null)[]

type ArrangeableGridLocation = { gridId: string; index: number }

type ArrangeableGridItemState = {
  index: number
  /** This item is picked up; its slot shows it faded. */
  isDragging: boolean
  /** Drawn in the floating copy under the pointer. */
  isOverlay: boolean
}

type ArrangeableGridTargetState = {
  /** Something is being dragged anywhere in the root. */
  isDragging: boolean
  /** The dragged item is over this target. */
  isOver: boolean
  /** The target would take the dragged item. */
  canDrop: boolean
}

type ArrangeableGridSlotSize = "sm" | "default" | "lg"

type ArrangeableGridProps<T> = Omit<
  React.ComponentProps<"div">,
  "children" | "defaultValue"
> & {
  columns: number
  rows?: number
  /** Slots in reading order. Shorter arrays are padded with empty slots. */
  value?: ArrangeableSlots<T>
  defaultValue?: ArrangeableSlots<T>
  onValueChange?: (slots: ArrangeableSlots<T>) => void
  renderItem: (item: T, state: ArrangeableGridItemState) => React.ReactNode
  /** Stable key for an item, so its rendered state follows it between slots. */
  getId?: (item: T) => string
  /** Screen reader name for an item. Defaults to "item". */
  getItemLabel?: (item: T) => string
  /** Screen reader name for the grid, e.g. "Backpack". Also names linked grids apart. */
  label?: string
  /** Needed to tell linked grids apart inside one `ArrangeableGridRoot`. */
  gridId?: string
  /**
   * Whether `index` takes `item`. `from` is where it comes from, or null when
   * it comes from an `ArrangeableGridSource`. Swaps check both sides.
   */
  accept?: (
    item: T,
    index: number,
    from: ArrangeableGridLocation | null
  ) => boolean
  /**
   * Called when an item lands on an occupied slot. Return the combined item to
   * stack them, e.g. adding counts; return null to swap instead.
   */
  merge?: (target: T, incoming: T) => T | null
  /** Dropping an item outside every grid and target, or pressing Delete on it, removes it. */
  removable?: boolean
  /** Called when an item leaves this grid by removal or onto a target. */
  onItemRemove?: (item: T, index: number) => void
  /**
   * Takes files or text dragged in from outside the page. Return the new
   * item(s) to place from the slot they were dropped on, or null to refuse.
   */
  onDropData?: (data: DataTransfer, index: number) => T | T[] | null
  slotSize?: ArrangeableGridSlotSize
  disabled?: boolean
  slotClassName?: string
}

type GridEntry = {
  id: string
  label?: string
  getSlots: () => unknown[]
  setSlots: (slots: unknown[]) => void
  accept?: (
    item: unknown,
    index: number,
    from: ArrangeableGridLocation | null
  ) => boolean
  merge?: (target: unknown, incoming: unknown) => unknown
  removable: boolean
  onItemRemove?: (item: unknown, index: number) => void
  renderItem: (
    item: unknown,
    state: ArrangeableGridItemState
  ) => React.ReactNode
  getItemLabel?: (item: unknown) => string
  element: () => HTMLElement | null
}

type TargetEntry = {
  id: string
  accept?: (item: unknown, from: ArrangeableGridLocation | null) => boolean
  onItemDrop?: (item: unknown, from: ArrangeableGridLocation | null) => void
  remove: boolean
}

type Over =
  | { kind: "slot"; gridId: string; index: number }
  | { kind: "target"; id: string }
  | null

type DragInit = {
  item: unknown
  /** Null when the item comes from an `ArrangeableGridSource`. */
  from: ArrangeableGridLocation | null
  render: () => React.ReactNode
  label: string
}

type ActiveDrag = DragInit & {
  mode: "pointer" | "keyboard"
  over: Over
  canDrop: boolean
  offset: { x: number; y: number }
  size: { width: number; height: number }
}

type Plan =
  | { kind: "stay" }
  | { kind: "place" }
  | { kind: "merge"; merged: unknown }
  | { kind: "swap"; occupant: unknown }
  | { kind: "target"; target: TargetEntry }
  | { kind: "remove" }

type RootContextValue = {
  drag: ActiveDrag | null
  registerGrid: (ref: React.RefObject<GridEntry>) => () => void
  registerTarget: (ref: React.RefObject<TargetEntry>) => () => void
  startPointer: (event: React.PointerEvent<HTMLElement>, init: DragInit) => void
  startKeyboard: (element: HTMLElement, init: DragInit) => void
  moveKeyboard: (over: Over) => void
  finish: (commit: boolean) => void
  addToFirstOpen: (item: unknown) => boolean
  announce: (message: string) => void
}

const RootContext = React.createContext<RootContextValue | null>(null)

const DRAG_THRESHOLD = 4

const SLOT_SIZES: Record<ArrangeableGridSlotSize, string> = {
  sm: "2.5rem",
  default: "3rem",
  lg: "4rem",
}

function sameOver(a: Over, b: Over) {
  if (a === null || b === null) return a === b
  if (a.kind === "slot" && b.kind === "slot") {
    return a.gridId === b.gridId && a.index === b.index
  }
  if (a.kind === "target" && b.kind === "target") return a.id === b.id
  return false
}

function padSlots<T>(
  slots: ArrangeableSlots<T>,
  capacity: number
): ArrangeableSlots<T> {
  return Array.from({ length: capacity }, (_, index) => slots[index] ?? null)
}

/**
 * Places `items` into empty slots, starting at `start` and wrapping around.
 * Items that don't fit are dropped.
 */
function fillSlots<T>(
  slots: ArrangeableSlots<T>,
  items: T[],
  start = 0,
  canPlace: (item: T, index: number) => boolean = () => true
) {
  const next = [...slots]
  let placed = 0
  for (const item of items) {
    for (let step = 0; step < next.length; step++) {
      const index = (start + step) % next.length
      if (next[index] == null && canPlace(item, index)) {
        next[index] = item
        placed++
        break
      }
    }
  }
  return { slots: next, placed }
}

/**
 * Links several `ArrangeableGrid`s, `ArrangeableGridTarget`s and
 * `ArrangeableGridSource`s so items can be dragged between them. A grid used
 * on its own makes its own root.
 */
function ArrangeableGridRoot({ children }: { children: React.ReactNode }) {
  const grids = React.useRef(new Set<React.RefObject<GridEntry>>())
  const targets = React.useRef(new Set<React.RefObject<TargetEntry>>())
  const [drag, setDrag] = React.useState<ActiveDrag | null>(null)
  const dragRef = React.useRef<ActiveDrag | null>(null)
  const pointer = React.useRef({ x: 0, y: 0 })
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const cleanup = React.useRef<(() => void) | null>(null)
  const [announcement, setAnnouncement] = React.useState("")

  const findGrid = React.useCallback((id: string) => {
    for (const ref of grids.current) {
      if (ref.current.id === id) return ref.current
    }
    return undefined
  }, [])

  const findTarget = React.useCallback((id: string) => {
    for (const ref of targets.current) {
      if (ref.current.id === id) return ref.current
    }
    return undefined
  }, [])

  const plan = React.useCallback(
    (active: DragInit, over: Over): Plan | null => {
      const { item, from } = active
      if (over === null) {
        return from && findGrid(from.gridId)?.removable
          ? { kind: "remove" }
          : null
      }
      if (over.kind === "target") {
        const target = findTarget(over.id)
        if (!target || (target.accept && !target.accept(item, from))) {
          return null
        }
        return { kind: "target", target }
      }
      const to = findGrid(over.gridId)
      if (!to) return null
      if (from && from.gridId === over.gridId && from.index === over.index) {
        return { kind: "stay" }
      }
      if (to.accept && !to.accept(item, over.index, from)) return null
      const occupant = to.getSlots()[over.index]
      if (occupant == null) return { kind: "place" }
      const merged = to.merge?.(occupant, item)
      if (merged != null) return { kind: "merge", merged }
      if (!from) return null
      const source = findGrid(from.gridId)
      if (
        source?.accept &&
        !source.accept(occupant, from.index, {
          gridId: over.gridId,
          index: over.index,
        })
      ) {
        return null
      }
      return { kind: "swap", occupant }
    },
    [findGrid, findTarget]
  )

  const apply = React.useCallback(
    (active: ActiveDrag, next: Plan) => {
      const { item, from, over } = active
      const source = from ? findGrid(from.gridId) : undefined

      const clearSource = (replacement: unknown = null) => {
        if (!from || !source) return
        const slots = [...source.getSlots()]
        slots[from.index] = replacement
        source.setSlots(slots)
      }

      if (next.kind === "stay") return
      if (next.kind === "remove") {
        clearSource()
        source?.onItemRemove?.(item, from!.index)
        return
      }
      if (next.kind === "target") {
        next.target.onItemDrop?.(item, from)
        if (next.target.remove && from) {
          clearSource()
          source?.onItemRemove?.(item, from.index)
        }
        return
      }
      if (over?.kind !== "slot") return
      const to = findGrid(over.gridId)!
      const incoming = next.kind === "merge" ? next.merged : item
      const leftBehind = next.kind === "swap" ? next.occupant : null

      if (from && from.gridId === over.gridId) {
        const slots = [...to.getSlots()]
        slots[over.index] = incoming
        slots[from.index] = leftBehind
        to.setSlots(slots)
        return
      }
      const slots = [...to.getSlots()]
      slots[over.index] = incoming
      to.setSlots(slots)
      clearSource(leftBehind)
    },
    [findGrid]
  )

  const describe = React.useCallback(
    (over: Over) => {
      if (over === null) return "outside"
      if (over.kind === "target") return "the drop target"
      const grid = findGrid(over.gridId)
      return `${grid?.label ?? "slot"} ${over.index + 1}`
    },
    [findGrid]
  )

  const update = React.useCallback(
    (over: Over) => {
      const active = dragRef.current
      if (!active || sameOver(active.over, over)) return
      const next = { ...active, over, canDrop: plan(active, over) !== null }
      dragRef.current = next
      setDrag(next)
    },
    [plan]
  )

  const finish = React.useCallback(
    (commit: boolean) => {
      const active = dragRef.current
      cleanup.current?.()
      cleanup.current = null
      dragRef.current = null
      setDrag(null)
      if (!active) return
      const next = commit ? plan(active, active.over) : null
      if (next) {
        apply(active, next)
        setAnnouncement(
          next.kind === "remove"
            ? `Removed ${active.label}.`
            : `Dropped ${active.label} on ${describe(active.over)}.`
        )
      } else {
        setAnnouncement(`${active.label} returned.`)
      }
    },
    [apply, describe, plan]
  )

  const hitTest = React.useCallback(
    (x: number, y: number): Over => {
      const element = document.elementFromPoint(x, y)
      const slot = element?.closest<HTMLElement>("[data-arrangeable-slot]")
      if (slot?.dataset.gridId && findGrid(slot.dataset.gridId)) {
        return {
          kind: "slot",
          gridId: slot.dataset.gridId,
          index: Number(slot.dataset.index),
        }
      }
      const target = element?.closest<HTMLElement>("[data-arrangeable-target]")
      if (target?.dataset.targetId && findTarget(target.dataset.targetId)) {
        return { kind: "target", id: target.dataset.targetId }
      }
      return null
    },
    [findGrid, findTarget]
  )

  const place = React.useCallback(() => {
    const active = dragRef.current
    const overlay = overlayRef.current
    if (!active || !overlay) return
    const x = pointer.current.x - active.offset.x
    const y = pointer.current.y - active.offset.y
    overlay.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }, [])

  React.useLayoutEffect(place, [drag, place])

  const startPointer = React.useCallback(
    (event: React.PointerEvent<HTMLElement>, init: DragInit) => {
      if (event.button !== 0 || dragRef.current) return
      const rect = event.currentTarget.getBoundingClientRect()
      const start = { x: event.clientX, y: event.clientY }
      let started = false

      const onMove = (moveEvent: PointerEvent) => {
        pointer.current = { x: moveEvent.clientX, y: moveEvent.clientY }
        if (!started) {
          const distance = Math.hypot(
            moveEvent.clientX - start.x,
            moveEvent.clientY - start.y
          )
          if (distance < DRAG_THRESHOLD) return
          started = true
          const active: ActiveDrag = {
            ...init,
            mode: "pointer",
            over: null,
            canDrop: false,
            offset: { x: start.x - rect.left, y: start.y - rect.top },
            size: { width: rect.width, height: rect.height },
          }
          active.over = hitTest(moveEvent.clientX, moveEvent.clientY)
          active.canDrop = plan(active, active.over) !== null
          dragRef.current = active
          setDrag(active)
          document.body.style.userSelect = "none"
          return
        }
        place()
        update(hitTest(moveEvent.clientX, moveEvent.clientY))
      }
      const onUp = () => {
        if (started) finish(true)
        else detach()
      }
      const onCancel = () => finish(false)
      const onKey = (keyEvent: KeyboardEvent) => {
        if (keyEvent.key === "Escape") finish(false)
      }
      const detach = () => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
        window.removeEventListener("pointercancel", onCancel)
        window.removeEventListener("keydown", onKey)
        document.body.style.userSelect = ""
      }

      cleanup.current?.()
      cleanup.current = detach
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
      window.addEventListener("pointercancel", onCancel)
      window.addEventListener("keydown", onKey)
    },
    [finish, hitTest, place, plan, update]
  )

  const startKeyboard = React.useCallback(
    (element: HTMLElement, init: DragInit) => {
      if (dragRef.current || !init.from) return
      const rect = element.getBoundingClientRect()
      const active: ActiveDrag = {
        ...init,
        mode: "keyboard",
        over: { kind: "slot", ...init.from },
        canDrop: true,
        offset: { x: 0, y: 0 },
        size: { width: rect.width, height: rect.height },
      }
      dragRef.current = active
      setDrag(active)
      setAnnouncement(
        `Picked up ${init.label}. Arrow keys move it, Enter drops it, Escape cancels.`
      )
    },
    []
  )

  const moveKeyboard = React.useCallback(
    (over: Over) => {
      update(over)
      const active = dragRef.current
      if (active) {
        setAnnouncement(
          `${describe(over)}${active.canDrop ? "" : ", can't drop here"}.`
        )
      }
    },
    [describe, update]
  )

  const addToFirstOpen = React.useCallback((item: unknown) => {
    for (const ref of grids.current) {
      const grid = ref.current
      const { slots, placed } = fillSlots(
        grid.getSlots(),
        [item],
        0,
        (candidate, index) => grid.accept?.(candidate, index, null) ?? true
      )
      if (placed) {
        grid.setSlots(slots)
        return true
      }
    }
    return false
  }, [])

  React.useEffect(() => () => cleanup.current?.(), [])

  const value = React.useMemo<RootContextValue>(
    () => ({
      drag,
      registerGrid: (ref) => {
        grids.current.add(ref)
        return () => grids.current.delete(ref)
      },
      registerTarget: (ref) => {
        targets.current.add(ref)
        return () => targets.current.delete(ref)
      },
      startPointer,
      startKeyboard,
      moveKeyboard,
      finish,
      addToFirstOpen,
      announce: setAnnouncement,
    }),
    [addToFirstOpen, drag, finish, moveKeyboard, startKeyboard, startPointer]
  )

  return (
    <RootContext.Provider value={value}>
      {children}
      <span aria-live="assertive" className="sr-only">
        {announcement}
      </span>
      {drag?.mode === "pointer"
        ? createPortal(
            <div
              ref={overlayRef}
              aria-hidden
              data-slot="arrangeable-grid-overlay"
              data-reject={drag.over && !drag.canDrop ? "" : undefined}
              className="pointer-events-none fixed top-0 left-0 z-100 flex cursor-grabbing items-center justify-center drop-shadow-lg data-reject:opacity-60"
              style={{ width: drag.size.width, height: drag.size.height }}
            >
              {drag.render()}
            </div>,
            document.body
          )
        : null}
    </RootContext.Provider>
  )
}

function useRoot(component: string) {
  const root = React.useContext(RootContext)
  if (!root) {
    throw new Error(`${component} must be used inside ArrangeableGridRoot.`)
  }
  return root
}

function ArrangeableGridInner<T>({
  className,
  style,
  columns,
  rows = 1,
  value,
  defaultValue = [],
  onValueChange,
  renderItem,
  getId,
  getItemLabel,
  label,
  gridId: gridIdProp,
  accept,
  merge,
  removable = false,
  onItemRemove,
  onDropData,
  slotSize = "default",
  disabled = false,
  slotClassName,
  ...props
}: ArrangeableGridProps<T>) {
  const root = useRoot("ArrangeableGrid")
  const generatedId = React.useId()
  const gridId = gridIdProp ?? generatedId
  const capacity = Math.max(0, columns * rows)
  const [current, setCurrent] = useControllableState<ArrangeableSlots<T>>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const slots = React.useMemo(
    () => padSlots(current, capacity),
    [current, capacity]
  )
  const [focusIndex, setFocusIndex] = React.useState(0)
  const [nativeOver, setNativeOver] = React.useState<number | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const cells = React.useRef<(HTMLDivElement | null)[]>([])

  const nameOf = React.useCallback(
    (item: T) => getItemLabel?.(item) ?? "item",
    [getItemLabel]
  )

  // Read through a ref so a drop that touches two grids sees both latest values.
  const slotsRef = React.useRef(slots)
  const entry = React.useRef<GridEntry>(null!)

  const setSlots = React.useCallback(
    (next: ArrangeableSlots<T>) => {
      slotsRef.current = next
      setCurrent(next)
    },
    [setCurrent]
  )

  React.useLayoutEffect(() => {
    slotsRef.current = slots
    entry.current = {
      id: gridId,
      label,
      getSlots: () => slotsRef.current,
      setSlots: setSlots as GridEntry["setSlots"],
      accept: accept as GridEntry["accept"],
      merge: merge as GridEntry["merge"],
      removable,
      onItemRemove: onItemRemove as GridEntry["onItemRemove"],
      renderItem: renderItem as GridEntry["renderItem"],
      getItemLabel: getItemLabel as GridEntry["getItemLabel"],
      element: () => containerRef.current,
    }
  })

  const { registerGrid } = root
  React.useEffect(() => registerGrid(entry), [registerGrid])

  const drag = root.drag
  const holding =
    drag?.mode === "keyboard" && drag.from?.gridId === gridId ? drag : null

  function initFor(index: number): DragInit | null {
    const item = slots[index]
    if (item == null) return null
    return {
      item,
      from: { gridId, index },
      label: nameOf(item),
      render: () =>
        renderItem(item, { index, isDragging: true, isOverlay: true }),
    }
  }

  function focusCell(index: number) {
    setFocusIndex(index)
    cells.current[index]?.focus()
  }

  function onKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) {
    if (disabled) return
    const at =
      holding?.over?.kind === "slot" && holding.over.gridId === gridId
        ? holding.over.index
        : index
    let next: number | null = null
    if (event.key === "ArrowRight") next = Math.min(capacity - 1, at + 1)
    if (event.key === "ArrowLeft") next = Math.max(0, at - 1)
    if (event.key === "ArrowDown")
      next = at + columns < capacity ? at + columns : at
    if (event.key === "ArrowUp") next = at - columns >= 0 ? at - columns : at
    if (event.key === "Home") next = 0
    if (event.key === "End") next = capacity - 1

    if (next !== null) {
      event.preventDefault()
      focusCell(next)
      if (holding) root.moveKeyboard({ kind: "slot", gridId, index: next })
      return
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      if (holding) {
        root.finish(true)
        return
      }
      const init = initFor(index)
      if (init) root.startKeyboard(event.currentTarget, init)
      return
    }
    if (event.key === "Escape" && holding) {
      event.preventDefault()
      root.finish(false)
      return
    }
    if (
      (event.key === "Delete" || event.key === "Backspace") &&
      removable &&
      !holding
    ) {
      const item = slots[index]
      if (item == null) return
      event.preventDefault()
      const cleared = [...slots]
      cleared[index] = null
      setSlots(cleared)
      onItemRemove?.(item, index)
      root.announce(`Removed ${nameOf(item)}.`)
    }
  }

  function onNativeDrop(event: React.DragEvent<HTMLDivElement>, index: number) {
    setNativeOver(null)
    if (!onDropData) return
    event.preventDefault()
    const result = onDropData(event.dataTransfer, index)
    if (result == null) return
    const items = Array.isArray(result) ? result : [result]
    const { slots: next } = fillSlots(
      slots,
      items,
      index,
      (item, at) => accept?.(item, at, null) ?? true
    )
    setSlots(next)
  }

  const rowIndexes = Array.from({ length: rows }, (_, row) => row)

  return (
    <div
      ref={containerRef}
      role="grid"
      aria-label={label}
      aria-rowcount={rows}
      aria-colcount={columns}
      aria-disabled={disabled || undefined}
      data-slot="arrangeable-grid"
      className={cn("grid w-fit gap-1", className)}
      onBlur={(event) => {
        if (holding && !event.currentTarget.contains(event.relatedTarget)) {
          root.finish(false)
        }
      }}
      style={{
        gridTemplateColumns: `repeat(${columns}, var(--arrangeable-slot))`,
        ["--arrangeable-slot" as string]: SLOT_SIZES[slotSize],
        ...style,
      }}
      {...props}
    >
      {rowIndexes.map((row) => (
        <div key={row} role="row" className="contents">
          {Array.from({ length: columns }, (_, column) => {
            const index = row * columns + column
            const item = slots[index]
            const filled = item != null
            const isSource =
              drag?.from?.gridId === gridId && drag.from.index === index
            const isOver =
              (drag?.over?.kind === "slot" &&
                drag.over.gridId === gridId &&
                drag.over.index === index &&
                !isSource) ||
              nativeOver === index
            const reject = isOver && drag !== null && !drag.canDrop
            const state: ArrangeableGridItemState = {
              index,
              isDragging: isSource,
              isOverlay: false,
            }

            return (
              <div
                key={index}
                ref={(node) => {
                  cells.current[index] = node
                }}
                role="gridcell"
                tabIndex={!disabled && index === focusIndex ? 0 : -1}
                aria-label={`${label ?? "Slot"} ${index + 1}: ${filled ? nameOf(item) : "empty"}`}
                aria-selected={isSource && drag?.mode === "keyboard"}
                data-arrangeable-slot=""
                data-grid-id={gridId}
                data-index={index}
                data-filled={filled ? "" : undefined}
                data-over={isOver ? "" : undefined}
                data-reject={reject ? "" : undefined}
                data-held={
                  isSource && drag?.mode === "keyboard" ? "" : undefined
                }
                data-disabled={disabled ? "" : undefined}
                className={cn(
                  "relative flex size-(--arrangeable-slot) items-center justify-center rounded-md border border-border/70 bg-muted/50 shadow-[inset_0_1px_3px_rgb(0_0_0/0.12)] transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  "data-filled:cursor-grab data-filled:touch-none data-disabled:cursor-default data-disabled:opacity-60",
                  "data-over:border-primary data-over:bg-primary/10 data-reject:border-destructive data-reject:bg-destructive/10",
                  "data-held:ring-3 data-held:ring-primary/60",
                  slotClassName
                )}
                onFocus={() => setFocusIndex(index)}
                onPointerDown={(event) => {
                  if (disabled) return
                  const init = initFor(index)
                  if (init) root.startPointer(event, init)
                }}
                onKeyDown={(event) => onKeyDown(event, index)}
                onDragOver={
                  onDropData && !disabled
                    ? (event) => {
                        event.preventDefault()
                        setNativeOver(index)
                      }
                    : undefined
                }
                onDragLeave={onDropData ? () => setNativeOver(null) : undefined}
                onDrop={
                  onDropData && !disabled
                    ? (event) => onNativeDrop(event, index)
                    : undefined
                }
              >
                {filled ? (
                  <div
                    key={getId?.(item) ?? index}
                    data-slot="arrangeable-grid-item"
                    data-dragging={isSource ? "" : undefined}
                    className="flex size-full items-center justify-center data-dragging:opacity-30"
                  >
                    {renderItem(item, state)}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/**
 * A fixed grid of slots, like an inventory: drag an item onto an empty slot
 * to move it, onto a full one to swap (or stack, with `merge`). Link grids,
 * drop targets and sources in an `ArrangeableGridRoot` to drag between them.
 * Keyboard: arrows move focus, Enter or Space picks up and drops, Escape
 * cancels, Delete removes when `removable`.
 */
function ArrangeableGrid<T>(props: ArrangeableGridProps<T>) {
  const root = React.useContext(RootContext)
  if (root) return <ArrangeableGridInner {...props} />
  return (
    <ArrangeableGridRoot>
      <ArrangeableGridInner {...props} />
    </ArrangeableGridRoot>
  )
}

type ArrangeableGridTargetProps<T> = Omit<
  React.ComponentProps<"div">,
  "children"
> & {
  /** Called with the item dropped here and where it came from. */
  onItemDrop?: (item: T, from: ArrangeableGridLocation | null) => void
  /** Takes the item out of its grid on drop. On by default, for trash-style targets. */
  remove?: boolean
  accept?: (item: T, from: ArrangeableGridLocation | null) => boolean
  children?:
    React.ReactNode | ((state: ArrangeableGridTargetState) => React.ReactNode)
}

/** A place to drop items that isn't a slot, such as a trash or sell button. */
function ArrangeableGridTarget<T>({
  className,
  onItemDrop,
  remove = true,
  accept,
  children,
  ...props
}: ArrangeableGridTargetProps<T>) {
  const root = useRoot("ArrangeableGridTarget")
  const id = React.useId()
  const entry = React.useRef<TargetEntry>(null!)
  React.useLayoutEffect(() => {
    entry.current = {
      id,
      remove,
      accept: accept as TargetEntry["accept"],
      onItemDrop: onItemDrop as TargetEntry["onItemDrop"],
    }
  })
  const { registerTarget } = root
  React.useEffect(() => registerTarget(entry), [registerTarget])

  const drag = root.drag
  const isOver = drag?.over?.kind === "target" && drag.over.id === id
  const state: ArrangeableGridTargetState = {
    isDragging: drag !== null,
    isOver,
    canDrop: isOver && drag.canDrop,
  }

  return (
    <div
      data-slot="arrangeable-grid-target"
      data-arrangeable-target=""
      data-target-id={id}
      data-dragging={state.isDragging ? "" : undefined}
      data-over={isOver ? "" : undefined}
      data-reject={isOver && !state.canDrop ? "" : undefined}
      className={cn("w-fit", className)}
      {...props}
    >
      {typeof children === "function" ? children(state) : children}
    </div>
  )
}

type ArrangeableGridSourceProps<T> = Omit<
  React.ComponentProps<"div">,
  "children"
> & {
  /** Makes a fresh item each time one is dragged out, e.g. with a new id. */
  create: () => T
  /** Screen reader name, e.g. "Add sword". Enter adds one to the first open slot. */
  label: string
  disabled?: boolean
  children: React.ReactNode
}

/** A palette entry that drags new items into any linked grid. */
function ArrangeableGridSource<T>({
  className,
  create,
  label,
  disabled = false,
  children,
  ...props
}: ArrangeableGridSourceProps<T>) {
  const root = useRoot("ArrangeableGridSource")

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled || undefined}
      data-slot="arrangeable-grid-source"
      className={cn(
        "flex w-fit cursor-grab touch-none items-center justify-center rounded-md outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:cursor-default aria-disabled:opacity-50",
        className
      )}
      onPointerDown={(event) => {
        if (disabled) return
        root.startPointer(event, {
          item: create(),
          from: null,
          label,
          render: () => children,
        })
      }}
      onKeyDown={(event) => {
        if (disabled || (event.key !== "Enter" && event.key !== " ")) return
        event.preventDefault()
        root.announce(
          root.addToFirstOpen(create()) ? `${label}: added.` : "No open slot."
        )
      }}
      {...props}
    >
      {children}
    </div>
  )
}

type UseArrangeableGridOptions<T> = {
  columns: number
  rows?: number
  defaultValue?: ArrangeableSlots<T>
  getId?: (item: T) => string
}

/**
 * Headless slot state for a grid: add, remove and move items from code, read
 * counts, and spread `gridProps` onto an `ArrangeableGrid` so drags update it.
 */
function useArrangeableGrid<T>({
  columns,
  rows = 1,
  defaultValue = [],
  getId,
}: UseArrangeableGridOptions<T>) {
  const capacity = Math.max(0, columns * rows)
  const [raw, setRaw] = React.useState<ArrangeableSlots<T>>(() =>
    padSlots(defaultValue, capacity)
  )
  const slots = React.useMemo(() => padSlots(raw, capacity), [raw, capacity])
  const items = React.useMemo(
    () => slots.filter((item) => item != null) as T[],
    [slots]
  )

  const indexOf = React.useCallback(
    (id: string) =>
      slots.findIndex((item) => item != null && getId?.(item) === id),
    [getId, slots]
  )

  return {
    slots,
    items,
    capacity,
    count: items.length,
    isFull: items.length >= capacity,
    isEmpty: items.length === 0,
    setSlots: setRaw,
    at: (index: number) => slots[index] ?? null,
    indexOf,
    /** Puts items in the first empty slots from `start`. Returns how many fit. */
    add: (item: T | T[], start = 0) => {
      const result = fillSlots(
        slots,
        Array.isArray(item) ? item : [item],
        start
      )
      setRaw(result.slots)
      return result.placed
    },
    removeAt: (index: number) =>
      setRaw((list) => {
        const next = padSlots(list, capacity)
        next[index] = null
        return next
      }),
    remove: (id: string) =>
      setRaw((list) =>
        padSlots(list, capacity).map((item) =>
          item != null && getId?.(item) === id ? null : item
        )
      ),
    /** Moves the item at `from` to `to`, swapping with anything there. */
    move: (from: number, to: number) =>
      setRaw((list) => {
        const next = padSlots(list, capacity)
        ;[next[from], next[to]] = [next[to], next[from]]
        return next
      }),
    /** Packs items to the front, keeping their order. */
    compact: () => setRaw(padSlots(items, capacity)),
    clear: () => setRaw(padSlots([], capacity)),
    gridProps: { columns, rows, value: slots, onValueChange: setRaw, getId },
  }
}

export {
  ArrangeableGrid,
  ArrangeableGridRoot,
  ArrangeableGridSource,
  ArrangeableGridTarget,
  useArrangeableGrid,
}
export type {
  ArrangeableGridItemState,
  ArrangeableGridLocation,
  ArrangeableGridProps,
  ArrangeableGridSlotSize,
  ArrangeableGridSourceProps,
  ArrangeableGridTargetProps,
  ArrangeableGridTargetState,
  ArrangeableSlots,
  UseArrangeableGridOptions,
}
