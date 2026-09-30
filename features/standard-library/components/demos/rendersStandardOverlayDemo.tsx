"use client"

import { useState } from "react"
import {
  BriefcaseIcon,
  ClockIcon,
  NotebookPenIcon,
  SaveIcon,
} from "lucide-react"

import { Button } from "@/components/standard/button"
import {
  ConfirmDialog,
  TabbedDialog,
} from "@/components/standard/confirm-dialog"
import { Dialog } from "@/components/standard/dialog"
import { Select } from "@/components/standard/select"
import { InfoIcon } from "@/components/standard/info-icon"
import {
  CommandMenu,
  ContextMenu,
  DropdownMenu,
} from "@/components/standard/menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"
import { PopoverWizard } from "@/components/standard/popover-wizard"
import { Search } from "@/components/standard/search"
import { Sheet } from "@/components/standard/sheet"
import { TextField } from "@/components/standard/text-field"
import { Tooltip } from "@/components/standard/tooltip"
import { Wizard } from "@/components/standard/wizard"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

import { RendersActionWheelContextDemo } from "./rendersStandardActionWheelDemo"

function rendersStepText(text: string) {
  return <p className="text-sm text-muted-foreground">{text}</p>
}

const SIMPLE_STEPS = [
  { id: "job", title: "Job", content: rendersStepText("Pick a job.") },
  { id: "hours", title: "Hours", content: rendersStepText("Enter hours.") },
  { id: "save", title: "Save", content: rendersStepText("Check and save.") },
]

const ICON_STEPS = [
  {
    id: "job",
    title: "Job",
    icon: BriefcaseIcon,
    content: rendersStepText("Pick a job."),
  },
  {
    id: "hours",
    title: "Hours",
    icon: ClockIcon,
    content: rendersStepText("Enter hours."),
  },
  {
    id: "notes",
    title: "Notes",
    icon: NotebookPenIcon,
    content: rendersStepText("Add a note."),
  },
  {
    id: "save",
    title: "Save",
    icon: SaveIcon,
    content: rendersStepText("Check and save."),
  },
]

const TOUR_STEPS = [
  {
    id: "search",
    title: "Search",
    subtitle: "Find any piece by name.",
    content: "Type in the box at the top. Results filter as you type.",
  },
  {
    id: "open",
    title: "Open a piece",
    subtitle: "Every card opens its demos.",
    content: "Click a card to see each variant side by side.",
  },
  {
    id: "copy",
    title: "Copy it",
    subtitle: "Install from the registry.",
    content: "Each piece has a shadcn add command you can paste.",
  },
]

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
      <>
        <RendersDemoCard label="Dialog">
          <Dialog
            title="Share this piece"
            description="Minimize it to the corner, maximize it, or close it."
            trigger="Open dialog"
            controls={["minimize", "maximize", "close"]}
          />
        </RendersDemoCard>
        <RendersDemoCard label="Dialog · gutter controls">
          <Dialog
            title="Share this piece"
            description="Controls sit in the corner gutter, clear of the title."
            trigger="Open dialog"
            controls={["minimize", "maximize", "close"]}
            controlsPlacement="gutter"
          />
        </RendersDemoCard>
      </>
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

  if (pieceName === "Wizard") {
    return (
      <>
        <RendersWizardDemo />
        <RendersDemoCard label="Wizard · dots · no lines">
          <Wizard
            title="Welcome"
            trigger="Dots"
            steps={SIMPLE_STEPS}
            indicator="dots"
            divided={false}
            maxWidth="sm"
            nextLabel={["Next", "Next", "Done"]}
          />
        </RendersDemoCard>
        <RendersDemoCard label="Wizard · bar">
          <Wizard
            title="New job"
            trigger="Bar"
            steps={SIMPLE_STEPS}
            indicator="bar"
            maxWidth="sm"
          />
        </RendersDemoCard>
        <RendersDemoCard label="Wizard · numbers only">
          <Wizard
            title="New job"
            trigger="Numbers"
            steps={SIMPLE_STEPS}
            hideStepTitles
            hideConnectors
            divided={false}
            maxWidth="sm"
          />
        </RendersDemoCard>
        <RendersDemoCard label="Wizard · icons · compact">
          <Wizard
            title="New job"
            trigger="Icons"
            steps={ICON_STEPS}
            compact
            maxWidth="lg"
          />
        </RendersDemoCard>
        <RendersDemoCard label="Wizard · no progress">
          <Wizard
            title="Confirm export"
            trigger="Plain"
            steps={SIMPLE_STEPS}
            indicator="none"
            divided={false}
            maxWidth="sm"
          />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Popover Wizard") {
    return (
      <>
        <RendersDemoCard label="Popover wizard · tour">
          <PopoverWizard trigger="Take the tour" steps={TOUR_STEPS} />
        </RendersDemoCard>
        <RendersDemoCard label="Popover wizard · jump from dots">
          <PopoverWizard
            trigger="Quick setup"
            steps={TOUR_STEPS}
            jumpFromDots
            width="sm"
          />
        </RendersDemoCard>
        <RendersDemoCard label="Popover wizard · count · custom labels">
          <PopoverWizard
            trigger="Walkthrough"
            steps={TOUR_STEPS}
            dots={false}
            showCount
            nextLabel={["Next", "Next", "Finish"]}
          />
        </RendersDemoCard>
        <RendersDemoCard label="Popover wizard · side right">
          <PopoverWizard
            trigger="Open to the side"
            steps={TOUR_STEPS}
            side="right"
            align="center"
            width="sm"
          />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Sheet") {
    return (
      <RendersDemoCard label="Sheet">
        <Sheet title="Filters">
          <Select
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
      <>
        <RendersDemoCard label="Context menu">
          <ContextMenu items={MENU_ITEMS} />
        </RendersDemoCard>
        <RendersDemoCard label="action wheel" className="w-full">
          <RendersActionWheelContextDemo />
        </RendersDemoCard>
      </>
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
      <span className="text-xs text-muted-foreground">
        {pieceName} is not built yet.
      </span>
    </RendersDemoCard>
  )
}

/** Three-step job entry: the job is required, hours must be a number. */
function RendersWizardDemo() {
  const [open, setOpen] = useState(false)
  const [job, setJob] = useState("")
  const [hours, setHours] = useState("")
  const [saved, setSaved] = useState("")
  const hoursValue = Number(hours)

  return (
    <RendersDemoCard label="Wizard">
      <Wizard
        title="Log hours"
        trigger="Start"
        open={open}
        onOpenChange={setOpen}
        maxWidth="md"
        steps={[
          {
            id: "job",
            title: "Job",
            required: true,
            canProceed: () => job.trim().length > 0,
            content: (
              <label className="flex flex-col gap-1.5 text-sm">
                Job number
                <TextField
                  value={job}
                  placeholder="J-1024"
                  onChange={(event) => setJob(event.target.value)}
                />
              </label>
            ),
          },
          {
            id: "hours",
            title: "Hours",
            required: true,
            canProceed: () => hoursValue > 0 && hoursValue <= 24,
            content: (
              <label className="flex flex-col gap-1.5 text-sm">
                Hours worked
                <TextField
                  value={hours}
                  inputMode="decimal"
                  placeholder="8"
                  onChange={(event) => setHours(event.target.value)}
                />
              </label>
            ),
          },
          {
            id: "review",
            title: "Review",
            content: (
              <p className="text-sm text-muted-foreground">
                {hoursValue} h on {job}. Complete saves the entry.
              </p>
            ),
          },
        ]}
        onBeforeNext={(stepIndex) =>
          stepIndex === 2
            ? new Promise((resolve) => setTimeout(resolve, 600))
            : undefined
        }
        nextLabel={["Enter hours", "Review", "Save entry"]}
        onComplete={() => {
          setSaved(`Saved ${hoursValue} h on ${job}`)
          setOpen(false)
        }}
      />
      {saved ? <span className="text-xs">{saved}</span> : null}
    </RendersDemoCard>
  )
}
