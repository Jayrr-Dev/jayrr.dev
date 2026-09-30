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
              <StepTrigger className="flex items-center gap-2 p-1">
                <StepIndicator size="sm" />
                <StepTitle className="text-xs">{title}</StepTitle>
              </StepTrigger>
              {index < TITLES.length - 1 ? <StepSeparator className="mx-1" /> : null}
            </Step>
          ))}
        </Steps>
      </RendersDemoCard>
      <RendersDemoCard label="indicators only">
        <Steps value={value} onValueChange={setValue} className="w-48">
          {TITLES.map((title, index) => (
            <Step
              key={title}
              index={index}
              className={
                index < TITLES.length - 1 ? "flex flex-1 items-center" : "flex"
              }
            >
              <StepTrigger aria-label={title}>
                <StepIndicator shape="square" />
              </StepTrigger>
              {index < TITLES.length - 1 ? <StepSeparator className="mx-2" /> : null}
            </Step>
          ))}
        </Steps>
      </RendersDemoCard>
      <RendersDemoCard label="dots · no indicator">
        <Steps value={value} onValueChange={setValue} className="gap-1.5">
          {TITLES.map((title, index) => (
            <Step key={title} index={index} className="flex">
              <StepTrigger aria-label={title} className="flex h-4 items-center rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 transition-all group-data-[state=active]/step:w-5 group-data-[state=active]/step:bg-primary group-data-[state=complete]/step:bg-primary/50" />
              </StepTrigger>
            </Step>
          ))}
        </Steps>
      </RendersDemoCard>
      <RendersDemoCard label="segments · not interactive">
        <Steps value={value} interactive={false} className="w-64 gap-1">
          {TITLES.map((title, index) => (
            <Step
              key={title}
              index={index}
              className="h-1 flex-1 rounded-full bg-muted transition-colors data-[state=active]:bg-primary data-[state=complete]:bg-primary"
            />
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
                className="flex gap-3"
              >
                <span className="flex flex-col items-center">
                  <StepIndicator size="sm" />
                  {last ? null : <StepSeparator className="my-1" />}
                </span>
                <span className={last ? "flex flex-col" : "flex flex-col pb-4"}>
                  <StepTitle>{item.title}</StepTitle>
                  <StepDescription>{item.description}</StepDescription>
                </span>
              </Step>
            )
          })}
        </Steps>
      </RendersDemoCard>
    </>
  )
}
