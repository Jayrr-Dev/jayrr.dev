"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "cn"

import { TextField } from "@/components/standard/text-field"

type AutocompleteInputProps = Omit<
  React.ComponentProps<typeof TextField>,
  "value" | "defaultValue" | "onChange" | "role"
> & {
  options: string[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function AutocompleteInput({
  className,
  options,
  value,
  defaultValue = "",
  onValueChange,
  disabled,
  id,
  ...props
}: AutocompleteInputProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const autoId = React.useId()
  const inputId = id ?? `${autoId}-input`
  const listId = `${autoId}-list`
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const query = value ?? uncontrolled
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
  const showList = open && !disabled && matches.length > 0
  const activeId = showList ? `${listId}-${active}` : undefined

  function setQuery(next: string) {
    if (value === undefined) {
      setUncontrolled(next)
    }
    onValueChange?.(next)
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
      if (!open) {
        setOpen(true)
        return
      }
      setActive((current) =>
        Math.min(current + 1, Math.max(matches.length - 1, 0))
      )
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setOpen(true)
      setActive((current) => Math.max(current - 1, 0))
    }
    if (event.key === "Enter" && showList) {
      const pick = matches[active]
      if (pick) {
        event.preventDefault()
        choose(pick)
      }
    }
    if (event.key === "Escape" && open) {
      event.preventDefault()
      setOpen(false)
    }
    props.onKeyDown?.(event)
  }

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!showList) {
      return
    }
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [active, showList])

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
        autoComplete="off"
        {...props}
        id={inputId}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={activeId}
        disabled={disabled}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          setActive(0)
        }}
        onFocus={(event) => {
          setOpen(true)
          props.onFocus?.(event)
        }}
        onBlur={(event) => {
          setOpen(false)
          props.onBlur?.(event)
        }}
        onKeyDown={onKeyDown}
      />
      {mounted && showList && coords
        ? createPortal(
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-labelledby={props["aria-labelledby"]}
              aria-label={props["aria-labelledby"] ? undefined : props["aria-label"] ?? props.placeholder}
              data-slot="autocomplete-input-list"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
              }}
              className="fixed z-100 max-h-40 overflow-auto rounded-lg border border-border bg-popover p-1 text-sm shadow-md"
            >
              {matches.map((option, index) => (
                <li
                  key={option}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={index === active}
                  className={cn(
                    "cursor-pointer rounded-md px-2 py-1",
                    index === active ? "bg-muted" : undefined
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => setActive(index)}
                  onClick={() => choose(option)}
                >
                  {option}
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
export type { AutocompleteInputProps }
