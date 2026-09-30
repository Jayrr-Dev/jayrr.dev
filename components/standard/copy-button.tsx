"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/standard/button"

/**
 * Copies text to the clipboard, then shows a check and "Copied" for a moment.
 * `value` can be a string or a function, so the text can be read at click time
 * (an input's current value, a generated link).
 *
 * <CopyButton value="npm i @jayrr/ui" />
 * <CopyButton iconOnly value={() => inputRef.current?.value ?? ""} />
 * <CopyButton value={shareUrl}>Copy link</CopyButton>
 */

type CopyButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "href" | "onClick" | "download" | "value"
> & {
  /** The text to copy, or a function that returns it when clicked. */
  value: string | (() => string | Promise<string>)
  /** Label shown for a moment after the text is copied. */
  copiedLabel?: React.ReactNode
  /** Accessible name when `iconOnly`. */
  label?: string
  onCopy?: (text: string) => void
  onCopyError?: (error: unknown) => void
}

const COPIED_MS = 2000

function CopyButton({
  value,
  copiedLabel = "Copied",
  label = "Copy",
  onCopy,
  onCopyError,
  iconOnly = false,
  tone = "outline",
  children,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copiesValue() {
    try {
      const text = typeof value === "function" ? await value() : value
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), COPIED_MS)
      onCopy?.(text)
    } catch (error) {
      onCopyError?.(error)
    }
  }

  const icon = copied ? (
    <CheckIcon aria-hidden className="size-4" />
  ) : (
    <CopyIcon aria-hidden className="size-4" />
  )

  return (
    <>
      <Button
        type="button"
        data-slot="copy-button"
        data-copied={copied || undefined}
        tone={tone}
        iconOnly={iconOnly}
        aria-label={iconOnly ? label : undefined}
        title={iconOnly ? label : undefined}
        leading={iconOnly ? undefined : icon}
        onClick={copiesValue}
        {...props}
      >
        {iconOnly ? icon : copied ? copiedLabel : (children ?? "Copy")}
      </Button>
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  )
}

export { CopyButton }
