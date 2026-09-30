"use client"

import * as React from "react"
import { ChevronLeftIcon } from "lucide-react"
import { cn } from "cn"

/**
 * A launcher grid of folders, after the Windows 11 Start menu category view.
 *
 * Each folder tile shows a 2×2 of its first items. When a folder holds more
 * than four, the fourth slot becomes a mini 2×2 of the next items; clicking
 * it (or the tile, or its label) opens the folder over the grid with every
 * item listed. The three full-size icons launch their item directly.
 *
 * <AppGrid folders={folders} onItemSelect={(item) => launch(item)} />
 */

export type AppGridItem = {
  id: string
  label: string
  icon: React.ReactNode
  /** Renders the item as a link instead of a button. */
  href?: string
  onSelect?: () => void
}

export type AppGridFolder = {
  id: string
  label: string
  items: AppGridItem[]
}

/** Items shown full size on a folder tile before the overflow cluster. */
const LEAD_COUNT = 3
/** Items shown in the overflow cluster. */
const CLUSTER_COUNT = 4

function AppGridLaunch({
  item,
  onItemSelect,
  className,
  children,
}: {
  item: AppGridItem
  onItemSelect?: (item: AppGridItem) => void
  className?: string
  children: React.ReactNode
}) {
  const props = {
    "data-slot": "app-grid-item",
    title: item.label,
    className: cn(
      "flex items-center justify-center rounded-md outline-none transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring",
      className
    ),
    onClick: (event: React.MouseEvent) => {
      event.stopPropagation()
      item.onSelect?.()
      onItemSelect?.(item)
    },
  }

  return item.href ? (
    <a href={item.href} {...props}>
      {children}
    </a>
  ) : (
    <button type="button" {...props}>
      {children}
    </button>
  )
}

function AppGridIcon({
  icon,
  className,
}: {
  icon: React.ReactNode
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex aspect-square items-center justify-center [&>*]:size-full [&>img]:object-contain",
        className
      )}
    >
      {icon}
    </span>
  )
}

function AppGridTile({
  folder,
  onOpen,
  onItemSelect,
  tileRef,
}: {
  folder: AppGridFolder
  onOpen: () => void
  onItemSelect?: (item: AppGridItem) => void
  tileRef: (node: HTMLButtonElement | null) => void
}) {
  const overflows = folder.items.length > CLUSTER_COUNT
  const lead = folder.items.slice(0, overflows ? LEAD_COUNT : CLUSTER_COUNT)
  const cluster = overflows
    ? folder.items.slice(LEAD_COUNT, LEAD_COUNT + CLUSTER_COUNT)
    : []

  return (
    <div data-slot="app-grid-folder" className="flex flex-col items-center gap-3">
      {/* The tile itself opens the folder on click; keyboard users get the label button. */}
      <div
        onClick={onOpen}
        className="grid aspect-square w-full cursor-pointer grid-cols-2 grid-rows-2 gap-2 rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
      >
        {lead.map((item) => (
          <AppGridLaunch
            key={item.id}
            item={item}
            onItemSelect={onItemSelect}
            className="p-2"
          >
            <AppGridIcon icon={item.icon} className="size-full max-h-12 max-w-12" />
          </AppGridLaunch>
        ))}
        {overflows ? (
          <button
            type="button"
            data-slot="app-grid-cluster"
            aria-label={`Show all ${folder.items.length} in ${folder.label}`}
            onClick={(event) => {
              event.stopPropagation()
              onOpen()
            }}
            className="grid grid-cols-2 grid-rows-2 place-items-center gap-1 rounded-md p-2 outline-none transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {cluster.map((item) => (
              <AppGridIcon
                key={item.id}
                icon={item.icon}
                className="size-full max-h-5 max-w-5"
              />
            ))}
          </button>
        ) : null}
      </div>
      <button
        ref={tileRef}
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className="max-w-full truncate rounded-sm text-center text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {folder.label}
      </button>
    </div>
  )
}

function AppGridPanel({
  folder,
  onClose,
  onItemSelect,
}: {
  folder: AppGridFolder
  onClose: () => void
  onItemSelect?: (item: AppGridItem) => void
}) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const backRef = React.useRef<HTMLButtonElement>(null)
  const titleId = React.useId()

  React.useEffect(() => {
    backRef.current?.focus()
  }, [])

  // A press outside the open folder closes it, like the Start menu.
  const closeRef = React.useRef(onClose)
  React.useEffect(() => {
    closeRef.current = onClose
  })
  React.useEffect(() => {
    function closesOutside(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        closeRef.current()
      }
    }
    document.addEventListener("pointerdown", closesOutside)
    return () => document.removeEventListener("pointerdown", closesOutside)
  }, [])

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-labelledby={titleId}
      data-slot="app-grid-panel"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation()
          onClose()
        }
      }}
      className="absolute inset-0 z-10 flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
    >
      <div className="flex items-center gap-2">
        <button
          ref={backRef}
          type="button"
          onClick={onClose}
          aria-label="Back to all folders"
          className="flex size-8 items-center justify-center rounded-md outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <h3 id={titleId} className="text-sm font-medium">
          {folder.label}
        </h3>
      </div>
      <ul className="grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2 overflow-y-auto">
        {folder.items.map((item) => (
          <li key={item.id}>
            <AppGridLaunch
              item={item}
              onItemSelect={onItemSelect}
              className="w-full flex-col gap-2 p-3"
            >
              <AppGridIcon icon={item.icon} className="size-10" />
              <span className="line-clamp-2 text-center text-xs leading-tight">
                {item.label}
              </span>
            </AppGridLaunch>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AppGrid({
  folders,
  onItemSelect,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  folders: AppGridFolder[]
  /** Called for every item launched, after the item's own `onSelect`. */
  onItemSelect?: (item: AppGridItem) => void
}) {
  const [openId, setOpenId] = React.useState<string | null>(null)
  const labelRefs = React.useRef(new Map<string, HTMLButtonElement>())
  const returnFocusId = React.useRef<string | null>(null)
  const openFolder = folders.find((folder) => folder.id === openId)

  function closes() {
    returnFocusId.current = openId
    setOpenId(null)
  }

  // Hand focus back to the folder that was open, once the grid is no longer inert.
  React.useEffect(() => {
    if (openId === null && returnFocusId.current) {
      labelRefs.current.get(returnFocusId.current)?.focus()
      returnFocusId.current = null
    }
  }, [openId])

  return (
    <div
      data-slot="app-grid"
      // w-full: auto-fill columns collapse to one when the grid shrink-wraps.
      className={cn("relative min-h-80 w-full min-w-0", className)}
      {...props}
    >
      <div
        inert={openFolder ? true : undefined}
        className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-4 gap-y-6"
      >
        {folders.map((folder) => (
          <AppGridTile
            key={folder.id}
            folder={folder}
            onOpen={() => setOpenId(folder.id)}
            onItemSelect={onItemSelect}
            tileRef={(node) => {
              if (node) labelRefs.current.set(folder.id, node)
              else labelRefs.current.delete(folder.id)
            }}
          />
        ))}
      </div>
      {openFolder ? (
        <AppGridPanel
          key={openFolder.id}
          folder={openFolder}
          onClose={closes}
          onItemSelect={onItemSelect}
        />
      ) : null}
    </div>
  )
}

export { AppGrid }
