"use client"

import { Group, Panel, Separator } from "react-resizable-panels"

function Resizable({
  left = "Hours",
  right = "Cost",
}: {
  left?: string
  right?: string
}) {
  return (
    <Group
      orientation="horizontal"
      className="h-24 w-full overflow-hidden rounded-lg border border-border"
    >
      <Panel defaultSize={50} minSize={20} className="p-2 text-xs">
        {left}
      </Panel>
      <Separator className="w-1 bg-border" />
      <Panel defaultSize={50} minSize={20} className="p-2 text-xs">
        {right}
      </Panel>
    </Group>
  )
}

export { Resizable }
