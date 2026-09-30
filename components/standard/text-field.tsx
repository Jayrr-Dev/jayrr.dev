"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react"
import { cn } from "cn"

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
    },
  }
)

type TextFieldProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof textFieldVariants> & {
    /** Floating label. Used by the filled and outlined variants. */
    label?: React.ReactNode
    /** Shows the error style. Same as passing aria-invalid. */
    invalid?: boolean
    leadingIcon?: React.ReactNode
    trailingIcon?: React.ReactNode
    /** Shows a clear button once the field has a value. */
    clearable?: boolean
    /** Adds a show/hide toggle when type="password". */
    revealable?: boolean
  }

function TextField({
  className,
  variant = "default",
  size = "default",
  type = "text",
  label,
  invalid,
  leadingIcon,
  trailingIcon,
  clearable = false,
  revealable = false,
  ref,
  ...props
}: TextFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
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
  const [hasValue, setHasValue] = React.useState(
    Boolean(props.value ?? props.defaultValue)
  )
  const isControlled = props.value !== undefined
  const filled = isControlled ? String(props.value).length > 0 : hasValue
  const canReveal = revealable && type === "password"
  const ariaInvalid = invalid || props["aria-invalid"] || undefined
  const isMaterial = variant === "filled" || variant === "outlined"
  const hasLabel = isMaterial && label != null
  const inputId = props.id ?? autoId
  const hasTrailing = trailingIcon || clearable || canReveal

  const input = (
    <input
      ref={setRefs}
      data-slot="text-field"
      data-variant={variant}
      data-size={size}
      type={canReveal && revealed ? "text" : type}
      className={cn(
        textFieldVariants({ variant, size }),
        leadingIcon && (isMaterial ? "pl-10" : "pl-8"),
        hasTrailing && (isMaterial ? "pr-10" : "pr-8"),
        clearable && (trailingIcon || canReveal) && "pr-16",
        hasLabel &&
          "pt-4 placeholder:text-transparent focus:placeholder:text-muted-foreground",
        className
      )}
      {...props}
      id={hasLabel ? inputId : props.id}
      // The floating label keys off :placeholder-shown, so it needs a placeholder.
      placeholder={hasLabel ? (props.placeholder ?? " ") : props.placeholder}
      aria-invalid={ariaInvalid}
      onChange={(event) => {
        setHasValue(event.target.value.length > 0)
        props.onChange?.(event)
      }}
    />
  )

  if (!isMaterial && !leadingIcon && !hasTrailing) {
    return input
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

  const iconClass = size === "sm" && !isMaterial ? "size-3.5" : "size-4"

  return (
    <div
      data-slot="text-field-wrapper"
      data-variant={variant}
      className="relative w-full"
    >
      {leadingIcon ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 z-10 flex -translate-y-1/2 text-muted-foreground [&_svg]:shrink-0",
            isMaterial ? "left-3" : "left-2.5",
            size === "sm" && !isMaterial
              ? "[&_svg:not([class*='size-'])]:size-3.5"
              : "[&_svg:not([class*='size-'])]:size-4"
          )}
        >
          {leadingIcon}
        </span>
      ) : null}
      {input}
      {variant === "outlined" ? (
        <fieldset
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 -top-1.5 bottom-0 m-0 min-w-0 rounded-md border border-input px-2 text-left transition-colors",
            "peer-hover:border-foreground/60 peer-focus-visible:border-2 peer-focus-visible:border-primary peer-aria-invalid:border-destructive peer-disabled:opacity-50 peer-disabled:peer-hover:border-input",
            hasLabel &&
              "peer-focus:[&>legend]:max-w-full peer-[:not(:placeholder-shown)]:[&>legend]:max-w-full"
          )}
        >
          <legend className="invisible float-none block h-3 w-auto max-w-[0.01px] overflow-hidden p-0 text-xs whitespace-nowrap transition-[max-width] duration-100">
            {hasLabel ? <span className="px-1">{label}</span> : null}
          </legend>
        </fieldset>
      ) : null}
      {hasLabel ? (
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute top-1/2 max-w-[calc(100%-1.5rem)] origin-left -translate-y-1/2 truncate text-base text-muted-foreground transition-all duration-150 md:text-sm",
            "peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-xs peer-aria-invalid:text-destructive peer-disabled:opacity-50",
            leadingIcon ? "left-10" : "left-3",
            variant === "filled"
              ? "peer-focus:top-3 peer-[:not(:placeholder-shown)]:top-3"
              : cn(
                  "peer-focus:top-0 peer-[:not(:placeholder-shown)]:top-0",
                  leadingIcon &&
                    "peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3"
                )
          )}
        >
          {label}
        </label>
      ) : null}
      {hasTrailing ? (
        <span
          className={cn(
            "absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5",
            isMaterial ? "right-2" : "right-1"
          )}
        >
          {clearable && filled && !props.disabled && !props.readOnly ? (
            <button
              type="button"
              aria-label="Clear"
              onClick={clear}
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
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
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none"
            >
              {revealed ? (
                <EyeOffIcon aria-hidden className={iconClass} />
              ) : (
                <EyeIcon aria-hidden className={iconClass} />
              )}
            </button>
          ) : trailingIcon ? (
            <span
              aria-hidden
              className="pointer-events-none flex size-6 items-center justify-center text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
            >
              {trailingIcon}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}

export { TextField, textFieldVariants }
export type { TextFieldProps }
