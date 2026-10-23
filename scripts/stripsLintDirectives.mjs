import fs from "fs"
import path from "path"

// Runs after `shadcn build`. Source files keep their eslint directives for this
// repo's lint, but an installer whose config lacks the plugin gets "Definition
// for rule ... was not found" from each one. So the shipped content drops
// directives for rules outside the plugins every shadcn project has. A directive
// with a reason becomes a plain comment carrying the reason.
const KEPT_PLUGINS = new Set(["react-hooks", "@typescript-eslint"])

const DIRECTIVE =
  /^(\s*)(\{\/\*|\/\*|\/\/)\s*(eslint-disable-next-line|eslint-disable-line|eslint-disable|eslint-enable)\s+(.*?)(?:\s+--\s+(.*?))?\s*(\*\/\}|\*\/)?\s*$/

function pluginOf(rule) {
  if (!rule.includes("/")) {
    return null
  }

  return rule.startsWith("@") ? rule.split("/").slice(0, -1).join("/") : rule.split("/")[0]
}

function keeps(rule) {
  const plugin = pluginOf(rule)

  return plugin === null || KEPT_PLUGINS.has(plugin)
}

function stripsLine(line) {
  const match = DIRECTIVE.exec(line)

  if (!match) {
    return line
  }

  const [, indent, open, kind, ruleList, reason, close = ""] = match
  const rules = ruleList.split(",").map((rule) => rule.trim()).filter(Boolean)
  const kept = rules.filter(keeps)

  if (kept.length === rules.length) {
    return line
  }

  if (kept.length > 0) {
    const why = reason ? ` -- ${reason}` : ""
    return `${indent}${open} ${kind} ${kept.join(", ")}${why}${close ? ` ${close}` : ""}`
  }

  if (!reason || kind === "eslint-enable") {
    return null
  }

  return `${indent}${open} ${reason.charAt(0).toUpperCase()}${reason.slice(1)}${close ? ` ${close}` : ""}`
}

function stripsDirectives(content) {
  const eol = content.includes("\r\n") ? "\r\n" : "\n"

  return content
    .split(/\r?\n/)
    .map(stripsLine)
    .filter((line) => line !== null)
    .join(eol)
}

const outDir = "public/r"
let changed = 0

for (const file of fs.readdirSync(outDir).filter((name) => name.endsWith(".json"))) {
  const full = path.join(outDir, file)
  const raw = fs.readFileSync(full, "utf8")
  const item = JSON.parse(raw)

  if (!Array.isArray(item.files)) {
    continue
  }

  let touched = false

  for (const entry of item.files) {
    if (typeof entry.content !== "string") {
      continue
    }

    const next = stripsDirectives(entry.content)

    if (next !== entry.content) {
      entry.content = next
      touched = true
    }
  }

  if (touched) {
    const eol = raw.includes("\r\n") ? "\r\n" : "\n"
    const trailing = /\r?\n$/.test(raw) ? eol : ""
    fs.writeFileSync(full, JSON.stringify(item, null, 2).replace(/\n/g, eol) + trailing)
    changed += 1
  }
}

console.log(`stripped lint directives in ${changed} items`)
