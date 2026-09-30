"use client"

import * as React from "react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"
import {
  Step,
  StepDescription,
  StepIndicator,
  Steps,
  StepSeparator,
  StepTitle,
  StepTrigger,
  type StepState,
} from "@/components/standard/step"

type StepperStep = {
  id: string
  title?: React.ReactNode
  /** Shown under the title. */
  description?: React.ReactNode
  /** Replaces the number in the indicator. */
  icon?: React.ComponentType<{ className?: string }>
  /** Adds a red asterisk after the title. */
  required?: boolean
  /** Can't be picked from the strip. */
  disabled?: boolean
  /**
   * Overrides the state worked out from the current step. `complete` shows a
   * check, `error` a cross, `loading` a spinner.
   */
  status?: "complete" | "error" | "loading"
  /** Screen reader name. Defaults to the title, or "Step n". */
  ariaLabel?: string
}

type StepperState = StepState

/**
 * steps: indicators joined by connectors. dots: small dots, the current one
 * stretched. bar: a segmented bar under "Step 2 of 4".
 */
type StepperVariant = "steps" | "dots" | "bar"

/** `responsive` stacks vertically below the sm breakpoint. */
type StepperOrientation = "horizontal" | "vertical" | "responsive"

type StepperProps = Omit<
  React.ComponentProps<"nav">,
  "onChange" | "defaultValue"
> & {
  steps: StepperStep[]
  /** Current step index. */
  value?: number
  defaultValue?: number
  onValueChange?: (index: number) => void
  variant?: StepperVariant
  orientation?: StepperOrientation
  /** Horizontal steps only. `bottom` centres labels under each indicator. */
  labelPlacement?: "end" | "bottom"
  size?: "sm" | "md"
  shape?: "circle" | "square"
  /** Numbers in the indicators. Off shows a small dot instead. */
  showNumbers?: boolean
  hideTitles?: boolean
  hideConnectors?: boolean
  /** Lets people pick a step from the strip. */
  interactive?: boolean
  /** Keeps the strip visible but blocks picking, e.g. while saving. */
  disabled?: boolean
}

function namesStep(step: StepperStep, index: number) {
  if (step.ariaLabel) return step.ariaLabel
  return typeof step.title === "string" && step.title.trim()
    ? step.title
    : `Step ${index + 1}`
}

/**
 * Shows where someone is in a multi-step flow from a list of steps. A preset
 * of the Steps primitive in three looks; compose `Steps` directly for any
 * other layout. Pair it with your own content and buttons, or let `Wizard`
 * drive it.
 */
function Stepper({
  steps,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  variant = "steps",
  orientation = "horizontal",
  labelPlacement = "end",
  size = "md",
  shape = "circle",
  showNumbers = true,
  hideTitles = false,
  hideConnectors = false,
  interactive = true,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Progress",
  ...props
}: StepperProps) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })

  const vertical = orientation === "vertical"
  const responsive = orientation === "responsive"
  const bottom = labelPlacement === "bottom" && !vertical
  const small = size === "sm"
  const current = steps[value]

  // Shared by every Steps list, so responsive layouts stay in sync.
  const stepsProps = { value, onValueChange: setValue, interactive, disabled }

  function stepProps(step: StepperStep, index: number) {
    return { index, status: step.status, disabled: step.disabled }
  }

  function triggerProps(step: StepperStep, index: number) {
    return { "aria-label": namesStep(step, index) }
  }

  if (variant === "dots") {
    return (
      <nav
        aria-label={ariaLabel}
        data-slot="stepper"
        data-variant="dots"
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <Steps {...stepsProps} className="gap-1.5">
          {steps.map((step, index) => (
            <Step key={step.id} {...stepProps(step, index)} className="flex">
              <StepTrigger
                {...triggerProps(step, index)}
                className="group flex h-4 items-center rounded-full"
              >
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200",
                    index === value
                      ? "w-5 bg-primary"
                      : index < value
                        ? "w-1.5 bg-primary/50 group-enabled:group-hover:bg-primary/80"
                        : "w-1.5 bg-muted-foreground/30 group-enabled:group-hover:bg-muted-foreground/60",
                    step.status === "error" && "bg-destructive"
                  )}
                />
              </StepTrigger>
            </Step>
          ))}
        </Steps>
      </nav>
    )
  }

  if (variant === "bar") {
    return (
      <nav
        aria-label={ariaLabel}
        data-slot="stepper"
        data-variant="bar"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="text-muted-foreground tabular-nums">
            Step {Math.min(value + 1, steps.length)} of {steps.length}
          </span>
          {hideTitles ? null : (
            <span className="truncate font-medium">{current?.title}</span>
          )}
        </div>
        <Steps {...stepsProps} className="gap-1">
          {steps.map((step, index) => (
            <Step
              key={step.id}
              {...stepProps(step, index)}
              className="flex flex-1"
            >
              <StepTrigger
                {...triggerProps(step, index)}
                className="flex h-3 flex-1 items-center rounded-full"
              >
                <span
                  className={cn(
                    "h-1 w-full rounded-full transition-colors duration-200",
                    step.status === "error"
                      ? "bg-destructive"
                      : index <= value
                        ? "bg-primary"
                        : "bg-muted"
                  )}
                />
              </StepTrigger>
            </Step>
          ))}
        </Steps>
      </nav>
    )
  }

  const iconSize = small ? "size-3" : "size-4"
  // Half the indicator plus a little air, so connectors stop short of it.
  const connectorInset = small ? "calc(0.75rem + 0.5rem)" : "calc(1rem + 0.5rem)"

  function rendersIndicator(step: StepperStep) {
    const StepIcon = step.icon

    return (
      <StepIndicator size={size} shape={shape}>
        {StepIcon ? (
          <StepIcon className={iconSize} />
        ) : showNumbers ? undefined : (
          <span
            className={cn("rounded-full bg-current", small ? "size-1.5" : "size-2")}
          />
        )}
      </StepIndicator>
    )
  }

  function rendersLabel(step: StepperStep) {
    if (hideTitles || (!step.title && !step.description)) return null

    return (
      <span
        data-slot="stepper-label"
        className={cn(
          "flex min-w-0 flex-col",
          bottom ? "items-center text-center" : "items-start text-start",
          // Inline titles fold away on phones to save room.
          !bottom && !vertical && !responsive && step.description == null && "max-sm:hidden"
        )}
      >
        {step.title ? (
          <StepTitle className={small ? "text-xs" : undefined}>
            {step.title}
            {step.required ? (
              <span aria-hidden className="text-destructive">
                {" "}
                *
              </span>
            ) : null}
          </StepTitle>
        ) : null}
        {step.description ? (
          <StepDescription className={small ? "text-[0.6875rem]" : undefined}>
            {step.description}
          </StepDescription>
        ) : null}
      </span>
    )
  }

  // Vertical: indicator column with a line running down to the next step.
  const verticalList = (
    <Steps
      {...stepsProps}
      orientation="vertical"
      className={cn(responsive && "sm:hidden")}
    >
      {steps.map((step, index) => {
        const last = index === steps.length - 1

        return (
          <Step key={step.id} {...stepProps(step, index)} className="flex">
            <StepTrigger
              {...triggerProps(step, index)}
              className="group flex flex-1 gap-3 text-start"
            >
              <span className="flex flex-col items-center">
                {rendersIndicator(step)}
                {!last && !hideConnectors ? (
                  <StepSeparator
                    className={cn("my-1.5", small ? "min-h-4" : "min-h-6")}
                  />
                ) : null}
              </span>
              <span
                className={cn(
                  "flex min-w-0 flex-col",
                  small ? "pt-0.5" : "pt-1.5",
                  !last && (small ? "pb-4" : "pb-6")
                )}
              >
                {rendersLabel(step)}
              </span>
            </StepTrigger>
          </Step>
        )
      })}
    </Steps>
  )

  // Horizontal, labels under: equal columns, connectors bridge the centres.
  const bottomList = (
    <Steps
      {...stepsProps}
      className={cn("w-full items-stretch", responsive && "max-sm:hidden")}
    >
      {steps.map((step, index) => (
        <Step
          key={step.id}
          {...stepProps(step, index)}
          className="relative flex min-w-0 flex-1 justify-center"
        >
          {index < steps.length - 1 && !hideConnectors ? (
            <StepSeparator
              style={{
                left: `calc(50% + ${connectorInset})`,
                right: `calc(-50% + ${connectorInset})`,
              }}
              className={cn("absolute min-w-0", small ? "top-3" : "top-4")}
            />
          ) : null}
          <StepTrigger
            {...triggerProps(step, index)}
            className="group flex min-w-0 flex-col items-center gap-1.5 px-1"
          >
            {rendersIndicator(step)}
            {rendersLabel(step)}
          </StepTrigger>
        </Step>
      ))}
    </Steps>
  )

  // Horizontal, labels beside: each step stretches its connector to the next.
  const endList = (
    <Steps
      {...stepsProps}
      className={cn(
        // Scrolls sideways rather than squeezing labels when space runs out.
        "w-full overflow-x-auto p-1 [scrollbar-width:none]",
        responsive && "max-sm:hidden"
      )}
    >
      {steps.map((step, index) => {
        const connects = index < steps.length - 1 && !hideConnectors

        return (
          <Step
            key={step.id}
            {...stepProps(step, index)}
            className={cn("flex items-center", connects ? "flex-1" : "shrink-0")}
          >
            <StepTrigger
              {...triggerProps(step, index)}
              className={cn(
                "group flex shrink-0 items-center",
                small ? "gap-1.5 p-1" : "gap-2 p-1.5"
              )}
            >
              {rendersIndicator(step)}
              {rendersLabel(step)}
            </StepTrigger>
            {connects ? (
              <StepSeparator className={small ? "mx-1 min-w-3" : "mx-2"} />
            ) : null}
          </Step>
        )
      })}
    </Steps>
  )

  return (
    <nav
      aria-label={ariaLabel}
      data-slot="stepper"
      data-variant="steps"
      data-orientation={orientation}
      className={cn("w-full", className)}
      {...props}
    >
      {vertical || responsive ? verticalList : null}
      {vertical ? null : bottom ? bottomList : endList}
    </nav>
  )
}

export {
  Stepper,
  type StepperOrientation,
  type StepperProps,
  type StepperState,
  type StepperStep,
  type StepperVariant,
}
