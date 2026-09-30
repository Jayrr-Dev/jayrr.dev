"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "cn"

type AccordionItem = {
  id: string
  title: React.ReactNode
  body: React.ReactNode
  /** Leading icon. With chevron="icon" it turns into the chevron on hover. */
  icon?: React.ReactNode
  /** Shown at the end of the header, e.g. a count or action buttons. */
  trailing?: React.ReactNode
  defaultOpen?: boolean
}

/**
 * Where the open/close chevron sits:
 * - end: pushed to the right of the header
 * - start: before the title
 * - inline: right after the title text
 * - icon: replaces the leading icon while hovered or focused
 * - none: no chevron
 */
type AccordionChevron = "end" | "start" | "inline" | "icon" | "none"

const chevronClass =
  "size-4 shrink-0 text-muted-foreground transition-transform duration-200"

function Accordion({
  className,
  items,
  chevron = "end",
  tone = "divided",
  single = false,
}: {
  className?: string
  items: AccordionItem[]
  chevron?: AccordionChevron
  /** divided: full-width rows split by lines. plain: rounded rows like Bar, for sidebars. */
  tone?: "divided" | "plain"
  /** Only one item open at a time. */
  single?: boolean
}) {
  const group = React.useId()
  const plain = tone === "plain"

  return (
    <div
      data-slot="accordion"
      className={cn("flex w-full flex-col", plain && "gap-0.5", className)}
    >
      {items.map((item) => {
        const down = (
          <ChevronDownIcon
            aria-hidden
            className={cn(chevronClass, "group-open/item:rotate-180")}
          />
        )
        const right = (
          <ChevronRightIcon
            aria-hidden
            className={cn(chevronClass, "group-open/item:rotate-90")}
          />
        )
        // "icon" without an icon has nothing to swap, so it falls back to start.
        const mode = chevron === "icon" && !item.icon ? "start" : chevron
        const text = typeof item.body === "string"
        // Each leading slot is size-4 plus gap-2 (24px); plain rows add px-2.5.
        const leading = (mode === "start" ? 1 : 0) + (item.icon ? 1 : 0)
        const indent = leading * 24 + (plain ? 10 : 0)

        return (
          <details
            key={item.id}
            name={single ? group : undefined}
            open={item.defaultOpen}
            data-slot="accordion-item"
            className={cn("group/item", !plain && "border-b border-border")}
          >
            <summary
              data-slot="accordion-trigger"
              className={cn(
                "group/trigger flex cursor-pointer list-none items-center gap-2 text-sm font-medium outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:shrink-0 [&::-webkit-details-marker]:hidden",
                plain
                  ? "h-8 rounded-lg px-2.5 transition-colors hover:bg-muted"
                  : "rounded-sm py-2.5"
              )}
            >
              {mode === "start" ? right : null}
              {mode === "icon" ? (
                <span className="relative grid size-4 place-items-center">
                  <span
                    aria-hidden
                    className="inline-flex text-muted-foreground transition-opacity group-hover/trigger:opacity-0 group-focus-visible/trigger:opacity-0 [&_svg:not([class*='size-'])]:size-4"
                  >
                    {item.icon}
                  </span>
                  <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover/trigger:opacity-100 group-focus-visible/trigger:opacity-100">
                    {right}
                  </span>
                </span>
              ) : item.icon ? (
                <span
                  aria-hidden
                  className="inline-flex text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
                >
                  {item.icon}
                </span>
              ) : null}
              <span
                className={cn(
                  "flex min-w-0 items-center gap-1",
                  mode !== "inline" && "flex-1"
                )}
              >
                <span className="truncate">{item.title}</span>
                {mode === "inline" ? down : null}
              </span>
              {mode === "inline" ? <span className="flex-1" /> : null}
              {item.trailing ? (
                <span
                  data-slot="accordion-trailing"
                  className="inline-flex items-center gap-1 text-muted-foreground"
                >
                  {item.trailing}
                </span>
              ) : null}
              {mode === "end" ? down : null}
            </summary>
            <div
              data-slot="accordion-content"
              className={cn(
                "text-sm",
                text ? "pb-3 text-muted-foreground" : plain ? "pt-0.5" : "pb-3"
              )}
              // Text lines up under the title; custom bodies (like Bar lists) span the row.
              style={text ? { paddingLeft: indent } : undefined}
            >
              {item.body}
            </div>
          </details>
        )
      })}
    </div>
  )
}

export { Accordion }
export type { AccordionChevron, AccordionItem }
