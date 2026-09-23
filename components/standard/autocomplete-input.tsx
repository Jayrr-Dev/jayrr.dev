"use client"

import * as React from "react"
import { cn } from "cn"

import { TextField } from "@/components/standard/text-field"

function AutocompleteInput({
  className,
  options,
  placeholder,
  disabled,
}: {
  className?: string
  options: string[]
  placeholder?: string
  disabled?: boolean
}) {
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const matches = options.filter((option) =>
    option.toLowerCase().includes(query.trim().toLowerCase())
  )
  let showList = false
  if (open) {
    if (!disabled) {
      if (matches.length > 0) {
        showList = true
      }
    }
  }

  function choose(option: string) {
    setQuery(option)
    setOpen(false)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActive((current) => Math.min(current + 1, Math.max(matches.length - 1, 0)))
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((current) => Math.max(current - 1, 0))
    }
    if (event.key === "Enter") {
      const pick = matches[active]
      if (pick) {
        event.preventDefault()
        choose(pick)
      }
    }
    if (event.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div data-slot="autocomplete-input" className={cn("relative w-full", className)}>
      <TextField
        disabled={disabled}
        placeholder={placeholder}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          setActive(0)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {showList ? (
        <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-lg border border-border bg-popover p-1 text-sm shadow-md">
          {matches.map((option, index) => (
            <li key={option}>
              <button
                type="button"
                className={cn(
                  "w-full rounded-md px-2 py-1 text-left",
                  index === active ? "bg-muted" : undefined
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export { AutocompleteInput }
