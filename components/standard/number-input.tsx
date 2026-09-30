"use client"

import * as React from "react"
import { cn } from "cn"

import { FieldLabel } from "@/components/standard/field-label"
import { TextField } from "@/components/standard/text-field"

const UNSIGNED = /^\d*\.?\d*$/
const SIGNED = /^-?\d*\.?\d*$/

/** Fields Enter can move to, inside the nearest [data-focus-group]. */
const FOCUSABLE =
  'input:not([disabled]):not([type="hidden"]), button:not([disabled]), [role="combobox"]:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Rounds to `digits` places and drops trailing zeros: 80, not 80.000. */
function formatsNumber(value: number, digits?: number) {
  if (!Number.isFinite(value)) return ""
  if (digits === undefined || digits < 0) return String(value)
  const factor = 10 ** digits
  return (Math.round(value * factor) / factor)
    .toFixed(digits)
    .replace(/0+$/, "")
    .replace(/\.$/, "")
}

type NumberInputProps = Omit<
  React.ComponentProps<typeof TextField>,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  value: number | null | undefined
  /** Fires on blur and Enter with the clamped, rounded number. */
  onChange: (value: number) => void
  /** Fires on each keystroke that parses, for live previews. */
  onChangeImmediate?: (value: number) => void
  label?: string
  min?: number
  max?: number
  allowNegative?: boolean
  /** Rounds to this many decimal places when the value is committed. */
  fractionDigits?: number
  /** Lower height and smaller text. */
  compact?: boolean
  /** Borderless, sized to its text. For inline edits inside tables. */
  seamless?: boolean
  inputMode?: "decimal" | "numeric"
}

/**
 * Text box for numbers. It only accepts digits, one dot and (optionally) a
 * leading minus, and commits on blur or Enter, clamped to min/max and
 * rounded to `fractionDigits`. Empty commits min, or 0.
 * Enter also moves focus to the next field in the nearest [data-focus-group].
 */
function NumberInput({
  value,
  onChange,
  onChangeImmediate,
  label,
  min,
  max,
  allowNegative = false,
  fractionDigits,
  compact = false,
  seamless = false,
  inputMode = "decimal",
  placeholder,
  className,
  id,
  onBlur,
  onFocus,
  onKeyDown,
  ...props
}: NumberInputProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const [focused, setFocused] = React.useState(false)
  const [draft, setDraft] = React.useState("")

  // With a placeholder, 0 shows as empty so the hint stays visible.
  const committed =
    value == null || (placeholder && value === 0)
      ? ""
      : formatsNumber(Number(value), fractionDigits)
  // While typing, show the draft; otherwise follow the value prop.
  const text = focused ? draft : committed

  function clamps(next: number) {
    let result = next
    if (min !== undefined && result < min) result = min
    if (max !== undefined && result > max) result = max
    if (fractionDigits !== undefined && fractionDigits >= 0) {
      const factor = 10 ** fractionDigits
      result = Math.round(result * factor) / factor
    }
    return result
  }

  function parses(raw: string) {
    const trimmed = raw.trim()
    const parsed = parseFloat(trimmed)
    if (
      trimmed === "" ||
      trimmed === "-" ||
      trimmed === "." ||
      Number.isNaN(parsed)
    ) {
      return clamps(min !== undefined && min > 0 ? min : 0)
    }
    return clamps(parsed)
  }

  function commits(raw: string) {
    onChange(parses(raw))
    setFocused(false)
  }

  const input = (
    <TextField
      {...props}
      id={inputId}
      type="text"
      inputMode={inputMode}
      placeholder={placeholder}
      value={text}
      data-slot="number-input"
      size={compact ? "sm" : "default"}
      className={cn(
        "tabular-nums",
        seamless &&
          "h-auto w-auto rounded-sm border-transparent bg-transparent px-1 py-0 dark:bg-transparent",
        className
      )}
      onFocus={(event) => {
        setDraft(committed)
        setFocused(true)
        onFocus?.(event)
      }}
      onChange={(event) => {
        const next = event.target.value
        if (next !== "" && !(allowNegative ? SIGNED : UNSIGNED).test(next))
          return
        setDraft(next)
        if (onChangeImmediate) onChangeImmediate(parses(next))
      }}
      onBlur={(event) => {
        commits(event.target.value)
        onBlur?.(event)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || event.key !== "Enter") return
        event.preventDefault()
        const current = event.currentTarget
        current.blur()
        const root =
          current.closest("[data-focus-group]") ?? current.ownerDocument.body
        const fields = Array.from(
          root.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter((field) => field.offsetParent !== null || field === current)
        const next = fields[fields.indexOf(current) + 1]
        if (next) {
          next.focus()
          if (next instanceof HTMLInputElement) next.select()
        }
      }}
    />
  )

  if (!label) return input

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={inputId} className="text-xs text-muted-foreground">
        {label}
      </FieldLabel>
      {input}
    </div>
  )
}

export { formatsNumber, NumberInput }
