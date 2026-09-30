"use client"

import * as React from "react"
import { UploadIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import {
  displaysFileAction,
  type FileActionDisplay,
} from "@/components/standard/file-actions"

/**
 * Opens the file picker from a button and hands back the chosen files.
 * The same file can be picked twice in a row. Set `name` to send the files
 * with a surrounding form.
 *
 * <UploadButton accept="image/*" onFiles={(files) => upload(files[0])} />
 * <UploadButton display="icon" multiple accept=".csv,.xlsx" onFiles={importRows} />
 */

type UploadButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "href" | "iconOnly" | "leading" | "onClick" | "name"
> & {
  display?: FileActionDisplay
  /** File types to offer, as in `<input accept>`: ".pdf", "image/*", ... */
  accept?: string
  multiple?: boolean
  /** Opens the camera on phones: "user" or "environment". */
  capture?: React.ComponentProps<"input">["capture"]
  /** Form field name for the hidden file input. */
  name?: string
  /** Files larger than this many bytes go to `onReject` instead. */
  maxSize?: number
  onFiles?: (files: File[]) => void
  onReject?: (files: File[]) => void
}

function UploadButton({
  display = "icon-text",
  accept,
  multiple = false,
  capture,
  name,
  maxSize,
  onFiles,
  onReject,
  tone = "outline",
  disabled,
  children,
  ...props
}: UploadButtonProps) {
  const input = React.useRef<HTMLInputElement>(null)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? [])
    const kept = maxSize
      ? picked.filter((file) => file.size <= maxSize)
      : picked
    const rejected = picked.filter((file) => !kept.includes(file))

    if (kept.length > 0) {
      onFiles?.(kept)
    }
    if (rejected.length > 0) {
      onReject?.(rejected)
    }
    // A form keeps the selection; otherwise clear it so picking the same file fires again.
    if (!name) {
      event.target.value = ""
    }
  }

  return (
    <>
      <Button
        data-slot="upload-button"
        data-display={display}
        tone={tone}
        disabled={disabled}
        onClick={() => input.current?.click()}
        {...displaysFileAction(
          display,
          <UploadIcon aria-hidden className="size-4" />,
          children ?? "Upload",
          "Upload"
        )}
        {...props}
      />
      <input
        ref={input}
        type="file"
        tabIndex={-1}
        aria-hidden
        hidden
        name={name}
        accept={accept}
        multiple={multiple}
        capture={capture}
        disabled={disabled}
        onChange={handleChange}
      />
    </>
  )
}

export { UploadButton }
