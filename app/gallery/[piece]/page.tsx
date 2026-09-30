import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ModeToggle } from "@/components/standard/mode-toggle"
import { RendersGalleryPieceDemos } from "@/features/ui-library/components/demos/rendersGalleryPieceDemos"
import { RendersInstallCommand } from "@/features/ui-library/components/rendersInstallCommand"
import { findPiece } from "@/features/ui-library/domain/catalog/definesGalleryCatalog"

type PageProps = {
  params: Promise<{
    piece: string
  }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { piece } = await params
  const match = findPiece(piece)

  if (!match) {
    return { title: "Not found · jayrr.dev" }
  }

  return {
    title: `${match.card.name} Collections · jayrr.dev`,
    description:
      match.card.description ??
      `Demos for ${match.card.name} in ${match.bucket.name}.`,
  }
}

export default async function PieceCollectionsPage({ params }: PageProps) {
  const { piece } = await params
  const match = findPiece(piece)

  if (!match) {
    notFound()
  }

  return (
    <main className="min-h-svh bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1">
            <Link
              href="/gallery"
              className="w-fit font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              Gallery
            </Link>
            <ModeToggle variant="toggle" tone="ghost" size="sm" />
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {match.bucket.name} · {match.category.name}
          </p>
        </div>

        <section className="flex flex-col gap-5 rounded-xl border border-border bg-card/30 p-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-medium tracking-tight">
              {match.card.name} Collections
            </h1>
            {match.card.description ? (
              <p className="text-sm text-muted-foreground">
                {match.card.description}
              </p>
            ) : null}
          </div>
          <RendersInstallCommand pieceName={match.card.name} />
          <RendersGalleryPieceDemos pieceName={match.card.name} />
        </section>
      </div>
    </main>
  )
}
