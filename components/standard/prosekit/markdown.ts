import rehypeParse from "rehype-parse"
import rehypeRemark from "rehype-remark"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import remarkStringify from "remark-stringify"
import { unified } from "unified"

// ProseKit reads and writes HTML, so Markdown goes through unified on the way
// in and out. GFM keeps tables, task lists and strikethrough.
const toHtml = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify)

type MdastNode = { type: string; spread?: boolean; children?: MdastNode[] }

// Every list item comes out of the editor wrapped in <p>, which reads as a
// loose list (blank lines between items). Keep it tight unless an item really
// holds more than one paragraph.
function tighten(node: MdastNode) {
  node.children?.forEach(tighten)
  if (node.type === "listItem") {
    const blocks = node.children?.filter((child) => child.type !== "list")
    node.spread = (blocks?.length ?? 0) > 1
  } else if (node.type === "list") {
    node.spread = node.children?.some((item) => item.spread) ?? false
  }
}

function remarkTightLists() {
  return (tree: MdastNode) => tighten(tree)
}

const toMarkdown = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeRemark)
  .use(remarkGfm)
  .use(remarkTightLists)
  .use(remarkStringify, { bullet: "-", emphasis: "*", rule: "-" })

export function htmlFromMarkdown(markdown: string): string {
  return String(toHtml.processSync(markdown))
}

export function markdownFromHtml(html: string): string {
  return String(toMarkdown.processSync(html)).trimEnd()
}
