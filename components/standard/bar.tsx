"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "cn"

// Hover and pressed states apply only to interactive bars (`data-interactive`);
// a static row keeps its surface but does not react to the pointer.
const barVariants = cva(
  "group/bar flex w-full items-center rounded-lg text-left font-medium transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        ghost:
          "bg-transparent text-foreground data-interactive:hover:bg-muted data-[active=true]:bg-muted data-[state=open]:bg-muted",
        quiet:
          "bg-muted text-foreground data-interactive:hover:bg-muted/70 data-[active=true]:bg-muted/70 data-[state=open]:bg-muted/70",
        outline:
          "border border-input bg-transparent data-interactive:hover:bg-muted data-[active=true]:bg-muted data-[state=open]:bg-muted",
      },
      size: {
        sm: "h-7 gap-2 px-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        default:
          "h-8 gap-2.5 px-2.5 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-10 gap-3 px-3 text-sm [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: { tone: "ghost", size: "default" },
  }
)

type BarProps = Omit<React.ComponentProps<"button">, "children"> &
  VariantProps<typeof barVariants> & {
    /** Leading slot: an icon, avatar, status dot. */
    icon?: React.ReactNode
    /** Main slot. Grows and truncates. */
    label?: React.ReactNode
    /** Keyboard hint shown at the end, e.g. "Ctrl+N". Display only. */
    shortcut?: string
    /** Replaces the shortcut slot with anything, such as a badge or chevron. */
    trailing?: React.ReactNode
    /** Marks the bar as the current one, e.g. the selected nav row. */
    active?: boolean
    /**
     * Renders the single child element as the bar, such as an `<a>`, a
     * `<Link>` or a static `<div>`. The child's own children fill the label
     * slot when `label` is not set.
     */
    asChild?: boolean
    children?: React.ReactElement<{ children?: React.ReactNode }>
  }

/**
 * One row with slots: leading icon, label, trailing hint. Like a Card cut to
 * a single line. Every slot is optional. Renders a button by default; pass
 * `asChild` to render a link or a static row. To open a menu, pass the bar as
 * a menu's `trigger`.
 */
function Bar({
  icon,
  label,
  shortcut,
  trailing,
  active,
  tone,
  size,
  asChild = false,
  children,
  className,
  type = "button",
  ...props
}: BarProps) {
  const child = asChild && React.isValidElement(children) ? children : null
  // Plain buttons, links and components (Link, triggers) react to the pointer;
  // intrinsic non-interactive elements such as div or li do not.
  const interactive =
    !child ||
    typeof child.type !== "string" ||
    child.type === "button" ||
    child.type === "a"

  const end =
    trailing ??
    (shortcut ? (
      <span
        data-slot="bar-shortcut"
        className="text-xs font-normal text-muted-foreground"
      >
        {shortcut}
      </span>
    ) : null)
  const main = label ?? child?.props.children

  const content = (
    <>
      {icon ? (
        <span
          aria-hidden
          data-slot="bar-icon"
          className={cn(
            "inline-flex items-center text-muted-foreground transition-colors",
            interactive && "group-hover/bar:text-foreground"
          )}
        >
          {icon}
        </span>
      ) : null}
      {main != null ? (
        <span data-slot="bar-label" className="min-w-0 flex-1 truncate">
          {main}
        </span>
      ) : null}
      {end ? (
        <span
          data-slot="bar-trailing"
          className="ml-auto inline-flex items-center pl-3"
        >
          {end}
        </span>
      ) : null}
    </>
  )

  const shared = {
    "data-slot": "bar",
    "data-active": active || undefined,
    "data-interactive": interactive || undefined,
    className: cn(barVariants({ tone, size }), className),
  }

  if (child) {
    return (
      <Slot.Root {...shared} {...props}>
        {React.cloneElement(child, undefined, content)}
      </Slot.Root>
    )
  }

  return (
    <button type={type} {...shared} {...props}>
      {content}
    </button>
  )
}

export { Bar, barVariants }
export type { BarProps }
