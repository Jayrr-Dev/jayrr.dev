"use client"

import { CommandMenu } from "@/components/standard/menu"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersCommandDemo() {
  return (
    <RendersDemoCard label="Command">
      <CommandMenu
        items={[
          { id: "table", label: "Open table" },
          { id: "grid", label: "Open grid" },
          { id: "sheet", label: "Open sheet" },
        ]}
      />
    </RendersDemoCard>
  )
}
