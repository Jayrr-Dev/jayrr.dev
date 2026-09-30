"use client"

import { useState } from "react"

import { TabNavigation } from "@/components/standard/tab-navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  return (
    <>
      <RendersLiveTabs />
      <RendersDemoCard label="TabsList variant line (replaces TabNavigation)">
        <Tabs defaultValue="events" className="w-full">
          <TabsList variant="line">
            {NAV_ITEMS.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {NAV_ITEMS.map((item) => (
            <TabsContent
              key={item.id}
              value={item.id}
              className="text-muted-foreground"
            >
              {item.label} panel
            </TabsContent>
          ))}
        </Tabs>
      </RendersDemoCard>
    </>
  )
}
