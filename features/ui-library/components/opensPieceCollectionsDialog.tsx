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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-auto w-full max-h-[90vh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {pieceName ? `${pieceName} Collections` : "Collections"}
          </DialogTitle>
          <DialogDescription>
            {bucketName} · {categoryName}
          </DialogDescription>
        </DialogHeader>
        {pieceName ? (
          <RendersGalleryPieceDemos pieceName={pieceName} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
