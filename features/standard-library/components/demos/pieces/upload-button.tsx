"use client"

import { useState, type DragEvent } from "react"
import { UploadIcon } from "lucide-react"

import { UploadButton } from "@/components/standard/upload-button"
import type { FileActionDisplay } from "@/components/standard/file-actions"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

type UploadDisplay = FileActionDisplay

function RendersUploadCard({
  label,
  display,
  multiple,
  accept,
}: {
  label: string
  display: UploadDisplay
  multiple?: boolean
  accept?: string
}) {
  const [picked, setPicked] = useState<string | null>(null)

  return (
    <RendersDemoCard label={label}>
      <div className="flex flex-wrap items-center gap-3">
        <UploadButton
          display={display}
          multiple={multiple}
          accept={accept}
          onFiles={(files) =>
            setPicked(
              files.length === 1 ? files[0].name : `${files.length} files`
            )
          }
        />
        <span className="font-mono text-xs text-muted-foreground">
          {picked ?? "No file chosen"}
        </span>
      </div>
    </RendersDemoCard>
  )
}

/** Upload as a drop area: drag files onto it, or use the button inside. */
function RendersUploadDropzoneCard() {
  const [files, setFiles] = useState<File[]>([])
  const [over, setOver] = useState(false)

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setOver(false)
    const dropped = Array.from(event.dataTransfer.files)
    if (dropped.length > 0) {
      setFiles(dropped)
    }
  }

  return (
    <RendersDemoCard label="dropzone · drag files or browse">
      <div
        data-over={over || undefined}
        onDragOver={(event) => {
          event.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={handleDrop}
        className="flex w-full flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-background/50 px-4 py-6 text-center transition-colors data-over:border-foreground/40 data-over:bg-muted/60"
      >
        <UploadIcon aria-hidden className="size-5 text-muted-foreground" />
        <div className="text-sm">
          Drop files here
          <span className="block text-xs text-muted-foreground">
            or choose them from your device
          </span>
        </div>
        <UploadButton size="sm" multiple onFiles={setFiles}>
          Browse files
        </UploadButton>
        {files.length > 0 ? (
          <ul className="w-full max-w-xs space-y-1 font-mono text-xs text-muted-foreground">
            {files.map((file) => (
              <li
                key={`${file.name}-${file.lastModified}`}
                className="flex justify-between gap-3"
              >
                <span className="truncate">{file.name}</span>
                <span className="shrink-0">
                  {Math.max(1, Math.round(file.size / 1024))} KB
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </RendersDemoCard>
  )
}

export function RendersUploadButtonDemo() {
  return (
    <>
      <RendersUploadCard label="icon" display="icon" />
      <RendersUploadCard
        label="iconed text · multiple"
        display="icon-text"
        multiple
      />
      <RendersUploadCard
        label="text · images"
        display="text"
        accept="image/*"
      />
      <RendersUploadDropzoneCard />
    </>
  )
}
