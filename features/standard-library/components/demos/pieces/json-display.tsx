"use client"

import { JsonDisplay } from "@/components/standard/json-display"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const user = {
  id: "usr_01J9Z",
  name: "Ada Lovelace",
  email: "ada@example.com",
  verified: true,
  score: 98.6,
  manager: null,
  roles: ["admin", "editor"],
  address: { city: "London", postcode: "W1", geo: { lat: 51.51, lng: -0.13 } },
  sessions: [
    { device: "MacBook", lastSeen: "2026-09-29T18:04:00Z" },
    { device: "iPhone", lastSeen: "2026-09-30T07:12:00Z" },
  ],
  tags: [],
}

export function RendersJsonDisplayDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <JsonDisplay data={user} title="GET /api/users/usr_01J9Z" />
      </RendersDemoCard>
      <RendersDemoCard
        label="value (text) · expandDepth 0"
        className="w-full max-w-xl"
      >
        <JsonDisplay
          value={'{"ok":true,"items":[1,2,3],"next":null}'}
          expandDepth={0}
        />
      </RendersDemoCard>
      <RendersDemoCard label="invalid JSON" className="w-full max-w-xl">
        <JsonDisplay
          value={'{"ok": true, "items": [1, 2,]}'}
          title="response.json"
        />
      </RendersDemoCard>
    </>
  )
}
