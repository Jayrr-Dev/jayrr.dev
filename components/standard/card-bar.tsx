import * as React from "react"
import { cn } from "cn"

function CardBar({
  className,
  title,
  description,
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
  image?: string | React.ReactNode
  imageAlt?: string
  imagePosition?: "left" | "right"
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  /** Size the image and icon boxes to the height of the text instead of a fixed size. */
  autoSize?: boolean
}) {
  const hasImage = image != null
  const hasIcon = icon != null

  const imageSlot = hasImage ? (
    <span
      data-slot="card-bar-image"
      className={cn(
        "relative aspect-square overflow-hidden rounded-lg border border-border bg-muted",
        autoSize ? "h-full min-h-10 self-stretch" : "w-24"
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
      data-slot="card-bar-icon"
      className={cn(
        "flex aspect-square items-center justify-center rounded-lg bg-muted text-muted-foreground",
        autoSize
          ? "h-full min-h-8 self-stretch [&_svg]:size-1/2"
          : "size-8 [&_svg]:size-4"
      )}
    >
      {icon}
    </span>
  ) : null

  // Grid (not flex) so an autoSize box can take the text's height and stay square.
  const columns = [
    hasImage && imagePosition === "left",
    hasIcon && iconPosition === "left",
    "text",
    hasIcon && iconPosition === "right",
    hasImage && imagePosition === "right",
  ]
    .filter(Boolean)
    .map((column) => (column === "text" ? "minmax(0,1fr)" : "auto"))
    .join(" ")

  return (
    <button
      data-slot="card-bar"
      data-variant={hasImage ? "image" : hasIcon ? "icon" : undefined}
      data-image-position={hasImage ? imagePosition : undefined}
      data-icon-position={hasIcon ? iconPosition : undefined}
      data-auto-size={autoSize || undefined}
      type="button"
      className={cn(
        "grid w-full items-center gap-3 rounded-xl border border-border bg-card text-left hover:bg-muted",
        hasImage ? "p-1.5" : "px-3 py-2",
        className
      )}
      style={{ gridTemplateColumns: columns, ...style }}
      {...props}
    >
      {imagePosition === "left" ? imageSlot : null}
      {iconPosition === "left" ? iconSlot : null}
      <span
        className={cn(
          "flex min-w-0 flex-col gap-0.5",
          hasImage && "py-1",
          hasImage && imagePosition === "left" && "pr-1.5",
          hasImage && imagePosition === "right" && "pl-1.5"
        )}
      >
        <span className="text-sm font-medium">{title}</span>
        {description ? (
          <span className="text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {iconPosition === "right" ? iconSlot : null}
      {imagePosition === "right" ? imageSlot : null}
    </button>
  )
}

export { CardBar }

// Moved to its own file; re-exported so existing imports keep working.
export { StandardCard } from "@/components/standard/standard-card"
