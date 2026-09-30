import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Spans live in CSS variables so a preset can set them per child and a
// tile's own colSpan/rowSpan (inline style) always wins. Column spans clamp
// to the current column count, so wide tiles never overflow a narrow grid.
const bentoGridVariants = cva(
  "grid grid-flow-row-dense grid-cols-[repeat(var(--bento-cols),minmax(0,1fr))] [--bento-col-span:1] [--bento-row-span:1]",
  {
    variants: {
      variant: {
        // Every tile the same size.
        uniform: "",
        // First tile 2×2, the rest fill around it.
        featured:
          "[&>:first-child]:[--bento-col-span:2] [&>:first-child]:[--bento-row-span:2]",
        // First tile spans the full width.
        hero: "[&>:first-child]:[--bento-col-span:999]",
        // First tile runs two rows tall down the side.
        sidebar: "[&>:first-child]:[--bento-row-span:2]",
        // Wide, small / small, wide — repeats every four tiles.
        split:
          "[&>:nth-child(4n+1)]:[--bento-col-span:2] [&>:nth-child(4n+4)]:[--bento-col-span:2]",
        // Big, small, tall, small, wide, wide — repeats every six tiles.
        mosaic:
          "[&>:nth-child(6n+1)]:[--bento-col-span:2] [&>:nth-child(6n+1)]:[--bento-row-span:2] [&>:nth-child(6n+3)]:[--bento-row-span:2] [&>:nth-child(6n+5)]:[--bento-col-span:2] [&>:nth-child(6n+6)]:[--bento-col-span:2]",
      },
      gap: {
        sm: "gap-2",
        default: "gap-3",
        lg: "gap-4",
      },
      rowHeight: {
        auto: "auto-rows-auto",
        sm: "auto-rows-[minmax(6rem,auto)]",
        default: "auto-rows-[minmax(9rem,auto)]",
        lg: "auto-rows-[minmax(12rem,auto)]",
      },
    },
    defaultVariants: {
      variant: "uniform",
      gap: "default",
      rowHeight: "default",
    },
  }
)

type BentoColumns = 1 | 2 | 3 | 4 | 5 | 6

const presetColumns: Record<BentoGridVariant, BentoColumns> = {
  uniform: 3,
  featured: 4,
  hero: 3,
  sidebar: 3,
  split: 3,
  mosaic: 4,
}

type BentoGridVariant = NonNullable<
  VariantProps<typeof bentoGridVariants>["variant"]
>

// Responsive grids step 1 → 2 → full columns as their container widens.
const responsiveColumns: Record<BentoColumns, string> = {
  1: "[--bento-cols:1]",
  2: "[--bento-cols:1] @xs:[--bento-cols:2]",
  3: "[--bento-cols:1] @xs:[--bento-cols:2] @xl:[--bento-cols:3]",
  4: "[--bento-cols:1] @xs:[--bento-cols:2] @xl:[--bento-cols:4]",
  5: "[--bento-cols:1] @xs:[--bento-cols:2] @xl:[--bento-cols:3] @3xl:[--bento-cols:5]",
  6: "[--bento-cols:1] @xs:[--bento-cols:2] @xl:[--bento-cols:3] @3xl:[--bento-cols:6]",
}

const fixedColumns: Record<BentoColumns, string> = {
  1: "[--bento-cols:1]",
  2: "[--bento-cols:2]",
  3: "[--bento-cols:3]",
  4: "[--bento-cols:4]",
  5: "[--bento-cols:5]",
  6: "[--bento-cols:6]",
}

function BentoGrid({
  className,
  variant = "uniform",
  gap = "default",
  rowHeight = "default",
  columns,
  responsive = true,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof bentoGridVariants> & {
    /** Column count at full width. Defaults to what the variant is built for. */
    columns?: BentoColumns
    /** Collapse to fewer columns in narrow containers. */
    responsive?: boolean
  }) {
  const preset = variant ?? "uniform"
  const cols = columns ?? presetColumns[preset]

  return (
    <div data-slot="bento-grid" className="@container w-full min-w-0">
      <div
        data-slot="bento-grid-layout"
        data-variant={preset}
        className={cn(
          bentoGridVariants({ variant: preset, gap, rowHeight }),
          responsive ? responsiveColumns[cols] : fixedColumns[cols],
          className
        )}
        {...props}
      />
    </div>
  )
}

const bentoTileVariants = cva(
  "relative isolate flex min-w-0 flex-col gap-3 overflow-hidden rounded-xl p-4 [grid-column:span_min(var(--bento-col-span),var(--bento-cols))] [grid-row:span_var(--bento-row-span)]",
  {
    variants: {
      variant: {
        default: "border border-border bg-card text-card-foreground",
        muted: "bg-muted text-foreground",
        outline: "border border-border",
        ghost: "",
        primary: "bg-primary text-primary-foreground",
      },
      interactive: {
        true: "cursor-pointer transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "muted", interactive: true, className: "hover:bg-muted/70" },
      {
        variant: "primary",
        interactive: true,
        className: "hover:bg-primary/90",
      },
    ],
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
)

type BentoSpan = 1 | 2 | 3 | 4 | 5 | 6 | "full"

function BentoTile({
  className,
  style,
  variant = "default",
  interactive = false,
  colSpan,
  rowSpan,
  icon,
  title,
  description,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof bentoTileVariants> & {
    /** Columns to cover. Overrides the grid variant for this tile. */
    colSpan?: BentoSpan
    /** Rows to cover. Overrides the grid variant for this tile. */
    rowSpan?: 1 | 2 | 3 | 4
    icon?: React.ReactNode
    title?: React.ReactNode
    description?: React.ReactNode
  }) {
  const spans = {
    ...(colSpan != null && {
      "--bento-col-span": colSpan === "full" ? 999 : colSpan,
    }),
    ...(rowSpan != null && { "--bento-row-span": rowSpan }),
  } as React.CSSProperties
  const hasHeader = icon != null || title != null || description != null

  return (
    <div
      data-slot="bento-tile"
      data-variant={variant}
      tabIndex={interactive ? 0 : undefined}
      className={cn(bentoTileVariants({ variant, interactive }), className)}
      style={{ ...spans, ...style }}
      {...props}
    >
      {hasHeader ? (
        <BentoTileHeader>
          {icon != null ? <BentoTileIcon>{icon}</BentoTileIcon> : null}
          {title != null ? <BentoTileTitle>{title}</BentoTileTitle> : null}
          {description != null ? (
            <BentoTileDescription>{description}</BentoTileDescription>
          ) : null}
        </BentoTileHeader>
      ) : null}
      {children}
    </div>
  )
}

function BentoTileHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bento-tile-header"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function BentoTileIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bento-tile-icon"
      className={cn(
        "mb-1 flex size-9 items-center justify-center rounded-lg bg-muted text-foreground [[data-slot=bento-tile][data-variant=muted]_&]:bg-background [[data-slot=bento-tile][data-variant=primary]_&]:bg-primary-foreground/15 [[data-slot=bento-tile][data-variant=primary]_&]:text-primary-foreground [&_svg:not([class*='size-'])]:size-4.5",
        className
      )}
      {...props}
    />
  )
}

function BentoTileTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="bento-tile-title"
      className={cn("text-base font-semibold", className)}
      {...props}
    />
  )
}

function BentoTileDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="bento-tile-description"
      className={cn(
        "text-sm text-muted-foreground [[data-slot=bento-tile][data-variant=primary]_&]:text-primary-foreground/75",
        className
      )}
      {...props}
    />
  )
}

const bentoTileMediaVariants = cva("overflow-hidden", {
  variants: {
    position: {
      // Grows to fill the space left in the tile.
      fill: "relative min-h-24 flex-1 rounded-lg",
      // Sits behind the tile content, edge to edge.
      background:
        "pointer-events-none absolute inset-0 -z-10 *:size-full *:object-cover",
    },
  },
  defaultVariants: {
    position: "fill",
  },
})

function BentoTileMedia({
  className,
  position = "fill",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof bentoTileMediaVariants>) {
  return (
    <div
      data-slot="bento-tile-media"
      data-position={position}
      className={cn(bentoTileMediaVariants({ position }), className)}
      {...props}
    />
  )
}

function BentoTileFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bento-tile-footer"
      className={cn("mt-auto flex items-center gap-2", className)}
      {...props}
    />
  )
}

export {
  BentoGrid,
  BentoTile,
  BentoTileDescription,
  BentoTileFooter,
  BentoTileHeader,
  BentoTileIcon,
  BentoTileMedia,
  BentoTileTitle,
  bentoGridVariants,
  bentoTileVariants,
}
