"use client"

import { ControlBar } from "@/components/standard/control-bar"
import { RefreshButton } from "@/components/standard/refresh-button"
import { Search } from "@/components/standard/search"
import { Select } from "@/components/standard/select"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersControlBarDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <ControlBar>
          <Search size="sm" placeholder="Filter" />
          <Select
            placeholder="Owner"
            options={[
              { value: "all", label: "All" },
              { value: "mine", label: "Mine" },
            ]}
          />
        </ControlBar>
      </RendersDemoCard>
      <RendersDemoCard label="refresh only" className="w-full max-w-xl">
        <ControlBar>
          <RefreshButton />
        </ControlBar>
      </RendersDemoCard>
    </>
  )
}
