"use client"

import { useState } from "react"

import {
  Step,
  StepDescription,
  StepIndicator,
  Steps,
  StepSeparator,
  StepTitle,
  StepTrigger,
} from "@/components/standard/step"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const TITLES = ["Details", "Confirm", "Done"]

const CHECKLIST = [
  { title: "Create a project", description: "Name it and pick a region" },
  { title: "Invite your team", description: "Add people by email" },
  { title: "Deploy", description: "Push your first build" },
]

export function RendersStepsDemo() {
  const [value, setValue] = useState(1)

  return (
    <>
      <RendersDemoCard label="Steps">
        <Steps value={value} onValueChange={setValue} className="w-64">
          {TITLES.map((title, index) => (
            <Step
              key={title}
              index={index}
              className={
                index < TITLES.length - 1 ? "flex flex-1 items-center" : "flex"
              }
            >
              <StepTrigger>
                <span className="flex items-center gap-2 p-1">
                  <StepIndicator size="sm" />
                  <StepTitle size="sm">{title}</StepTitle>
                </span>
              </StepTrigger>
              {index < TITLES.length - 1 ? <StepSeparator className="mx-1" /> : null}
            </Step>
          ))}
        </Steps>
      </RendersDemoCard>
      <RendersDemoCard label="cards · styled by state">
        <Steps value={value} onValueChange={setValue} className="w-72 gap-2">
          {TITLES.map((title, index) => (
            <Step key={title} index={index} className="flex flex-1">
              <StepTrigger className="flex flex-1 flex-col items-start gap-0.5 rounded-lg border px-2.5 py-2 text-start transition-colors group-data-[state=active]/step:border-primary group-data-[state=active]/step:bg-primary/5 group-data-[state=upcoming]/step:opacity-60">
                <span className="text-xs text-muted-foreground tabular-nums">
                  Step {index + 1}
                </span>
                <StepTitle>{title}</StepTitle>
              </StepTrigger>
            </Step>
          ))}
        </Steps>
      </RendersDemoCard>
      <RendersDemoCard label="custom markers">
        <Steps value={value} onValueChange={setValue} className="w-56">
          {TITLES.map((title, index) => (
            <Step
              key={title}
              index={index}
              className={
                index < TITLES.length - 1 ? "flex flex-1 items-center" : "flex"
              }
            >
              <StepTrigger aria-label={title}>
                <StepIndicator shape="square">{title[0]}</StepIndicator>
              </StepTrigger>
              {index < TITLES.length - 1 ? <StepSeparator className="mx-2" /> : null}
            </Step>
          ))}
        </Steps>
      </RendersDemoCard>
      <RendersDemoCard label="vertical checklist · status">
        <Steps value={1} orientation="vertical" interactive={false} className="w-64">
          {CHECKLIST.map((item, index) => {
            const last = index === CHECKLIST.length - 1

            return (
              <Step
                key={item.title}
                index={index}
                status={index === 1 ? "loading" : undefined}
              >
                <div className="flex gap-3">
                  <span className="flex flex-col items-center">
                    <StepIndicator size="sm" />
                    {last ? null : <StepSeparator className="my-1" />}
                  </span>
                  <span className={last ? "flex flex-col" : "flex flex-col pb-4"}>
                    <StepTitle>{item.title}</StepTitle>
                    <StepDescription>{item.description}</StepDescription>
                  </span>
                </div>
              </Step>
            )
          })}
        </Steps>
      </RendersDemoCard>
    </>
  )
}
