"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Indicator } from "@/components/standard/indicator"
import {
  Avatar as AvatarRoot,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

type AvatarSize = "xs" | "sm" | "default" | "lg" | "xl"
type AvatarStatus = "online" | "away" | "busy" | "offline"

// The ui root sizes itself from data-size (sm, lg); the matching data-size
// classes here win over those so the standard scale holds.
const avatarVariants = cva(
  "inline-flex items-center justify-center overflow-hidden bg-muted font-medium text-muted-foreground",
  {
    variants: {
      size: {
        xs: "size-6 text-[10px]",
        sm: "size-8 text-xs data-[size=sm]:size-8",
        default: "size-10 text-sm",
        lg: "size-12 text-base data-[size=lg]:size-12",
        xl: "size-16 text-lg",
      },
      shape: {
        circle: "rounded-full after:rounded-full",
        square: "rounded-md after:rounded-md",
      },
    },
    defaultVariants: {
      size: "default",
      shape: "circle",
    },
  }
)

const INDICATOR_SIZES = {
  xs: "sm",
  sm: "sm",
  default: "default",
  lg: "lg",
  xl: "lg",
} as const

// AvatarGroup hands its size to the avatars inside it.
const AvatarGroupSizeContext = React.createContext<AvatarSize | undefined>(
  undefined
)

/**
 * Profile picture with a text fallback. `src` shows an image; until it loads,
 * or without one, `fallback` (or children) shows instead, usually initials.
 * `status` pins a presence dot to the bottom corner.
 */
function Avatar({
  className,
  size,
  shape = "circle",
  src,
  alt = "",
  fallback,
  status,
  children,
  ...props
}: Omit<React.ComponentProps<typeof AvatarRoot>, "size"> &
  VariantProps<typeof avatarVariants> & {
    src?: string
    alt?: string
    /** Shown while the image loads or when there is none. Children work too. */
    fallback?: React.ReactNode
    status?: AvatarStatus
  }) {
  const groupSize = React.useContext(AvatarGroupSizeContext)
  const resolvedSize: AvatarSize = size ?? groupSize ?? "default"
  const resolvedShape = shape ?? "circle"

  const avatar = (
    <AvatarRoot
      data-size={resolvedSize}
      data-shape={resolvedShape}
      className={cn(
        avatarVariants({ size: resolvedSize, shape: resolvedShape }),
        className
      )}
      {...props}
    >
      {src ? (
        <AvatarImage src={src} alt={alt} className="rounded-[inherit]" />
      ) : null}
      <AvatarFallback className="rounded-[inherit] bg-transparent text-[length:inherit] text-inherit">
        {fallback ?? children}
      </AvatarFallback>
    </AvatarRoot>
  )

  if (!status) {
    return avatar
  }

  return (
    <Indicator status={status} size={INDICATOR_SIZES[resolvedSize]}>
      {avatar}
    </Indicator>
  )
}

/**
 * Overlapping row of avatars. With `max`, shows that many and a "+N" avatar
 * for the rest. `size` applies to every avatar that does not set its own.
 */
function AvatarGroup({
  className,
  max,
  size = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  max?: number
  size?: AvatarSize
}) {
  const items = React.Children.toArray(children)
  const shown = max !== undefined ? items.slice(0, max) : items
  const hidden = items.length - shown.length

  return (
    <AvatarGroupSizeContext.Provider value={size}>
      <div
        data-slot="avatar-group"
        className={cn(
          "flex -space-x-2 [&_[data-slot=avatar]]:ring-2 [&_[data-slot=avatar]]:ring-background",
          className
        )}
        {...props}
      >
        {shown}
        {hidden > 0 ? (
          <Avatar
            role="img"
            aria-label={`${hidden} more`}
            fallback={`+${hidden}`}
          />
        ) : null}
      </div>
    </AvatarGroupSizeContext.Provider>
  )
}

export { Avatar, AvatarGroup, avatarVariants }
