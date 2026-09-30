"use client"

import { Button } from "@/components/standard/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersPopoverDemo() {
  return (
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
  )
}
