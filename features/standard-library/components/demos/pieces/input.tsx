"use client"

import { AtSignIcon, GlobeIcon, LockIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import { FormField } from "@/components/standard/form-field"
import { TextField } from "@/components/standard/text-field"
import {
  completeCity,
  completeEmail,
} from "@/features/standard-library/components/demos/shared/rendersTextFieldCards"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const TAKEN_USERNAMES = ["admin", "root", "jayrr"]

/**
 * Standard side of Input: TextField's inline completion and built-in
 * validation. Hook-free, so the gallery receives the individual cards.
 */
export function RendersInputDemo() {
  return (
    <>
      <RendersDemoCard label="Input">
        <TextField aria-label="Email" placeholder="Email" />
      </RendersDemoCard>
      <RendersDemoCard label="completion · Tab to accept">
        <TextField
          aria-label="Email"
          placeholder="Type sam@g"
          leading={<AtSignIcon />}
          completion={completeEmail}
        />
      </RendersDemoCard>
      <RendersDemoCard label="completion · outlined">
        <TextField variant="outlined" label="City" completion={completeCity} />
      </RendersDemoCard>
      <RendersDemoCard label="required · check on blur">
        <TextField aria-label="Full name" placeholder="Full name" required />
      </RendersDemoCard>
      <RendersDemoCard label="type email">
        <TextField
          type="email"
          aria-label="Email"
          placeholder="Type sam@ to see the check"
          validateOn="change"
        />
      </RendersDemoCard>
      <RendersDemoCard label="type url">
        <TextField
          type="url"
          aria-label="Website"
          placeholder="Type jayrr.dev"
          leading={<GlobeIcon />}
          validateOn="change"
        />
      </RendersDemoCard>
      <RendersDemoCard label="minLength · maxLength">
        <TextField
          type="password"
          aria-label="Password"
          placeholder="8 to 32 characters"
          leading={<LockIcon />}
          minLength={8}
          maxLength={32}
          revealable
          validateOn="change"
        />
      </RendersDemoCard>
      <RendersDemoCard label="pattern · custom message">
        <TextField
          aria-label="Job code"
          placeholder="AB-1234"
          pattern="[A-Z]{2}-[0-9]{4}"
          messages={{ pattern: "Use two capitals, a dash, then four digits." }}
          validateOn="change"
        />
      </RendersDemoCard>
      <RendersDemoCard label="number · min · max">
        <TextField
          type="number"
          aria-label="Crew size"
          placeholder="1 to 12, try 20"
          min={1}
          max={12}
          validateOn="change"
        />
      </RendersDemoCard>
      <RendersDemoCard label="validate · custom rule">
        <TextField
          aria-label="Username"
          placeholder="Try admin"
          validate={(value) =>
            TAKEN_USERNAMES.includes(value.toLowerCase())
              ? `${value} is taken.`
              : null
          }
          validateOn="change"
        />
      </RendersDemoCard>
      <RendersDemoCard label="error · from the server">
        <TextField
          aria-label="Invite code"
          defaultValue="JAY-2024"
          error="This invite code has expired."
        />
      </RendersDemoCard>
      <RendersDemoCard label="in a FormField">
        <FormField
          label="Work email"
          required
          helper="We'll send the invite here."
        >
          <TextField type="email" completion={completeEmail} />
        </FormField>
      </RendersDemoCard>
      <RendersDemoCard className="w-full max-w-sm" label="in a form · submit">
        <form
          className="flex w-full flex-col gap-3"
          onSubmit={(event) => event.preventDefault()}
        >
          <FormField label="Email" required>
            <TextField type="email" completion={completeEmail} />
          </FormField>
          <FormField label="Username">
            <TextField
              required
              minLength={3}
              pattern="[a-z0-9-]+"
              messages={{ pattern: "Lowercase letters, numbers and dashes." }}
            />
          </FormField>
          <div className="flex gap-2">
            <Button type="submit">Submit</Button>
            <Button type="reset" tone="outline">
              Reset
            </Button>
          </div>
        </form>
      </RendersDemoCard>
    </>
  )
}
