import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Heading } from "@/components/standard/heading"
import { Paragraph } from "@/components/standard/paragraph"
import { Surface, type SurfaceLayer } from "@/components/standard/surface"

const heroCardPositions = [
  "top-start",
  "top",
  "top-end",
  "start",
  "center",
  "end",
  "bottom-start",
  "bottom",
  "bottom-end",
] as const

type HeroCardPosition = (typeof heroCardPositions)[number]

type Row = "top" | "middle" | "bottom"
type Column = "start" | "center" | "end"

function splitPosition(position: HeroCardPosition): [Row, Column] {
  if (position === "center") return ["middle", "center"]
  if (position === "start" || position === "end") return ["middle", position]
  if (position === "top" || position === "bottom") return [position, "center"]
  const [row, column] = position.split("-") as [Row, Column]
  return [row, column]
}

const rowClasses: Record<Row, string> = {
  top: "items-start",
  middle: "items-center self-center",
  bottom: "items-end self-end",
}

// Filled cells share the row and wrap under each other below ~16rem.
const columnClasses: Record<Column, string> = {
  start: "items-start text-start",
  center: "items-center text-center",
  end: "items-end text-end",
}

const heroCardVariants = cva(
  "grid w-full grid-rows-[auto_1fr_auto] gap-6 overflow-hidden rounded-xl",
  {
    variants: {
      tone: {
        default: "border bg-card text-card-foreground",
        outline: "border",
        ghost: "",
      },
      size: {
        sm: "min-h-64 p-6",
        default: "min-h-96 p-8 md:p-10",
        lg: "min-h-[32rem] p-8 md:p-14",
      },
    },
    defaultVariants: {
      tone: "default",
      size: "default",
    },
  }
)

type HeroCardPart = "title" | "subtitle" | "actions" | "trailing"

/**
 * A hero on a card. The title, subtitle, actions and trailing art each sit
 * at one of nine positions (they share `position` unless given their own),
 * over any stack of layers: `layers` takes Surface layer data, and children
 * take layer components such as Gradient, Noise or Shader.
 */
function HeroCard({
  className,
  title,
  subtitle,
  actions,
  leading,
  position = "bottom-start",
  subtitlePosition,
  actionsPosition,
  trailing,
  trailingPosition = "end",
  level = 2,
  layers,
  tone = "default",
  size = "default",
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof heroCardVariants> & {
    /** The headline, set in Heading's display style. */
    title: React.ReactNode
    /** Optional subheading under the title. */
    subtitle?: React.ReactNode
    /** Calls to action, usually one or two Buttons. */
    actions?: React.ReactNode
    /** Above the title, in the title's position: an eyebrow or badge. */
    leading?: React.ReactNode
    /** Where the title sits. Default `bottom-start`. */
    position?: HeroCardPosition
    /** Where the subtitle sits. Follows `position` when left out. */
    subtitlePosition?: HeroCardPosition
    /** Where the actions sit. Follow `position` when left out. */
    actionsPosition?: HeroCardPosition
    /** Art that sits in the layout: a cut-out image, illustration or UI card. */
    trailing?: React.ReactNode
    /** Where the trailing art sits. Default `end`, beside a `start` title. */
    trailingPosition?: HeroCardPosition
    level?: 1 | 2 | 3
    /** Painted bottom to top under the content, unless a layer is `over`. */
    layers?: SurfaceLayer[]
  }) {
  const parts: Record<HeroCardPart, React.ReactNode> = {
    title: (
      <React.Fragment key="title">
        {leading ? <div data-slot="hero-card-leading">{leading}</div> : null}
        <Heading level={level} display className="max-w-3xl">
          {title}
        </Heading>
      </React.Fragment>
    ),
    subtitle: subtitle ? (
      <Paragraph
        key="subtitle"
        data-slot="hero-card-subtitle"
        className="max-w-xl text-lg leading-relaxed text-current/75"
      >
        {subtitle}
      </Paragraph>
    ) : null,
    actions: actions ? (
      <div
        key="actions"
        data-slot="hero-card-actions"
        className="flex flex-wrap gap-3"
      >
        {actions}
      </div>
    ) : null,
    trailing: trailing ? (
      <div key="trailing" data-slot="hero-card-trailing">
        {trailing}
      </div>
    ) : null,
  }

  const placed: [HeroCardPart, HeroCardPosition][] = [
    ["title", position],
    ["subtitle", subtitlePosition ?? position],
    ["actions", actionsPosition ?? position],
    ["trailing", trailingPosition],
  ]

  // Group parts by row, then by column, keeping title → subtitle → actions
  // → trailing.
  const rows = (["top", "middle", "bottom"] as const).map((row) => ({
    row,
    cells: (["start", "center", "end"] as const)
      .map((column) => ({
        column,
        parts: placed
          .filter(([part, at]) => {
            const [r, c] = splitPosition(at)
            return r === row && c === column && parts[part] !== null
          })
          .map(([part]) => parts[part]),
      }))
      .filter((cell) => cell.parts.length > 0),
  }))

  return (
    <Surface
      data-slot="hero-card"
      data-position={position}
      layers={layers}
      className={cn(heroCardVariants({ tone, size }), className)}
      {...props}
    >
      {children}
      {rows.map(({ row, cells }) => (
        <div
          key={row}
          data-slot="hero-card-row"
          data-row={row}
          className={cn("flex w-full flex-wrap gap-6", rowClasses[row])}
        >
          {cells.map(({ column, parts: cellParts }) => (
            <div
              key={column}
              data-slot="hero-card-cell"
              data-column={column}
              className={cn(
                "flex min-w-0 max-w-full flex-[1_1_16rem] flex-col gap-4",
                columnClasses[column]
              )}
            >
              {cellParts}
            </div>
          ))}
        </div>
      ))}
    </Surface>
  )
}

export {
  HeroCard,
  heroCardPositions,
  heroCardVariants,
  type HeroCardPosition,
}
