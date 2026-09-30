"use client"

import { EmailButton } from "@/components/standard/email-button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersEmailButtonDemo() {
  return (
    <>
      <RendersDemoCard label="compose · subject and body">
        <EmailButton
          to="hello@example.com"
          subject="Project enquiry"
          body={"Hi there,\n\nI'd like to talk about a project."}
        />
      </RendersDemoCard>
      <RendersDemoCard label="copy address">
        <EmailButton to="hello@example.com" action="copy" />
      </RendersDemoCard>
      <RendersDemoCard label="icon only">
        <div className="flex gap-2">
          <EmailButton iconOnly to="hello@example.com" />
          <EmailButton
            iconOnly
            shape="circle"
            tone="quiet"
            to="hello@example.com"
            action="copy"
          />
        </div>
      </RendersDemoCard>
    </>
  )
}
