"use client"

import { UserIcon } from "lucide-react"

import { Avatar, AvatarGroup } from "@/components/standard/avatar"
import { Stack } from "@/components/standard/stack"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

// Inline image so the demo makes no network request.
const PORTRAIT_SRC = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="26" r="11" fill="#fff" fill-opacity=".85"/><path d="M12 60c2-12 10-18 20-18s18 6 20 18z" fill="#fff" fill-opacity=".85"/></svg>'
)}`

const TEAM = ["AK", "MR", "JL", "SO", "TW", "PN"]

export function RendersAvatarDemo() {
  return (
    <>
      <RendersDemoCard>
        <Avatar>JR</Avatar>
      </RendersDemoCard>
      <RendersDemoCard label="src">
        <Stack direction="row" align="center" className="gap-3">
          <Avatar src={PORTRAIT_SRC} alt="Jordan Reyes" fallback="JR" />
          <Avatar src="/missing-avatar.png" alt="Broken image" fallback="BI" />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="fallback">
        <Stack direction="row" align="center" className="gap-3">
          <Avatar fallback="AK" />
          <Avatar fallback={<UserIcon className="size-1/2" />} />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="size xs, sm, default, lg, xl">
        <Stack direction="row" align="center" className="gap-3">
          <Avatar size="xs">XS</Avatar>
          <Avatar size="sm">SM</Avatar>
          <Avatar>MD</Avatar>
          <Avatar size="lg">LG</Avatar>
          <Avatar size="xl" src={PORTRAIT_SRC} fallback="XL" />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="shape square">
        <Stack direction="row" align="center" className="gap-3">
          <Avatar shape="square">AC</Avatar>
          <Avatar shape="square" size="lg" src={PORTRAIT_SRC} fallback="AC" />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="status">
        <Stack direction="row" align="center" className="gap-4">
          <Avatar status="online">AK</Avatar>
          <Avatar status="away">MR</Avatar>
          <Avatar status="busy">JL</Avatar>
          <Avatar status="offline">SO</Avatar>
          <Avatar status="online" size="xl" src={PORTRAIT_SRC} fallback="JR" />
        </Stack>
      </RendersDemoCard>
      <RendersDemoCard label="AvatarGroup max 3">
        <AvatarGroup max={3}>
          {TEAM.map((initials) => (
            <Avatar key={initials}>{initials}</Avatar>
          ))}
        </AvatarGroup>
      </RendersDemoCard>
      <RendersDemoCard label="AvatarGroup size sm">
        <AvatarGroup size="sm">
          {TEAM.slice(0, 4).map((initials) => (
            <Avatar key={initials}>{initials}</Avatar>
          ))}
        </AvatarGroup>
      </RendersDemoCard>
    </>
  )
}
