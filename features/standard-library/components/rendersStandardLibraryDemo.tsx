"use client"

import type { ReactNode } from "react"

import { findComponent } from "@/features/ui-library/domain/catalog/definesGalleryCatalog"

import { RendersStandardBadgeDemo } from "./demos/rendersStandardBadgeDemo"
import { RendersStandardButtonDemo } from "./demos/rendersStandardButtonDemo"
import { RendersStandardContentDemo } from "./demos/rendersStandardContentDemo"
import { RendersStandardCursorDemo } from "./demos/rendersStandardCursorDemo"
import { RendersStandardFieldDemo } from "./demos/rendersStandardFieldDemo"
import { RendersStandardLayerDemo } from "./demos/rendersStandardLayerDemo"
import { RendersStandardOverlayDemo } from "./demos/rendersStandardOverlayDemo"
import { RendersStandardPickerDemo } from "./demos/rendersStandardPickerDemo"
import { RendersStandardSignalDemo } from "./demos/rendersStandardSignalDemo"
import { RendersStandardToggleDemo } from "./demos/rendersStandardToggleDemo"

type StandardDemo = (props: { pieceName: string }) => ReactNode

/** Keyed by `standard_demo` in galleryComponents.json. */
const STANDARD_DEMOS: Record<string, StandardDemo> = {
  badge: RendersStandardBadgeDemo,
  button: RendersStandardButtonDemo,
  content: RendersStandardContentDemo,
  cursor: RendersStandardCursorDemo,
  field: RendersStandardFieldDemo,
  layer: RendersStandardLayerDemo,
  overlay: RendersStandardOverlayDemo,
  picker: RendersStandardPickerDemo,
  signal: RendersStandardSignalDemo,
  toggle: RendersStandardToggleDemo,
}

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
  const key = findComponent(pieceName)?.standard_demo ?? "content"
  return STANDARD_DEMOS[key] ?? RendersStandardContentDemo
}
