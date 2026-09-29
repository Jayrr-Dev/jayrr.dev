"use client"

import * as React from "react"
import { OTPInput, type SlotProps } from "input-otp"
import { cn } from "cn"

function OtpSlot({
  char,
  isActive,
  hasFakeCaret,
  invalid,
}: SlotProps & { invalid: boolean }) {
  return (
    <div
      className={cn(
        "relative flex h-9 w-8 items-center justify-center rounded-md border border-input text-base transition-shadow md:text-sm dark:bg-input/30",
        isActive && "border-ring ring-3 ring-ring/50",
        invalid && "border-destructive",
        invalid && isActive && "ring-destructive/20 dark:ring-destructive/40"
      )}
    >
      {char}
      {hasFakeCaret ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="h-4 w-px animate-pulse bg-foreground" />
        </span>
      ) : null}
    </div>
  )
}

type InputOtpProps = Omit<
  React.ComponentProps<typeof OTPInput>,
  "maxLength" | "render" | "children"
> & {
  length?: number
  /** Shows the error style. Same as passing aria-invalid. */
  invalid?: boolean
}

function InputOtp({
  length = 6,
  invalid,
  containerClassName,
  value,
  defaultValue,
  onChange,
  ...props
}: InputOtpProps) {
  const isInvalid = Boolean(invalid || props["aria-invalid"])
  // input-otp forwards defaultValue to the <input> next to value, which React
  // rejects, so defaultValue is kept here as local state instead.
  const [uncontrolled, setUncontrolled] = React.useState(
    typeof defaultValue === "string" ? defaultValue : ""
  )

  return (
    <OTPInput
      aria-label={
        props["aria-labelledby"] ? undefined : `${length}-digit code`
      }
      {...props}
      value={value ?? uncontrolled}
      onChange={(next) => {
        setUncontrolled(next)
        onChange?.(next)
      }}
      aria-invalid={isInvalid || undefined}
      maxLength={length}
      containerClassName={cn(
        "flex gap-1 has-disabled:cursor-not-allowed has-disabled:opacity-50",
        containerClassName
      )}
      render={({ slots }) => (
        <div data-slot="input-otp" className="flex gap-1">
          {slots.map((slot, index) => (
            <OtpSlot key={index} {...slot} invalid={isInvalid} />
          ))}
        </div>
      )}
    />
  )
}

export { InputOtp }
export type { InputOtpProps }
