"use client"

import { TabbedDialog } from "@/components/standard/tabbed-dialog"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersTabbedDialogDemo() {
  return (
    <>
      <RendersDemoCard label="Tabbed dialog">
        <TabbedDialog
          title="Settings"
          tabs={[
            { id: "general", label: "General", body: "Name and defaults." },
            { id: "access", label: "Access", body: "Who can see this." },
          ]}
        />
      </RendersDemoCard>
      <RendersDemoCard label="Tabbed dialog · config">
        <TabbedDialog
          title="Config"
          trigger="Open config"
          tabs={[
            { id: "rates", label: "Rates", body: "Hourly and lump sum." },
            { id: "tax", label: "Tax", body: "Which code applies." },
          ]}
        />
      </RendersDemoCard>
    </>
  )
}
