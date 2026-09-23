"use client"

import { useMemo, useState } from "react"

import { GalleryIcon } from "@/components/gallery-icon"
import { OpensPieceCollectionsDialog } from "@/features/ui-library/components/opensPieceCollectionsDialog"
import { galleryStyles } from "@/lib/design-system"
import { cn } from "@/lib/utils"

type OpenPiece = {
  name: string
  categoryName: string
}

export function StyleGallery() {
  const [selectedStyle, setSelectedStyle] = useState(
    galleryStyles[0]?.name ?? "Classic"
  )

  const [openPiece, setOpenPiece] = useState<OpenPiece | null>(null)
  const [pieceDialogOpen, setPieceDialogOpen] = useState(false)

  const style = useMemo(
    () =>
      galleryStyles.find((entry) => entry.name === selectedStyle) ??
      galleryStyles[0],
    [selectedStyle]
  )

  if (!style) {
    return null
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Style</h2>
        <div className="flex flex-wrap gap-2">
          {galleryStyles.map((entry) => {
            const isSelected = entry.name === style.name

            return (
              <button
                key={entry.name}
                type="button"
                onClick={() => setSelectedStyle(entry.name)}
                aria-pressed={isSelected}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {entry.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {style.sections.map((section) => (
          <div
            key={section.name}
            className="flex flex-col gap-5 rounded-xl border border-border bg-card/30 p-5"
          >
            <h3 className="text-sm font-medium">{section.name}</h3>
            <div className="flex flex-wrap content-start gap-x-8 gap-y-6">
              {section.categories.map((category) => (
                <div
                  key={category.name}
                  className="flex w-max max-w-full flex-col gap-2"
                >
                  <h4 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                    {category.name}
                  </h4>
                  <ul className="flex flex-wrap gap-2">
                    {category.cards.map((card) => {
                      return (
                        <li key={card.name}>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenPiece({
                                name: card.name,
                                categoryName: category.name,
                              })
                              setPieceDialogOpen(true)
                            }}
                            className="flex w-24 cursor-pointer flex-col gap-2 rounded-lg text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <div className="flex size-24 items-center justify-center rounded-lg border bg-card p-2">
                              <GalleryIcon name={card.name} />
                            </div>
                            <span className="text-center text-xs leading-tight">
                              {card.name}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <OpensPieceCollectionsDialog
        pieceName={openPiece ? openPiece.name : null}
        styleName={style.name}
        categoryName={openPiece ? openPiece.categoryName : ""}
        open={pieceDialogOpen}
        onOpenChange={setPieceDialogOpen}
      />
    </section>
  )
}
