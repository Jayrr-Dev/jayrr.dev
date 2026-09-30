"use client"

import { useState } from "react"
import { CreditCardIcon, PhoneIcon } from "lucide-react"

import { InputFill, inputFillPresets } from "@/components/standard/input-fill"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersInputFillPresetsCard() {
  return (
    <RendersDemoCard label="Presets · the template fills in as you type">
      <div className="grid w-full grid-cols-2 gap-3">
        <InputFill
          {...inputFillPresets.phone}
          aria-label="Phone"
          leading={<PhoneIcon />}
        />
        <InputFill {...inputFillPresets.date} aria-label="Date" />
        <InputFill {...inputFillPresets.time} aria-label="Time" />
        <InputFill {...inputFillPresets.zip} aria-label="Zip code" />
        <InputFill
          {...inputFillPresets.card}
          aria-label="Card number"
          leading={<CreditCardIcon />}
          containerClassName="col-span-2"
        />
      </div>
    </RendersDemoCard>
  )
}

function RendersInputFillCustomCard() {
  const [code, setCode] = useState("")
  const [raw, setRaw] = useState("")
  const [complete, setComplete] = useState(false)

  return (
    <RendersDemoCard label="Custom mask · raw value and completion">
      <div className="flex w-full flex-col gap-2">
        <InputFill
          mask="INV-AAA-9999"
          template="INV-XXX-0000"
          aria-label="Invoice code"
          value={code}
          onValueChange={(next, details) => {
            setCode(next)
            setRaw(details.raw)
            setComplete(details.complete)
          }}
          invalid={code.length > 0 && !complete}
        />
        <p className="text-xs text-muted-foreground tabular-nums">
          raw: <span className="text-foreground">{raw || "—"}</span> ·{" "}
          {complete ? "complete" : "incomplete"}
        </p>
      </div>
    </RendersDemoCard>
  )
}

function RendersInputFillVariantsCard() {
  return (
    <RendersDemoCard label="Filled and outlined · floating label">
      <div className="grid w-full grid-cols-2 gap-3">
        <InputFill
          {...inputFillPresets.expiry}
          variant="filled"
          label="Expiry"
        />
        <InputFill
          {...inputFillPresets.postal}
          variant="outlined"
          label="Postal code"
        />
      </div>
    </RendersDemoCard>
  )
}

export function RendersInputFillDemo() {
  return (
    <>
      <RendersInputFillPresetsCard />
      <RendersInputFillCustomCard />
      <RendersInputFillVariantsCard />
    </>
  )
}
