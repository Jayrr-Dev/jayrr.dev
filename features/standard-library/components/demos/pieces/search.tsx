"use client"

import { ControlBar } from "@/components/standard/control-bar"
import { Dialog } from "@/components/standard/dialog"
import { Search } from "@/components/standard/search"
import { Select } from "@/components/standard/select"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersSearchDemo() {
  return (
    <>
      <RendersDemoCard label="Search">
        <Search placeholder="Search pieces" />
      </RendersDemoCard>
      <RendersDemoCard label="clearable">
        <Search placeholder="Search pieces" defaultValue="button" clearable />
      </RendersDemoCard>
      <RendersDemoCard label="in a dialog">
        <Dialog title="Find a piece" trigger="Search">
          <Search placeholder="Piece name" />
        </Dialog>
      </RendersDemoCard>
      <RendersDemoCard label="in a control bar" className="w-full max-w-xl">
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
    </>
  )
}
