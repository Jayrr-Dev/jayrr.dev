"use client"

import { Dialog } from "@/components/standard/dialog"

import { RendersGalleryPieceDemos } from "./demos/rendersGalleryPieceDemos"
import { RendersInstallCommand } from "./rendersInstallCommand"

export function OpensPieceCollectionsDialog({
  pieceName,
  bucketName,
  categoryName,
  open,
  onOpenChange,
}: {
  pieceName: string | null
  bucketName: string
  categoryName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title={pieceName ? `${pieceName} Collections` : "Collections"}
      description={`${bucketName} · ${categoryName}`}
      controls={["minimize", "maximize", "close"]}
      size="xl"
      className="w-full max-w-5xl max-h-[90vh]"
    >
      {pieceName ? (
        <>
          <RendersInstallCommand pieceName={pieceName} />
          <RendersGalleryPieceDemos pieceName={pieceName} />
        </>
      ) : null}
    </Dialog>
  )
}
