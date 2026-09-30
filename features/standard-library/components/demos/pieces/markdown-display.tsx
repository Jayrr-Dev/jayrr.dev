"use client"

import { MarkdownDisplay } from "@/components/standard/markdown-display"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const readme = `# Display primitives

Small, **dependency-free** pieces for showing files: *PDF*, _Markdown_, SVG,
video, audio and JSON. See [the gallery](/gallery) or https://jayrr.dev.

## Install

\`\`\`bash
npx shadcn add @jayrr/markdown-display
\`\`\`

## What it renders

- Headings, paragraphs and \`inline code\`
- **Bold**, *italic* and ~~strikethrough~~
- Nested lists
  1. ordered
  2. and unordered
- Tables, quotes and rules

> Raw HTML is never rendered, and \`javascript:\` links are dropped.

| Piece | Format | Deps |
| :-- | :-: | --: |
| PdfDisplay | .pdf | 0 |
| SvgDisplay | .svg | 0 |
| JsonDisplay | .json | 0 |

---

### Checklist

- [x] Parse blocks
- [x] Parse inline marks
- [ ] Syntax highlighting
`

export function RendersMarkdownDisplayDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-2xl">
        <MarkdownDisplay
          title="README.md"
          source={readme}
          showSource
          maxHeight={560}
        />
      </RendersDemoCard>
      <RendersDemoCard label="bare (no title)" className="w-full max-w-2xl">
        <MarkdownDisplay>
          {
            "A plain block of **Markdown** with a [link](https://example.com), `code`, and a snake_case_word that stays intact."
          }
        </MarkdownDisplay>
      </RendersDemoCard>
    </>
  )
}
