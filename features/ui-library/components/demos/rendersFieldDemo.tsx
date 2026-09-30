"use client"

import { SearchIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import { RendersDemoCard } from "./rendersDemoCard"

export function RendersFieldDemo({
  pieceName,
}: {
  pieceName: string
}) {
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
