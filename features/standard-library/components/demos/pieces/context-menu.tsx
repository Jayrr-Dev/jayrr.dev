"use client"

import { ContextMenu } from "@/components/standard/menu"
import { RendersActionWheelContextDemo } from "@/features/standard-library/components/demos/rendersStandardActionWheelDemo"
import {
  MENU_GROUPED_ENTRIES,
  MENU_ITEMS,
  MENU_ITEMS_DISABLED,
  MENU_ITEMS_WITH_ICONS,
} from "@/features/standard-library/components/demos/shared/definesMenuItems"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersContextMenuDemo() {
  return (
    <>
      <RendersDemoCard label="Context menu">
        <ContextMenu items={MENU_ITEMS} />
      </RendersDemoCard>
      <RendersDemoCard label="trigger">
        <ContextMenu
          items={MENU_ITEMS}
          trigger={
            <div className="flex size-24 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
              Right-click card
            </div>
          }
        />
      </RendersDemoCard>
      <RendersDemoCard label="icon · shortcut">
        <ContextMenu label="Right-click for icons" items={MENU_ITEMS_WITH_ICONS} />
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <ContextMenu label="Right-click for disabled" items={MENU_ITEMS_DISABLED} />
      </RendersDemoCard>
      <RendersDemoCard label="groups · separators">
        <ContextMenu label="Right-click for groups" items={MENU_GROUPED_ENTRIES} />
      </RendersDemoCard>
      <RendersDemoCard label="action wheel" className="w-full">
        <RendersActionWheelContextDemo />
      </RendersDemoCard>
    </>
  )
}
