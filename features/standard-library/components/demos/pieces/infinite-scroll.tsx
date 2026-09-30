"use client"

import { useEffect, useState, type ReactNode } from "react"

import { Avatar } from "@/components/standard/avatar"
import { Card } from "@/components/standard/card"
import {
  InfiniteScroll,
  useInfiniteList,
} from "@/components/standard/infinite-scroll"

const PAGE_SIZE = 8

const authors = [
  { name: "Ada Lovelace", initials: "AL" },
  { name: "Alan Turing", initials: "AT" },
  { name: "Grace Hopper", initials: "GH" },
  { name: "Margaret Hamilton", initials: "MH" },
]

const snippets = [
  "Shipped the new onboarding flow.",
  "Anyone else seeing flaky builds this morning? Retrying fixed it for me, but it's the third time today.",
  "Pairing on the search index after lunch.",
  "Wrote up the incident notes. Short version: a cache key collided across tenants, so a handful of requests got the wrong settings for about four minutes before the deploy rolled back.",
  "Design review moved to Thursday.",
  "Reminder: the staging database gets reset at midnight.",
]

type Post = { id: number; author: (typeof authors)[number]; text: string }

/** A fake paged API: `pages` pages of PAGE_SIZE, after a short delay. */
function fakeFetch<T>(
  make: (index: number) => T,
  { pages = 5, delay = 700, failEvery = 0 } = {}
) {
  let calls = 0
  return (page: number) =>
    new Promise<{ items: T[]; hasMore: boolean }>((resolve, reject) => {
      calls += 1
      const fails = failEvery > 0 && calls % failEvery === 0
      setTimeout(() => {
        if (fails) {
          reject(new Error("The server didn't answer."))
          return
        }
        resolve({
          items: Array.from({ length: PAGE_SIZE }, (_, i) =>
            make(page * PAGE_SIZE + i)
          ),
          hasMore: page + 1 < pages,
        })
      }, delay)
    })
}

const makePost = (id: number): Post => ({
  id,
  author: authors[id % authors.length],
  text: snippets[(id * 7) % snippets.length],
})

function Example({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="text-xs text-muted-foreground">{title}</figcaption>
      {children}
    </figure>
  )
}

/** The bordered frame each example scrolls inside. */
function Frame({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-xl border">{children}</div>
}

function EndOfList() {
  return (
    <p className="py-4 text-center text-xs text-muted-foreground">
      You&apos;re all caught up.
    </p>
  )
}

/** Loads page 0 on mount; the sentinel takes it from there. */
function useFeed<T>(fetchPage: ReturnType<typeof fakeFetch<T>>) {
  const [fetcher] = useState(() => fetchPage)
  const [feed] = useInfiniteList(fetcher)
  const { onLoadMore } = feed
  useEffect(() => {
    onLoadMore()
  }, [onLoadMore])
  return feed
}

function PostFeed() {
  const feed = useFeed(fakeFetch(makePost))
  return (
    <Frame>
      <InfiniteScroll
        {...feed}
        scroll="container"
        className="h-80 p-3"
        end={<EndOfList />}
        renderItem={(post) => (
          <Card padding="sm" className="flex-row items-start">
            <Avatar size="sm" fallback={post.author.initials} />
            <div className="min-w-0">
              <p className="text-sm font-medium">{post.author.name}</p>
              <p className="text-sm text-muted-foreground">{post.text}</p>
            </div>
          </Card>
        )}
      />
    </Frame>
  )
}

function SwatchGrid() {
  const feed = useFeed(
    fakeFetch((id) => ({ id, hue: (id * 37) % 360 }), { pages: 6, delay: 500 })
  )
  return (
    <Frame>
      <InfiniteScroll
        {...feed}
        layout="grid"
        minItemWidth={64}
        scroll="container"
        className="h-80 p-3"
        contentClassName="gap-2"
        end={<EndOfList />}
        renderItem={(swatch) => (
          <div
            className="flex aspect-square items-end rounded-lg p-1.5 text-xs font-medium text-white/90"
            style={{ background: `oklch(0.68 0.16 ${swatch.hue})` }}
          >
            {swatch.hue}°
          </div>
        )}
      />
    </Frame>
  )
}

function MasonryWall() {
  const feed = useFeed(fakeFetch(makePost, { pages: 4 }))
  return (
    <Frame>
      <InfiniteScroll
        {...feed}
        layout="masonry"
        minItemWidth={160}
        scroll="container"
        className="h-80 p-3"
        contentClassName="gap-3"
        end={<EndOfList />}
        renderItem={(post) => (
          <Card padding="sm" appearance="muted" title={post.author.name}>
            <p className="text-sm text-muted-foreground">{post.text}</p>
          </Card>
        )}
      />
    </Frame>
  )
}

function ChatLog() {
  const feed = useFeed(fakeFetch(makePost, { pages: 4 }))
  // Pages arrive newest first; show oldest at the top.
  const messages = [...feed.items].reverse()
  return (
    <Frame>
      <InfiniteScroll
        {...feed}
        items={messages}
        direction="up"
        scroll="container"
        className="h-80 p-3"
        contentClassName="gap-2"
        end={
          <p className="py-2 text-center text-xs text-muted-foreground">
            Start of the conversation
          </p>
        }
        renderItem={(message) => {
          const mine = message.author.initials === "AL"
          return (
            <div
              className={
                mine
                  ? "ml-8 self-end rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "mr-8 self-start rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm"
              }
            >
              {message.text}
            </div>
          )
        }}
      />
    </Frame>
  )
}

function ButtonFeed() {
  const feed = useFeed(fakeFetch(makePost, { failEvery: 3 }))
  return (
    <Frame>
      <InfiniteScroll
        {...feed}
        trigger="button"
        scroll="container"
        className="h-80 p-3"
        contentClassName="gap-2"
        end={<EndOfList />}
        renderItem={(post) => (
          <div className="rounded-lg border px-3 py-2 text-sm">
            <span className="font-medium">#{post.id + 1}</span>{" "}
            <span className="text-muted-foreground">{post.text}</span>
          </div>
        )}
      />
    </Frame>
  )
}

function CardRow() {
  const feed = useFeed(fakeFetch(makePost))
  return (
    <Frame>
      <InfiniteScroll
        {...feed}
        direction="right"
        snap
        className="p-3 scroll-px-3"
        end={<EndOfList />}
        renderItem={(post) => (
          <Card padding="sm" className="h-36 w-56" title={post.author.name}>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {post.text}
            </p>
          </Card>
        )}
      />
    </Frame>
  )
}

function SwatchShelf() {
  const feed = useFeed(
    fakeFetch((id) => ({ id, hue: (id * 37) % 360 }), { pages: 6, delay: 500 })
  )
  return (
    <Frame>
      <InfiniteScroll
        {...feed}
        direction="right"
        layout="grid"
        rows={2}
        minItemWidth={72}
        className="p-3"
        contentClassName="gap-2"
        end={<EndOfList />}
        renderItem={(swatch) => (
          <div
            className="flex aspect-square items-end rounded-lg p-1.5 text-xs font-medium text-white/90"
            style={{ background: `oklch(0.68 0.16 ${swatch.hue})` }}
          >
            {swatch.hue}°
          </div>
        )}
      />
    </Frame>
  )
}

export function RendersInfiniteScrollDemo() {
  return (
    <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2">
      <Example title="List, any component per item">
        <PostFeed />
      </Example>
      <Example title="Responsive grid">
        <SwatchGrid />
      </Example>
      <Example title="Masonry">
        <MasonryWall />
      </Example>
      <Example title="Upward, for chat history">
        <ChatLog />
      </Example>
      <Example title="Load more button, with a failing request every third try">
        <ButtonFeed />
      </Example>
      <Example title="Sideways row with snap: swipe on touch, drag with a mouse">
        <CardRow />
      </Example>
      <Example title="Sideways two-row grid">
        <SwatchShelf />
      </Example>
    </div>
  )
}
