"use client"

import * as React from "react"
import { CheckIcon, LoaderCircleIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

/**
 * Where a step sits relative to the current one. `complete`, `error` and
 * `loading` can also be set on a step directly with `status`.
 */
type StepState = "complete" | "active" | "upcoming" | "error" | "loading"

type StepsOrientation = "horizontal" | "vertical"

type StepsContextValue = {
  value: number
  selects: (index: number) => void
  interactive: boolean
  disabled: boolean
  orientation: StepsOrientation
}

const StepsContext = React.createContext<StepsContextValue | null>(null)

function useStepsContext(part: string) {
  const context = React.useContext(StepsContext)
  if (!context) throw new Error(`<${part}> must be used inside <Steps>.`)
  return context
}

type StepContextValue = {
  index: number
  state: StepState
  disabled: boolean
}

const StepContext = React.createContext<StepContextValue | null>(null)

function useStepContext(part: string) {
  const context = React.useContext(StepContext)
  if (!context) throw new Error(`<${part}> must be used inside <Step>.`)
  return context
}

type StepsProps = Omit<React.ComponentProps<"ol">, "onChange" | "defaultValue"> & {
  /** Current step index. */
  value?: number
  defaultValue?: number
  onValueChange?: (index: number) => void
  orientation?: StepsOrientation
  /** Lets people pick a step through its StepTrigger. */
  interactive?: boolean
  /** Keeps the steps visible but blocks picking, e.g. while saving. */
  disabled?: boolean
}

/**
 * An ordered sequence with a current position. Each Step works out whether
 * it is complete, active or upcoming, and exposes it as `data-state` for its
 * parts to style. Every part inside is optional: steps, dots, segmented bars
 * and checklists are all layouts of the same pieces.
 */
function Steps({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  orientation = "horizontal",
  interactive = true,
  disabled = false,
  className,
  ...props
}: StepsProps) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })

  const context = React.useMemo<StepsContextValue>(
    () => ({
      value,
      selects: (index) => {
        if (interactive && !disabled) setValue(index)
      },
      interactive,
      disabled,
      orientation,
    }),
    [value, setValue, interactive, disabled, orientation]
  )

  return (
    <StepsContext.Provider value={context}>
      <ol
        data-slot="steps"
        data-orientation={orientation}
        className={cn(
          "flex",
          orientation === "vertical" ? "flex-col" : "items-center",
          className
        )}
        {...props}
      />
    </StepsContext.Provider>
  )
}

type StepProps = React.ComponentProps<"li"> & {
  /** Position in the sequence, from 0. */
  index: number
  /** Overrides the state worked out from the current step. */
  status?: "complete" | "error" | "loading"
  /** Can't be picked. */
  disabled?: boolean
}

function Step({
  index,
  status,
  disabled = false,
  className,
  ...props
}: StepProps) {
  const { value, orientation } = useStepsContext("Step")
  const state: StepState =
    status ??
    (index < value ? "complete" : index === value ? "active" : "upcoming")

  const context = React.useMemo(
    () => ({ index, state, disabled }),
    [index, state, disabled]
  )

  return (
    <StepContext.Provider value={context}>
      <li
        data-slot="step"
        data-state={state}
        data-orientation={orientation}
        data-disabled={disabled || undefined}
        className={cn("group/step", className)}
        {...props}
      />
    </StepContext.Provider>
  )
}

/**
 * Picks its step when pressed. A button when the Steps are interactive, a
 * plain element otherwise.
 */
function StepTrigger({
  className,
  onClick,
  children,
  "aria-label": ariaLabel,
  title,
  ...props
}: React.ComponentProps<"button">) {
  const steps = useStepsContext("StepTrigger")
  const step = useStepContext("StepTrigger")

  const shared = {
    "data-slot": "step-trigger",
    "data-state": step.state,
    "aria-current": step.index === steps.value ? ("step" as const) : undefined,
    "aria-label": ariaLabel,
    className: cn(
      "rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60",
      className
    ),
  }

  if (!steps.interactive) {
    return <div {...shared}>{children}</div>
  }

  return (
    <button
      type="button"
      title={title ?? ariaLabel}
      disabled={steps.disabled || step.disabled}
      {...shared}
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && !step.disabled) steps.selects(step.index)
      }}
    >
      {children}
    </button>
  )
}

type StepIndicatorProps = React.ComponentProps<"span"> & {
  size?: "sm" | "md"
  shape?: "circle" | "square"
}

/**
 * The marker for a step. Shows a check, cross or spinner for complete, error
 * and loading; otherwise its children, or the step number when empty.
 */
function StepIndicator({
  size = "md",
  shape = "circle",
  className,
  children,
  ...props
}: StepIndicatorProps) {
  const { index, state } = useStepContext("StepIndicator")
  const iconSize = size === "sm" ? "size-3" : "size-4"

  const content =
    state === "complete" ? (
      <CheckIcon aria-hidden className={iconSize} />
    ) : state === "error" ? (
      <XIcon aria-hidden className={iconSize} />
    ) : state === "loading" ? (
      <LoaderCircleIcon aria-hidden className={cn(iconSize, "animate-spin")} />
    ) : (
      (children ?? index + 1)
    )

  return (
    <span
      data-slot="step-indicator"
      data-state={state}
      className={cn(
        "relative z-10 flex shrink-0 items-center justify-center font-medium transition-colors",
        size === "sm" ? "size-6 text-xs" : "size-8 text-sm",
        shape === "square" ? "rounded-md" : "rounded-full",
        "data-[state=complete]:bg-primary data-[state=complete]:text-primary-foreground",
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:ring-2 data-[state=active]:ring-primary/25 data-[state=active]:ring-offset-2 data-[state=active]:ring-offset-background",
        "data-[state=upcoming]:bg-muted data-[state=upcoming]:text-muted-foreground",
        "data-[state=loading]:bg-muted data-[state=loading]:text-foreground",
        "data-[state=error]:bg-destructive data-[state=error]:text-white",
        className
      )}
      {...props}
    >
      {content}
    </span>
  )
}

function StepTitle({ className, ...props }: React.ComponentProps<"span">) {
  const { state } = useStepContext("StepTitle")

  return (
    <span
      data-slot="step-title"
      data-state={state}
      className={cn(
        "text-sm font-medium whitespace-nowrap data-[state=error]:text-destructive data-[state=upcoming]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function StepDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="step-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * The line from a step to the next one. Place it inside the Step it leaves;
 * it fills in once that step is passed.
 */
function StepSeparator({ className, ...props }: React.ComponentProps<"span">) {
  const { value, orientation } = useStepsContext("StepSeparator")
  const { index } = useStepContext("StepSeparator")

  return (
    <span
      aria-hidden
      data-slot="step-separator"
      data-state={index < value ? "complete" : "upcoming"}
      data-orientation={orientation}
      className={cn(
        "flex-1 bg-border transition-colors data-[state=complete]:bg-primary",
        orientation === "vertical" ? "min-h-4 w-px" : "h-px min-w-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Steps,
  Step,
  StepTrigger,
  StepIndicator,
  StepTitle,
  StepDescription,
  StepSeparator,
  type StepState,
  type StepsOrientation,
  type StepsProps,
  type StepProps,
  type StepIndicatorProps,
}
