"use client"

import { useState } from "react"
import { MenuIcon, PencilIcon } from "lucide-react"

import { Button } from "@/components/standard/button"
import { ButtonIcon } from "@/components/standard/button-icon"
import { NavigationRail } from "@/components/standard/navigation"
import { DESTINATIONS } from "@/features/standard-library/components/demos/shared/definesNavigationDestinations"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersLiveNavigationRail() {
  const [value, setValue] = useState("home")
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <RendersDemoCard className="w-full max-w-xl p-0">
        <div className="flex h-96 overflow-hidden rounded-xl">
          <NavigationRail
            className="border-r border-border"
            items={DESTINATIONS}
            value={value}
            onValueChange={setValue}
            expanded={expanded}
            header={
              <>
                <ButtonIcon
                  label={expanded ? "Collapse" : "Expand"}
                  tone="ghost"
                  onClick={() => setExpanded(!expanded)}
                >
                  <MenuIcon className="size-4" />
                </ButtonIcon>
                <Button size="sm" className="[&_svg]:size-4">
                  <PencilIcon />
                  {expanded ? "New job" : null}
                </Button>
              </>
            }
          />
          <div className="flex-1 p-4 text-sm text-muted-foreground">
            {value}
          </div>
        </div>
      </RendersDemoCard>
    </>
  )
}

export function RendersNavigationRailDemo() {
  return <RendersLiveNavigationRail />
}
