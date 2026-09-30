"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { EyeIcon, EyeOffIcon, SearchIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import {
  useFieldValidation,
  type FieldValidationProps,
} from "@/hooks/use-field-validation"
import {
  useCompletion,
  useInlineCompletion,
  type CompletionSource,
  type InlineCompletionKey,
  type TextInputElement,
} from "@/hooks/use-inline-completion"

const textFieldVariants = cva(
  "w-full min-w-0 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "rounded-lg border border-input bg-transparent px-2.5 py-1 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        // Material 3 filled: tinted container, square bottom, active indicator line.
        filled:
          "peer rounded-t-md rounded-b-none bg-muted px-3 shadow-[inset_0_-1px_0_var(--color-muted-foreground)] transition-[background-color,box-shadow] hover:bg-accent focus-visible:shadow-[inset_0_-2px_0_var(--color-primary)] aria-invalid:shadow-[inset_0_-2px_0_var(--color-destructive)] md:text-sm dark:bg-input/30 dark:hover:bg-input/50",
        // Material 3 outlined: the border is drawn by the notched fieldset below.
        outlined: "peer rounded-md bg-transparent px-3 md:text-sm",
      },
      size: {
        default: "",
        sm: "",
        lg: "",
      },
      align: {
        start: "",
        // Right-aligned figures line up in columns of numbers.
        end: "text-right tabular-nums",
      },
    },
    compoundVariants: [
      { variant: "default", size: "default", className: "h-8" },
      { variant: "default", size: "sm", className: "h-7 md:text-xs" },
      { variant: "default", size: "lg", className: "h-9" },
      { variant: ["filled", "outlined"], size: "sm", className: "h-11" },
      { variant: ["filled", "outlined"], size: "default", className: "h-12" },
      { variant: ["filled", "outlined"], size: "lg", className: "h-14" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      align: "start",
    },
  }
)

/** Text-like input types. Checkboxes, files, dates and the rest have their own components. */
type TextFieldType =
  "text" | "email" | "password" | "search" | "tel" | "url" | "number"

type TextFieldProps = Omit<
  React.ComponentProps<"input">,
  "size" | "prefix" | "type"
> &
  VariantProps<typeof textFieldVariants> &
  FieldValidationProps & {
    /** Defaults to "text". "email", "url" and "number" also get their built-in checks. */
    type?: TextFieldType
    /** Floating label. Used by the filled and outlined variants. */
    label?: React.ReactNode
    /** Shows the error style. Same as passing aria-invalid. */
    invalid?: boolean
    /** Decorative content before the text, usually an icon. Defaults to a search icon when type="search". */
    leading?: React.ReactNode
    /** Content after the text, usually an icon. */
    trailing?: React.ReactNode
    /** Text inside the field before the value, e.g. "$" or "https://". */
    prefix?: React.ReactNode
    /** Text inside the field after the value, e.g. "ft" or "%". */
    suffix?: React.ReactNode
    /** Keyboard hint on the right, e.g. "⌘K". */
    shortcut?: React.ReactNode
    /** Shows a spinner in the trailing slot and marks the field busy. */
    loading?: boolean
    /** Shows a clear button once the field has a value. Defaults to true when type="search". */
    clearable?: boolean
    /** Adds a show/hide toggle when type="password". */
    revealable?: boolean
    /** Classes for the wrapper that holds the adornments. Falls back onto the input when there is no wrapper. */
    containerClassName?: string
    /**
     * Suggests the rest of the value as ghost text, accepted with Tab or
     * ArrowRight. Use completeFrom(list) for a fixed list; memoize async
     * sources. Adding or removing it remounts the input, so keep it steady.
     */
    completion?: CompletionSource
    /** Keys that accept the suggestion. Defaults to Tab and ArrowRight. */
    completionKeys?: InlineCompletionKey[]
    /**
     * Ghost text to draw after the value, for components that run
     * useInlineCompletion themselves. Overrides `completion`. Pass "" while
     * there's nothing to suggest; switching to undefined drops focus.
     */
    ghost?: string
  }

/** Space between an adornment group and the text, in px. */
const ADORNMENT_GAP = { default: 6, material: 8 }

function TextField({
  className,
  containerClassName,
  variant = "default",
  size = "default",
  align = "start",
  type = "text",
  label,
  invalid,
  leading: leadingProp,
  trailing,
  prefix,
  suffix,
  shortcut,
  loading = false,
  clearable: clearableProp,
  revealable = false,
  completion,
  completionKeys,
  ghost,
  error,
  validate,
  validateOn,
  messages,
  onValidityChange,
  ref,
  ...props
}: TextFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const leadingRef = React.useRef<HTMLSpanElement>(null)
  const trailingRef = React.useRef<HTMLSpanElement>(null)
  const setRefs = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref]
  )
  const autoId = React.useId()
  const [revealed, setRevealed] = React.useState(false)
  const [text, setText] = React.useState(
    String(props.value ?? props.defaultValue ?? "")
  )
  const isSearch = type === "search"
  const leading = leadingProp ?? (isSearch ? <SearchIcon /> : undefined)
  const clearable = clearableProp ?? isSearch
  const isControlled = props.value !== undefined
  const currentText = isControlled ? String(props.value) : text
  const filled = currentText.length > 0
  const canReveal = revealable && type === "password"
  const validation = useFieldValidation({
    ref: inputRef,
    value: currentText,
    type,
    // FormField's `required` arrives as aria-required.
    required:
      props.required ||
      props["aria-required"] === true ||
      props["aria-required"] === "true",
    minLength: props.minLength,
    maxLength: props.maxLength,
    pattern: props.pattern,
    min: props.min,
    max: props.max,
    title: props.title,
    validate,
    messages,
    error,
    validateOn,
    onValidityChange,
    disabled: props.disabled || props.readOnly,
    onReset: setText,
  })
  const messageId = `${autoId}-message`
  const showMessage = validation.message != null && !validation.reported
  const describedBy =
    [props["aria-describedby"], showMessage ? messageId : null]
      .filter(Boolean)
      .join(" ") || undefined
  const ariaInvalid =
    invalid || props["aria-invalid"] || (validation.message ? true : undefined)
  const isMaterial = variant === "filled" || variant === "outlined"
  const hasLabel = isMaterial && label != null
  const inputId = props.id ?? autoId
  const hasLeading = leading != null || prefix != null
  const hasTrailing =
    trailing != null ||
    suffix != null ||
    shortcut != null ||
    loading ||
    clearable ||
    canReveal
  const suggestion = useCompletion(currentText, completion)
  const completer = useInlineCompletion({
    value: currentText,
    completion: suggestion,
    acceptKeys: completionKeys,
    disabled: !completion || props.disabled || props.readOnly,
  })
  const ghostText = ghost ?? completer.suffix
  const hasGhost = ghost !== undefined || completion !== undefined
  // Right-aligned text and masked passwords can't line a suffix up after the value.
  const showGhost = hasGhost && align !== "end" && type !== "password"
  const hasWrapper = isMaterial || hasLeading || hasTrailing || hasGhost
  const gap = isMaterial ? ADORNMENT_GAP.material : ADORNMENT_GAP.default
  const trackedProps = {
    ...props,
    onChange(event: React.ChangeEvent<HTMLInputElement>) {
      setText(event.target.value)
      props.onChange?.(event)
    },
  }
  const fieldProps = validation.getInputProps(
    completion ? completer.getInputProps(trackedProps) : trackedProps
  )

  // Adornments vary in width ("$" vs "https://"), so measure them and pad the
  // text past them through CSS variables on the wrapper. The padding classes
  // below carry a close first guess until the measurement lands.
  React.useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || (!hasLeading && !hasTrailing)) {
      return
    }
    function measure() {
      if (!wrapper) {
        return
      }
      const start = leadingRef.current
      const end = trailingRef.current
      if (start) {
        wrapper.style.setProperty(
          "--text-field-start",
          `${start.offsetLeft + start.offsetWidth + gap}px`
        )
      }
      if (end) {
        wrapper.style.setProperty(
          "--text-field-end",
          `${wrapper.clientWidth - end.offsetLeft + gap}px`
        )
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    for (const node of [wrapper, leadingRef.current, trailingRef.current]) {
      if (node) {
        observer.observe(node)
      }
    }
    return () => observer.disconnect()
  }, [hasLeading, hasTrailing, gap])

  const input = (
    <input
      ref={setRefs}
      data-slot="text-field"
      data-variant={variant}
      data-size={size}
      data-align={align}
      type={canReveal && revealed ? "text" : type}
      aria-busy={loading || undefined}
      className={cn(
        textFieldVariants({ variant, size, align }),
        hasLeading &&
          (isMaterial
            ? "pl-[var(--text-field-start,2.5rem)]"
            : "pl-[var(--text-field-start,2rem)]"),
        hasTrailing &&
          (isMaterial
            ? "pr-[var(--text-field-end,2.5rem)]"
            : "pr-[var(--text-field-end,2rem)]"),
        isSearch &&
          clearable &&
          "[&::-webkit-search-cancel-button]:appearance-none",
        hasLabel &&
          "pt-4 placeholder:text-transparent focus:placeholder:text-muted-foreground",
        !hasWrapper && containerClassName,
        className
      )}
      // The browser's own autofill list would cover the ghost text.
      autoComplete={completion ? "off" : undefined}
      {...fieldProps}
      id={hasLabel ? inputId : props.id}
      // The floating label keys off :placeholder-shown, so it needs a placeholder.
      placeholder={hasLabel ? (props.placeholder ?? " ") : props.placeholder}
      aria-invalid={ariaInvalid}
      aria-describedby={describedBy}
    />
  )

  // Always a fragment, so the input keeps its place (and focus) when the
  // message comes and goes.
  function withMessage(field: React.ReactNode) {
    return (
      <>
        {field}
        {showMessage ? (
          <p
            id={messageId}
            role="alert"
            data-slot="text-field-message"
            className="mt-1.5 text-xs text-destructive"
          >
            {validation.message}
          </p>
        ) : null}
      </>
    )
  }

  if (!hasWrapper) {
    return withMessage(input)
  }

  function clear() {
    const el = inputRef.current
    if (!el) {
      return
    }
    // Go through the native setter so React fires onChange for controlled inputs.
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set
    setter?.call(el, "")
    el.dispatchEvent(new Event("input", { bubbles: true }))
    el.focus()
  }

  const small = size === "sm" && !isMaterial
  const iconClass = small ? "size-3.5" : "size-4"
  // Under a floating label, prefix and suffix wait until the label floats up.
  const affixClass = cn(
    "whitespace-nowrap text-muted-foreground",
    small ? "text-xs" : "text-base md:text-sm",
    // pt-4 matches the input's, so the affix sits on the value's line.
    hasLabel && "pt-4 opacity-0 transition-opacity duration-150"
  )
  const affixRevealClass =
    hasLabel &&
    "peer-focus:*:data-[slot=text-field-affix]:opacity-100 peer-[:not(:placeholder-shown)]:*:data-[slot=text-field-affix]:opacity-100"

  return withMessage(
    <div
      ref={wrapperRef}
      data-slot="text-field-wrapper"
      data-variant={variant}
      className={cn("relative w-full", containerClassName)}
    >
      {input}
      {showGhost ? (
        <GhostText inputRef={inputRef} value={currentText} suffix={ghostText} />
      ) : null}
      {variant === "outlined" ? (
        <fieldset
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 -top-1.5 bottom-0 m-0 min-w-0 rounded-md border border-input px-2 text-left transition-colors",
            "peer-hover:border-foreground/60 peer-focus-visible:border-2 peer-focus-visible:border-primary peer-disabled:opacity-50 peer-disabled:peer-hover:border-input peer-aria-invalid:border-destructive",
            hasLabel &&
              "peer-focus:[&>legend]:max-w-full peer-[:not(:placeholder-shown)]:[&>legend]:max-w-full"
          )}
        >
          <legend className="invisible float-none block h-3 w-auto max-w-[0.01px] overflow-hidden p-0 text-xs whitespace-nowrap transition-[max-width] duration-100">
            {hasLabel ? <span className="px-1">{label}</span> : null}
          </legend>
        </fieldset>
      ) : null}
      {hasLeading ? (
        // After the input in the DOM so it can follow the input's peer state.
        <span
          ref={leadingRef}
          data-slot="text-field-leading"
          className={cn(
            "pointer-events-none absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-1.5 text-muted-foreground [&_svg]:shrink-0",
            isMaterial ? "left-3" : "left-2.5",
            small
              ? "[&_svg:not([class*='size-'])]:size-3.5"
              : "[&_svg:not([class*='size-'])]:size-4",
            affixRevealClass
          )}
        >
          {leading != null ? (
            <span aria-hidden className="flex">
              {leading}
            </span>
          ) : null}
          {prefix != null ? (
            <span data-slot="text-field-affix" className={affixClass}>
              {prefix}
            </span>
          ) : null}
        </span>
      ) : null}
      {hasLabel ? (
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute top-1/2 max-w-[calc(100%-1.5rem)] origin-left -translate-y-1/2 truncate text-base text-muted-foreground transition-all duration-150 md:text-sm",
            "peer-focus:text-xs peer-focus:text-primary peer-disabled:opacity-50 peer-aria-invalid:text-destructive peer-[:not(:placeholder-shown)]:text-xs",
            hasLeading ? "left-[var(--text-field-start,2.5rem)]" : "left-3",
            variant === "filled"
              ? "peer-focus:top-3 peer-[:not(:placeholder-shown)]:top-3"
              : cn(
                  "peer-focus:top-0 peer-[:not(:placeholder-shown)]:top-0",
                  hasLeading &&
                    "peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3"
                )
          )}
        >
          {label}
        </label>
      ) : null}
      {hasTrailing ? (
        <span
          ref={trailingRef}
          data-slot="text-field-trailing"
          className={cn(
            "pointer-events-none absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5",
            isMaterial ? "right-2" : "right-1",
            affixRevealClass
          )}
        >
          {suffix != null ? (
            <span
              data-slot="text-field-affix"
              className={cn(affixClass, "px-1.5")}
            >
              {suffix}
            </span>
          ) : null}
          {loading ? (
            <span className="flex size-6 items-center justify-center text-muted-foreground">
              <Spinner className={iconClass} />
            </span>
          ) : null}
          {clearable && filled && !props.disabled && !props.readOnly ? (
            <button
              type="button"
              aria-label={isSearch ? "Clear search" : "Clear"}
              onClick={clear}
              className="pointer-events-auto flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <XIcon aria-hidden className={iconClass} />
            </button>
          ) : null}
          {canReveal ? (
            <button
              type="button"
              aria-label={revealed ? "Hide password" : "Show password"}
              aria-pressed={revealed}
              disabled={props.disabled}
              onClick={() => setRevealed((current) => !current)}
              className="pointer-events-auto flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none"
            >
              {revealed ? (
                <EyeOffIcon aria-hidden className={iconClass} />
              ) : (
                <EyeIcon aria-hidden className={iconClass} />
              )}
            </button>
          ) : trailing != null ? (
            <span className="pointer-events-auto flex min-w-6 items-center justify-center text-muted-foreground [&_svg:not([class*='size-'])]:size-4">
              {trailing}
            </span>
          ) : null}
          {shortcut != null ? (
            <Kbd data-slot="text-field-shortcut" className="mr-1">
              {shortcut}
            </Kbd>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}

/**
 * Draws the suffix over an input or textarea, after an invisible copy of the
 * value. It copies the field's box, padding and font so the suffix lands where
 * the next typed letter would, and follows the field's scroll.
 */
function GhostText({
  inputRef,
  value,
  suffix,
  multiline = false,
}: {
  inputRef: React.RefObject<TextInputElement | null>
  value: string
  suffix: string
  /** Wraps like a textarea instead of running on one line. */
  multiline?: boolean
}) {
  const ghostRef = React.useRef<HTMLDivElement>(null)

  const sync = React.useCallback(() => {
    const input = inputRef.current
    const ghost = ghostRef.current
    if (!input || !ghost) {
      return
    }
    const style = getComputedStyle(input)
    const borderX =
      parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth)
    // A textarea's scrollbar narrows the text, so the copy wraps at the same place.
    const scrollbar = input.offsetWidth - input.clientWidth - borderX
    // offsetLeft/offsetWidth round to whole pixels. Under display scaling the
    // input often sits on a fraction, so place the copy from the exact rects.
    const box = input.getBoundingClientRect()
    const parent = ghost.offsetParent ?? ghost.parentElement
    const origin = parent?.getBoundingClientRect() ?? { left: 0, top: 0 }
    Object.assign(ghost.style, {
      left: `${box.left - origin.left - (parent?.clientLeft ?? 0)}px`,
      top: `${box.top - origin.top - (parent?.clientTop ?? 0)}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      paddingTop: `calc(${style.paddingTop} + ${style.borderTopWidth})`,
      paddingRight: `calc(${style.paddingRight} + ${style.borderRightWidth} + ${Math.max(scrollbar, 0)}px)`,
      paddingBottom: `calc(${style.paddingBottom} + ${style.borderBottomWidth})`,
      paddingLeft: `calc(${style.paddingLeft} + ${style.borderLeftWidth})`,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      fontStretch: style.fontStretch,
      fontKerning: style.fontKerning,
      fontFeatureSettings: style.fontFeatureSettings,
      fontVariationSettings: style.fontVariationSettings,
      fontVariantLigatures: style.fontVariantLigatures,
      fontVariantNumeric: style.fontVariantNumeric,
      letterSpacing: style.letterSpacing,
      wordSpacing: style.wordSpacing,
      textTransform: style.textTransform,
      // Same line box as the input, so both center the text on the same baseline.
      lineHeight: style.lineHeight,
    })
    const text = ghost.firstElementChild as HTMLElement | null
    if (text) {
      text.style.transform = `translate(${-input.scrollLeft}px, ${-input.scrollTop}px)`
    }
  }, [inputRef])

  React.useLayoutEffect(() => {
    sync()
    // The browser scrolls the field to the caret after it paints the new value.
    const frame = requestAnimationFrame(sync)
    return () => cancelAnimationFrame(frame)
  }, [sync, value, suffix])

  React.useEffect(() => {
    const input = inputRef.current
    if (!input) {
      return
    }
    const observer = new ResizeObserver(sync)
    observer.observe(input)
    input.addEventListener("scroll", sync)
    return () => {
      observer.disconnect()
      input.removeEventListener("scroll", sync)
    }
  }, [inputRef, sync])

  return (
    <>
      <div
        ref={ghostRef}
        aria-hidden
        data-slot="text-field-ghost"
        className={cn(
          "pointer-events-none absolute overflow-hidden",
          multiline
            ? "block break-words whitespace-pre-wrap"
            : "flex items-center whitespace-pre"
        )}
      >
        <span className={multiline ? "block" : "flex"}>
          <span className="invisible">{value}</span>
          <span className="text-muted-foreground/70">{suffix}</span>
        </span>
      </div>
      <span aria-live="polite" className="sr-only">
        {suffix ? `Suggestion: ${value}${suffix}` : ""}
      </span>
    </>
  )
}

export { GhostText, TextField, textFieldVariants }
export type { TextFieldProps, TextFieldType }
