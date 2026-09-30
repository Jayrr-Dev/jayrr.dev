import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const cardVariants = cva("", {
  variants: {
    effect: {
      none: "",
      lift: "transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      // Gradient border, always on. Override --card-glow to change the colors.
      gradient:
        "border-transparent [background:linear-gradient(var(--color-card),var(--color-card))_padding-box,var(--card-glow)_border-box]",
      // Gradient border fades in on hover with a colored shadow.
      glow: "transition-[border-color,box-shadow] duration-300 hover:border-transparent hover:shadow-[0_8px_32px_-8px_var(--card-glow-shadow)] hover:[background:linear-gradient(var(--color-card),var(--color-card))_padding-box,var(--card-glow)_border-box]",
    },
  },
  defaultVariants: {
    effect: "none",
  },
})

function Card({
  className,
  effect = "none",
  ...props
}: React.ComponentProps<"article"> & VariantProps<typeof cardVariants>) {
  return (
    <article
      data-slot="card"
      data-effect={effect}
      className={cn(
        "group/card flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-(--card-padding) text-card-foreground [--card-glow-shadow:oklch(0.65_0.2_300/0.45)] [--card-glow:linear-gradient(135deg,oklch(0.7_0.2_300),oklch(0.8_0.15_200))] [--card-padding:--spacing(4)]",
        // Left/right panels and side media run full height; content goes in CardMain.
        "has-[>[data-slot=card-left],>[data-slot=card-right],>[data-slot=card-media]]:overflow-hidden has-[>[data-slot=card-left],>[data-slot=card-right],>[data-slot=card-media][data-position=left],>[data-slot=card-media][data-position=right]]:flex-row has-[>[data-slot=card-left],>[data-slot=card-right],>[data-slot=card-media][data-position=left],>[data-slot=card-media][data-position=right]]:gap-0 has-[>[data-slot=card-left],>[data-slot=card-right],>[data-slot=card-media][data-position=left],>[data-slot=card-media][data-position=right]]:p-0",
        // A thumbnail sits beside the content inside the card padding.
        "has-[>[data-slot=card-thumbnail]]:flex-row has-[>[data-slot=card-thumbnail]]:items-start has-[>[data-slot=card-thumbnail]]:*:data-[slot=card-main]:p-0",
        cardVariants({ effect }),
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="card-header"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-base font-semibold", className)}
      {...props}
    />
  )
}

function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-body"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function CardMain({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-main"
      className={cn("flex min-w-0 flex-1 flex-col gap-3 p-4", className)}
      {...props}
    />
  )
}

function CardLeft({ className, ...props }: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="card-left"
      className={cn(
        "flex shrink-0 flex-col gap-2 border-r border-border bg-muted/50 p-4",
        className
      )}
      {...props}
    />
  )
}

function CardRight({ className, ...props }: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="card-right"
      className={cn(
        "flex shrink-0 flex-col gap-2 border-l border-border bg-muted/50 p-4",
        className
      )}
      {...props}
    />
  )
}

const cardMediaVariants = cva(
  "relative isolate shrink-0 overflow-hidden bg-muted [&>iframe]:size-full [&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover",
  {
    variants: {
      fade: {
        none: "",
        // Melts into the card on the side facing the content.
        edge: "after:pointer-events-none after:absolute after:inset-0 after:from-card after:via-card/60 after:via-20% after:to-transparent after:to-60%",
        // Darkens the bottom so overlay text stays readable.
        scrim:
          "after:pointer-events-none after:absolute after:inset-0 after:bg-linear-to-t after:from-black/80 after:via-black/20 after:via-40% after:to-transparent after:to-70%",
      },
      hover: {
        none: "",
        zoom: "[&>:not([data-slot=card-media-overlay])]:transition-transform [&>:not([data-slot=card-media-overlay])]:duration-700 [&>:not([data-slot=card-media-overlay])]:ease-out group-hover/card:[&>:not([data-slot=card-media-overlay])]:scale-110 motion-reduce:[&>:not([data-slot=card-media-overlay])]:transition-none",
        // A band of light sweeps across on hover.
        sheen:
          "before:pointer-events-none before:absolute before:inset-y-0 before:-left-1/2 before:z-10 before:w-1/2 before:-skew-x-12 before:bg-linear-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-[left] before:duration-700 before:ease-out group-hover/card:before:left-full motion-reduce:before:hidden",
        // Starts grayscale, fills with color on hover.
        color:
          "[&>:not([data-slot=card-media-overlay])]:grayscale [&>:not([data-slot=card-media-overlay])]:transition-[filter] [&>:not([data-slot=card-media-overlay])]:duration-500 group-hover/card:[&>:not([data-slot=card-media-overlay])]:grayscale-0",
      },
      position: {
        top: "order-first",
        bottom: "order-last",
        left: "order-first w-2/5 self-stretch",
        right: "order-last w-2/5 self-stretch",
      },
      ratio: {
        wide: "",
        square: "",
        still: "",
        auto: "",
      },
      inset: {
        true: "rounded-lg",
        false: "",
      },
    },
    compoundVariants: [
      // Only stacked media follow a ratio; side media fill the card height.
      { position: ["top", "bottom"], ratio: "wide", className: "aspect-video" },
      {
        position: ["top", "bottom"],
        ratio: "square",
        className: "aspect-square",
      },
      {
        position: ["top", "bottom"],
        ratio: "still",
        className: "aspect-[4/3]",
      },
      { position: ["left", "right"], className: "min-h-32" },
      // Edge fade points toward the content.
      { fade: "edge", position: "top", className: "after:bg-linear-to-t" },
      { fade: "edge", position: "bottom", className: "after:bg-linear-to-b" },
      { fade: "edge", position: "left", className: "after:bg-linear-to-l" },
      { fade: "edge", position: "right", className: "after:bg-linear-to-r" },
      // Full bleed: pull past the card padding to the edges.
      {
        position: "top",
        inset: false,
        className:
          "-mx-(--card-padding) -mt-(--card-padding) only:-mb-(--card-padding)",
      },
      {
        position: "bottom",
        inset: false,
        className:
          "-mx-(--card-padding) -mb-(--card-padding) only:-mt-(--card-padding)",
      },
      // Inset: keep the card padding around the media.
      { position: "left", inset: true, className: "m-(--card-padding) mr-0" },
      { position: "right", inset: true, className: "m-(--card-padding) ml-0" },
    ],
    defaultVariants: {
      position: "top",
      ratio: "wide",
      inset: false,
      fade: "none",
      hover: "none",
    },
  }
)

/** Image, video, or embed. Pass an <img>, <video>, or <iframe> as the child. */
function CardMedia({
  className,
  position = "top",
  ratio = "wide",
  inset = false,
  fade = "none",
  hover = "none",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardMediaVariants>) {
  return (
    <div
      data-slot="card-media"
      data-position={position}
      data-ratio={ratio}
      data-inset={inset || undefined}
      data-fade={fade}
      data-hover={hover}
      className={cn(
        cardMediaVariants({ position, ratio, inset, fade, hover }),
        className
      )}
      {...props}
    />
  )
}

const cardMediaOverlayVariants = cva("absolute z-20 flex items-center gap-1", {
  variants: {
    // Hidden until the card is hovered or focused.
    reveal: {
      true: "translate-y-1 opacity-0 transition-[opacity,translate] duration-300 group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:opacity-100",
      false: "",
    },
    placement: {
      center: "inset-0 justify-center",
      "top-left": "top-2 left-2",
      "top-right": "top-2 right-2",
      "bottom-left": "bottom-2 left-2",
      "bottom-right": "right-2 bottom-2",
    },
  },
  defaultVariants: {
    placement: "bottom-right",
    reveal: false,
  },
})

/** Sits on top of CardMedia, e.g. a play button or a video duration. */
function CardMediaOverlay({
  className,
  placement = "bottom-right",
  reveal = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardMediaOverlayVariants>) {
  return (
    <div
      data-slot="card-media-overlay"
      data-placement={placement}
      data-reveal={reveal || undefined}
      className={cn(cardMediaOverlayVariants({ placement, reveal }), className)}
      {...props}
    />
  )
}

const cardThumbnailVariants = cva(
  "relative shrink-0 overflow-hidden rounded-lg bg-muted [&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover",
  {
    variants: {
      size: {
        sm: "size-12",
        md: "size-16",
        lg: "size-24",
      },
      position: {
        left: "order-first",
        right: "order-last",
      },
    },
    defaultVariants: {
      size: "md",
      position: "left",
    },
  }
)

/** Small square image beside the content. Wrap the text in CardMain. */
function CardThumbnail({
  className,
  size = "md",
  position = "left",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardThumbnailVariants>) {
  return (
    <div
      data-slot="card-thumbnail"
      data-size={size}
      data-position={position}
      className={cn(cardThumbnailVariants({ size, position }), className)}
      {...props}
    />
  )
}

export {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardLeft,
  CardMain,
  CardMedia,
  CardMediaOverlay,
  CardRight,
  CardThumbnail,
  CardTitle,
  cardMediaVariants,
  cardVariants,
  cardThumbnailVariants,
}
