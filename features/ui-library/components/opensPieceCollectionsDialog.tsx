"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { RendersGalleryPieceDemos } from "./demos/rendersGalleryPieceDemos"

export function OpensPieceCollectionsDialog({
  pieceName,
  styleName,
  categoryName,
  open,
  onOpenChange,
}: {
  pieceName: string | null
  styleName: string
  categoryName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(80vh,40rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {pieceName ? `${pieceName} Collections` : "Collections"}
          </DialogTitle>
          <DialogDescription>
            {styleName} · {categoryName}
          </DialogDescription>
        </DialogHeader>
        {pieceName ? (
          <RendersGalleryPieceDemos
            pieceName={pieceName}
            styleName={styleName}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
