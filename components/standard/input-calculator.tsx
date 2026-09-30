"use client"

import * as React from "react"

import { useControllableState } from "@/hooks/use-controllable-state"
import {
  evaluatesFormula,
  formatsCalcValue,
  tokenizesFormula,
  toFormulaText,
  type CalcFunctions,
  type CalcResult,
  type CalcToken,
  type CalcValue,
  type CalcVariables,
} from "@/components/standard/input-calculator-model"

export * from "@/components/standard/input-calculator-model"

type UseInputCalculatorOptions = {
  /** The formula text. Pass it to control the field. */
  value?: string
  defaultValue?: string
  onValueChange?: (formula: string) => void
  /** Names the formula can use, e.g. `{ price: 20, total: "=price * qty" }`. */
  variables?: CalcVariables
  /** Extra functions, or replacements for built-ins. Names ignore case. */
  functions?: CalcFunctions
  /** Only evaluate text that starts with "=", like a spreadsheet cell. */
  requireEquals?: boolean
  /** Turns a value into display text. Defaults to 15 significant digits. */
  format?: (value: CalcValue) => string
  /** Fires whenever the result changes, as you type. */
  onResult?: (result: CalcResult) => void
  /** Fires on Enter, and on blur after an edit. */
  onCommit?: (result: CalcResult) => void
  /** On commit, replace the formula with its value: `=6*7` becomes `42`. */
  resolveOnCommit?: boolean
  /**
   * Stops the formula being edited: the field turns read-only and Enter,
   * Escape and blur do nothing. The result still follows `variables`, and
   * `value` or `setFormula` can still change the formula from code.
   */
  locked?: boolean
}

type InputCalculatorState = {
  formula: string
  setFormula: (formula: string) => void
  result: CalcResult
  /** The formatted value, the error code, or "" when empty. */
  display: string
  tokens: CalcToken[]
  commit: () => void
  /** Puts back the formula from the last commit. */
  revert: () => void
  locked: boolean
  inputId: string
  outputId: string
  /** Props for any input or textarea: value, handlers, ids and aria state. */
  getInputProps: <P extends InputLikeProps>(props?: P) => P & InputLikeProps
}

type InputLikeProps = {
  id?: string
  value?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  [key: string]: unknown
}

/**
 * The Input Calculator without markup: formula state, the evaluated result
 * and props to spread onto your own field. Enter commits, Escape reverts.
 */
function useInputCalculator({
  value,
  defaultValue = "",
  onValueChange,
  variables,
  functions,
  requireEquals = false,
  format = formatsCalcValue,
  onResult,
  onCommit,
  resolveOnCommit = false,
  locked = false,
}: UseInputCalculatorOptions = {}): InputCalculatorState {
  const [formula, setFormula] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const committed = React.useRef(formula)
  const inputId = React.useId()
  const outputId = React.useId()

  const result = React.useMemo(
    () => evaluatesFormula(formula, { variables, functions, requireEquals }),
    [formula, variables, functions, requireEquals]
  )
  const tokens = React.useMemo(() => tokenizesFormula(formula), [formula])
  const display =
    result.status === "ok"
      ? format(result.value)
      : result.status === "error"
        ? result.error.code
        : ""

  const callbacks = React.useRef({ onResult, onCommit })
  const latestResult = React.useRef(result)
  React.useEffect(() => {
    callbacks.current = { onResult, onCommit }
    latestResult.current = result
  })

  // Report only real changes; `variables` is usually a new object each render.
  const resultKey = `${result.status}:${result.status === "error" ? result.error.code + result.error.message : display}`
  React.useEffect(() => {
    callbacks.current.onResult?.(latestResult.current)
  }, [resultKey])

  const commit = React.useCallback(() => {
    if (locked) return
    const current = latestResult.current
    let next = current.formula
    if (resolveOnCommit && current.status === "ok") {
      next = toFormulaText(current.value, requireEquals)
      setFormula(next)
    }
    committed.current = next
    callbacks.current.onCommit?.(current)
  }, [locked, resolveOnCommit, requireEquals, setFormula])

  const revert = React.useCallback(() => {
    if (locked) return
    setFormula(committed.current)
  }, [locked, setFormula])

  // A formula set while locked is the new baseline for Escape once unlocked.
  React.useEffect(() => {
    if (locked) committed.current = formula
  }, [locked, formula])

  const getInputProps = React.useCallback(
    <P extends InputLikeProps>(props = {} as P) =>
      ({
        spellCheck: false,
        autoComplete: "off",
        autoCorrect: "off",
        autoCapitalize: "off",
        "aria-describedby": outputId,
        ...props,
        id: props.id ?? inputId,
        value: formula,
        readOnly: locked || props.readOnly,
        "data-locked": locked ? "" : undefined,
        "aria-invalid":
          result.status === "error" && !result.error.incomplete
            ? true
            : props["aria-invalid"],
        "data-status": result.status,
        onChange: (event) => {
          props.onChange?.(event)
          if (!event.defaultPrevented && !locked) setFormula(event.target.value)
        },
        onKeyDown: (event) => {
          props.onKeyDown?.(event)
          if (locked || event.defaultPrevented || event.nativeEvent.isComposing) return
          if (event.key === "Enter" && !event.shiftKey) {
            commit()
          } else if (event.key === "Escape" && formula !== committed.current) {
            // Only swallow Escape when there is an edit to undo, so dialogs still close.
            event.preventDefault()
            event.stopPropagation()
            revert()
          }
        },
        onBlur: (event) => {
          props.onBlur?.(event)
          if (!locked && formula !== committed.current) commit()
        },
      }) as P & InputLikeProps,
    [commit, formula, inputId, locked, outputId, result, revert, setFormula]
  )

  return {
    formula,
    setFormula,
    result,
    display,
    tokens,
    commit,
    revert,
    locked,
    inputId,
    outputId,
    getInputProps,
  }
}

const InputCalculatorContext = React.createContext<InputCalculatorState | null>(null)

function useInputCalculatorContext(part: string) {
  const context = React.useContext(InputCalculatorContext)
  if (!context) throw new Error(`${part} must be inside <InputCalculator>.`)
  return context
}

type InputCalculatorProps = UseInputCalculatorOptions &
  Omit<React.ComponentProps<"div">, "defaultValue" | "children"> & {
    children?: React.ReactNode | ((state: InputCalculatorState) => React.ReactNode)
  }

/**
 * Headless formula field: type `=price * qty * (1 + tax)` and get the value,
 * like a spreadsheet cell. It renders no styles. Compose InputCalculatorInput,
 * InputCalculatorResult and InputCalculatorHighlight inside it, or pass a
 * function child to render from the state yourself.
 */
function InputCalculator({
  value,
  defaultValue,
  onValueChange,
  variables,
  functions,
  requireEquals,
  format,
  onResult,
  onCommit,
  resolveOnCommit,
  locked,
  children,
  ...props
}: InputCalculatorProps) {
  const state = useInputCalculator({
    value,
    defaultValue,
    onValueChange,
    variables,
    functions,
    requireEquals,
    format,
    onResult,
    onCommit,
    resolveOnCommit,
    locked,
  })

  return (
    <InputCalculatorContext.Provider value={state}>
      <div
        data-slot="input-calculator"
        data-status={state.result.status}
        data-locked={state.locked ? "" : undefined}
        {...props}
      >
        {typeof children === "function" ? children(state) : children}
      </div>
    </InputCalculatorContext.Provider>
  )
}

/** The formula field: a plain input wired to the calculator. */
function InputCalculatorInput(
  props: Omit<React.ComponentProps<"input">, "value" | "defaultValue">
) {
  const { getInputProps } = useInputCalculatorContext("InputCalculatorInput")
  return (
    <input
      type="text"
      data-slot="input-calculator-input"
      {...getInputProps(props as InputLikeProps)}
    />
  )
}

type InputCalculatorResultProps = Omit<React.ComponentProps<"output">, "children"> & {
  /** Render the result yourself. Defaults to the value or the error code. */
  children?: (state: InputCalculatorState) => React.ReactNode
  /** Shown while the formula is empty. */
  placeholder?: React.ReactNode
}

/** Live result, announced politely to screen readers. */
function InputCalculatorResult({
  children,
  placeholder = null,
  ...props
}: InputCalculatorResultProps) {
  const state = useInputCalculatorContext("InputCalculatorResult")
  const { result } = state

  return (
    <output
      id={state.outputId}
      htmlFor={state.inputId}
      aria-live="polite"
      data-slot="input-calculator-result"
      data-status={result.status}
      data-incomplete={
        result.status === "error" && result.error.incomplete ? "" : undefined
      }
      title={result.status === "error" ? result.error.message : undefined}
      {...props}
    >
      {children
        ? children(state)
        : result.status === "empty"
          ? placeholder
          : state.display}
    </output>
  )
}

/**
 * The formula as token spans (`data-token="number" | "name" | "function"…`),
 * with `data-error="invalid" | "incomplete"` on the part an error points at. Lay it under a transparent
 * input to colour the formula as it is typed.
 */
function InputCalculatorHighlight(props: React.ComponentProps<"span">) {
  const { tokens, result } = useInputCalculatorContext("InputCalculatorHighlight")
  const error = result.status === "error" ? result.error : null
  const hasRange = error?.start !== undefined && error.end !== undefined

  return (
    <span aria-hidden data-slot="input-calculator-highlight" {...props}>
      {tokens.map((token) => (
        <span
          key={token.start}
          data-token={token.type}
          data-error={
            hasRange &&
            token.type !== "space" &&
            token.start < error.end! &&
            token.end > error.start!
              ? error.incomplete
                ? "incomplete"
                : "invalid"
              : undefined
          }
        >
          {token.text}
        </span>
      ))}
    </span>
  )
}

export {
  InputCalculator,
  InputCalculatorInput,
  InputCalculatorResult,
  InputCalculatorHighlight,
  useInputCalculator,
  type InputCalculatorProps,
  type InputCalculatorResultProps,
  type InputCalculatorState,
  type UseInputCalculatorOptions,
}
