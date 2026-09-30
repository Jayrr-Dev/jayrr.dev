"use client"

import { useEffect, useRef } from "react"

import { Dialog } from "@/components/standard/dialog"
import { cn } from "@/lib/utils"

import { RendersGalleryPieceDemos } from "./demos/rendersGalleryPieceDemos"
import { RendersInstallCommand } from "./rendersInstallCommand"
import { RendersPieceDescriptionHint } from "./rendersPieceDescriptionHint"

export type PieceStepDirection = "next" | "previous"

export function OpensPieceCollectionsDialog({
  pieceName,
  bucketName,
  categoryName,
  direction = null,
  open,
  onOpenChange,
}: {
  pieceName: string | null
  bucketName: string
  categoryName: string
  /** Set when the arrow keys stepped here, so the new piece slides in from that side. */
  direction?: PieceStepDirection | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Stepping to another piece starts it from the top of the dialog.
  useEffect(() => {
    contentRef.current?.closest('[role="dialog"]')?.scrollTo({ top: 0 })
  }, [pieceName])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title={pieceName ? `${pieceName} Variants` : "Variants"}
      titleAddon={
        pieceName ? <RendersPieceDescriptionHint pieceName={pieceName} /> : null
      }
      description={`${bucketName} · ${categoryName}`}
      controls={["minimize", "maximize", "close"]}
      size="xl"
      className="w-full max-w-5xl max-h-[90vh]"
    >
      {pieceName ? (
        // Keyed by piece so each step remounts and replays the slide.
        <div
          key={pieceName}
          ref={contentRef}
          data-gallery-piece={pieceName}
          className={cn(
            "flex flex-col gap-3",
            direction &&
              "animate-in fade-in duration-300 ease-out motion-reduce:animate-none",
            direction === "next" && "slide-in-from-right-8",
            direction === "previous" && "slide-in-from-left-8"
          )}
        >
          <RendersInstallCommand pieceName={pieceName} />
          <RendersGalleryPieceDemos pieceName={pieceName} />
        </div>
      ) : null}
    </Dialog>
  )
}
