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
  id: string
  label: string
  tone?: "default" | "danger"
}

function menuItemClass(tone: "default" | "danger" | undefined) {
  return cn(
    "cursor-pointer rounded-md px-2 py-1.5 text-sm outline-none data-highlighted:bg-muted",
    tone === "danger" ? "text-destructive" : undefined
  )
}

function DropdownMenu({
  label = "Open menu",
  items,
}: {
  label?: string
  items: MenuItem[]
}) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button tone="outline">{label}</Button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          sideOffset={4}
          className="z-50 min-w-40 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
        >
          {items.map((item) => (
            <DropdownMenuPrimitive.Item
              key={item.id}
              className={menuItemClass(item.tone)}
            >
              {item.label}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

function ContextMenu({
  label = "Right-click here",
  items,
}: {
  label?: string
  items: MenuItem[]
}) {
  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger className="rounded-lg border border-dashed border-border px-4 py-6 text-xs text-muted-foreground">
        {label}
      </ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content className="z-50 min-w-40 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
          {items.map((item) => (
            <ContextMenuPrimitive.Item
              key={item.id}
              className={menuItemClass(item.tone)}
            >
              {item.label}
            </ContextMenuPrimitive.Item>
          ))}
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  )
}

function CommandMenu({
  trigger = "Open command",
  items,
}: {
  trigger?: string
  items: { id: string; label: string }[]
}) {
  const [open, setOpen] = React.useState(false)

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
              placeholder="Search pieces"
              className="h-10 border-b border-border bg-transparent px-3 text-sm outline-none"
            />
            <CommandPrimitive.List className="max-h-60 p-1">
              <CommandPrimitive.Empty className="px-2 py-3 text-xs text-muted-foreground">
                No matches
              </CommandPrimitive.Empty>
              {items.map((item) => (
                <CommandPrimitive.Item
                  key={item.id}
                  value={item.label}
                  className="cursor-pointer rounded-md px-2 py-1.5 text-sm data-[selected=true]:bg-muted"
                  onSelect={() => setOpen(false)}
                >
                  {item.label}
                </CommandPrimitive.Item>
              ))}
            </CommandPrimitive.List>
          </CommandPrimitive>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { CommandMenu, ContextMenu, DropdownMenu }
