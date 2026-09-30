import type { Metadata } from "next"
import Link from "next/link"

import { BucketGallery } from "@/components/bucket-gallery"
import { ModeToggle } from "@/components/standard/mode-toggle"

export const metadata: Metadata = {
  title: "Gallery · jayrr.dev",
  description: "Design system gallery grouped by bucket, category, and piece.",
}

export default function GalleryPage() {
  return (
    <main className="min-h-svh bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-fit font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            jayrr.dev
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-medium tracking-tight">Gallery</h1>
            <ModeToggle variant="toggle" tone="ghost" />
          </div>
        </div>

        <BucketGallery />
      </div>
    </main>
  )
}
