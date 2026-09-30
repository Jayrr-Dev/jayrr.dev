"use client"

import { useState } from "react"
import { MailIcon } from "lucide-react"

import { FormField } from "@/components/standard/form-field"
import { Select } from "@/components/standard/select"
import { TextField } from "@/components/standard/text-field"
import { Textarea } from "@/components/standard/textarea"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersFormCards() {
  const [email, setEmail] = useState("sam@")
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)

  return (
    <>
      <RendersDemoCard
        className="w-full max-w-sm"
        label="Label, helper, required"
      >
        <FormField
          label="Job number"
          required
          helper="Found on the work order."
        >
          <TextField placeholder="1001" inputMode="numeric" />
        </FormField>
      </RendersDemoCard>
      <RendersDemoCard className="w-full max-w-sm" label="Live validation">
        <FormField
          label="Email"
          required
          error={
            emailValid ? undefined : "Enter an email like name@company.com."
          }
          success={emailValid ? "Looks good." : undefined}
        >
          <TextField
            type="email"
            inputMode="email"
            autoComplete="email"
            leadingIcon={<MailIcon />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>
      </RendersDemoCard>
      <RendersDemoCard className="w-full max-w-sm" label="Password">
        <FormField label="Password" helper="At least 8 characters.">
          <TextField type="password" autoComplete="new-password" revealable />
        </FormField>
      </RendersDemoCard>
      <RendersDemoCard className="w-full max-w-sm" label="Select + textarea">
        <div className="flex w-full flex-col gap-4">
          <FormField label="Status" error="Pick a status.">
            <Select
              placeholder="Status"
              options={[
                { value: "open", label: "Open" },
                { value: "hold", label: "Hold" },
              ]}
            />
          </FormField>
          <FormField label="Notes" helper="Visible to the crew.">
            <Textarea placeholder="Anything to flag?" />
          </FormField>
        </div>
      </RendersDemoCard>
    </>
  )
}

export function RendersFormDemo() {
  return <RendersFormCards />
}
