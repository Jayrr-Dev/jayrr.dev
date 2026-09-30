"use client"

import * as React from "react"
import { cn } from "cn"

import { GhostText } from "@/components/standard/text-field"
import {
  useFieldValidation,
  type FieldValidationProps,
} from "@/hooks/use-field-validation"
import {
  useCompletion,
  useInlineCompletion,
  type CompletionSource,
  type InlineCompletionKey,
} from "@/hooks/use-inline-completion"

type TextareaProps = React.ComponentProps<"textarea"> &
  FieldValidationProps & {
    /** Shows the error style. Same as passing aria-invalid. */
    invalid?: boolean
    /**
     * Suggests the rest of the text as ghost text once the caret is at the end,
     * accepted with Tab or ArrowRight. Memoize async sources. Adding or
     * removing it remounts the textarea, so keep it steady.
     */
    completion?: CompletionSource
    /** Keys that accept the suggestion. Defaults to Tab and ArrowRight. */
    completionKeys?: InlineCompletionKey[]
  }

function Textarea({
  className,
  invalid,
  completion,
  completionKeys,
  error,
  validate,
  validateOn,
  messages,
  onValidityChange,
  ref,
  ...props
}: TextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref]
  )
  const [text, setText] = React.useState(
    String(props.value ?? props.defaultValue ?? "")
  )
  const currentText = props.value !== undefined ? String(props.value) : text
  const suggestion = useCompletion(currentText, completion)
  const { suffix, getInputProps } = useInlineCompletion<HTMLTextAreaElement>({
    value: currentText,
    completion: suggestion,
    acceptKeys: completionKeys,
    disabled: !completion || props.disabled || props.readOnly,
  })

  const autoId = React.useId()
  const validation = useFieldValidation({
    ref: textareaRef,
    value: currentText,
    // FormField's `required` arrives as aria-required.
    required:
      props.required ||
      props["aria-required"] === true ||
      props["aria-required"] === "true",
    minLength: props.minLength,
    maxLength: props.maxLength,
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
  const trackedProps = {
    ...props,
    onChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
      setText(event.target.value)
      props.onChange?.(event)
    },
  }

  const textarea = (
    <textarea
      ref={setRefs}
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...validation.getInputProps(
        completion
          ? getInputProps({ autoComplete: "off", ...trackedProps })
          : trackedProps
      )}
      aria-invalid={
        invalid ||
        props["aria-invalid"] ||
        (validation.message ? true : undefined)
      }
      aria-describedby={describedBy}
    />
  )

  return (
    // A fragment either way, so the textarea keeps its place (and focus)
    // when the message comes and goes.
    <>
      {completion ? (
        <div data-slot="textarea-wrapper" className="relative w-full">
          {textarea}
          <GhostText
            inputRef={textareaRef}
            value={currentText}
            suffix={suffix}
            multiline
          />
        </div>
      ) : (
        textarea
      )}
      {showMessage ? (
        <p
          id={messageId}
          role="alert"
          data-slot="textarea-message"
          className="mt-1.5 text-xs text-destructive"
        >
          {validation.message}
        </p>
      ) : null}
    </>
  )
}

export { Textarea }
export type { TextareaProps }
