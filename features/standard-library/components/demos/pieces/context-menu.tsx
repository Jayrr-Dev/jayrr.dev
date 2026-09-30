"use client"

import { ContextMenu } from "@/components/standard/menu"
import { RendersActionWheelContextDemo } from "@/features/standard-library/components/demos/rendersStandardActionWheelDemo"
import { MENU_ITEMS } from "@/features/standard-library/components/demos/shared/definesMenuItems"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersContextMenuDemo() {
  return (
    <>
      <RendersDemoCard label="Context menu">
        <ContextMenu items={MENU_ITEMS} />
      </RendersDemoCard>
      <RendersDemoCard label="action wheel" className="w-full">
        <RendersActionWheelContextDemo />
      </RendersDemoCard>
    </>
  )
}
