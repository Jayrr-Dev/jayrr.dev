import * as React from "react"

type TextInputElement = HTMLInputElement | HTMLTextAreaElement

/** Built-in checks, in the order they run. The first one that fails wins. */
type ValidationRule =
  | "required"
  | "minLength"
  | "maxLength"
  | "pattern"
  | "email"
  | "url"
  | "min"
  | "max"

/** Replaces built-in messages. "{limit}" becomes the rule's number, e.g. "At least {limit} characters". */
type ValidationMessages = Partial<Record<ValidationRule, string>>

/**
 * A custom check that runs after the built-in rules pass. Return a message to
 * fail, or nothing (undefined, null, false, "") to pass.
 */
type FieldValidator = (value: string) => string | null | undefined | false

/**
 * When a field first shows its error. After that it rechecks as you type.
 * "blur" (default) waits for the user to leave the field, "change" checks on
 * the first keystroke, "submit" waits for the form to be submitted.
 */
type ValidateOn = "blur" | "change" | "submit"

/** Props every validating input shares. Native constraints (required, minLength, maxLength, pattern, min, max) come from the input's own props. */
type FieldValidationProps = {
  /**
   * Error to show under the field, e.g. from the server. Marks the field
   * invalid and overrides the built-in checks while set.
   */
  error?: React.ReactNode
  validate?: FieldValidator
  validateOn?: ValidateOn
  messages?: ValidationMessages
  /** Fires when the field's validity changes, whether or not the error is showing yet. */
  onValidityChange?: (error: string | null) => void
}

const DEFAULT_MESSAGES: Record<ValidationRule, string> = {
  required: "This field is required.",
  minLength: "Use at least {limit} characters.",
  maxLength: "Use {limit} characters or fewer.",
  pattern: "Match the requested format.",
  email: "Enter an email like name@example.com.",
  url: "Enter a full URL like https://example.com.",
  min: "Enter {limit} or more.",
  max: "Enter {limit} or less.",
}

// The HTML spec's email grammar, but requiring a dot in the domain, since
// "name@localhost" is rarely what a form wants.
const EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

function matchesPattern(value: string, pattern: string) {
  // Same rules as the native attribute: the whole value has to match.
  for (const flags of ["v", "u"]) {
    try {
      return new RegExp(`^(?:${pattern})$`, flags).test(value)
    } catch {
      // Older engines lack the v flag; an invalid pattern never blocks.
    }
  }
  return true
}

function isUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

type ValidationInput = {
  value: string
  type?: string
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  min?: number | string
  max?: number | string
  /** Native tooltip text; doubles as the pattern message, like the browser does. */
  title?: string
  validate?: FieldValidator
  messages?: ValidationMessages
}

/** Checks a value against the common rules. Returns the first failing message, or null. */
function validateValue({
  value,
  type,
  required,
  minLength,
  maxLength,
  pattern,
  min,
  max,
  title,
  validate,
  messages,
}: ValidationInput): string | null {
  function say(rule: ValidationRule, limit?: number | string) {
    const text =
      messages?.[rule] ??
      (rule === "pattern" && title ? title : DEFAULT_MESSAGES[rule])
    return limit === undefined
      ? text
      : text.replaceAll("{limit}", String(limit))
  }

  if (value.trim() === "") {
    // Like native validation, an empty optional field passes every other rule.
    return required ? say("required") : null
  }
  if (minLength !== undefined && minLength >= 0 && value.length < minLength) {
    return say("minLength", minLength)
  }
  if (maxLength !== undefined && maxLength >= 0 && value.length > maxLength) {
    return say("maxLength", maxLength)
  }
  if (type === "email" && !EMAIL.test(value.trim())) {
    return say("email")
  }
  if (type === "url" && !isUrl(value.trim())) {
    return say("url")
  }
  if (type === "number") {
    const number = Number(value)
    if (min !== undefined && min !== "" && number < Number(min)) {
      return say("min", min)
    }
    if (max !== undefined && max !== "" && number > Number(max)) {
      return say("max", max)
    }
  }
  if (pattern && !matchesPattern(value, pattern)) {
    return say("pattern")
  }
  return validate?.(value) || null
}

/**
 * Set by FormField. A field inside one hands its message up instead of
 * drawing it, so the message lands in FormField's layout.
 */
const FieldMessageContext = React.createContext<
  ((message: React.ReactNode) => void) | null
>(null)

type UseFieldValidationOptions<E extends TextInputElement> = ValidationInput &
  FieldValidationProps & {
    ref: React.RefObject<E | null>
    /** Disabled and read-only fields skip validation, like native forms. */
    disabled?: boolean
    /** Called after a surrounding form resets, with the field's restored value. */
    onReset?: (value: string) => void
  }

/**
 * Validation for an input or textarea. Returns the message to show (null
 * while there's nothing to show) and handlers to merge onto the element. It
 * also sets the element's custom validity, so a surrounding <form> won't
 * submit while the field is invalid.
 */
function useFieldValidation<E extends TextInputElement>({
  ref,
  error,
  validateOn = "blur",
  onValidityChange,
  disabled = false,
  onReset,
  ...input
}: UseFieldValidationOptions<E>) {
  const [shown, setShown] = React.useState(false)
  const report = React.useContext(FieldMessageContext)
  const problem = disabled ? null : validateValue(input)
  const hasExternal = error != null && error !== false && error !== ""
  const message: React.ReactNode = hasExternal ? error : shown ? problem : null
  // Only plain text goes up to FormField: a JSX error is a new object every
  // render, and handing it up would re-render the pair forever.
  const reported =
    report !== null && (message == null || typeof message === "string")

  // Keep the form's view of validity in step, so submit is blocked.
  React.useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const external = hasExternal
      ? typeof error === "string"
        ? error
        : "Invalid value."
      : ""
    el.setCustomValidity(external || problem || "")
  }, [ref, problem, hasExternal, error])

  const onValidityChangeRef = React.useRef(onValidityChange)
  React.useEffect(() => {
    onValidityChangeRef.current = onValidityChange
  })
  React.useEffect(() => {
    onValidityChangeRef.current?.(problem)
  }, [problem])

  React.useEffect(() => {
    if (!report || !reported) {
      return
    }
    report(message)
    return () => report(null)
  }, [report, reported, message])

  const onResetRef = React.useRef(onReset)
  React.useEffect(() => {
    onResetRef.current = onReset
  })

  // A form reset restores the value without an input event, so hide the
  // error and hand the restored value back once the browser has applied it.
  React.useEffect(() => {
    const el = ref.current
    const form = el?.form
    if (!el || !form) {
      return
    }
    function handleReset() {
      setShown(false)
      setTimeout(() => onResetRef.current?.(el?.value ?? ""))
    }
    form.addEventListener("reset", handleReset)
    return () => form.removeEventListener("reset", handleReset)
  }, [ref])

  /** Merges the validation handlers with your own. Yours run after ours. */
  function getInputProps<
    P extends Pick<React.DOMAttributes<E>, "onChange" | "onBlur" | "onInvalid">,
  >(props: P = {} as P) {
    return {
      ...props,
      onChange(event: React.ChangeEvent<E>) {
        if (validateOn === "change") {
          setShown(true)
        }
        props.onChange?.(event)
      },
      onBlur(event: React.FocusEvent<E>) {
        if (validateOn === "blur") {
          setShown(true)
        }
        props.onBlur?.(event)
      },
      onInvalid(event: React.FormEvent<E>) {
        // Show our message instead of the browser's bubble, and focus the
        // first invalid field ourselves since preventing the bubble skips it.
        event.preventDefault()
        setShown(true)
        const el = event.currentTarget
        const first = el.form?.querySelector(
          "input:invalid, textarea:invalid, select:invalid"
        )
        if (first === el) {
          el.focus()
        }
        props.onInvalid?.(event)
      },
    }
  }

  return {
    /** The message to show, or null. */
    message,
    /** The current problem, shown or not. */
    problem,
    /** True when a FormField above is showing the message, so don't draw it. */
    reported,
    getInputProps,
  }
}

export { FieldMessageContext, useFieldValidation, validateValue }
export type {
  FieldValidationProps,
  FieldValidator,
  ValidateOn,
  ValidationMessages,
  ValidationRule,
}
