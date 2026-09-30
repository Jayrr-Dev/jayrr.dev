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

  // Every open piece gets its own dialog, so minimized ones stack in the dock.
  const [openPieces, setOpenPieces] = useState<(OpenPiece & { key: number })[]>(
    []
  )

  const opensPiece = (piece: OpenPiece) => {
    // Reopening a piece that is already open (say, minimized) remounts it
    // fresh in front instead of adding a duplicate.
    setOpenPieces((current) => [
      ...current.filter((open) => open.name !== piece.name),
      { ...piece, key: Date.now() },
    ])
  }

  const closesPiece = (key: number) => {
    setOpenPieces((current) => current.filter((open) => open.key !== key))
  }

  const { filteredBuckets, widened } = useMemo(() => {
    // "All" shows the functional buckets only; Tier and Canonical re-sort
    // the same pool, so including them would list every piece again.
    const allBuckets = galleryBuckets.filter(
      (bucket) => bucket.groupBy === "type"
    )
    const buckets =
      selectedBucket === ALL_BUCKETS
        ? allBuckets
        : galleryBuckets.filter((bucket) => bucket.id === selectedBucket)

    const needle = query.trim().toLowerCase()
    if (!needle) {
      return { filteredBuckets: buckets, widened: false }
    }

    const search = (pool: typeof buckets) =>
      pool
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

    const found = search(buckets)
    if (found.length > 0 || selectedBucket === ALL_BUCKETS) {
      return { filteredBuckets: found, widened: false }
    }

    // Nothing in the chosen bucket: fall back to searching everything.
    const fallback = search(allBuckets)
    return { filteredBuckets: fallback, widened: fallback.length > 0 }
  }, [query, selectedBucket])

  function renderCards(
    cards: GalleryCategory["cards"],
    bucketName: string,
    categoryName: string,
    fill = false
  ) {
    // Tier groups fill their column in an even three-up grid; the other
    // buckets keep fixed-size tiles that wrap.
    return (
      <ul className={fill ? "grid grid-cols-3 gap-2" : "flex flex-wrap gap-2"}>
        {cards.map((card) => (
          <li key={card.name}>
            <button
              type="button"
              onClick={() => {
                opensPiece({ name: card.name, bucketName, categoryName })
              }}
              className={cn(
                "flex cursor-pointer flex-col gap-1.5 rounded-lg text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring",
                fill ? "w-full" : "w-20"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg border bg-card",
                  fill ? "aspect-square w-full" : "size-20"
                )}
              >
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

  // Sort views (Tier, Canonical) sit together ahead of a separator, then the
  // functional buckets.
  const toOption = (bucket: (typeof galleryBuckets)[number]) => ({
    id: bucket.id,
    name: bucket.name,
  })
  const sortOptions = [
    { id: ALL_BUCKETS, name: "All" },
    ...galleryBuckets.filter((b) => b.groupBy === "tier").map(toOption),
    ...galleryBuckets.filter((b) => b.groupBy === "canonical").map(toOption),
  ]
  const typeOptions = galleryBuckets
    .filter((b) => b.groupBy === "type")
    .map(toOption)

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
        <div className="flex flex-wrap items-center gap-2">
          {[...sortOptions, null, ...typeOptions].map((entry) => {
            if (entry === null) {
              return (
                <span
                  key="separator"
                  aria-hidden
                  className="mx-1 h-5 w-px self-center bg-border"
                />
              )
            }
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
        {widened ? (
          <p className="text-sm text-muted-foreground">
            No matches in this bucket. Showing results from all buckets.
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
                    <div className="flex flex-col gap-1">
                      <h4 className="flex items-baseline gap-2 text-sm font-medium">
                        {tier.name}
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {tier.cards.length}
                        </span>
                      </h4>
                      {tier.description ? (
                        <p className="text-xs text-muted-foreground">
                          {tier.description}
                        </p>
                      ) : null}
                    </div>
                    <Masonry
                      minColumnWidth={272}
                      maxColumns={3}
                      className="gap-4"
                    >
                      {(tier.groups ?? []).map((group) => (
                        <div
                          key={group.id}
                          className="flex flex-col gap-2 rounded-lg border border-border bg-card/40 p-3"
                        >
                          <h5 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                            {group.name}
                          </h5>
                          {renderCards(group.cards, bucket.name, tier.name, true)}
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

      {openPieces.map((piece) => (
        <OpensPieceCollectionsDialog
          key={piece.key}
          pieceName={piece.name}
          bucketName={piece.bucketName}
          categoryName={piece.categoryName}
          open
          onOpenChange={(open) => {
            if (!open) closesPiece(piece.key)
          }}
        />
      ))}
    </section>
  )
}
