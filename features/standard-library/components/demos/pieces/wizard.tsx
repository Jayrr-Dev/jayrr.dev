"use client"

import { useState } from "react"
import {
  BriefcaseIcon,
  ClockIcon,
  NotebookPenIcon,
  SaveIcon,
} from "lucide-react"

import { TextField } from "@/components/standard/text-field"
import { Wizard } from "@/components/standard/wizard"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

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

/** Three-step job entry: the job is required, hours must be a number. */
function RendersLiveWizard() {
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

export function RendersWizardDemo() {
  return (
    <>
      <RendersLiveWizard />
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
