import * as React from "react"
import { cn } from "cn"

type CardBarSide = "left" | "right"

function CardBar({
  className,
  title,
  description,
  leading,
  trailing,
  selected,
  size = "default",
  image,
  imageAlt = "",
  imagePosition = "left",
  icon,
  iconPosition = "left",
  autoSize = false,
  style,
  ...props
}: React.ComponentProps<"button"> & {
  title: string
  description?: string
  /** Content before the text, e.g. an icon, avatar or thumbnail. */
  leading?: React.ReactNode
  /** Content after the text, e.g. a chevron, badge or count. */
  trailing?: React.ReactNode
  /** Marks the bar as the chosen one in a list; sets aria-pressed. */
  selected?: boolean
  size?: "sm" | "default"
  /** @deprecated Use leading / trailing */
  image?: string | React.ReactNode
  /** @deprecated Use leading / trailing */
  imageAlt?: string
  /** @deprecated Use leading / trailing */
  imagePosition?: CardBarSide
  /** @deprecated Use leading / trailing */
  icon?: React.ReactNode
  /** @deprecated Use leading / trailing */
  iconPosition?: CardBarSide
  /** Size the image and icon boxes to the height of the text instead of a fixed size. */
  autoSize?: boolean
}) {
  const hasImage = image != null
  const hasIcon = icon != null
  const isSmall = size === "sm"

  const imageSlot = hasImage ? (
    <span
      key="image"
      data-slot="card-bar-image"
      className={cn(
        "relative aspect-square overflow-hidden rounded-lg border border-border bg-muted",
        autoSize ? "h-full min-h-10 self-stretch" : isSmall ? "w-16" : "w-24"
      )}
    >
      {typeof image === "string" ? (
        <img
          src={image}
          alt={imageAlt}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        image
      )}
    </span>
  ) : null

  const iconSlot = hasIcon ? (
    <span
      key="icon"
      data-slot="card-bar-icon"
      className={cn(
        "flex aspect-square items-center justify-center rounded-lg bg-muted text-muted-foreground",
        autoSize
          ? "h-full min-h-8 self-stretch [&_svg]:size-1/2"
          : isSmall
            ? "size-6 [&_svg]:size-3.5"
            : "size-8 [&_svg]:size-4"
      )}
    >
      {icon}
    </span>
  ) : null

  const leadingSlot =
    leading != null ? (
      <span
        key="leading"
        data-slot="card-bar-leading"
        className="flex shrink-0 items-center text-muted-foreground"
      >
        {leading}
      </span>
    ) : null

  const trailingSlot =
    trailing != null ? (
      <span
        key="trailing"
        data-slot="card-bar-trailing"
        className="flex shrink-0 items-center text-muted-foreground"
      >
        {trailing}
      </span>
    ) : null

  // The old image and icon props land on the side they asked for, outside
  // the new slots, in the same order as before.
  const before = [
    imagePosition === "left" ? imageSlot : null,
    iconPosition === "left" ? iconSlot : null,
    leadingSlot,
  ].filter(Boolean)
  const after = [
    trailingSlot,
    iconPosition === "right" ? iconSlot : null,
    imagePosition === "right" ? imageSlot : null,
  ].filter(Boolean)

  // Grid (not flex) so an autoSize box can take the text's height and stay square.
  const columns = [
    ...before.map(() => "auto"),
    "minmax(0,1fr)",
    ...after.map(() => "auto"),
  ].join(" ")

  return (
    <button
      data-slot="card-bar"
      data-variant={hasImage ? "image" : hasIcon ? "icon" : undefined}
      data-image-position={hasImage ? imagePosition : undefined}
      data-icon-position={hasIcon ? iconPosition : undefined}
      data-auto-size={autoSize || undefined}
      data-size={size}
      data-selected={selected || undefined}
      aria-pressed={selected}
      type="button"
      className={cn(
        "grid w-full items-center rounded-xl border border-border bg-card text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        isSmall ? "gap-2 rounded-lg" : "gap-3",
        hasImage ? "p-1.5" : isSmall ? "px-2.5 py-1.5" : "px-3 py-2",
        selected && "border-primary bg-primary/5 ring-1 ring-primary hover:bg-primary/10",
        className
      )}
      style={{ gridTemplateColumns: columns, ...style }}
      {...props}
    >
      {before}
      <span
        className={cn(
          "flex min-w-0 flex-col gap-0.5",
          hasImage && "py-1",
          hasImage && imagePosition === "left" && "pr-1.5",
          hasImage && imagePosition === "right" && "pl-1.5"
        )}
      >
        <span className={cn("font-medium", isSmall ? "text-xs" : "text-sm")}>
          {title}
        </span>
        {description ? (
          <span className="text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {after}
    </button>
  )
}

export { CardBar }

// Moved to its own file; re-exported so existing imports keep working.
export { StandardCard } from "@/components/standard/standard-card"
