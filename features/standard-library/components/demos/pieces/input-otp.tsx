"use client"

import { InputOtp } from "@/components/standard/input-otp"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersInputOtpDemo() {
  return (
    <>
      <RendersDemoCard label="Input otp">
        <InputOtp />
      </RendersDemoCard>
      <RendersDemoCard label="invalid">
        <InputOtp invalid defaultValue="123" />
      </RendersDemoCard>
    </>
  )
}
