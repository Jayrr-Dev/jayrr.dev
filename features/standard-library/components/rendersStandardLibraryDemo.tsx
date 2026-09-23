"use client"

import { findStandardCatalogEntry } from "@/features/standard-library/domain/catalog/definesStandardCatalog"

import { RendersStandardBadgeDemo } from "./demos/rendersStandardBadgeDemo"
import { RendersStandardButtonDemo } from "./demos/rendersStandardButtonDemo"
import { RendersStandardContentDemo } from "./demos/rendersStandardContentDemo"
import { RendersStandardFieldDemo } from "./demos/rendersStandardFieldDemo"
import { RendersStandardOverlayDemo } from "./demos/rendersStandardOverlayDemo"
import { RendersStandardPickerDemo } from "./demos/rendersStandardPickerDemo"
import { RendersStandardSignalDemo } from "./demos/rendersStandardSignalDemo"
import { RendersStandardToggleDemo } from "./demos/rendersStandardToggleDemo"

const BADGE_ICON_NAMES = new Set(["Info Icon", "Question Icon", "Kbd"])

const FIELD_OVERRIDES = new Set(["Standard Toolbar Search Cluster"])

const BADGE_OVERRIDES = new Set(["Badge Icon"])

export function RendersStandardLibraryDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (BADGE_ICON_NAMES.has(pieceName) || BADGE_OVERRIDES.has(pieceName)) {
    return <RendersStandardBadgeDemo pieceName={pieceName} />
  }

  const entry = findStandardCatalogEntry(pieceName)
  const category = entry?.category_key ?? "text"
  const section = entry?.section_key ?? "content"

  if (pieceName === "Standard Toolbar Search Cluster") {
    return <RendersStandardSignalDemo pieceName={pieceName} />
  }

  if (category === "buttons" || category === "icons") {
    return <RendersStandardButtonDemo pieceName={pieceName} />
  }

  if (category === "fields") {
    return <RendersStandardFieldDemo pieceName={pieceName} />
  }

  if (category === "pickers" || category === "scroll") {
    return <RendersStandardPickerDemo pieceName={pieceName} />
  }

  if (category === "toggles") {
    return <RendersStandardToggleDemo pieceName={pieceName} />
  }

  if (category === "badges") {
    return <RendersStandardBadgeDemo pieceName={pieceName} />
  }

  if (section === "overlays") {
    return <RendersStandardOverlayDemo pieceName={pieceName} />
  }

  if (section === "signals") {
    return <RendersStandardSignalDemo pieceName={pieceName} />
  }

  return <RendersStandardContentDemo pieceName={pieceName} />
}
