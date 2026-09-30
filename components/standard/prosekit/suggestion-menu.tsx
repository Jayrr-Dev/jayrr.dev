"use client"

import * as React from "react"
import { canUseRegexLookbehind } from "prosekit/core"
import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompletePopup,
  AutocompletePositioner,
  AutocompleteRoot,
} from "prosekit/react/autocomplete"
import { cn } from "cn"

import {
  POPUP_CLASS,
  POPUP_ITEM_CLASS,
  POSITIONER_CLASS,
} from "@/components/standard/prosekit/editor-frame"

export type SuggestionItem = {
  /** Matched against the typed query. Defaults to `label`. */
  value?: string
  label: React.ReactNode
  leading?: React.ReactNode
  /** Right-aligned hint, e.g. the Markdown shortcut for a block. */
  hint?: React.ReactNode
  onSelect: () => void
}

/**
 * Matches `trigger` plus the query after it at a word start: "/", "/head",
 * "@ana". A space straight after the trigger ("/ foo") closes the menu.
 */
export function suggestionTrigger(trigger: string) {
  const escaped = trigger.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")
  return new RegExp(
    (canUseRegexLookbehind() ? String.raw`(?<!\S)` : "") +
      escaped +
      String.raw`(\S.*)?$`,
    "u"
  )
}

export function SuggestionMenu({
  trigger,
  items,
  emptyLabel = "No results",
  className,
  onQueryChange,
  onOpenChange,
}: {
  trigger: RegExp
  items: SuggestionItem[]
  emptyLabel?: React.ReactNode
  className?: string
  onQueryChange?: (query: string) => void
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <AutocompleteRoot
      regex={trigger}
      onQueryChange={(event) => onQueryChange?.(event.detail)}
      onOpenChange={(event) => onOpenChange?.(event.detail)}
    >
      <AutocompletePositioner className={POSITIONER_CLASS}>
        <AutocompletePopup
          className={cn(
            POPUP_CLASS,
            "max-h-80 min-w-56 overflow-y-auto overscroll-contain",
            className
          )}
        >
          <AutocompleteEmpty
            className={cn(POPUP_ITEM_CLASS, "text-muted-foreground")}
          >
            {emptyLabel}
          </AutocompleteEmpty>
          {items.map((item, index) => (
            <AutocompleteItem
              key={item.value ?? index}
              value={
                item.value ??
                (typeof item.label === "string" ? item.label : undefined)
              }
              onSelect={item.onSelect}
              className={cn(POPUP_ITEM_CLASS, "scroll-my-1")}
            >
              {item.leading}
              <span className="flex-1 truncate">{item.label}</span>
              {item.hint ? (
                <kbd className="font-mono text-xs text-muted-foreground">
                  {item.hint}
                </kbd>
              ) : null}
            </AutocompleteItem>
          ))}
        </AutocompletePopup>
      </AutocompletePositioner>
    </AutocompleteRoot>
  )
}
