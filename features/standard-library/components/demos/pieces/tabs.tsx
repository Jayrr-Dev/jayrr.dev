"use client"

import { useState } from "react"

import { TabNavigation } from "@/components/standard/tab-navigation"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const NAV_ITEMS = [
  { id: "events", label: "Events" },
  { id: "reports", label: "Reports" },
  { id: "crew", label: "Crew" },
]

function RendersLiveTabs() {
  const [value, setValue] = useState("events")

  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <TabNavigation
          items={NAV_ITEMS}
          value={value}
          onValueChange={setValue}
        />
      </RendersDemoCard>
      <RendersDemoCard label="selected">
        <span className="text-sm">{value}</span>
      </RendersDemoCard>
    </>
  )
}

export function RendersTabsDemo() {
  return <RendersLiveTabs />
}
