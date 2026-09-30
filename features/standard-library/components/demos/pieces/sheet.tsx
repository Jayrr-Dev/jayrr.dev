"use client"

import { Button } from "@/components/standard/button"
import { Select } from "@/components/standard/select"
import { Sheet } from "@/components/standard/sheet"
import { SheetClose } from "@/components/ui/sheet"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersSheetDemo() {
  return (
    <>
      <RendersDemoCard label="Sheet">
        <Sheet title="Filters">
          <Select
            placeholder="Status"
            options={[
              { value: "open", label: "Open" },
              { value: "done", label: "Done" },
            ]}
          />
        </Sheet>
      </RendersDemoCard>
      <RendersDemoCard label="side left">
        <Sheet title="Navigation" side="left" trigger="Open left">
          <p className="text-sm text-muted-foreground">Slides in from the left.</p>
        </Sheet>
      </RendersDemoCard>
      <RendersDemoCard label="side bottom">
        <Sheet title="Details" side="bottom" trigger="Open bottom">
          <p className="text-sm text-muted-foreground">Rises from the bottom.</p>
        </Sheet>
      </RendersDemoCard>
      <RendersDemoCard label="side top">
        <Sheet title="Notice" side="top" trigger="Open top" footer={null}>
          <p className="pb-4 text-sm text-muted-foreground">
            Drops from the top, with no footer.
          </p>
        </Sheet>
      </RendersDemoCard>
      <RendersDemoCard label="footer">
        <Sheet
          title="Edit job"
          description="Changes save when you press Save."
          trigger="Edit job"
          footer={
            <div className="flex justify-end gap-2">
              <SheetClose asChild>
                <Button tone="outline">Cancel</Button>
              </SheetClose>
              <SheetClose asChild>
                <Button>Save</Button>
              </SheetClose>
            </div>
          }
        >
          <p className="text-sm text-muted-foreground">Form fields go here.</p>
        </Sheet>
      </RendersDemoCard>
      <RendersDemoCard label="size md">
        <Sheet title="Medium sheet" size="md" trigger="Open md">
          <p className="text-sm text-muted-foreground">24rem wide.</p>
        </Sheet>
      </RendersDemoCard>
      <RendersDemoCard label="size lg">
        <Sheet title="Large sheet" size="lg" trigger="Open lg">
          <p className="text-sm text-muted-foreground">36rem wide.</p>
        </Sheet>
      </RendersDemoCard>
      <RendersDemoCard label="size full">
        <Sheet title="Full sheet" size="full" trigger="Open full">
          <p className="text-sm text-muted-foreground">Covers the screen.</p>
        </Sheet>
      </RendersDemoCard>
    </>
  )
}
