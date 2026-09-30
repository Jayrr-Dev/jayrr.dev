"use client"

import * as React from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import { DropdownMenu, type MenuEntry } from "@/components/standard/menu"

type ThemeMode = "light" | "dark" | "system"

const MODES: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> },
  { value: "system", label: "System", icon: <MonitorIcon /> },
]

const SEGMENT_BOX = {
  sm: "size-6",
  default: "size-7",
  lg: "size-8",
} as const

const DARK_QUERY = "(prefers-color-scheme: dark)"

function subscribingToSystemMode(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/** Whether the OS asks for dark. False on the server and before hydration. */
function useSystemPrefersDark() {
  return React.useSyncExternalStore(
    subscribingToSystemMode,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false
  )
}

/**
 * Sun that turns into a moon. With `dark` undefined it follows the `dark:`
 * variant (the app theme), which is right before hydration too; otherwise it
 * shows the mode it is given.
 */
function RendersModeIcon({ dark }: { dark?: boolean }) {
  const follows = dark === undefined

  return (
    <span aria-hidden className="relative inline-flex size-4 [&_svg]:size-4">
      <SunIcon
        className={cn(
          "transition-transform duration-300",
          follows
            ? "scale-100 rotate-0 dark:scale-0 dark:-rotate-90"
            : dark
              ? "scale-0 -rotate-90"
              : "scale-100 rotate-0"
        )}
      />
      <MoonIcon
        className={cn(
          "absolute inset-0 transition-transform duration-300",
          follows
            ? "scale-0 rotate-90 dark:scale-100 dark:rotate-0"
            : dark
              ? "scale-100 rotate-0"
              : "scale-0 rotate-90"
        )}
      />
    </span>
  )
}

/**
 * Switches between light, dark and system themes, the shadcn mode toggle.
 *
 * Without `value` it reads and sets the app theme through next-themes, so it
 * needs the app wrapped in a next-themes `ThemeProvider` with
 * `attribute="class"`. Pass `value` and `onValueChange` to drive something
 * else, such as a scoped preview.
 *
 * - `menu`: an icon button that opens Light, Dark and System.
 * - `toggle`: an icon button that flips between light and dark.
 * - `segmented`: three icon buttons side by side, one per mode.
 */
function ModeToggle({
  value,
  onValueChange,
  variant = "menu",
  size = "default",
  tone = "outline",
  align = "end",
  className,
  "aria-label": ariaLabel = "Change theme",
}: {
  value?: ThemeMode
  onValueChange?: (value: ThemeMode) => void
  variant?: "menu" | "toggle" | "segmented"
  size?: "sm" | "default" | "lg"
  /** Trigger look for `menu` and `toggle`. */
  tone?: "outline" | "ghost" | "quiet"
  /** Where the `menu` panel lines up with its trigger. */
  align?: "start" | "center" | "end"
  className?: string
  "aria-label"?: string
}) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const prefersDark = useSystemPrefersDark()
  const controlled = value !== undefined

  const mode: ThemeMode | undefined = controlled
    ? value
    : (theme as ThemeMode | undefined)
  const dark = controlled
    ? value === "dark" || (value === "system" && prefersDark)
    : resolvedTheme === "dark"

  function settingMode(next: ThemeMode) {
    if (!controlled) {
      setTheme(next)
    }
    onValueChange?.(next)
  }

  if (variant === "segmented") {
    return (
      <div
        data-slot="mode-toggle"
        data-variant={variant}
        role="radiogroup"
        aria-label={ariaLabel}
        className={cn(
          "inline-flex items-center gap-0.5 rounded-lg border border-input p-0.5",
          className
        )}
      >
        {MODES.map((option) => {
          const checked = mode === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={option.label}
              title={option.label}
              onClick={() => settingMode(option.value)}
              className={cn(
                "inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-checked:bg-muted aria-checked:text-foreground [&_svg]:size-4",
                SEGMENT_BOX[size]
              )}
            >
              {option.icon}
            </button>
          )
        })}
      </div>
    )
  }

  const trigger = (
    <Button
      data-slot="mode-toggle"
      data-variant={variant}
      tone={tone}
      size={size}
      iconOnly
      aria-label={ariaLabel}
      className={className}
      onClick={
        variant === "toggle"
          ? () => settingMode(dark ? "light" : "dark")
          : undefined
      }
    >
      <RendersModeIcon dark={controlled ? dark : undefined} />
    </Button>
  )

  if (variant === "toggle") {
    return trigger
  }

  const items: MenuEntry[] = MODES.map((option) => ({
    id: option.value,
    label: option.label,
    icon: option.icon,
    shortcut: mode === option.value ? "✓" : undefined,
    onSelect: () => settingMode(option.value),
  }))

  return (
    <DropdownMenu
      label={ariaLabel}
      trigger={trigger}
      items={items}
      align={align}
    />
  )
}

export { ModeToggle }
export type { ThemeMode }
