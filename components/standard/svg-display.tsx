"use client"

import * as React from "react"
import { ImageIcon, MinusIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"

import {
  DisplayAction,
  DisplayCopyAction,
  DisplayDownloadAction,
  DisplayFrame,
  DisplaySwitch,
  fileNameFrom,
} from "@/components/standard/display-frame"

/**
 * An SVG on a transparency checkerboard, with zoom, a Preview / Code switch,
 * and copy and download actions. Pass the markup as `svg` or a URL as `src`.
 * It draws through an img, so scripts inside the SVG never run.
 *
 * <SvgDisplay svg={markup} title="logo.svg" />
 * <SvgDisplay src="/icons/mark.svg" background="dark" height={240} />
 */

type SvgBackground = "checker" | "light" | "dark" | "none"
type SvgView = "preview" | "code"

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8]

const backgrounds: Record<SvgBackground, string> = {
  checker:
    "bg-white bg-[length:16px_16px] bg-[position:0_0,8px_8px] [background-image:linear-gradient(45deg,#0000000d_25%,transparent_25%,transparent_75%,#0000000d_75%),linear-gradient(45deg,#0000000d_25%,transparent_25%,transparent_75%,#0000000d_75%)] dark:bg-neutral-900 dark:[background-image:linear-gradient(45deg,#ffffff0f_25%,transparent_25%,transparent_75%,#ffffff0f_75%),linear-gradient(45deg,#ffffff0f_25%,transparent_25%,transparent_75%,#ffffff0f_75%)]",
  light: "bg-white",
  dark: "bg-neutral-950",
  none: "",
}

/** Width and height from the root element's attributes or its viewBox. */
function measure(markup: string) {
  const root = /<svg\b[^>]*>/i.exec(markup)?.[0]
  if (!root) return null
  const attr = (name: string) =>
    new RegExp(`\\s${name}\\s*=\\s*["']([^"']+)["']`, "i").exec(root)?.[1]
  const box = attr("viewBox")
    ?.split(/[\s,]+/)
    .map(Number)
  const width = parseFloat(attr("width") ?? "") || box?.[2]
  const height = parseFloat(attr("height") ?? "") || box?.[3]
  return width && height ? { width, height } : null
}

function formatBytes(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
}

function SvgDisplay({
  className,
  svg,
  src,
  title,
  alt,
  background = "checker",
  height = 280,
  showCode = true,
  bare = false,
  ...props
}: Omit<React.ComponentProps<"figure">, "title" | "children"> & {
  /** SVG markup. Takes precedence over `src`. */
  svg?: string
  /** A URL to an SVG file. Its markup is fetched for the Code view when the server allows it. */
  src?: string
  /** Defaults to the file name in `src`. */
  title?: string
  alt?: string
  background?: SvgBackground
  /** CSS height of the canvas. */
  height?: number | string
  /** Offer the Code view. */
  showCode?: boolean
  bare?: boolean
}) {
  const [fetched, setFetched] = React.useState<string | null>(null)
  const [view, setView] = React.useState<SvgView>("preview")
  // null fits the canvas; a number is a scale of the SVG's own size.
  const [zoom, setZoom] = React.useState<number | null>(null)
  const [natural, setNatural] = React.useState<{
    width: number
    height: number
  } | null>(null)

  React.useEffect(() => {
    if (svg || !src) return
    let cancelled = false
    fetch(src)
      .then((response) => (response.ok ? response.text() : Promise.reject()))
      .then((text) => {
        if (!cancelled && /<svg\b/i.test(text)) setFetched(text)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [svg, src])

  const markup = svg ?? fetched
  const url = React.useMemo(
    () =>
      svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : src,
    [svg, src]
  )
  const size = (markup ? measure(markup) : null) ?? natural
  const name = title ?? fileNameFrom(src) ?? "image.svg"

  const scale = zoom ?? 1
  const step = (direction: 1 | -1) => {
    const current = zoom ?? 1
    const next =
      direction > 0
        ? ZOOM_STEPS.find((value) => value > current + 0.001)
        : [...ZOOM_STEPS].reverse().find((value) => value < current - 0.001)
    if (next) setZoom(next)
  }

  const meta = [
    size ? `${Math.round(size.width)} × ${Math.round(size.height)}` : null,
    markup ? formatBytes(new Blob([markup]).size) : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <DisplayFrame
      data-kind="svg"
      bare={bare}
      icon={<ImageIcon />}
      title={name}
      meta={meta || "SVG"}
      actions={
        <>
          {markup ? <DisplayCopyAction text={markup} label="Copy SVG" /> : null}
          {url ? <DisplayDownloadAction href={url} filename={name} /> : null}
        </>
      }
      toolbar={
        <>
          {showCode ? (
            <DisplaySwitch
              label="View"
              value={view}
              onValueChange={setView}
              options={[
                { value: "preview", label: "Preview" },
                { value: "code", label: "Code", disabled: !markup },
              ]}
            />
          ) : null}
          {view === "preview" ? (
            <div className="ml-auto flex items-center gap-0.5">
              <DisplayAction
                label="Zoom out"
                onClick={() => step(-1)}
                disabled={scale <= ZOOM_STEPS[0]}
              >
                <MinusIcon />
              </DisplayAction>
              <button
                type="button"
                onClick={() => setZoom(zoom === null ? 1 : null)}
                title={zoom === null ? "Actual size" : "Fit"}
                className="min-w-12 rounded-md px-1.5 py-1 text-xs text-muted-foreground tabular-nums hover:bg-muted hover:text-foreground"
              >
                {zoom === null ? "Fit" : `${Math.round(zoom * 100)}%`}
              </button>
              <DisplayAction
                label="Zoom in"
                onClick={() => step(1)}
                disabled={scale >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              >
                <PlusIcon />
              </DisplayAction>
            </div>
          ) : null}
        </>
      }
      className={className}
      {...props}
    >
      {view === "code" && markup ? (
        <pre
          className="m-0 overflow-auto bg-muted/40 p-4 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap"
          style={{ height }}
        >
          {markup}
        </pre>
      ) : (
        <div
          className={cn(
            "flex overflow-auto",
            backgrounds[background],
            // Centering with margin auto keeps an oversized image scrollable from its edge.
            "*:m-auto"
          )}
          style={{ height }}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={alt ?? name}
              draggable={false}
              onLoad={(event) => {
                const image = event.currentTarget
                if (image.naturalWidth && image.naturalHeight) {
                  setNatural({
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                  })
                }
              }}
              className={cn(
                "block shrink-0",
                zoom === null && "size-full object-contain p-4"
              )}
              style={
                zoom !== null && size
                  ? {
                      width: size.width * zoom,
                      height: size.height * zoom,
                      maxWidth: "none",
                    }
                  : undefined
              }
            />
          ) : (
            <span className="text-sm text-muted-foreground">No SVG</span>
          )}
        </div>
      )}
    </DisplayFrame>
  )
}

export { SvgDisplay }
export type { SvgBackground }
