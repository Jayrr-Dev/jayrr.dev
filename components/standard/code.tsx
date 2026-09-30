"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon, CopyIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

const codeVariants = cva("font-mono text-sm", {
  variants: {
    variant: {
      inline: "relative rounded bg-muted px-2 py-1",
      // Multi-line snippet; long lines scroll sideways instead of wrapping.
      block:
        "block w-full min-w-0 overflow-x-auto rounded-md bg-muted p-4 leading-relaxed whitespace-pre",
    },
  },
  defaultVariants: {
    variant: "inline",
  },
})

// Copies the text of the block it sits in.
function CodeCopyButton({ className }: { className?: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [copied])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      data-slot="code-copy"
      aria-label={copied ? "Copied" : "Copy code"}
      className={cn("absolute top-2 right-2", className)}
      onClick={(event) => {
        const text = event.currentTarget
          .closest("[data-slot=code-block]")
          ?.querySelector("pre")?.textContent
        if (!text) return
        void navigator.clipboard?.writeText(text).then(() => setCopied(true))
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}

function Code({
  className,
  variant = "inline",
  copyable = false,
  ...props
}: React.ComponentProps<"code"> &
  VariantProps<typeof codeVariants> & {
    /** Show a copy button. Block variant only. */
    copyable?: boolean
  }) {
  if (variant === "block") {
    return (
      <div data-slot="code-block" className="relative w-full min-w-0">
        <pre className="m-0">
          <code
            data-slot="code"
            data-variant="block"
            className={cn(
              codeVariants({ variant: "block" }),
              copyable && "pr-12",
              className
            )}
            {...props}
          />
        </pre>
        {copyable ? <CodeCopyButton /> : null}
      </div>
    )
  }

  return (
    <code
      data-slot="code"
      data-variant="inline"
      className={cn(codeVariants({ variant: "inline" }), className)}
      {...props}
    />
  )
}

export { Code, codeVariants }
