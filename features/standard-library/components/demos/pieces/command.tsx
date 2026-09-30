"use client"

import { LayoutGridIcon, SearchIcon, SheetIcon, TableIcon } from "lucide-react"

import { CommandMenu } from "@/components/standard/menu"
import {
  MENU_GROUPED_ENTRIES,
  MENU_ITEMS_DISABLED,
} from "@/features/standard-library/components/demos/shared/definesMenuItems"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersCommandDemo() {
  return (
    <>
      <RendersDemoCard label="Command">
        <CommandMenu
          items={[
            { id: "table", label: "Open table" },
            { id: "grid", label: "Open grid" },
            { id: "sheet", label: "Open sheet" },
          ]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="trigger">
        <CommandMenu
          trigger={
            <>
              <SearchIcon aria-hidden className="size-4" />
              Search
              <kbd className="ml-2 text-xs text-muted-foreground">⌘K</kbd>
            </>
          }
          items={[
            { id: "table", label: "Open table" },
            { id: "grid", label: "Open grid" },
          ]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="icon · shortcut">
        <CommandMenu
          trigger="Open views"
          placeholder="Search views"
          items={[
            { id: "table", label: "Open table", icon: <TableIcon />, shortcut: "⌘1" },
            { id: "grid", label: "Open grid", icon: <LayoutGridIcon />, shortcut: "⌘2" },
            { id: "sheet", label: "Open sheet", icon: <SheetIcon />, shortcut: "⌘3" },
          ]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <CommandMenu trigger="Open actions" placeholder="Search actions" items={MENU_ITEMS_DISABLED} />
      </RendersDemoCard>
      <RendersDemoCard label="groups · separators">
        <CommandMenu trigger="Open grouped" placeholder="Search actions" items={MENU_GROUPED_ENTRIES} />
      </RendersDemoCard>
    </>
  )
}
