"use client"

import { Button } from "@/components/standard/button"
import { Row } from "@/components/standard/row"
import { Tooltip } from "@/components/standard/tooltip"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersTooltipDemo() {
  return (
    <>
      <RendersDemoCard label="Tooltip">
        <Tooltip label="Hover me" body="This shows on hover, not on click." />
      </RendersDemoCard>
      <RendersDemoCard label="Tooltip · danger">
        <Tooltip
          label="Job number"
          body="Job number is required."
          tone="danger"
        />
      </RendersDemoCard>
      <RendersDemoCard label="content">
        <Tooltip label="Save" content="Saves the draft to this device." />
      </RendersDemoCard>
      <RendersDemoCard label="trigger click">
        <Tooltip
          trigger="click"
          label="Click me"
          content="Stays open until Escape or an outside click."
        />
      </RendersDemoCard>
      <RendersDemoCard label="side, align">
        <Row>
          <Tooltip side="right" label="Right" content="side right" />
          <Tooltip
            side="bottom"
            align="start"
            label="Bottom start"
            content="side bottom, align start"
          />
          <Tooltip side="left" label="Left" content="side left" />
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="shortcut">
        <Row>
          <Tooltip content="Search" shortcut="/">
            <Button tone="outline" size="sm">
              Search
            </Button>
          </Tooltip>
          <Tooltip
            content="Save"
            shortcut={
              <KbdGroup>
                <Kbd>Ctrl</Kbd>
                <Kbd>S</Kbd>
              </KbdGroup>
            }
          >
            <Button tone="outline" size="sm">
              Save
            </Button>
          </Tooltip>
        </Row>
      </RendersDemoCard>
    </>
  )
}
