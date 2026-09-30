import katex from "katex"
import "katex/dist/katex.min.css"

import { cn } from "cn"

type MathProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** LaTeX source, e.g. `\frac{a}{b}`. */
  tex: string
  /** Block (centered, full size) instead of inline with the surrounding text. */
  display?: boolean
}

function Math({ tex, display = false, className, ...props }: MathProps) {
  // throwOnError: false renders bad input in red instead of crashing the page.
  const html = katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
    output: "htmlAndMathml",
  })

  return (
    <span
      data-slot="math"
      data-display={display ? "" : undefined}
      className={cn(
        "text-foreground",
        display && "block w-full max-w-full overflow-x-auto overflow-y-hidden px-1 py-1 [&_.katex-display]:m-0",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  )
}

export { Math }
