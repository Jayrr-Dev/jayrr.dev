"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/standard/button"
import { Stepper } from "@/components/standard/stepper"
import { useIsMobile } from "@/hooks/use-mobile"

type WizardStep = {
  id: string
  title: string
  /** Read out as the step's label. Not shown in the strip. */
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  content: React.ReactNode
  /** Return false to hold the user on this step. */
  canProceed?: () => boolean
  /** Adds a red asterisk after the title in the strip. */
  required?: boolean
}

type WizardFooterProps = {
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

const MAX_WIDTH_CLASS = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  "5xl": "sm:max-w-5xl",
} as const

type WizardMaxWidth = keyof typeof MAX_WIDTH_CLASS

/**
 * How progress shows under the title, drawn by `Stepper`.
 * steps: numbered circles with titles. dots: small dots, the current one
 * stretched. bar: a segmented bar with "Step 2 of 4". none: no progress.
 */
type WizardIndicator = "steps" | "dots" | "bar" | "none"

/** How far the panel can be dragged, as a share of the smaller viewport side. */
const DRAG_LIMIT = 0.42

/** Keeps a dragged panel's offset, clamped so it stays on screen. */
function useWizardDrag(enabled: boolean) {
  const [offset, setOffset] = React.useState({ x: 0, y: 0 })
  const session = React.useRef<{
    pointerId: number
    originX: number
    originY: number
    startX: number
    startY: number
  } | null>(null)

  const reset = React.useCallback(() => setOffset({ x: 0, y: 0 }), [])

  const handlers = {
    onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
      if (!enabled || event.button !== 0) return
      const target = event.target as HTMLElement
      if (
        target.closest("button, a, input, textarea, select, [role='button']")
      ) {
        return
      }
      event.preventDefault()
      session.current = {
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        startX: offset.x,
        startY: offset.y,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
      const drag = session.current
      if (!drag || event.pointerId !== drag.pointerId) return
      const max = Math.min(window.innerWidth, window.innerHeight) * DRAG_LIMIT
      const clamp = (value: number) => Math.min(max, Math.max(-max, value))
      setOffset({
        x: clamp(drag.startX + event.clientX - drag.originX),
        y: clamp(drag.startY + event.clientY - drag.originY),
      })
    },
    onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
      const drag = session.current
      if (!drag || event.pointerId !== drag.pointerId) return
      session.current = null
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    },
  }

  return {
    offset,
    reset,
    handlers: { ...handlers, onPointerCancel: handlers.onPointerUp },
  }
}

/** Picks the next button text for a step. Arrays can also set the last step's. */
function resolvesNextLabel(
  nextLabel: string | (string | undefined)[] | ((stepIndex: number) => string),
  stepIndex: number,
  isLastStep: boolean,
  completeLabel: string
) {
  if (Array.isArray(nextLabel)) {
    return nextLabel[stepIndex] ?? (isLastStep ? completeLabel : "Continue")
  }
  if (isLastStep) return completeLabel
  return typeof nextLabel === "function" ? nextLabel(stepIndex) : nextLabel
}

/**
 * Multi-step form in a dialog. On phones it opens as a bottom sheet.
 * Each step can block Continue with `canProceed`, and `onBeforeNext` can
 * run async work (save, validate) before the wizard moves on.
 */
function Wizard({
  steps,
  title = "Wizard",
  description,
  trigger = "Start",
  headerAccessory,
  open: openProp,
  onOpenChange,
  step: stepProp,
  onStepChange,
  onBeforeNext,
  onComplete,
  nextLabel = "Continue",
  backLabel = "Back",
  cancelLabel = "Cancel",
  completeLabel = "Complete",
  indicator = "steps",
  divided = true,
  showStepNumbers = true,
  hideStepTitles = false,
  hideConnectors = false,
  compact = false,
  allowStepClick = true,
  maxWidth = "2xl",
  loading = false,
  preventDismiss = false,
  draggable = false,
  renderFooter,
  className,
  contentClassName,
}: {
  steps: WizardStep[]
  title?: React.ReactNode
  /** Screen reader text for the dialog. */
  description?: string
  /** Button that opens the wizard. Pass null to open it only from `open`. */
  trigger?: React.ReactNode
  /** Sits beside the title, like an info icon. */
  headerAccessory?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Controlled step index. */
  step?: number
  onStepChange?: (step: number) => void
  /** Runs before each advance. Return false to stay put. */
  onBeforeNext?: (stepIndex: number) => void | boolean | Promise<void | boolean>
  /** Runs when Continue is pressed on the last step. */
  onComplete?: () => void
  /**
   * Next button text. Pass an array for one label per step, e.g.
   * ["Pick hours", "Review", "Save"]. An entry for the last step replaces
   * `completeLabel`; missing entries fall back to the defaults.
   */
  nextLabel?: string | (string | undefined)[] | ((stepIndex: number) => string)
  backLabel?: string
  cancelLabel?: string
  completeLabel?: string
  indicator?: WizardIndicator
  /** Lines between the header, progress, body and footer. Off for a cleaner panel. */
  divided?: boolean
  showStepNumbers?: boolean
  hideStepTitles?: boolean
  hideConnectors?: boolean
  /** Smaller strip for six or more steps. */
  compact?: boolean
  allowStepClick?: boolean
  /** Desktop width. Pass a function to widen one step. */
  maxWidth?: WizardMaxWidth | ((stepIndex: number) => WizardMaxWidth)
  loading?: boolean
  /** Blocks Escape, outside click and the close button on the given steps. */
  preventDismiss?: boolean | ((stepIndex: number) => boolean)
  /** Lets the desktop panel be dragged by its header. */
  draggable?: boolean
  renderFooter?: (props: WizardFooterProps) => React.ReactNode
  className?: string
  contentClassName?: string
}) {
  const isMobile = useIsMobile()
  const [openState, setOpenState] = React.useState(false)
  const [stepState, setStepState] = React.useState(0)
  const [advancing, setAdvancing] = React.useState(false)

  const open = openProp ?? openState
  const stepIndex = stepProp ?? stepState
  const setStep = onStepChange ?? setStepState

  const canDrag = draggable && !isMobile
  const drag = useWizardDrag(canDrag)
  const resetDrag = drag.reset

  const busy = loading || advancing
  const current = steps[stepIndex]
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === steps.length - 1
  const canProceed = current?.canProceed?.() ?? true
  const locked =
    typeof preventDismiss === "function"
      ? preventDismiss(stepIndex)
      : preventDismiss
  const width = typeof maxWidth === "function" ? maxWidth(stepIndex) : maxWidth
  const nextText = resolvesNextLabel(
    nextLabel,
    stepIndex,
    isLastStep,
    completeLabel
  )

  function setOpen(next: boolean) {
    if (!next && locked) return
    setOpenState(next)
    onOpenChange?.(next)
  }

  // Start fresh each time the wizard closes.
  React.useEffect(() => {
    if (!open) {
      setStepState(0)
      resetDrag()
    }
  }, [open, resetDrag])

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
      // Uncontrolled wizards close themselves; controlled ones leave it to the caller.
      if (openProp === undefined) setOpenState(false)
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
    if (!allowStepClick || busy || target === stepIndex) return
    if (target > stepIndex) {
      for (let index = stepIndex; index < target; index++) {
        if (steps[index].canProceed?.() === false) return
      }
    }
    setStep(target)
  }

  const strip =
    indicator === "none" ? null : (
      <Stepper
        data-slot="wizard-steps"
        steps={steps.map((step, index) => ({
          id: step.id,
          title: step.title.trim() ? step.title : undefined,
          icon: step.icon,
          required: step.required,
          ariaLabel:
            step.description?.trim() || step.title || `Step ${index + 1}`,
        }))}
        value={stepIndex}
        onValueChange={goTo}
        variant={indicator}
        size={compact ? "sm" : "md"}
        showNumbers={showStepNumbers}
        hideTitles={hideStepTitles}
        hideConnectors={hideConnectors}
        interactive={allowStepClick}
        disabled={busy}
        className={cn(
          "shrink-0 px-4 pb-3",
          divided && "border-b border-border"
        )}
      />
    )

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
    <div className="flex items-center justify-between gap-2">
      <Button
        tone="outline"
        onClick={isFirstStep ? () => setOpen(false) : goBack}
        disabled={busy || (isFirstStep && locked)}
      >
        {isFirstStep ? (
          cancelLabel
        ) : (
          <>
            <ChevronLeftIcon aria-hidden className="size-4" />
            {backLabel}
          </>
        )}
      </Button>
      <Button
        onClick={() => void goNext()}
        disabled={!canProceed}
        loading={busy}
      >
        {nextText}
        {isLastStep || busy ? null : (
          <ChevronRightIcon aria-hidden className="size-4" />
        )}
      </Button>
    </div>
  )

  const triggerNode =
    typeof trigger === "string" ? (
      <Button tone="outline">{trigger}</Button>
    ) : (
      trigger
    )

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      {triggerNode ? (
        <DialogPrimitive.Trigger asChild>{triggerNode}</DialogPrimitive.Trigger>
      ) : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content
          data-slot="wizard"
          data-step={current?.id}
          onInteractOutside={(event) => {
            if (locked) event.preventDefault()
          }}
          onEscapeKeyDown={(event) => {
            if (locked) event.preventDefault()
          }}
          style={
            canDrag
              ? {
                  translate: `calc(-50% + ${drag.offset.x}px) calc(-50% + ${drag.offset.y}px)`,
                }
              : undefined
          }
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden border border-border bg-background text-foreground shadow-lg outline-none",
            isMobile
              ? "inset-x-0 bottom-0 h-[80vh] rounded-t-2xl border-b-0"
              : cn(
                  "top-1/2 left-1/2 max-h-[90vh] w-[calc(100%-2rem)] rounded-xl",
                  canDrag ? null : "-translate-x-1/2 -translate-y-1/2",
                  MAX_WIDTH_CLASS[width]
                ),
            className
          )}
        >
          <div
            data-slot="wizard-header"
            className={cn(
              "flex shrink-0 items-center gap-2 px-4 pt-4 pb-3",
              canDrag &&
                "cursor-grab touch-none select-none active:cursor-grabbing"
            )}
            {...(canDrag ? drag.handlers : null)}
          >
            <DialogPrimitive.Title className="min-w-0 truncate text-base font-semibold">
              {title}
            </DialogPrimitive.Title>
            {headerAccessory}
            <DialogPrimitive.Description className="sr-only">
              {description ?? (typeof title === "string" ? title : "Wizard")}
            </DialogPrimitive.Description>
            {locked ? null : (
              <DialogPrimitive.Close asChild>
                <Button
                  tone="ghost"
                  size="sm"
                  aria-label="Close"
                  className="ml-auto size-7 px-0"
                >
                  <XIcon aria-hidden className="size-4" />
                </Button>
              </DialogPrimitive.Close>
            )}
          </div>
          {strip}
          <div
            data-slot="wizard-content"
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-4 pt-4",
              contentClassName
            )}
          >
            {current?.content}
          </div>
          <footer
            className={cn(
              "shrink-0 px-4 pb-4",
              divided ? "mt-4 border-t border-border pt-3" : "pt-5"
            )}
          >
            {footer}
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export {
  Wizard,
  type WizardFooterProps,
  type WizardIndicator,
  type WizardMaxWidth,
  type WizardStep,
}
