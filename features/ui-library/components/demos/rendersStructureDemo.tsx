"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { RendersDemoCard } from "./rendersDemoCard"

export function RendersStructureDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Separator") {
    return (
      <>
        <RendersDemoCard>
          <div className="flex w-full flex-col gap-3">
            <p className="text-sm">Above</p>
            <Separator />
            <p className="text-sm">Below</p>
          </div>
        </RendersDemoCard>
        <RendersDemoCard>
          <div className="flex h-8 items-center gap-3 text-sm">
            <span>Left</span>
            <Separator orientation="vertical" />
            <span>Right</span>
          </div>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Stack") {
    return (
      <>
        <RendersDemoCard>
          <div className="flex w-full flex-col gap-2">
            <Button variant="outline">First</Button>
            <Button variant="outline">Second</Button>
            <Button variant="outline">Third</Button>
          </div>
        </RendersDemoCard>
        <RendersDemoCard label="row">
          <div className="flex w-full items-center gap-2">
            <Button variant="outline">One</Button>
            <Button variant="outline">Two</Button>
            <Button>Go</Button>
          </div>
        </RendersDemoCard>
      </>
    )
  }

  return null
}
