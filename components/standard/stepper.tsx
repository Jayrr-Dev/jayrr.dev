"use client"

import * as React from "react"
import { CheckIcon, LoaderCircleIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

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

type StepperState = "complete" | "active" | "upcoming" | "error" | "loading"

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

function statesStep(step: StepperStep, index: number, value: number): StepperState {
  if (step.status) return step.status
  if (index < value) return "complete"
  return index === value ? "active" : "upcoming"
}

function namesStep(step: StepperStep, index: number) {
  if (step.ariaLabel) return step.ariaLabel
  return typeof step.title === "string" && step.title.trim()
    ? step.title
    : `Step ${index + 1}`
}

/**
 * Shows where someone is in a multi-step flow. Pair it with your own content
 * and buttons, or let `Wizard` drive it.
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

  function selects(index: number) {
    if (!interactive || disabled || steps[index]?.disabled) return
    setValue(index)
  }

  // Buttons when steps can be picked, plain elements otherwise.
  function rendersTarget(
    step: StepperStep,
    index: number,
    className: string,
    children: React.ReactNode
  ) {
    const label = namesStep(step, index)
    const shared = {
      "data-slot": "stepper-trigger",
      "data-state": statesStep(step, index, value),
      "aria-current": index === value ? ("step" as const) : undefined,
      className,
    }

    if (!interactive) {
      return (
        <div {...shared} aria-label={label}>
          {children}
        </div>
      )
    }

    return (
      <button
        {...shared}
        type="button"
        aria-label={label}
        title={label}
        disabled={disabled || step.disabled}
        onClick={() => selects(index)}
      >
        {children}
      </button>
    )
  }

  const focusRing =
    "outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"

  if (variant === "dots") {
    return (
      <nav
        aria-label={ariaLabel}
        data-slot="stepper"
        data-variant="dots"
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <ol className="flex items-center gap-1.5">
          {steps.map((step, index) => (
            <li key={step.id} className="flex">
              {rendersTarget(
                step,
                index,
                cn("group flex h-4 items-center rounded-full", focusRing),
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
              )}
            </li>
          ))}
        </ol>
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
        <ol className="flex gap-1">
          {steps.map((step, index) => (
            <li key={step.id} className="flex flex-1">
              {rendersTarget(
                step,
                index,
                cn("flex h-3 flex-1 items-center rounded-full", focusRing),
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
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }

  const indicatorSize = small ? "size-6 text-xs" : "size-8 text-sm"
  const iconSize = small ? "size-3" : "size-4"
  // Half the indicator plus a little air, so connectors stop short of it.
  const connectorInset = small ? "calc(0.75rem + 0.5rem)" : "calc(1rem + 0.5rem)"

  function rendersIndicator(step: StepperStep, index: number) {
    const state = statesStep(step, index, value)
    const StepIcon = step.icon

    return (
      <span
        data-slot="stepper-indicator"
        className={cn(
          "relative z-10 flex shrink-0 items-center justify-center font-medium transition-colors",
          indicatorSize,
          shape === "square" ? "rounded-md" : "rounded-full",
          state === "complete" && "bg-primary text-primary-foreground",
          state === "active" &&
            "bg-primary text-primary-foreground ring-2 ring-primary/25 ring-offset-2 ring-offset-background",
          state === "upcoming" && "bg-muted text-muted-foreground",
          state === "loading" && "bg-muted text-foreground",
          state === "error" && "bg-destructive text-white"
        )}
      >
        {state === "complete" ? (
          <CheckIcon aria-hidden className={iconSize} />
        ) : state === "error" ? (
          <XIcon aria-hidden className={iconSize} />
        ) : state === "loading" ? (
          <LoaderCircleIcon aria-hidden className={cn(iconSize, "animate-spin")} />
        ) : StepIcon ? (
          <StepIcon className={iconSize} />
        ) : showNumbers ? (
          index + 1
        ) : (
          <span
            className={cn("rounded-full bg-current", small ? "size-1.5" : "size-2")}
          />
        )}
      </span>
    )
  }

  function rendersLabel(step: StepperStep, index: number) {
    if (hideTitles || (!step.title && !step.description)) return null
    const state = statesStep(step, index, value)

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
          <span
            data-slot="stepper-title"
            className={cn(
              "font-medium whitespace-nowrap",
              small ? "text-xs" : "text-sm",
              state === "upcoming" && "text-muted-foreground",
              state === "error" && "text-destructive"
            )}
          >
            {step.title}
            {step.required ? (
              <span aria-hidden className="text-destructive">
                {" "}
                *
              </span>
            ) : null}
          </span>
        ) : null}
        {step.description ? (
          <span
            data-slot="stepper-description"
            className={cn(
              "text-muted-foreground",
              small ? "text-[0.6875rem]" : "text-xs"
            )}
          >
            {step.description}
          </span>
        ) : null}
      </span>
    )
  }

  function connectorColor(index: number) {
    return index < value ? "bg-primary" : "bg-border"
  }

  // Vertical: indicator column with a line running down to the next step.
  const verticalList = (
    <ol
      className={cn("flex flex-col", responsive && "sm:hidden")}
      data-orientation="vertical"
    >
      {steps.map((step, index) => {
        const last = index === steps.length - 1

        return (
          <li key={step.id} data-slot="stepper-item" className="flex">
            {rendersTarget(
              step,
              index,
              cn(
                "group flex flex-1 gap-3 rounded-md text-start",
                focusRing
              ),
              <>
                <span className="flex flex-col items-center">
                  {rendersIndicator(step, index)}
                  {!last && !hideConnectors ? (
                    <span
                      aria-hidden
                      data-slot="stepper-connector"
                      className={cn(
                        "my-1.5 w-px flex-1 transition-colors",
                        small ? "min-h-4" : "min-h-6",
                        connectorColor(index)
                      )}
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
                  {rendersLabel(step, index)}
                </span>
              </>
            )}
          </li>
        )
      })}
    </ol>
  )

  // Horizontal, labels under: equal columns, connectors bridge the centres.
  const bottomList = (
    <ol
      className={cn("flex w-full", responsive && "max-sm:hidden")}
      data-orientation="horizontal"
    >
      {steps.map((step, index) => (
        <li
          key={step.id}
          data-slot="stepper-item"
          className="relative flex min-w-0 flex-1 justify-center"
        >
          {index < steps.length - 1 && !hideConnectors ? (
            <span
              aria-hidden
              data-slot="stepper-connector"
              style={{
                left: `calc(50% + ${connectorInset})`,
                right: `calc(-50% + ${connectorInset})`,
              }}
              className={cn(
                "absolute h-px transition-colors",
                small ? "top-3" : "top-4",
                connectorColor(index)
              )}
            />
          ) : null}
          {rendersTarget(
            step,
            index,
            cn(
              "group flex min-w-0 flex-col items-center gap-1.5 rounded-md px-1",
              focusRing
            ),
            <>
              {rendersIndicator(step, index)}
              {rendersLabel(step, index)}
            </>
          )}
        </li>
      ))}
    </ol>
  )

  // Horizontal, labels beside: items in a row, connectors stretch between.
  const endList = (
    <ol
      className={cn(
        // Scrolls sideways rather than squeezing labels when space runs out.
        "flex w-full items-center overflow-x-auto p-1 [scrollbar-width:none]",
        responsive && "max-sm:hidden"
      )}
      data-orientation="horizontal"
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {index > 0 && !hideConnectors ? (
            <li
              aria-hidden
              data-slot="stepper-connector"
              className={cn(
                "h-px flex-1 transition-colors",
                small ? "mx-1 min-w-3" : "mx-2 min-w-4",
                connectorColor(index - 1)
              )}
            />
          ) : null}
          <li data-slot="stepper-item" className="flex shrink-0">
            {rendersTarget(
              step,
              index,
              cn(
                "group flex items-center rounded-md",
                small ? "gap-1.5 p-1" : "gap-2 p-1.5",
                focusRing
              ),
              <>
                {rendersIndicator(step, index)}
                {rendersLabel(step, index)}
              </>
            )}
          </li>
        </React.Fragment>
      ))}
    </ol>
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
