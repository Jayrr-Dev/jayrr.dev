"use client"

import {
  RendersStandardGridDemo as RendersStandardGridPanels,
  RendersStandardHybridDemo,
} from "@/features/standard-library/components/demos/rendersStandardTableGridDemo"

export function RendersStandardGridDemo() {
  return (
    <>
      <RendersStandardGridPanels />
      <RendersStandardHybridDemo />
    </>
  )
}
