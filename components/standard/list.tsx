"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronRightIcon } from "lucide-react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"
import { Bar, type BarProps } from "@/components/standard/bar"

type ListSize = "sm" | "default" | "lg"

type ListContextValue = {
  size: ListSize
  /** Every row keeps a chevron column so leaves line up with branches. */
  tree: boolean
  divided: boolean
  depth: number
  value: string | null
  onSelect: ((value: string) => void) | null
}

const ListContext = React.createContext<ListContextValue>({
  size: "default",
  tree: false,
  divided: false,
  depth: 0,
  value: null,
  onSelect: null,
})

// Indent per tree level; matches the chevron column so children sit under
// their parent's icon.
const INDENT: Record<ListSize, string> = {
  sm: "1.25rem",
  default: "1.5rem",
  lg: "1.5rem",
}

const listVariants = cva("flex w-full min-w-0 flex-col text-foreground", {
  variants: {
    tone: {
      default: "rounded-xl border border-border bg-card p-1.5 shadow-sm",
      quiet: "rounded-xl bg-muted/60 p-1.5",
      outline: "rounded-xl border border-border p-1.5",
      ghost: "",
    },
  },
  defaultVariants: { tone: "default" },
})

/** One row, a titled section or a divider, for the `items` prop. */
type ListEntry =
  | ({ type?: "item"; id: string; items?: ListEntry[] } & Omit<
      ListItemProps,
      "children"
    >)
  | {
      type: "section"
      id: string
      label: React.ReactNode
      trailing?: React.ReactNode
      collapsible?: boolean
      defaultOpen?: boolean
      items: ListEntry[]
    }
  | { type: "separator"; id: string }

type ListProps = Omit<React.ComponentProps<"div">, "title" | "defaultValue"> &
  VariantProps<typeof listVariants> & {
    /** Heading at the top of the card, e.g. "Recent". */
    title?: React.ReactNode
    /** Before the title: an icon or avatar. */
    leading?: React.ReactNode
    /** End of the title row: a "See all" link, a count, a button. */
    trailing?: React.ReactNode
    /** Pinned under the rows, e.g. an "Add" bar. */
    footer?: React.ReactNode
    size?: ListSize
    /** Rows as data. Composed `<ListItem>` children work too. */
    items?: ListEntry[]
    /** Folder-tree layout: a chevron column on every row. */
    tree?: boolean
    /** Hairline between rows, for settings-style lists. */
    divided?: boolean
    /**
     * Rows with a `value` become selectable; the selected one is active.
     * Controlled with `value`, or kept internally from `defaultValue`.
     */
    value?: string | null
    defaultValue?: string | null
    onValueChange?: (value: string | null) => void
  }

/**
 * A card of Bars. Rows can be links, buttons, selectable options or
 * expandable branches, grouped under sections and split by separators.
 * Pass `items` or compose `ListItem`, `ListSection` and `ListSeparator`.
 */
function List({
  title,
  leading,
  trailing,
  footer,
  tone,
  size = "default",
  items,
  tree = false,
  divided = false,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  className,
  children,
  ...props
}: ListProps) {
  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })

  const context = React.useMemo<ListContextValue>(
    () => ({
      size,
      tree,
      divided,
      depth: 0,
      value,
      onSelect: setValue,
    }),
    [size, tree, divided, value, setValue]
  )

  const hasHeader = title != null || leading != null || trailing != null

  return (
    <ListContext.Provider value={context}>
      <div
        data-slot="list"
        data-tone={tone ?? "default"}
        className={cn(listVariants({ tone }), className)}
        {...props}
      >
        {hasHeader ? (
          <div
            data-slot="list-header"
            className={cn(
              "flex items-center gap-2 px-2.5 pt-1.5 pb-2",
              size === "sm" ? "text-xs" : "text-sm"
            )}
          >
            {leading != null ? (
              <span className="inline-flex shrink-0 items-center text-muted-foreground">
                {leading}
              </span>
            ) : null}
            {title != null ? (
              <span className="min-w-0 flex-1 truncate font-semibold">
                {title}
              </span>
            ) : null}
            {trailing != null ? (
              <span className="ml-auto inline-flex shrink-0 items-center text-xs text-muted-foreground">
                {trailing}
              </span>
            ) : null}
          </div>
        ) : null}
        <ListRows>
          {items ? <RendersListEntries entries={items} /> : children}
        </ListRows>
        {footer != null ? (
          <div
            data-slot="list-footer"
            className="mt-1 border-t border-border pt-1"
          >
            {footer}
          </div>
        ) : null}
      </div>
    </ListContext.Provider>
  )
}

function ListRows({ children }: { children: React.ReactNode }) {
  const { divided } = React.useContext(ListContext)

  return (
    <ul
      data-slot="list-rows"
      className={cn(
        "flex flex-col gap-0.5",
        divided &&
          "gap-0 [&>li]:py-0.5 [&>li+li]:border-t [&>li+li]:border-border"
      )}
    >
      {children}
    </ul>
  )
}

function RendersListEntries({ entries }: { entries: ListEntry[] }) {
  return entries.map((entry) => {
    if (entry.type === "separator") {
      return <ListSeparator key={entry.id} />
    }
    if (entry.type === "section") {
      const { id, items, ...section } = entry
      return (
        <ListSection key={id} {...section}>
          <RendersListEntries entries={items} />
        </ListSection>
      )
    }
    const { id, items, ...item } = entry
    delete item.type
    return (
      <ListItem key={id} {...item}>
        {items ? <RendersListEntries entries={items} /> : undefined}
      </ListItem>
    )
  })
}

type ListItemProps = Omit<
  BarProps,
  "asChild" | "children" | "size" | "tone" | "value"
> & {
  /** Second line under the label. Makes the row two lines tall. */
  description?: React.ReactNode
  /** Renders the row as a link. */
  href?: string
  /** Makes the row selectable within a List that tracks `value`. */
  value?: string
  /** Nested rows. The row becomes an expandable branch. */
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/** One Bar in a List. Nest ListItems inside to make an expandable branch. */
function ListItem({
  icon,
  label,
  description,
  href,
  value,
  active,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onClick,
  children,
  className,
  style,
  ...props
}: ListItemProps) {
  const context = React.useContext(ListContext)
  const { size, tree, depth } = context
  const isBranch = React.Children.toArray(children).some(Boolean)
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const rowsId = React.useId()

  const isSelected = value != null && context.value === value
  const isActive = active ?? isSelected
  const chevronSize = size === "sm" ? "size-3.5" : "size-4"

  const chevron = isBranch ? (
    <ChevronRightIcon
      data-slot="list-chevron"
      className={cn(
        chevronSize,
        "transition-transform duration-200",
        open && "rotate-90"
      )}
    />
  ) : tree ? (
    <span className={cn("inline-block", chevronSize)} />
  ) : null

  const leading =
    chevron && icon ? (
      <>
        {chevron}
        {icon}
      </>
    ) : (
      (chevron ?? icon)
    )

  const main =
    description != null ? (
      <span className="flex min-w-0 flex-col gap-0.5 py-0.5">
        <span className="truncate">{label}</span>
        <span className="truncate text-xs font-normal text-muted-foreground">
          {description}
        </span>
      </span>
    ) : (
      label
    )

  const barProps = {
    ...props,
    icon: leading,
    label: main,
    size,
    active: isActive || undefined,
    "aria-current": isActive ? ("true" as const) : undefined,
    className: cn(
      description != null && "h-auto py-1.5",
      tree && "gap-1.5",
      className
    ),
    style: {
      paddingInlineStart:
        depth > 0
          ? `calc(${size === "sm" ? "0.5rem" : size === "lg" ? "0.75rem" : "0.625rem"} + ${depth} * ${INDENT[size]})`
          : undefined,
      ...style,
    },
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) {
      return
    }
    if (isBranch) {
      setOpen((previous) => !previous)
    }
    if (value != null) {
      context.onSelect?.(value)
    }
  }

  const row =
    href != null && !isBranch ? (
      <Bar asChild {...barProps}>
        <a href={href} />
      </Bar>
    ) : (
      <Bar
        {...barProps}
        aria-expanded={isBranch ? open : undefined}
        aria-controls={isBranch ? rowsId : undefined}
        onClick={handleClick}
      />
    )

  const nested = React.useMemo(
    () => ({ ...context, depth: depth + 1 }),
    [context, depth]
  )

  return (
    <li data-slot="list-item" className="min-w-0">
      {row}
      {isBranch ? (
        <RendersListCollapse id={rowsId} open={open}>
          <ListContext.Provider value={nested}>
            <ul data-slot="list-rows" className="flex flex-col gap-0.5 pt-0.5">
              {children}
            </ul>
          </ListContext.Provider>
        </RendersListCollapse>
      ) : null}
    </li>
  )
}

// Height animates through grid rows; closed content is inert so it leaves the
// tab order.
function RendersListCollapse({
  id,
  open,
  children,
}: {
  id: string
  open: boolean
  children: React.ReactNode
}) {
  return (
    <div
      id={id}
      inert={!open}
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

type ListSectionProps = {
  label: React.ReactNode
  /** End of the section heading: a count or an add button. */
  trailing?: React.ReactNode
  /** The heading toggles the section open and closed. */
  collapsible?: boolean
  defaultOpen?: boolean
  children?: React.ReactNode
  className?: string
}

/** A small heading over a group of rows, optionally collapsible. */
function ListSection({
  label,
  trailing,
  collapsible = false,
  defaultOpen = true,
  children,
  className,
}: ListSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const rowsId = React.useId()
  const isOpen = !collapsible || open

  const heading = (
    <>
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {collapsible ? (
        <ChevronRightIcon
          className={cn(
            "size-3.5 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
      ) : null}
    </>
  )
  const headingClass =
    "flex min-w-0 flex-1 items-center gap-1 text-xs font-medium text-muted-foreground"

  const rows = (
    <ul data-slot="list-rows" className="flex flex-col gap-0.5">
      {children}
    </ul>
  )

  return (
    <li
      data-slot="list-section"
      className={cn("min-w-0 pt-2 first:pt-0", className)}
    >
      <div className="flex items-center gap-2 px-2.5 pt-1 pb-1.5">
        {collapsible ? (
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={rowsId}
            className={cn(
              headingClass,
              "rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            )}
            onClick={() => setOpen((previous) => !previous)}
          >
            {heading}
          </button>
        ) : (
          <span className={headingClass}>{heading}</span>
        )}
        {trailing != null ? (
          <span className="inline-flex shrink-0 items-center text-xs text-muted-foreground">
            {trailing}
          </span>
        ) : null}
      </div>
      {collapsible ? (
        <RendersListCollapse id={rowsId} open={isOpen}>
          {rows}
        </RendersListCollapse>
      ) : (
        rows
      )}
    </li>
  )
}

/** A hairline between groups of rows. */
function ListSeparator({ className }: { className?: string }) {
  return (
    <li
      role="separator"
      data-slot="list-separator"
      className={cn("mx-2.5 my-1 h-px bg-border", className)}
    />
  )
}

export { List, ListItem, ListSection, ListSeparator, listVariants }
export type { ListEntry, ListItemProps, ListProps, ListSectionProps }
