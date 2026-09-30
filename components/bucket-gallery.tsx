"use client"

import { useMemo, useState } from "react"

import { GalleryIcon } from "@/components/gallery-icon"
import { TextField } from "@/components/standard/text-field"
import { OpensPieceCollectionsDialog } from "@/features/ui-library/components/opensPieceCollectionsDialog"
import { Masonry } from "@/components/ui/masonry"
import { galleryBuckets, type GalleryCategory } from "@/lib/design-system"
import { cn } from "@/lib/utils"

const ALL_BUCKETS = "all"

type OpenPiece = {
  name: string
  bucketName: string
  categoryName: string
}

/**
 * Keeps a category's cards that match the search. A match on the parent or
 * the category name keeps everything. Tier categories filter each of their
 * use groups the same way and drop the groups left empty.
 */
function filtersCategory(
  category: GalleryCategory,
  needle: string,
  parentMatch: boolean
): GalleryCategory | null {
  const match = parentMatch || category.name.toLowerCase().includes(needle)

  if (category.groups) {
    const groups = category.groups
      .map((group) => filtersCategory(group, needle, match))
      .filter((group) => group !== null)

    if (groups.length === 0) {
      return null
    }

    return {
      ...category,
      groups,
      cards: groups.flatMap((group) => group.cards),
    }
  }

  const cards = match
    ? category.cards
    : category.cards.filter((card) => card.name.toLowerCase().includes(needle))

  return cards.length === 0 ? null : { ...category, cards }
}

export function BucketGallery() {
  const [selectedBucket, setSelectedBucket] = useState(ALL_BUCKETS)
  const [query, setQuery] = useState("")

  const [openPiece, setOpenPiece] = useState<OpenPiece | null>(null)
  const [pieceDialogOpen, setPieceDialogOpen] = useState(false)

  const filteredBuckets = useMemo(() => {
    // "All" shows the functional buckets only; Tier and Canonical re-sort
    // the same pool, so including them would list every piece again.
    const buckets =
      selectedBucket === ALL_BUCKETS
        ? galleryBuckets.filter((bucket) => bucket.groupBy === "type")
        : galleryBuckets.filter((bucket) => bucket.id === selectedBucket)

    const needle = query.trim().toLowerCase()
    if (!needle) {
      return buckets
    }

    return buckets
      .map((bucket) => {
        const bucketMatch = bucket.name.toLowerCase().includes(needle)
        const categories = bucket.categories
          .map((category) => filtersCategory(category, needle, bucketMatch))
          .filter((category) => category !== null)

        if (categories.length === 0) {
          return null
        }

        return { ...bucket, categories }
      })
      .filter((bucket) => bucket !== null)
  }, [query, selectedBucket])

  function renderCards(
    cards: GalleryCategory["cards"],
    bucketName: string,
    categoryName: string
  ) {
    return (
      <ul className="flex flex-wrap gap-2">
        {cards.map((card) => (
          <li key={card.name}>
            <button
              type="button"
              onClick={() => {
                setOpenPiece({ name: card.name, bucketName, categoryName })
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
        ))}
      </ul>
    )
  }

  const bucketOptions = [
    { id: ALL_BUCKETS, name: "All" },
    ...galleryBuckets.map((bucket) => ({ id: bucket.id, name: bucket.name })),
  ]

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-medium">Buckets</h2>
          <TextField
            type="search"
            containerClassName="w-full max-w-xs"
            size="sm"
            clearable={false}
            placeholder="Search pieces"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search pieces"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {bucketOptions.map((entry) => {
            const isSelected = entry.id === selectedBucket

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedBucket(entry.id)}
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
        {filteredBuckets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pieces match “{query.trim()}”.
          </p>
        ) : null}
        {filteredBuckets.map((bucket) => (
          <div
            key={bucket.id}
            className="flex flex-col gap-5 rounded-xl border border-border bg-card/30 p-5"
          >
            <h3 className="text-sm font-medium">{bucket.name}</h3>
            {bucket.groupBy === "tier" ? (
              <div className="flex flex-col gap-8">
                {bucket.categories.map((tier) => (
                  <div key={tier.id} className="flex flex-col gap-3">
                    <h4 className="flex items-baseline gap-2 text-sm font-medium">
                      {tier.name}
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {tier.cards.length}
                      </span>
                    </h4>
                    <Masonry minColumnWidth={232} className="gap-4">
                      {(tier.groups ?? []).map((group) => (
                        <div
                          key={group.id}
                          className="flex flex-col gap-2 rounded-lg border border-border bg-card/40 p-3"
                        >
                          <h5 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                            {group.name}
                          </h5>
                          {renderCards(group.cards, bucket.name, tier.name)}
                        </div>
                      ))}
                    </Masonry>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap content-start gap-x-8 gap-y-6">
                {bucket.categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex w-max max-w-full flex-col gap-2"
                  >
                    <h4 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                      {category.name}
                    </h4>
                    {renderCards(category.cards, bucket.name, category.name)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <OpensPieceCollectionsDialog
        pieceName={openPiece ? openPiece.name : null}
        bucketName={openPiece ? openPiece.bucketName : ""}
        categoryName={openPiece ? openPiece.categoryName : ""}
        open={pieceDialogOpen}
        onOpenChange={setPieceDialogOpen}
      />
    </section>
  )
}
