"use client"

import { useState } from "react"

import { FormField } from "@/components/standard/form-field"
import {
  isValidPhoneNumber,
  PhoneInput,
} from "@/components/standard/phone-input"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersPhoneInputCard() {
  const [phone, setPhone] = useState<string | undefined>()

  return (
    <RendersDemoCard label="Phone input · E.164 out">
      <div className="flex w-full flex-col gap-2">
        <PhoneInput
          label="Contact number"
          placeholder="Enter contact number"
          defaultCountry="US"
          value={phone}
          onChange={setPhone}
        />
        <p className="text-xs text-muted-foreground tabular-nums">
          value: {phone ?? "undefined"}
        </p>
      </div>
    </RendersDemoCard>
  )
}

function RendersPhoneSizesCard() {
  const [small, setSmall] = useState<string | undefined>()
  const [large, setLarge] = useState<string | undefined>()
  const [pill, setPill] = useState<string | undefined>()

  return (
    <RendersDemoCard label="sizes · pill">
      <div className="flex w-full flex-col gap-3">
        <PhoneInput
          size="sm"
          placeholder="Small"
          defaultCountry="US"
          value={small}
          onChange={setSmall}
        />
        <PhoneInput
          size="lg"
          placeholder="Large"
          defaultCountry="GB"
          value={large}
          onChange={setLarge}
        />
        <PhoneInput
          shape="pill"
          placeholder="Pill"
          defaultCountry="PH"
          value={pill}
          onChange={setPill}
        />
      </div>
    </RendersDemoCard>
  )
}

function RendersPhoneStatesCard() {
  const [phone, setPhone] = useState<string | undefined>("+1212555123")
  const error =
    phone && !isValidPhoneNumber(phone)
      ? "Please enter a valid phone number."
      : undefined

  return (
    <RendersDemoCard label="validation · disabled · read-only">
      <div className="flex w-full flex-col gap-3">
        <FormField
          label="Mobile"
          helper="We'll never share your number."
          error={error}
          success={phone && !error ? "Looks good." : undefined}
        >
          <PhoneInput defaultCountry="US" value={phone} onChange={setPhone} />
        </FormField>
        <PhoneInput
          label="Disabled"
          placeholder="Enter contact number"
          defaultCountry="US"
          disabled
        />
        <PhoneInput label="Read-only" value="+12125551234" readOnly />
      </div>
    </RendersDemoCard>
  )
}

export function RendersPhoneInputDemo() {
  return (
    <>
      <RendersPhoneInputCard />
      <RendersPhoneSizesCard />
      <RendersPhoneStatesCard />
    </>
  )
}
