"use client"

import { Children, Fragment, isValidElement, type ReactNode } from "react"

import { Masonry } from "@/components/ui/masonry"
import { resolvesStandardDemo } from "@/features/standard-library"
import { findComponent } from "@/features/ui-library/domain/catalog/definesGalleryCatalog"

import { RendersActionDemo } from "./rendersActionDemo"
import { RendersChartDemo } from "./rendersChartDemo"
import { RendersContentDemo } from "./rendersContentDemo"
import { RendersFieldDemo } from "./rendersFieldDemo"
import { RendersIconDemo } from "./rendersIconDemo"
import { RendersIndicatorDemo } from "./rendersIndicatorDemo"
import { RendersLabelDemo } from "./rendersLabelDemo"
import { RendersMasonryDemo } from "./rendersMasonryDemo"
import { RendersMediaDemo } from "./rendersMediaDemo"
import { RendersSelectionDemo } from "./rendersSelectionDemo"
import { RendersStructureDemo } from "./rendersStructureDemo"
import { RendersShadcnLibraryDemo } from "./rendersShadcnLibraryDemo"
import { RendersSurfaceDemo } from "./rendersSurfaceDemo"
import { RendersTypePropCards } from "./rendersTypePropCards"

export function RendersGalleryPieceDemos({ pieceName }: { pieceName: string }) {
  const sets = findComponent(pieceName)?.demos ?? ["classic"]
  const demos = [
    ...(sets.includes("classic") ? classicDemos : []),
    ...(sets.includes("standard") ? [resolvesStandardDemo(pieceName)] : []),
  ]

  // Called as plain functions (they hold no hooks) so Masonry receives the
  // individual demo cards from each fragment instead of one opaque element.
  const cards = demos.map((renders, index) => (
    <Fragment key={index}>{renders({ pieceName })}</Fragment>
  ))

  if (countsCards(cards) <= 1) {
    // min-w-0: the dialog body is a grid, and wide scrollers would otherwise
    // stretch its column to their full content width.
    return (
      <div className="flex w-full min-w-0 flex-col gap-3">
        {cards}
      </div>
    )
  }

  return (
    <Masonry minColumnWidth={256} className="min-w-0 gap-3">
      {cards}
    </Masonry>
  )
}

const classicDemos: ((props: { pieceName: string }) => ReactNode)[] = [
  RendersChartDemo,
  RendersContentDemo,
  RendersIconDemo,
  RendersMediaDemo,
  RendersActionDemo,
  RendersFieldDemo,
  RendersSelectionDemo,
  RendersLabelDemo,
  RendersIndicatorDemo,
  RendersSurfaceDemo,
  RendersStructureDemo,
  RendersMasonryDemo,
  RendersShadcnLibraryDemo,
  RendersTypePropCards,
]

function countsCards(node: ReactNode): number {
  return Children.toArray(node).reduce<number>((total, child) => {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
      return total + countsCards(child.props.children)
    }
    return total + 1
  }, 0)
}
