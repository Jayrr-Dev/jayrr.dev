"use client"

import * as React from "react"
import { ImageIcon, UploadIcon, XIcon } from "lucide-react"
import { cn } from "cn"

type ImageUploadVariant = "dropzone" | "avatar"

type ImageUploadProps = {
  label?: string
  hint?: string
  variant?: ImageUploadVariant
  disabled?: boolean
  maxSizeMb?: number
  /** Upload progress from 0 to 100. Shows a progress bar while set. */
  progress?: number
  defaultPreview?: string
  className?: string
  onFileChange?: (file: File | null) => void
}

function formatsBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ImageUpload({
  label = "Image",
  hint,
  variant = "dropzone",
  disabled = false,
  maxSizeMb = 5,
  progress,
  defaultPreview,
  className,
  onFileChange,
}: ImageUploadProps) {
  const inputId = React.useId()
  const labelId = `${inputId}-label`
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null)
  const [cleared, setCleared] = React.useState(false)
  const [error, setError] = React.useState("")
  const [dragging, setDragging] = React.useState(false)

  React.useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  const preview = objectUrl ?? (cleared ? null : defaultPreview ?? null)
  const hintText = hint ?? `PNG, JPG or GIF up to ${maxSizeMb} MB`

  function selectsFile(next: File | null | undefined) {
    if (!next) return
    if (!next.type.startsWith("image/")) {
      setError("That file isn't an image.")
      return
    }
    if (next.size > maxSizeMb * 1024 * 1024) {
      setError(`Image must be ${maxSizeMb} MB or smaller.`)
      return
    }
    setError("")
    setFile(next)
    setObjectUrl(URL.createObjectURL(next))
    onFileChange?.(next)
  }

  function clearsFile() {
    setFile(null)
    setObjectUrl(null)
    setCleared(true)
    setError("")
    if (inputRef.current) inputRef.current.value = ""
    onFileChange?.(null)
  }

  const dropHandlers = disabled
    ? {}
    : {
        onDragOver: (event: React.DragEvent) => {
          event.preventDefault()
          setDragging(true)
        },
        onDragLeave: () => setDragging(false),
        onDrop: (event: React.DragEvent) => {
          event.preventDefault()
          setDragging(false)
          selectsFile(event.dataTransfer.files?.[0])
        },
      }

  const input = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept="image/*"
      disabled={disabled}
      aria-labelledby={labelId}
      aria-describedby={error ? `${hintId} ${errorId}` : hintId}
      aria-invalid={error ? true : undefined}
      className="sr-only"
      onChange={(event) => selectsFile(event.target.files?.[0])}
    />
  )

  const message = error ? (
    <p id={errorId} role="alert" className="text-xs text-destructive">
      {error}
    </p>
  ) : null

  const uploading = progress !== undefined && !error
  const clampedProgress = Math.min(Math.max(progress ?? 0, 0), 100)
  const progressBar = uploading ? (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-label={`Uploading ${label.toLowerCase()}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clampedProgress)}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <span className="w-8 text-right text-muted-foreground tabular-nums">
        {Math.round(clampedProgress)}%
      </span>
    </div>
  ) : null

  const title = (
    <label id={labelId} htmlFor={inputId} className="w-fit font-medium">
      {label}
    </label>
  )

  if (variant === "avatar") {
    return (
      <div
        data-slot="image-upload"
        data-variant="avatar"
        className={cn("flex w-full flex-col gap-2 text-xs", className)}
      >
        {title}
        <div className="flex items-center gap-3">
          <label
            htmlFor={inputId}
            {...dropHandlers}
            className={cn(
              "relative flex size-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-input bg-muted/40 text-muted-foreground transition-colors hover:bg-muted focus-within:ring-3 focus-within:ring-ring/50",
              preview && "border-solid",
              dragging && "border-primary bg-primary/10",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            {input}
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <ImageIcon aria-hidden className="size-5" />
            )}
            <span className="sr-only">{preview ? "Replace image" : "Upload image"}</span>
          </label>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <label
                htmlFor={inputId}
                className={cn(
                  "inline-flex h-7 cursor-pointer items-center rounded-lg border border-input px-2.5 font-medium hover:bg-muted",
                  disabled && "pointer-events-none opacity-50"
                )}
              >
                {preview ? "Change" : "Upload"}
              </label>
              {preview && !disabled ? (
                <button
                  type="button"
                  onClick={clearsFile}
                  className="h-7 rounded-lg px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <span id={hintId} className="text-muted-foreground">
              {hintText}
            </span>
          </div>
        </div>
        {progressBar}
        {message}
      </div>
    )
  }

  return (
    <div
      data-slot="image-upload"
      data-variant="dropzone"
      className={cn("flex w-full flex-col gap-2 text-xs", className)}
    >
      {title}
      {preview ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            className="size-12 shrink-0 rounded-lg object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate font-medium">
              {file ? file.name : "Current image"}
            </span>
            <span className="text-muted-foreground">
              {file ? formatsBytes(file.size) : "Uploaded"}
            </span>
          </div>
          {input}
          {!disabled ? (
            <div className="flex shrink-0 items-center gap-1">
              <label
                htmlFor={inputId}
                className="inline-flex h-7 cursor-pointer items-center rounded-lg border border-input px-2.5 font-medium hover:bg-muted"
              >
                Replace
              </label>
              <button
                type="button"
                aria-label="Remove image"
                onClick={clearsFile}
                className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XIcon aria-hidden className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          {...dropHandlers}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/20 px-4 py-6 text-center transition-colors hover:bg-muted/50 focus-within:ring-3 focus-within:ring-ring/50",
            dragging && "border-primary bg-primary/10",
            error && "border-destructive/60",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          {input}
          <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UploadIcon aria-hidden className="size-4" />
          </span>
          <span className="text-sm">
            <span className="font-medium">Click to upload</span>{" "}
            <span className="text-muted-foreground">or drag and drop</span>
          </span>
          <span id={hintId} className="text-muted-foreground">
            {hintText}
          </span>
        </label>
      )}
      {progressBar}
      {message}
    </div>
  )
}

export { ImageUpload }
export type { ImageUploadProps, ImageUploadVariant }
