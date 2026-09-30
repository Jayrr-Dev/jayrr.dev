"use client"

import { Button } from "@/components/standard/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/standard/popover"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersPopoverDemo() {
  return (
    <>
      <RendersDemoCard label="Popover">
        <Popover>
          <PopoverTrigger asChild>
            <Button tone="outline" size="sm">
              Open popover
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <p className="text-xs font-medium">Column</p>
            <p className="text-xs text-muted-foreground">
              Click opens this panel. It is not a hover tip.
            </p>
          </PopoverContent>
        </Popover>
      </RendersDemoCard>
      <RendersDemoCard label="variant arrow">
        <Popover>
          <PopoverTrigger asChild>
            <Button tone="outline" size="sm">
              With arrow
            </Button>
          </PopoverTrigger>
          <PopoverContent variant="arrow" className="w-56">
            <PopoverHeader>
              <PopoverTitle>Arrow</PopoverTitle>
              <PopoverDescription>
                A caret points at the trigger.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </RendersDemoCard>
      <RendersDemoCard label="variant tooltip">
        <Popover>
          <PopoverTrigger asChild>
            <Button tone="outline" size="sm">
              Callout
            </Button>
          </PopoverTrigger>
          <PopoverContent variant="tooltip">
            Drawn like a tooltip, opened by click.
          </PopoverContent>
        </Popover>
      </RendersDemoCard>
    </>
  )
}
