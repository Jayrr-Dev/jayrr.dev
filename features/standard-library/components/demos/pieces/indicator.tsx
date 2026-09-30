"use client"

import { Avatar } from "@/components/standard/avatar"
import { Indicator } from "@/components/standard/indicator"
import { Row } from "@/components/standard/row"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const PEOPLE = [
  { initials: "AK", status: "online" as const },
  { initials: "MR", status: "away" as const },
  { initials: "JL", status: "busy" as const },
  { initials: "SO", status: "offline" as const },
]

function RendersIndicatorDemos() {
  return (
    <>
      <RendersDemoCard label="On an avatar">
        <Row className="gap-4">
          {PEOPLE.map((person) => (
            <Indicator key={person.initials} status={person.status}>
              <Avatar>{person.initials}</Avatar>
            </Indicator>
          ))}
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="Inline with label">
        <div className="flex flex-col gap-2">
          {PEOPLE.map((person) => (
            <Indicator key={person.initials} status={person.status} showLabel />
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="size sm, default, lg">
        <Row className="gap-4">
          <Indicator size="sm">
            <Avatar size="sm">AK</Avatar>
          </Indicator>
          <Indicator>
            <Avatar>AK</Avatar>
          </Indicator>
          <Indicator size="lg">
            <Avatar size="lg">AK</Avatar>
          </Indicator>
        </Row>
      </RendersDemoCard>
      <RendersDemoCard label="Custom label">
        <Indicator status="busy" label="In a meeting" showLabel />
      </RendersDemoCard>
      <RendersDemoCard label="via Avatar status">
        <Row className="gap-4">
          {PEOPLE.map((person) => (
            <Avatar key={person.initials} status={person.status}>
              {person.initials}
            </Avatar>
          ))}
        </Row>
      </RendersDemoCard>
    </>
  )
}

export function RendersIndicatorDemo() {
  return <RendersIndicatorDemos />
}
