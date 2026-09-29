"use client"

import * as React from "react"
import { createPortal } from "react-dom"
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
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const [mounted, setMounted] = React.useState(false)
  const [coords, setCoords] = React.useState<{
    top: number
    left: number
    width: number
  } | null>(null)
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

  function updateCoords() {
    const el = rootRef.current
    if (!el) {
      return
    }
    const rect = el.getBoundingClientRect()
    setCoords({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    })
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActive((current) =>
        Math.min(current + 1, Math.max(matches.length - 1, 0))
      )
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

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useLayoutEffect(() => {
    if (!showList) {
      return
    }
    updateCoords()
    function onReposition() {
      updateCoords()
    }
    window.addEventListener("resize", onReposition)
    window.addEventListener("scroll", onReposition, true)
    return () => {
      window.removeEventListener("resize", onReposition)
      window.removeEventListener("scroll", onReposition, true)
    }
  }, [showList, query, matches.length])

  return (
    <div
      ref={rootRef}
      data-slot="autocomplete-input"
      className={cn("relative w-full", className)}
    >
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
      {mounted && showList && coords
        ? createPortal(
            <ul
              data-slot="autocomplete-input-list"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
              }}
              className="fixed z-100 max-h-40 overflow-auto rounded-lg border border-border bg-popover p-1 text-sm shadow-md"
            >
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
            </ul>,
            document.body
          )
        : null}
    </div>
  )
}

export { AutocompleteInput }
