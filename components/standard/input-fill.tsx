"use client"

import * as React from "react"
import { cn } from "cn"

import { TextField } from "@/components/standard/text-field"
import { useControllableState } from "@/hooks/use-controllable-state"

/**
 * Mask tokens. Any other character is a literal the field types for you.
 * Put a backslash before a token character to use it as a literal.
 */
const TOKENS: Record<string, { test: RegExp; upper?: boolean }> = {
  "9": { test: /\d/ },
  a: { test: /[a-z]/i },
  A: { test: /[a-z]/i, upper: true },
  "*": { test: /[a-z\d]/i },
}

type Slot = { token: string } | { literal: string }

function parsesMask(mask: string) {
  const slots: Slot[] = []
  for (let index = 0; index < mask.length; index += 1) {
    const char = mask[index]
    if (char === "\\" && index + 1 < mask.length) {
      index += 1
      slots.push({ literal: mask[index] })
    } else if (TOKENS[char]) {
      slots.push({ token: char })
    } else {
      slots.push({ literal: char })
    }
  }
  return slots
}

/**
 * Walks the mask over `input`, taking characters that fit each token and
 * skipping the rest. Literals only appear once a token after them is filled,
 * so backspace never gets stuck on a ")" or "/".
 */
function fillsMask(slots: Slot[], input: string) {
  let text = ""
  let raw = ""
  let pending = ""
  let cursor = 0

  for (const slot of slots) {
    if ("literal" in slot) {
      pending += slot.literal
      if (input[cursor] === slot.literal) cursor += 1
      continue
    }
    const { test, upper } = TOKENS[slot.token]
    while (cursor < input.length && !test.test(input[cursor])) cursor += 1
    if (cursor >= input.length) break
    const char = upper ? input[cursor].toUpperCase() : input[cursor]
    text += pending + char
    raw += char
    pending = ""
    cursor += 1
  }

  const tokens = slots.filter((slot) => "token" in slot).length
  return { text, raw, complete: raw.length === tokens }
}

/** Index in `text` just after its `count`th filled token. */
function caretAfter(slots: Slot[], text: string, count: number) {
  if (count === 0) return 0
  let seen = 0
  for (let index = 0; index < text.length && index < slots.length; index += 1) {
    if ("token" in slots[index]) {
      seen += 1
      if (seen === count) return index + 1
    }
  }
  return text.length
}

/** Common masks. Spread one onto the field: <InputFill {...inputFillPresets.phone} />. */
const inputFillPresets = {
  phone: {
    mask: "(999) 999-9999",
    template: "(___) ___-____",
    inputMode: "tel",
  },
  date: { mask: "99/99/9999", template: "MM/DD/YYYY", inputMode: "numeric" },
  time: { mask: "99:99", template: "HH:MM", inputMode: "numeric" },
  card: {
    mask: "9999 9999 9999 9999",
    template: "0000 0000 0000 0000",
    inputMode: "numeric",
  },
  expiry: { mask: "99/99", template: "MM/YY", inputMode: "numeric" },
  zip: { mask: "99999-9999", template: "_____-____", inputMode: "numeric" },
  postal: { mask: "A9A 9A9", template: "A1A 1A1", inputMode: "text" },
} satisfies Record<
  string,
  { mask: string; template: string; inputMode: "tel" | "numeric" | "text" }
>

type InputFillDetails = {
  /** Only the characters typed into tokens, without literals. */
  raw: string
  /** Every token is filled. */
  complete: boolean
}

type InputFillProps = Omit<
  React.ComponentProps<typeof TextField>,
  // The template fill already draws after the caret, so no ghost completion.
  | "value"
  | "defaultValue"
  | "onChange"
  | "type"
  | "completion"
  | "completionKeys"
  | "ghost"
> & {
  /** 9 = digit, a = letter, A = letter (uppercased), * = letter or digit. Anything else is a literal; escape a token with \\. */
  mask: string
  /** Hint for the unfilled part, same length as the mask. Defaults to the mask with tokens shown as "_". */
  template?: string
  /** Shows the unfilled part of the template after the caret while typing. */
  showFill?: boolean
  /** The formatted text, literals included. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string, details: InputFillDetails) => void
  /** Fires once every token is filled. */
  onComplete?: (value: string, details: InputFillDetails) => void
}

/**
 * Text field that formats as you type against a fixed mask: phone numbers,
 * dates, card numbers, codes. Literals are inserted for you, characters that
 * don't fit are dropped, and the rest of the template stays visible as a
 * faint fill after what's been typed.
 */
function InputFill({
  mask,
  template: templateProp,
  showFill = true,
  value: valueProp,
  defaultValue,
  onValueChange,
  onComplete,
  placeholder,
  label,
  className,
  containerClassName,
  ref,
  onFocus,
  onBlur,
  ...props
}: InputFillProps) {
  const slots = React.useMemo(() => parsesMask(mask), [mask])
  const template = React.useMemo(
    () =>
      templateProp ??
      slots.map((slot) => ("token" in slot ? "_" : slot.literal)).join(""),
    [templateProp, slots]
  )
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue: defaultValue ? fillsMask(slots, defaultValue).text : "",
  })
  const [focused, setFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const fillRef = React.useRef<HTMLSpanElement>(null)
  const pendingCaret = React.useRef<number | null>(null)

  const setRefs = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  const fillVisible =
    showFill && (focused || value.length > 0) && value.length < template.length

  // Put the caret back after the same number of typed characters.
  React.useLayoutEffect(() => {
    const input = inputRef.current
    if (input && pendingCaret.current !== null) {
      input.setSelectionRange(pendingCaret.current, pendingCaret.current)
      pendingCaret.current = null
    }
  }, [value])

  // Lay the fill over the input's own text box so the two line up exactly.
  React.useLayoutEffect(() => {
    const input = inputRef.current
    const fill = fillRef.current
    if (!input || !fill || !fillVisible) return
    const style = getComputedStyle(input)
    const parent = fill.offsetParent as HTMLElement | null
    const inputBox = input.getBoundingClientRect()
    const parentBox = parent?.getBoundingClientRect() ?? inputBox
    Object.assign(fill.style, {
      left: `${inputBox.left - parentBox.left + input.clientLeft}px`,
      top: `${inputBox.top - parentBox.top + input.clientTop}px`,
      width: `${input.clientWidth}px`,
      height: `${input.clientHeight}px`,
      paddingLeft: style.paddingLeft,
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
      // The `font` shorthand reads back empty, so copy each part.
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontVariantNumeric: style.fontVariantNumeric,
      letterSpacing: style.letterSpacing,
      textAlign: style.textAlign,
    })
  })

  function updates(next: string) {
    const details = fillsMask(slots, next)
    const wasComplete = fillsMask(slots, value).complete
    setValue(details.text)
    onValueChange?.(details.text, {
      raw: details.raw,
      complete: details.complete,
    })
    if (details.complete && !wasComplete) {
      onComplete?.(details.text, {
        raw: details.raw,
        complete: details.complete,
      })
    }
    return details.text
  }

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <TextField
        {...props}
        ref={setRefs}
        type="text"
        label={label}
        value={value}
        data-slot="input-fill"
        placeholder={
          fillVisible ? "" : (placeholder ?? (label ? undefined : template))
        }
        className={cn("tabular-nums", className)}
        onFocus={(event) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        onChange={(event) => {
          const input = event.target
          const caret = input.selectionStart ?? input.value.length
          const typed = fillsMask(slots, input.value.slice(0, caret)).raw
          const text = updates(input.value)
          const next = caretAfter(slots, text, typed.length)
          pendingCaret.current = next
          // A rejected character leaves the value unchanged, so no re-render
          // runs the effect above; put the caret back here instead.
          if (text === value) {
            input.value = text
            input.setSelectionRange(next, next)
          }
        }}
      />
      {fillVisible ? (
        <span
          ref={fillRef}
          aria-hidden
          data-slot="input-fill-template"
          className={cn(
            "pointer-events-none absolute z-10 flex items-center overflow-hidden whitespace-pre",
            // Waits for a floating label to clear the line before showing.
            label != null && "animate-in duration-200 fade-in-0"
          )}
        >
          <span className="invisible">{value}</span>
          <span className="text-muted-foreground/60">
            {template.slice(value.length)}
          </span>
        </span>
      ) : null}
    </div>
  )
}

export { InputFill, inputFillPresets }
export type { InputFillDetails, InputFillProps }
