"use client"

import { useState } from "react"
import {
  ArchiveIcon,
  MaximizeIcon,
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/standard/button"
import { Chip, ChipGroup } from "@/components/standard/chip"
import { ControlBar } from "@/components/standard/control-bar"
import { Increment } from "@/components/standard/increment"
import { Kbd } from "@/components/standard/kbd"
import { RefreshButton } from "@/components/standard/refresh-button"
import { Select } from "@/components/standard/select"
import { Switch } from "@/components/standard/switch"
import { TextField } from "@/components/standard/text-field"
import { Toggle } from "@/components/standard/toggle"
import {
  ToolbarCount,
  ToolbarSelectionCount,
} from "@/components/standard/toolbar-count"
import { VolumeButton } from "@/components/standard/volume-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const JOBS = [
  "Harbor line",
  "North yard",
  "East depot",
  "Ridge road",
  "Mill street",
  "Canal works",
  "Harbor annex",
  "North spur",
]

function RendersFilterBarDemo() {
  const [query, setQuery] = useState("")
  const shown = JOBS.filter((job) =>
    job.toLowerCase().includes(query.toLowerCase())
  ).length

  return (
    <RendersDemoCard label="filters with a live count" className="w-full max-w-xl">
      <ControlBar>
        <TextField
          type="search"
          size="sm"
          clearable={false}
          aria-label="Filter jobs"
          placeholder="Filter jobs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select
          placeholder="Owner"
          options={[
            { value: "all", label: "All" },
            { value: "mine", label: "Mine" },
          ]}
        />
        <span className="ms-auto flex items-center gap-2">
          <ToolbarCount count={shown} total={JOBS.length} noun="job" />
          <RefreshButton />
        </span>
      </ControlBar>
    </RendersDemoCard>
  )
}

function RendersBulkActionsDemo() {
  const [selected, setSelected] = useState(3)

  return (
    <RendersDemoCard label="bulk actions on selection" className="w-full max-w-xl">
      <ControlBar>
        {selected > 0 ? (
          <>
            <ToolbarSelectionCount
              count={selected}
              onClear={() => setSelected(0)}
            />
            <span className="ms-auto flex items-center gap-2">
              <Button
                tone="ghost"
                size="sm"
                leading={<ArchiveIcon className="size-3.5" />}
                onClick={() => setSelected(0)}
              >
                Archive
              </Button>
              <Button
                tone="danger"
                size="sm"
                leading={<Trash2Icon className="size-3.5" />}
                onClick={() => setSelected(0)}
              >
                Delete
              </Button>
            </span>
          </>
        ) : (
          <>
            <ToolbarCount count={24} noun="message" />
            <Button
              tone="outline"
              size="sm"
              className="ms-auto"
              onClick={() => setSelected(3)}
            >
              Select 3
            </Button>
          </>
        )}
      </ControlBar>
    </RendersDemoCard>
  )
}

function RendersPlayerBarDemo() {
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.6)

  return (
    <RendersDemoCard label="media player" className="w-full max-w-xl">
      <ControlBar>
        <Button tone="ghost" size="sm" iconOnly aria-label="Previous">
          <SkipBackIcon className="size-3.5" />
        </Button>
        <Button
          size="sm"
          shape="circle"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => setPlaying((current) => !current)}
        >
          {playing ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
        </Button>
        <Button tone="ghost" size="sm" iconOnly aria-label="Next">
          <SkipForwardIcon className="size-3.5" />
        </Button>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          1:42 / 3:58
        </span>
        <span className="ms-auto flex items-center gap-2">
          <VolumeButton size="sm" value={volume} onValueChange={setVolume} />
          <Select
            aria-label="Speed"
            defaultValue="1"
            options={[
              { value: "0.5", label: "0.5×" },
              { value: "1", label: "1×" },
              { value: "1.5", label: "1.5×" },
              { value: "2", label: "2×" },
            ]}
          />
        </span>
      </ControlBar>
    </RendersDemoCard>
  )
}

function RendersCanvasBarDemo() {
  return (
    <RendersDemoCard label="canvas zoom and snapping" className="w-full max-w-xl">
      <ControlBar>
        <Increment
          label="zoom"
          size="xs"
          defaultValue={100}
          min={25}
          max={400}
          step={25}
          formatText={(value) => `${value}%`}
          format={(value) => `${value}%`}
        />
        <Toggle size="sm" defaultPressed>
          Snap to grid
        </Toggle>
        <Button
          tone="ghost"
          size="sm"
          leading={<MaximizeIcon className="size-3.5" />}
          className="ms-auto"
        >
          Fit
        </Button>
      </ControlBar>
    </RendersDemoCard>
  )
}

function RendersFilterChipsDemo() {
  const [on, setOn] = useState(["Open", "Assigned to me"])
  const filters = ["Open", "Assigned to me", "Overdue", "Has photos"]

  return (
    <RendersDemoCard label="filter chips" className="w-full max-w-xl">
      <ControlBar>
        <ChipGroup aria-label="Filters">
          {filters.map((filter) => (
            <Chip
              key={filter}
              selected={on.includes(filter)}
              onSelectedChange={(selected) =>
                setOn((current) =>
                  selected
                    ? [...current, filter]
                    : current.filter((item) => item !== filter)
                )
              }
            >
              {filter}
            </Chip>
          ))}
        </ChipGroup>
        <Button
          tone="ghost"
          size="sm"
          className="ms-auto"
          disabled={on.length === 0}
          onClick={() => setOn([])}
        >
          Clear
        </Button>
      </ControlBar>
    </RendersDemoCard>
  )
}

function RendersLiveBarDemo() {
  const [live, setLive] = useState(true)

  return (
    <RendersDemoCard label="live toggle and shortcut" className="w-full max-w-xl">
      <ControlBar>
        <Switch
          size="sm"
          label={live ? "Live updates" : "Paused"}
          checked={live}
          onCheckedChange={setLive}
        />
        <span className="ms-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          Search <Kbd>⌘K</Kbd>
        </span>
      </ControlBar>
    </RendersDemoCard>
  )
}

function RendersUnsavedBarDemo() {
  const [changes, setChanges] = useState(3)

  return (
    <RendersDemoCard label="unsaved changes" className="w-full max-w-xl">
      <ControlBar>
        <span className="text-sm text-muted-foreground">
          {changes > 0 ? `${changes} unsaved changes` : "All changes saved"}
        </span>
        <span className="ms-auto flex items-center gap-2">
          <Button
            tone="ghost"
            size="sm"
            disabled={changes === 0}
            onClick={() => setChanges(0)}
          >
            Discard
          </Button>
          <Button
            size="sm"
            disabled={changes === 0}
            onClick={() => setChanges(0)}
          >
            Save
          </Button>
        </span>
      </ControlBar>
    </RendersDemoCard>
  )
}

export function RendersControlBarDemo() {
  return (
    <>
      <RendersFilterBarDemo />
      <RendersBulkActionsDemo />
      <RendersPlayerBarDemo />
      <RendersCanvasBarDemo />
      <RendersFilterChipsDemo />
      <RendersLiveBarDemo />
      <RendersUnsavedBarDemo />
      <RendersDemoCard label="wraps when narrow" className="w-full max-w-xs">
        <ControlBar>
          {["Draft", "Review", "Approved", "Shipped", "Archived"].map(
            (status) => (
              <Chip key={status}>{status}</Chip>
            )
          )}
        </ControlBar>
      </RendersDemoCard>
    </>
  )
}
