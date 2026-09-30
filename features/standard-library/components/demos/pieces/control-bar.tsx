"use client"

import { ControlBar } from "@/components/standard/control-bar"
import { RefreshButton } from "@/components/standard/refresh-button"
import { Select } from "@/components/standard/select"
import { TextField } from "@/components/standard/text-field"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersControlBarDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <ControlBar>
          <TextField
            type="search"
            size="sm"
            clearable={false}
            aria-label="Filter"
            placeholder="Filter"
          />
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
