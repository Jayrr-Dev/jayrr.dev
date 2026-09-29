"use client"

import { useState } from "react"
import {
  RefreshCwIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/standard/button"
import { ButtonArray } from "@/components/standard/button-array"
import { ButtonIcon } from "@/components/standard/button-icon"
import { ButtonBack, ButtonLink } from "@/components/standard/button-link"
import { CaptionButton, CaptionsArray } from "@/components/standard/caption-button"
import { CircleBadge } from "@/components/standard/badge-pill"
import { RefreshButton } from "@/components/standard/refresh-button"
import { StandardText } from "@/components/standard/accordion"
import { Symbol } from "@/components/standard/symbol"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const SECTION_ITEMS = [
  { id: "events", label: "Events" },
  { id: "reports", label: "Reports" },
  { id: "crew", label: "Crew" },
]

const REFRESH_SPIN_MS = 1000

function RendersRefreshButtonSpinDemo({
  iconOnly = false,
  disabled = false,
  label,
}: {
  iconOnly?: boolean
  disabled?: boolean
  label?: string
}) {
  const [refreshing, setRefreshing] = useState(false)

  function handleClick() {
    if (refreshing || disabled) {
      return
    }
    setRefreshing(true)
    window.setTimeout(() => {
      setRefreshing(false)
    }, REFRESH_SPIN_MS)
  }

  return (
    <RendersDemoCard label={label}>
      <RefreshButton
        iconOnly={iconOnly}
        disabled={disabled}
        refreshing={refreshing}
        onClick={handleClick}
      />
    </RendersDemoCard>
  )
}

function RendersLiveButtonArray() {
  const [value, setValue] = useState("events")

  return (
    <>
      <RendersDemoCard>
        <ButtonArray
          items={SECTION_ITEMS}
          value={value}
          onValueChange={setValue}
        />
      </RendersDemoCard>
      <RendersDemoCard label="selected">
        <StandardText>{value}</StandardText>
      </RendersDemoCard>
      <RendersDemoCard label="variant slider">
        <ButtonArray
          variant="slider"
          items={SECTION_ITEMS}
          defaultValue="crew"
        />
      </RendersDemoCard>
      <RendersDemoCard label="variant underlined">
        <ButtonArray
          variant="underlined"
          items={SECTION_ITEMS}
          defaultValue="reports"
        />
      </RendersDemoCard>
    </>
  )
}

export function RendersStandardButtonDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Button Array") {
    return <RendersLiveButtonArray />
  }

  if (
    pieceName === "Button" ||
    pieceName === "Button Base" ||
    pieceName === "Standard Button"
  ) {
    return (
      <>
        <RendersDemoCard>
          <Button>Save</Button>
        </RendersDemoCard>
        <RendersDemoCard label="tone outline">
          <Button tone="outline">Cancel</Button>
        </RendersDemoCard>
        <RendersDemoCard label="tone danger">
          <Button tone="danger">Delete</Button>
        </RendersDemoCard>
        <RendersDemoCard label="size sm">
          <Button size="sm">Small</Button>
        </RendersDemoCard>
        <RendersDemoCard label="size lg">
          <Button size="lg">Large</Button>
        </RendersDemoCard>
        <RendersDemoCard label="disabled">
          <Button disabled>Locked</Button>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Button Icon") {
    return (
      <>
        <RendersDemoCard>
          <ButtonIcon label="Star">
            <StarIcon className="size-4" />
          </ButtonIcon>
        </RendersDemoCard>
        <RendersDemoCard label="tone outline">
          <ButtonIcon label="Search" tone="outline">
            <SearchIcon className="size-4" />
          </ButtonIcon>
        </RendersDemoCard>
        <RendersDemoCard label="tone danger">
          <ButtonIcon label="Delete" tone="danger">
            <Trash2Icon className="size-4" />
          </ButtonIcon>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Button Link") {
    return (
      <>
        <RendersDemoCard>
          <ButtonLink href="#gallery">Open gallery</ButtonLink>
        </RendersDemoCard>
        <RendersDemoCard label="docs">
          <ButtonLink href="#docs">Read docs</ButtonLink>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Button Back") {
    return (
      <>
        <RendersDemoCard>
          <ButtonBack />
        </RendersDemoCard>
        <RendersDemoCard label="custom href">
          <ButtonBack href="#gallery">Gallery</ButtonBack>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Refresh Button") {
    return (
      <>
        <RendersRefreshButtonSpinDemo />
        <RendersRefreshButtonSpinDemo iconOnly label="icon only" />
        <RendersRefreshButtonSpinDemo disabled label="disabled" />
      </>
    )
  }

  if (pieceName === "Button Enhanced" || pieceName === "Reports Button") {
    return (
      <>
        <RendersDemoCard>
          <Button>
            <StarIcon className="size-3.5" />
            Inbox
            <CircleBadge className="bg-primary-foreground text-primary">
              3
            </CircleBadge>
          </Button>
        </RendersDemoCard>
        <RendersDemoCard label="tone outline">
          <Button tone="outline">
            Reports
            <CircleBadge className="bg-destructive text-white">2</CircleBadge>
          </Button>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Caption Button") {
    return (
      <>
        <RendersDemoCard>
          <CaptionButton label="Favorite">
            <StarIcon className="size-4" />
          </CaptionButton>
        </RendersDemoCard>
        <RendersDemoCard label="pressed">
          <CaptionButton label="Favorite" defaultPressed>
            <StarIcon className="size-4" />
          </CaptionButton>
        </RendersDemoCard>
        <RendersDemoCard label="shape square">
          <CaptionButton label="Search" shape="square">
            <SearchIcon className="size-4" />
          </CaptionButton>
        </RendersDemoCard>
        <RendersDemoCard label="size sm">
          <CaptionButton label="Refresh" size="sm">
            <RefreshCwIcon className="size-3" />
          </CaptionButton>
        </RendersDemoCard>
        <RendersDemoCard label="size lg">
          <CaptionButton label="Star" size="lg">
            <StarIcon className="size-5" />
          </CaptionButton>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Captions Array") {
    return (
      <>
        <RendersDemoCard>
          <CaptionsArray>
            <CaptionButton label="Star">
              <StarIcon className="size-4" />
            </CaptionButton>
            <CaptionButton label="Search">
              <SearchIcon className="size-4" />
            </CaptionButton>
            <CaptionButton label="Refresh">
              <RefreshCwIcon className="size-4" />
            </CaptionButton>
          </CaptionsArray>
        </RendersDemoCard>
        <RendersDemoCard label="shape square">
          <CaptionsArray>
            <CaptionButton label="Star" shape="square">
              <StarIcon className="size-4" />
            </CaptionButton>
            <CaptionButton label="Search" shape="square">
              <SearchIcon className="size-4" />
            </CaptionButton>
          </CaptionsArray>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Admin Shield Cog Config Button") {
    return (
      <RendersDemoCard label="Button icon">
        <ButtonIcon label="Config" tone="outline">
          <StarIcon className="size-4" />
        </ButtonIcon>
      </RendersDemoCard>
    )
  }

  if (pieceName === "Button Group") {
    return <RendersLiveButtonArray />
  }

  if (
    pieceName === "Icon" ||
    pieceName === "Icon Indicator" ||
    pieceName === "Icon Tooltip Label" ||
    pieceName === "Iconify Icon" ||
    pieceName === "Lazy Icon Picker" ||
    pieceName === "Save Check Icon" ||
    pieceName === "Shield Cog Corner Icon" ||
    pieceName === "Standard Icon"
  ) {
    return (
      <RendersDemoCard label="Symbol">
        <Symbol>
          <StarIcon />
        </Symbol>
      </RendersDemoCard>
    )
  }

  return (
    <RendersDemoCard label="Button">
      <Button>{pieceName}</Button>
    </RendersDemoCard>
  )
}
