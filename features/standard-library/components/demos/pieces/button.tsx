"use client"

import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  ExternalLinkIcon,
  InboxIcon,
  PlusIcon,
  RefreshCwIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/standard/button"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersButtonDemo() {
  return (
    <>
      <RendersDemoCard>
        <Button>Save</Button>
      </RendersDemoCard>
      <RendersDemoCard label="tone outline">
        <Button tone="outline">Cancel</Button>
      </RendersDemoCard>
      <RendersDemoCard label="tone danger">
        <Button tone="danger">Delete</Button>
      </RendersDemoCard>
      <RendersDemoCard label="size sm">
        <Button size="sm">Small</Button>
      </RendersDemoCard>
      <RendersDemoCard label="size lg">
        <Button size="lg">Large</Button>
      </RendersDemoCard>
      <RendersDemoCard label="disabled">
        <Button disabled>Locked</Button>
      </RendersDemoCard>
      <RendersDemoCard label="loading">
        <Button loading>Saving</Button>
      </RendersDemoCard>
      <RendersDemoCard label="leading icon">
        <Button leading={<PlusIcon className="size-4" />}>New item</Button>
      </RendersDemoCard>
      <RendersDemoCard label="trailing icon">
        <Button tone="outline" trailing={<ArrowRightIcon className="size-4" />}>
          Continue
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="count">
        <div className="flex flex-wrap items-center gap-2">
          <Button leading={<InboxIcon className="size-4" />} count={3}>
            Inbox
          </Button>
          <Button tone="outline" count={12}>
            Reports
          </Button>
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="iconOnly">
        <div className="flex flex-wrap items-center gap-2">
          <Button iconOnly aria-label="Add">
            <PlusIcon className="size-4" />
          </Button>
          <Button iconOnly tone="outline" aria-label="Star">
            <StarIcon className="size-4" />
          </Button>
          <Button iconOnly tone="ghost" aria-label="Refresh">
            <RefreshCwIcon className="size-4" />
          </Button>
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="iconOnly · tone danger · loading">
        <div className="flex flex-wrap items-center gap-2">
          <Button iconOnly tone="danger" aria-label="Delete">
            <Trash2Icon className="size-4" />
          </Button>
          <Button iconOnly tone="outline" aria-label="Saving" loading>
            <StarIcon className="size-4" />
          </Button>
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="iconOnly shape circle">
        <Button iconOnly shape="circle" tone="outline" aria-label="Star">
          <StarIcon className="size-4" />
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="iconOnly shape square">
        <Button iconOnly shape="square" tone="quiet" aria-label="Add">
          <PlusIcon className="size-4" />
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="href">
        <Button
          href="#gallery"
          tone="outline"
          trailing={<ExternalLinkIcon className="size-3.5" />}
        >
          Open gallery
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="href · leading (back link)">
        <Button
          href="#back"
          tone="ghost"
          leading={<ChevronLeftIcon aria-hidden className="size-4" />}
        >
          Back
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="href · tone link">
        <Button href="#docs" tone="link">
          Read docs
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="tone quiet">
        <Button tone="quiet">Archive</Button>
      </RendersDemoCard>
      <RendersDemoCard label="tone ghost">
        <Button tone="ghost">Skip</Button>
      </RendersDemoCard>
      <RendersDemoCard label="tone link">
        <Button tone="link">Learn more</Button>
      </RendersDemoCard>
      <RendersDemoCard label="tone success">
        <Button tone="success" leading={<CheckIcon className="size-4" />}>
          Approve
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="size xs">
        <Button size="xs">Tiny</Button>
      </RendersDemoCard>
      <RendersDemoCard label="shape pill">
        <Button shape="pill" leading={<PlusIcon className="size-4" />}>
          Follow
        </Button>
      </RendersDemoCard>
      <RendersDemoCard label="block">
        <Button block>Continue</Button>
      </RendersDemoCard>
      <RendersDemoCard label="loading spin-icon">
        <Button
          tone="outline"
          loading="spin-icon"
          leading={<RefreshCwIcon className="size-4" />}
        >
          Syncing
        </Button>
      </RendersDemoCard>
    </>
  )
}
