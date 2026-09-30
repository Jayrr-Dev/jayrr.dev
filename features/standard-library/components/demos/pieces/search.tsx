"use client"

import { ControlBar } from "@/components/standard/control-bar"
import { Dialog } from "@/components/standard/dialog"
import { Search } from "@/components/standard/search"
import { Select } from "@/components/standard/select"
import { TextField } from "@/components/standard/text-field"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import { completeFrom } from "@/hooks/use-inline-completion"

const completePieces = completeFrom([
  "Accordion",
  "Autocomplete Input",
  "Avatar",
  "Badge",
  "Button",
  "Button Array",
  "Calendar Heatmap",
  "Carousel",
  "Checkbox",
  "Color Picker",
  "Data Grid",
  "Date Picker",
  "Dialog",
  "Search",
  "Select",
  "Stepper",
  "Switch",
  "Text Field",
  "Toast",
  "Tooltip",
])

export function RendersSearchDemo() {
  return (
    <>
      <RendersDemoCard label="Search">
        <Search placeholder="Search pieces" />
      </RendersDemoCard>
      <RendersDemoCard label="clearable">
        <Search placeholder="Search pieces" defaultValue="button" clearable />
      </RendersDemoCard>
      <RendersDemoCard label="completion (Tab to accept)">
        <Search
          placeholder="Search pieces"
          completion={completePieces}
          clearable
        />
      </RendersDemoCard>
      <RendersDemoCard label="TextField type search">
        <TextField
          type="search"
          aria-label="Search pieces"
          placeholder="Search pieces"
          defaultValue="button"
        />
      </RendersDemoCard>
      <RendersDemoCard label="shortcut">
        <TextField
          type="search"
          aria-label="Search pieces"
          placeholder="Search pieces"
          shortcut="⌘K"
        />
      </RendersDemoCard>
      <RendersDemoCard label="loading">
        <TextField
          type="search"
          aria-label="Search pieces"
          placeholder="Search pieces"
          defaultValue="butt"
          loading
        />
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
