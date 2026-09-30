"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"

type PopoverWizardStep = {
  id: string
  /** Shown in the header while this step is open. */
  title?: string
  subtitle?: React.ReactNode
  content: React.ReactNode
  /** Return false to hold the user on this step. */
  canProceed?: () => boolean
}

type PopoverWizardFooterProps = {
  stepIndex: number
  totalSteps: number
  isFirstStep: boolean
  isLastStep: boolean
  loading: boolean
  canProceed: boolean
  goNext: () => void
  goBack: () => void
  close: () => void
}

const WIDTH_CLASS = {
  sm: "w-64",
  md: "w-80",
  lg: "w-96",
  xl: "w-[28rem]",
  trigger: "w-(--radix-popover-trigger-width)",
} as const

type PopoverWizardWidth = keyof typeof WIDTH_CLASS

/**
 * Next button text. An array sets one label per step. Without one, the button
 * names the step it leads to ("Hours"), and the last step uses `completeLabel`.
 */
function resolvesNextLabel(
  nextLabel:
    | string
    | (string | undefined)[]
    | ((stepIndex: number) => string)
    | undefined,
  steps: PopoverWizardStep[],
  stepIndex: number,
  completeLabel: string
) {
  const isLastStep = stepIndex === steps.length - 1
  if (Array.isArray(nextLabel) && nextLabel[stepIndex])
    return nextLabel[stepIndex]
  if (isLastStep) return completeLabel
  if (typeof nextLabel === "function") return nextLabel(stepIndex)
  if (typeof nextLabel === "string") return nextLabel
  return steps[stepIndex + 1]?.title?.trim() || "Next"
}

/**
 * Small multi-step panel anchored to its trigger. Use it for tours, quick
 * setup and short forms that should not cover the page like a dialog.
 */
function PopoverWizard({
  steps,
  trigger = "Start",
  title,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  step: stepProp,
  onStepChange,
  onBeforeNext,
  onComplete,
  nextLabel,
  backLabel = "Back",
  completeLabel = "Got it",
  dots = true,
  jumpFromDots = false,
  showCount = false,
  headerTrailing,
  width = "md",
  side = "bottom",
  align = "start",
  sideOffset = 8,
  loading = false,
  renderFooter,
  className,
}: {
  steps: PopoverWizardStep[]
  /** The anchor. A string becomes an outline button. */
  trigger?: React.ReactNode
  /** Header title for steps that have none. */
  title?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  /** Controlled step index. */
  step?: number
  onStepChange?: (step: number) => void
  /** Runs before each advance. Return false to stay put. */
  onBeforeNext?: (stepIndex: number) => void | boolean | Promise<void | boolean>
  /** Runs when Next is pressed on the last step. The popover then closes. */
  onComplete?: () => void
  /** One string, one per step as an array, or a function of the step index. */
  nextLabel?: string | (string | undefined)[] | ((stepIndex: number) => string)
  backLabel?: string
  completeLabel?: string
  /** Step dots in the header. */
  dots?: boolean
  /** Lets a click on a dot jump to that step. */
  jumpFromDots?: boolean
  /** Shows "2 / 4" between Back and Next. */
  showCount?: boolean
  /** Sits at the end of the header row, before the close button. */
  headerTrailing?: React.ReactNode
  width?: PopoverWizardWidth
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  /** Swaps the step body for a spinner. */
  loading?: boolean
  renderFooter?: (props: PopoverWizardFooterProps) => React.ReactNode
  className?: string
}) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const [stepState, setStepState] = React.useState(0)
  const [advancing, setAdvancing] = React.useState(false)

  const open = openProp ?? openState
  const stepIndex = stepProp ?? stepState
  const setStep = onStepChange ?? setStepState

  const busy = loading || advancing
  const current = steps[stepIndex]
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === steps.length - 1
  const canProceed = current?.canProceed?.() ?? true
  const heading = current?.title ?? title
  const nextText = resolvesNextLabel(nextLabel, steps, stepIndex, completeLabel)

  function setOpen(next: boolean) {
    setOpenState(next)
    onOpenChange?.(next)
  }

  // Start fresh each time the popover closes.
  React.useEffect(() => {
    if (!open) setStepState(0)
  }, [open])

  async function goNext() {
    if (!canProceed || busy) return
    if (onBeforeNext) {
      setAdvancing(true)
      try {
        const result = await onBeforeNext(stepIndex)
        if (result === false) return
      } finally {
        setAdvancing(false)
      }
    }
    if (isLastStep) {
      onComplete?.()
      setOpen(false)
    } else {
      setStep(stepIndex + 1)
    }
  }

  function goBack() {
    if (isFirstStep || busy) return
    setStep(stepIndex - 1)
  }

  // Back is always open. Forward only when every step in between passes.
  function goTo(target: number) {
    if (busy || target === stepIndex) return
    if (target > stepIndex) {
      for (let index = stepIndex; index < target; index++) {
        if (steps[index].canProceed?.() === false) return
      }
    }
    setStep(target)
  }

  const triggerNode =
    typeof trigger === "string" ? (
      <Button tone="outline">{trigger}</Button>
    ) : (
      trigger
    )

  const dotRow =
    dots && steps.length > 1 ? (
      <div
        role="group"
        aria-label={`Step ${stepIndex + 1} of ${steps.length}`}
        className="flex shrink-0 items-center gap-0.5 pt-0.5"
      >
        {steps.map((step, index) => {
          const isActive = index === stepIndex
          const label = step.title || `Step ${index + 1}`
          const dot = (
            <span
              aria-hidden
              className={cn(
                "block size-1.5 rounded-full transition-colors",
                isActive ? "bg-foreground" : "bg-muted-foreground/40",
                jumpFromDots &&
                  !isActive &&
                  "group-hover:bg-muted-foreground/70"
              )}
            />
          )

          if (!jumpFromDots) {
            return (
              <span key={step.id} className="p-1">
                {dot}
              </span>
            )
          }
          return (
            <button
              key={step.id}
              type="button"
              title={label}
              aria-label={`Go to step ${index + 1}: ${label}`}
              aria-current={isActive ? "step" : undefined}
              onClick={() => goTo(index)}
              className="group rounded-full p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {dot}
            </button>
          )
        })}
      </div>
    ) : null

  const footer = renderFooter ? (
    renderFooter({
      stepIndex,
      totalSteps: steps.length,
      isFirstStep,
      isLastStep,
      loading: busy,
      canProceed,
      goNext: () => void goNext(),
      goBack,
      close: () => setOpen(false),
    })
  ) : (
    <div
      className={cn(
        "flex items-center gap-2",
        isFirstStep && !showCount ? "justify-end" : "justify-between"
      )}
    >
      {isFirstStep ? (
        showCount ? (
          <span />
        ) : null
      ) : (
        <Button tone="ghost" size="sm" onClick={goBack} disabled={busy}>
          <ChevronLeftIcon aria-hidden className="size-3.5" />
          {backLabel}
        </Button>
      )}
      {showCount ? (
        <span className="text-xs text-muted-foreground tabular-nums">
          {stepIndex + 1} / {steps.length}
        </span>
      ) : null}
      <Button
        size="sm"
        onClick={() => void goNext()}
        disabled={!canProceed}
        loading={advancing}
        className="min-w-0"
      >
        <span className="truncate">{nextText}</span>
        {isLastStep || advancing ? null : (
          <ChevronRightIcon aria-hidden className="size-3.5 shrink-0" />
        )}
      </Button>
    </div>
  )

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>{triggerNode}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="popover-wizard"
          data-step={current?.id}
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={16}
          aria-label={heading ?? "Wizard"}
          className={cn(
            "z-50 flex max-h-[min(85dvh,32rem)] origin-(--radix-popover-content-transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-3 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            WIDTH_CLASS[width],
            className
          )}
        >
          <div className="flex min-w-0 shrink-0 items-start gap-2">
            <div className="min-w-0 flex-1 space-y-0.5">
              {heading ? (
                <p className="text-xs leading-tight font-semibold">{heading}</p>
              ) : null}
              {current?.subtitle ? (
                <p className="text-xs leading-snug text-muted-foreground">
                  {current.subtitle}
                </p>
              ) : null}
            </div>
            {dotRow}
            {headerTrailing}
            <PopoverPrimitive.Close
              aria-label="Close"
              className="-mt-1 -mr-1 shrink-0 rounded-md p-1 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <XIcon aria-hidden className="size-3.5" />
            </PopoverPrimitive.Close>
          </div>
          <div
            data-slot="popover-wizard-body"
            className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain text-xs leading-relaxed text-muted-foreground"
          >
            {loading ? (
              <div className="flex justify-center py-6">
                <LoaderCircleIcon aria-hidden className="size-5 animate-spin" />
              </div>
            ) : (
              current?.content
            )}
          </div>
          <div className="shrink-0 border-t border-border/60 pt-2.5">
            {footer}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export {
  PopoverWizard,
  type PopoverWizardFooterProps,
  type PopoverWizardStep,
  type PopoverWizardWidth,
}
