"use client"

import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"

import { RendersDemoCard } from "./rendersDemoCard"

export function RendersFieldDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Text field") {
    return (
      <>
        <RendersDemoCard>
          <Input placeholder="Name" />
        </RendersDemoCard>
        <RendersDemoCard>
          <Textarea placeholder="Notes" />
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Search") {
    return (
      <RendersDemoCard>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search pieces" />
        </InputGroup>
      </RendersDemoCard>
    )
  }

  return null
}
