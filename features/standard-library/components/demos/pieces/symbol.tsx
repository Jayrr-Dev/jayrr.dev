"use client"

import { StarIcon } from "lucide-react"

import { Symbol } from "@/components/standard/symbol"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersSymbolDemo() {
  return (
    <RendersDemoCard label="Symbol">
      <Symbol>
        <StarIcon />
      </Symbol>
    </RendersDemoCard>
  )
}
