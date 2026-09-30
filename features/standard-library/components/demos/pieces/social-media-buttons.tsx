"use client"

import {
  SOCIAL_NETWORKS,
  SocialMediaButton,
  SocialMediaButtons,
  type SocialMediaLink,
  type SocialNetworkName,
} from "@/components/standard/social-media-buttons"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const networks = Object.keys(SOCIAL_NETWORKS) as SocialNetworkName[]

const links: SocialMediaLink[] = [
  { network: "github", href: "https://github.com" },
  { network: "x", href: "https://x.com" },
  { network: "linkedin", href: "https://www.linkedin.com" },
  { network: "instagram", href: "https://www.instagram.com" },
  { network: "youtube", href: "https://www.youtube.com" },
  { network: "email", href: "mailto:hello@example.com" },
]

export function RendersSocialMediaButtonsDemo() {
  return (
    <>
      <RendersDemoCard label="brand · square">
        <div className="flex flex-wrap gap-1">
          {networks.map((network) => (
            <SocialMediaButton
              key={network}
              network={network}
              href="#"
              size="lg"
            />
          ))}
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="brand · circle">
        <SocialMediaButtons links={links} shape="circle" />
      </RendersDemoCard>
      <RendersDemoCard label="outline · rounded">
        <SocialMediaButtons links={links} tone="outline" shape="rounded" />
      </RendersDemoCard>
      <RendersDemoCard label="ghost · small">
        <SocialMediaButtons
          links={links}
          tone="ghost"
          shape="rounded"
          size="sm"
        />
      </RendersDemoCard>
      <RendersDemoCard label="with labels">
        <SocialMediaButtons
          links={links.slice(0, 3)}
          shape="rounded"
          showLabel
        />
      </RendersDemoCard>
    </>
  )
}
