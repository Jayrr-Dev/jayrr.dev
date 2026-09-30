"use client"

import { useState } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  PartyPopperIcon,
  UserIcon,
} from "lucide-react"

import { Button } from "@/components/standard/button"
import { Stepper, type StepperStep } from "@/components/standard/stepper"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const NUMBERED: StepperStep[] = [
  { id: "one" },
  { id: "two" },
  { id: "three" },
]

const TITLED: StepperStep[] = [
  { id: "details", title: "Details" },
  { id: "confirm", title: "Confirm" },
  { id: "done", title: "Done" },
]

const DESCRIBED: StepperStep[] = [
  { id: "account", title: "Account", description: "Create an account" },
  { id: "profile", title: "Profile", description: "Set up your profile" },
  { id: "complete", title: "Complete", description: "Finish the setup" },
]

const ICONS: StepperStep[] = [
  { id: "details", title: "Details", icon: UserIcon, description: "Who you are" },
  {
    id: "review",
    title: "Review",
    icon: ClipboardCheckIcon,
    description: "Check your answers",
  },
  { id: "done", title: "Done", icon: PartyPopperIcon, description: "All set" },
]

/** A stepper with its own Back and Next, no dialog. */
function RendersInlineFlow() {
  const [step, setStep] = useState(0)
  const last = step === TITLED.length - 1

  return (
    <div className="flex w-full flex-col gap-4">
      <Stepper
        steps={TITLED}
        value={step}
        onValueChange={setStep}
        labelPlacement="bottom"
        shape="square"
      />
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {TITLED[step].title} content
      </div>
      <div className="flex justify-between">
        <Button
          tone="outline"
          size="sm"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          <ChevronLeftIcon aria-hidden className="size-4" />
          Back
        </Button>
        <Button size="sm" disabled={last} onClick={() => setStep(step + 1)}>
          Next
          <ChevronRightIcon aria-hidden className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function RendersStepperDemo() {
  return (
    <>
      <RendersDemoCard label="numbers · square" className="w-full max-w-xl">
        <Stepper steps={NUMBERED} shape="square" labelPlacement="bottom" />
      </RendersDemoCard>
      <RendersDemoCard label="title · labels beside" className="w-full max-w-xl">
        <Stepper steps={TITLED} defaultValue={1} />
      </RendersDemoCard>
      <RendersDemoCard label="title and description · labels under" className="w-full max-w-xl">
        <Stepper steps={DESCRIBED} labelPlacement="bottom" defaultValue={1} />
      </RendersDemoCard>
      <RendersDemoCard label="vertical · icons" className="w-full max-w-xl">
        <Stepper steps={ICONS} orientation="vertical" defaultValue={1} />
      </RendersDemoCard>
      <RendersDemoCard label="responsive · vertical on phones" className="w-full max-w-xl">
        <Stepper
          steps={DESCRIBED}
          orientation="responsive"
          labelPlacement="bottom"
          defaultValue={1}
        />
      </RendersDemoCard>
      <RendersDemoCard label="status · loading and error" className="w-full max-w-xl">
        <div className="flex w-full flex-col gap-6">
          <Stepper
            steps={[
              { id: "upload", title: "Upload" },
              { id: "process", title: "Process", status: "loading" },
              { id: "publish", title: "Publish" },
            ]}
            value={1}
            interactive={false}
          />
          <Stepper
            steps={[
              { id: "upload", title: "Upload" },
              { id: "process", title: "Process", status: "error" },
              { id: "publish", title: "Publish" },
            ]}
            value={1}
            interactive={false}
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="size sm · no numbers" className="w-full max-w-xl">
        <Stepper steps={TITLED} size="sm" showNumbers={false} defaultValue={1} />
      </RendersDemoCard>
      <RendersDemoCard label="variant dots / bar" className="w-full max-w-xl">
        <div className="flex w-full flex-col gap-6">
          <Stepper steps={DESCRIBED} variant="dots" defaultValue={1} />
          <Stepper steps={DESCRIBED} variant="bar" defaultValue={1} />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="with Back and Next" className="w-full max-w-xl">
        <RendersInlineFlow />
      </RendersDemoCard>
    </>
  )
}
