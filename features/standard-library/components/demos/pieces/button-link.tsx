"use client"

import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import { ButtonLink } from "@/components/standard/button-link"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersButtonLinkDemo() {
  return (
    <>
      <RendersDemoCard>
        <ButtonLink href="#gallery">Open gallery</ButtonLink>
      </RendersDemoCard>
      <RendersDemoCard label="docs">
        <ButtonLink href="#docs">Read docs</ButtonLink>
      </RendersDemoCard>
      <RendersDemoCard label="Button href">
        <Button
          href="#gallery"
          trailing={<ArrowRightIcon className="size-4" />}
        >
          Open gallery
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="Button href · tone link">
        <Button href="#docs" tone="link">
          Read docs
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="Button href · disabled">
        <Button href="#locked" tone="outline" disabled>
          Locked
        </Button>
      </RendersDemoCard>
    </>
  )
}
