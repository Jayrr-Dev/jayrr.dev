"use client"

import { useEffect, useState } from "react"
import { MailIcon, SearchIcon } from "lucide-react"

import { AutocompleteInput } from "@/components/standard/autocomplete-input"
import { FieldLabel } from "@/components/standard/field-label"
import { Select } from "@/components/standard/select"
import { FormField } from "@/components/standard/form-field"
import { ImageUpload } from "@/components/standard/image-upload"
import { InputOtp } from "@/components/standard/input-otp"
import { NumberInput } from "@/components/standard/number-input"
import { Search } from "@/components/standard/search"
import { Stack } from "@/components/standard/stack"
import { LexicalEditor } from "@/components/standard/lexical-editor"
import { LabelledSwitch } from "@/components/standard/switch"
import { Textarea } from "@/components/standard/textarea"
import { TextField } from "@/components/standard/text-field"
import { RendersNotBuiltDemo } from "@/features/standard-library/components/demos/rendersNotBuiltDemo"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const NOT_BUILT = new Set<string>()

const SAMPLE_NOTES = `## Site walk notes

Crew arrived **on time**. Main floor framing is *complete*; waiting on the \`east wall\` inspection.

- Order extra drywall
- Confirm electrician for Friday

> Keep the loading dock clear after 3pm.`

const SAMPLE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><rect width="96" height="96" fill="url(#g)"/><circle cx="68" cy="30" r="10" fill="#fde68a"/><path d="M0 80 L32 48 L56 70 L72 56 L96 78 V96 H0Z" fill="#1e1b4b" opacity=".55"/></svg>`
)}`

function RendersUploadProgressDemo() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((current) => (current >= 100 ? 0 : current + 5))
    }, 300)
    return () => clearInterval(timer)
  }, [])

  return (
    <RendersDemoCard label="Uploading">
      <ImageUpload
        label="Cover image"
        defaultPreview={SAMPLE_IMAGE}
        progress={progress}
      />
    </RendersDemoCard>
  )
}

function RendersNumberInputDemo() {
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

function RendersNumberLiveDemo() {
  const [feet, setFeet] = useState<number>(150)
  const [live, setLive] = useState<number>(150)

  return (
    <RendersDemoCard label="live while typing · seamless">
      <p className="text-sm">
        Run is
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
          className="mx-1 inline-block w-16 ring-1 ring-border focus-visible:ring-ring"
        />
        ft, about {(live * 0.3048).toFixed(1)} m.
      </p>
    </RendersDemoCard>
  )
}

function RendersNumberGroupDemo() {
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

function RendersFormDemo() {
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

export function RendersStandardFieldDemo({ pieceName }: { pieceName: string }) {
  if (NOT_BUILT.has(pieceName)) {
    return <RendersNotBuiltDemo pieceName={pieceName} />
  }

  if (pieceName === "Form") {
    return <RendersFormDemo />
  }

  if (pieceName === "Lexical Editor") {
    return (
      <>
        <RendersDemoCard label="Empty">
          <LexicalEditor />
        </RendersDemoCard>
        <RendersDemoCard label="With content">
          <LexicalEditor defaultValue={SAMPLE_NOTES} />
        </RendersDemoCard>
        <RendersDemoCard label="Read only">
          <LexicalEditor
            defaultValue={SAMPLE_NOTES}
            editable={false}
            toolbar={false}
            contentClassName="min-h-0"
          />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Number Input") {
    return (
      <>
        <RendersNumberInputDemo />
        <RendersNumberLiveDemo />
        <RendersNumberGroupDemo />
      </>
    )
  }

  if (pieceName === "Autocomplete Input") {
    return (
      <RendersDemoCard label="Autocomplete">
        <AutocompleteInput
          aria-label="Project"
          placeholder="Project"
          options={["Alpha", "Bravo", "Charlie"]}
          clearable
        />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Standard Search") {
    return (
      <>
        <RendersDemoCard label="Search">
          <Search placeholder="Search pieces" />
        </RendersDemoCard>
        <RendersDemoCard label="clearable">
          <Search placeholder="Search pieces" defaultValue="button" clearable />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Textarea") {
    return (
      <>
        <RendersDemoCard label="Textarea">
          <Textarea aria-label="Notes" placeholder="Notes" />
        </RendersDemoCard>
        <RendersDemoCard label="invalid">
          <Textarea aria-label="Notes" placeholder="Notes" invalid />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Label" || pieceName === "Icon Tooltip Label") {
    return (
      <RendersDemoCard label="Field label">
        <Stack className="w-full">
          <FieldLabel htmlFor="job" required>
            Job
          </FieldLabel>
          <TextField id="job" placeholder="1001" />
        </Stack>
      </RendersDemoCard>
    )
  }

  if (pieceName === "Labelled Switch") {
    return (
      <RendersDemoCard label="Labelled switch">
        <LabelledSwitch label="Wrap text" defaultChecked />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Input OTP") {
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

  if (pieceName === "Image Upload") {
    return (
      <>
        <RendersDemoCard label="Dropzone">
          <ImageUpload label="Cover image" />
        </RendersDemoCard>
        <RendersDemoCard label="With image">
          <ImageUpload label="Cover image" defaultPreview={SAMPLE_IMAGE} />
        </RendersDemoCard>
        <RendersDemoCard label="Avatar">
          <ImageUpload label="Profile photo" variant="avatar" maxSizeMb={2} />
        </RendersDemoCard>
        <RendersDemoCard label="Avatar with image">
          <ImageUpload
            label="Profile photo"
            variant="avatar"
            maxSizeMb={2}
            defaultPreview={SAMPLE_IMAGE}
          />
        </RendersDemoCard>
        <RendersUploadProgressDemo />
        <RendersDemoCard label="Disabled">
          <ImageUpload label="Cover image" disabled />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Input Select") {
    return (
      <RendersDemoCard label="Filter select">
        <Select
          placeholder="Status"
          options={[
            { value: "open", label: "Open" },
            { value: "hold", label: "Hold" },
          ]}
        />
      </RendersDemoCard>
    )
  }

  return (
    <>
      <RendersDemoCard label="Text field">
        <TextField aria-label="Job number" placeholder="Job number" />
      </RendersDemoCard>
      <RendersDemoCard label="leading icon · clearable">
        <TextField
          aria-label="Filter"
          placeholder="Filter jobs"
          leadingIcon={<SearchIcon />}
          defaultValue="Main st"
          clearable
        />
      </RendersDemoCard>
      <RendersDemoCard label="password · revealable">
        <TextField
          aria-label="Password"
          type="password"
          defaultValue="hunter22"
          revealable
        />
      </RendersDemoCard>
      <RendersDemoCard label="invalid">
        <TextField aria-label="Job number" defaultValue="10O1" invalid />
      </RendersDemoCard>
      <RendersDemoCard label="filled">
        <TextField variant="filled" label="Job number" />
      </RendersDemoCard>
      <RendersDemoCard label="filled · leading icon · clearable">
        <TextField
          variant="filled"
          label="Filter"
          placeholder="Street, customer…"
          leadingIcon={<SearchIcon />}
          defaultValue="Main st"
          clearable
        />
      </RendersDemoCard>
      <RendersDemoCard label="outlined">
        <TextField variant="outlined" label="Job number" />
      </RendersDemoCard>
      <RendersDemoCard label="outlined · password · invalid">
        <TextField
          variant="outlined"
          label="Password"
          type="password"
          defaultValue="hunter22"
          revealable
          invalid
        />
      </RendersDemoCard>
    </>
  )
}
