import * as React from "react"

type Completion = string | null | undefined

/**
 * Returns the full text to suggest for a value, e.g. "rea" → "React".
 * May be async. Memoize async sources so they don't refetch every render.
 */
type CompletionSource = (value: string) => Completion | Promise<Completion>

type InlineCompletionKey = "Tab" | "ArrowRight" | "End"

const DEFAULT_ACCEPT_KEYS: InlineCompletionKey[] = ["Tab", "ArrowRight"]

/** A source that suggests the first option starting with the value, ignoring case. */
function completeFrom(options: readonly string[]): CompletionSource {
  return (value) => {
    if (!value) {
      return null
    }
    const lower = value.toLowerCase()
    return (
      options.find(
        (option) =>
          option.length > value.length && option.toLowerCase().startsWith(lower)
      ) ?? null
    )
  }
}

/**
 * Resolves a completion source for the current value. Sync results apply
 * immediately; while an async one loads, the last resolved suggestion stays
 * (useInlineCompletion hides it once it stops fitting the value).
 */
function useCompletion(value: string, source?: CompletionSource) {
  const result = React.useMemo(
    () => (source && value ? source(value) : null),
    [source, value]
  )
  const [resolved, setResolved] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!(result instanceof Promise)) {
      return
    }
    let stale = false
    result.then(
      (next) => {
        if (!stale) {
          setResolved(next ?? null)
        }
      },
      () => {
        if (!stale) {
          setResolved(null)
        }
      }
    )
    return () => {
      stale = true
    }
  }, [result])

  return result instanceof Promise ? resolved : (result ?? null)
}

type TextInputElement = HTMLInputElement | HTMLTextAreaElement

/**
 * Sets an input's value the way typing would, so React fires onChange for
 * controlled and uncontrolled inputs alike.
 */
function setInputValue(input: TextInputElement, next: string) {
  const prototype =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set
  setter?.call(input, next)
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

function isCaretAtEnd(input: TextInputElement) {
  // Inputs without a selection API (email, number) report null.
  if (input.selectionStart === null || input.selectionEnd === null) {
    return true
  }
  return (
    input.selectionStart === input.selectionEnd &&
    input.selectionEnd === input.value.length
  )
}

type UseInlineCompletionOptions = {
  value: string
  /** The full suggested text. Shown only while it starts with the value. */
  completion: Completion
  /** Keys that accept the suggestion. ArrowRight and End only accept with the caret at the end. */
  acceptKeys?: InlineCompletionKey[]
  /** Keep the typed casing on accept ("rea" + "ct") instead of the suggestion's ("React"). */
  keepTypedCase?: boolean
  disabled?: boolean
  /** Replaces the default accept, which writes the text into the input and fires onChange. */
  onAccept?: (next: string) => void
}

type CompletionHandlers<E extends TextInputElement> = Pick<
  React.DOMAttributes<E>,
  | "onKeyDown"
  | "onChange"
  | "onSelect"
  | "onFocus"
  | "onBlur"
  | "onCompositionStart"
  | "onCompositionEnd"
> & {
  "aria-autocomplete"?: React.AriaAttributes["aria-autocomplete"]
}

/**
 * Inline ("ghost text") completion for an input or textarea. Returns the
 * suffix to draw after the value and the props that drive it. TextField and
 * Textarea take a `completion` prop that wires this up for you.
 */
function useInlineCompletion<E extends TextInputElement = HTMLInputElement>({
  value,
  completion,
  acceptKeys = DEFAULT_ACCEPT_KEYS,
  keepTypedCase = false,
  disabled = false,
  onAccept,
}: UseInlineCompletionOptions) {
  const [focused, setFocused] = React.useState(false)
  const [caretAtEnd, setCaretAtEnd] = React.useState(true)
  const [composing, setComposing] = React.useState(false)
  // Set by Escape and by deleting, cleared by the next non-delete edit.
  const [suppressed, setSuppressed] = React.useState(false)

  const matches =
    value.length > 0 &&
    completion != null &&
    completion.length > value.length &&
    completion.toLowerCase().startsWith(value.toLowerCase())
  const suffix =
    matches && !disabled && focused && caretAtEnd && !composing && !suppressed
      ? completion.slice(value.length)
      : ""

  function accept(input: E) {
    if (!suffix || completion == null) {
      return false
    }
    const next = keepTypedCase ? value + suffix : completion
    if (onAccept) {
      onAccept(next)
    } else {
      setInputValue(input, next)
    }
    setCaretAtEnd(true)
    return true
  }

  function onKeyDown(event: React.KeyboardEvent<E>) {
    if (!suffix || event.nativeEvent.isComposing) {
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      setSuppressed(true)
      return
    }
    if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }
    const key = event.key as InlineCompletionKey
    if (!acceptKeys.includes(key)) {
      return
    }
    // Tab only ever lands here with a suggestion showing, so focus still
    // moves normally when there's nothing to accept.
    if (key !== "Tab" && !isCaretAtEnd(event.currentTarget)) {
      return
    }
    if (accept(event.currentTarget)) {
      event.preventDefault()
    }
  }

  /** Merges the completion handlers with your own. Yours run first; preventDefault in onKeyDown skips ours. */
  function getInputProps<P extends CompletionHandlers<E>>(props: P = {} as P) {
    return {
      ...props,
      "aria-autocomplete": props["aria-autocomplete"] ?? "inline",
      onKeyDown(event: React.KeyboardEvent<E>) {
        props.onKeyDown?.(event)
        if (!event.defaultPrevented) {
          onKeyDown(event)
        }
      },
      onChange(event: React.ChangeEvent<E>) {
        const inputType = (event.nativeEvent as InputEvent).inputType ?? ""
        setSuppressed(inputType.startsWith("delete"))
        setCaretAtEnd(isCaretAtEnd(event.currentTarget))
        props.onChange?.(event)
      },
      onSelect(event: React.SyntheticEvent<E>) {
        setCaretAtEnd(isCaretAtEnd(event.currentTarget))
        props.onSelect?.(event)
      },
      onFocus(event: React.FocusEvent<E>) {
        setFocused(true)
        props.onFocus?.(event)
      },
      onBlur(event: React.FocusEvent<E>) {
        setFocused(false)
        props.onBlur?.(event)
      },
      onCompositionStart(event: React.CompositionEvent<E>) {
        setComposing(true)
        props.onCompositionStart?.(event)
      },
      onCompositionEnd(event: React.CompositionEvent<E>) {
        setComposing(false)
        props.onCompositionEnd?.(event)
      },
    }
  }

  return { suffix, getInputProps }
}

export { completeFrom, setInputValue, useCompletion, useInlineCompletion }
export type {
  CompletionSource,
  TextInputElement,
  InlineCompletionKey,
  UseInlineCompletionOptions,
}
