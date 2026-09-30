"use client"

import { DatePicker } from "@/components/standard/date-picker"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersDatePickerDemo() {
  return (
    <>
      <RendersDemoCard label="Date picker">
        <DatePicker
          aria-label="Date"
          defaultValue="2026-09-22"
          className="w-full"
        />
      </RendersDemoCard>
      <RendersDemoCard label="invalid">
        <DatePicker aria-label="Date" className="w-full" invalid />
      </RendersDemoCard>
    </>
  )
}
