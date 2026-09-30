"use client"

import { RendersStandardLayerDemo } from "@/features/standard-library/components/demos/rendersStandardLayerDemo"

// Called as a function so the gallery receives the individual demo cards.
export function RendersPatternDemo() {
  return RendersStandardLayerDemo({ pieceName: "Pattern" })
}
