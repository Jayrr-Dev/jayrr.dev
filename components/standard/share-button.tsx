"use client"

import * as React from "react"
import { CheckIcon, Share2Icon } from "lucide-react"

import { Button } from "@/components/standard/button"

/**
 * Shares a link through the Web Share API (`navigator.share`), which opens
 * the device's own share sheet on mobile and on desktop browsers that
 * support it, so no network links are hardcoded. Where the API is missing,
 * or refuses the data, it copies the link to the clipboard instead.
 *
 * <ShareButton />
 * <ShareButton title="jayrr.dev" text="A component library" url="https://jayrr.dev" />
 * <ShareButton iconOnly shape="circle" aria-label="Share" />
 */

type ShareMethod = "native" | "clipboard"

type ShareButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "href"
> & {
  /** Defaults to the page title. */
  title?: string
  text?: string
  /** Defaults to the current page URL. */
  url?: string
  /** Files to attach, sent only where `navigator.canShare` accepts them. */
  files?: File[]
  /** Label shown for a moment after the link is copied. */
  copiedLabel?: React.ReactNode
  /** Runs after a share or copy succeeds (not when the sheet is dismissed). */
  onShare?: (method: ShareMethod) => void
  onShareError?: (error: unknown) => void
}

const COPIED_MS = 2000

function canShareNatively(data: ShareData) {
  if (typeof navigator === "undefined" || !navigator.share) {
    return false
  }

  return navigator.canShare ? navigator.canShare(data) : true
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  // Older browsers and non-secure contexts have no async clipboard.
  const field = document.createElement("textarea")
  field.value = text
  field.setAttribute("readonly", "")
  field.style.position = "fixed"
  field.style.opacity = "0"
  document.body.appendChild(field)
  field.select()
  const copied = document.execCommand("copy")
  field.remove()

  if (!copied) {
    throw new Error("Copy to clipboard failed")
  }
}

function ShareButton({
  title,
  text,
  url,
  files,
  copiedLabel = "Link copied",
  onShare,
  onShareError,
  iconOnly = false,
  tone = "outline",
  children,
  ...props
}: ShareButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const [sharing, setSharing] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  async function handleClick() {
    const shareUrl = url ?? window.location.href
    const data: ShareData = {
      title: title ?? document.title,
      text,
      url: shareUrl,
    }

    // Try with files first, then without, since many targets reject files.
    const withFiles = files?.length ? { ...data, files } : null
    const payload =
      withFiles && canShareNatively(withFiles)
        ? withFiles
        : canShareNatively(data)
          ? data
          : null

    setSharing(true)
    try {
      if (payload) {
        await navigator.share(payload)
        onShare?.("native")
        return
      }

      await copyText(shareUrl)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), COPIED_MS)
      onShare?.("clipboard")
    } catch (error) {
      // Closing the share sheet rejects with AbortError; that is not a failure.
      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }
      onShareError?.(error)
    } finally {
      setSharing(false)
    }
  }

  const icon = copied ? (
    <CheckIcon aria-hidden className="size-4" />
  ) : (
    <Share2Icon aria-hidden className="size-4" />
  )

  return (
    <>
      <Button
        data-slot="share-button"
        data-copied={copied || undefined}
        tone={tone}
        iconOnly={iconOnly}
        aria-label={iconOnly ? "Share" : undefined}
        aria-busy={sharing || undefined}
        leading={iconOnly ? undefined : icon}
        onClick={handleClick}
        {...props}
      >
        {iconOnly ? icon : copied ? copiedLabel : (children ?? "Share")}
      </Button>
      <span role="status" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </>
  )
}

export { ShareButton, type ShareMethod }
