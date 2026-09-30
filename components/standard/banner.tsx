"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

const bannerPositions = ["top", "bottom", "left", "right"] as const

type BannerPosition = (typeof bannerPositions)[number]

const bannerVariants = cva(
  "group/banner relative flex min-w-0 items-center gap-3 overflow-hidden text-sm",
  {
    variants: {
      tone: {
        default: "",
        info: "",
        success: "",
        warning: "",
        danger: "",
        broadcast: "",
      },
      // Soft tints with a background image so a floating banner can lay an
      // opaque surface color underneath it.
      appearance: {
        soft: "bg-linear-to-r",
        solid: "border-transparent",
        outline: "",
      },
      layout: {
        // A strip that runs edge to edge along the side it sits against.
        inline: "w-full",
        // Pinned over the page, inset from the edge it sits against.
        floating: "z-50 rounded-xl border bg-background shadow-lg",
      },
      position: {
        top: "",
        bottom: "",
        left: "flex-col",
        right: "flex-col",
      },
      size: {
        sm: "",
        md: "",
      },
    },
    compoundVariants: [
      // Inline strips draw their rule on the side facing the content.
      { layout: "inline", position: "top", className: "border-b" },
      { layout: "inline", position: "bottom", className: "border-t" },
      { layout: "inline", position: "left", className: "h-full w-auto border-r" },
      { layout: "inline", position: "right", className: "h-full w-auto border-l" },
      // Floating bars hug their edge and centre along it.
      {
        layout: "floating",
        position: "top",
        className: "inset-x-3 top-3 mx-auto max-w-3xl",
      },
      {
        layout: "floating",
        position: "bottom",
        className: "inset-x-3 bottom-3 mx-auto max-w-3xl",
      },
      {
        layout: "floating",
        position: "left",
        className: "inset-y-3 left-3 my-auto max-h-[40rem]",
      },
      {
        layout: "floating",
        position: "right",
        className: "inset-y-3 right-3 my-auto max-h-[40rem]",
      },
      // Horizontal and vertical padding per size.
      { position: ["top", "bottom"], size: "sm", className: "min-h-9 px-3 py-1.5" },
      { position: ["top", "bottom"], size: "md", className: "min-h-11 px-4 py-2.5" },
      { position: ["left", "right"], size: "sm", className: "min-w-9 px-1.5 py-3" },
      { position: ["left", "right"], size: "md", className: "min-w-11 px-2.5 py-4" },
      // Soft: tinted surface, tinted border.
      {
        appearance: "soft",
        tone: "default",
        className: "border-border from-muted/60 to-muted/60",
      },
      {
        appearance: "soft",
        tone: "info",
        className:
          "border-info/30 from-info/10 to-info/10 text-info",
      },
      {
        appearance: "soft",
        tone: "success",
        className:
          "border-success/30 from-success/10 to-success/10 text-success",
      },
      {
        appearance: "soft",
        tone: "warning",
        className:
          "border-warning/30 from-warning/10 to-warning/10 text-warning",
      },
      {
        appearance: "soft",
        tone: "danger",
        className:
          "border-destructive/30 from-destructive/10 to-destructive/10 text-destructive",
      },
      {
        appearance: "soft",
        tone: "broadcast",
        className: "border-primary/30 from-primary/10 to-primary/10",
      },
      // Solid: filled surface, inverse text.
      { appearance: "solid", tone: "default", className: "bg-foreground text-background" },
      { appearance: "solid", tone: "info", className: "bg-info text-info-foreground" },
      { appearance: "solid", tone: "success", className: "bg-success text-success-foreground" },
      { appearance: "solid", tone: "warning", className: "bg-warning text-warning-foreground" },
      { appearance: "solid", tone: "danger", className: "bg-destructive text-white" },
      {
        appearance: "solid",
        tone: "broadcast",
        className: "bg-primary text-primary-foreground",
      },
      // Outline: coloured border, no fill.
      { appearance: "outline", tone: "default", className: "border-border" },
      {
        appearance: "outline",
        tone: "info",
        className: "border-info/60 text-info",
      },
      {
        appearance: "outline",
        tone: "success",
        className: "border-success/60 text-success",
      },
      {
        appearance: "outline",
        tone: "warning",
        className: "border-warning/60 text-warning",
      },
      {
        appearance: "outline",
        tone: "danger",
        className: "border-destructive/60 text-destructive",
      },
      { appearance: "outline", tone: "broadcast", className: "border-primary/60" },
    ],
    defaultVariants: {
      tone: "default",
      appearance: "soft",
      layout: "inline",
      position: "top",
      size: "md",
    },
  }
)

type BannerProps = Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof bannerVariants> & {
    /** Bold lead-in before the message, e.g. "New". */
    title?: React.ReactNode
    /** Leading icon, e.g. a lucide icon. */
    icon?: React.ReactNode
    /** Trailing controls, e.g. a link or button. */
    action?: React.ReactNode
    /**
     * `static` shows the message in place. `ticker` scrolls `items` (or
     * `children`) past in an endless loop, like a stock ticker.
     */
    motion?: "static" | "ticker"
    /** Ticker segments. Falls back to `children` as a single segment. */
    items?: React.ReactNode[]
    /** Drawn between ticker segments. */
    separator?: React.ReactNode
    /** Ticker speed in pixels per second. */
    speed?: number
    /** Scrolls the ticker the other way. */
    reverse?: boolean
    /** Holds the ticker still while it is hovered or focused. */
    pauseOnHover?: boolean
    /**
     * Floating only. `fixed` pins to the viewport, `absolute` to the nearest
     * positioned ancestor.
     */
    strategy?: "fixed" | "absolute"
    /** Shows a close button; the banner hides itself when it is pressed. */
    dismissible?: boolean
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
  }

function Banner({
  className,
  tone = "default",
  appearance = "soft",
  layout = "inline",
  position = "top",
  size = "md",
  title,
  icon,
  action,
  motion = "static",
  items,
  separator,
  speed = 60,
  reverse = false,
  pauseOnHover = true,
  strategy = "fixed",
  dismissible = false,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  children,
  "aria-label": ariaLabel = "Announcement",
  ...props
}: BannerProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  if (!open) {
    return null
  }

  const vertical = position === "left" || position === "right"
  const segments = items ?? (children == null ? [] : [children])

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      data-slot="banner"
      data-tone={tone}
      data-appearance={appearance}
      data-layout={layout}
      data-position={position}
      data-motion={motion}
      className={cn(
        bannerVariants({ tone, appearance, layout, position, size }),
        layout === "floating" && strategy,
        className
      )}
      {...props}
    >
      {icon ? (
        <span
          data-slot="banner-icon"
          className="flex shrink-0 items-center [&_svg]:size-4"
        >
          {icon}
        </span>
      ) : null}
      {title ? (
        <span
          data-slot="banner-title"
          className={cn(
            "shrink-0 font-medium",
            vertical && "[writing-mode:vertical-rl]",
            position === "left" && "rotate-180"
          )}
        >
          {title}
        </span>
      ) : null}
      {motion === "ticker" ? (
        <BannerTicker
          vertical={vertical}
          flip={position === "left"}
          segments={segments}
          separator={separator}
          speed={speed}
          reverse={reverse}
          pauseOnHover={pauseOnHover}
        />
      ) : (
        <div
          data-slot="banner-message"
          className={cn(
            "min-h-0 min-w-0 flex-1 truncate opacity-90",
            vertical && "[writing-mode:vertical-rl]",
            position === "left" && "rotate-180"
          )}
        >
          {children}
        </div>
      )}
      {action || dismissible ? (
        <div
          data-slot="banner-action"
          className={cn(
            "flex shrink-0 items-center gap-1",
            vertical ? "flex-col" : "ms-auto"
          )}
        >
          {action}
          {dismissible ? (
            <button
              type="button"
              aria-label="Dismiss"
              className="inline-flex size-6 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={() => setOpen(false)}
            >
              <XIcon className="size-4" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)"

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function BannerTicker({
  vertical,
  flip,
  segments,
  separator = <span aria-hidden="true" className="opacity-40">•</span>,
  speed,
  reverse,
  pauseOnHover,
}: {
  vertical: boolean
  flip: boolean
  segments: React.ReactNode[]
  separator?: React.ReactNode
  speed: number
  reverse: boolean
  pauseOnHover: boolean
}) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const groupRef = React.useRef<HTMLDivElement>(null)
  const [copies, setCopies] = React.useState(2)
  const reducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false
  )

  React.useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    const group = groupRef.current
    if (!viewport || !track || !group || reducedMotion) {
      return
    }

    let animation: Animation | undefined

    const start = () => {
      const distance = vertical ? group.offsetHeight : group.offsetWidth
      const room = vertical ? viewport.offsetHeight : viewport.offsetWidth
      if (distance === 0) {
        return
      }

      // Enough copies that the loop never shows a gap.
      setCopies(Math.max(2, Math.ceil(room / distance) + 1))

      const axis = vertical ? "Y" : "X"
      const from = `translate${axis}(0)`
      const to = `translate${axis}(-${distance}px)`
      const wasPaused = animation?.playState === "paused"
      animation?.cancel()
      animation = track.animate(
        { transform: reverse ? [to, from] : [from, to] },
        { duration: (distance / speed) * 1000, iterations: Infinity }
      )
      if (wasPaused) {
        animation.pause()
      }
    }

    start()
    const observer = new ResizeObserver(start)
    observer.observe(viewport)
    observer.observe(group)

    const pause = () => animation?.pause()
    const play = () => animation?.play()
    if (pauseOnHover) {
      viewport.addEventListener("pointerenter", pause)
      viewport.addEventListener("pointerleave", play)
      viewport.addEventListener("focusin", pause)
      viewport.addEventListener("focusout", play)
    }

    return () => {
      observer.disconnect()
      animation?.cancel()
      viewport.removeEventListener("pointerenter", pause)
      viewport.removeEventListener("pointerleave", play)
      viewport.removeEventListener("focusin", pause)
      viewport.removeEventListener("focusout", play)
    }
  }, [vertical, speed, reverse, pauseOnHover, reducedMotion])

  // In vertical banners the viewport's writing mode turns the row sideways,
  // so the same row layout runs top to bottom.
  const group = (copy: number) => (
    <div
      key={copy}
      ref={copy === 0 ? groupRef : undefined}
      aria-hidden={copy === 0 ? undefined : true}
      className="flex shrink-0 items-center gap-6 pe-6 whitespace-nowrap"
    >
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {index > 0 ? separator : null}
          <span data-slot="banner-item">{segment}</span>
        </React.Fragment>
      ))}
      {segments.length > 1 ? separator : null}
    </div>
  )

  return (
    <div
      ref={viewportRef}
      data-slot="banner-ticker"
      className={cn(
        "relative min-h-0 min-w-0 flex-1 overflow-hidden",
        vertical
          ? "mask-y-from-90% mask-y-to-100% [writing-mode:vertical-rl]"
          : "mask-x-from-90% mask-x-to-100%",
        // Without motion, let people scroll the strip themselves.
        reducedMotion && (vertical ? "overflow-y-auto" : "overflow-x-auto"),
        flip && "rotate-180"
      )}
    >
      <div
        ref={trackRef}
        data-slot="banner-track"
        className={cn("flex", vertical ? "h-max" : "w-max")}
      >
        {Array.from({ length: reducedMotion ? 1 : copies }, (_, copy) =>
          group(copy)
        )}
      </div>
    </div>
  )
}

export {
  Banner,
  bannerPositions,
  bannerVariants,
  type BannerPosition,
  type BannerProps,
}
