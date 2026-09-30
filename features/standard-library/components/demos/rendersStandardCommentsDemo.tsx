"use client"

import { useState } from "react"

import { Button } from "@/components/standard/button"
import { Comments, type CommentEntry } from "@/components/standard/comments"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const HOUR = 3_600_000

const seed: CommentEntry[] = [
  {
    id: "1",
    author: "Maya Chen",
    body: "Loved the part about spacing entries by time. Going to try it on our changelog.",
    date: Date.now() - 3 * HOUR,
  },
  {
    id: "2",
    author: "Theo Ortiz",
    body: "Does the sort persist between visits, or is it per page load?",
    date: Date.now() - 26 * HOUR,
  },
]

export function RendersStandardCommentsDemo() {
  const [signedIn, setSignedIn] = useState(false)
  const [comments, setComments] = useState(seed)

  return (
    <div className="flex w-full flex-col gap-4">
      <RendersDemoCard label="Signed out" fill>
        <Comments onLogin={() => setSignedIn(true)} />
      </RendersDemoCard>
      <RendersDemoCard label="Signed in, with comments" fill>
        <div className="flex w-full flex-col gap-3">
          <Button
            size="xs"
            tone="outline"
            className="self-end"
            onClick={() => setSignedIn((on) => !on)}
          >
            {signedIn ? "Sign out" : "Sign in"}
          </Button>
          <Comments
            label="Comments"
            signedIn={signedIn}
            comments={comments}
            onLogin={() => setSignedIn(true)}
            onSubmit={(body) =>
              setComments((list) => [
                ...list,
                {
                  id: crypto.randomUUID(),
                  author: "You",
                  body,
                  date: Date.now(),
                },
              ])
            }
            empty="No comments yet."
          />
        </div>
      </RendersDemoCard>
    </div>
  )
}
