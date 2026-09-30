"use client"

import * as React from "react"

import { Button } from "@/components/standard/button"
import { ModeToggle, type ThemeMode } from "@/components/standard/mode-toggle"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const DARK_QUERY = "(prefers-color-scheme: dark)"

/**
 * The site forces dark, so each demo drives a scoped panel instead of the
 * app theme: the panel takes `.light` or `.dark`, which re-declare the tokens.
 */
function RendersScopedModePreview({
  variant,
  size,
  tone,
  defaultMode = "light",
}: {
  variant: "menu" | "toggle" | "segmented"
  size?: "sm" | "default" | "lg"
  tone?: "outline" | "ghost" | "quiet"
  defaultMode?: ThemeMode
}) {
  const [mode, setMode] = React.useState<ThemeMode>(defaultMode)
  const resolved =
    mode === "system"
      ? typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches
        ? "dark"
        : "light"
      : mode

  return (
    <div
      className={`${resolved} flex w-full items-center justify-between gap-4 rounded-lg border border-border bg-background p-3 text-foreground transition-colors`}
      style={{ colorScheme: resolved }}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">Preview</span>
        <span className="text-xs text-muted-foreground">
          {mode === "system" ? `system (${resolved})` : mode}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm">Save</Button>
        <ModeToggle
          variant={variant}
          size={size}
          tone={tone}
          value={mode}
          onValueChange={setMode}
        />
      </div>
    </div>
  )
}

export function RendersModeToggleDemo() {
  return (
    <>
      <RendersDemoCard label="menu">
        <RendersScopedModePreview variant="menu" />
      </RendersDemoCard>
      <RendersDemoCard label="toggle">
        <RendersScopedModePreview variant="toggle" />
      </RendersDemoCard>
      <RendersDemoCard label="segmented">
        <RendersScopedModePreview variant="segmented" defaultMode="dark" />
      </RendersDemoCard>
      <RendersDemoCard label="toggle tone ghost · size sm">
        <RendersScopedModePreview variant="toggle" tone="ghost" size="sm" />
      </RendersDemoCard>
      <RendersDemoCard label="segmented size lg">
        <RendersScopedModePreview variant="segmented" size="lg" />
      </RendersDemoCard>
    </>
  )
}
