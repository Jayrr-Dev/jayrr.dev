"use client"

import { Textarea } from "@/components/standard/textarea"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersTextareaDemo() {
  return (
    <>
      <RendersDemoCard label="Textarea">
        <Textarea aria-label="Notes" placeholder="Notes" />
      </RendersDemoCard>
      <RendersDemoCard label="invalid">
        <Textarea aria-label="Notes" placeholder="Notes" invalid />
      </RendersDemoCard>
    </>
  )
}
