"use client"

import * as React from "react"
import { PrinterIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import {
  displaysFileAction,
  type FileActionDisplay,
} from "@/components/standard/file-actions"

/**
 * Opens the browser's print dialog for the page, or for one element when
 * `target` is set (printed in a hidden frame with the page's styles).
 *
 * <PrintButton />
 * <PrintButton display="icon" />
 * <PrintButton target={invoiceRef} title="Invoice 1042">Print invoice</PrintButton>
 */

type PrintButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "href" | "target" | "iconOnly" | "leading"
> & {
  display?: FileActionDisplay
  /** Element to print on its own instead of the whole page. */
  target?: React.RefObject<HTMLElement | null>
  /** Document title while printing, used by "Save as PDF" as the file name. */
  title?: string
}

function printsElement(element: HTMLElement, title: string) {
  const frame = document.createElement("iframe")
  frame.setAttribute("aria-hidden", "true")
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden"
  document.body.appendChild(frame)

  const doc = frame.contentDocument
  const view = frame.contentWindow
  if (!doc || !view) {
    frame.remove()
    return
  }

  const styles = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]')
  )
    .map((node) => node.outerHTML)
    .join("")
  doc.open()
  doc.write(
    `<!doctype html><html class="${document.documentElement.className}"><head><meta charset="utf-8"><base href="${document.baseURI}">${styles}</head><body>${element.outerHTML}</body></html>`
  )
  doc.close()
  doc.title = title

  const cleanUp = () => window.setTimeout(() => frame.remove(), 100)
  const print = () => {
    view.addEventListener("afterprint", cleanUp, { once: true })
    view.focus()
    view.print()
    // Browsers without afterprint in frames still block on print().
    window.setTimeout(cleanUp, 60_000)
  }

  // Wait for linked stylesheets and images so the print is not unstyled.
  if (doc.readyState === "complete") {
    window.setTimeout(print, 50)
  } else {
    view.addEventListener("load", print, { once: true })
  }
}

function PrintButton({
  display = "icon-text",
  target,
  title,
  tone = "outline",
  children,
  onClick,
  ...props
}: PrintButtonProps) {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented) {
      return
    }

    const element = target?.current
    if (element) {
      printsElement(element, title ?? document.title)
      return
    }

    const pageTitle = document.title
    if (title) {
      document.title = title
    }
    window.print()
    document.title = pageTitle
  }

  return (
    <Button
      data-slot="print-button"
      data-display={display}
      tone={tone}
      onClick={handleClick}
      {...displaysFileAction(
        display,
        <PrinterIcon aria-hidden className="size-4" />,
        children ?? "Print",
        "Print"
      )}
      {...props}
    />
  )
}

export { PrintButton }
