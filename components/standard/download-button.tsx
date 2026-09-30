"use client"

import * as React from "react"
import { DownloadIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import {
  displaysFileAction,
  savesBlob,
  type FileActionDisplay,
} from "@/components/standard/file-actions"

/**
 * Downloads a file from a URL, or one built on click by `file`. A URL on
 * another origin opens instead of saving unless that server sends
 * `Content-Disposition: attachment`; the browser ignores `download` there.
 *
 * <DownloadButton href="/files/brochure.pdf" fileName="brochure.pdf" />
 * <DownloadButton display="icon" file={() => new Blob([json])} fileName="data.json" />
 */

type DownloadButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "iconOnly" | "leading" | "download"
> & {
  display?: FileActionDisplay
  /** Name to save as; with `href` it defaults to the URL's own name. */
  fileName?: string
  /** Builds the file on click, instead of linking to `href`. */
  file?: () => Blob | Promise<Blob>
  onDownload?: (fileName: string) => void
  onDownloadError?: (error: unknown) => void
}

function DownloadButton({
  display = "icon-text",
  href,
  fileName,
  file,
  onDownload,
  onDownloadError,
  tone = "outline",
  loading,
  children,
  onClick,
  ...props
}: DownloadButtonProps) {
  const [busy, setBusy] = React.useState(false)

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented) {
      return
    }
    if (!file) {
      onDownload?.(fileName ?? href ?? "")
      return
    }

    const name = fileName ?? "download"
    setBusy(true)
    try {
      savesBlob(await file(), name)
      onDownload?.(name)
    } catch (error) {
      onDownloadError?.(error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      data-slot="download-button"
      data-display={display}
      tone={tone}
      href={file ? undefined : href}
      download={file ? undefined : (fileName ?? true)}
      loading={busy || loading}
      onClick={handleClick}
      {...displaysFileAction(
        display,
        <DownloadIcon aria-hidden className="size-4" />,
        children ?? "Download",
        "Download"
      )}
      {...props}
    />
  )
}

export { DownloadButton }
