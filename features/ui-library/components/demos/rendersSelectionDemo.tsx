"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Toggle } from "@/components/ui/toggle"

import { RendersDemoCard } from "./rendersDemoCard"

export function RendersSelectionDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Checkbox") {
    return (
      <RendersDemoCard>
        <div className="flex items-center gap-2">
          <Checkbox id="terms" defaultChecked />
          <Label htmlFor="terms">Accept terms</Label>
        </div>
      </RendersDemoCard>
    )
  }

  if (pieceName === "Radio Group") {
    return (
      <RendersDemoCard>
        <RadioGroup defaultValue="classic" className="w-full">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="classic" id="radio-classic" />
            <Label htmlFor="radio-classic">Classic</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="standard" id="radio-standard" />
            <Label htmlFor="radio-standard">Standard</Label>
          </div>
        </RadioGroup>
      </RendersDemoCard>
    )
  }

  if (pieceName === "Toggle") {
    return (
      <>
        <RendersDemoCard>
          <Toggle aria-label="Bold" defaultPressed>
            Bold
          </Toggle>
        </RendersDemoCard>
        <RendersDemoCard>
          <div className="flex items-center gap-2">
            <Switch id="alerts" defaultChecked />
            <Label htmlFor="alerts">Alerts</Label>
          </div>
        </RendersDemoCard>
      </>
    )
  }

  return null
}
