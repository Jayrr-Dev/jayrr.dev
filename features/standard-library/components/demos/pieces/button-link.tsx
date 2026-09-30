"use client"

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
    </>
  )
}
