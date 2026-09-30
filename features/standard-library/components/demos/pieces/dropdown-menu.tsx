"use client"

import { useState } from "react"
import { EllipsisIcon } from "lucide-react"

import { DropdownMenu } from "@/components/standard/menu"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import {
  MENU_GROUPED_ENTRIES,
  MENU_ITEMS,
  MENU_ITEMS_DISABLED,
  MENU_ITEMS_WITH_ICONS,
} from "@/features/standard-library/components/demos/shared/definesMenuItems"

function RendersDropdownSelectDemo() {
  const [picked, setPicked] = useState("Nothing yet")

  return (
    <div className="flex flex-col items-center gap-2">
      <DropdownMenu
        label="Pick one"
        items={MENU_ITEMS_WITH_ICONS.map((item) => ({
          ...item,
          onSelect: () => setPicked(item.label),
        }))}
      />
      <span className="text-xs text-muted-foreground">Picked: {picked}</span>
    </div>
  )
}

export function RendersDropdownMenuDemo() {
  return (
    <>
      <RendersDemoCard label="Dropdown menu">
        <DropdownMenu label="Actions" items={MENU_ITEMS} />
      </RendersDemoCard>
      <RendersDemoCard label="trigger">
        <DropdownMenu
          items={MENU_ITEMS}
          align="end"
          trigger={
            <button
              type="button"
              aria-label="More actions"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <EllipsisIcon aria-hidden className="size-4" />
            </button>
          }
        />
      </RendersDemoCard>
      <RendersDemoCard label="icon · shortcut">
        <DropdownMenu label="Edit" items={MENU_ITEMS_WITH_ICONS} />
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <DropdownMenu label="Actions" items={MENU_ITEMS_DISABLED} />
      </RendersDemoCard>
      <RendersDemoCard label="groups · separators">
        <DropdownMenu label="File" items={MENU_GROUPED_ENTRIES} />
      </RendersDemoCard>
      <RendersDemoCard label="onSelect">
        <RendersDropdownSelectDemo />
      </RendersDemoCard>
    </>
  )
}
