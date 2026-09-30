"use client"

import { useState } from "react"

import { NumberInput } from "@/components/standard/number-input"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersNumberInputCard() {
  const [hours, setHours] = useState<number>(8)
  const [rate, setRate] = useState<number>(42.5)
  const [offset, setOffset] = useState<number>(-3)
  const [qty, setQty] = useState<number>(0)

  return (
    <RendersDemoCard label="Number input · commits on blur">
      <div className="grid w-full grid-cols-2 gap-3">
        <NumberInput
          label="Hours (0–24)"
          value={hours}
          onChange={setHours}
          min={0}
          max={24}
        />
        <NumberInput
          label="Rate · 2 places"
          value={rate}
          onChange={setRate}
          fractionDigits={2}
        />
        <NumberInput
          label="Offset · negative"
          value={offset}
          onChange={setOffset}
          allowNegative
        />
        <NumberInput
          label="Qty · compact"
          value={qty}
          onChange={setQty}
          placeholder="0"
          inputMode="numeric"
          compact
        />
      </div>
    </RendersDemoCard>
  )
}

function RendersNumberLiveCard() {
  const [feet, setFeet] = useState<number>(150)
  const [live, setLive] = useState<number>(150)

  return (
    <RendersDemoCard label="live while typing · seamless">
      <p className="text-sm">
        Run is
        <span className="mx-1 inline-block rounded-sm ring-1 ring-border focus-within:ring-ring">
          <NumberInput
            aria-label="Run length in feet"
            value={feet}
            onChange={(next) => {
              setFeet(next)
              setLive(next)
            }}
            onChangeImmediate={setLive}
            min={1}
            max={5000}
            seamless
            className="inline-block w-16"
          />
        </span>
        ft, about {(live * 0.3048).toFixed(1)} m.
      </p>
    </RendersDemoCard>
  )
}

function RendersNumberGroupCard() {
  const [values, setValues] = useState({ poles: 3, span: 120, sag: 1.25 })

  return (
    <RendersDemoCard label="Enter jumps to the next field">
      <div data-focus-group className="grid w-full grid-cols-3 gap-2">
        <NumberInput
          label="Poles"
          value={values.poles}
          onChange={(poles) => setValues((current) => ({ ...current, poles }))}
          min={1}
          inputMode="numeric"
          compact
        />
        <NumberInput
          label="Span ft"
          value={values.span}
          onChange={(span) => setValues((current) => ({ ...current, span }))}
          compact
        />
        <NumberInput
          label="Sag ft"
          value={values.sag}
          onChange={(sag) => setValues((current) => ({ ...current, sag }))}
          fractionDigits={3}
          compact
        />
      </div>
    </RendersDemoCard>
  )
}

export function RendersNumberInputDemo() {
  return (
    <>
      <RendersNumberInputCard />
      <RendersNumberLiveCard />
      <RendersNumberGroupCard />
    </>
  )
}
