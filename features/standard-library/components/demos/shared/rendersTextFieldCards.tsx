"use client"

import { SearchIcon } from "lucide-react"

import { TextField } from "@/components/standard/text-field"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

/**
 * The TextField cards shared by Text field and Field. Hook-free: call it as a
 * function so the gallery receives the individual cards.
 */
export function RendersTextFieldCards() {
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
