"use client"

import { AtSignIcon, CircleCheckIcon, SearchIcon } from "lucide-react"

import { TextField } from "@/components/standard/text-field"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"
import {
  completeFrom,
  type CompletionSource,
} from "@/hooks/use-inline-completion"

const EMAIL_DOMAINS = ["gmail.com", "hotmail.com", "icloud.com", "outlook.com"]

/** Completes the part after "@" against common mail domains. */
export const completeEmail: CompletionSource = (value) => {
  const at = value.lastIndexOf("@")
  if (at < 1) {
    return null
  }
  const typed = value.slice(at + 1).toLowerCase()
  const domain = EMAIL_DOMAINS.find(
    (option) => option.startsWith(typed) && option.length > typed.length
  )
  return domain ? value.slice(0, at + 1) + domain : null
}

export const completeCity = completeFrom([
  "Amsterdam",
  "Barcelona",
  "Berlin",
  "Lisbon",
  "London",
  "Los Angeles",
  "Manila",
  "Melbourne",
  "New York",
  "San Francisco",
  "Seoul",
  "Singapore",
  "Tokyo",
])

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
          leading={<SearchIcon />}
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
          leading={<SearchIcon />}
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
      <RendersDemoCard label="leading · trailing">
        <TextField
          aria-label="Username"
          placeholder="username"
          leading={<AtSignIcon />}
          trailing={<CircleCheckIcon className="size-4 text-emerald-600" />}
          defaultValue="sam"
        />
      </RendersDemoCard>
      <RendersDemoCard label="prefix $">
        <TextField
          aria-label="Price"
          inputMode="decimal"
          prefix="$"
          defaultValue="1,250.00"
        />
      </RendersDemoCard>
      <RendersDemoCard label="suffix ft">
        <TextField
          aria-label="Run length"
          inputMode="decimal"
          suffix="ft"
          defaultValue="120"
        />
      </RendersDemoCard>
      <RendersDemoCard label="prefix · suffix">
        <TextField
          aria-label="Site"
          prefix="https://"
          suffix=".com"
          defaultValue="jayrr"
        />
      </RendersDemoCard>
      <RendersDemoCard label="type search">
        <TextField
          type="search"
          aria-label="Search jobs"
          placeholder="Search jobs"
          defaultValue="Main st"
        />
      </RendersDemoCard>
      <RendersDemoCard label="shortcut">
        <TextField
          type="search"
          aria-label="Search"
          placeholder="Search"
          shortcut="⌘K"
        />
      </RendersDemoCard>
      <RendersDemoCard label="align end">
        <TextField
          aria-label="Quantity"
          inputMode="decimal"
          align="end"
          suffix="ea"
          defaultValue="1,024"
        />
      </RendersDemoCard>
      <RendersDemoCard label="loading">
        <TextField
          aria-label="Address"
          placeholder="Looking up address…"
          defaultValue="42 Main st"
          loading
        />
      </RendersDemoCard>
      <RendersDemoCard label="filled · prefix · suffix">
        <TextField
          variant="filled"
          label="Budget"
          prefix="$"
          suffix="USD"
          defaultValue="4,800"
        />
      </RendersDemoCard>
      <RendersDemoCard label="outlined · type search">
        <TextField variant="outlined" label="Search" type="search" />
      </RendersDemoCard>
      <RendersDemoCard label="completion (Tab to accept)">
        <TextField
          aria-label="Email"
          placeholder="you@gmail.com"
          leading={<AtSignIcon />}
          completion={completeEmail}
        />
      </RendersDemoCard>
      <RendersDemoCard label="outlined · completion">
        <TextField variant="outlined" label="City" completion={completeCity} />
      </RendersDemoCard>
    </>
  )
}
