"use client"

import * as React from "react"
import { cn } from "cn"

// Material 3 (Expressive) top app bar: Small keeps the title in a single 64px
// row; Medium and Large flexible put a bigger title in a second row that
// collapses into the top row as content scrolls; Search swaps the title for a
// pill-shaped search field. The bottom app bar is replaced by the docked
// Toolbar in M3 Expressive, so it isn't here.

type AppBarVariant = "small" | "medium" | "large" | "search"

type AppBarScroll = {
  /** Element whose scroll drives the bar. Omit and use `scrolled`/`collapsed` to drive it yourself. */
  scrollRef?: React.RefObject<HTMLElement | null>
  /** Content has scrolled under the bar: fills the container. */
  scrolled?: boolean
  /** Medium/Large only: fold the big title into the top row. */
  collapsed?: boolean
}

// Scroll distance before a flexible bar folds its big title away.
const COLLAPSE_AT = 48

function useAppBarScroll({ scrollRef, scrolled, collapsed }: AppBarScroll) {
  const [offset, setOffset] = React.useState(0)

  React.useEffect(() => {
    const el = scrollRef?.current
    if (!el) {
      return
    }

    function onScroll() {
      setOffset(el!.scrollTop)
    }

    onScroll()
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [scrollRef])

  return {
    isScrolled: scrolled ?? offset > 0,
    isCollapsed: collapsed ?? offset > COLLAPSE_AT,
  }
}

/**
 * Top of a screen: an optional leading nav button, a title (and subtitle),
 * and up to three trailing actions. Pass `scrollRef` to fill on scroll and,
 * for Medium/Large, collapse to the Small layout.
 */
function AppBar({
  className,
  variant = "small",
  title,
  subtitle,
  align = "start",
  leading,
  actions,
  search,
  scrollRef,
  scrolled,
  collapsed,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> &
  AppBarScroll & {
    variant?: AppBarVariant
    title?: React.ReactNode
    subtitle?: React.ReactNode
    /** Small only: center the title between leading and trailing. */
    align?: "start" | "center"
    /** Navigation icon button (menu, back). */
    leading?: React.ReactNode
    /** Trailing icon buttons; keep to three and move the rest into a menu. */
    actions?: React.ReactNode
    /** Search variant: the field that fills the bar, e.g. `<AppBarSearch />`. */
    search?: React.ReactNode
  }) {
  const { isScrolled, isCollapsed } = useAppBarScroll({
    scrollRef,
    scrolled,
    collapsed,
  })
  const isFlexible = variant === "medium" || variant === "large"
  const showsInlineTitle = variant === "small" || (isFlexible && isCollapsed)
  const isCentered = variant === "small" && align === "center"

  return (
    <header
      data-slot="app-bar"
      data-variant={variant}
      data-scrolled={isScrolled || undefined}
      data-collapsed={(isFlexible && isCollapsed) || undefined}
      className={cn(
        "flex w-full shrink-0 flex-col bg-background text-foreground transition-colors duration-200",
        isScrolled && "bg-muted",
        className
      )}
      {...props}
    >
      <div
        data-slot="app-bar-row"
        className={cn(
          "relative flex h-16 items-center gap-1 px-1",
          !leading && "pl-4",
          !actions && "pr-4"
        )}
      >
        {leading ? (
          <div className="flex shrink-0 items-center">{leading}</div>
        ) : null}

        {variant === "search" ? (
          <div className="flex min-w-0 flex-1 items-center px-1">{search}</div>
        ) : (
          <div
            aria-hidden={!showsInlineTitle || undefined}
            className={cn(
              "flex min-w-0 flex-1 flex-col transition-opacity duration-200",
              leading && "pl-1",
              isCentered &&
                "pointer-events-none absolute inset-x-16 items-center text-center",
              showsInlineTitle ? "opacity-100" : "opacity-0"
            )}
          >
            <AppBarTitle size="small">{title}</AppBarTitle>
            {subtitle ? <AppBarSubtitle>{subtitle}</AppBarSubtitle> : null}
          </div>
        )}

        {actions ? (
          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            {actions}
          </div>
        ) : null}
      </div>

      {isFlexible ? (
        <div
          data-slot="app-bar-expanded"
          aria-hidden={isCollapsed || undefined}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
            isCollapsed
              ? "grid-rows-[0fr] opacity-0"
              : "grid-rows-[1fr] opacity-100"
          )}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                "flex flex-col justify-end px-4",
                variant === "medium"
                  ? subtitle
                    ? "h-[72px] pb-3"
                    : "h-12 pb-3"
                  : subtitle
                    ? "h-[88px] pb-4"
                    : "h-14 pb-4"
              )}
            >
              <AppBarTitle size={variant}>{title}</AppBarTitle>
              {subtitle ? (
                <AppBarSubtitle size={variant}>{subtitle}</AppBarSubtitle>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

function AppBarTitle({
  size,
  children,
}: {
  size: "small" | "medium" | "large"
  children: React.ReactNode
}) {
  return (
    <h1
      className={cn(
        "truncate font-normal tracking-tight",
        size === "small" && "text-[1.375rem] leading-7",
        size === "medium" && "text-[1.75rem] leading-9",
        size === "large" && "text-4xl leading-[2.75rem]"
      )}
    >
      {children}
    </h1>
  )
}

function AppBarSubtitle({
  size = "small",
  children,
}: {
  size?: "small" | "medium" | "large"
  children: React.ReactNode
}) {
  return (
    <p
      className={cn(
        "truncate text-muted-foreground",
        size === "small" ? "text-xs" : "text-base"
      )}
    >
      {children}
    </p>
  )
}

/** Pill-shaped search field for the Search app bar. */
function AppBarSearch({
  className,
  leading,
  trailing,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  /** Icon or button at the start of the pill; defaults to nothing. */
  leading?: React.ReactNode
  /** Icon, button or avatar at the end of the pill. */
  trailing?: React.ReactNode
}) {
  return (
    <label
      data-slot="app-bar-search"
      className={cn(
        "flex h-12 w-full min-w-0 items-center gap-2 rounded-full bg-muted px-4 transition-colors focus-within:ring-3 focus-within:ring-ring/50 has-disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        leading && "pl-1",
        trailing && "pr-1",
        className
      )}
    >
      {leading}
      <input
        type="search"
        aria-label={props["aria-label"] ?? props.placeholder ?? "Search"}
        className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
      />
      {trailing}
    </label>
  )
}

export { AppBar, AppBarSearch }
export type { AppBarVariant }
