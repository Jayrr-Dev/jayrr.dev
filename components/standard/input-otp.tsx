"use client"

import { OTPInput, type SlotProps } from "input-otp"
import { cn } from "cn"

function OtpSlot({ char, isActive }: SlotProps) {
  return (
    <div
      className={cn(
        "flex h-9 w-8 items-center justify-center rounded-md border text-sm",
        isActive ? "border-foreground" : "border-border"
      )}
    >
      {char}
    </div>
  )
}

function InputOtp({ length = 6 }: { length?: number }) {
  return (
    <OTPInput
      maxLength={length}
      containerClassName="flex gap-1"
      render={({ slots }) => (
        <div className="flex gap-1">
          {slots.map((slot, index) => (
            <OtpSlot key={index} {...slot} />
          ))}
        </div>
      )}
    />
  )
}

export { InputOtp }
