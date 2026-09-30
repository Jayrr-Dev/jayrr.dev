"use client"

import { useRef, useState } from "react"
import {
  ArrowLeftIcon,
  MenuIcon,
  MicIcon,
  MoreVerticalIcon,
  PencilIcon,
} from "lucide-react"

import { AppBar, AppBarSearch } from "@/components/standard/app-bar"
import { ButtonIcon } from "@/components/standard/button-icon"
import { Select } from "@/components/standard/select"
import { Skeleton } from "@/components/standard/skeleton"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersAppBarActions() {
  return (
    <>
      <ButtonIcon label="Edit" tone="ghost">
        <PencilIcon className="size-4" />
      </ButtonIcon>
      <ButtonIcon label="More" tone="ghost">
        <MoreVerticalIcon className="size-4" />
      </ButtonIcon>
    </>
  )
}

function RendersLiveAppBar() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [variant, setVariant] = useState<"medium" | "large">("large")

  return (
    <>
      <RendersDemoCard
        label="flexible — scroll to collapse"
        className="w-full max-w-md"
      >
        <Select
          value={variant}
          onValueChange={(next) => setVariant(next as "medium" | "large")}
          options={[
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ]}
        />
        <div className="flex h-80 w-full flex-col overflow-hidden rounded-xl border border-border">
          <AppBar
            variant={variant}
            title="Jobs"
            subtitle="12 open this week"
            scrollRef={scrollRef}
            leading={
              <ButtonIcon label="Back" tone="ghost">
                <ArrowLeftIcon className="size-4" />
              </ButtonIcon>
            }
            actions={<RendersAppBarActions />}
          />
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 16 }, (_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="small" className="w-full max-w-md">
        <div className="flex w-full flex-col gap-2">
          <AppBar
            className="rounded-xl border border-border"
            title="Schedule"
            leading={
              <ButtonIcon label="Menu" tone="ghost">
                <MenuIcon className="size-4" />
              </ButtonIcon>
            }
            actions={<RendersAppBarActions />}
          />
          <AppBar
            className="rounded-xl border border-border"
            align="center"
            title="Schedule"
            subtitle="Week 40"
            scrolled
            leading={
              <ButtonIcon label="Back" tone="ghost">
                <ArrowLeftIcon className="size-4" />
              </ButtonIcon>
            }
            actions={<RendersAppBarActions />}
          />
        </div>
      </RendersDemoCard>
      <RendersDemoCard label="search" className="w-full max-w-md">
        <AppBar
          className="rounded-xl border border-border"
          variant="search"
          leading={
            <ButtonIcon label="Menu" tone="ghost">
              <MenuIcon className="size-4" />
            </ButtonIcon>
          }
          search={
            <AppBarSearch
              placeholder="Search jobs"
              trailing={
                <ButtonIcon
                  label="Voice search"
                  tone="ghost"
                  className="rounded-full"
                >
                  <MicIcon className="size-4" />
                </ButtonIcon>
              }
            />
          }
        />
      </RendersDemoCard>
    </>
  )
}

export function RendersAppBarDemo() {
  return <RendersLiveAppBar />
}
