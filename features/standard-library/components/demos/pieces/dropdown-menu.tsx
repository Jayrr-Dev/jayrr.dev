"use client"

import { DropdownMenu } from "@/components/standard/menu"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { MENU_ITEMS } from "@/features/standard-library/components/demos/shared/definesMenuItems"

export function RendersDropdownMenuDemo() {
  return (
    <RendersDemoCard label="Dropdown menu">
      <DropdownMenu label="Actions" items={MENU_ITEMS} />
    </RendersDemoCard>
  )
}
