"use client"

import {
  STANDARD_PIECE_DEMOS,
  type StandardPieceDemo,
} from "./demos/definesStandardPieceDemos"
import { RendersNotBuiltDemo } from "./demos/rendersNotBuiltDemo"

export function RendersStandardLibraryDemo({
  pieceName,
}: {
  pieceName: string
}) {
  // Hook-free, so it is called as a plain function like the gallery does.
  return resolvesStandardDemo(pieceName)({ pieceName })
}

/**
 * Picks the Standard demo for a piece by its catalog name, falling back to
 * the Not built card. Every demo here is hook-free.
 */
export function resolvesStandardDemo(pieceName: string): StandardPieceDemo {
  return STANDARD_PIECE_DEMOS[pieceName] ?? RendersNotBuiltDemo
}
