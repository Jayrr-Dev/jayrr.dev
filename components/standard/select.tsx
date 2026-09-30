"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"

export type SelectOption = {
  value: string
  label: string
  group?: string
}

type TriggerProps = Omit<
  React.ComponentProps<typeof Button>,
  "value" | "defaultValue" | "onChange" | "children" | "tone" | "size"
> & {
  /** Shows the error style. Same as passing aria-invalid. */
  invalid?: boolean
}

const triggerClass =
  "justify-between font-normal aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"

const optionClass =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted aria-selected:font-medium"

/** Arrow keys, Home and End move focus between the options. */
function movesOptionFocus(event: React.KeyboardEvent<HTMLElement>) {
  const keys = ["ArrowDown", "ArrowUp", "Home", "End"]
  if (!keys.includes(event.key)) {
    return
  }
  const items = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>("[data-option]")
  )
  if (items.length === 0) {
    return
  }
  event.preventDefault()
  const index = items.indexOf(document.activeElement as HTMLElement)
  let next = 0
  if (event.key === "ArrowDown") next = index < 0 ? 0 : Math.min(index + 1, items.length - 1)
  if (event.key === "ArrowUp") next = index < 0 ? items.length - 1 : Math.max(index - 1, 0)
  if (event.key === "End") next = items.length - 1
  items[next]?.focus()
}

/** Focuses the selected option (or the first) when the list opens. */
function focusesSelectedOption(event: Event) {
  event.preventDefault()
  const content = event.currentTarget as HTMLElement | null
  const target =
    content?.querySelector<HTMLElement>('[data-option][aria-selected="true"]') ??
    content?.querySelector<HTMLElement>("[data-option]")
  target?.focus()
}

function Select({
  className,
  options,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Select",
  disabled = false,
  invalid,
  ...triggerProps
}: TriggerProps & {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
}) {
  const listId = React.useId()
  const [open, setOpen] = React.useState(false)
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const selected = value ?? uncontrolled
  const current = options.find((option) => option.value === selected)
  const groups = [...new Set(options.map((option) => option.group ?? ""))]

  function pick(next: string) {
    if (value === undefined) {
      setUncontrolled(next)
    }
    onValueChange?.(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-slot="select"
          tone="outline"
          size="sm"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-controls={open ? listId : undefined}
          {...triggerProps}
          aria-invalid={invalid || triggerProps["aria-invalid"] || undefined}
          className={cn("min-w-28", triggerClass, className)}
        >
          <span className={cn("truncate", !current && "text-muted-foreground")}>
            {current?.label ?? placeholder}
          </span>
          <ChevronDownIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-52 gap-0 p-1"
        onOpenAutoFocus={focusesSelectedOption}
        onKeyDown={movesOptionFocus}
      >
        <div id={listId} role="listbox" aria-label={placeholder}>
          <button
            type="button"
            data-option
            role="option"
            aria-selected={selected === ""}
            className={cn(optionClass, "text-xs text-muted-foreground")}
            onClick={() => pick("")}
          >
            <span className="size-3.5 shrink-0" />
            Clear
          </button>
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
              {options
                .filter((option) => (option.group ?? "") === group)
                .map((option) => {
                  const isOn = option.value === selected
                  return (
                    <button
                      key={option.value}
                      type="button"
                      data-option
                      role="option"
                      aria-selected={isOn}
                      className={optionClass}
                      onClick={() => pick(option.value)}
                    >
                      <CheckIcon
                        aria-hidden
                        className={cn("size-3.5 shrink-0", !isOn && "invisible")}
                      />
                      {option.label}
                    </button>
                  )
                })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function MultiSelect({
  className,
  options,
  values,
  defaultValues = [],
  onValuesChange,
  placeholder = "Select",
  disabled = false,
  invalid,
  indicator = "check",
  ...triggerProps
}: TriggerProps & {
  options: SelectOption[]
  values?: string[]
  defaultValues?: string[]
  onValuesChange?: (values: string[]) => void
  placeholder?: string
  /** How a selected option is marked: a check mark or a checkbox square. */
  indicator?: "check" | "checkbox"
}) {
  const listId = React.useId()
  const [open, setOpen] = React.useState(false)
  const [uncontrolled, setUncontrolled] = React.useState(defaultValues)
  const selected = values ?? uncontrolled
  const label =
    selected.length === 0 ? placeholder : `${selected.length} selected`

  function update(next: string[]) {
    if (values === undefined) {
      setUncontrolled(next)
    }
    onValuesChange?.(next)
  }

  function toggle(next: string) {
    update(
      selected.includes(next)
        ? selected.filter((item) => item !== next)
        : [...selected, next]
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-slot="multi-select"
          tone="outline"
          size="sm"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-controls={open ? listId : undefined}
          {...triggerProps}
          aria-invalid={invalid || triggerProps["aria-invalid"] || undefined}
          className={cn("min-w-28", triggerClass, className)}
        >
          <span
            className={cn(
              "truncate",
              selected.length === 0 && "text-muted-foreground"
            )}
          >
            {label}
          </span>
          <ChevronDownIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-52 gap-0 p-1"
        onOpenAutoFocus={focusesSelectedOption}
        onKeyDown={movesOptionFocus}
      >
        <button
          type="button"
          className={cn(optionClass, "text-xs text-muted-foreground")}
          disabled={selected.length === 0}
          onClick={() => update([])}
        >
          Clear
        </button>
        <div
          id={listId}
          role="listbox"
          aria-multiselectable
          aria-label={placeholder}
        >
          {options.map((option) => {
            const isOn = selected.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                data-option
                role="option"
                aria-selected={isOn}
                className={optionClass}
                onClick={() => toggle(option.value)}
              >
                {indicator === "checkbox" ? (
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input",
                      isOn && "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {isOn ? <CheckIcon className="size-3" /> : null}
                  </span>
                ) : (
                  <CheckIcon
                    aria-hidden
                    className={cn("size-3.5 shrink-0", !isOn && "invisible")}
                  />
                )}
                {option.label}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function DatePicker({
  className,
  invalid,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  /** Shows the error style. Same as passing aria-invalid. */
  invalid?: boolean
}) {
  return (
    <input
      data-slot="date-picker"
      type="date"
      className={cn(
        "h-8 rounded-lg border border-input bg-transparent px-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
    />
  )
}

export { DatePicker, MultiSelect, Select }
