"use client"

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { RendersDemoCard } from "./rendersDemoCard"

export function RendersLabelDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Label") {
    return (
      <>
        <RendersDemoCard>
          <div className="flex w-full flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@jayrr.dev" />
          </div>
        </RendersDemoCard>
        <RendersDemoCard>
          <Field className="w-full">
            <FieldLabel htmlFor="display">Display name</FieldLabel>
            <Input id="display" placeholder="Jayrr" />
            <FieldDescription>Shown on the gallery card.</FieldDescription>
          </Field>
        </RendersDemoCard>
      </>
    )
  }

  return null
}
