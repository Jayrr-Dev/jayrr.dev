"use client"

import * as React from "react"
import { FileTypeIcon } from "lucide-react"
import { cn } from "cn"

import { Code } from "@/components/standard/code"
import {
  DisplayCopyAction,
  DisplayFrame,
  DisplaySwitch,
} from "@/components/standard/display-frame"

/**
 * Renders Markdown as styled React elements, with no dependencies and no
 * raw HTML: headings, paragraphs, emphasis, links, images, inline and
 * fenced code, block quotes, nested and task lists, tables and rules.
 * Link and image URLs are limited to http(s), mailto, tel and relative paths.
 *
 * <MarkdownDisplay>{"# Hello\n\nSome **bold** text."}</MarkdownDisplay>
 * <MarkdownDisplay title="README.md" source={readme} showSource />
 */

type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "code"; lang: string; text: string }
  | { kind: "quote"; blocks: Block[] }
  | { kind: "list"; ordered: boolean; start: number; items: ListItem[] }
  | { kind: "table"; align: Align[]; head: string[]; rows: string[][] }
  | { kind: "rule" }

type ListItem = { checked: boolean | null; blocks: Block[]; tight: boolean }
type Align = "left" | "center" | "right" | null

const FENCE = /^\s{0,3}(`{3,}|~{3,})\s*([\w+-]*)/
const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/
const RULE = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/
const QUOTE = /^\s{0,3}>\s?/
const LIST_ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/
const TABLE_DIVIDER = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/

function indentOf(line: string) {
  return line.length - line.trimStart().length
}

function splitRow(line: string) {
  let row = line.trim()
  if (row.startsWith("|")) row = row.slice(1)
  if (row.endsWith("|") && !row.endsWith("\\|")) row = row.slice(0, -1)
  // Escaped pipes stay in their cell.
  return row
    .replace(/\\\|/g, "\u0000")
    .split("|")
    .map((cell) => cell.trim().replace(/\u0000/g, "|"))
}

function startsBlock(line: string, next: string | undefined) {
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    RULE.test(line) ||
    QUOTE.test(line) ||
    LIST_ITEM.test(line) ||
    (line.includes("|") && next !== undefined && TABLE_DIVIDER.test(next))
  )
}

function parseBlocks(source: string): Block[] {
  const lines = source
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "    ")
    .split("\n")
  const blocks: Block[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    const fence = FENCE.exec(line)
    if (fence) {
      const marker = fence[1]
      const body: string[] = []
      index += 1
      while (index < lines.length && !lines[index].trim().startsWith(marker)) {
        body.push(lines[index])
        index += 1
      }
      index += 1
      blocks.push({ kind: "code", lang: fence[2], text: body.join("\n") })
      continue
    }

    const heading = HEADING.exec(line)
    if (heading) {
      blocks.push({
        kind: "heading",
        level: heading[1].length,
        text: heading[2],
      })
      index += 1
      continue
    }

    if (RULE.test(line)) {
      blocks.push({ kind: "rule" })
      index += 1
      continue
    }

    if (QUOTE.test(line)) {
      const body: string[] = []
      while (
        index < lines.length &&
        lines[index].trim() &&
        QUOTE.test(lines[index])
      ) {
        body.push(lines[index].replace(QUOTE, ""))
        index += 1
      }
      blocks.push({ kind: "quote", blocks: parseBlocks(body.join("\n")) })
      continue
    }

    const item = LIST_ITEM.exec(line)
    if (item) {
      const baseIndent = item[1].length
      const ordered = /\d/.test(item[2])
      const items: ListItem[] = []
      let looseList = false

      while (index < lines.length) {
        const current = LIST_ITEM.exec(lines[index])
        if (
          !current ||
          current[1].length !== baseIndent ||
          /\d/.test(current[2]) !== ordered
        ) {
          break
        }

        const contentIndent = current[1].length + current[2].length + 1
        const body = [current[3]]
        let sawBlank = false
        index += 1

        while (index < lines.length) {
          const next = lines[index]
          if (!next.trim()) {
            sawBlank = true
            body.push("")
            index += 1
            continue
          }
          if (indentOf(next) >= Math.min(contentIndent, baseIndent + 2)) {
            body.push(next.slice(Math.min(indentOf(next), contentIndent)))
            index += 1
            continue
          }
          // A lazy continuation line of the item's opening paragraph.
          if (!sawBlank && !startsBlock(next, lines[index + 1])) {
            body.push(next.trim())
            index += 1
            continue
          }
          break
        }

        while (body.length && !body[body.length - 1].trim()) body.pop()
        const nextLine = lines[index]
        if (
          sawBlank &&
          nextLine !== undefined &&
          LIST_ITEM.exec(nextLine)?.[1].length === baseIndent
        ) {
          looseList = true
        }
        if (body.some((entry, at) => !entry.trim() && at > 0)) looseList = true

        let checked: boolean | null = null
        const task = /^\[([ xX])\]\s+/.exec(body[0])
        if (task) {
          checked = task[1] !== " "
          body[0] = body[0].slice(task[0].length)
        }

        items.push({
          checked,
          blocks: parseBlocks(body.join("\n")),
          tight: true,
        })
      }

      for (const entry of items) entry.tight = !looseList
      blocks.push({
        kind: "list",
        ordered,
        start: ordered ? parseInt(item[2], 10) : 1,
        items,
      })
      continue
    }

    if (line.includes("|") && TABLE_DIVIDER.test(lines[index + 1] ?? "")) {
      const head = splitRow(line)
      const align = splitRow(lines[index + 1]).map((cell): Align => {
        const left = cell.startsWith(":")
        const right = cell.endsWith(":")
        return left && right ? "center" : right ? "right" : left ? "left" : null
      })
      const rows: string[][] = []
      index += 2
      while (
        index < lines.length &&
        lines[index].trim() &&
        lines[index].includes("|")
      ) {
        rows.push(splitRow(lines[index]))
        index += 1
      }
      blocks.push({ kind: "table", align, head, rows })
      continue
    }

    const body = [line]
    index += 1
    while (
      index < lines.length &&
      lines[index].trim() &&
      !startsBlock(lines[index], lines[index + 1])
    ) {
      body.push(lines[index])
      index += 1
    }
    blocks.push({
      kind: "paragraph",
      text: body.map((entry) => entry.trimStart()).join("\n"),
    })
  }

  return blocks
}

/** Keeps http(s), mailto, tel, anchors and relative paths; drops javascript: and the like. */
function safeUrl(url: string, allowData = false) {
  const trimmed = url.trim()
  if (/^(https?:|mailto:|tel:|#|\/|\.{1,2}\/)/i.test(trimmed)) return trimmed
  if (
    allowData &&
    /^data:image\/(png|jpe?g|gif|webp|avif|svg\+xml)[;,]/i.test(trimmed)
  ) {
    return trimmed
  }
  // No scheme at all: a relative path such as docs/intro.md.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed
  return undefined
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

type InlineRule = {
  pattern: RegExp
  /** Rejects a match, e.g. an underscore inside a word. */
  valid?: (match: RegExpExecArray, text: string) => boolean
  render: (match: RegExpExecArray, key: string) => React.ReactNode
}

function renderLink(
  href: string,
  children: React.ReactNode,
  key: string,
  title?: string
) {
  const url = safeUrl(href)
  if (!url) return <React.Fragment key={key}>{children}</React.Fragment>
  const external = /^https?:/i.test(url)
  return (
    <a
      key={key}
      href={url}
      title={title}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  )
}

const inlineRules: InlineRule[] = [
  {
    pattern: /\\([\\`*_{}[\]()#+\-.!~|>])/g,
    render: (match) => match[1],
  },
  {
    pattern: /(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/g,
    render: (match, key) => (
      <code key={key}>{match[2].trim() || match[2]}
      </code>
    ),
  },
  {
    pattern: /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"([^"]*)")?\s*\)/g,
    render: (match, key) => {
      const src = safeUrl(match[2], true)
      if (!src) return match[1]
      return (
        // A plain img so any source works without next/image config.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={src}
          alt={match[1]}
          title={match[3]}
          loading="lazy"
          className="inline-block max-w-full rounded-md align-middle"
        />
      )
    },
  },
  {
    pattern:
      /\[((?:\[[^\]]*\]|[^[\]])*)\]\(\s*<?([^)\s>]+)>?(?:\s+"([^"]*)")?\s*\)/g,
    render: (match, key) =>
      renderLink(match[2], parseInline(match[1], key), key, match[3]),
  },
  {
    pattern: /<((?:https?:\/\/|mailto:)[^>\s]+)>/g,
    render: (match, key) =>
      renderLink(match[1], match[1].replace(/^mailto:/, ""), key),
  },
  {
    pattern: /https?:\/\/[^\s<]*[^\s<.,:;"')\]!?]/g,
    valid: (match, text) =>
      match.index === 0 || /[\s(]/.test(text[match.index - 1]),
    render: (match, key) => renderLink(match[0], match[0], key),
  },
  {
    pattern: /(\*\*|__)(?=\S)([\s\S]*?\S)\1/g,
    render: (match, key) => (
      <strong key={key}>{parseInline(match[2], key)}</strong>
    ),
  },
  {
    pattern: /~~(?=\S)([\s\S]*?\S)~~/g,
    render: (match, key) => (
      <del key={key}>{parseInline(match[1], key)}</del>
    ),
  },
  {
    pattern: /([*_])(?=\S)([\s\S]*?\S)\1/g,
    // snake_case words are not emphasis.
    valid: (match, text) => {
      if (match[1] !== "_") return true
      const before = text[match.index - 1] ?? " "
      const after = text[match.index + match[0].length] ?? " "
      return !/\w/.test(before) && !/\w/.test(after)
    },
    render: (match, key) => <em key={key}>{parseInline(match[2], key)}</em>,
  },
  {
    pattern: /( {2,}|\\)\n/g,
    render: (_match, key) => <br key={key} />,
  },
]

function findEarliest(text: string, from: number) {
  let best: { rule: InlineRule; match: RegExpExecArray } | null = null
  for (const rule of inlineRules) {
    rule.pattern.lastIndex = from
    let match = rule.pattern.exec(text)
    while (match && rule.valid && !rule.valid(match, text)) {
      rule.pattern.lastIndex = match.index + 1
      match = rule.pattern.exec(text)
    }
    if (match && (!best || match.index < best.match.index))
      best = { rule, match }
  }
  return best
}

function parseInline(text: string, keyPrefix = "i"): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let position = 0
  let count = 0

  while (position < text.length) {
    const found = findEarliest(text, position)
    if (!found) break
    if (found.match.index > position)
      nodes.push(text.slice(position, found.match.index))
    nodes.push(found.rule.render(found.match, `${keyPrefix}-${count}`))
    count += 1
    position = found.match.index + found.match[0].length
  }
  if (position < text.length) nodes.push(text.slice(position))

  return nodes
}

// Element styles and spacing come from typeset.css (the wrapper carries
// `typeset`), so blocks render as plain markup. Spacing only ever goes above
// a block, so streamed text never shifts what is already on screen.
function renderBlocks(
  blocks: Block[],
  keyPrefix: string,
  tight = false
): React.ReactNode[] {
  return blocks.map((block, index) => {
    const key = `${keyPrefix}-${index}`

    switch (block.kind) {
      case "heading": {
        const Tag = `h${block.level}` as "h1"
        return (
          <Tag key={key} id={slugify(block.text)}>
            {parseInline(block.text, key)}
          </Tag>
        )
      }
      case "paragraph":
        return tight ? (
          <React.Fragment key={key}>
            {parseInline(block.text, key)}
          </React.Fragment>
        ) : (
          <p key={key}>
            {parseInline(block.text, key)}
          </p>
        )
      case "code":
        return (
          // Code brings its own chrome, so it opts out and takes the flow gap.
          <div
            key={key}
            data-not-typeset
            data-lang={block.lang || undefined}
            className="mt-(--typeset-flow) first:mt-0"
          >
            <Code variant="block" copyable>
              {block.text}
            </Code>
          </div>
        )
      case "quote":
        return (
          <blockquote key={key}>
            {renderBlocks(block.blocks, key)}
          </blockquote>
        )
      case "list": {
        const Tag = block.ordered ? "ol" : "ul"
        const isTaskList = block.items.some((item) => item.checked !== null)
        return (
          <Tag
            key={key}
            start={block.ordered && block.start !== 1 ? block.start : undefined}
            className={isTaskList ? "contains-task-list" : undefined}
          >
            {block.items.map((item, at) => (
              <li
                key={`${key}-${at}`}
                className={
                  item.checked !== null
                    ? "task-list-item flex items-start gap-2"
                    : undefined
                }
              >
                {item.checked !== null ? (
                  <input
                    type="checkbox"
                    checked={item.checked}
                    readOnly
                    disabled
                    aria-label={item.checked ? "Done" : "Not done"}
                    className="mt-1.5 me-0 size-4 shrink-0 accent-primary"
                  />
                ) : null}
                {item.checked !== null ? (
                  <span
                    className={cn(
                      "min-w-0",
                      item.checked && "text-muted-foreground line-through"
                    )}
                  >
                    {renderBlocks(item.blocks, `${key}-${at}`, item.tight)}
                  </span>
                ) : (
                  renderBlocks(item.blocks, `${key}-${at}`, item.tight)
                )}
              </li>
            ))}
          </Tag>
        )
      }
      case "table":
        return (
          <div key={key} className="typeset-scroll">
            <table>
              <thead>
                <tr>
                  {block.head.map((cell, at) => (
                    <th
                      key={at}
                      style={{ textAlign: block.align[at] ?? undefined }}
                    >
                      {parseInline(cell, `${key}-h${at}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowAt) => (
                  <tr key={rowAt}>
                    {block.head.map((_, at) => (
                      <td
                        key={at}
                        style={{ textAlign: block.align[at] ?? undefined }}
                      >
                        {parseInline(row[at] ?? "", `${key}-${rowAt}-${at}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case "rule":
        return <hr key={key} />
    }
  })
}

type MarkdownView = "preview" | "source"

function MarkdownDisplay({
  className,
  source,
  children,
  title,
  showSource = false,
  maxHeight,
  bare,
  ...props
}: Omit<React.ComponentProps<"figure">, "title" | "children"> & {
  /** The Markdown text. `children` works too when it is a string. */
  source?: string
  children?: string
  /** A header title such as README.md. Without one (and without `showSource`) there is no frame. */
  title?: string
  /** Add a Preview / Source switch. */
  showSource?: boolean
  /** Scroll the body past this height. */
  maxHeight?: number | string
  /** Drop the border and header. Defaults to true when there is no title or switch. */
  bare?: boolean
}) {
  const text = source ?? children ?? ""
  const [view, setView] = React.useState<MarkdownView>("preview")
  const blocks = React.useMemo(() => parseBlocks(text), [text])
  const isBare = bare ?? (!title && !showSource)

  return (
    <DisplayFrame
      data-kind="markdown"
      bare={isBare}
      icon={<FileTypeIcon />}
      title={title}
      meta={title ? "Markdown" : undefined}
      actions={<DisplayCopyAction text={text} label="Copy Markdown" />}
      toolbar={
        showSource ? (
          <DisplaySwitch
            label="View"
            value={view}
            onValueChange={setView}
            options={[
              { value: "preview", label: "Preview" },
              { value: "source", label: "Source" },
            ]}
          />
        ) : undefined
      }
      className={className}
      {...props}
    >
      <div className="overflow-auto" style={{ maxHeight }}>
        {view === "source" ? (
          <pre className="m-0 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {text}
          </pre>
        ) : (
          <div
            data-slot="markdown"
            className={cn("typeset typeset-compact", !isBare && "p-5")}
          >
            {renderBlocks(blocks, "md")}
          </div>
        )}
      </div>
    </DisplayFrame>
  )
}

export { MarkdownDisplay, parseBlocks as parseMarkdown }
