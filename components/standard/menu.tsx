"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import {
  ContextMenu as ContextMenuPrimitive,
  Dialog as DialogPrimitive,
  DropdownMenu as DropdownMenuPrimitive,
} from "radix-ui"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

export type MenuItem = {
  type?: "item"
  id: string
  label: string
  tone?: "default" | "danger"
  /** Runs when the item is picked, by click or keyboard. */
  onSelect?: () => void
  disabled?: boolean
  /** Leading icon, shown at size-4. */
  icon?: React.ReactNode
  /** Keyboard hint shown at the end, e.g. "⌘E". Display only. */
  shortcut?: string
}

export type MenuSeparator = {
  type: "separator"
  id: string
}

export type MenuGroup = {
  type: "group"
  id: string
  /** Optional heading shown above the group's items. */
  label?: string
  items: MenuItem[]
}

/** One row of a menu: an item, a separator or a labelled group of items. */
export type MenuEntry = MenuItem | MenuSeparator | MenuGroup

const menuContentClass =
  "z-50 min-w-40 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"

const menuSeparatorClass = "-mx-1 my-1 h-px bg-border"

const menuLabelClass = "px-2 py-1 text-xs font-medium text-muted-foreground"

function menuItemClass(tone: "default" | "danger" | undefined) {
  return cn(
    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50",
    tone === "danger" ? "text-destructive" : undefined
  )
}

function RendersMenuItemContent({ item }: { item: MenuItem }) {
  return (
    <>
      {item.icon ? (
        <span
          aria-hidden
          className="inline-flex shrink-0 items-center [&_svg]:size-4"
        >
          {item.icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">{item.label}</span>
      {item.shortcut ? (
        <span
          data-slot="menu-shortcut"
          className="ml-auto pl-4 text-xs tracking-widest text-muted-foreground"
        >
          {item.shortcut}
        </span>
      ) : null}
    </>
  )
}

function DropdownMenu({
  label = "Open menu",
  items,
  trigger,
  align,
  modal,
  disabled = false,
  className,
  itemClassName,
}: {
  label?: string
  items: MenuEntry[]
  /**
   * Replaces the default outline button. Must be a single element that takes
   * a ref and props, such as a button; it receives the open handlers.
   */
  trigger?: React.ReactElement
  align?: "start" | "center" | "end"
  /** Blocks the rest of the page while open. Radix default: true. */
  modal?: boolean
  disabled?: boolean
  /** Classes for the menu panel. */
  className?: string
  /** Classes added to every item. */
  itemClassName?: string
}) {
  function renderingItem(item: MenuItem) {
    return (
      <DropdownMenuPrimitive.Item
        key={item.id}
        disabled={item.disabled}
        className={cn(menuItemClass(item.tone), itemClassName)}
        onSelect={item.onSelect}
      >
        <RendersMenuItemContent item={item} />
      </DropdownMenuPrimitive.Item>
    )
  }

  return (
    <DropdownMenuPrimitive.Root modal={modal}>
      <DropdownMenuPrimitive.Trigger asChild disabled={disabled}>
        {trigger ?? <Button tone="outline">{label}</Button>}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={4}
          className={cn(menuContentClass, className)}
        >
          {items.map((entry) => {
            if (entry.type === "separator") {
              return (
                <DropdownMenuPrimitive.Separator
                  key={entry.id}
                  className={menuSeparatorClass}
                />
              )
            }
            if (entry.type === "group") {
              return (
                <DropdownMenuPrimitive.Group key={entry.id}>
                  {entry.label ? (
                    <DropdownMenuPrimitive.Label className={menuLabelClass}>
                      {entry.label}
                    </DropdownMenuPrimitive.Label>
                  ) : null}
                  {entry.items.map(renderingItem)}
                </DropdownMenuPrimitive.Group>
              )
            }
            return renderingItem(entry)
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

function ContextMenu({
  label = "Right-click here",
  items,
  trigger,
}: {
  label?: string
  items: MenuEntry[]
  /** Replaces the dashed target area. Must be a single element that takes a ref. */
  trigger?: React.ReactElement
}) {
  function renderingItem(item: MenuItem) {
    return (
      <ContextMenuPrimitive.Item
        key={item.id}
        disabled={item.disabled}
        className={menuItemClass(item.tone)}
        onSelect={item.onSelect}
      >
        <RendersMenuItemContent item={item} />
      </ContextMenuPrimitive.Item>
    )
  }

  return (
    <ContextMenuPrimitive.Root>
      {trigger ? (
        <ContextMenuPrimitive.Trigger asChild>{trigger}</ContextMenuPrimitive.Trigger>
      ) : (
        <ContextMenuPrimitive.Trigger className="rounded-lg border border-dashed border-border px-4 py-6 text-xs text-muted-foreground">
          {label}
        </ContextMenuPrimitive.Trigger>
      )}
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content className={menuContentClass}>
          {items.map((entry) => {
            if (entry.type === "separator") {
              return (
                <ContextMenuPrimitive.Separator
                  key={entry.id}
                  className={menuSeparatorClass}
                />
              )
            }
            if (entry.type === "group") {
              return (
                <ContextMenuPrimitive.Group key={entry.id}>
                  {entry.label ? (
                    <ContextMenuPrimitive.Label className={menuLabelClass}>
                      {entry.label}
                    </ContextMenuPrimitive.Label>
                  ) : null}
                  {entry.items.map(renderingItem)}
                </ContextMenuPrimitive.Group>
              )
            }
            return renderingItem(entry)
          })}
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  )
}

function CommandMenu({
  trigger = "Open command",
  placeholder = "Search pieces",
  items,
}: {
  /** Content of the button that opens the palette. */
  trigger?: React.ReactNode
  placeholder?: string
  items: MenuEntry[]
}) {
  const [open, setOpen] = React.useState(false)

  function renderingItem(item: MenuItem) {
    return (
      <CommandPrimitive.Item
        key={item.id}
        value={item.label}
        disabled={item.disabled}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-muted",
          item.tone === "danger" ? "text-destructive" : undefined
        )}
        onSelect={() => {
          setOpen(false)
          item.onSelect?.()
        }}
      >
        <RendersMenuItemContent item={item} />
      </CommandPrimitive.Item>
    )
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <Button tone="outline" onClick={() => setOpen(true)}>
        {trigger}
      </Button>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content className="fixed top-[20%] left-1/2 z-50 w-[min(100%,24rem)] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
          <DialogPrimitive.Title className="sr-only">Command</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search commands
          </DialogPrimitive.Description>
          <CommandPrimitive className="flex flex-col">
            <CommandPrimitive.Input
              placeholder={placeholder}
              className="h-10 border-b border-border bg-transparent px-3 text-sm outline-none"
            />
            <CommandPrimitive.List className="max-h-60 p-1">
              <CommandPrimitive.Empty className="px-2 py-3 text-xs text-muted-foreground">
                No matches
              </CommandPrimitive.Empty>
              {items.map((entry) => {
                if (entry.type === "separator") {
                  return (
                    <CommandPrimitive.Separator
                      key={entry.id}
                      className={menuSeparatorClass}
                    />
                  )
                }
                if (entry.type === "group") {
                  return (
                    <CommandPrimitive.Group
                      key={entry.id}
                      heading={entry.label}
                      className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground"
                    >
                      {entry.items.map(renderingItem)}
                    </CommandPrimitive.Group>
                  )
                }
                return renderingItem(entry)
              })}
            </CommandPrimitive.List>
          </CommandPrimitive>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { CommandMenu, ContextMenu, DropdownMenu }
