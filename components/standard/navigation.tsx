"use client"

import * as React from "react"
import { cn } from "cn"

import { NotificationBadge } from "@/components/standard/notification-badge"

// Material 3 navigation family: Bar (bottom, compact screens), Rail (side,
// medium screens) and Drawer (side list, expanded screens). All three share
// one item shape and one selection model so an app can swap between them at
// breakpoints without reshaping its data.

type NavigationItem = {
  id: string
  label: string
  icon: React.ReactNode
  /** Filled icon shown while selected; falls back to `icon`. */
  activeIcon?: React.ReactNode
  /** `true` shows a dot, a number shows a count. */
  badge?: boolean | number
  disabled?: boolean
}

type NavigationSelection = {
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
}

function useNavigationSelection(
  items: NavigationItem[],
  { value, defaultValue, onValueChange }: NavigationSelection
) {
  const [uncontrolled, setUncontrolled] = React.useState(
    defaultValue ?? items[0]?.id
  )
  const selected = value ?? uncontrolled

  function select(id: string) {
    if (value === undefined) {
      setUncontrolled(id)
    }
    onValueChange?.(id)
  }

  return [selected, select] as const
}

function NavigationIcon({
  item,
  isOn,
}: {
  item: NavigationItem
  isOn: boolean
}) {
  const icon = isOn ? (item.activeIcon ?? item.icon) : item.icon

  if (item.badge === undefined || item.badge === false) {
    return icon
  }

  return (
    <NotificationBadge
      dot={item.badge === true}
      count={typeof item.badge === "number" ? item.badge : undefined}
    >
      {icon}
    </NotificationBadge>
  )
}

const itemBase =
  "group/nav-item relative outline-none select-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0"

// Pill behind the icon. Hover tints it; selected fills it.
const indicatorBase =
  "inline-flex items-center justify-center rounded-full transition-colors"

function indicatorTone(isOn: boolean) {
  return isOn
    ? "bg-secondary text-secondary-foreground"
    : "text-muted-foreground group-hover/nav-item:bg-muted group-hover/nav-item:text-foreground"
}

/**
 * Bottom navigation for compact screens: 3–5 destinations, icon over label.
 * `layout="inline"` puts the label beside the icon for wider bars.
 */
function NavigationBar({
  className,
  items,
  layout = "stacked",
  hideLabels = false,
  ...selection
}: NavigationSelection & {
  className?: string
  items: NavigationItem[]
  layout?: "stacked" | "inline"
  hideLabels?: boolean
}) {
  const [selected, select] = useNavigationSelection(items, selection)

  return (
    <nav
      data-slot="navigation-bar"
      data-layout={layout}
      className={cn(
        "flex w-full items-stretch justify-around border-t border-border bg-background",
        layout === "stacked" ? "h-20 px-2" : "h-16 px-4",
        className
      )}
    >
      {items.map((item) => {
        const isOn = item.id === selected

        return (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            aria-current={isOn ? "page" : undefined}
            aria-label={hideLabels ? item.label : undefined}
            className={cn(
              itemBase,
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg"
            )}
            onClick={() => select(item.id)}
          >
            {layout === "stacked" ? (
              <>
                <span
                  className={cn(indicatorBase, "h-8 w-14", indicatorTone(isOn))}
                >
                  <NavigationIcon item={item} isOn={isOn} />
                </span>
                {hideLabels ? null : (
                  <span
                    className={cn(
                      "max-w-full truncate text-xs font-medium",
                      isOn ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </>
            ) : (
              <span
                className={cn(
                  indicatorBase,
                  "h-10 max-w-full gap-2 px-4 text-sm font-medium",
                  indicatorTone(isOn)
                )}
              >
                <NavigationIcon item={item} isOn={isOn} />
                {hideLabels ? null : (
                  <span className="truncate">{item.label}</span>
                )}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

/**
 * Side navigation for medium screens. Collapsed shows icon over label in a
 * narrow column; `expanded` widens it into drawer-style rows. Put a menu
 * button or primary action in `header`.
 */
function NavigationRail({
  className,
  items,
  expanded = false,
  header,
  footer,
  ...selection
}: NavigationSelection & {
  className?: string
  items: NavigationItem[]
  expanded?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
}) {
  const [selected, select] = useNavigationSelection(items, selection)

  return (
    <nav
      data-slot="navigation-rail"
      data-expanded={expanded || undefined}
      className={cn(
        "flex h-full flex-col gap-4 bg-background py-4 transition-[width]",
        expanded ? "w-56 items-stretch px-3" : "w-20 items-center",
        className
      )}
    >
      {header ? (
        <div
          className={cn(
            "flex flex-col gap-3",
            expanded ? "items-start px-1" : "items-center"
          )}
        >
          {header}
        </div>
      ) : null}
      <div className={cn("flex flex-col", expanded ? "gap-0.5" : "gap-3")}>
        {items.map((item) => {
          const isOn = item.id === selected

          return (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              aria-current={isOn ? "page" : undefined}
              className={cn(
                itemBase,
                expanded
                  ? "flex rounded-full"
                  : "flex w-16 flex-col items-center gap-1 rounded-lg"
              )}
              onClick={() => select(item.id)}
            >
              {expanded ? (
                <span
                  className={cn(
                    indicatorBase,
                    "h-12 w-full justify-start gap-3 px-4 text-sm font-medium",
                    indicatorTone(isOn)
                  )}
                >
                  <NavigationIcon item={item} isOn={isOn} />
                  <span className="truncate">{item.label}</span>
                </span>
              ) : (
                <>
                  <span
                    className={cn(
                      indicatorBase,
                      "h-8 w-14",
                      indicatorTone(isOn)
                    )}
                  >
                    <NavigationIcon item={item} isOn={isOn} />
                  </span>
                  <span
                    className={cn(
                      "max-w-full truncate text-xs font-medium",
                      isOn ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
      {footer ? (
        <div
          className={cn(
            "mt-auto flex flex-col gap-3",
            expanded ? "items-start px-1" : "items-center"
          )}
        >
          {footer}
        </div>
      ) : null}
    </nav>
  )
}

type NavigationDrawerSection = {
  id: string
  /** Small heading above the section; omit for the first group. */
  label?: string
  items: NavigationItem[]
}

/**
 * Full side navigation for expanded screens: full-width pill rows with an
 * optional trailing count, grouped into labelled sections. Put it inside a
 * Sheet for the modal variant on smaller screens.
 */
function NavigationDrawer({
  className,
  title,
  sections,
  ...selection
}: NavigationSelection & {
  className?: string
  title?: string
  sections: NavigationDrawerSection[]
}) {
  const allItems = sections.flatMap((section) => section.items)
  const [selected, select] = useNavigationSelection(allItems, selection)

  return (
    <nav
      data-slot="navigation-drawer"
      className={cn("flex w-72 flex-col gap-1 bg-background p-3", className)}
    >
      {title ? (
        <h2 className="px-4 pt-2 pb-3 text-sm font-semibold text-muted-foreground">
          {title}
        </h2>
      ) : null}
      {sections.map((section, index) => (
        <div
          key={section.id}
          data-slot="navigation-drawer-section"
          className={cn(
            "flex flex-col gap-0.5",
            index > 0 && "mt-1 border-t border-border pt-2"
          )}
        >
          {section.label ? (
            <h3 className="px-4 pt-2 pb-1 text-xs font-medium text-muted-foreground">
              {section.label}
            </h3>
          ) : null}
          {section.items.map((item) => {
            const isOn = item.id === selected
            const count = typeof item.badge === "number" ? item.badge : null

            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                aria-current={isOn ? "page" : undefined}
                className={cn(
                  itemBase,
                  indicatorBase,
                  "h-12 w-full justify-start gap-3 px-4 text-sm font-medium",
                  indicatorTone(isOn)
                )}
                onClick={() => select(item.id)}
              >
                {isOn ? (item.activeIcon ?? item.icon) : item.icon}
                <span className="min-w-0 flex-1 truncate text-left">
                  {item.label}
                </span>
                {count !== null ? (
                  <span className="text-xs tabular-nums">
                    {count > 999 ? "999+" : count}
                  </span>
                ) : item.badge === true ? (
                  <NotificationBadge dot />
                ) : null}
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export { NavigationBar, NavigationDrawer, NavigationRail }
export type { NavigationDrawerSection, NavigationItem }
