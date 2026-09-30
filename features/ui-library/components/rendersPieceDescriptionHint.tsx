"use client"

import { CircleHelpIcon } from "lucide-react"

import { ResponsiveTooltip } from "@/components/standard/responsive-tooltip"
import { findComponent } from "@/features/ui-library/domain/catalog/definesGalleryCatalog"

/** A ? beside a piece's title that shows its short description. */
export function RendersPieceDescriptionHint({
  pieceName,
}: {
  pieceName: string
}) {
  const description = findComponent(pieceName)?.description

  if (!description) {
    return null
  }

  return (
    <ResponsiveTooltip
      mode="popover"
      content={description}
      title={pieceName}
      side="bottom"
    >
      <button
        type="button"
        aria-label={`About ${pieceName}`}
        className="inline-flex shrink-0 rounded-full p-1 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <CircleHelpIcon className="size-4" />
      </button>
    </ResponsiveTooltip>
  )
}
