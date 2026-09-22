"use client"

import { useMemo, useState } from "react"

import { GalleryIcon } from "@/components/gallery-icon"
import { galleryStyles } from "@/lib/design-system"
import { cn } from "@/lib/utils"

export function StyleGallery() {
  const [selectedStyle, setSelectedStyle] = useState(
    galleryStyles[0]?.name ?? "Classic"
  )

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
                <div key={category.name} className="flex w-max max-w-full flex-col gap-2">
                  <h4 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                    {category.name}
                  </h4>
                  <ul className="flex flex-wrap gap-2">
                    {category.cards.map((card) => (
                      <li key={card.name} className="flex w-24 flex-col gap-2">
                        <div className="flex size-24 items-center justify-center rounded-lg border bg-card p-2">
                          <GalleryIcon name={card.name} />
                        </div>
                        <div className="flex flex-col items-center gap-1 text-center">
                          <span className="text-xs leading-tight">
                            {card.name}
                          </span>
                          {card.installed ? (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              in registry
                            </span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
