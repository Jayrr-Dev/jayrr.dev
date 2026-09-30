"use client"

import { InfoIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import { ResponsiveTooltip } from "@/components/standard/responsive-tooltip"
import { Stack } from "@/components/standard/stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersResponsiveTooltipDemo() {
  return (
    <>
      <RendersDemoCard label="auto · hover on desktop, tap on mobile">
        <ResponsiveTooltip
          label="Hover or tap"
          title="Responsive"
          content="A tooltip where the pointer can hover, a popover on touch."
        />
      </RendersDemoCard>
      <RendersDemoCard label="mode tooltip / popover">
        <Stack direction="row" align="center">
          <ResponsiveTooltip
            mode="tooltip"
            label="Tooltip"
            content="Always a hover tooltip."
          />
          <ResponsiveTooltip
            mode="popover"
            label="Popover"
            title="Popover"
            content="Always a tap popover, as a phone sees it."
          />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="tone danger">
        <Stack direction="row" align="center">
          <ResponsiveTooltip
            label="Job number"
            title="Required"
            content="Job number is required."
            tone="danger"
          />
          <ResponsiveTooltip
            mode="popover"
            label="Job number · popover"
            title="Required"
            content="Job number is required."
            tone="danger"
          />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="custom trigger · shortcut">
        <Stack direction="row" align="center">
          <ResponsiveTooltip content="Save the draft" shortcut="Ctrl S">
            <Button tone="outline" size="sm">
              Save
            </Button>
          </ResponsiveTooltip>
          <ResponsiveTooltip
            side="right"
            title="Billing cycle"
            content="Charges renew on the first of each month."
          >
            <button
              type="button"
              aria-label="About billing cycle"
              className="inline-flex rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <InfoIcon className="size-4" />
            </button>
          </ResponsiveTooltip>
        </Stack>
      </RendersDemoCard>
    </>
  )
}
