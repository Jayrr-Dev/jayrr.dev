"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"
import { useControllableState } from "@/hooks/use-controllable-state"

export type SelectOption = {
  value: string
  label: string
  group?: string
  /** Shown before the label in the list and in the trigger. */
  icon?: React.ReactNode
}

export type SelectAppearance = "default" | "toolbar"
export type SelectVariant = "default" | "filled" | "outlined"
export type SelectSize = "sm" | "default" | "lg"
export type SelectIndicator = "check" | "checkbox"

type TriggerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "children"
> & {
  /** Shows the error style. Same as passing aria-invalid. */
  invalid?: boolean
  /** Blocks the trigger while the options load. */
  loading?: boolean
}

// Toolbar actions grow in a docked toolbar and invert on a vibrant one.
const TOOLBAR_TRIGGER_CLASS =
  "min-w-32 rounded-lg bg-transparent text-foreground hover:bg-muted active:bg-muted/70 group-data-[variant=docked]/toolbar:h-10 group-data-[variant=docked]/toolbar:rounded-full group-data-[tone=vibrant]/toolbar:text-primary-foreground group-data-[tone=vibrant]/toolbar:hover:bg-primary-foreground/10 [&_svg]:size-3.5"

const selectTriggerVariants = cva(
  "inline-flex min-w-28 items-center justify-between gap-1.5 text-left font-normal whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      // Same surfaces as TextField, at button heights and without a floating label.
      variant: {
        default:
          "rounded-lg border border-input bg-transparent hover:bg-muted dark:bg-input/30",
        filled:
          "rounded-t-md rounded-b-none bg-muted shadow-[inset_0_-1px_0_var(--color-muted-foreground)] hover:bg-accent focus-visible:shadow-[inset_0_-2px_0_var(--color-primary)] focus-visible:ring-0 aria-invalid:shadow-[inset_0_-2px_0_var(--color-destructive)] aria-invalid:ring-0 dark:bg-input/30 dark:hover:bg-input/50",
        outlined:
          "rounded-md border border-input bg-transparent hover:border-foreground/60 focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)] focus-visible:ring-0",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        default: "h-8 px-2.5 text-sm",
        lg: "h-9 px-3 text-sm",
      },
      appearance: {
        default: "",
        toolbar: TOOLBAR_TRIGGER_CLASS,
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      appearance: "default",
    },
  }
)

const optionClass =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted disabled:pointer-events-none disabled:opacity-50 aria-selected:font-medium"

const OPTION_SELECTOR = "[data-option]:not(:disabled)"
const SEARCH_SELECTOR = "[data-select-search]"

/**
 * Arrow keys, Home and End move focus between the options. With a search box,
 * ArrowUp from the first option returns to it, and typing on an option sends
 * the keystroke there.
 */
function movesOptionFocus(event: React.KeyboardEvent<HTMLElement>) {
  const content = event.currentTarget
  const search = content.querySelector<HTMLInputElement>(SEARCH_SELECTOR)
  const active = document.activeElement as HTMLElement | null
  const inSearch = search !== null && active === search

  const isTyping =
    event.key.length === 1 &&
    event.key !== " " &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  if (search && !inSearch && isTyping) {
    search.focus()
    return
  }

  const keys = ["ArrowDown", "ArrowUp", "Home", "End"]
  if (!keys.includes(event.key)) {
    return
  }
  // Home and End move the caret while typing a query.
  if (inSearch && (event.key === "Home" || event.key === "End")) {
    return
  }
  const items = Array.from(
    content.querySelectorAll<HTMLElement>(OPTION_SELECTOR)
  )
  if (items.length === 0) {
    return
  }
  event.preventDefault()
  const index = active ? items.indexOf(active) : -1
  if (search && index === 0 && event.key === "ArrowUp") {
    search.focus()
    return
  }
  let next = 0
  if (event.key === "ArrowDown") next = index < 0 ? 0 : Math.min(index + 1, items.length - 1)
  if (event.key === "ArrowUp") next = index < 0 ? items.length - 1 : Math.max(index - 1, 0)
  if (event.key === "End") next = items.length - 1
  items[next]?.focus()
}

/** Focuses the search box, else the selected option (or the first), on open. */
function focusesSelectedOption(event: Event) {
  event.preventDefault()
  const content = event.currentTarget as HTMLElement | null
  const target =
    content?.querySelector<HTMLElement>(SEARCH_SELECTOR) ??
    content?.querySelector<HTMLElement>('[data-option][aria-selected="true"]') ??
    content?.querySelector<HTMLElement>(OPTION_SELECTOR)
  target?.focus()
}

function SelectIndicatorMark({
  indicator,
  isOn,
}: {
  indicator: SelectIndicator
  isOn: boolean
}) {
  if (indicator === "checkbox") {
    return (
      <span
        aria-hidden
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input",
          isOn && "border-primary bg-primary text-primary-foreground"
        )}
      >
        {isOn ? <CheckIcon className="size-3" /> : null}
      </span>
    )
  }

  return (
    <CheckIcon
      aria-hidden
      className={cn("size-3.5 shrink-0", !isOn && "invisible")}
    />
  )
}

type SelectProps = Omit<TriggerProps, "size"> & {
  options: SelectOption[]
  /** Lets the user pick several options; state moves to `values`. */
  multiple?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  values?: string[]
  defaultValues?: string[]
  onValuesChange?: (values: string[]) => void
  placeholder?: string
  /** How a selected option is marked: a check mark or a checkbox square. */
  indicator?: SelectIndicator
  /**
   * `toolbar` is a ghost trigger showing the current option's icon and label,
   * sized for a Toolbar. It drops the Clear row and marks the pick on the right.
   */
  appearance?: SelectAppearance
  /** Trigger surface, matching TextField. Ignored by the toolbar appearance. */
  variant?: SelectVariant
  /** Defaults to `sm` (h-7), the height Select has always had. */
  size?: SelectSize
  /** Adds a filter box at the top of the list. */
  searchable?: boolean
  searchPlaceholder?: string
  /** Adds a clear button to the trigger once something is selected. */
  clearable?: boolean
  /**
   * With `multiple`, shows selected options as tags up to this many, then
   * "N selected". 0 always shows the count.
   */
  maxTags?: number
}

function Select({
  className,
  options,
  multiple = false,
  value,
  defaultValue = "",
  onValueChange,
  values,
  defaultValues,
  onValuesChange,
  placeholder = "Select",
  disabled = false,
  invalid,
  loading = false,
  indicator = "check",
  appearance = "default",
  variant = "default",
  size = "sm",
  searchable = false,
  searchPlaceholder = "Search",
  clearable = false,
  maxTags = 0,
  onKeyDown,
  ...triggerProps
}: SelectProps) {
  const listId = React.useId()
  const listRef = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [selectedMany, setSelectedMany] = useControllableState<string[]>({
    value: values,
    defaultValue: defaultValues ?? [],
    onChange: onValuesChange,
  })

  const isToolbar = appearance === "toolbar"
  const hasValue = multiple ? selectedMany.length > 0 : selected !== ""
  const current = options.find((option) => option.value === selected)
  const chosen = options.filter((option) =>
    selectedMany.includes(option.value)
  )
  const needle = query.trim().toLowerCase()
  const visible = needle
    ? options.filter((option) => option.label.toLowerCase().includes(needle))
    : options
  const groups = [...new Set(visible.map((option) => option.group ?? ""))]
  const listLabel = triggerProps["aria-label"] ?? placeholder

  function changeOpen(next: boolean) {
    setOpen(next)
    if (!next) {
      setQuery("")
    }
  }

  function choose(next: string) {
    if (multiple) {
      setSelectedMany((previous) =>
        previous.includes(next)
          ? previous.filter((item) => item !== next)
          : [...previous, next]
      )
      return
    }
    setSelected(next)
    changeOpen(false)
  }

  function clear() {
    if (multiple) {
      setSelectedMany([])
      return
    }
    setSelected("")
  }

  let display: React.ReactNode = placeholder
  if (multiple && selectedMany.length > 0) {
    display =
      selectedMany.length > maxTags ? (
        `${selectedMany.length} selected`
      ) : (
        <span className="flex min-w-0 items-center gap-1">
          {chosen.map((option) => (
            <span
              key={option.value}
              data-slot="select-tag"
              className="truncate rounded-sm bg-muted px-1.5 py-px text-xs"
            >
              {option.label}
            </span>
          ))}
        </span>
      )
  } else if (!multiple && current) {
    display = (
      <>
        {current.icon}
        {current.label}
      </>
    )
  }

  const trigger = (
    <PopoverTrigger asChild>
      {/* aria-invalid drives the error style, as on the old Button trigger. */}
      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
      <button
        type="button"
        data-slot="select"
        data-appearance={appearance}
        data-variant={variant}
        data-size={size}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        {...triggerProps}
        aria-invalid={invalid || triggerProps["aria-invalid"] || undefined}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          // ArrowDown / ArrowUp open the list, like a native select.
          if (
            !event.defaultPrevented &&
            !open &&
            (event.key === "ArrowDown" || event.key === "ArrowUp")
          ) {
            event.preventDefault()
            changeOpen(true)
          }
        }}
        className={cn(
          selectTriggerVariants({
            variant: isToolbar ? null : variant,
            size,
            appearance,
          }),
          clearable && "w-full pr-8",
          !clearable && className
        )}
      >
        <span
          className={cn(
            "flex min-w-0 items-center gap-2 truncate",
            !hasValue && !isToolbar && "text-muted-foreground",
            "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5"
          )}
        >
          {display}
        </span>
        {clearable ? null : (
          <ChevronDownIcon
            aria-hidden
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground",
              isToolbar &&
                "group-data-[tone=vibrant]/toolbar:text-primary-foreground/70"
            )}
          />
        )}
      </button>
    </PopoverTrigger>
  )

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      {clearable ? (
        // The clear button sits beside the trigger, not inside it, so no
        // button nests in another.
        <span
          data-slot="select-wrapper"
          className={cn("relative inline-flex", className)}
        >
          {trigger}
          <span className="pointer-events-none absolute top-1/2 right-1 flex -translate-y-1/2 items-center">
            {hasValue && !disabled ? (
              <button
                type="button"
                aria-label="Clear"
                onClick={clear}
                className="pointer-events-auto flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <XIcon aria-hidden className="size-3.5" />
              </button>
            ) : (
              <ChevronDownIcon
                aria-hidden
                className="mr-1.5 size-3.5 text-muted-foreground"
              />
            )}
          </span>
        </span>
      ) : (
        trigger
      )}
      <PopoverContent
        align="start"
        className={cn("gap-0 p-1", isToolbar ? "w-48" : "w-52")}
        onOpenAutoFocus={focusesSelectedOption}
        onKeyDown={movesOptionFocus}
      >
        {searchable ? (
          <input
            data-select-search
            type="text"
            value={query}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            aria-controls={listId}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              // Enter picks the first match.
              if (event.key === "Enter") {
                event.preventDefault()
                listRef.current
                  ?.querySelector<HTMLElement>('[role="option"]')
                  ?.click()
              }
            }}
            className="mb-1 h-8 w-full border-b border-border bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        ) : null}
        {!isToolbar ? (
          <button
            type="button"
            data-option
            disabled={!hasValue}
            className={cn(optionClass, "text-xs text-muted-foreground")}
            onClick={() => {
              clear()
              if (!multiple) {
                changeOpen(false)
              }
            }}
          >
            <span className="size-3.5 shrink-0" />
            Clear
          </button>
        ) : null}
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-multiselectable={multiple || undefined}
          aria-label={listLabel}
        >
          {groups.map((group) => (
            <div
              key={group || "all"}
              role="group"
              aria-label={group || undefined}
              className="flex flex-col"
            >
              {group ? (
                <p
                  aria-hidden
                  className="px-2 pt-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  {group}
                </p>
              ) : null}
              {visible
                .filter((option) => (option.group ?? "") === group)
                .map((option) => {
                  const isOn = multiple
                    ? selectedMany.includes(option.value)
                    : option.value === selected
                  return (
                    <button
                      key={option.value}
                      type="button"
                      data-option
                      role="option"
                      aria-selected={isOn}
                      className={cn(optionClass, isToolbar && isOn && "bg-muted")}
                      onClick={() => choose(option.value)}
                    >
                      {isToolbar ? null : (
                        <SelectIndicatorMark indicator={indicator} isOn={isOn} />
                      )}
                      {option.icon ? (
                        <span
                          aria-hidden
                          className="flex shrink-0 text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
                        >
                          {option.icon}
                        </span>
                      ) : null}
                      <span className="flex-1 truncate">{option.label}</span>
                      {isToolbar && isOn ? (
                        <CheckIcon aria-hidden className="size-4 shrink-0" />
                      ) : null}
                    </button>
                  )
                })}
            </div>
          ))}
          {visible.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              No results
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}

type MultiSelectProps = TriggerProps & {
  options: SelectOption[]
  values?: string[]
  defaultValues?: string[]
  onValuesChange?: (values: string[]) => void
  placeholder?: string
  /** How a selected option is marked: a check mark or a checkbox square. */
  indicator?: SelectIndicator
}

/** @deprecated Use <Select multiple> */
function MultiSelect(props: MultiSelectProps) {
  return <Select data-slot="multi-select" {...props} multiple />
}

export { MultiSelect, Select, selectTriggerVariants }
export type { MultiSelectProps, SelectProps }

// Moved to its own file; re-exported so existing imports keep working.
export { DatePicker } from "@/components/standard/date-picker"
