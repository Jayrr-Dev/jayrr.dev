"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react"
import { cn } from "cn"

const textFieldVariants = cva(
  "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        default: "h-8",
        sm: "h-7 md:text-xs",
        lg: "h-9",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type TextFieldProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof textFieldVariants> & {
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
  size = "default",
  type = "text",
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
  const [revealed, setRevealed] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(
    Boolean(props.value ?? props.defaultValue)
  )
  const isControlled = props.value !== undefined
  const filled = isControlled ? String(props.value).length > 0 : hasValue
  const canReveal = revealable && type === "password"
  const ariaInvalid = invalid || props["aria-invalid"] || undefined

  const input = (
    <input
      ref={setRefs}
      data-slot="text-field"
      data-size={size}
      type={canReveal && revealed ? "text" : type}
      className={cn(
        textFieldVariants({ size }),
        leadingIcon && "pl-8",
        (trailingIcon || clearable || canReveal) && "pr-8",
        clearable && (trailingIcon || canReveal) && "pr-14",
        className
      )}
      {...props}
      aria-invalid={ariaInvalid}
      onChange={(event) => {
        setHasValue(event.target.value.length > 0)
        props.onChange?.(event)
      }}
    />
  )

  if (!leadingIcon && !trailingIcon && !clearable && !canReveal) {
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

  const iconClass = size === "sm" ? "size-3.5" : "size-4"

  return (
    <div data-slot="text-field-wrapper" className="relative w-full">
      {leadingIcon ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 left-2.5 flex -translate-y-1/2 text-muted-foreground [&_svg]:shrink-0",
            size === "sm"
              ? "[&_svg:not([class*='size-'])]:size-3.5"
              : "[&_svg:not([class*='size-'])]:size-4"
          )}
        >
          {leadingIcon}
        </span>
      ) : null}
      {input}
      <span className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-0.5">
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
    </div>
  )
}

export { TextField, textFieldVariants }
export type { TextFieldProps }
