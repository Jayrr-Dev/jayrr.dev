"use client"

import { useState } from "react"

import { Button } from "@/components/standard/button"
import { ConfirmDialog, TabbedDialog } from "@/components/standard/confirm-dialog"
import { Dialog } from "@/components/standard/dialog"
import { FilterSelect } from "@/components/standard/filter-select"
import { InfoIcon } from "@/components/standard/info-icon"
import { CommandMenu, ContextMenu, DropdownMenu } from "@/components/standard/menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"
import { Search } from "@/components/standard/search"
import { Sheet } from "@/components/standard/sheet"
import { Tooltip } from "@/components/standard/tooltip"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const MENU_ITEMS = [
  { id: "archive", label: "Archive" },
  { id: "delete", label: "Delete", tone: "danger" as const },
]

export function RendersStandardOverlayDemo({
  pieceName,
}: {
  pieceName: string
}) {
  const [held, setHeld] = useState("")

  if (pieceName === "Dialog") {
    return (
      <RendersDemoCard label="Dialog">
        <Dialog
          title="Share this piece"
          description="The dialog sits over the gallery."
          trigger="Open dialog"
        />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Dialog Simple Search") {
    return (
      <RendersDemoCard label="Dialog · search">
        <Dialog title="Find a piece" trigger="Search">
          <Search placeholder="Piece name" />
        </Dialog>
      </RendersDemoCard>
    )
  }

  if (pieceName === "Confirm Dialog") {
    return (
      <RendersDemoCard label="Confirm dialog">
        <ConfirmDialog
          title="Remove this piece?"
          description="Confirm closes the dialog after you choose."
          trigger="Remove piece"
          confirmLabel="Remove"
          onConfirm={() => setHeld("Removed")}
        />
        {held ? <span className="text-xs">{held}</span> : null}
      </RendersDemoCard>
    )
  }

  if (pieceName === "Alert Dialog") {
    return (
      <RendersDemoCard label="Confirm dialog · alert">
        <ConfirmDialog
          title="Leave without saving?"
          description="Same confirm shell. The action is the alert."
          trigger="Leave"
          confirmLabel="Leave"
          onConfirm={() => setHeld("Left")}
        />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Bulk Hold Modal") {
    return (
      <RendersDemoCard label="Confirm dialog · hold">
        <ConfirmDialog
          title="Hold these jobs?"
          description="They drop out of the open list."
          trigger="Hold"
          confirmLabel="Hold"
          onConfirm={() => setHeld("Held")}
        />
        {held ? <span className="text-xs">{held}</span> : null}
      </RendersDemoCard>
    )
  }

  if (pieceName === "Tabbed Dialog") {
    return (
      <RendersDemoCard label="Tabbed dialog">
        <TabbedDialog
          title="Settings"
          tabs={[
            { id: "general", label: "General", body: "Name and defaults." },
            { id: "access", label: "Access", body: "Who can see this." },
          ]}
        />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Config Dialog") {
    return (
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
    )
  }

  if (pieceName === "Wizard" || pieceName === "Popover Wizard") {
    return (
      <RendersDemoCard label="Tabbed dialog · steps">
        <TabbedDialog
          title="Wizard"
          trigger="Start"
          tabs={[
            { id: "one", label: "1", body: "Pick a job." },
            { id: "two", label: "2", body: "Enter hours." },
            { id: "three", label: "3", body: "Save." },
          ]}
        />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Sheet") {
    return (
      <RendersDemoCard label="Sheet">
        <Sheet title="Filters">
          <FilterSelect
            placeholder="Status"
            options={[
              { value: "open", label: "Open" },
              { value: "done", label: "Done" },
            ]}
          />
        </Sheet>
      </RendersDemoCard>
    )
  }

  if (pieceName === "Popover" || pieceName === "Popover Column") {
    return (
      <RendersDemoCard label="Popover">
        <Popover>
          <PopoverTrigger asChild>
            <Button tone="outline" size="sm">
              Open popover
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <p className="text-xs font-medium">Column</p>
            <p className="text-xs text-muted-foreground">
              Click opens this panel. It is not a hover tip.
            </p>
          </PopoverContent>
        </Popover>
      </RendersDemoCard>
    )
  }

  if (pieceName === "Icon Popover") {
    return (
      <RendersDemoCard label="Popover · info">
        <InfoIcon
          type="popover"
          label="Tip"
          body="Click the i. The note sits over the page."
        />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Tooltip") {
    return (
      <RendersDemoCard label="Tooltip">
        <Tooltip label="Hover me" body="This shows on hover, not on click." />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Validation Tooltip") {
    return (
      <RendersDemoCard label="Tooltip · danger">
        <Tooltip
          label="Job number"
          body="Job number is required."
          tone="danger"
        />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Dropdown Menu") {
    return (
      <RendersDemoCard label="Dropdown menu">
        <DropdownMenu label="Actions" items={MENU_ITEMS} />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Context Menu") {
    return (
      <RendersDemoCard label="Context menu">
        <ContextMenu items={MENU_ITEMS} />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Command") {
    return (
      <RendersDemoCard label="Command">
        <CommandMenu
          items={[
            { id: "table", label: "Open table" },
            { id: "grid", label: "Open grid" },
            { id: "sheet", label: "Open sheet" },
          ]}
        />
      </RendersDemoCard>
    )
  }

  return (
    <RendersDemoCard label="Not built">
      <span className="text-xs text-muted-foreground">{pieceName} is not built yet.</span>
    </RendersDemoCard>
  )
}
