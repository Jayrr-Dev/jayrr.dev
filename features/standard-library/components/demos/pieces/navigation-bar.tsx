"use client"

import { useState } from "react"

import { NavigationBar } from "@/components/standard/navigation"
import { DESTINATIONS } from "@/features/standard-library/components/demos/shared/definesNavigationDestinations"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersLiveNavigationBar() {
  const [value, setValue] = useState("home")

  return (
    <>
      <RendersDemoCard className="w-full max-w-md p-0">
        <div className="overflow-hidden rounded-b-xl">
          <NavigationBar
            items={DESTINATIONS}
            value={value}
            onValueChange={setValue}
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="inline" className="w-full max-w-xl p-0">
        <div className="overflow-hidden rounded-b-xl">
          <NavigationBar
            layout="inline"
            items={DESTINATIONS.slice(0, 3)}
            value={value}
            onValueChange={setValue}
          />
        </div>
      </RendersDemoCard>
    </>
  )
}

export function RendersNavigationBarDemo() {
  return <RendersLiveNavigationBar />
}
