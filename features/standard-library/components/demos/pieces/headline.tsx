import { Badge } from "@/components/standard/badge"
import { Button } from "@/components/standard/button"
import { HeadingHighlight } from "@/components/standard/heading"
import { Headline } from "@/components/standard/headline"
import { Image } from "@/components/standard/image"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersHeadlineDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard label="hero · level 1" className="py-12">
        <Headline
          leading={<Badge appearance="outline">For site crews</Badge>}
          title={
            <>
              Close the week in <HeadingHighlight>5 minutes</HeadingHighlight>,
              not five hours
            </>
          }
          description="Crews log hours on their phones. The board rolls them up by job, and payroll reads the numbers the foreman signed off on."
          action={
            <>
              <Button size="lg">Start free</Button>
              <Button size="lg" tone="outline">
                See a demo
              </Button>
            </>
          }
          trailing={<Image alt="Product screenshot" className="w-full" />}
        />
      </RendersDemoCard>
      <RendersDemoCard label="section · level 2 · align start" className="py-12">
        <Headline
          level={2}
          align="start"
          title="Every job, one board"
          description="Drag a crew onto a job and their hours follow. No spreadsheets to merge on Friday."
          action={<Button>Try the board</Button>}
          trailing={<Image alt="Board screenshot" ratio="still" className="w-full" />}
        />
      </RendersDemoCard>
    </div>
  )
}
