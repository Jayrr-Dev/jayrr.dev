"use client"

import type { ReactNode } from "react"

import { findStandardCatalogEntry } from "@/features/standard-library/domain/catalog/definesStandardCatalog"

import { RendersStandardBadgeDemo } from "./demos/rendersStandardBadgeDemo"
import { RendersStandardButtonDemo } from "./demos/rendersStandardButtonDemo"
import { RendersStandardContentDemo } from "./demos/rendersStandardContentDemo"
import { RendersStandardCursorDemo } from "./demos/rendersStandardCursorDemo"
import { RendersStandardFieldDemo } from "./demos/rendersStandardFieldDemo"
import { RendersStandardOverlayDemo } from "./demos/rendersStandardOverlayDemo"
import { RendersStandardPickerDemo } from "./demos/rendersStandardPickerDemo"
import { RendersStandardSignalDemo } from "./demos/rendersStandardSignalDemo"
import { RendersStandardToggleDemo } from "./demos/rendersStandardToggleDemo"

const BADGE_ICON_NAMES = new Set(["Info Icon", "Question Icon", "Kbd"])

const FIELD_OVERRIDES = new Set(["Standard Toolbar Search Cluster"])

const BADGE_OVERRIDES = new Set(["Badge Icon"])

type StandardDemo = (props: { pieceName: string }) => ReactNode

export function RendersStandardLibraryDemo({
  pieceName,
}: {
  pieceName: string
}) {
  const Demo = resolvesStandardDemo(pieceName)
  return <Demo pieceName={pieceName} />
}

/** Picks the demo for a Standard piece. Every demo here is hook-free. */
export function resolvesStandardDemo(pieceName: string): StandardDemo {
  if (BADGE_ICON_NAMES.has(pieceName) || BADGE_OVERRIDES.has(pieceName)) {
    return RendersStandardBadgeDemo
  }

  const entry = findStandardCatalogEntry(pieceName)
  const category = entry?.category_key ?? "text"
  const section = entry?.section_key ?? "content"

  if (pieceName === "Standard Toolbar Search Cluster") {
    return RendersStandardSignalDemo
  }

  if (category === "buttons" || category === "icons") {
    return RendersStandardButtonDemo
  }

  if (category === "fields") {
    return RendersStandardFieldDemo
  }

  if (category === "pickers" || category === "scroll") {
    return RendersStandardPickerDemo
  }

  if (category === "cursor") {
    return RendersStandardCursorDemo
  }

  if (category === "toggles") {
    return RendersStandardToggleDemo
  }

  if (category === "badges") {
    return RendersStandardBadgeDemo
  }

  if (section === "overlays") {
    return RendersStandardOverlayDemo
  }

  if (section === "signals") {
    return RendersStandardSignalDemo
  }

  return RendersStandardContentDemo
}
