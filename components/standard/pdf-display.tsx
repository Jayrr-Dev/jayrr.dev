"use client"

import * as React from "react"
import { FileTextIcon } from "lucide-react"

import {
  DisplayDownloadAction,
  DisplayFrame,
  DisplayOpenAction,
  fileNameFrom,
} from "@/components/standard/display-frame"

/**
 * A PDF in the browser's own viewer, framed with a title and open and
 * download actions. Where the browser can't show PDFs inline (most phones),
 * it falls back to a card that opens the file instead.
 *
 * <PdfDisplay src="/files/report.pdf" />
 * <PdfDisplay src={url} title="Q3 report" page={4} zoom="page-fit" height={640} />
 * <PdfDisplay src={url} header={false} scrollbar={false} viewerToolbar={false} />
 */

// Wider than any viewer scrollbar, so clipping this much hides it.
const SCROLLBAR_CLIP = 20

type PdfZoom = "auto" | "page-width" | "page-fit" | number

function viewerUrl(
  src: string,
  page: number,
  zoom: PdfZoom,
  viewerToolbar: boolean,
  scrollbar: boolean
) {
  const params = [`page=${page}`]
  if (zoom === "page-width") params.push("view=FitH")
  else if (zoom === "page-fit") params.push("view=Fit")
  else if (typeof zoom === "number")
    params.push(`zoom=${Math.round(zoom * 100)}`)
  if (!viewerToolbar) params.push("toolbar=0", "navpanes=0")
  if (!scrollbar) params.push("scrollbar=0")
  return `${src.split("#")[0]}#${params.join("&")}`
}

function PdfDisplay({
  className,
  src,
  title,
  page = 1,
  zoom = "page-width",
  height = 560,
  viewerToolbar = true,
  download = true,
  header = true,
  scrollbar = true,
  bare = false,
  ...props
}: Omit<React.ComponentProps<"figure">, "title" | "children"> & {
  src: string
  /** Defaults to the file name in `src`. */
  title?: string
  /** The page to open on, from 1. */
  page?: number
  /** How the first page fits, or a scale such as 1.5. */
  zoom?: PdfZoom
  /** CSS height of the viewer. */
  height?: number | string
  /** Show the browser viewer's own toolbar. */
  viewerToolbar?: boolean
  /** Show the download action. */
  download?: boolean
  /** Show the title bar with its open and download actions. The border stays; `bare` drops both. */
  header?: boolean
  /**
   * Show the viewer's scrollbar. When false it is clipped out of view; the
   * document still scrolls with the wheel, touch and keys.
   */
  scrollbar?: boolean
  bare?: boolean
}) {
  const name = title ?? fileNameFrom(src) ?? "Document"
  const url = viewerUrl(src, page, zoom, viewerToolbar, scrollbar)

  return (
    <DisplayFrame
      data-kind="pdf"
      bare={bare}
      icon={header ? <FileTextIcon /> : undefined}
      title={header ? name : undefined}
      meta={header ? "PDF" : undefined}
      actions={
        header ? (
          <>
            <DisplayOpenAction href={src} />
            {download ? (
              <DisplayDownloadAction href={src} filename={fileNameFrom(src)} />
            ) : null}
          </>
        ) : undefined
      }
      className={className}
      {...props}
    >
      <div className="overflow-hidden">
        {/* object shows its children when the browser has no inline PDF viewer. */}
        <object
          key={url}
          data={url}
          type="application/pdf"
          aria-label={name}
          className="block w-full bg-muted"
          style={{
            height,
            width: scrollbar ? undefined : `calc(100% + ${SCROLLBAR_CLIP}px)`,
          }}
        >
          <div
            className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center"
            style={{
              minHeight:
                typeof height === "number" ? Math.min(height, 240) : 240,
            }}
          >
            <FileTextIcon
              aria-hidden
              className="size-8 text-muted-foreground"
            />
            <p className="text-sm text-muted-foreground">
              This browser can&apos;t show PDFs inline.
            </p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              Open {name}
            </a>
          </div>
        </object>
      </div>
    </DisplayFrame>
  )
}

export { PdfDisplay }
export type { PdfZoom }
