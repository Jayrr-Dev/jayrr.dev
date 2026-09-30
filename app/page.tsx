import type { Metadata } from "next"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "jayrr.dev",
  description: "A small shadcn component registry.",
}

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col justify-center bg-background px-6 text-foreground">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs text-muted-foreground">jayrr.dev</p>
          <h1 className="text-3xl font-medium tracking-tight">
            A small component registry.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Copy components into your own project. Convex is here for later.
          </p>
        </div>
        <Button asChild className="w-fit">
          <a href="/gallery">Browse</a>
        </Button>
        <pre className="overflow-x-auto rounded-lg border bg-card p-4 font-mono text-xs text-muted-foreground">
          npx shadcn@latest add https://jayrr.dev/r/button.json
        </pre>
      </div>
    </main>
  )
}
