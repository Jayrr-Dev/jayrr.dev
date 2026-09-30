"use client"

import { Progress } from "@/components/standard/progress"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersProgressDemo() {
  return (
    <>
      <RendersDemoCard>
        <Progress value={25} className="w-full" />
      </RendersDemoCard>
      <RendersDemoCard label="value 70">
        <Progress value={70} className="w-full" />
      </RendersDemoCard>
      <RendersDemoCard label="value 100">
        <Progress value={100} className="w-full" />
      </RendersDemoCard>
    </>
  )
}
