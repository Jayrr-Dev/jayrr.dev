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
        <NavigationBar
          className="rounded-b-xl"
          items={DESTINATIONS}
          value={value}
          onValueChange={setValue}
        />
      </RendersDemoCard>
      <RendersDemoCard label="inline" className="w-full max-w-xl p-0">
        <NavigationBar
          className="rounded-b-xl"
          layout="inline"
          items={DESTINATIONS.slice(0, 3)}
          value={value}
          onValueChange={setValue}
        />
      </RendersDemoCard>
    </>
  )
}

export function RendersNavigationBarDemo() {
  return <RendersLiveNavigationBar />
}
