"use client"

import { AutocompleteInput } from "@/components/standard/autocomplete-input"
import { FieldLabel } from "@/components/standard/field-label"
import { FilterSelect } from "@/components/standard/filter-select"
import { ImageUpload } from "@/components/standard/image-upload"
import { InputOtp } from "@/components/standard/input-otp"
import { Search } from "@/components/standard/search"
import { Stack } from "@/components/standard/stack"
import { LabelledSwitch } from "@/components/standard/switch"
import { Textarea } from "@/components/standard/textarea"
import { TextField } from "@/components/standard/text-field"
import { RendersNotBuiltDemo } from "@/features/standard-library/components/demos/rendersNotBuiltDemo"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const NOT_BUILT = new Set(["Lexical Editor", "Form"])

export function RendersStandardFieldDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (NOT_BUILT.has(pieceName)) {
    return <RendersNotBuiltDemo pieceName={pieceName} />
  }

  if (pieceName === "Autocomplete Input") {
    return (
      <RendersDemoCard label="Autocomplete">
        <AutocompleteInput
          placeholder="Project"
          options={["Alpha", "Bravo", "Charlie"]}
        />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Standard Search") {
    return (
      <RendersDemoCard label="Search">
        <Search placeholder="Search pieces" />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Textarea") {
    return (
      <RendersDemoCard label="Textarea">
        <Textarea placeholder="Notes" />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Label" || pieceName === "Icon Tooltip Label") {
    return (
      <RendersDemoCard label="Field label">
        <Stack className="w-full">
          <FieldLabel htmlFor="job">Job</FieldLabel>
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

  if (pieceName === "Input Otp") {
    return (
      <RendersDemoCard label="Input otp">
        <InputOtp />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Image Upload") {
    return (
      <RendersDemoCard label="Image upload">
        <ImageUpload />
      </RendersDemoCard>
    )
  }

  if (pieceName === "Input Select") {
    return (
      <RendersDemoCard label="Filter select">
        <FilterSelect
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
    <RendersDemoCard label="Text field">
      <TextField placeholder="Job number" />
    </RendersDemoCard>
  )
}
