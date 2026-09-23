import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersNotBuiltDemo({ pieceName }: { pieceName: string }) {
  return (
    <RendersDemoCard label="Not built">
      <p className="text-xs text-muted-foreground">
        {pieceName} is not a Standard primitive yet.
      </p>
    </RendersDemoCard>
  )
}
