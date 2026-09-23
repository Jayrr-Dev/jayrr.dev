"use client"

import { Button } from "@/components/ui/button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group"

import { RendersDemoCard } from "./rendersDemoCard"

export function RendersActionDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Button") {
    return (
      <>
        <RendersDemoCard>
          <Button>Save</Button>
        </RendersDemoCard>
        <RendersDemoCard>
          <Button variant="outline">Cancel</Button>
        </RendersDemoCard>
        <RendersDemoCard>
          <Button variant="destructive">Delete</Button>
        </RendersDemoCard>
        <RendersDemoCard>
          <ButtonGroup>
            <Button variant="outline">Left</Button>
            <ButtonGroupSeparator />
            <Button variant="outline">Right</Button>
          </ButtonGroup>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Link") {
    return (
      <>
        <RendersDemoCard>
          <Button variant="link">Open docs</Button>
        </RendersDemoCard>
        <RendersDemoCard>
          <Button variant="ghost">Browse gallery</Button>
        </RendersDemoCard>
      </>
    )
  }

  return null
}
