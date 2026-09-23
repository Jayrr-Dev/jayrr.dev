"use client"

import { RendersStandardLibraryDemo } from "@/features/standard-library"

import { RendersActionDemo } from "./rendersActionDemo"
import { RendersContentDemo } from "./rendersContentDemo"
import { RendersFieldDemo } from "./rendersFieldDemo"
import { RendersIconDemo } from "./rendersIconDemo"
import { RendersIndicatorDemo } from "./rendersIndicatorDemo"
import { RendersLabelDemo } from "./rendersLabelDemo"
import { RendersMediaDemo } from "./rendersMediaDemo"
import { RendersSelectionDemo } from "./rendersSelectionDemo"
import { RendersStructureDemo } from "./rendersStructureDemo"
import { RendersShadcnLibraryDemo } from "./rendersShadcnLibraryDemo"
import { RendersSurfaceDemo } from "./rendersSurfaceDemo"
import { RendersTypePropCards } from "./rendersTypePropCards"

export function RendersGalleryPieceDemos({
  pieceName,
  styleName = "Classic",
}: {
  pieceName: string
  styleName?: string
}) {
  if (styleName === "Standard") {
    return (
      <ul className="flex flex-wrap gap-3">
        <RendersStandardLibraryDemo pieceName={pieceName} />
      </ul>
    )
  }

  return (
    <ul className="flex flex-wrap gap-3">
      <RendersContentDemo pieceName={pieceName} />
      <RendersIconDemo pieceName={pieceName} />
      <RendersMediaDemo pieceName={pieceName} />
      <RendersActionDemo pieceName={pieceName} />
      <RendersFieldDemo pieceName={pieceName} />
      <RendersSelectionDemo pieceName={pieceName} />
      <RendersLabelDemo pieceName={pieceName} />
      <RendersIndicatorDemo pieceName={pieceName} />
      <RendersSurfaceDemo pieceName={pieceName} />
      <RendersStructureDemo pieceName={pieceName} />
      <RendersShadcnLibraryDemo pieceName={pieceName} />
      <RendersTypePropCards pieceName={pieceName} />
    </ul>
  )
}
