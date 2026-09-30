"use client"

import { AutocompleteInput } from "@/components/standard/autocomplete-input"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersAutocompleteInputDemo() {
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
