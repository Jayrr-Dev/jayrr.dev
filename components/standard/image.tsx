"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ImageIcon } from "lucide-react"
import { cn } from "cn"

import { AspectRatio } from "@/components/ui/aspect-ratio"

const ratioPresets = {
  wide: 16 / 9,
  square: 1,
  still: 4 / 3,
} as const

type ImageRatio = keyof typeof ratioPresets

const imageVariants = cva(
  "group/image isolate flex items-center justify-center overflow-hidden bg-muted text-xs text-muted-foreground",
  {
    variants: {
      // Kept for callers that style their own box; Image sizes itself with
      // AspectRatio, so these do nothing inside it.
      ratio: {
        wide: "aspect-video",
        square: "aspect-square",
        still: "aspect-[4/3]",
      },
      fit: {
        cover: "[&>img]:object-cover",
        contain: "[&>img]:object-contain",
      },
      rounded: {
        true: "rounded-lg",
        false: "rounded-none",
      },
      // Same effects as CardMedia, keyed to hovering the image itself.
      hover: {
        none: "",
        zoom: "[&>*]:transition-transform [&>*]:duration-700 [&>*]:ease-out group-hover/image:[&>*]:scale-110 motion-reduce:[&>*]:transition-none",
        // A band of light sweeps across on hover.
        sheen:
          "before:pointer-events-none before:absolute before:inset-y-0 before:-left-1/2 before:z-10 before:w-1/2 before:-skew-x-12 before:bg-linear-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-[left] before:duration-700 before:ease-out group-hover/image:before:left-full motion-reduce:before:hidden",
        // Starts grayscale, fills with color on hover.
        color:
          "[&>*]:grayscale [&>*]:transition-[filter] [&>*]:duration-500 group-hover/image:[&>*]:grayscale-0",
      },
    },
    defaultVariants: {
      ratio: "wide",
      fit: "cover",
      rounded: true,
      hover: "none",
    },
  }
)

function Image({
  className,
  src,
  alt = "",
  ratio = "wide",
  fit = "cover",
  rounded = true,
  hover = "none",
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> &
  Omit<VariantProps<typeof imageVariants>, "ratio"> & {
    /** Preset or width / height, e.g. 21 / 9. */
    ratio?: ImageRatio | number | null
    src?: string
    /** Alt text; also shown in the placeholder when there is no `src`. */
    alt?: string
    children?: React.ReactNode
  }) {
  const resolvedRatio = ratio ?? "wide"
  const ratioValue =
    typeof resolvedRatio === "number" ? resolvedRatio : ratioPresets[resolvedRatio]

  return (
    <AspectRatio
      data-slot="image"
      data-ratio={resolvedRatio}
      data-hover={hover}
      data-empty={!src && !children ? true : undefined}
      ratio={ratioValue}
      className={cn(
        imageVariants({
          fit,
          rounded,
          hover,
          ratio: typeof resolvedRatio === "number" ? undefined : resolvedRatio,
        }),
        className
      )}
      {...props}
    >
      {src ? (
        // A plain img keeps Image usable for any source without next/image config.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="absolute inset-0 -z-10 size-full" />
      ) : null}
      {children ??
        (src ? null : (
          <span className="flex flex-col items-center gap-1 px-2 text-center">
            <ImageIcon aria-hidden className="size-5 opacity-60" />
            {alt ? <span>{alt}</span> : null}
          </span>
        ))}
    </AspectRatio>
  )
}

export { Image, imageVariants }
